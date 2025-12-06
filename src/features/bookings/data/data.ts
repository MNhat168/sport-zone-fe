import { type BookingStatus, type BookingType, type PaymentStatus, type ApprovalStatus } from './schema'

export const bookingStatuses: { value: BookingStatus; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'completed', label: 'Completed' },
]

export const bookingTypes: { value: BookingType; label: string }[] = [
  { value: 'field', label: 'Field' },
  { value: 'coach', label: 'Coach' },
]

export const paymentStatuses: { value: PaymentStatus; label: string }[] = [
  { value: 'unpaid', label: 'Unpaid' },
  { value: 'paid', label: 'Paid' },
  { value: 'refunded', label: 'Refunded' },
]

export const approvalStatuses: { value: ApprovalStatus; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
]

export const formatAmountVND = (amount: number | undefined | null): string => {
  if (amount === undefined || amount === null) return '—'
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount)
}

