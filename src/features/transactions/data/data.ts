export const statusOptions = [
  { label: 'Pending', value: 'pending' },
  { label: 'Processing', value: 'processing' },
  { label: 'Succeeded', value: 'succeeded' },
  { label: 'Failed', value: 'failed' },
  { label: 'Cancelled', value: 'cancelled' },
  { label: 'Refunded', value: 'refunded' },
]

export const typeOptions = [
  { label: 'Payment', value: 'payment' },
  { label: 'Refund (Full)', value: 'refund_full' },
  { label: 'Refund (Partial)', value: 'refund_partial' },
  { label: 'Reversal', value: 'reversal' },
  { label: 'Adjustment', value: 'adjustment' },
  { label: 'Payout', value: 'payout' },
  { label: 'Fee', value: 'fee' },
]

// method sẽ gửi theo name string để BE map → xem AdminService
export const methodOptions = [
  { label: 'VNPay', value: 'vnpay' },
  { label: 'PayOS', value: 'payos' },
  { label: 'Cash', value: 'cash' },
  { label: 'Bank Transfer', value: 'bank_transfer' },
  { label: 'QR Code', value: 'qr_code' },
  { label: 'E-Banking', value: 'ebanking' },
  { label: 'Credit Card', value: 'credit_card' },
  { label: 'Debit Card', value: 'debit_card' },
  { label: 'MoMo', value: 'momo' },
  { label: 'ZaloPay', value: 'zalopay' },
  { label: 'Internal', value: 'internal' },
]

export function formatAmountVND(value?: number) {
  if (typeof value !== 'number') return '—'
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)
}
