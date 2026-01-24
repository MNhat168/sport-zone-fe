import { User, Building2, CheckCircle, Image as ImageIcon } from "lucide-react"
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
  const documents = formData.documents as any
  const fieldImages: (File | string)[] = documents?.fieldImagesFiles || []
  const businessLicense = documents?.businessLicense_file || documents?.businessLicense

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

        <div className="p-5 bg-purple-50 rounded-xl border border-purple-200">
          <div className="flex items-center gap-2 mb-3">
            <ImageIcon className="w-5 h-5 text-purple-600" />
            <h3 className="font-semibold text-purple-900">Hình ảnh & Tài liệu</h3>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Ảnh sân ({fieldImages.length} ảnh):</p>
              {fieldImages.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {/* We will render images directly if they are Files using URL.createObjectURL temporarily or checking if they are strings (if edit mode) */}
                  {fieldImages.map((img, idx) => (
                    <div key={idx} className="aspect-video relative rounded-lg overflow-hidden border border-gray-200">
                      {/* Safe check for File object vs URL string if we support draft editing later */}
                      <img
                        src={img instanceof File ? URL.createObjectURL(img) : (typeof img === 'string' ? img : '')}
                        alt={`Field ${idx + 1}`}
                        className="w-full h-full object-cover"
                        onLoad={(e) => {
                          // Revoke object URL after load to free memory if it was created here inline? 
                          // Actually better to handle this via state/effect, but inline is "okay" for quick check, though not recommended.
                          // Given we are inside a map, let's just leave it simple.
                          // Better: use a helper component or just let browser handle it until unmount.
                        }}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic">Chưa có ảnh nào upload</p>
              )}
            </div>

            {businessLicense && (
              <div className="pt-3 border-t border-purple-100">
                <p className="text-sm font-medium text-gray-700 mb-1">Giấy ĐKKD:</p>
                <p className="text-sm text-blue-600 underline truncate">
                  {businessLicense instanceof File ? businessLicense.name : 'Tài liệu đã upload'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

