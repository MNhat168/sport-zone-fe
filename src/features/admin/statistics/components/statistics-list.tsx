// statistics-list.tsx
import { useState } from 'react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    Loader2,
    TrendingUp,
    TrendingDown,
    Star,
    Users,
    DollarSign,
    Calendar,
    Target,
    Award,
    BarChart3,
    Brain,
} from 'lucide-react'
import { Progress } from '@/components/ui/progress'

interface StatisticsListProps {
    data: any[] | { items?: any[] } | { data?: any[] } | any
    loading: boolean
    activeTab: string
    viewMode?: 'compact' | 'detailed'
    aiGenerated?: boolean
}

export function StatisticsList({ 
    data, 
    loading, 
    activeTab, 
    aiGenerated = false
}: StatisticsListProps) {
    const [expandedCard, setExpandedCard] = useState<string | null>(null)

    if (loading) {
        return (
            <div className='flex justify-center p-10'>
                <Loader2 className='animate-spin h-8 w-8' />
            </div>
        )
    }

    // Handle case where data might be an object instead of array
    const dataArray = Array.isArray(data) ? data : 
                     (data && data.items && Array.isArray(data.items)) ? data.items : 
                     (data && data.data && Array.isArray(data.data)) ? data.data : 
                     []

    if (!Array.isArray(dataArray)) {
        return <p className='text-center text-destructive'>Lỗi tải dữ liệu. Mong đợi mảng nhưng nhận được {typeof data}</p>
    }

    if (dataArray.length === 0) {
        return <p className='text-center text-muted-foreground'>Không tìm thấy dữ liệu.</p>
    }

    const toggleExpand = (id: string) => {
        setExpandedCard(expandedCard === id ? null : id)
    }

    const getPerformanceBadge = (score: number) => {
        if (score >= 80) return { label: 'Xuất sắc', variant: 'default' as const, color: 'bg-green-100 text-green-800' }
        if (score >= 60) return { label: 'Tốt', variant: 'secondary' as const, color: 'bg-blue-100 text-blue-800' }
        if (score >= 40) return { label: 'Trung bình', variant: 'outline' as const, color: 'bg-yellow-100 text-yellow-800' }
        return { label: 'Cần cải thiện', variant: 'destructive' as const, color: 'bg-red-100 text-red-800' }
    }

    return (
        <div className='grid gap-4 md:grid-cols-1'>
            {dataArray.map((item, index) => {
                const id = item.fieldOwnerId || item.coachId || item._id || item.id || `item-${index}`
                const name = item.fieldOwnerName || item.coachName || item.name || `Item ${index + 1}`
                const isExpanded = expandedCard === id
                
                return (
                    <Card key={id} className={`w-full transition-all duration-300 ${isExpanded ? 'ring-2 ring-primary' : ''}`}>
                        <CardHeader className='space-y-2'>
                            <div className='flex items-center justify-between'>
                                <div className='flex items-center gap-3'>
                                    <div className='h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center'>
                                        <Users className='h-6 w-6 text-primary' />
                                    </div>
                                    <div>
                                        <CardTitle className='text-xl font-bold'>{name}</CardTitle>
                                        <CardDescription className='flex items-center gap-2'>
                                            {activeTab === 'field-owners' 
                                                ? `${item.totalFields || item.fieldsCount || 0} Sân` 
                                                : `${item.sports?.join(', ') || item.sport || 'Nhiều môn thể thao'}`}
                                            {aiGenerated && (
                                                <Badge variant="outline" className='text-xs'>
                                                    <Brain className="h-3 w-3 mr-1" />
                                                    Cải thiện bởi AI
                                                </Badge>
                                            )}
                                        </CardDescription>
                                    </div>
                                </div>
                                
                                <div className='flex items-center gap-2'>
                                    <Badge className={getPerformanceBadge(item.performanceScore || item.averageRating * 20).color}>
                                        {getPerformanceBadge(item.performanceScore || item.averageRating * 20).label}
                                    </Badge>
                                    <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        onClick={() => toggleExpand(id)}
                                    >
                                        {isExpanded ? 'Thu gọn' : 'Xem chi tiết'}
                                    </Button>
                                </div>
                            </div>
                            
                            <div className='grid grid-cols-2 md:grid-cols-4 gap-4 pt-4'>
                                <div className='flex flex-col'>
                                    <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                                        <Star className='h-4 w-4' />
                                        Đánh giá
                                    </div>
                                    <div className='flex items-center gap-2 mt-1'>
                                        <span className='text-2xl font-bold'>{(item.averageRating || item.rating || 0).toFixed(1)}</span>
                                        <span className='text-sm text-muted-foreground'>/5</span>
                                        <Progress value={(item.averageRating || item.rating || 0) * 20} className='w-20 h-2' />
                                    </div>
                                </div>
                                
                                <div className='flex flex-col'>
                                    <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                                        <Calendar className='h-4 w-4' />
                                        Lượt đặt
                                    </div>
                                    <span className='text-2xl font-bold'>{(item.totalBookings || item.bookings || 0).toLocaleString()}</span>
                                    <div className='flex items-center gap-1 text-xs'>
                                        {item.bookingTrend === 'increasing' ? (
                                            <TrendingUp className='h-3 w-3 text-green-600' />
                                        ) : item.bookingTrend === 'decreasing' ? (
                                            <TrendingDown className='h-3 w-3 text-red-600' />
                                        ) : (
                                            <BarChart3 className='h-3 w-3 text-gray-600' />
                                        )}
                                        <span className={item.bookingTrend === 'increasing' ? 'text-green-600' : 
                                                         item.bookingTrend === 'decreasing' ? 'text-red-600' : 'text-gray-600'}>
                                            {item.bookingTrend?.toUpperCase() || 'STABLE'}
                                            {aiGenerated && ' (AI)'}
                                        </span>
                                    </div>
                                </div>
                                
                                <div className='flex flex-col'>
                                    <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                                        <Users className='h-4 w-4' />
                                        Yêu thích
                                    </div>
                                    <span className='text-2xl font-bold'>{(item.totalFavorites || item.favorites || 0).toLocaleString()}</span>
                                    <span className='text-xs text-muted-foreground'>
                                        {((item.totalBookings || item.bookings) && (item.totalFavorites || item.favorites)) 
                                            ? `${(((item.totalBookings || item.bookings) / (item.totalFavorites || item.favorites)) * 100).toFixed(1)}% conversion`
                                            : 'N/A'}
                                    </span>
                                </div>
                                
                                {item.revenue && (
                                    <div className='flex flex-col'>
                                        <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                                            <DollarSign className='h-4 w-4' />
                                            Doanh thu
                                        </div>
                                        <span className='text-2xl font-bold'>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.revenue || 0)}</span>
                                        <div className='flex items-center gap-1 text-xs'>
                                            {item.revenueTrend === 'increasing' ? (
                                                <TrendingUp className='h-3 w-3 text-green-600' />
                                            ) : (
                                                <TrendingDown className='h-3 w-3 text-red-600' />
                                            )}
                                            <span>
                                                30 ngày qua
                                                {aiGenerated && ' (AI)'}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardHeader>
                        
                        <CardContent>
                            {!isExpanded ? (
                                <div className='space-y-4'>
                                    <div className='flex gap-3 rounded-lg bg-muted/50 p-4'>
                                        <Target className='h-6 w-6 flex-shrink-0 text-primary' />
                                        <div>
                                            <h4 className='mb-1 text-sm font-semibold'>Phân tích AI</h4>
                                            <p className='text-sm text-muted-foreground line-clamp-2'>
                                                {item.aiInsight || item.insight || 'Chưa có phân tích. Nhấn nút "Tạo phân tích AI".'}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    {item.strengths && item.strengths.length > 0 && (
                                        <div className='flex flex-wrap gap-2'>
                                            {item.strengths.slice(0, 3).map((strength: string, idx: number) => (
                                                <Badge key={idx} variant="outline" className='bg-green-50'>
                                                    {strength}
                                                </Badge>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className='space-y-6'>
                                    {aiGenerated && (
                                        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-2 rounded-md">
                                            <div className="flex items-center gap-2">
                                                <Brain className="h-4 w-4" />
                                                <span className="text-sm font-medium">Phân tích cải thiện bởi AI</span>
                                            </div>
                                        </div>
                                    )}
                                    
                                    <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                                        <div className='space-y-4'>
                                            <h4 className='font-semibold flex items-center gap-2'>
                                                <Award className='h-5 w-5 text-primary' />
                                                Chỉ số hiệu suất
                                            </h4>
                                            
                                            <div className='space-y-3'>
                                                <div>
                                                    <div className='flex justify-between text-sm mb-1'>
                                                        <span>Điểm hiệu suất</span>
                                                        <span className='font-semibold'>{item.performanceScore || 'N/A'}/100</span>
                                                    </div>
                                                    <Progress value={item.performanceScore || 0} className='h-2' />
                                                </div>
                                                
                                                <div>
                                                    <div className='flex justify-between text-sm mb-1'>
                                                        <span>Vị trí thị trường</span>
                                                        <span className='font-semibold capitalize'>{item.marketPosition || 'Chưa xác định'}</span>
                                                    </div>
                                                </div>
                                                
                                                <div>
                                                    <div className='flex justify-between text-sm mb-1'>
                                                        <span>Tiềm năng tăng trưởng</span>
                                                        <span className='font-semibold'>{item.growthPotential || 'N/A'}%</span>
                                                    </div>
                                                    <Progress value={item.growthPotential || 0} className='h-2' />
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {item.monthlyBookings && item.monthlyBookings.length > 0 && (
                                            <div className='space-y-4'>
                                                <h4 className='font-semibold'>Hiệu suất theo tháng</h4>
                                                <div className='space-y-2'>
                                                    {item.monthlyBookings.slice(-3).map((month: any, idx: number) => (
                                                        <div key={idx} className='flex justify-between items-center text-sm'>
                                                            <span className='text-muted-foreground'>{month.month}</span>
                                                            <div className='flex items-center gap-4'>
                                                                <span className='font-medium'>{month.count} lượt đặt</span>
                                                                {month.revenue > 0 && (
                                                                    <span className='font-semibold text-green-600'>
                                                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(month.revenue || 0)}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                                        {item.strengths && item.strengths.length > 0 && (
                                            <div className='space-y-3'>
                                                <h4 className='font-semibold text-green-700'>Điểm mạnh</h4>
                                                <ul className='space-y-2'>
                                                    {item.strengths.map((strength: string, idx: number) => (
                                                        <li key={idx} className='flex items-start gap-2 text-sm'>
                                                            <div className='h-2 w-2 rounded-full bg-green-500 mt-1.5 flex-shrink-0' />
                                                            <span>{strength}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                        
                                        {item.opportunities && item.opportunities.length > 0 && (
                                            <div className='space-y-3'>
                                                <h4 className='font-semibold text-amber-700'>Cơ hội</h4>
                                                <ul className='space-y-2'>
                                                    {item.opportunities.map((opportunity: string, idx: number) => (
                                                        <li key={idx} className='flex items-start gap-2 text-sm'>
                                                            <div className='h-2 w-2 rounded-full bg-amber-500 mt-1.5 flex-shrink-0' />
                                                            <span>{opportunity}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                    
                                    {item.recommendations && item.recommendations.length > 0 && (
                                        <div className='space-y-4'>
                                            <h4 className='font-semibold text-primary'>Khuyến nghị AI</h4>
                                            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                                {item.recommendations.map((rec: string, idx: number) => (
                                                    <div key={idx} className='p-3 border rounded-lg bg-primary/5'>
                                                        <p className='text-sm'>{rec}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    
                                    {item.sportsDistribution && item.sportsDistribution.length > 0 && (
                                        <div className='space-y-4'>
                                            <h4 className='font-semibold'>Phân bổ thể thao</h4>
                                            <div className='flex flex-wrap gap-2'>
                                                {item.sportsDistribution.map((sport: any, idx: number) => (
                                                    <Badge key={idx} variant="secondary">
                                                        {sport.sport}: {sport.count} ({sport.percentage?.toFixed(1)}%)
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )
            })}
        </div>
    )
}