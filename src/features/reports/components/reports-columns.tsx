import { type ColumnDef } from '@tanstack/react-table'
import { ArrowUpRight } from 'lucide-react'
import { DataTableColumnHeader } from '@/components/data-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { Report } from '@/store/services/reportsApi'
import { formatDateTime, getReportCategoryLabel, getReportStatusMeta } from '../data/data'

type CreateReportsColumnsOptions = {
  onView?: (report: Report) => void
}

export function createReportsColumns(
  options: CreateReportsColumnsOptions = {}
): ColumnDef<Report>[] {
  const { onView } = options

  return [
    {
      accessorKey: 'category',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Loại báo cáo' />
      ),
      cell: ({ row }) => {
        const report = row.original
        return (
          <div className='flex flex-col gap-1'>
            <span className='font-medium'>
              {getReportCategoryLabel(report.category)}
            </span>
            {report.subject ? (
              <span className='text-muted-foreground text-sm'>
                {report.subject}
              </span>
            ) : report.description ? (
              <span className='text-muted-foreground text-xs line-clamp-2'>
                {report.description}
              </span>
            ) : (
              <span className='text-muted-foreground text-xs'>
                Không có mô tả
              </span>
            )}
          </div>
        )
      },
      enableSorting: false,
      meta: { className: 'min-w-[220px]' },
    },
    {
      accessorKey: 'status',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Trạng thái' />
      ),
      cell: ({ row }) => {
        const meta = getReportStatusMeta(row.original.status)
        return (
          <Badge variant={meta.variant} className='capitalize'>
            {meta.label}
          </Badge>
        )
      },
      meta: { className: 'w-[140px]' },
    },
    {
      id: 'reporter',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Người báo cáo' />
      ),
      cell: ({ row }) => {
        const reporter = row.original.reporter
        if (!reporter) return <span className='text-muted-foreground'>—</span>
        if (typeof reporter === 'string') {
          return <span className='font-mono text-xs'>{reporter}</span>
        }
        const data = reporter as Record<string, unknown>
        const name =
          (data.fullName as string | undefined) ||
          (data.email as string | undefined) ||
          (data.phoneNumber as string | undefined)
        return (
          <div className='flex flex-col text-sm'>
            <span className='font-medium'>{name ?? '—'}</span>
            {data.email && typeof data.email === 'string' && (
              <span className='text-muted-foreground text-xs'>
                {data.email}
              </span>
            )}
          </div>
        )
      },
      enableSorting: false,
      meta: { className: 'min-w-[180px]' },
    },
    {
      id: 'field',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Sân' />
      ),
      cell: ({ row }) => {
        const field = row.original.field
        if (!field) return <span className='text-muted-foreground'>—</span>
        if (typeof field === 'string') {
          return <span className='font-mono text-xs'>{field}</span>
        }
        const fieldData = field as Record<string, unknown>
        return (
          <div className='flex flex-col text-sm'>
            <span>{String(fieldData.name ?? 'Không rõ')}</span>
            {fieldData.address && typeof fieldData.address === 'string' && (
              <span className='text-muted-foreground text-xs'>
                {fieldData.address}
              </span>
            )}
          </div>
        )
      },
      enableSorting: false,
      meta: { className: 'min-w-[180px]' },
    },
    {
      accessorKey: 'lastActivityAt',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Hoạt động cuối' />
      ),
      cell: ({ row }) => (
        <div className='text-sm font-medium'>
          {formatDateTime(row.original.lastActivityAt)}
        </div>
      ),
      meta: { className: 'min-w-[150px]' },
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Tạo lúc' />
      ),
      cell: ({ row }) => (
        <div className='text-sm'>{formatDateTime(row.original.createdAt)}</div>
      ),
      meta: { className: 'min-w-[150px]' },
    },
    {
      id: 'attachments',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Tệp đính kèm' />
      ),
      cell: ({ row }) => {
        const count = row.original.initialAttachments?.length ?? 0
        return <span>{count > 0 ? `${count} tệp` : '—'}</span>
      },
      enableSorting: false,
      meta: { className: 'w-[120px]' },
    },
    {
      id: 'actions',
      header: () => <span className='sr-only'>Thao tác</span>,
      cell: ({ row }) => (
        <Button
          variant='ghost'
          size='sm'
          onClick={() => onView?.(row.original)}
          className='text-primary hover:text-primary flex items-center gap-1'
        >
          Xem
          <ArrowUpRight className='size-4' />
        </Button>
      ),
      enableSorting: false,
      enableHiding: false,
      meta: { className: 'w-[110px] text-right' },
    },
  ]
}

