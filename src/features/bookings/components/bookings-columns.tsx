import { type ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from '@/components/data-table'
import { type Booking } from '../data/schema'
import { bookingStatuses, bookingTypes, paymentStatuses, approvalStatuses, formatAmountVND } from '../data/data'

export const bookingsColumns: ColumnDef<Booking>[] = [
  {
    id: 'id',
    accessorKey: '_id',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='ID' />
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
      <DataTableColumnHeader column={column} title='Created At' />
    ),
    cell: ({ row }) => {
      const v = row.original.createdAt
      return <div>{v ? new Date(v).toLocaleString() : '—'}</div>
    },
    enableSorting: true,
    meta: { className: 'min-w-[160px]' },
  },
  {
    accessorKey: 'date',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Date' />
    ),
    cell: ({ row }) => {
      const date = row.original.date
      return <div>{date ? new Date(date).toLocaleDateString('vi-VN') : '—'}</div>
    },
    enableSorting: true,
    meta: { className: 'min-w-[120px]' },
  },
  {
    id: 'time',
    accessorFn: (row) => `${row.startTime} - ${row.endTime}`,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Time' />
    ),
    cell: ({ row }) => {
      const { startTime, endTime } = row.original
      return <div>{startTime && endTime ? `${startTime} - ${endTime}` : '—'}</div>
    },
    enableSorting: false,
    meta: { className: 'w-[140px]' },
  },
  {
    id: 'field',
    accessorFn: (row) => {
      const field = typeof row.field === 'string' ? null : row.field
      return field?.name ?? ''
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Field' />
    ),
    cell: ({ row }) => {
      const field = typeof row.original.field === 'string' ? null : row.original.field
      const fieldName = field?.name ?? '—'
      const sportType = field?.sportType
      return (
        <div className='flex flex-col gap-0.5'>
          <span className='font-medium'>{fieldName}</span>
          {sportType && <span className='text-muted-foreground text-xs'>{sportType}</span>}
        </div>
      )
    },
    enableSorting: false,
    meta: { className: 'min-w-[180px]' },
  },
  {
    id: 'court',
    accessorFn: (row) => {
      const court = typeof (row as any).court === 'string' ? null : (row as any).court
      return court?.name ?? (court?.courtNumber ? `Court ${court.courtNumber}` : '')
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Court' />
    ),
    cell: ({ row }) => {
      const court = typeof (row.original as any).court === 'string' ? null : (row.original as any).court
      if (!court) return <div>—</div>
      return (
        <div className='flex flex-col gap-0.5'>
          <span className='font-medium'>{court.name ?? (court.courtNumber ? `Court ${court.courtNumber}` : '—')}</span>
          {court.courtNumber !== undefined && (
            <span className='text-muted-foreground text-xs'>#{court.courtNumber}</span>
          )}
        </div>
      )
    },
    enableSorting: false,
    meta: { className: 'min-w-[140px]' },
  },
  {
    id: 'user',
    accessorFn: (row) => (typeof row.user === 'string' ? row.user : (row.user as any)?.email ?? (row.user as any)?.fullName ?? ''),
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='User' />
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
    accessorKey: 'type',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Type' />
    ),
    cell: ({ row }) => {
      const type = row.original.type
      const typeLabel = bookingTypes.find(t => t.value === type)?.label ?? type
      return <div className='capitalize'>{typeLabel}</div>
    },
    enableSorting: true,
    meta: { className: 'w-[100px]' },
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Status' />
    ),
    cell: ({ row }) => {
      const status = row.original.status
      const statusLabel = bookingStatuses.find(s => s.value === status)?.label ?? status
      return <div className='capitalize'>{statusLabel}</div>
    },
    enableSorting: true,
    meta: { className: 'w-[120px]' },
  },
  {
    accessorKey: 'paymentStatus',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Payment' />
    ),
    cell: ({ row }) => {
      const status = row.original.paymentStatus
      if (!status) return <div>—</div>
      const statusLabel = paymentStatuses.find(s => s.value === status)?.label ?? status
      return <div className='capitalize'>{statusLabel}</div>
    },
    enableSorting: false,
    meta: { className: 'w-[120px]' },
  },
  {
    accessorKey: 'approvalStatus',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Approval' />
    ),
    cell: ({ row }) => {
      const status = row.original.approvalStatus
      if (!status) return <div>—</div>
      const statusLabel = approvalStatuses.find(s => s.value === status)?.label ?? status
      return <div className='capitalize'>{statusLabel}</div>
    },
    enableSorting: false,
    meta: { className: 'w-[120px]' },
  },
  {
    accessorKey: 'bookingAmount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Amount' />
    ),
    cell: ({ row }) => {
      const amount = row.original.bookingAmount
      const platformFee = row.original.platformFee || 0
      const total = amount + platformFee
      return (
        <div className='flex flex-col text-right'>
          <span>{formatAmountVND(total)}</span>
          {platformFee > 0 && (
            <span className='text-muted-foreground text-xs'>
              (Fee: {formatAmountVND(platformFee)})
            </span>
          )}
        </div>
      )
    },
    enableSorting: true,
    meta: { className: 'text-right w-[160px]' },
  },
  {
    id: 'coach',
    accessorFn: (row) => {
      const coach = typeof row.requestedCoach === 'string' ? null : row.requestedCoach
      return coach?.fullName ?? ''
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Coach' />
    ),
    cell: ({ row }) => {
      const coach = typeof row.original.requestedCoach === 'string' ? null : row.original.requestedCoach
      return <div>{coach?.fullName ?? '—'}</div>
    },
    enableSorting: false,
    meta: { className: 'w-[150px]' },
  },
  {
    accessorKey: 'note',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Note' />
    ),
    cell: ({ row }) => {
      const note = row.original.note
      return <div className='max-w-[200px] truncate'>{note || '—'}</div>
    },
    enableSorting: false,
    meta: { className: 'max-w-[200px]' },
  },
]

