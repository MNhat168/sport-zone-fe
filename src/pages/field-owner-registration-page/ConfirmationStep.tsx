import { User, Building2, CheckCircle } from "lucide-react"
import type { CreateRegistrationRequestPayload } from "@/features/field-owner-registration"
import { SportType } from "@/components/enums/ENUMS"

interface ConfirmationStepProps {
  formData: Partial<CreateRegistrationRequestPayload>
}

const SPORT_LABELS: Record<string, string> = {
  [SportType.FOOTBALL]: "Bóng đá",
  [SportType.TENNIS]: "Quần vợt",
  [SportType.BADMINTON]: "Cầu lông",
  [SportType.PICKLEBALL]: "Pickleball",
  [SportType.BASKETBALL]: "Bóng rổ",
  [SportType.VOLLEYBALL]: "Bóng chuyền",
  [SportType.SWIMMING]: "Bơi lội",
  [SportType.GYM]: "Gym",
}

export function ConfirmationStep({ formData }: ConfirmationStepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center py-4">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">Xác nhận thông tin</h3>
        <p className="text-sm text-gray-600">Vui lòng kiểm tra kỹ thông tin trước khi gửi đăng ký</p>
      </div>

      <div className="space-y-4">
        <div className="p-5 bg-blue-50 rounded-xl border border-blue-200">
          <div className="flex items-center gap-2 mb-3">
            <User className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-blue-900">Thông tin cá nhân</h3>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex">
              <span className="font-medium w-32">Họ tên:</span>
              <span className="text-gray-700">{formData.personalInfo?.fullName}</span>
            </div>
            <div className="flex">
              <span className="font-medium w-32">CMND/CCCD:</span>
              <span className="text-gray-700">{formData.personalInfo?.idNumber}</span>
            </div>
            <div className="flex">
              <span className="font-medium w-32">Địa chỉ:</span>
              <span className="text-gray-700">{formData.personalInfo?.address}</span>
            </div>
          </div>
        </div>

        <div className="p-5 bg-emerald-50 rounded-xl border border-emerald-200">
          <div className="flex items-center gap-2 mb-3">
            <Building2 className="w-5 h-5 text-green-600" />
            <h3 className="font-semibold text-green-900">Thông tin cơ sở vật chất</h3>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex">
              <span className="font-medium w-32">Tên cơ sở:</span>
              <span className="text-gray-700">{formData.facilityName || "Chưa điền"}</span>
            </div>
            <div className="flex">
              <span className="font-medium w-32">Địa điểm:</span>
              <span className="text-gray-700">{formData.facilityLocation || "Chưa điền"}</span>
            </div>
            {formData.supportedSports && formData.supportedSports.length > 0 && (
              <div className="flex">
                <span className="font-medium w-32">Môn thể thao:</span>
                <span className="text-gray-700">
                  {formData.supportedSports.map(sport => SPORT_LABELS[sport] || sport).join(", ")}
                </span>
              </div>
            )}
            {formData.description && (
              <div className="flex flex-col">
                <span className="font-medium mb-1">Mô tả:</span>
                <span className="text-gray-700">{formData.description}</span>
              </div>
            )}
            {formData.contactPhone && (
              <div className="flex">
                <span className="font-medium w-32">Số điện thoại:</span>
                <span className="text-gray-700">{formData.contactPhone}</span>
              </div>
            )}
            {formData.businessHours && (
              <div className="flex">
                <span className="font-medium w-32">Giờ hoạt động:</span>
                <span className="text-gray-700">{formData.businessHours}</span>
              </div>
            )}
            {formData.website && (
              <div className="flex">
                <span className="font-medium w-32">Website:</span>
                <span className="text-gray-700">{formData.website}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

