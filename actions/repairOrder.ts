"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";

import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import RepairOrder from "@/lib/models/RepairOrder";
import User from "@/lib/models/User";
import { sendEmail } from "@/lib/mailer";

export async function updateOrderStatus(orderId: string, newStatus: string) {
    try {
        await dbConnect();

        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            throw new Error("Unauthorized");
        }

        const repairOrder = await RepairOrder.findOne({
            _id: orderId,
            technicianId: session.user.id,
        });

        if (!repairOrder) {
            return {
                success: false,
                message: "Repair order not found.",
            };
        }

        repairOrder.status = newStatus as any;
        await repairOrder.save();

        revalidatePath("/seller-dashboard");

        return {
            success: true,
            message: "Order status updated successfully.",
            order: {
                ...JSON.parse(JSON.stringify(repairOrder)),
                id: repairOrder._id.toString(),
            },
        };
    } catch (error) {
        console.error("Error updating order status:", error);

        return {
            success: false,
            message: "Something went wrong.",
        };
    }
}

export async function updateOrderEstimatedCompletionDate(orderId: string, dateStr: string) {
    try {
        await dbConnect();

        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            throw new Error("Unauthorized");
        }

        const repairOrder = await RepairOrder.findOne({
            _id: orderId,
            technicianId: session.user.id,
        });

        if (!repairOrder) {
            return {
                success: false,
                message: "Repair order not found.",
            };
        }

        repairOrder.estimatedCompletionDate = new Date(dateStr);
        await repairOrder.save();

        revalidatePath("/seller-dashboard");
        revalidatePath("/my-repairs");

        return {
            success: true,
            message: "Estimated completion date updated successfully.",
            order: {
                ...JSON.parse(JSON.stringify(repairOrder)),
                id: repairOrder._id.toString(),
            },
        };
    } catch (error) {
        console.error("Error updating estimated completion date:", error);

        return {
            success: false,
            message: "Something went wrong.",
        };
    }
}

export async function cancelRepairOrder(orderId: string) {
    try {
        await dbConnect();

        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            throw new Error("Unauthorized");
        }

        const repairOrder = await RepairOrder.findById(orderId);

        if (!repairOrder) {
            return {
                success: false,
                message: "Repair order not found.",
            };
        }

        // Verify authorization: current user must be customer or technician
        const isCustomer = repairOrder.customerId?.toString() === session.user.id;
        const isTechnician = repairOrder.technicianId?.toString() === session.user.id;

        if (!isCustomer && !isTechnician) {
            return {
                success: false,
                message: "Unauthorized to cancel this order.",
            };
        }

        // Check if status is before picked_up
        const cancellableStates = ['placed', 'accepted', 'pickup_scheduled'];
        if (!cancellableStates.includes(repairOrder.status)) {
            return {
                success: false,
                message: "Cannot cancel order after it has been picked up.",
            };
        }

        // Send email notifications to the counterpart before deleting
        try {
            const customer = await User.findById(repairOrder.customerId);
            const technician = await User.findById(repairOrder.technicianId);

            const cancellerName = isCustomer ? (customer?.name || "Customer") : (technician?.businessName || technician?.name || "Technician");
            const recipientEmail = isCustomer ? technician?.email : customer?.email;
            const recipientName = isCustomer ? (technician?.name || "Technician") : (customer?.name || "Customer");

            if (recipientEmail) {
                await sendEmail({
                    to: recipientEmail,
                    subject: `Repair Order Cancelled - ${repairOrder.deviceModel}`,
                    text: `Hello ${recipientName},\n\nWe would like to inform you that the repair order for device "${repairOrder.deviceModel}" has been cancelled by ${cancellerName}.\n\nBest regards,\nRepairly Team`,
                });
            }
        } catch (mailErr) {
            console.error("Failed to send cancellation email:", mailErr);
        }

        await repairOrder.deleteOne();

        revalidatePath("/seller-dashboard");
        revalidatePath("/my-repairs");

        return {
            success: true,
            message: "Order cancelled successfully.",
        };
    } catch (error) {
        console.error("Error cancelling order:", error);

        return {
            success: false,
            message: "Something went wrong.",
        };
    }
}