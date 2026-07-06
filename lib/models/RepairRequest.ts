import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export type RepairRequestStatus = 'pending' | 'accepted' | 'rejected';

export interface IRepairRequest extends Document {
  customerId?: Types.ObjectId;
  technicianId?: Types.ObjectId;
  deviceModel: string;
  issueDescription: string;
  requestedDate: Date;
  estimatedBudget: number;
  status: RepairRequestStatus;
  createdAt: Date;
  updatedAt: Date;
}

const repairRequestSchema = new Schema<IRepairRequest>(
  {
    customerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required:true
    },
    technicianId: {
       type: Schema.Types.ObjectId,
       ref: "User",
       required: true,
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
    requestedDate: {
      type: Date,
      default: Date.now,
    },
    estimatedBudget: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

const RepairRequest: Model<IRepairRequest> =
  mongoose.models.RepairRequest || mongoose.model<IRepairRequest>('RepairRequest', repairRequestSchema);

export default RepairRequest;