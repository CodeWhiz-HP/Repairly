import React from 'react';
import { OrderStatus, ORDER_STEPS } from '@/types/types';
import { Check, Clock, Truck, Wrench, PackageCheck } from 'lucide-react';

interface OrderTrackerProps {
  status: OrderStatus;
}

export const OrderTracker: React.FC<OrderTrackerProps> = ({ status }) => {
  // Find current step index
  const currentStepIndex = ORDER_STEPS.findIndex(s => s.id === status);
  
  // Define major milestones for display to keep UI clean
  const milestones = [
    { id: 'placed', icon: Clock, label: 'Placed' },
    { id: 'picked_up', icon: Truck, label: 'Picked Up' },
    { id: 'repairing', icon: Wrench, label: 'Repairing' },
    { id: 'qa_check', icon: PackageCheck, label: 'QA Check' },
    { id: 'delivered', icon: Check, label: 'Returned' },
  ];

  const getStepState = (milestoneId: string) => {
    const milestoneIndex = ORDER_STEPS.findIndex(s => s.id === milestoneId);
    if (currentStepIndex > milestoneIndex) return 'completed';
    if (currentStepIndex === milestoneIndex) return 'active';
    // Special check for multi-step mapping (e.g. if status is 'accepted', 'placed' is completed)
    const activeMilestoneIndex = milestones.findIndex(m => m.id === milestoneId);
    const currentActualMilestoneIndex = milestones.findIndex(m => {
        const idx = ORDER_STEPS.findIndex(s => s.id === m.id);
        return currentStepIndex >= idx;
    });

    if (currentActualMilestoneIndex > activeMilestoneIndex) return 'completed';
    if (currentActualMilestoneIndex === activeMilestoneIndex) return 'active';

    return 'pending';
  };

  return (
    <div className="w-full py-6">
      <div className="relative flex items-center justify-between w-full">
        {/* Progress Bar Background */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slateSteel -z-10 rounded-full"></div>
        
        {/* Active Progress Bar */}
        <div 
          className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-cyberGreen transition-all duration-500 rounded-full shadow-[0_0_10px_rgba(74,222,128,0.5)]"
          style={{ width: `${(currentStepIndex / (ORDER_STEPS.length - 1)) * 100}%` }}
        ></div>

        {milestones.map((milestone) => {
          const state = getStepState(milestone.id);
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
              <span className={`text-xs font-medium ${state === 'active' ? 'text-electricAqua' : state === 'completed' ? 'text-cyberGreen' : 'text-slateSteel'}`}>
                {milestone.label}
              </span>
            </div>
          );
        })}
      </div>
      
      <div className="mt-4 text-center">
        <span className="text-sm text-softGray">
          Current Status: <span className="text-electricAqua font-bold font-display uppercase">{ORDER_STEPS.find(s => s.id === status)?.label}</span>
        </span>
      </div>
    </div>
  );
};

export default OrderTracker