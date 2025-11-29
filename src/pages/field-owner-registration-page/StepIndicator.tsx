import { User, FileText, CreditCard, CheckCircle } from "lucide-react"

type RegistrationStep = 1 | 2 | 3 | 4

interface StepIndicatorProps {
  currentStep: RegistrationStep
}

const steps = [
  { number: 1, title: "Thông tin cá nhân", icon: User },
  { number: 2, title: "Giấy tờ pháp lý", icon: FileText },
  { number: 3, title: "Tài khoản ngân hàng", icon: CreditCard },
  { number: 4, title: "Xác nhận", icon: CheckCircle },
]

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <div className="mb-12">
      <div className="flex items-center justify-between relative">
        {/* Progress line */}
        <div className="absolute top-6 left-0 right-0 h-1 bg-gray-200 -z-10">
          <div
            className="h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-500 ease-out"
            style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
          />
        </div>

        {steps.map((step) => {
          const Icon = step.icon
          const isCompleted = currentStep > step.number
          const isCurrent = currentStep === step.number

          return (
            <div key={step.number} className="flex flex-col items-center relative">
              <div
                className={`
                  w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 
                  ${
                    isCurrent
                      ? "bg-primary text-white shadow-lg scale-110 ring-4 ring-primary/20"
                      : isCompleted
                        ? "bg-primary text-white"
                        : "bg-white border-2 border-gray-300 text-gray-400"
                  }
                `}
              >
                {isCompleted ? <CheckCircle className="w-6 h-6" /> : <Icon className="w-5 h-5" />}
              </div>
              <div className="absolute top-14 whitespace-nowrap">
                <p
                  className={`text-xs font-medium text-center transition-colors ${
                    isCurrent ? "text-primary font-semibold" : isCompleted ? "text-gray-700" : "text-gray-400"
                  }`}
                >
                  {step.title}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

