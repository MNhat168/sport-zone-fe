import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"

type RegistrationStep = 1 | 2 | 3 | 4 | 5

interface StepNavigationProps {
  currentStep: RegistrationStep
  submitting: boolean
  onBack: () => void
  onNext: () => void
  onSubmit: () => void
}

export function StepNavigation({
  currentStep,
  submitting,
  onBack,
  onNext,
  onSubmit,
}: StepNavigationProps) {
  return (
    <div className="flex justify-between mt-8 pt-6 border-t">
      <Button
        variant="outline"
        onClick={onBack}
        disabled={currentStep === 1}
        className="h-11 px-6 bg-transparent"
      >
        ← Quay lại
      </Button>
      {currentStep < 5 ? (
        <Button
          onClick={onNext}
          className="h-11 px-8 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary"
        >
          Tiếp theo →
        </Button>
      ) : (
        <Button
          onClick={onSubmit}
          disabled={submitting}
          className="h-11 px-8 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-600"
        >
          {submitting ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Đang gửi...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Gửi đăng ký
            </span>
          )}
        </Button>
      )}
    </div>
  )
}

