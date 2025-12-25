import { Check } from "lucide-react";
import { CombinedBookingStep } from "@/components/enums/ENUMS";

interface StepperProps {
    currentStep: CombinedBookingStep;
}

const steps = [
    { key: CombinedBookingStep.FIELD_LIST, label: "Danh sách", number: 1 },
    { key: CombinedBookingStep.FIELD_BOOK_COURT, label: "Chọn sân", number: 2 },
    { key: CombinedBookingStep.FIELD_AMENITIES, label: "Tiện ích", number: 3 },
    { key: CombinedBookingStep.FIELD_CONFIRM, label: "Xác nhận", number: 4 },
    { key: CombinedBookingStep.COACH_SELECT, label: "Chọn HLV", number: 5 },
    { key: CombinedBookingStep.COMBINED_CONFIRM, label: "Xác nhận", number: 6 },
    { key: CombinedBookingStep.PERSONAL_INFO, label: "Gửi đơn", number: 7 },
];

export const FieldCoachBookingStepper = ({ currentStep }: StepperProps) => {
    const getCurrentStepNumber = () => {
        const step = steps.find(s => s.key === currentStep);
        return step?.number || 1;
    };

    const currentStepNumber = getCurrentStepNumber();

    return (
        <div className="w-full max-w-[1320px] mx-auto px-3 py-6">
            <div className="relative">
                {/* Progress bar background */}
                <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200" style={{ zIndex: 0 }}></div>

                {/* Progress bar fill */}
                <div
                    className="absolute top-5 left-0 h-1 bg-emerald-600 transition-all duration-500"
                    style={{
                        width: `${((currentStepNumber - 1) / (steps.length - 1)) * 100}%`,
                        zIndex: 0
                    }}
                ></div>

                {/* Steps */}
                <div className="relative flex justify-between" style={{ zIndex: 1 }}>
                    {steps.map((step) => {
                        const isCompleted = step.number < currentStepNumber;
                        const isCurrent = step.number === currentStepNumber;
                        const isUpcoming = step.number > currentStepNumber;

                        return (
                            <div key={step.key} className="flex flex-col items-center">
                                {/* Circle */}
                                <div
                                    className={`
                                        w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm
                                        transition-all duration-300 border-2
                                        ${isCompleted ? 'border-emerald-600 bg-emerald-600 text-white' : ''}
                                        ${isCurrent ? 'border-emerald-600 bg-white text-emerald-600 scale-110 shadow-lg' : ''}
                                        ${isUpcoming ? 'border-gray-300 bg-white text-gray-400' : ''}
                                    `}
                                >
                                    {isCompleted ? <Check className="w-5 h-5" /> : step.number}
                                </div>

                                {/* Label */}
                                <div className="mt-2 text-center">
                                    <p
                                        className={`
                                            text-xs font-medium whitespace-nowrap
                                            ${isCurrent ? 'text-emerald-600' : ''}
                                            ${isCompleted ? 'text-emerald-600' : ''}
                                            ${isUpcoming ? 'text-gray-400' : ''}
                                        `}
                                    >
                                        {step.label}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
