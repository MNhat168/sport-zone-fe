import { useMemo } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useGetBookingMonthlyStatsQuery } from '@/store/services/dashboardApi'

const monthNames = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]

interface BookingStatsCardsProps {
  year: number
}

export function BookingStatsCards({ year }: BookingStatsCardsProps) {
  const { data, isLoading } = useGetBookingMonthlyStatsQuery({ year })

  const stats = useMemo(() => {
    if (!data || isLoading) {
      return {
        totalYear: 0,
        currentMonth: 0,
        averagePerMonth: 0,
        peakMonth: { name: 'N/A', count: 0 },
      }
    }

    // Handle different response formats
    let statsArray: Array<{
      year: number
      month: number
      type: string
      count: number
    }> = []

    if (Array.isArray(data)) {
      statsArray = data as Array<{
        year: number
        month: number
        type: string
        count: number
      }>
    } else if (
      data &&
      typeof data === 'object' &&
      'data' in data
    ) {
      const dataValue = (data as { data: unknown }).data
      if (Array.isArray(dataValue)) {
        statsArray = dataValue as Array<{
          year: number
          month: number
          type: string
          count: number
        }>
      }
    }

    // Calculate total for the year
    const totalYear = statsArray.reduce((sum, stat) => sum + stat.count, 0)

    // Get current month
    const currentMonthIndex = new Date().getMonth() + 1 // 1-indexed
    const currentMonthStat = statsArray.find(
      (stat) => stat.month === currentMonthIndex && stat.year === year
    )
    const currentMonth = currentMonthStat?.count || 0

    // Calculate average per month
    const averagePerMonth =
      statsArray.length > 0 ? Math.round(totalYear / 12) : 0

    // Find peak month
    const peakStat = statsArray.reduce(
      (max, stat) => (stat.count > max.count ? stat : max),
      statsArray[0] || { month: 0, count: 0 }
    )
    const peakMonth = {
      name: peakStat.month > 0 ? monthNames[peakStat.month - 1] : 'N/A',
      count: peakStat.count || 0,
    }

    return {
      totalYear,
      currentMonth,
      averagePerMonth,
      peakMonth,
    }
  }, [data, isLoading, year])

  if (isLoading) {
    return (
      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Loading...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>-</div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>
            Total Bookings (Year)
          </CardTitle>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth='2'
            className='text-muted-foreground h-4 w-4'
          >
            <rect width='20' height='14' x='2' y='5' rx='2' />
            <path d='M2 10h20' />
          </svg>
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>{stats.totalYear.toLocaleString()}</div>
          <p className='text-muted-foreground text-xs'>
            Total bookings in {year}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Current Month</CardTitle>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth='2'
            className='text-muted-foreground h-4 w-4'
          >
            <rect width='18' height='18' x='3' y='4' rx='2' ry='2' />
            <line x1='16' x2='16' y1='2' y2='6' />
            <line x1='8' x2='8' y1='2' y2='6' />
            <line x1='3' x2='21' y1='10' y2='10' />
          </svg>
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>
            {stats.currentMonth.toLocaleString()}
          </div>
          <p className='text-muted-foreground text-xs'>
            {monthNames[new Date().getMonth()]} {year}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Average per Month</CardTitle>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth='2'
            className='text-muted-foreground h-4 w-4'
          >
            <path d='M3 3v18h18' />
            <path d='M7 15l4-4 4 4 4-6' />
          </svg>
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>
            {stats.averagePerMonth.toLocaleString()}
          </div>
          <p className='text-muted-foreground text-xs'>
            Average bookings per month
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Peak Month</CardTitle>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth='2'
            className='text-muted-foreground h-4 w-4'
          >
            <path d='M22 12h-4l-3 9L9 3l-3 9H2' />
          </svg>
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>
            {stats.peakMonth.count.toLocaleString()}
          </div>
          <p className='text-muted-foreground text-xs'>
            {stats.peakMonth.name} {year}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

