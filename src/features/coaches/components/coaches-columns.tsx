import { type ColumnDef } from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { LongText } from '@/components/long-text'
import { type CoachProfile } from '../data/schema'
import { DataTableRowActions } from './data-table-row-actions'

export const coachesColumns: ColumnDef<CoachProfile>[] = [
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
        accessorKey: 'fullName',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title='Tên HLV' />
        ),
        cell: ({ row }) => (
            <div className='flex items-center gap-3 ps-3'>
                {row.original.avatarUrl ? (
                    <img
                        src={row.original.avatarUrl}
                        alt={row.original.fullName}
                        className='w-8 h-8 rounded-full object-cover'
                    />
                ) : (
                    <div className='w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center'>
                        <span className='text-sm font-semibold text-primary'>
                            {row.original.fullName.charAt(0)}
                        </span>
                    </div>
                )}
                <LongText className='max-w-36'>
                    {row.original.fullName}
                </LongText>
            </div>
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
        accessorKey: 'email',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title='Email' />
        ),
        cell: ({ row }) => (
            <div className='w-fit ps-2 text-nowrap'>
                {row.original.email}
            </div>
        ),
    },
    {
        accessorKey: 'phone',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title='Số điện thoại' />
        ),
        cell: ({ row }) => <div>{row.original.phone || '-'}</div>,
        enableSorting: false,
    },
    {
        accessorKey: 'sports',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title='Môn thể thao' />
        ),
        cell: ({ row }) => {
            const sports = row.original.sports
            return (
                <div className='flex flex-wrap gap-1'>
                    {sports.slice(0, 2).map((sport, idx) => (
                        <Badge key={idx} variant='outline' className='text-xs'>
                            {sport}
                        </Badge>
                    ))}
                    {sports.length > 2 && (
                        <Badge variant='outline' className='text-xs'>
                            +{sports.length - 2}
                        </Badge>
                    )}
                </div>
            )
        },
        enableSorting: false,
    },
    {
        accessorKey: 'hourlyRate',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title='Giá/giờ' />
        ),
        cell: ({ row }) => {
            const rate = row.original.hourlyRate
            return <div>{rate.toLocaleString('vi-VN')} VNĐ</div>
        },
        enableSorting: false,
    },
    {
        accessorKey: 'rating',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title='Đánh giá' />
        ),
        cell: ({ row }) => {
            const rating = row.original.rating
            const totalReviews = row.original.totalReviews
            return (
                <div className='flex items-center gap-2'>
                    <span className='font-medium'>{rating.toFixed(1)}</span>
                    <span className='text-muted-foreground text-sm'>
                        ({totalReviews})
                    </span>
                </div>
            )
        },
        enableSorting: false,
    },
    {
        accessorKey: 'completedSessions',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title='Buổi tập' />
        ),
        cell: ({ row }) => <div>{row.original.completedSessions}</div>,
        enableSorting: false,
    },
    {
        accessorKey: 'bankVerified',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title='Xác minh' />
        ),
        cell: ({ row }) => {
            const isVerified = row.getValue('bankVerified') as boolean
            return (
                <Badge
                    variant='outline'
                    className={cn(
                        isVerified
                            ? 'bg-green-500/10 text-green-600 dark:text-green-500 border-green-500/20'
                            : 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-500 border-yellow-500/20'
                    )}
                >
                    {isVerified ? 'Đã xác minh' : 'Đang chờ'}
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
        accessorKey: 'createdAt',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title='Tạo ngày' />
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
        cell: ({ row }) => <DataTableRowActions row={row as any} />,
    },
]
