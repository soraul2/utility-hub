import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import type { DailyPlan } from '../../../types/routine';

interface WorkflowStepperProps {
      isConfirmed: boolean;
      today: DailyPlan | null;
}

const STEPS: readonly { label: string; num: number; link?: string }[] = [
      { label: '계획', num: 1 },
      { label: '확정', num: 2 },
      { label: '실행', num: 3 },
      { label: '회고', num: 4, link: '/routine/reflection' },
];

export const WorkflowStepper: React.FC<WorkflowStepperProps> = ({ isConfirmed, today }) => {
      const navigate = useNavigate();

      const allTasksDone = isConfirmed && today && today.keyTasks.length > 0 &&
            today.keyTasks.filter(t => t.startTime).every(t => t.completed);
      const currentStep = !today ? 0 : !isConfirmed ? 0 : allTasksDone ? 3 : 2;

      return (
            <>
                  {STEPS.map((step, i) => {
                        const isDone = i < currentStep;
                        const isActive = i === currentStep;
                        const StepWrapper = step.link && (isDone || isActive) ? 'button' : 'div';
                        return (
                              <React.Fragment key={step.label}>
                                    {/* Arrow connector */}
                                    {i > 0 && (
                                          <svg className="w-3 md:w-4 h-3 md:h-4 shrink-0" viewBox="0 0 16 16" fill="none">
                                                <path d="M4 3 L11 8 L4 13" className={isDone || isActive ? 'fill-indigo-400' : 'fill-gray-300 dark:fill-gray-600'} />
                                          </svg>
                                    )}
                                    {/* Step */}
                                    <StepWrapper
                                          className={`flex items-center gap-1.5 sm:gap-2 md:gap-2.5 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 md:py-2.5 rounded-xl transition-all ${
                                                isDone ? 'bg-indigo-100 dark:bg-indigo-900/30' :
                                                isActive ? 'mystic-solid shadow-lg' :
                                                'bg-gray-100 dark:bg-gray-800'
                                          } ${step.link && (isDone || isActive) ? 'cursor-pointer hover:scale-105' : ''}`}
                                          {...(step.link && (isDone || isActive) ? { onClick: () => navigate(step.link!) } : {})}
                                    >
                                          <div className={`w-6 h-6 md:w-7 md:h-7 rounded-full flex items-center justify-center text-[10px] md:text-xs font-black shrink-0 ${
                                                isDone ? 'mystic-solid text-white' :
                                                isActive ? 'bg-white text-indigo-600' :
                                                'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
                                          }`}>
                                                {isDone ? <Check className="w-3.5 h-3.5 md:w-4 md:h-4" /> : step.num}
                                          </div>
                                          <span className={`text-xs md:text-sm font-black tracking-wide hidden sm:inline ${
                                                isDone ? 'text-indigo-600 dark:text-indigo-400' :
                                                isActive ? 'text-white' :
                                                'text-gray-400 dark:text-gray-500'
                                          }`}>
                                                {step.label}
                                          </span>
                                    </StepWrapper>
                              </React.Fragment>
                        );
                  })}
            </>
      );
};
