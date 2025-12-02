import { type ColumnDef } from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { LongText } from '@/components/long-text'
import { statusColors } from '../data/data'
import { type FieldOwnerProfileApi } from '../data/schema'
import { DataTableRowActions } from './data-table-row-actions'

export const fieldOwnersColumns: ColumnDef<FieldOwnerProfileApi>[] = [
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
    accessorKey: 'userFullName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Owner Name' />
    ),
    cell: ({ row }) => (
      <LongText className='max-w-36 ps-3'>
        {row.original.userFullName}
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
    accessorKey: 'facilityName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Facility Name' />
    ),
    cell: ({ row }) => (
      <LongText className='max-w-36'>{row.getValue('facilityName')}</LongText>
    ),
    meta: { className: 'w-36' },
  },
  {
    accessorKey: 'userEmail',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Email' />
    ),
    cell: ({ row }) => (
      <div className='w-fit ps-2 text-nowrap'>
        {row.original.userEmail}
      </div>
    ),
  },
  {
    accessorKey: 'contactPhone',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Phone' />
    ),
    cell: ({ row }) => <div>{row.original.contactPhone || '-'}</div>,
    enableSorting: false,
  },
  {
    accessorKey: 'isVerified',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Verified' />
    ),
    cell: ({ row }) => {
      const isVerified = row.getValue('isVerified') as boolean
      return (
        <Badge
          variant='outline'
          className={cn(
            isVerified
              ? 'bg-green-500/10 text-green-600 dark:text-green-500 border-green-500/20'
              : 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-500 border-yellow-500/20'
          )}
        >
          {isVerified ? 'Verified' : 'Pending'}
        </Badge>
      )
    },
    filterFn: (row, id, value) => {
      const isVerified = row.getValue(id) as boolean
      if (value.includes('verified')) return isVerified
      if (value.includes('pending')) return !isVerified
      return true
    },
    enableSorting: false,
  },
  {
    accessorKey: 'rating',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Rating' />
    ),
    cell: ({ row }) => {
      const rating = row.original.rating
      const totalReviews = row.original.totalReviews
      return (
        <div className='flex items-center gap-2'>
          <span className='font-medium'>{rating.toFixed(1)}</span>
          <span className='text-muted-foreground text-sm'>
            ({totalReviews} reviews)
          </span>
        </div>
      )
    },
    enableSorting: false,
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Created' />
    ),
    cell: ({ row }) => {
      const rawDate = row.getValue('createdAt') as
        | Date
        | string
        | number
        | null
        | undefined
      const date =
        rawDate instanceof Date
          ? rawDate
          : rawDate
            ? new Date(rawDate)
            : null

      return (
        <div className='text-sm'>
          {date
            ? date.toLocaleDateString('en-US', {
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
    cell: DataTableRowActions,
  },
]

