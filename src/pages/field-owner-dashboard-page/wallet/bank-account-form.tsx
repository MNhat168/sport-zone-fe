'use client'

import { useState, useEffect, useRef } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hook'
import { validateBankAccount, clearValidationResult, type BankAccountResponse } from '@/features/bank-account'
import { uploadRegistrationDocument } from '@/features/field-owner-registration'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CustomFailedToast, CustomSuccessToast } from '@/components/toast/notificiation-toast'
import { X } from 'lucide-react'

interface BankAccountFormProps {
  initialData?: BankAccountResponse | null
  onSubmit: (data: {
    accountName: string
    accountNumber: string
    bankCode: string
    bankName: string
    branch?: string
    verificationDocument?: string
    isDefault?: boolean
  }) => Promise<void>
  onCancel?: () => void
  submitLabel?: string
  requireValidation?: boolean
}

export function BankAccountForm({
  initialData,
  onSubmit,
  onCancel,
  submitLabel = 'Thêm tài khoản',
  requireValidation = true,
}: BankAccountFormProps) {
  const dispatch = useAppDispatch()
  const { validationResult, validating } = useAppSelector((state) => state.bankAccount)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    accountName: '',
    accountNumber: '',
    bankCode: '',
    bankName: '',
    branch: '',
    verificationDocument: '',
    isDefault: false,
  })

  const [verificationFile, setVerificationFile] = useState<File | null>(null)
  const [filePreview, setFilePreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  const isEditMode = !!initialData

  // Pre-fill form when editing
  useEffect(() => {
    if (initialData) {
      setFormData({
        accountName: initialData.accountName || '',
        accountNumber: initialData.accountNumber || '',
        bankCode: initialData.bankCode || '',
        bankName: initialData.bankName || '',
        branch: initialData.branch || '',
        verificationDocument: initialData.verificationDocument || '',
        isDefault: initialData.isDefault || false,
      })
      // If editing and has existing document URL, show it
      if (initialData.verificationDocument) {
        setFilePreview(initialData.verificationDocument)
      }
    }
  }, [initialData])

  // Clear validation result when form data changes
  useEffect(() => {
    if (!isEditMode) {
      dispatch(clearValidationResult())
    }
  }, [formData.bankCode, formData.accountNumber, isEditMode, dispatch])

  const handleValidate = async () => {
    if (!formData.bankCode || !formData.accountNumber) {
      CustomFailedToast('Vui lòng nhập mã ngân hàng và số tài khoản')
      return
    }

    try {
      await dispatch(
        validateBankAccount({
          bankCode: formData.bankCode,
          accountNumber: formData.accountNumber,
        })
      ).unwrap()
    } catch (error: any) {
      CustomFailedToast(error.message || 'Xác thực thất bại')
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const isValidImage = file.type.startsWith('image/')
    const isValidPdf = file.type === 'application/pdf'

    if (!isValidImage && !isValidPdf) {
      CustomFailedToast('Chỉ chấp nhận file ảnh (JPG, PNG) hoặc PDF')
      return
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      CustomFailedToast('File không được vượt quá 5MB')
      return
    }

    setVerificationFile(file)

    // Create preview for images
    if (isValidImage) {
      const preview = URL.createObjectURL(file)
      setFilePreview(preview)
    } else {
      setFilePreview(file.name)
    }
  }

  const handleRemoveFile = () => {
    if (filePreview && filePreview.startsWith('blob:')) {
      URL.revokeObjectURL(filePreview)
    }
    setVerificationFile(null)
    setFilePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    setFormData({ ...formData, verificationDocument: '' })
  }

  const handleSubmit = async () => {
    if (!formData.accountName || !formData.accountNumber || !formData.bankCode || !formData.bankName) {
      CustomFailedToast('Vui lòng điền đầy đủ thông tin')
      return
    }

    // For new accounts, require validation
    if (!isEditMode && requireValidation && (!validationResult || !validationResult.isValid)) {
      CustomFailedToast('Vui lòng xác thực tài khoản trước khi thêm')
      return
    }

    let verificationDocumentUrl = formData.verificationDocument

    // Upload file if provided
    if (verificationFile) {
      setUploading(true)
      try {
        verificationDocumentUrl = await dispatch(uploadRegistrationDocument(verificationFile)).unwrap()
        CustomSuccessToast('Tải lên ảnh thành công')
      } catch (uploadError: any) {
        CustomFailedToast(uploadError.message || 'Lỗi khi tải lên ảnh')
        setUploading(false)
        return
      }
      setUploading(false)
    }

    await onSubmit({
      accountName: formData.accountName,
      accountNumber: formData.accountNumber,
      bankCode: formData.bankCode,
      bankName: formData.bankName,
      branch: formData.branch || undefined,
      verificationDocument: verificationDocumentUrl || undefined,
      isDefault: formData.isDefault,
    })
  }

  const canSubmit = isEditMode
    ? true
    : requireValidation
      ? validationResult?.isValid === true
      : true

  return (
    <div className="space-y-4">
      <div className="space-y-2.5">
        <Label htmlFor="accountName">Tên chủ tài khoản (phải trùng với CCCD)</Label>
        <Input
          id="accountName"
          value={formData.accountName}
          onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
          placeholder="NGUYEN VAN A"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2.5">
          <Label htmlFor="accountNumber">Số tài khoản</Label>
          <Input
            id="accountNumber"
            value={formData.accountNumber}
            onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
            placeholder="1234567890"
          />
        </div>
        <div className="space-y-2.5">
          <Label htmlFor="bankCode">Mã ngân hàng</Label>
          <Input
            id="bankCode"
            value={formData.bankCode}
            onChange={(e) => setFormData({ ...formData, bankCode: e.target.value })}
            placeholder="VCB, TCB, BIDV..."
          />
        </div>
      </div>

      <div className="space-y-2.5">
        <Label htmlFor="bankName">Tên ngân hàng</Label>
        <Input
          id="bankName"
          value={formData.bankName}
          onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
          placeholder="Vietcombank"
        />
      </div>

      <div className="space-y-2.5">
        <Label htmlFor="branch">Chi nhánh (tùy chọn)</Label>
        <Input
          id="branch"
          value={formData.branch}
          onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
          placeholder="Chi nhánh Hà Nội"
        />
      </div>

      <div className="space-y-2.5">
        <Label htmlFor="verificationDocument">Ảnh chụp màn hình Internet Banking (tùy chọn)</Label>
        <div className="space-y-2">
          {!filePreview || (filePreview && !filePreview.startsWith('blob:') && !filePreview.startsWith('http')) ? (
            <div className="flex items-center gap-2">
              <Input
                ref={fileInputRef}
                id="verificationDocument"
                type="file"
                accept="image/*,application/pdf"
                onChange={handleFileSelect}
                className="cursor-pointer"
                disabled={uploading}
              />
              <p className="text-sm text-muted-foreground">
                Chấp nhận: JPG, PNG, PDF (tối đa 5MB)
              </p>
            </div>
          ) : (
            <div className="flex items-center gap-2 p-3 border rounded-lg bg-muted/50">
              {filePreview.startsWith('blob:') || filePreview.startsWith('http') ? (
                <img
                  src={filePreview}
                  alt="Preview"
                  className="h-20 w-20 object-cover rounded"
                  onError={(e) => {
                    // If image fails to load, show file name instead
                    const target = e.target as HTMLImageElement
                    target.style.display = 'none'
                  }}
                />
              ) : (
                <div className="h-20 w-20 flex items-center justify-center bg-gray-200 rounded">
                  <span className="text-xs text-center px-2">{filePreview}</span>
                </div>
              )}
              <div className="flex-1">
                <p className="text-sm font-medium">
                  {verificationFile?.name || (filePreview.startsWith('http') ? 'Ảnh đã tải lên' : filePreview)}
                </p>
                {verificationFile && (
                  <p className="text-xs text-muted-foreground">
                    {(verificationFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                )}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRemoveFile}
                disabled={uploading}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {!isEditMode && (
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="isDefault"
            checked={formData.isDefault}
            onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
            className="h-4 w-4 rounded border-gray-300"
          />
          <Label htmlFor="isDefault" className="font-normal cursor-pointer">
            Đặt làm tài khoản rút tiền mặc định
          </Label>
        </div>
      )}

      {!isEditMode && (
        <>
          {validationResult && (
            <div
              className={`p-3 rounded ${
                validationResult.isValid ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
              }`}
            >
              <p className={validationResult.isValid ? 'text-green-700' : 'text-red-700'}>
                {validationResult.isValid
                  ? `✓ Tài khoản hợp lệ. Tên chủ TK: ${validationResult.accountName}`
                  : '✗ Tài khoản không hợp lệ'}
              </p>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleValidate}
              disabled={validating || !formData.bankCode || !formData.accountNumber}
            >
              {validating ? 'Đang xác thực...' : 'Xác thực tài khoản'}
            </Button>
          </div>
        </>
      )}

      <div className="flex gap-2 pt-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Hủy
          </Button>
        )}
        <Button type="button" onClick={handleSubmit} disabled={!canSubmit || uploading}>
          {uploading ? 'Đang tải lên...' : submitLabel}
        </Button>
      </div>
    </div>
  )
}

