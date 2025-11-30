import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Building2, MapPin, Phone, Globe, Clock } from "lucide-react"
import { SportType } from "@/components/enums/ENUMS"
import type { CreateRegistrationRequestPayload } from "@/features/field-owner-registration"

interface FacilityInfoStepProps {
  formData: Partial<CreateRegistrationRequestPayload>
  onFormDataChange: (data: Partial<CreateRegistrationRequestPayload>) => void
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

export function FacilityInfoStep({ formData, onFormDataChange }: FacilityInfoStepProps) {
  const handleSportToggle = (sport: string) => {
    const currentSports = formData.supportedSports || []
    const newSports = currentSports.includes(sport)
      ? currentSports.filter((s) => s !== sport)
      : [...currentSports, sport]
    
    onFormDataChange({
      ...formData,
      supportedSports: newSports,
    })
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <div className="flex items-start gap-3">
          <Building2 className="h-5 w-5 text-blue-600 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-blue-900">
              Thông tin cơ sở vật chất
            </p>
            <p className="text-xs text-blue-700 mt-1">
              Vui lòng điền đầy đủ thông tin về cơ sở vật chất của bạn. Thông tin này sẽ giúp khách hàng tìm và đặt sân dễ dàng hơn.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium flex items-center gap-2">
          <Building2 className="h-4 w-4" />
          Tên cơ sở vật chất <span className="text-red-500">*</span>
        </Label>
        <Input
          className="h-11"
          value={formData.facilityName || ""}
          onChange={(e) =>
            onFormDataChange({
              ...formData,
              facilityName: e.target.value,
            })
          }
          placeholder="Ví dụ: Sân bóng đá Phú Nhuận"
          required
        />
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          Địa điểm cơ sở vật chất <span className="text-red-500">*</span>
        </Label>
        <Input
          className="h-11"
          value={formData.facilityLocation || ""}
          onChange={(e) =>
            onFormDataChange({
              ...formData,
              facilityLocation: e.target.value,
            })
          }
          placeholder="Ví dụ: Quận 3, TP. Hồ Chí Minh"
          required
        />
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium">
          Các môn thể thao hỗ trợ
        </Label>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {Object.entries(SPORT_LABELS).map(([key, label]) => (
            <label
              key={key}
              className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <input
                type="checkbox"
                checked={formData.supportedSports?.includes(key) || false}
                onChange={() => handleSportToggle(key)}
                className="w-4 h-4 text-primary focus:ring-primary"
              />
              <span className="text-sm">{label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium">
          Mô tả cơ sở vật chất <span className="text-red-500">*</span>
        </Label>
        <Textarea
          className="min-h-[100px] resize-none"
          value={formData.description || ""}
          onChange={(e) =>
            onFormDataChange({
              ...formData,
              description: e.target.value,
            })
          }
          placeholder="Mô tả chi tiết về cơ sở vật chất, dịch vụ, tiện ích..."
          required
        />
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium flex items-center gap-2">
          <Phone className="h-4 w-4" />
          Số điện thoại liên hệ <span className="text-red-500">*</span>
        </Label>
        <Input
          className="h-11"
          type="tel"
          value={formData.contactPhone || ""}
          onChange={(e) =>
            onFormDataChange({
              ...formData,
              contactPhone: e.target.value,
            })
          }
          placeholder="0901234567"
          required
        />
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Giờ hoạt động
        </Label>
        <Input
          className="h-11"
          value={formData.businessHours || ""}
          onChange={(e) =>
            onFormDataChange({
              ...formData,
              businessHours: e.target.value,
            })
          }
          placeholder="Ví dụ: Thứ 2 - Chủ nhật: 6:00 - 22:00"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium flex items-center gap-2">
          <Globe className="h-4 w-4" />
          Website (tuỳ chọn)
        </Label>
        <Input
          className="h-11"
          type="url"
          value={formData.website || ""}
          onChange={(e) =>
            onFormDataChange({
              ...formData,
              website: e.target.value,
            })
          }
          placeholder="https://example.com"
        />
      </div>
    </div>
  )
}

