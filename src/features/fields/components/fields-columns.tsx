import { type ColumnDef } from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { LongText } from '@/components/long-text'
import { type Field } from '../data/schema'
import { DataTableRowActions } from './data-table-row-actions'
import { Star, MapPin, CheckCircle, XCircle } from 'lucide-react'

export const fieldsColumns: ColumnDef<Field>[] = [
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
        accessorKey: 'name',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title='Tên sân' />
        ),
        cell: ({ row }) => {
            const name = row.getValue('name') as string
            return (
                <div className='flex flex-col w-[180px] overflow-hidden'>
                    <LongText className='font-medium truncate'>
                        {name || '—'}
                    </LongText>
                    {row.original.sportType && (
                        <LongText className='text-xs text-muted-foreground truncate'>
                            {row.original.sportType}
                        </LongText>
                    )}
                </div>
            )
        },
        meta: {
            className: 'w-[180px]',
        },
    },
    {
        accessorKey: 'location',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title='Địa điểm' />
        ),
        cell: ({ row }) => {
            const location = row.original.location
            const address = typeof location === 'string'
                ? location
                : location?.address || '—'
            return (
                <div className='flex items-center gap-2 w-[350px] overflow-hidden'>
                    <MapPin className='h-4 w-4 text-muted-foreground flex-shrink-0' />
                    <LongText className='text-sm flex-1 min-w-0 truncate'>{address}</LongText>
                </div>
            )
        },
        meta: {
            className: 'w-[350px]',
        },
    },
    {
        accessorKey: 'basePrice',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title='Giá cơ bản' />
        ),
        cell: ({ row }) => {
            const basePrice = row.getValue('basePrice') as number
            const price = row.original.price

            // Validate price - only use if it's a valid string and contains VND/₫ or looks like a price
            let priceText: string
            if (price && typeof price === 'string') {
                // Check if price string looks valid (contains currency symbol or numbers)
                const isValidPrice = /[\d₫đ]/i.test(price) && price.length < 50 && !price.includes('id.') && !price.includes('Vietat')
                if (isValidPrice) {
                    priceText = price
                } else {
                    // Use basePrice if price is invalid
                    priceText = new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND',
                    }).format(basePrice || 0)
                }
            } else {
                // Use basePrice if price is not available
                priceText = new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                }).format(basePrice || 0)
            }

            return (
                <div className='flex items-center gap-1 w-[120px]'>
                    <LongText className='font-medium truncate'>
                        {priceText}
                    </LongText>
                </div>
            )
        },
        meta: {
            className: 'w-[120px]',
        },
    },
    {
        accessorKey: 'rating',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title='Đánh giá' />
        ),
        cell: ({ row }) => {
            const rating = row.getValue('rating') as number | undefined
            const totalReviews = row.original.totalReviews || 0
            return (
                <div className='flex items-center gap-2 w-[100px]'>
                    <Star className='h-4 w-4 text-yellow-500 fill-yellow-500 flex-shrink-0' />
                    <div className='flex flex-col'>
                        <span className='font-medium'>
                            {rating ? rating.toFixed(1) : '—'}
                        </span>
                        <span className='text-xs text-muted-foreground whitespace-nowrap'>
                            {totalReviews} nhận xét
                        </span>
                    </div>
                </div>
            )
        },
        meta: {
            className: 'w-[100px]',
        },
    },
    {
        accessorKey: 'isActive',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title='Trạng thái' />
        ),
        cell: ({ row }) => {
            const isActive = row.getValue('isActive') as boolean
            return (
                <div className='w-[140px]'>
                    <Badge
                        variant='outline'
                        className={cn(
                            isActive
                                ? 'bg-green-500/10 text-green-600 border-green-500/20'
                                : 'bg-gray-500/10 text-gray-600 border-gray-500/20'
                        )}
                    >
                        {isActive ? 'Hoạt động' : 'Không hoạt động'}
                    </Badge>
                </div>
            )
        },
        meta: {
            className: 'w-[140px]',
        },
    },
    {
        accessorKey: 'isAdminVerify',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title='Xác minh' />
        ),
        cell: ({ row }) => {
            const isVerified = row.getValue('isAdminVerify') as boolean
            const statusText = isVerified ? 'Đã xác minh' : 'Chưa xác minh'
            return (
                <div className='flex items-center gap-2 w-[150px]'>
                    {isVerified ? (
                        <CheckCircle className='h-4 w-4 text-green-600 flex-shrink-0' />
                    ) : (
                        <XCircle className='h-4 w-4 text-gray-400 flex-shrink-0' />
                    )}
                    <LongText className='text-sm text-muted-foreground truncate'>
                        {statusText}
                    </LongText>
                </div>
            )
        },
        meta: {
            className: 'w-[150px]',
        },
    },
    {
        accessorKey: 'createdAt',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title='Ngày tạo' />
        ),
        cell: ({ row }) => {
            const createdAt = row.getValue('createdAt') as string | Date | undefined
            if (!createdAt) return '—'
            const date = typeof createdAt === 'string' ? new Date(createdAt) : createdAt
            if (isNaN(date.getTime())) return '—'
            return date.toLocaleDateString('vi-VN', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            })
        },
    },
    {
        id: 'actions',
        cell: ({ row }) => <DataTableRowActions row={row} />,
    },
]
