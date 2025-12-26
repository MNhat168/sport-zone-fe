import { type ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from '@/components/data-table'
import { Badge } from '@/components/ui/badge'
import { type OverdueAccount } from '../../../types/billing-type'
import { DataTableRowActions } from './billing-row-actions'

const formatAmountVND = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount)
}

const getSubscriptionStatusBadge = (status: string) => {
  const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
    active: { label: 'Đang hoạt động', variant: 'default' },
    grace_period: { label: 'Ân hạn', variant: 'secondary' },
    suspended: { label: 'Tạm ngưng', variant: 'destructive' },
  }
  const statusInfo = statusMap[status] || { label: status, variant: 'outline' }
  return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
}

const getInvoiceStatusBadge = (status: string) => {
  const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
    pending: { label: 'Đang chờ', variant: 'secondary' },
    overdue: { label: 'Quá hạn', variant: 'destructive' },
  }
  const statusInfo = statusMap[status] || { label: status, variant: 'outline' }
  return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
}

export const billingColumns: ColumnDef<OverdueAccount>[] = [
  {
    accessorKey: 'email',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Email' />
    ),
    cell: ({ row }) => (
      <div className='font-medium'>{row.original.email}</div>
    ),
    enableSorting: true,
    meta: { className: 'min-w-[200px]' },
  },
  {
    accessorKey: 'fullName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Họ và tên' />
    ),
    cell: ({ row }) => <div>{row.original.fullName || '—'}</div>,
    enableSorting: true,
    meta: { className: 'min-w-[150px]' },
  },
  {
    accessorKey: 'phone',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Số điện thoại' />
    ),
    cell: ({ row }) => <div>{row.original.phone || '—'}</div>,
    enableSorting: false,
    meta: { className: 'w-[120px]' },
  },
  {
    accessorKey: 'subscriptionStatus',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Trạng thái đăng ký' />
    ),
    cell: ({ row }) => getSubscriptionStatusBadge(row.original.subscriptionStatus),
    enableSorting: true,
    meta: { className: 'w-[140px]' },
  },
  {
    id: 'invoice',
    accessorFn: (row) => `${row.month}/${row.year}`,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Hóa đơn' />
    ),
    cell: ({ row }) => (
      <div className='flex flex-col'>
        <span className='font-medium'>{row.original.month}/{row.original.year}</span>
        <span className='text-muted-foreground text-xs'>
          {formatAmountVND(row.original.amount)}
        </span>
      </div>
    ),
    enableSorting: true,
    meta: { className: 'w-[120px]' },
  },
  {
    accessorKey: 'dueDate',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Hạn thanh toán' />
    ),
    cell: ({ row }) => {
      const dueDate = new Date(row.original.dueDate)
      return <div>{dueDate.toLocaleDateString('vi-VN')}</div>
    },
    enableSorting: true,
    meta: { className: 'w-[120px]' },
  },
  {
    accessorKey: 'daysOverdue',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Số ngày quá hạn' />
    ),
    cell: ({ row }) => {
      const days = row.original.daysOverdue
      return (
        <div className={days > 0 ? 'font-semibold text-destructive' : ''}>
          {days > 0 ? `${days} ngày` : '—'}
        </div>
      )
    },
    enableSorting: true,
    meta: { className: 'w-[120px]' },
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Trạng thái hóa đơn' />
    ),
    cell: ({ row }) => getInvoiceStatusBadge(row.original.status),
    enableSorting: true,
    meta: { className: 'w-[120px]' },
  },
  {
    id: 'actions',
    cell: ({ row }) => <DataTableRowActions row={row} />,
    enableSorting: false,
    enableHiding: false,
    meta: { className: 'w-[50px]' },
  },
]

