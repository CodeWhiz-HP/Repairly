export type UserRole = 'buyer' | 'seller';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
}

export interface Technician {
  id: string;
  name: string;
  businessName: string;
  rating: number; // 0-5
  reviewCount: number;
  specialties: string[]; // e.g. "iPhone", "MacBook", "Cycle"
  basePrice: number;
  hourlyRate: number;
  verified: boolean;
  warrantyDays: number;
  imageUrl: string;
  completedRepairs: number;
}

export type OrderStatus = 
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

export interface Order {
  id: string;
  buyerId: string;
  technicianId: string;
  technicianName: string; // denormalized for ease
  deviceModel: string;
  issueDescription: string;
  status: OrderStatus;
  totalPrice: number;
  createdAt: string;
  estimatedCompletionDate: string;
  repairReportUrl?: string; // Digital deliverable
}

export interface Review {
  id: string;
  technicianId: string;
  buyerName: string;
  rating: number;
  comment: string;
  date: string;
}

export const ORDER_STEPS = [
  { id: 'placed', label: 'Order Placed' },
  { id: 'accepted', label: 'Technician Accepted' },
  { id: 'picked_up', label: 'Device Picked Up' },
  { id: 'repairing', label: 'Under Repair' },
  { id: 'qa_check', label: 'Quality Check' },
  { id: 'out_for_delivery', label: 'Out for Delivery' },
  { id: 'delivered', label: 'Delivered' },
];