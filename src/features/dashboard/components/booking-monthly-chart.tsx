import { useMemo } from 'react'
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts'
import { useGetBookingMonthlyStatsQuery } from '@/store/services/dashboardApi'

const monthNames = [
  'Thg 1',
  'Thg 2',
  'Thg 3',
  'Thg 4',
  'Thg 5',
  'Thg 6',
  'Thg 7',
  'Thg 8',
  'Thg 9',
  'Thg 10',
  'Thg 11',
  'Thg 12',
]

interface BookingMonthlyChartProps {
  year: number
}

export function BookingMonthlyChart({ year }: BookingMonthlyChartProps) {
  const { data, isLoading, error } = useGetBookingMonthlyStatsQuery({
    year,
  })

  // Transform API response to chart data format
  const chartData = useMemo(() => {
    if (!data) {
      // Return empty data for all 12 months
      return monthNames.map((name) => ({
        name,
        count: 0,
      }))
    }

    // Handle different response formats
    // Check if data is wrapped in an object (e.g., { data: [...] } or { success: true, data: [...] })
    let statsArray: Array<{ year: number; month: number; type: string; count: number }> = []

    if (Array.isArray(data)) {
      statsArray = data
    } else if (data && typeof data === 'object' && 'data' in data) {
      const dataValue = (data as { data: unknown }).data
      if (Array.isArray(dataValue)) {
        statsArray = dataValue as Array<{ year: number; month: number; type: string; count: number }>
      }
    }

    if (statsArray.length === 0) {
      // If data is not in expected format, return empty data
      return monthNames.map((name) => ({
        name,
        count: 0,
      }))
    }

    // Create a map of month to count from API data
    const monthCountMap = new Map<number, number>()
    statsArray.forEach((stat) => {
      monthCountMap.set(stat.month, stat.count)
    })

    // Create chart data for all 12 months, filling missing months with 0
    return monthNames.map((name, monthIndex) => {
      const month = monthIndex + 1 // months are 1-indexed
      return {
        name,
        count: monthCountMap.get(month) || 0,
      }
    })
  }, [data])

  if (error) {
    return (
      <div className='flex h-[350px] items-center justify-center text-sm text-muted-foreground'>
        Lỗi khi tải thống kê đặt sân
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className='flex h-[350px] items-center justify-center text-sm text-muted-foreground'>
        Đang tải...
      </div>
    )
  }

  return (
    <ResponsiveContainer width='100%' height={350}>
      <BarChart data={chartData}>
        <XAxis
          dataKey='name'
          stroke='#888888'
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke='#888888'
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value}`}
        />
        <Bar
          dataKey='count'
          fill='currentColor'
          radius={[4, 4, 0, 0]}
          className='fill-primary'
        />
      </BarChart>
    </ResponsiveContainer>
  )
}

