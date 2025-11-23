import { type ColumnDef } from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { LongText } from '@/components/long-text'
import { statusColors, ownerTypes } from '../data/data'
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
    accessorKey: 'userInfo.fullName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Owner Name' />
    ),
    cell: ({ row }) => (
      <LongText className='max-w-36 ps-3'>
        {row.original.userInfo.fullName}
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
    accessorKey: 'fieldInfo.name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Facility Name' />
    ),
    cell: ({ row }) => (
      <LongText className='max-w-36'>{row.original.fieldInfo.name}</LongText>
    ),
    meta: { className: 'w-36' },
  },
  {
    accessorKey: 'userInfo.email',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Email' />
    ),
    cell: ({ row }) => (
      <div className='w-fit ps-2 text-nowrap'>
        {row.original.userInfo.email}
      </div>
    ),
  },
  {
    accessorKey: 'userInfo.phone',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Phone' />
    ),
    cell: ({ row }) => <div>{row.original.userInfo.phone}</div>,
    enableSorting: false,
  },
  {
    accessorKey: 'ownerType',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Owner Type' />
    ),
    cell: ({ row }) => {
      const ownerType = ownerTypes.find(
        (type) => type.value === row.getValue('ownerType')
      )
      return (
        <div className='text-sm capitalize'>
          {ownerType?.label || row.getValue('ownerType')}
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
    enableSorting: false,
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Status' />
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
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
    enableHiding: false,
    enableSorting: false,
  },
  {
    accessorKey: 'submittedAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Submitted' />
    ),
    cell: ({ row }) => {
      const date = row.getValue('submittedAt') as Date
      return (
        <div className='text-sm'>
          {date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
        </div>
      )
    },
  },
  {
    id: 'actions',
    cell: DataTableRowActions,
  },
]

