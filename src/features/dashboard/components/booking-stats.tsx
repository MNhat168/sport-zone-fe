import { useState, useMemo } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { BookingStatsCards } from './booking-stats-cards'
import { BookingMonthlyChart } from './booking-monthly-chart'

export function BookingStats() {
  const currentYear = new Date().getFullYear()
  const [selectedYear, setSelectedYear] = useState<number>(currentYear)

  // Generate years from current year going back 5 years
  const years = useMemo(() => {
    const yearList = []
    for (let i = 0; i < 6; i++) {
      yearList.push(currentYear - i)
    }
    return yearList
  }, [currentYear])

  return (
    <div className='space-y-4'>
      {/* Year Selector */}
      <div className='flex items-center justify-end'>
        <Select
          value={selectedYear.toString()}
          onValueChange={(value) => setSelectedYear(parseInt(value, 10))}
        >
          <SelectTrigger className='w-[120px]'>
            <SelectValue placeholder='Chọn năm' />
          </SelectTrigger>
          <SelectContent>
            {years.map((year) => (
              <SelectItem key={year} value={year.toString()}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <BookingStatsCards year={selectedYear} />

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Thống kê đặt sân theo tháng</CardTitle>
          <CardDescription>
            Lượt đặt sân theo tháng năm {selectedYear}
          </CardDescription>
        </CardHeader>
        <CardContent className='ps-2'>
          <BookingMonthlyChart year={selectedYear} />
        </CardContent>
      </Card>
    </div>
  )
}

