import { motion } from 'framer-motion';
import { Check, Loader2, Circle } from 'lucide-react';

export interface Step {
  id: string;
  label: string;
  status: 'idle' | 'active' | 'completed' | 'error';
}

interface StepIndicatorProps {
  steps: Step[];
}

export default function StepIndicator({ steps }: StepIndicatorProps) {
  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between w-full relative">
        {/* Desktop Connecting Line */}
        <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-gray-800 -z-10 -translate-y-1/2" />
        
        {steps.map((step, index) => {
          const isLast = index === steps.length - 1;
          const isActive = step.status === 'active';
          const isCompleted = step.status === 'completed';
          const isError = step.status === 'error';

          return (
            <div key={step.id} className="flex md:flex-col items-center relative z-10 w-full md:w-auto mb-4 md:mb-0 group">
              {/* Mobile Connecting Line */}
              {!isLast && (
                <div className="md:hidden absolute left-[15px] top-8 bottom-[-16px] w-0.5 bg-gray-800 -z-10" />
              )}

              <div className="flex items-center md:justify-center w-full md:w-auto">
                <motion.div
                  initial={false}
                  animate={{
                    scale: isActive ? 1.2 : 1,
                    backgroundColor: isCompleted ? '#22c55e' : isError ? '#ef4444' : isActive ? '#fb7299' : '#1f2937',
                    borderColor: isCompleted ? '#22c55e' : isError ? '#ef4444' : isActive ? '#fb7299' : '#374151'
                  }}
                  className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors duration-300 relative shadow-lg
                    ${isActive ? 'ring-4 ring-[#fb7299]/20' : ''}
                  `}
                >
                  {isCompleted ? (
                    <Check size={16} className="text-white" />
                  ) : isActive ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                      <Loader2 size={16} className="text-white" />
                    </motion.div>
                  ) : (
                    <Circle size={8} className="text-gray-500 fill-current" />
                  )}
                </motion.div>

                <span className={`ml-3 md:ml-0 md:absolute md:-bottom-7 md:whitespace-nowrap text-sm font-medium transition-colors duration-300
                  ${isActive ? 'text-[#fb7299]' : isCompleted ? 'text-green-500' : isError ? 'text-red-500' : 'text-gray-500'}
                `}>
                  {step.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
