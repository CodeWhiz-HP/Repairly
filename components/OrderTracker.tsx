import React from 'react';
import { Check, Clock, Truck, Wrench, PackageCheck } from 'lucide-react';

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

interface OrderTrackerProps {
  status: string;
}

export const OrderTracker: React.FC<OrderTrackerProps> = ({ status }) => {
  // Define all possible database status in chronological workflow order
  const allStatuses: RepairOrderStatus[] = [
    'placed',
    'accepted',
    'pickup_scheduled',
    'picked_up',
    'repairing',
    'qa_check',
    'ready_return',
    'out_for_delivery',
    'delivered',
    'completed'
  ];

  // Map each status to user-friendly display labels
  const statusLabels: Record<string, string> = {
    placed: 'Order Placed',
    accepted: 'Accepted Request',
    pickup_scheduled: 'Pickup Scheduled',
    picked_up: 'Device Picked Up',
    repairing: 'Under Repair',
    qa_check: 'Quality Check & Testing',
    ready_return: 'Ready for Return',
    out_for_delivery: 'Out for Delivery',
    delivered: 'Delivered',
    completed: 'Order Completed'
  };

  const currentStepIndex = allStatuses.indexOf(status as RepairOrderStatus);
  const activeStepIndex = currentStepIndex !== -1 ? currentStepIndex : 0;

  // Compute overall progress percentage (0% to 100%)
  const progressPercent = (activeStepIndex / (allStatuses.length - 1)) * 100;

  // Define major UI milestones
  const milestones = [
    { id: 'placed', icon: Clock, label: 'Placed', indexInAll: 0 },
    { id: 'picked_up', icon: Truck, label: 'Picked Up', indexInAll: 3 },
    { id: 'repairing', icon: Wrench, label: 'Repairing', indexInAll: 4 },
    { id: 'qa_check', icon: PackageCheck, label: 'QA Check', indexInAll: 5 },
    { id: 'delivered', icon: Check, label: 'Returned', indexInAll: 8 },
  ];

  const getStepState = (milestoneIndexInAll: number) => {
    if (activeStepIndex > milestoneIndexInAll) return 'completed';
    if (activeStepIndex === milestoneIndexInAll) return 'active';

    // Find the next milestone index in milestones array
    const nextMilestone = milestones.find(m => m.indexInAll >= activeStepIndex);
    if (nextMilestone && nextMilestone.indexInAll === milestoneIndexInAll) {
      return 'active';
    }

    return 'pending';
  };

  return (
    <div className="w-full py-6">
      <div className="relative flex items-center justify-between w-full font-sans">
        {/* Progress Bar Background */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slateSteel -z-10 rounded-full"></div>

        {/* Active Progress Bar */}
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-cyberGreen transition-all duration-500 rounded-full shadow-[0_0_10px_rgba(74,222,128,0.5)]"
          style={{ width: `${progressPercent}%` }}
        ></div>

        {milestones.map((milestone) => {
          const state = getStepState(milestone.indexInAll);
          const Icon = milestone.icon;

          return (
            <div key={milestone.id} className="flex flex-col items-center gap-2 bg-deepCarbon px-2">
              <div
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300
                  ${state === 'completed' ? 'bg-cyberGreen border-cyberGreen text-deepCarbon' : ''}
                  ${state === 'active' ? 'bg-deepCarbon border-electricAqua text-electricAqua shadow-[0_0_15px_rgba(38,255,242,0.4)] animate-pulse' : ''}
                  ${state === 'pending' ? 'bg-deepCarbon border-slateSteel text-slateSteel' : ''}
                `}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className={`text-[10px] sm:text-xs font-medium ${state === 'active' ? 'text-electricAqua' : state === 'completed' ? 'text-cyberGreen' : 'text-slateSteel'}`}>
                {milestone.label}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-6 text-center">
        <span className="text-sm text-softGray">
          Current Status: <span className="text-electricAqua font-bold font-display uppercase">{statusLabels[status] || status.replaceAll('_', ' ')}</span>
        </span>
      </div>
    </div>
  );
};

export default OrderTracker;