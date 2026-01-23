import { useState, useRef, useEffect } from "react"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Upload, X, FileText, Image as ImageIcon, FileArchive } from "lucide-react"
import { CustomFailedToast } from "@/components/toast/notificiation-toast"
import type { CreateRegistrationRequestPayload } from "@/features/field-owner-registration"

interface DocumentsStepProps {
  formData: Partial<CreateRegistrationRequestPayload>
  onFormDataChange: (data: Partial<CreateRegistrationRequestPayload>) => void
}

interface FileUploadState {
  file: File | null
  preview: string | null
  fileType: 'image' | 'pdf' | 'document' | 'archive' | null
}

export function DocumentsStep({ formData, onFormDataChange }: DocumentsStepProps) {
  // Note: CCCD upload (idFront, idBack) has been removed - now handled via didit eKYC
  // This step handles: field images (required >= 5) + optional business license upload
  const businessLicenseInputRef = useRef<HTMLInputElement>(null)
  const fieldImagesInputRef = useRef<HTMLInputElement>(null)

  // Restore field images from formData if available
  const documents = formData.documents as any
  const savedFieldImagesFiles: File[] = documents?.fieldImagesFiles || []
  const [fieldImages, setFieldImages] = useState<File[]>(savedFieldImagesFiles)

  // Sync fieldImages with formData when component mounts or formData changes
  useEffect(() => {
    const currentFiles = documents?.fieldImagesFiles || []
    if (currentFiles.length > 0 && currentFiles.length !== fieldImages.length) {
      setFieldImages(currentFiles)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.documents])

  const getFileType = (file: File | null): 'image' | 'pdf' | 'document' | 'archive' | null => {
    if (file) {
      if (file.type.startsWith('image/')) return 'image'
      if (file.type === 'application/pdf') return 'pdf'
      // Archive files
      if (file.type === 'application/zip' ||
        file.type === 'application/x-zip-compressed' ||
        file.type === 'application/x-rar-compressed' ||
        file.type === 'application/x-7z-compressed' ||
        file.name.match(/\.(zip|rar|7z)$/i)) return 'archive'
      // Document files
      if (file.type === 'application/msword' ||
        file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        file.type === 'application/vnd.ms-excel' ||
        file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        file.name.match(/\.(doc|docx|xls|xlsx)$/i)) return 'document'
    }
    return null
  }

  // Helper to get file from formData (only for business license now)
  const getFileFromFormData = (fieldName: 'businessLicense'): File | null => {
    const documents = formData.documents as any
    if (documents && documents[`${fieldName}_file`]) {
      return documents[`${fieldName}_file`] as File
    }
    return null
  }

  const [businessLicenseState, setBusinessLicenseState] = useState<FileUploadState>({
    file: getFileFromFormData('businessLicense'),
    preview: null,
    fileType: null,
  })

  useEffect(() => {
    if (businessLicenseState.file) {
      const fileType = getFileType(businessLicenseState.file)
      if (fileType === 'image') {
        const preview = URL.createObjectURL(businessLicenseState.file)
        setBusinessLicenseState(prev => ({ ...prev, preview, fileType }))
        return () => {
          URL.revokeObjectURL(preview)
        }
      } else if (fileType === 'pdf') {
        setBusinessLicenseState(prev => ({ ...prev, preview: businessLicenseState.file!.name, fileType }))
      }
    } else {
      // Clean up if file is removed
      if (businessLicenseState.preview && businessLicenseState.preview.startsWith('blob:')) {
        URL.revokeObjectURL(businessLicenseState.preview)
      }
      setBusinessLicenseState(prev => ({ ...prev, preview: null, fileType: null }))
    }
  }, [businessLicenseState.file])

  const validateFile = (file: File): boolean => {
    const allowedTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/webp',
      'application/pdf',
      'application/zip', 'application/x-zip-compressed',
      'application/x-rar-compressed', 'application/x-7z-compressed',
      'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ]
    const allowedExtensions = /\.(jpg|jpeg|png|webp|pdf|zip|rar|7z|doc|docx|xls|xlsx)$/i
    const maxSize = 10 * 1024 * 1024 // 10MB

    if (!allowedTypes.includes(file.type) && !allowedExtensions.test(file.name)) {
      CustomFailedToast('Chỉ chấp nhận file ảnh (JPG, PNG, WEBP), tài liệu (PDF, DOC, DOCX, XLS, XLSX) hoặc file nén (ZIP, RAR, 7Z)')
      return false
    }

    if (file.size > maxSize) {
      CustomFailedToast('Kích thước file không được vượt quá 10MB')
      return false
    }

    return true
  }

  const handleFieldImagesSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return

    const validFiles: File[] = []
    Array.from(files).forEach((file) => {
      if (file.type.startsWith("image/")) {
        validFiles.push(file)
      } else {
        CustomFailedToast("Ảnh sân chỉ chấp nhận định dạng JPG, PNG, WEBP")
      }
    })

    if (validFiles.length === 0) return

    const nextImages = [...fieldImages, ...validFiles].slice(0, 10) // limit max 10 images
    setFieldImages(nextImages)

    // Store File objects in a separate field for upload later
    // Keep preview URLs for display
    const documents = formData.documents as any || {}
    onFormDataChange({
      ...formData,
      documents: {
        ...documents,
        fieldImagesFiles: nextImages, // Store File objects for upload
      },
      fieldImages: nextImages.map((f) => URL.createObjectURL(f)), // Preview URLs for display
    })
  }

  const handleRemoveFieldImage = (index: number) => {
    const nextImages = fieldImages.filter((_, i) => i !== index)
    setFieldImages(nextImages)

    const documents = formData.documents as any || {}
    onFormDataChange({
      ...formData,
      documents: {
        ...documents,
        fieldImagesFiles: nextImages, // Update File objects
      },
      fieldImages: nextImages.map((f) => URL.createObjectURL(f)), // Update preview URLs
    })
  }

  const handleFileSelect = (
    file: File,
    setState: React.Dispatch<React.SetStateAction<FileUploadState>>,
    fieldName: 'businessLicense'
  ) => {
    if (!validateFile(file)) {
      return
    }

    // Determine file type
    const fileType = getFileType(file)

    // Create preview immediately for images
    let preview: string | null = null
    if (fileType === 'image') {
      preview = URL.createObjectURL(file)
    } else {
      // For non-images, show file name
      preview = file.name
    }

    setState({
      file,
      preview,
      fileType,
    })

    // Update formData with File object (we'll upload later when submitting)
    // Store file in a special field name to distinguish from URLs
    const currentDocuments = formData.documents || {}
    onFormDataChange({
      ...formData,
      documents: {
        ...currentDocuments,
        [`${fieldName}_file`]: file,
        // Clear any existing URL for this field
        [fieldName]: undefined,
      } as any,
    })
  }

  const handleRemove = (
    setState: React.Dispatch<React.SetStateAction<FileUploadState>>,
    fieldName: 'businessLicense',
    currentState: FileUploadState
  ) => {
    // Clean up blob URL if exists
    if (currentState.preview && currentState.preview.startsWith('blob:')) {
      URL.revokeObjectURL(currentState.preview)
    }

    setState({
      file: null,
      preview: null,
      fileType: null,
    })

    // Update formData - remove both file and URL
    const currentDocuments = formData.documents || {}
    const updatedDocuments = { ...currentDocuments }
    delete updatedDocuments[`${fieldName}_file`]
    delete updatedDocuments[fieldName]

    onFormDataChange({
      ...formData,
      documents: updatedDocuments as any,
    })
  }

  const renderFileUpload = (
    label: string,
    state: FileUploadState,
    setState: React.Dispatch<React.SetStateAction<FileUploadState>>,
    inputRef: React.RefObject<HTMLInputElement | null>,
    fieldName: 'businessLicense'
  ) => {
    const isImage = state.fileType === 'image' || (state.preview && (
      state.preview.startsWith('blob:') ||
      state.preview.startsWith('data:') ||
      state.preview.match(/\.(jpg|jpeg|png|webp|gif)/i) ||
      (state.preview.startsWith('http') && !state.preview.match(/\.(pdf|zip|rar|7z|doc|docx|xls|xlsx)/i))
    ))
    const isPdf = state.fileType === 'pdf' || (state.preview && state.preview.match(/\.pdf/i))
    const isArchive = state.fileType === 'archive' || (state.preview && state.preview.match(/\.(zip|rar|7z)/i))
    const isDocument = state.fileType === 'document' || (state.preview && state.preview.match(/\.(doc|docx|xls|xlsx)/i))

    return (
      <div className="space-y-2">
        <Label className="text-sm font-medium">{label}</Label>

        {state.preview ? (
          <div className="relative border border-gray-300 rounded-lg p-4 bg-gray-50">
            {isImage ? (
              <div className="relative">
                <img
                  src={state.preview}
                  alt={label}
                  className="w-full h-48 object-contain rounded-lg border border-gray-200 bg-white"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8 rounded-full"
                  onClick={() => handleRemove(setState, fieldName, state)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : isPdf ? (
              <div className="relative flex items-center justify-center py-8 bg-white rounded-lg border border-gray-200">
                <div className="flex flex-col items-center space-y-2">
                  <FileText className="w-12 h-12 text-red-500" />
                  <p className="text-sm font-medium">PDF Document</p>
                  <p className="text-xs text-gray-500">{state.preview}</p>
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8 rounded-full"
                  onClick={() => handleRemove(setState, fieldName, state)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : isArchive ? (
              <div className="relative flex items-center justify-center py-8 bg-white rounded-lg border border-gray-200">
                <div className="flex flex-col items-center space-y-2">
                  <FileArchive className="w-12 h-12 text-purple-500" />
                  <p className="text-sm font-medium">Archived File</p>
                  <p className="text-xs text-gray-500">{state.preview}</p>
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8 rounded-full"
                  onClick={() => handleRemove(setState, fieldName, state)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : isDocument ? (
              <div className="relative flex items-center justify-center py-8 bg-white rounded-lg border border-gray-200">
                <div className="flex flex-col items-center space-y-2">
                  <FileText className="w-12 h-12 text-blue-500" />
                  <p className="text-sm font-medium">Document</p>
                  <p className="text-xs text-gray-500">{state.preview}</p>
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8 rounded-full"
                  onClick={() => handleRemove(setState, fieldName, state)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : null}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2 w-full"
              onClick={() => inputRef.current?.click()}
            >
              Đổi file
            </Button>
          </div>
        ) : (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center space-y-4 hover:border-primary transition-colors">
            <div className="flex flex-col items-center space-y-2">
              <Upload className="w-10 h-10 text-gray-400" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-700">Chọn file để tải lên</p>
                <p className="text-xs text-gray-500">Hỗ trợ: Ảnh (JPG, PNG, WEBP), Tài liệu (PDF, DOC, DOCX), File nén (ZIP, RAR, 7Z) - tối đa 10MB</p>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => inputRef.current?.click()}
            >
              <ImageIcon className="w-4 h-4 mr-2" />
              Chọn file
            </Button>
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp,application/pdf,.zip,.rar,.7z,.doc,.docx,.xls,.xlsx"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) {
              handleFileSelect(file, setState, fieldName)
            }
            // Reset input to allow selecting the same file again
            e.target.value = ''
          }}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-2">
        <p className="text-sm text-blue-800">
          💡 Lưu ý: Xác thực danh tính CCCD được thực hiện qua didit eKYC ở bước trước.
        </p>
        <p className="text-sm text-blue-800">
          Bước này yêu cầu bạn tải lên <span className="font-semibold">tối thiểu 5 ảnh sân</span> và
          (tuỳ chọn) giấy ĐKKD nếu bạn là hộ kinh doanh/doanh nghiệp.
        </p>
      </div>

      {/* Field images */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">
          Ảnh sân (tối thiểu 5 ảnh)
        </Label>
        <p className="text-xs text-gray-500">
          Vui lòng tải lên ít nhất 5 ảnh thể hiện toàn cảnh sân, phòng thay đồ, bãi đỗ xe, v.v.
        </p>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2">
              <Upload className="w-6 h-6 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-700">Chọn ảnh sân</p>
                <p className="text-xs text-gray-500">
                  Hỗ trợ: JPG, PNG, WEBP (tối đa 10 ảnh, mỗi ảnh ≤ 10MB)
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => fieldImagesInputRef.current?.click()}
              className="w-full sm:w-auto"
            >
              <ImageIcon className="w-4 h-4 mr-2" />
              Chọn ảnh
            </Button>
          </div>

          <input
            ref={fieldImagesInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            multiple
            className="hidden"
            onChange={(e) => {
              handleFieldImagesSelect(e.target.files)
              e.target.value = ""
            }}
          />

          {fieldImages.length > 0 && (
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {fieldImages.map((file, index) => {
                const previewUrl = URL.createObjectURL(file)
                return (
                  <div key={index} className="relative">
                    <img
                      src={previewUrl}
                      alt={`Ảnh sân ${index + 1}`}
                      className="w-full h-28 object-cover rounded-md border border-gray-200"
                    />
                    <button
                      type="button"
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow"
                      onClick={() => handleRemoveFieldImage(index)}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )
              })}
            </div>
          )}

          <p className="mt-2 text-xs text-gray-500">
            Đã chọn {fieldImages.length} ảnh. Bạn cần tối thiểu <span className="font-semibold">5 ảnh</span> trước khi gửi đăng ký.
          </p>
        </div>
      </div>

      {/* Optional business license */}
      {renderFileUpload(
        "Giấy ĐKKD (Giấy đăng ký kinh doanh) - Tuỳ chọn",
        businessLicenseState,
        setBusinessLicenseState,
        businessLicenseInputRef,
        "businessLicense"
      )}
    </div>
  )
}
