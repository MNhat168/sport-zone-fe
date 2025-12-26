export const statusOptions = [
  { label: 'Đang chờ', value: 'pending' },
  { label: 'Đang xử lý', value: 'processing' },
  { label: 'Thành công', value: 'succeeded' },
  { label: 'Thất bại', value: 'failed' },
  { label: 'Đã hủy', value: 'cancelled' },
  { label: 'Đã hoàn tiền', value: 'refunded' },
]

export const typeOptions = [
  { label: 'Thanh toán', value: 'payment' },
  { label: 'Hoàn tiền (toàn phần)', value: 'refund_full' },
  { label: 'Hoàn tiền (một phần)', value: 'refund_partial' },
  { label: 'Đảo chiều', value: 'reversal' },
  { label: 'Điều chỉnh', value: 'adjustment' },
  { label: 'Chi trả', value: 'payout' },
  { label: 'Phí', value: 'fee' },
]

// method sẽ gửi theo name string để BE map → xem AdminService
export const methodOptions = [
  { label: 'VNPay', value: 'vnpay' },
  { label: 'PayOS', value: 'payos' },
  { label: 'Tiền mặt', value: 'cash' },
  { label: 'Chuyển khoản ngân hàng', value: 'bank_transfer' },
  { label: 'Mã QR', value: 'qr_code' },
  { label: 'Ngân hàng điện tử', value: 'ebanking' },
  { label: 'Thẻ tín dụng', value: 'credit_card' },
  { label: 'Thẻ ghi nợ', value: 'debit_card' },
  { label: 'MoMo', value: 'momo' },
  { label: 'ZaloPay', value: 'zalopay' },
  { label: 'Nội bộ', value: 'internal' },
]

export function formatAmountVND(value?: number) {
  if (typeof value !== 'number') return '—'
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)
}
