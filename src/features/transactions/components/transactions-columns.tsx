import { type ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from '@/components/data-table'
import { type Transaction } from '../data/schema'
import { formatAmountVND } from '../data/data'

export const transactionsColumns: ColumnDef<Transaction>[] = [
  {
    id: 'id',
    accessorKey: '_id',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Mã' />
    ),
    cell: ({ row }) => (
      <div className='font-mono text-xs'>{row.original._id}</div>
    ),
    enableSorting: false,
    enableHiding: true,
    meta: { className: 'w-[220px]' },
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Tạo lúc' />
    ),
    cell: ({ row }) => {
      const v = row.original.createdAt
      return <div>{v ? new Date(v).toLocaleString('vi-VN') : '—'}</div>
    },
    enableSorting: true,
    meta: { className: 'min-w-[160px]' },
  },
  {
    accessorKey: 'amount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Số tiền' />
    ),
    cell: ({ row }) => <div className='text-right'>{formatAmountVND(row.original.amount)}</div>,
    enableSorting: true,
    meta: { className: 'text-right w-[140px]' },
  },
  {
    accessorKey: 'method',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Phương thức' />
    ),
    cell: ({ row }) => {
      const map: Record<number, string> = {
        1: 'Tiền mặt',
        2: 'Ngân hàng điện tử',
        3: 'Thẻ tín dụng',
        4: 'Thẻ ghi nợ',
        5: 'MoMo',
        6: 'ZaloPay',
        7: 'VNPay',
        8: 'Chuyển khoản',
        9: 'Mã QR',
        10: 'Nội bộ',
        11: 'PayOS',
      }
      const m = row.original.method as unknown as number | undefined
      return <div>{m ? map[m] ?? m : '—'}</div>
    },
    enableSorting: true,
    meta: { className: 'w-[140px]' },
  },
  {
    accessorKey: 'type',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Loại' />
    ),
    cell: ({ row }) => {
      const map: Record<string, string> = {
        payment: 'Thanh toán',
        refund_full: 'Hoàn tiền (toàn phần)',
        refund_partial: 'Hoàn tiền (một phần)',
        reversal: 'Đảo chiều',
        adjustment: 'Điều chỉnh',
        payout: 'Chi trả',
        fee: 'Phí',
      }
      const t = String(row.original.type)
      return <div className='capitalize'>{map[t] ?? t.replace('_', ' ')}</div>
    },
    enableSorting: true,
    meta: { className: 'w-[140px]' },
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Trạng thái' />
    ),
    cell: ({ row }) => {
      const map: Record<string, string> = {
        pending: 'Đang chờ',
        processing: 'Đang xử lý',
        succeeded: 'Thành công',
        failed: 'Thất bại',
        cancelled: 'Đã hủy',
        refunded: 'Đã hoàn tiền',
      }
      const s = String(row.original.status)
      return <div className='capitalize'>{map[s] ?? s}</div>
    },
    enableSorting: true,
    meta: { className: 'w-[120px]' },
  },
  {
    id: 'booking',
    accessorFn: (row) => {
      const booking = row.booking
      if (typeof booking === 'string') return booking
      const b = booking as any
      if (!b) return ''
      // Try to get field name
      const field = typeof b.field === 'string' ? null : b.field
      const fieldName = field?.name ?? ''
      const date = b.date ? new Date(b.date).toLocaleDateString('vi-VN') : ''
      const time = b.startTime && b.endTime ? `${b.startTime} - ${b.endTime}` : b.startTime || ''
      return fieldName ? `${fieldName}${date ? ` - ${date}` : ''}${time ? ` ${time}` : ''}` : b._id ?? ''
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Đặt sân' />
    ),
    cell: ({ row }) => {
      const booking = row.original.booking
      if (typeof booking === 'string') {
        // Nếu BE chỉ trả string (fallback cũ), vẫn hiện ra để tránh mất thông tin
        return <div className='text-xs'>{booking}</div>
      }
      const b = booking as any
      if (!b) return <div>—</div>

      const field = typeof b.field === 'string' ? null : b.field
      const fieldName = field?.name
      const date = b.date ? new Date(b.date).toLocaleDateString('vi-VN') : null
      const time = b.startTime && b.endTime ? `${b.startTime} - ${b.endTime}` : b.startTime || null

      if (fieldName || date || time) {
        return (
          <div className='flex flex-col gap-0.5'>
            {fieldName && <span className='font-medium'>{fieldName}</span>}
            {(date || time) && (
              <span className='text-muted-foreground text-xs'>
                {date && time ? `${date} ${time}` : date || time}
              </span>
            )}
          </div>
        )
      }

      // Nếu không có tên field / date / time, chỉ hiển thị placeholder
      return <div>—</div>
    },
    enableSorting: false,
    meta: { className: 'min-w-[220px]' },
  },
  {
    id: 'user',
    accessorFn: (row) => (typeof row.user === 'string' ? row.user : (row.user as any)?.email ?? (row.user as any)?.fullName ?? ''),
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Người dùng' />
    ),
    cell: ({ row }) => {
      const u = row.original.user as any
      return (
        <div>
          {typeof u === 'string' ? (
            <span className='font-mono text-xs'>{u}</span>
          ) : (
            <div className='flex flex-col'>
              <span>{u?.fullName ?? '—'}</span>
              <span className='text-muted-foreground text-xs'>{u?.email ?? ''}</span>
            </div>
          )}
        </div>
      )
    },
    enableSorting: false,
    meta: { className: 'min-w-[200px]' },
  },
  {
    accessorKey: 'externalTransactionId',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Mã giao dịch ngoài' />
    ),
    cell: ({ row }) => <div className='font-mono text-xs'>{row.original.externalTransactionId ?? '—'}</div>,
    enableSorting: false,
    meta: { className: 'w-[220px]' },
  },
]
