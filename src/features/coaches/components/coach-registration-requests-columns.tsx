import { type ColumnDef } from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { LongText } from '@/components/long-text'
import { statusColors } from '../data/data'
import { type CoachRegistrationRequest } from '../data/schema'
import { DataTableRowActions } from './data-table-row-actions'

export const coachRegistrationRequestsColumns: ColumnDef<CoachRegistrationRequest>[] = [
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
            <DataTableColumnHeader column={column} title='Applicant Name' />
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
        id: 'sports',
        accessorFn: (row) => row.sports.join(', '),
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title='Sports' />
        ),
        cell: ({ row }) => (
            <div className='flex flex-wrap gap-1 max-w-48'>
                {row.original.sports.map((sport, idx) => (
                    <Badge key={idx} variant='secondary' className='text-xs'>
                        {sport}
                    </Badge>
                ))}
            </div>
        ),
        filterFn: (row, id, value) => {
            const sports = row.original.sports
            return Array.isArray(value) && value.length > 0
                ? value.some(v => sports.includes(v))
                : true
        },
        enableSorting: false,
    },
    {
        id: 'certification',
        accessorFn: (row) => row.certification,
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title='Certification' />
        ),
        cell: ({ row }) => (
            <LongText className='max-w-40'>{row.original.certification}</LongText>
        ),
        enableSorting: false,
    },
    {
        id: 'hourlyRate',
        accessorFn: (row) => row.hourlyRate,
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title='Hourly Rate' />
        ),
        cell: ({ row }) => (
            <div className='text-sm font-medium'>
                {new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                }).format(row.original.hourlyRate)}
            </div>
        ),
    },
    {
        id: 'location',
        accessorFn: (row) => row.locationAddress,
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title='Location' />
        ),
        cell: ({ row }) => (
            <LongText className='max-w-48'>{row.original.locationAddress}</LongText>
        ),
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
        filterFn: (row, id, value) =>
            Array.isArray(value) ? value.includes(row.getValue(id)) : true,
        enableHiding: false,
        enableSorting: false,
    },
    {
        accessorKey: 'submittedAt',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title='Submitted' />
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
        cell: ({ row }) => <DataTableRowActions row={row} />,
    },
]
