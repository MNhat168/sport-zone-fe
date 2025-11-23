import { useMemo } from 'react'
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts'
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
      return monthNames.map((name, index) => ({
        name,
        count: 0,
      }))
    }

    // Handle different response formats
    // Check if data is wrapped in an object (e.g., { data: [...] } or { success: true, data: [...] })
    let statsArray: Array<{ year: number; month: number; type: string; count: number }> = []
    
    if (Array.isArray(data)) {
      statsArray = data
    } else if (data && typeof data === 'object' && 'data' in data && Array.isArray(data.data)) {
      statsArray = data.data
    } else {
      // If data is not in expected format, return empty data
      return monthNames.map((name, index) => ({
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
    return monthNames.map((name, index) => {
      const month = index + 1 // months are 1-indexed
      return {
        name,
        count: monthCountMap.get(month) || 0,
      }
    })
  }, [data])

  if (error) {
    return (
      <div className='flex h-[350px] items-center justify-center text-sm text-muted-foreground'>
        Error loading booking statistics
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className='flex h-[350px] items-center justify-center text-sm text-muted-foreground'>
        Loading...
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

