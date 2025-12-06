import React, { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import axiosUpload from '@/utils/axios/axiosUpload'
import { Paperclip, Trash2 } from 'lucide-react'

export type ReportCategory =
  | 'incorrect_info'
  | 'inappropriate_content'
  | 'safety_issue'
  | 'payment_issue'
  | 'spam_fraud'
  | 'owner_behavior'
  | 'booking_issue'
  | 'other'

const CATEGORY_OPTIONS: { value: ReportCategory; label: string }[] = [
  { value: 'incorrect_info', label: 'Thông tin không chính xác' },
  { value: 'inappropriate_content', label: 'Nội dung không phù hợp' },
  { value: 'safety_issue', label: 'Vấn đề an toàn' },
  { value: 'payment_issue', label: 'Vấn đề thanh toán' },
  { value: 'spam_fraud', label: 'Spam/Lừa đảo' },
  { value: 'owner_behavior', label: 'Hành vi chủ sân' },
  { value: 'booking_issue', label: 'Vấn đề đặt sân' },
  { value: 'other', label: 'Khác' },
]

type Props = {
  isOpen: boolean
  onClose: () => void
  fieldId?: string
  fieldName?: string
}

export default function ReportDialog({ isOpen, onClose, fieldId, fieldName }: Props) {
  const [category, setCategory] = useState<ReportCategory>('incorrect_info')
  const [message, setMessage] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!isOpen) {
      // reset when closed
      setCategory('incorrect_info')
      setMessage('')
      setFiles([])
      setSubmitting(false)
    }
  }, [isOpen])

  const needsMessage = category === 'other'
  const canSubmit = !submitting && (!needsMessage || message.trim().length >= 10)

  const handlePickFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || [])
    if (selected.length === 0) return

    const total = files.length + selected.length
    if (total > 3) {
      toast.error('Tối đa 3 tệp đính kèm mỗi tin nhắn')
    }

    const allowed = selected.slice(0, Math.max(0, 3 - files.length))

    // Basic client-side type/size checks (optional)
    const validMimes = new Set([
      'image/jpeg',
      'image/png',
      'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ])

    const filtered = allowed.filter((f) => {
      if (!validMimes.has(f.type)) {
        toast.error(`${f.name}: Định dạng không được hỗ trợ`)
        return false
      }
      if (f.size > 10 * 1024 * 1024) {
        toast.error(`${f.name}: Kích thước vượt quá 10MB`)
        return false
      }
      return true
    })

    setFiles((prev) => [...prev, ...filtered])
    // Reset the input so selecting the same file again re-triggers onChange
    e.currentTarget.value = ''
  }

  const removeFile = (idx: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx))
  }

  const handleSubmit = async () => {
    if (!canSubmit) return
    try {
      setSubmitting(true)
      const form = new FormData()
      form.append('category', category)
      if (fieldId) form.append('fieldId', fieldId)
      if (message.trim()) form.append('description', message.trim())
      files.forEach((f) => form.append('files', f))

      await axiosUpload.post('/reports', form)
      toast.success('Đã gửi báo cáo. Cảm ơn bạn!')
      onClose()
    } catch (err: any) {
      const msg = err?.response?.data?.message || err.message || 'Gửi báo cáo thất bại'
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Báo cáo vấn đề</DialogTitle>
          <DialogDescription>
            {fieldName ? `Về sân: ${fieldName}` : 'Vui lòng chọn lý do báo cáo và (tùy chọn) cung cấp bằng chứng.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Lý do báo cáo</Label>
            <RadioGroup value={category} onValueChange={(v) => setCategory(v as ReportCategory)}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {CATEGORY_OPTIONS.map((opt) => (
                  <label key={opt.value} className="flex items-center gap-2 rounded-md border p-3 cursor-pointer hover:bg-accent">
                    <RadioGroupItem value={opt.value} />
                    <span className="text-sm">{opt.label}</span>
                  </label>
                ))}
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label>
              Tin nhắn {needsMessage && <span className="text-destructive">(bắt buộc cho mục "Khác")</span>}
            </Label>
            <Textarea
              placeholder={needsMessage ? 'Mô tả chi tiết vấn đề (tối thiểu 10 ký tự)...' : 'Bạn có thể mô tả thêm (không bắt buộc)'}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            {needsMessage && message.trim().length > 0 && message.trim().length < 10 && (
              <p className="text-xs text-destructive">Vui lòng nhập ít nhất 10 ký tự.</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Tệp đính kèm (tối đa 3)</Label>
            <div className="flex items-center gap-2">
              <Input
                type="file"
                accept="image/jpeg,image/png,image/webp,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                multiple
                onChange={handlePickFiles}
              />
              <Paperclip className="size-4 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground">Sẽ hữu ích nếu bạn cung cấp bằng chứng (hình ảnh hoặc tài liệu).</p>

            {files.length > 0 && (
              <ul className="mt-2 space-y-2 max-h-40 overflow-auto pr-1">
                {files.map((f, idx) => (
                  <li key={idx} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
                    <span className="truncate mr-3">{f.name}</span>
                    <Button type="button" variant="ghost" size="icon-sm" onClick={() => removeFile(idx)} aria-label="Xóa file">
                      <Trash2 className="size-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={submitting}>Hủy</Button>
          <Button onClick={handleSubmit} disabled={!canSubmit}>
            {submitting ? 'Đang gửi...' : 'Gửi báo cáo'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}