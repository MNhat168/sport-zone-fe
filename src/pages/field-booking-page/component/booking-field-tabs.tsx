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
    step: BookingStep;
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
    currentStep: BookingStep;
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
    { step: BookingStep.BOOK_COURT, label: 'Book a Court', showArrow: true },
    { step: BookingStep.ORDER_CONFIRMATION, label: 'Order Confirmation', showArrow: true },
    { step: BookingStep.PERSONAL_INFO, label: 'Personal Information', showArrow: true },
    { step: BookingStep.PAYMENT, label: 'Payment', showArrow: false },
];

/**
 * BookingFieldTabs component - Displays booking progress steps
 * @param props - Component props
 * @returns JSX Element for booking tabs
 */
export const BookingFieldTabs: React.FC<BookingFieldTabsProps> = ({
    currentStep,
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

    const isStepCompleted = (step: BookingStep): boolean => {
        return step < currentStep;
    };

    const isStepActive = (step: BookingStep): boolean => {
        return step === currentStep;
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
                        <React.Fragment key={stepConfig.step}>
                            <div className="relative flex flex-col justify-start items-start">
                                <button
                                    onClick={() => handleStepClick(stepConfig.step)}
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
                                        <span className="text-white text-lg font-semibold font-['Outfit'] leading-snug">
                                            {stepConfig.step}
                                        </span>
                                    </div>

                                    {/* Step Label */}
                                    <span
                                        className={cn(
                                            'text-lg font-semibold font-["Outfit"] leading-snug',
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

/**
 * Example usage component
 */
/*
export const BookingFieldTabsExample: React.FC = () => {
    const [currentStep, setCurrentStep] = React.useState<BookingStep>(BookingStep.BOOK_COURT);

    const handleStepClick = (step: BookingStep) => {
        console.log('Step clicked:', step);
        setCurrentStep(step);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <BookingFieldTabs
                currentStep={currentStep}
                onStepClick={handleStepClick}
                allowStepNavigation={true}
            />

            <div className="container mx-auto px-4 py-8">
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-2xl font-bold mb-4">
                        Current Step: {BookingStep[currentStep]}
                    </h2>
                    <p className="text-gray-600 mb-4">
                        Click on the steps above to navigate (when allowStepNavigation is enabled)
                    </p>

                    <div className="flex gap-4">
                        <button
                            onClick={() => setCurrentStep(Math.max(1, currentStep - 1) as BookingStep)}
                            disabled={currentStep === BookingStep.BOOK_COURT}
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => setCurrentStep(Math.min(4, currentStep + 1) as BookingStep)}
                            disabled={currentStep === BookingStep.PAYMENT}
                            className="px-4 py-2 bg-emerald-500 text-white rounded hover:bg-emerald-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookingFieldTabs; */