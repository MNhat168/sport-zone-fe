import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Shield, Loader2, CheckCircle2, XCircle } from "lucide-react"
import { createEkycSession } from "@/features/field-owner-registration/registrationAPI"
import { useEkycPolling } from "@/hooks/useEkycPolling"
import { CustomFailedToast, CustomSuccessToast } from "@/components/toast/notificiation-toast"
import type { CreateRegistrationRequestPayload } from "@/features/field-owner-registration"

interface PersonalInfoStepProps {
  formData: Partial<CreateRegistrationRequestPayload>
  onFormDataChange: (data: Partial<CreateRegistrationRequestPayload>) => void
}

export function PersonalInfoStep({ formData, onFormDataChange }: PersonalInfoStepProps) {
  const [isCreatingSession, setIsCreatingSession] = useState(false)
  const { status, data, error, startPolling } = useEkycPolling()

  const isEkycVerified = status === "verified"
  const isEkycPending = status === "polling"

  // Auto-fill form when eKYC verified
  useEffect(() => {
    if (status === "verified" && data) {
      onFormDataChange({
        ...formData,
        ekycSessionId: formData.ekycSessionId,
        ekycData: {
          fullName: data.fullName,
          idNumber: data.idNumber,
          address: data.address,
        },
        personalInfo: {
          fullName: data.fullName,
          idNumber: data.idNumber,
          address: data.address,
        },
      })
      CustomSuccessToast("Xác thực danh tính thành công! Thông tin đã được tự động điền.")
    } else if (status === "failed" || status === "timeout") {
      if (error) {
        CustomFailedToast(error)
      } else {
        CustomFailedToast("Xác thực thất bại, vui lòng thử lại.")
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, data, error])

  const handleStartEkyc = async () => {
    try {
      setIsCreatingSession(true)

      const { sessionId, redirectUrl } = await createEkycSession()

      onFormDataChange({
        ...formData,
        ekycSessionId: sessionId,
      })

      const popup = window.open(
        redirectUrl,
        "didit-ekyc",
        "width=600,height=800,scrollbars=yes",
      )

      if (!popup) {
        CustomFailedToast("Vui lòng cho phép popup để tiếp tục xác thực.")
        return
      }

      startPolling(sessionId)

      const checkPopupClosed = window.setInterval(() => {
        if (popup.closed) {
          window.clearInterval(checkPopupClosed)
          if (status === "polling") {
            CustomFailedToast("Cửa sổ xác thực đã đóng. Vui lòng hoàn thành xác thực.")
          }
        }
      }, 1000)
    } catch (err: any) {
      console.error("Create eKYC session error:", err)
      CustomFailedToast(err?.response?.data?.message || err?.message || "Không thể khởi tạo xác thực. Vui lòng thử lại.")
    } finally {
      setIsCreatingSession(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <div className="flex items-start gap-3">
          <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
          <div className="flex-1 space-y-3">
          <div>
              <p className="text-sm font-semibold text-blue-900">
                Xác thực danh tính bằng didit eKYC
            </p>
              <p className="text-xs text-blue-700 mt-1">
                Để đăng ký làm chủ sân, bạn cần xác thực danh tính qua hệ thống eKYC của didit.
                Quá trình chỉ mất khoảng 2-3 phút.
            </p>
          </div>

            {!isEkycVerified && !isEkycPending && (
              <Button
            type="button"
                onClick={handleStartEkyc}
                disabled={isCreatingSession}
                className="bg-blue-600 hover:bg-blue-700 text-xs sm:text-sm"
              >
                {isCreatingSession ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang khởi tạo...
                  </>
                ) : (
                  <>
                    <Shield className="mr-2 h-4 w-4" />
            Xác thực ngay
                  </>
                )}
              </Button>
            )}

            {isEkycPending && (
              <div className="flex items-center gap-2 text-blue-600">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-xs sm:text-sm font-medium">
                  Đang chờ xác thực... Vui lòng hoàn thành trên cửa sổ didit.
                </span>
              </div>
            )}

            {isEkycVerified && (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle2 className="h-4 w-4" />
                <span className="text-xs sm:text-sm font-medium">
                  Xác thực thành công! Thông tin đã được tự động điền.
                </span>
              </div>
            )}

            {(status === "failed" || status === "timeout") && (
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-red-600">
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4" />
                  <span className="text-xs sm:text-sm font-medium">
                    {error || "Xác thực thất bại, vui lòng thử lại."}
                  </span>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleStartEkyc}
                  className="border-red-300 text-red-600 hover:bg-red-50"
                >
                  Thử lại
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-2">
          <Label className="text-sm font-medium">
            Họ tên đầy đủ
          </Label>
        <Input
          className="h-11"
          value={formData.personalInfo?.fullName || ""}
          onChange={(e) =>
            onFormDataChange({
              ...formData,
              personalInfo: { ...formData.personalInfo!, fullName: e.target.value },
            })
          }
          placeholder="Nguyễn Văn A"
          disabled={isEkycVerified}
        />
      </div>
      <div className="space-y-2">
        <Label className="text-sm font-medium">
          Số CMND/CCCD
        </Label>
        <Input
          className="h-11"
          value={formData.personalInfo?.idNumber || ""}
          onChange={(e) =>
            onFormDataChange({
              ...formData,
              personalInfo: { ...formData.personalInfo!, idNumber: e.target.value },
            })
          }
          placeholder="001234567890"
          disabled={isEkycVerified}
        />
      </div>
      <div className="space-y-2">
        <Label className="text-sm font-medium">
          Địa chỉ thường trú
        </Label>
        <Textarea
          className="min-h-[100px] resize-none"
          value={formData.personalInfo?.address || ""}
          onChange={(e) =>
            onFormDataChange({
              ...formData,
              personalInfo: { ...formData.personalInfo!, address: e.target.value },
            })
          }
          placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
          disabled={isEkycVerified}
        />
      </div>
    </div>
  )
}

