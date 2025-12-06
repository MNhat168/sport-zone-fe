import type { Report } from '@/store/services/reportsApi'

export type ReportStatus = Report['status']

export const reportStatusOptions = [
  { label: 'Mới mở', value: 'open' },
  { label: 'Đang xử lý', value: 'in_review' },
  { label: 'Đã giải quyết', value: 'resolved' },
  { label: 'Đóng', value: 'closed' },
] as const

export const reportCategoryOptions = [
  { label: 'Thông tin sai lệch', value: 'incorrect_info' },
  { label: 'Nội dung không phù hợp', value: 'inappropriate_content' },
  { label: 'Vấn đề an toàn', value: 'safety_issue' },
  { label: 'Vấn đề thanh toán', value: 'payment_issue' },
  { label: 'Spam / Lừa đảo', value: 'spam_fraud' },
  { label: 'Ứng xử chủ sân', value: 'owner_behavior' },
  { label: 'Vấn đề đặt sân', value: 'booking_issue' },
  { label: 'Khác', value: 'other' },
] as const

const reportCategoryLabelMap = Object.fromEntries(
  reportCategoryOptions.map((opt) => [opt.value, opt.label])
) as Record<string, string>

const reportStatusMetaMap: Record<
  ReportStatus,
  { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }
> = {
  open: { label: 'Mới mở', variant: 'destructive' },
  in_review: { label: 'Đang xử lý', variant: 'secondary' },
  resolved: { label: 'Đã giải quyết', variant: 'default' },
  closed: { label: 'Đóng', variant: 'outline' },
}

export function getReportCategoryLabel(category?: string | null) {
  if (!category) return '—'
  return reportCategoryLabelMap[category] ?? category
}

export function getReportStatusMeta(
  status?: ReportStatus
): { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' } {
  if (!status) return { label: 'Không rõ', variant: 'outline' }
  return reportStatusMetaMap[status] ?? { label: status, variant: 'outline' }
}

export function formatDateTime(value?: string | null) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleString('vi-VN', {
    hour12: false,
    dateStyle: 'short',
    timeStyle: 'short',
  })
}

export function formatReporter(reporter: Report['reporter']) {
  if (!reporter) return '—'
  if (typeof reporter === 'string') return reporter
  if (typeof reporter === 'object') {
    const record = reporter as Record<string, unknown>
    const fullName =
      typeof record.fullName === 'string' ? record.fullName : undefined
    const email = typeof record.email === 'string' ? record.email : undefined
    const phone =
      typeof record.phoneNumber === 'string' ? record.phoneNumber : undefined
    const id = typeof record._id === 'string' ? record._id : undefined
    return fullName ?? email ?? phone ?? id ?? '—'
  }
  return '—'
}

