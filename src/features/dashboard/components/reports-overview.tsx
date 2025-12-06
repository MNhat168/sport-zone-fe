import { Link } from '@tanstack/react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useGetReportsQuery } from '@/store/services/reportsApi'
import {
  formatDateTime,
  getReportCategoryLabel,
  getReportStatusMeta,
  reportStatusOptions,
} from '@/features/reports/data/data'

export function ReportsOverviewPanel() {
  const { data, isFetching } = useGetReportsQuery({ limit: 5 })
  const reports = data?.data ?? []

  const statusStats = reportStatusOptions.map((option) => ({
    ...option,
    count: reports.filter((report) => report.status === option.value).length,
  }))

  return (
    <div className='grid gap-4 lg:grid-cols-3'>
      <Card className='lg:col-span-1'>
        <CardHeader>
          <CardTitle>Trạng thái nhanh</CardTitle>
          <CardDescription>5 báo cáo cập nhật gần nhất</CardDescription>
        </CardHeader>
        <CardContent className='space-y-3'>
          {statusStats.map((stat) => {
            const meta = getReportStatusMeta(stat.value)
            return (
              <div key={stat.value} className='flex items-center justify-between text-sm'>
                <span>{meta.label}</span>
                <Badge variant={meta.variant}>{stat.count}</Badge>
              </div>
            )
          })}
        </CardContent>
      </Card>

      <Card className='lg:col-span-2'>
        <CardHeader className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
          <div>
            <CardTitle>Báo cáo mới nhất</CardTitle>
            <CardDescription>Danh sách 5 báo cáo được cập nhật gần nhất</CardDescription>
          </div>
          <Button asChild variant='outline' size='sm'>
            <Link to='/reports'>Xem tất cả</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {isFetching ? (
            <div className='space-y-3'>
              {Array.from({ length: 5 }).map((_, idx) => (
                <Skeleton key={idx} className='h-16 w-full' />
              ))}
            </div>
          ) : reports.length === 0 ? (
            <div className='text-center text-sm text-muted-foreground py-6'>
              Hiện chưa có báo cáo nào.
            </div>
          ) : (
            <ul className='space-y-4'>
              {reports.map((report) => {
                const statusMeta = getReportStatusMeta(report.status)
                return (
                  <li
                    key={report._id}
                    className='flex flex-col gap-1 rounded-lg border px-3 py-2 text-sm'
                  >
                    <div className='flex flex-wrap items-center justify-between gap-2'>
                      <div className='font-medium'>
                        {getReportCategoryLabel(report.category)}
                      </div>
                      <Badge variant={statusMeta.variant}>{statusMeta.label}</Badge>
                    </div>
                    {report.description && (
                      <p className='text-muted-foreground line-clamp-2'>
                        {report.description}
                      </p>
                    )}
                    <div className='text-xs text-muted-foreground'>
                      Cập nhật: {formatDateTime(report.lastActivityAt)}
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

