import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { CreateRegistrationRequestPayload } from "@/features/field-owner-registration"

interface BankAccountStepProps {
  formData: Partial<CreateRegistrationRequestPayload>
  onFormDataChange: (data: Partial<CreateRegistrationRequestPayload>) => void
}

export function BankAccountStep({ formData, onFormDataChange }: BankAccountStepProps) {
  return (
    <div className="space-y-6">
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800 font-medium">
          ℹ️ Thông tin tài khoản ngân hàng sẽ được thêm sau khi đơn đăng ký được duyệt.
        </p>
        <p className="text-sm text-blue-700 mt-2">
          Sau khi được phê duyệt, bạn có thể thêm tài khoản ngân hàng trong phần quản lý tài khoản của chủ sân.
        </p>
      </div>
      <div className="space-y-2">
        <Label className="text-sm font-medium">Tên chủ tài khoản</Label>
        <Input
          className="h-11"
          value={formData.bankAccount?.accountName || ""}
          onChange={(e) =>
            onFormDataChange({
              ...formData,
              bankAccount: { ...formData.bankAccount!, accountName: e.target.value },
            })
          }
          placeholder="NGUYEN VAN A"
        />
      </div>
      <div className="space-y-2">
        <Label className="text-sm font-medium">Số tài khoản</Label>
        <Input
          className="h-11"
          value={formData.bankAccount?.accountNumber || ""}
          onChange={(e) =>
            onFormDataChange({
              ...formData,
              bankAccount: { ...formData.bankAccount!, accountNumber: e.target.value },
            })
          }
          placeholder="0123456789"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium">Mã ngân hàng</Label>
          <Input
            className="h-11"
            value={formData.bankAccount?.bankCode || ""}
            onChange={(e) =>
              onFormDataChange({
                ...formData,
                bankAccount: { ...formData.bankAccount!, bankCode: e.target.value },
              })
            }
            placeholder="VCB"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-medium">Tên ngân hàng</Label>
          <Input
            className="h-11"
            value={formData.bankAccount?.bankName || ""}
            onChange={(e) =>
              onFormDataChange({
                ...formData,
                bankAccount: { ...formData.bankAccount!, bankName: e.target.value },
              })
            }
            placeholder="Vietcombank"
          />
        </div>
      </div>
    </div>
  )
}

