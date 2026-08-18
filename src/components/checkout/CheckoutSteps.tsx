import React from 'react';
import { Check, Truck, ClipboardList, CreditCard } from 'lucide-react';
import { motion } from 'motion/react';

interface CheckoutStepsProps {
  activeStep: 1 | 2 | 3;
  completedSteps: number[];
  onStepClick: (step: 1 | 2 | 3) => void;
}

const steps = [
  { id: 1 as const, title: 'Shipping & Delivery', subtitle: 'Destination & Courier', icon: Truck },
  { id: 2 as const, title: 'Ritual Review', subtitle: 'Items & Complimentary Gifts', icon: ClipboardList },
  { id: 3 as const, title: 'Secure Payment', subtitle: 'Encrypted Checkout', icon: CreditCard },
];

export function CheckoutSteps({ activeStep, completedSteps, onStepClick }: CheckoutStepsProps) {
  return (
    <div className="w-full max-w-4xl mx-auto mb-10">
      <div className="relative flex items-center justify-between">
        {/* Continuous background progress line */}
        <div className="absolute top-1/2 left-6 right-6 -translate-y-1/2 h-0.5 bg-stone-200 z-0" />
        
        {/* Animated Active Progress Line */}
        <motion.div 
          className="absolute top-1/2 left-6 -translate-y-1/2 h-0.5 bg-emerald-700 z-0"
          initial={false}
          animate={{
            width: activeStep === 1 ? '0%' : activeStep === 2 ? '50%' : '100%'
          }}
          transition={{ duration: 0.35, ease: 'easeInOut' }}
        />

        {steps.map((step) => {
          const Icon = step.icon;
          const isCompleted = completedSteps.includes(step.id);
          const isActive = activeStep === step.id;
          const isClickable = isCompleted || step.id <= activeStep;

          return (
            <button
              key={step.id}
              type="button"
              disabled={!isClickable}
              onClick={() => isClickable && onStepClick(step.id)}
              className={`relative z-10 flex flex-col items-center group focus:outline-none ${
                isClickable ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'
              }`}
            >
              <div
                className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm border-2 ${
                  isCompleted
                    ? 'bg-emerald-700 text-white border-emerald-700 group-hover:bg-emerald-800'
                    : isActive
                      ? 'bg-brand-primary text-emerald-300 border-emerald-600 ring-4 ring-emerald-900/10'
                      : 'bg-stone-50 text-stone-400 border-stone-300'
                }`}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5 stroke-[2.5]" />
                ) : (
                  <Icon className={`w-5 h-5 ${isActive ? 'text-emerald-300' : 'text-stone-400'}`} />
                )}
              </div>

              <div className="mt-2.5 text-center">
                <span
                  className={`text-xs font-semibold tracking-wide block transition-colors ${
                    isActive
                      ? 'text-stone-900 font-bold'
                      : isCompleted
                        ? 'text-emerald-800'
                        : 'text-stone-500'
                  }`}
                >
                  <span className="hidden sm:inline">0{step.id}. </span>{step.title}
                </span>
                <span className="hidden md:block text-[11px] text-stone-400 font-normal">
                  {step.subtitle}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
