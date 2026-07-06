"use server";

import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import RepairRequest from "@/lib/models/RepairRequest";
import RepairOrder from "@/lib/models/RepairOrder";
import Review from "@/lib/models/Review";

export async function getRepairRequests() {
  try {
    await dbConnect();

    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    const repairRequests = await RepairRequest.find({
      technicianId: session.user.id,
    })
      .populate("customerId", "name email avatar")
      .sort({ createdAt: -1 })
    return JSON.parse(JSON.stringify(repairRequests)).map((req: any) => ({
      ...req,
      id: req._id,
      customerName: req.customerId?.name || "Unknown Customer",
      customerEmail: req.customerId?.email || "",
    }));
  } catch (error) {
    console.error("Error fetching repair requests:", error);
    return [];
  }
}

export async function getRepairOrders() {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) throw new Error("Unauthorized");

    const repairOrders = await RepairOrder.find({
      technicianId: session.user.id,
    })
      .populate("customerId", "name email avatar")
      .sort({ createdAt: -1 })
      .lean();

    return JSON.parse(JSON.stringify(repairOrders)).map((order: any) => ({
      ...order,
      id: order._id,
      customerName: order.customerId?.name || "Unknown Customer",
      customerEmail: order.customerId?.email || "",
    }));
  } catch (error) {
    console.error("Error fetching orders", error);
    return [];
  }
}


export async function getDashboardStats() {
  try {
    await dbConnect();

    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    const technicianId = session.user.id;
    const techObjectId = new mongoose.Types.ObjectId(technicianId);

    const [activeRepairs, completedRepairs, revenue, reviewStats] =
      await Promise.all([
        RepairOrder.countDocuments({
          technicianId,
          status: {
            $nin: ["completed", "delivered"],
          },
        }),

        RepairOrder.countDocuments({
          technicianId,
          status: {
            $in: ["completed", "delivered"],
          },
        }),

        RepairOrder.aggregate([
          {
            $match: {
              technicianId: techObjectId,
              status: {
                $in: ["completed", "delivered"],
              },
            },
          },
          {
            $group: {
              _id: null,
              totalRevenue: {
                $sum: "$totalPrice",
              },
            },
          },
        ]),

        Review.aggregate([
          {
            $match: {
              technicianId: techObjectId,
            },
          },
          {
            $group: {
              _id: null,
              averageRating: {
                $avg: "$rating",
              },
              reviewCount: {
                $sum: 1,
              },
            },
          },
        ]),
      ]);

    const totalRevenue = revenue[0]?.totalRevenue ?? 0;
    const averageRating = reviewStats[0]?.averageRating ?? 0;
    const reviewCount = reviewStats[0]?.reviewCount ?? 0;

    const completionRate =
      activeRepairs + completedRepairs === 0
        ? 0
        : Math.round(
          (completedRepairs /
            (activeRepairs + completedRepairs)) *
          100
        );

    return {
      activeRepairs,
      completedRepairs,
      totalRevenue,
      averageRating: Number(averageRating.toFixed(1)),
      reviewCount,
      completionRate,
    };
  } catch (error) {
    console.error(error);

    return {
      activeRepairs: 0,
      completedRepairs: 0,
      totalRevenue: 0,
      averageRating: 0,
      reviewCount: 0,
      completionRate: 0,
    };
  }
}


export async function getRevenueData() {
  try {
    await dbConnect();

    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    const technicianId = session.user.id;
    const techObjectId = new mongoose.Types.ObjectId(technicianId);

    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 6);
    lastWeek.setHours(0, 0, 0, 0);

    const revenue = await RepairOrder.aggregate([
      {
        $match: {
          technicianId: techObjectId,
          status: {
            $in: ["completed", "delivered"],
          },
          createdAt: {
            $gte: lastWeek,
          },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt",
            },
          },
          revenue: {
            $sum: "$totalPrice",
          },
        },
      },
      {
        $sort: {
          _id: 1,
        },
      },
    ]);

    return revenue.map((day) => ({
      name: new Date(day._id).toLocaleDateString("en-US", {
        weekday: "short",
      }),
      revenue: day.revenue,
    }));
  } catch (error) {
    console.error(error);
    return [];
  }
}