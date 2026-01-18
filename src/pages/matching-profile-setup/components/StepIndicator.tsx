import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StepIndicatorProps {
    currentStep: number;
    totalSteps: number;
    steps: { label: string; description: string }[];
    onStepClick?: (step: number) => void;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({
    currentStep,
    totalSteps,
    steps,
    onStepClick,
}) => {
    return (
        <div className="w-full py-6">
            <div className="flex items-center justify-between">
                {steps.map((step, index) => {
                    const stepNumber = index + 1;
                    const isCompleted = stepNumber < currentStep;
                    const isCurrent = stepNumber === currentStep;
                    const isClickable = isCompleted && onStepClick;

                    return (
                        <React.Fragment key={stepNumber}>
                            <div className="flex flex-col items-center flex-1">
                                <button
                                    onClick={() => isClickable && onStepClick(stepNumber)}
                                    disabled={!isClickable}
                                    className={cn(
                                        'w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all',
                                        isCompleted && 'bg-green-500 text-white',
                                        isCurrent && 'bg-primary text-white ring-4 ring-primary/20',
                                        !isCompleted && !isCurrent && 'bg-slate-200 text-slate-500',
                                        isClickable && 'cursor-pointer hover:scale-110',
                                        !isClickable && 'cursor-default'
                                    )}
                                >
                                    {isCompleted ? <Check size={20} /> : stepNumber}
                                </button>
                                <div className="mt-2 text-center">
                                    <p
                                        className={cn(
                                            'text-xs font-medium',
                                            isCurrent && 'text-primary',
                                            isCompleted && 'text-green-600',
                                            !isCompleted && !isCurrent && 'text-slate-400'
                                        )}
                                    >
                                        {step.label}
                                    </p>
                                    <p className="text-[10px] text-slate-400 mt-0.5 hidden sm:block">
                                        {step.description}
                                    </p>
                                </div>
                            </div>
                            {stepNumber < totalSteps && (
                                <div
                                    className={cn(
                                        'h-0.5 flex-1 mx-2 transition-all',
                                        stepNumber < currentStep ? 'bg-green-500' : 'bg-slate-200'
                                    )}
                                />
                            )}
                        </React.Fragment>
                    );
                })}
            </div>
        </div>
    );
};
