import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export interface IReview extends Document {
  technicianId?: Types.ObjectId;
  customerId?: Types.ObjectId;
  orderId?: Types.ObjectId;
  rating: number;
  comment: string;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<IReview>(
  {
    technicianId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    customerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    orderId: {
      type: Schema.Types.ObjectId,
      ref: 'RepairOrder',
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const Review: Model<IReview> =
  mongoose.models.Review || mongoose.model<IReview>('Review', reviewSchema);

export default Review;