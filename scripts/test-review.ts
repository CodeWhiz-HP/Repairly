import mongoose from "mongoose";
import dotenv from "dotenv";
import dbConnect from "../lib/dbConnect";
import User from "../lib/models/User";
import RepairOrder from "../lib/models/RepairOrder";
import Review from "../lib/models/Review";

dotenv.config();

async function runTest() {
    console.log("Connecting database...");
    await dbConnect();

    try {
        // 1. Create a mock customer
        const customer = await User.create({
            name: "Test Customer",
            email: `customer-${Date.now()}@example.com`,
            password: "password123",
            role: "Customer",
            verified: true
        });
        console.log("Mock Customer created:", customer._id);

        // 2. Create a mock technician
        const technician = await User.create({
            name: "Test Technician",
            email: `tech-${Date.now()}@example.com`,
            password: "password123",
            role: "Technician",
            businessName: "Super Repair Shop",
            verified: true,
            rating: 0,
            reviewCount: 0,
            completedRepairs: 0
        });
        console.log("Mock Technician created:", technician._id);

        // 3. Create a mock order
        const order = await RepairOrder.create({
            customerId: customer._id,
            technicianId: technician._id,
            deviceModel: "iPhone 15 Pro Max",
            issueDescription: "Cracked screen glass replacement",
            status: "delivered",
            totalPrice: 150,
            estimatedCompletionDate: new Date(),
            hasReview: false
        });
        console.log("Mock RepairOrder created:", order._id);

        // Verify order initial hasReview is false
        if (order.hasReview !== false) {
            throw new Error("Initial hasReview should be false");
        }

        // 4. Simulate review creation
        const rating = 5;
        const comment = "Outstanding fast service!";

        // Create the review document
        const review = await Review.create({
            technicianId: order.technicianId,
            customerId: order.customerId,
            rating,
            comment,
            orderId: order._id,
        });
        console.log("Review document created:", review._id);

        // Mark order as reviewed
        order.hasReview = true;
        await order.save();

        // Query count and recalculate technician average rating
        const reviews = await Review.find({ technicianId: order.technicianId });
        const totalRating = reviews.reduce((acc, r) => acc + r.rating, 0);
        const count = reviews.length;

        technician.reviewCount = count;
        technician.rating = count > 0 ? parseFloat((totalRating / count).toFixed(1)) : 0;

        if (technician.completedRepairs === undefined) {
            technician.completedRepairs = 0;
        }
        technician.completedRepairs += 1;

        await technician.save();
        console.log("Technician updated successfully.");

        // 5. Verification queries
        const updatedOrder = await RepairOrder.findById(order._id);
        const updatedTechnician = await User.findById(technician._id);

        console.log("--- TEST RESULTS ---");
        console.log("Order hasReview:", updatedOrder?.hasReview);
        console.log("Technician rating:", updatedTechnician?.rating);
        console.log("Technician reviewCount:", updatedTechnician?.reviewCount);
        console.log("Technician completedRepairs:", updatedTechnician?.completedRepairs);

        // Asserts
        if (updatedOrder?.hasReview !== true) {
            throw new Error("Test failed: Order was not marked reviewed");
        }
        if (updatedTechnician?.rating !== 5) {
            throw new Error("Test failed: Technician rating is incorrect");
        }
        if (updatedTechnician?.reviewCount !== 1) {
            throw new Error("Test failed: Technician review count is incorrect");
        }
        if (updatedTechnician?.completedRepairs !== 1) {
            throw new Error("Test failed: Technician completed repairs is incorrect");
        }

        console.log("ALL DB VERIFICATION TESTS PASSED SUCCESSFULLY! ✅");

        // Clean up
        await Review.deleteOne({ _id: review._id });
        await RepairOrder.deleteOne({ _id: order._id });
        await User.deleteOne({ _id: customer._id });
        await User.deleteOne({ _id: technician._id });
        console.log("Cleaned up database test documents.");

    } catch (error) {
        console.error("Test execution failed:", error);
    } finally {
        await mongoose.disconnect();
        console.log("Disconnected from database.");
    }
}

runTest();
