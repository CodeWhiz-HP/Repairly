"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";

import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import RepairRequest from "@/lib/models/RepairRequest";
import RepairOrder from "@/lib/models/RepairOrder";

import User from "@/lib/models/User";
import { MOCK_TECHNICIANS } from "@/lib/constants";
import bcrypt from "bcryptjs";
import { sendEmail } from "@/lib/mailer";

export async function acceptRepairRequest(
  id: string,
  proposedPrice?: number,
  estimatedCompletionDate?: string
) {
  try {
    await dbConnect();

    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    const repairRequest = await RepairRequest.findOne({
      _id: id,
      technicianId: session.user.id,
    });

    if (!repairRequest) {
      return {
        success: false,
        message: "Repair request not found.",
      };
    }

    const finalPrice = typeof proposedPrice === "number" && proposedPrice >= 0
      ? proposedPrice
      : repairRequest.estimatedBudget;

    const newOrder = await RepairOrder.create({
      customerId: repairRequest.customerId,
      technicianId: repairRequest.technicianId,
      deviceModel: repairRequest.deviceModel,
      issueDescription: repairRequest.issueDescription,
      status: "accepted",
      totalPrice: finalPrice,
      estimatedCompletionDate: estimatedCompletionDate
        ? new Date(estimatedCompletionDate)
        : new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    });

    try {
      const customer = await User.findById(repairRequest.customerId);
      if (customer && customer.email) {
        await sendEmail({
          to: customer.email,
          subject: `Your Repair Request Has Been Accepted`,
          text: `Hello ${customer.name || "Customer"},\n\nWe are pleased to inform you that your repair request for "${repairRequest.deviceModel}" has been accepted.\n\nEstimated Completion: ${newOrder.estimatedCompletionDate.toLocaleDateString()}\nAgreed Price: $${finalPrice}\n\nYou can track the progress of your repair directly on your "My Repairs" dashboard.\n\nBest regards,\nRepairly Team`,
        });
      }
    } catch (mailErr) {
      console.error("Failed to send acceptance email:", mailErr);
    }

    await repairRequest.deleteOne();

    revalidatePath("/seller-dashboard");
    revalidatePath("/my-repairs");

    return {
      success: true,
      message: "Repair request accepted.",
      order: {
        ...JSON.parse(JSON.stringify(newOrder)),
        id: newOrder._id.toString(),
      },
    };
  } catch (error) {
    console.error(error);

    return {
      success: false,
      message: "Something went wrong.",
    };
  }
}

export async function rejectRepairRequest(id: string) {
  try {
    await dbConnect();

    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    const deletedRequest = await RepairRequest.findOne({
      _id: id,
      technicianId: session.user.id,
    });

    if (!deletedRequest) {
      return {
        success: false,
        message: "Repair request not found.",
      };
    }

    try {
      const customer = await User.findById(deletedRequest.customerId);
      if (customer && customer.email) {
        await sendEmail({
          to: customer.email,
          subject: `Update on Your Repair Request`,
          text: `Hello ${customer.name || "Customer"},\n\nWe are writing to let you know that your repair request for "${deletedRequest.deviceModel}" was rejected by the technician.\n\nFeel free to explore other service providers on our platform to get your device repaired.\n\nBest regards,\nRepairly Team`,
        });
      }
    } catch (mailErr) {
      console.error("Failed to send rejection email:", mailErr);
    }

    await deletedRequest.deleteOne();

    revalidatePath("/seller-dashboard");
    revalidatePath("/my-repairs");

    return {
      success: true,
      message: "Repair request rejected.",
    };
  } catch (error) {
    console.error(error);

    return {
      success: false,
      message: "Something went wrong.",
    };
  }
}

export async function getTechnicians() {
  try {
    await dbConnect();

    // Seed dummy technicians if not present
    const count = await User.countDocuments({ role: "Technician" });
    if (count === 0) {
      console.log("Seeding mock technicians...");
      for (const tech of MOCK_TECHNICIANS) {
        const hashedPassword = await bcrypt.hash("password123", 10);
        await User.create({
          name: tech.name,
          email: `${tech.key}@repairly.com`,
          password: hashedPassword,
          role: "Technician",
          businessName: tech.businessName,
          specialties: tech.specialties,
          verified: tech.verified,
          basePrice: tech.basePrice,
          hourlyRate: tech.hourlyRate,
          warrantyDays: tech.warrantyDays,
          rating: tech.rating,
          reviewCount: tech.reviewCount,
          completedRepairs: tech.completedRepairs,
          avatar: tech.imageUrl,
        });
      }
    }

    const technicians = await User.find({ role: "Technician" }).lean();
    return JSON.parse(JSON.stringify(technicians)).map((tech: any) => ({
      ...tech,
      id: tech._id,
      key: tech._id,
    }));
  } catch (error) {
    console.error("Error fetching technicians:", error);
    return [];
  }
}

export async function getTechnicianById(id: string) {
  try {
    await dbConnect();

    // Make sure we have technicians seeded if db is empty
    await getTechnicians();

    // Check if ID is regular Mongo ObjectId
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(id);
    let tech = null;

    if (isValidObjectId) {
      tech = await User.findOne({ _id: id }).lean();
    } else {
      // Find matching mock tech from standard mock definitions to database record mapping
      const mock = MOCK_TECHNICIANS.find(t => t.key === id);
      if (mock) {
        tech = await User.findOne({ businessName: mock.businessName }).lean();
      }
    }

    if (!tech) {
      tech = await User.findOne({ role: "Technician" }).lean();
    }

    if (!tech) return null;

    return {
      ...JSON.parse(JSON.stringify(tech)),
      id: tech._id.toString(),
      key: tech._id.toString(),
    };
  } catch (error) {
    console.error("Error fetching technician by id:", error);
    return null;
  }
}

export async function createRepairRequest(data: {
  technicianId: string;
  deviceModel: string;
  issueDescription: string;
  estimatedBudget: number;
}) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized" };
    }

    let targetTechnicianId = data.technicianId;
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(data.technicianId);
    if (!isValidObjectId) {
      const mock = MOCK_TECHNICIANS.find(t => t.key === data.technicianId);
      if (mock) {
        const dbTech = await User.findOne({ businessName: mock.businessName });
        if (dbTech) {
          targetTechnicianId = dbTech._id.toString();
        }
      }
    }

    const newRequest = await RepairRequest.create({
      customerId: session.user.id,
      technicianId: targetTechnicianId,
      deviceModel: data.deviceModel,
      issueDescription: data.issueDescription,
      estimatedBudget: data.estimatedBudget,
      status: "pending",
      requestedDate: new Date(),
    });

    try {
      const technician = await User.findById(targetTechnicianId);
      if (technician && technician.email) {
        await sendEmail({
          to: technician.email,
          subject: "New Repair Request Assigned to You",
          text: `Hello ${technician.name || "Technician"},\n\nYou have received a new repair request for a "${data.deviceModel}" device.\n\nIssue details:\n${data.issueDescription}\n\nKindly review and respond (accept/reject) to this request on your Seller Dashboard.\n\nBest regards,\nRepairly Team`,
        });
      }
    } catch (mailErr) {
      console.error("Failed to send technician request email:", mailErr);
    }

    revalidatePath("/seller-dashboard");
    revalidatePath("/my-repairs");

    return {
      success: true,
      message: "Repair request submitted successfully!",
      request: JSON.parse(JSON.stringify(newRequest)),
    };
  } catch (error: any) {
    console.error("Error creating repair request:", error);
    return { success: false, message: error.message || "Failed to create repair request" };
  }
}

export async function getCustomerRepairs() {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized", requests: [], orders: [] };
    }

    const requests = await RepairRequest.find({ customerId: session.user.id })
      .populate("technicianId", "name businessName")
      .sort({ createdAt: -1 })
      .lean();

    const orders = await RepairOrder.find({ customerId: session.user.id })
      .populate("technicianId", "name businessName")
      .sort({ createdAt: -1 })
      .lean();

    const mappedRequests = JSON.parse(JSON.stringify(requests)).map((req: any) => ({
      ...req,
      id: req._id,
      technicianName: req.technicianId?.businessName || req.technicianId?.name || "Technician",
    }));

    const mappedOrders = JSON.parse(JSON.stringify(orders)).map((order: any) => ({
      ...order,
      id: order._id,
      technicianName: order.technicianId?.businessName || order.technicianId?.name || "Technician",
    }));

    return {
      success: true,
      requests: mappedRequests,
      orders: mappedOrders,
    };
  } catch (error) {
    console.error("Error fetching customer repairs:", error);
    return { success: false, message: "Failed to fetch repairs", requests: [], orders: [] };
  }
}

export async function getUserProfile() {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized" };
    }

    const user = await User.findById(session.user.id).lean();
    if (!user) {
      return { success: false, message: "User not found" };
    }

    return {
      success: true,
      profile: JSON.parse(JSON.stringify(user)),
    };
  } catch (error: any) {
    console.error("Error fetching user profile:", error);
    return { success: false, message: error.message || "Failed to fetch profile" };
  }
}

export async function updateUserProfile(updates: {
  businessName?: string;
  specialties?: string[];
  name?: string;
  avatar?: string;
}) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized" };
    }

    const user = await User.findById(session.user.id);
    if (!user) {
      return { success: false, message: "User not found" };
    }

    if (updates.name !== undefined) {
      user.name = updates.name;
    }
    if (updates.businessName !== undefined) {
      user.businessName = updates.businessName;
    }
    if (updates.specialties !== undefined) {
      user.specialties = updates.specialties as [string];
    }
    if (updates.avatar !== undefined) {
      user.avatar = updates.avatar;
    }

    await user.save();
    revalidatePath("/my-profile");

    return {
      success: true,
      message: "Profile updated successfully!",
      profile: JSON.parse(JSON.stringify(user)),
    };
  } catch (error: any) {
    console.error("Error updating user profile:", error);
    return { success: false, message: error.message || "Failed to update profile" };
  }
}

export async function cancelRepairRequest(id: string) {
  try {
    await dbConnect();

    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    const request = await RepairRequest.findOne({
      _id: id,
      customerId: session.user.id,
    });

    if (!request) {
      return {
        success: false,
        message: "Repair request not found or unauthorized.",
      };
    }

    await request.deleteOne();

    revalidatePath("/seller-dashboard");
    revalidatePath("/my-repairs");

    return {
      success: true,
      message: "Repair request cancelled successfully.",
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Something went wrong.",
    };
  }
}