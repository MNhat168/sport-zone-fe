import { type ColumnDef } from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { LongText } from '@/components/long-text'
import { statusColors } from '../data/data'
import { type FieldOwnerRequest } from '../data/schema'
import { DataTableRowActions } from './data-table-row-actions'

export const fieldOwnersRequestsColumns: ColumnDef<FieldOwnerRequest>[] = [
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
    id: 'applicantName',
    accessorFn: (row) => row.personalInfo.fullName,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Tên người đăng ký' />
    ),
    cell: ({ row }) => (
      <LongText className='max-w-36 ps-3'>
        {row.original.personalInfo.fullName}
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
    id: 'applicantIdNumber',
    accessorFn: (row) => row.personalInfo.idNumber,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Số CCCD/CMND' />
    ),
    cell: ({ row }) => (
      <div className='w-fit ps-2 text-nowrap'>
        {row.original.personalInfo.idNumber}
      </div>
    ),
  },
  {
    id: 'applicantAddress',
    accessorFn: (row) => row.personalInfo.address,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Địa chỉ' />
    ),
    cell: ({ row }) => (
      <LongText className='max-w-52'>{row.original.personalInfo.address}</LongText>
    ),
    enableSorting: false,
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Trạng thái' />
    ),
    cell: ({ row }) => {
      const status = row.getValue('status') as string
      const badgeColor = statusColors.get(status)
      return (
        <Badge variant='outline' className={cn('capitalize', badgeColor)}>
          {status}
        </Badge>
      )
    },
    filterFn: (row, id, value) =>
      Array.isArray(value) ? value.includes(row.getValue(id)) : true,
    enableHiding: false,
    enableSorting: false,
  },
  {
    accessorKey: 'submittedAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Nộp lúc' />
    ),
    cell: ({ row }) => {
      const rawDate = row.getValue('submittedAt') as
        | Date
        | string
        | number
        | null
      const date =
        rawDate instanceof Date ? rawDate : rawDate ? new Date(rawDate) : null

      return (
        <div className='text-sm'>
          {date
            ? date.toLocaleDateString('vi-VN', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })
            : '—'}
        </div>
      )
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
]

