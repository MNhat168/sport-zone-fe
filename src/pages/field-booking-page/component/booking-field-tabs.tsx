import React from 'react';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BookingStep } from '@/components/enums/ENUMS';
/**
 * Enum for booking steps
 */


/**
 * Interface for step configuration
 */
interface StepConfig {
    /**
     * Step number (1-4)
     */
    step: number;
    /**
     * Display label for the step
     */
    label: string;
    /**
     * Whether to show arrow separator after this step
     * @default true
     */
    showArrow?: boolean;
}

/**
 * Props for BookingFieldTabs component
 */
interface BookingFieldTabsProps {
    /**
     * Current active step
     * @example BookingStep.BOOK_COURT
     */
    currentStep?: BookingStep;
    /**
     * Optional explicit index of the active step (1-based).
     * Use this when you have visual-only steps that don't map to BookingStep enum.
     */
    currentIndex?: number;
    /**
     * Callback when a step is clicked
     * @param step - The step that was clicked
     */
    onStepClick?: (step: BookingStep) => void;
    /**
     * Whether steps are clickable
     * @default false
     */
    allowStepNavigation?: boolean;
    /**
     * Custom step configurations
     */
    steps?: StepConfig[];
    /**
     * Additional CSS classes for container
     */
    className?: string;
}

/**
 * Default step configurations
 */
const DEFAULT_STEPS: StepConfig[] = [
    { step: 1, label: 'Chọn thời gian', showArrow: true },
    { step: 2, label: 'Chọn tiện ích', showArrow: true },
    { step: 3, label: 'Xác nhận', showArrow: true },
    { step: 4, label: 'Thông tin cá nhân', showArrow: true },
    { step: 5, label: 'Thanh toán', showArrow: false },
];

/**
 * BookingFieldTabs component - Displays booking progress steps
 * @param props - Component props
 * @returns JSX Element for booking tabs
 */
export const BookingFieldTabs: React.FC<BookingFieldTabsProps> = ({
    currentStep,
    currentIndex,
    onStepClick,
    allowStepNavigation = false,
    steps = DEFAULT_STEPS,
    className,
}) => {
    const handleStepClick = (step: BookingStep) => {
        if (allowStepNavigation && onStepClick) {
            onStepClick(step);
        }
    };

    const resolveActiveIndex = (): number => {
        if (typeof currentIndex === 'number') return currentIndex;
        // Map enum to visual index (1-based) for 5-step flow
        switch (currentStep) {
            case BookingStep.BOOK_COURT: return 1;
            case BookingStep.AMENITIES: return 2;
            case BookingStep.ORDER_CONFIRMATION: return 3;
            case BookingStep.PERSONAL_INFO: return 4;
            case BookingStep.PAYMENT: return 5;
            default: return 1;
        }
    };

    const activeIdx = resolveActiveIndex();

    const isStepCompleted = (step: number): boolean => {
        return step < activeIdx;
    };

    const isStepActive = (step: number): boolean => {
        return step === activeIdx;
    };

    return (
        <div
            className={cn(
                'w-full px-4 md:px-20 lg:px-80 pt-7 pb-4 border-b border-gray-200',
                'flex flex-col justify-start items-start',
                className
            )}
        >
            <div className="w-full flex justify-center items-center flex-wrap gap-4">
                {steps.map((stepConfig, index) => {
                    const isCompleted = isStepCompleted(stepConfig.step);
                    const isActive = isStepActive(stepConfig.step);
                    const isClickable = allowStepNavigation && (isCompleted || isActive);

                    return (
                        <React.Fragment key={`${stepConfig.step}-${index}`}>
                            <div className="relative flex flex-col justify-start items-start">
                                <button
                                    onClick={() => currentStep && handleStepClick(currentStep)}
                                    disabled={!isClickable}
                                    className={cn(
                                        'flex items-center gap-2.5 pb-3.5',
                                        'transition-all duration-200',
                                        isClickable && 'cursor-pointer hover:opacity-80',
                                        !isClickable && 'cursor-default'
                                    )}
                                    aria-label={`Step ${stepConfig.step}: ${stepConfig.label}`}
                                    aria-current={isActive ? 'step' : undefined}
                                >
                                    {/* Step Number Circle */}
                                    <div
                                        className={cn(
                                            'w-7 h-7 rounded-full flex items-center justify-center',
                                            'transition-colors duration-200',
                                            isCompleted && 'bg-emerald-500',
                                            isActive && 'bg-emerald-500',
                                            !isCompleted && !isActive && 'bg-blue-400'
                                        )}
                                    >
                                        <span className="text-white text-lg font-semibold leading-snug">
                                            {stepConfig.step}
                                        </span>
                                    </div>

                                    {/* Step Label */}
                                    <span
                                        className={cn(
                                            'text-lg font-semibold leading-snug',
                                            'transition-colors duration-200',
                                            isCompleted && 'text-emerald-600',
                                            isActive && 'text-emerald-600',
                                            !isCompleted && !isActive && 'text-blue-400'
                                        )}
                                    >
                                        {stepConfig.label}
                                    </span>
                                </button>
                            </div>

                            {/* Arrow Separator */}
                            {stepConfig.showArrow && index < steps.length - 1 && (
                                <ChevronRight
                                    className={cn(
                                        'w-4 h-4 transition-colors duration-200',
                                        isCompleted ? 'text-emerald-500' : 'text-gray-400'
                                    )}
                                    aria-hidden="true"
                                />
                            )}
                        </React.Fragment>
                    );
                })}
            </div>
        </div>
    );
};
