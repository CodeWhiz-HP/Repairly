import { Technician, Order, Review, RepairRequest } from '@/types/types';

export const CATEGORIES = [
  { id: 'phone', label: 'Smartphones', icon: 'Smartphone' },
  { id: 'laptop', label: 'Laptops', icon: 'Laptop' },
  { id: 'tablet', label: 'Tablets', icon: 'Tablet' },
  { id: 'console', label: 'Gaming Consoles', icon: 'Gamepad2' },
  { id: 'wearable', label: 'Wearables', icon: 'Watch' },
  { id: 'appliance', label: 'Smart Home', icon: 'Cpu' },
];

export const MOCK_TECHNICIANS: Technician[] = [
  {
    key: 't1',
    name: 'Alex Chen',
    businessName: 'CyberFix Labs',
    rating: 4.9,
    reviewCount: 124,
    specialties: ['phone', 'tablet'],
    basePrice: 40,
    hourlyRate: 25,
    verified: true,
    warrantyDays: 90,
    imageUrl: 'https://picsum.photos/100/100?random=1',
    completedRepairs: 450
  },
  {
    key: 't2',
    name: 'Sarah Jones',
    businessName: 'Rapid Repair Hub',
    rating: 4.6,
    reviewCount: 89,
    specialties: ['laptop', 'console'],
    basePrice: 60,
    hourlyRate: 35,
    verified: true,
    warrantyDays: 30,
    imageUrl: 'https://picsum.photos/100/100?random=2',
    completedRepairs: 210
  },
  {
    key: 't3',
    name: 'Mike Ross',
    businessName: 'Budget Fixers',
    rating: 4.2,
    reviewCount: 340,
    specialties: ['phone', 'laptop', 'appliance'],
    basePrice: 30,
    hourlyRate: 20,
    verified: false,
    warrantyDays: 14,
    imageUrl: 'https://picsum.photos/100/100?random=3',
    completedRepairs: 1100
  },
  {
    key: 't4',
    name: 'Elena Wu',
    businessName: 'Elite Tech Care',
    rating: 5.0,
    reviewCount: 42,
    specialties: ['wearable', 'phone'],
    basePrice: 55,
    hourlyRate: 40,
    verified: true,
    warrantyDays: 180,
    imageUrl: 'https://picsum.photos/100/100?random=4',
    completedRepairs: 95
  }
];

export const MOCK_ORDERS: Order[] = [
  {
    id: 'ord-101',
    buyerId: 'b1',
    technicianId: 't1',
    technicianName: 'CyberFix Labs',
    deviceModel: 'iPhone 13 Pro',
    issueDescription: 'Cracked screen and battery drain.',
    status: 'repairing',
    totalPrice: 120,
    createdAt: '2023-10-25T10:00:00Z',
    estimatedCompletionDate: '2023-10-27T14:00:00Z',
  },
  {
    id: 'ord-102',
    buyerId: 'b1',
    technicianId: 't2',
    technicianName: 'Rapid Repair Hub',
    deviceModel: 'MacBook Air M1',
    issueDescription: 'Keyboard keys sticky.',
    status: 'delivered',
    totalPrice: 85,
    createdAt: '2023-10-20T09:30:00Z',
    estimatedCompletionDate: '2023-10-22T11:00:00Z',
    repairReportUrl: '#' // Simulated link
  }
];

export const MOCK_REVIEWS: Review[] = [
  {
    id: 'r1',
    technicianId: 't1',
    buyerName: 'John D.',
    rating: 5,
    comment: 'Super fast turnaround! My phone looks brand new.',
    date: '2023-10-15'
  },
  {
    id: 'r2',
    technicianId: 't1',
    buyerName: 'Alice M.',
    rating: 4,
    comment: 'Good work, but pickup was slightly delayed.',
    date: '2023-09-28'
  }
];

export const MOCK_REPAIR_REQUESTS: RepairRequest[] = [
  {
    id: 'req-201',
    customerName: 'Arjun Mehta',
    customerEmail: 'arjun@example.com',
    technicianId: 't1',
    deviceModel: 'iPhone 14 Pro',
    issueDescription: 'Back glass cracked after a drop. Needs screen check too.',
    requestedDate: '2026-07-03T09:15:00Z',
    estimatedBudget: 95,
    status: 'pending',
  },
  {
    id: 'req-202',
    customerName: 'Neha Sharma',
    customerEmail: 'neha@example.com',
    technicianId: 't1',
    deviceModel: 'MacBook Air M2',
    issueDescription: 'Laptop not charging consistently and fan noise is high.',
    requestedDate: '2026-07-03T11:40:00Z',
    estimatedBudget: 130,
    status: 'pending',
  },
  {
    id: 'req-203',
    customerName: 'Rahul Singh',
    customerEmail: 'rahul@example.com',
    technicianId: 't2',
    deviceModel: 'PlayStation 5',
    issueDescription: 'HDMI output keeps cutting out during gameplay.',
    requestedDate: '2026-07-02T16:20:00Z',
    estimatedBudget: 80,
    status: 'accepted',
  },
  {
    id: 'req-204',
    customerName: 'Pooja Verma',
    customerEmail: 'pooja@example.com',
    technicianId: 't3',
    deviceModel: 'Samsung Galaxy S23',
    issueDescription: 'Water exposure. Phone powers on intermittently.',
    requestedDate: '2026-07-02T18:05:00Z',
    estimatedBudget: 60,
    status: 'rejected',
  },
];