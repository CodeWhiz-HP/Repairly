"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";

import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import Review from "@/lib/models/Review";
import RepairOrder from "@/lib/models/RepairOrder";
import User from "@/lib/models/User";

export async function submitReview({
    orderId,
    rating,
    comment,
}: {
    orderId: string;
    rating: number;
    comment: string;
}) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return { success: false, message: "Unauthorized." };
        }

        // 1. Fetch the order
        const order = await RepairOrder.findById(orderId);
        if (!order) {
            return { success: false, message: "Repair order not found." };
        }

        // Check authorization: must be the customer who placed the order
        if (order.customerId?.toString() !== session.user.id) {
            return { success: false, message: "Unauthorized to review this order." };
        }

        // Prevent duplicate reviews
        if (order.hasReview) {
            return { success: false, message: "Review already submitted for this order." };
        }

        // 2. Create the review
        const review = await Review.create({
            technicianId: order.technicianId,
            customerId: order.customerId,
            rating,
            comment,
            orderId: order._id,
        });

        // 3. Mark order as reviewed
        order.hasReview = true;
        await order.save();

        // 4. Update Technician aggregates: rating, reviewCount, completedRepairs
        const technician = await User.findById(order.technicianId);
        if (technician) {
            // Find all reviews for this technician to recalculate average rating
            const reviews = await Review.find({ technicianId: order.technicianId });
            const totalRating = reviews.reduce((acc, r) => acc + r.rating, 0);
            const count = reviews.length;

            technician.reviewCount = count;
            technician.rating = count > 0 ? parseFloat((totalRating / count).toFixed(1)) : 0;

            // Increment completed repairs if we want
            if (technician.completedRepairs === undefined) {
                technician.completedRepairs = 0;
            }
            technician.completedRepairs += 1;

            await technician.save();
        }

        revalidatePath("/my-repairs");
        revalidatePath("/seller-dashboard");
        revalidatePath("/Browse/All");

        return {
            success: true,
            message: "Review submitted successfully!",
            review: JSON.parse(JSON.stringify(review)),
        };
    } catch (error: any) {
        console.error("Error submitting review:", error);
        return { success: false, message: error.message || "Failed to submit review" };
    }
}
