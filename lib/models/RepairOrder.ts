import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export type RepairOrderStatus =
  | 'placed'
  | 'accepted'
  | 'pickup_scheduled'
  | 'picked_up'
  | 'repairing'
  | 'qa_check'
  | 'ready_return'
  | 'out_for_delivery'
  | 'delivered'
  | 'completed';

export interface IRepairOrder extends Document {
  customerId?: Types.ObjectId;
  technicianId?: Types.ObjectId;
  deviceModel: string;
  issueDescription: string;
  status: RepairOrderStatus;
  totalPrice: number;
  createdAt: Date;
  estimatedCompletionDate: Date;
  repairReportUrl?: string;
  hasReview?: boolean;
  createdAtTimestamp?: Date;
  updatedAt: Date;
}

const repairOrderSchema = new Schema<IRepairOrder>(
  {
    customerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    technicianId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    deviceModel: {
      type: String,
      required: true,
      trim: true,
    },
    issueDescription: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['placed', 'accepted', 'pickup_scheduled', 'picked_up', 'repairing', 'qa_check', 'ready_return', 'out_for_delivery', 'delivered', 'completed'],
      default: 'placed',
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    estimatedCompletionDate: {
      type: Date,
      required: true,
    },
    repairReportUrl: {
      type: String,
      default: null,
    },
    hasReview: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const RepairOrder: Model<IRepairOrder> =
  mongoose.models.RepairOrder || mongoose.model<IRepairOrder>('RepairOrder', repairOrderSchema);

export default RepairOrder;