import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'Customer' | 'Technician';
  businessName?: string | null;
  avatar?: string;
  specialties: [string];
  verified: boolean;
  basePrice?: number;
  hourlyRate?: number;
  warrantyDays?: number;
  rating?: number;
  reviewCount?: number;
  completedRepairs?: number;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Invalid email format'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 8,
    },
    role: {
      type: String,
      enum: ['Customer', 'Technician'],
      required: [true, 'Role is required'],
    },
    businessName: {
      type: String,
      default: null,
    },
    specialties: {
      type: [String],
      default: [],
    },
    verified: {
      type: Boolean,
      default: true,
    },
    avatar: {
      type: String,
      default: null,
    },
    basePrice: {
      type: Number,
      default: 40,
    },
    hourlyRate: {
      type: Number,
      default: 25,
    },
    warrantyDays: {
      type: Number,
      default: 30,
    },
    rating: {
      type: Number,
      default: 4.5,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    completedRepairs: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', userSchema);

export default User;
