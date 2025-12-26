import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"
import { Loading } from "@/components/ui/loading"

type RegistrationStep = 1 | 2 | 3 | 4

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
      {currentStep < 4 ? (
        <Button
          onClick={onNext}
          variant="default"
          className="h-11 px-8 bg-emerald-600 hover:bg-emerald-500"
        >
          Tiếp theo →
        </Button>
      ) : (
        <Button
          onClick={onSubmit}
          disabled={submitting}
          className="h-11 px-8 bg-emerald-600 hover:bg-emerald-500"
        >
          {submitting ? (
            <span className="flex items-center gap-2">
              <Loading size={16} className="border-white" />
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

