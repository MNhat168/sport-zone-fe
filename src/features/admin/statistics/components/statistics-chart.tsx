// statistics-chart.tsx
import { useState } from 'react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from '@/components/ui/card'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    BarChart,
    Bar,
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
    Legend,
    PieChart,
    Pie,
    Cell,
} from 'recharts'

interface StatisticsChartProps {
    data: any
    activeTab: string
    chartType?: 'bar' | 'line' | 'pie' | 'revenue'
}

// statistics-chart.tsx - Updated unpackData function
export function StatisticsChart({ data, activeTab, chartType = 'bar' }: StatisticsChartProps) {
    const [selectedChart, setSelectedChart] = useState(chartType)
    const [timeRange, setTimeRange] = useState('6months')

    // Function to unpack data based on structure
    const unpackData = () => {
        // If data is already an array, return it (field owners or coaches data)
        if (Array.isArray(data)) {
            // For field owners tab, we can chart monthlyBookings from each owner
            if (activeTab === 'field-owners' && data.length > 0) {
                // Try to aggregate monthly bookings across all field owners
                const monthlyDataMap = new Map()
                
                data.forEach(owner => {
                    if (owner.monthlyBookings && Array.isArray(owner.monthlyBookings)) {
                        owner.monthlyBookings.forEach((month: { month: any; count: any; revenue: any; }) => {
                            if (month.month) {
                                const existing = monthlyDataMap.get(month.month) || { 
                                    month: month.month, 
                                    count: 0, 
                                    revenue: 0,
                                    bookings: 0
                                }
                                existing.count += month.count || 0
                                existing.revenue += month.revenue || 0
                                existing.bookings += month.count || 0
                                monthlyDataMap.set(month.month, existing)
                            }
                        })
                    }
                })
                
                return Array.from(monthlyDataMap.values()).sort((a, b) => 
                    a.month.localeCompare(b.month)
                )
            }
            return data
        }
        
        // If data is an object with monthlyRevenue (revenueAnalysis case)
        if (data && data.monthlyRevenue && Array.isArray(data.monthlyRevenue)) {
            return data.monthlyRevenue
        }
        
        // If data is an object with sportsDistribution
        if (data && data.sportsDistribution && Array.isArray(data.sportsDistribution)) {
            return data.sportsDistribution
        }
        
        // If data is an object with revenueAnalysis that has monthlyRevenue
        if (data && data.revenueAnalysis && data.revenueAnalysis.monthlyRevenue && Array.isArray(data.revenueAnalysis.monthlyRevenue)) {
            return data.revenueAnalysis.monthlyRevenue
        }
        
        // For field owners object data (if not in array)
        if (data && activeTab === 'field-owners') {
            if (data.monthlyBookings && Array.isArray(data.monthlyBookings)) {
                return data.monthlyBookings
            }
            if (data.sportsDistribution && Array.isArray(data.sportsDistribution)) {
                return data.sportsDistribution
            }
        }
        
        // Default empty array
        return []
    }

    const unpackedData = unpackData()

    // Debug log to see what data we're getting
    console.log('Chart debug:', { 
        activeTab, 
        dataType: typeof data, 
        isArray: Array.isArray(data),
        unpackedDataLength: unpackedData.length,
        firstItem: unpackedData[0]
    })

    if (!unpackedData || unpackedData.length === 0) {
        return (
            <Card className='mb-8 mt-4'>
                <CardHeader>
                    <CardTitle>Performance Analytics</CardTitle>
                    <CardDescription>
                        {activeTab === 'field-owners' ? 'Field Owner Performance' : 
                         activeTab === 'coaches' ? 'Coach Performance' : 
                         activeTab === 'overview' ? 'Platform Performance' : 'Analytics'}
                    </CardDescription>
                </CardHeader>
                <CardContent className='h-[400px] flex items-center justify-center'>
                    <div className='text-center'>
                        <p className='text-muted-foreground mb-2'>No chart data available</p>
                        <p className='text-xs text-muted-foreground'>
                            Data structure: {Array.isArray(data) ? 'Array' : 'Object'} with {Array.isArray(data) ? data.length : Object.keys(data || {}).length} items
                        </p>
                    </div>
                </CardContent>
            </Card>
        )
    }

    const prepareChartData = () => {
        switch (selectedChart) {
            case 'revenue':
                return unpackedData.map((item: any) => ({
                    name: item.month || item.name || item.label || `Item ${item.id || ''}`,
                    revenue: item.revenue || item.value || 0,
                    growth: item.growth || 0,
                    bookings: item.bookings || item.count || 0,
                }))
            
            case 'pie':
                // For field owners, use sportsDistribution
                if (activeTab === 'field-owners' && data[0]?.sportsDistribution) {
                    const sportMap = new Map()
                    data.forEach((owner: { sportsDistribution: any[]; }) => {
                        if (owner.sportsDistribution) {
                            owner.sportsDistribution.forEach((sport: { sport: any; count: any; }) => {
                                const existing = sportMap.get(sport.sport) || { 
                                    name: sport.sport, 
                                    value: 0,
                                    count: 0 
                                }
                                existing.value += sport.count || 0
                                existing.count += sport.count || 0
                                sportMap.set(sport.sport, existing)
                            })
                        }
                    })
                    return Array.from(sportMap.values()).map((item, index) => ({
                        ...item,
                        value: item.count || 0,
                        color: COLORS[index % COLORS.length],
                    }))
                }
                
                return unpackedData.map((item: any, index: number) => ({
                    name: item.sport || item.name || item.label || `Item ${index}`,
                    value: item.count || item.percentage || item.value || item.bookings || 0,
                    color: COLORS[index % COLORS.length],
                }))
            
            default:
                // For bar/line charts
                if (activeTab === 'field-owners') {
                    // Show field owners by total bookings
                    return data.slice(0, 8).map((item: any) => ({
                        name: item.fieldOwnerName || `Owner ${item.fieldOwnerId?.slice(-4)}`,
                        bookings: item.totalBookings || 0,
                        revenue: item.monthlyBookings?.reduce((sum: number, month: any) => sum + (month.revenue || 0), 0) || 0,
                        rating: item.averageRating || 0,
                        fields: item.totalFields || 0,
                        ...item
                    }))
                }
                
                return unpackedData.slice(0, 8).map((item: any) => ({
                    name: item.name || item.fieldOwnerName || item.coachName || item.month || `Item ${item.id || ''}`,
                    bookings: item.totalBookings || item.bookings || item.count || 0,
                    revenue: item.revenue || 0,
                    ...item
                }))
        }
    }

    const chartData = prepareChartData()
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D']

    // Debug the chart data
    console.log('Chart data prepared:', chartData)

    const renderChart = () => {
        switch (selectedChart) {
            case 'line':
                return (
                    <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="bookings" stroke="#8884d8" strokeWidth={2} />
                        {chartData[0]?.revenue && (
                            <Line type="monotone" dataKey="revenue" stroke="#82ca9d" strokeWidth={2} />
                        )}
                    </LineChart>
                )
            
            case 'pie':
                return (
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, value }: any) => `${name}: ${value}`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                        >
                            {chartData.map((entry: any, index: number) => (
                                <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip formatter={(value) => [value, 'Count']} />
                        <Legend />
                    </PieChart>
                )
            
            case 'revenue':
                return (
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis yAxisId="left" />
                        <YAxis yAxisId="right" orientation="right" />
                        <Tooltip 
                            formatter={(value, name) => {
                                if (name === 'revenue') return [`$${Number(value).toLocaleString()}`, 'Revenue']
                                if (name === 'growth') return [`${value}%`, 'Growth']
                                return [value, name]
                            }}
                        />
                        <Legend />
                        <Bar yAxisId="left" dataKey="revenue" fill="#8884d8" name="Revenue ($)" />
                        {chartData[0]?.growth !== undefined && (
                            <Line yAxisId="right" type="monotone" dataKey="growth" stroke="#ff7300" name="Growth (%)" />
                        )}
                    </BarChart>
                )
            
            default:
                return (
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip 
                            formatter={(value, name) => {
                                if (name === 'revenue') return [`$${value}`, 'Revenue']
                                if (name === 'bookings') return [value, 'Bookings']
                                return [value, name]
                            }}
                        />
                        <Legend />
                        <Bar 
                            dataKey="bookings" 
                            fill="#8884d8" 
                            name="Total Bookings"
                            radius={[4, 4, 0, 0]}
                        />
                        {chartData[0]?.revenue !== undefined && chartData[0]?.revenue > 0 && (
                            <Bar 
                                dataKey="revenue" 
                                fill="#82ca9d" 
                                name="Revenue ($)"
                                radius={[4, 4, 0, 0]}
                            />
                        )}
                    </BarChart>
                )
        }
    }

    return (
        <Card className='mb-8 mt-4'>
            <CardHeader className='flex flex-row items-center justify-between'>
                <div>
                    <CardTitle>
                        {selectedChart === 'revenue' ? 'Revenue Analysis' : 
                         selectedChart === 'pie' ? 'Distribution Analysis' : 
                         activeTab === 'field-owners' ? 'Field Owners Performance' :
                         activeTab === 'coaches' ? 'Coaches Performance' : 'Performance Analytics'}
                    </CardTitle>
                    <CardDescription>
                        {selectedChart === 'pie' && activeTab === 'field-owners' ? 'Sports Distribution Across Field Owners' :
                         activeTab === 'field-owners' ? 'Top performing field owners by bookings' : 
                         activeTab === 'coaches' ? 'Coach Performance Metrics' : 
                         activeTab === 'overview' ? 'Platform Performance' : 'Analytics'}
                    </CardDescription>
                </div>
                <div className='flex gap-2'>
                    <Select value={timeRange} onValueChange={setTimeRange}>
                        <SelectTrigger className="w-[130px]">
                            <SelectValue placeholder="Time Range" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="3months">Last 3 Months</SelectItem>
                            <SelectItem value="6months">Last 6 Months</SelectItem>
                            <SelectItem value="1year">Last Year</SelectItem>
                            <SelectItem value="all">All Time</SelectItem>
                        </SelectContent>
                    </Select>
                    
                    <Select value={selectedChart} onValueChange={(value) => setSelectedChart(value as 'bar' | 'line' | 'pie' | 'revenue')}>
                        <SelectTrigger className="w-[130px]">
                            <SelectValue placeholder="Chart Type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="bar">Bar Chart</SelectItem>
                            <SelectItem value="line">Trend Line</SelectItem>
                            <SelectItem value="pie">Distribution</SelectItem>
                            {activeTab === 'field-owners' && (
                                <SelectItem value="revenue">Revenue Analysis</SelectItem>
                            )}
                        </SelectContent>
                    </Select>
                </div>
            </CardHeader>
            <CardContent className='h-[400px]'>
                <ResponsiveContainer width='100%' height='100%'>
                    {renderChart()}
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}