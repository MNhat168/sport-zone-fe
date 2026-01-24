import { type ColumnDef } from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { LongText } from '@/components/long-text'
import { type WithdrawalRequest } from '../data/schema'
import { DataTableRowActions } from './data-table-row-actions'

const statusColors = new Map([
  ['pending', 'bg-yellow-100 text-yellow-700 border-yellow-300'],
  ['approved', 'bg-green-100 text-green-700 border-green-300'],
  ['rejected', 'bg-red-100 text-red-700 border-red-300'],
])

const formatVND = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount)
}

const formatDate = (date: Date | string) => {
  try {
    const d = new Date(date)
    const day = d.getDate().toString().padStart(2, '0')
    const month = (d.getMonth() + 1).toString().padStart(2, '0')
    const year = d.getFullYear()
    const hours = d.getHours().toString().padStart(2, '0')
    const minutes = d.getMinutes().toString().padStart(2, '0')
    return `${day}/${month}/${year} ${hours}:${minutes}`
  } catch {
    return String(date)
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'pending':
      return 'Đang chờ duyệt'
    case 'approved':
      return 'Đã duyệt'
    case 'rejected':
      return 'Đã từ chối'
    default:
      return status
  }
}

export const withdrawalsColumns: ColumnDef<WithdrawalRequest>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label='Select all'
        className='translate-y-[2px]'
      />
    ),
    meta: {
      className: cn('max-md:sticky start-0 z-10 rounded-tl-[inherit]'),
    },
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label='Select row'
        className='translate-y-[2px]'
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: 'userName',
    accessorFn: (row) => row.user?.fullName || 'N/A',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Người yêu cầu' />
    ),
    cell: ({ row }) => (
      <LongText className='max-w-36 ps-3'>
        {row.original.user?.fullName || 'N/A'}
      </LongText>
    ),
    meta: {
      className: cn(
        'drop-shadow-[0_1px_2px_rgb(0_0_0_/_0.1)] dark:drop-shadow-[0_1px_2px_rgb(255_255_255_/_0.1)]',
        'ps-0.5 max-md:sticky start-6 @4xl/content:table-cell @4xl/content:drop-shadow-none'
      ),
    },
    enableHiding: false,
  },
  {
    id: 'userRole',
    accessorKey: 'userRole',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Vai trò' />
    ),
    cell: ({ row }) => {
      const role = row.getValue('userRole') as string
      return (
        <Badge variant='outline' className='capitalize'>
          {role === 'field_owner' ? 'Chủ sân' : 'Huấn luyện viên'}
        </Badge>
      )
    },
    filterFn: (row, id, value) =>
      Array.isArray(value) ? value.includes(row.getValue(id)) : true,
  },
  {
    id: 'amount',
    accessorKey: 'amount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Số tiền' />
    ),
    cell: ({ row }) => {
      const amount = row.getValue('amount') as number
      return (
        <div className='font-semibold text-green-600'>
          {formatVND(amount)}
        </div>
      )
    },
  },
  {
    id: 'bankAccount',
    accessorKey: 'bankAccount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Tài khoản ngân hàng' />
    ),
    cell: ({ row }) => {
      const account = row.original.bankAccount
      const bankName = row.original.bankName
      return (
        <div className='text-sm'>
          {account || 'N/A'}
          {bankName && <div className='text-xs text-gray-500'>{bankName}</div>}
        </div>
      )
    },
    enableSorting: false,
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Trạng thái' />
    ),
    cell: ({ row }) => {
      const status = row.getValue('status') as string
      const badgeColor = statusColors.get(status) || 'bg-gray-100 text-gray-700'
      return (
        <Badge variant='outline' className={cn('capitalize', badgeColor)}>
          {getStatusText(status)}
        </Badge>
      )
    },
    filterFn: (row, id, value) =>
      Array.isArray(value) ? value.includes(row.getValue(id)) : true,
    enableHiding: false,
    enableSorting: false,
  },
  {
    id: 'createdAt',
    accessorKey: 'createdAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Ngày tạo' />
    ),
    cell: ({ row }) => {
      const date = row.getValue('createdAt') as Date | string
      return <div className='text-sm'>{formatDate(date)}</div>
    },
    sortingFn: (rowA, rowB) => {
      const dateA = new Date(rowA.original.createdAt).getTime()
      const dateB = new Date(rowB.original.createdAt).getTime()
      return dateA - dateB
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => <DataTableRowActions row={row} />,
    enableHiding: false,
    enableSorting: false,
  },
]
