// components/platform-analytics.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, Users, Award, Brain } from 'lucide-react'

interface PlatformAnalyticsProps {
  data: any
  aiGenerated?: boolean
}

export function PlatformAnalytics({ data, aiGenerated = false }: PlatformAnalyticsProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Phân tích doanh thu
            {aiGenerated && (
              <Badge variant="outline" className="ml-2">
                <Brain className="h-3 w-3 mr-1" />
                Cải thiện bởi AI
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="sports">
            <TabsList>
              <TabsTrigger value="sports">Theo môn thể thao</TabsTrigger>
              <TabsTrigger value="type">Theo loại</TabsTrigger>
              <TabsTrigger value="periods">Giờ cao điểm</TabsTrigger>
            </TabsList>

            <TabsContent value="sports" className="space-y-4">
              {data.revenueAnalysis?.revenueBySport?.map((item: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-semibold">{Number(item.percentage).toFixed(1)}%</span>
                    </div>
                    <div>
                      <p className="font-medium">{item.sport}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.revenue || 0)}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline">
                    #{idx + 1}
                  </Badge>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="type" className="space-y-4">
              {data.revenueAnalysis?.revenueByType?.map((item: any, idx: number) => (
                <div key={idx} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">{item.type}</span>
                    <Badge>{Number(item.percentage).toFixed(1)}%</Badge>
                  </div>
                  <div className="text-2xl font-bold">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.revenue || 0)}
                  </div>
                </div>
              ))}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Xếp hạng độ phổ biến thể thao
            {aiGenerated && (
              <Badge variant="outline" className="ml-2">
                <Brain className="h-3 w-3 mr-1" />
                Cải thiện bởi AI
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.popularityAnalysis?.sportsPopularity?.map((sport: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50">
                <div className="flex items-center gap-4">
                  <div className={`h-12 w-12 rounded-lg flex items-center justify-center 
                    ${idx === 0 ? 'bg-yellow-100 text-yellow-800' :
                      idx === 1 ? 'bg-gray-100 text-gray-800' :
                        idx === 2 ? 'bg-amber-100 text-amber-800' :
                          'bg-blue-50 text-blue-800'}`}>
                    <span className="text-xl font-bold">#{idx + 1}</span>
                  </div>
                  <div>
                    <p className="font-bold text-lg">{sport.sport}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{sport.bookings} lượt đặt</span>

                      <span>{sport.favorites} yêu thích</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">{Number(sport.score).toFixed(1)}/100</div>
                  <div className="text-sm text-muted-foreground">Điểm phổ biến</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {data.userBehavior && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Phân tích hành vi người dùng
              {aiGenerated && (
                <Badge variant="outline" className="ml-2">
                  <Brain className="h-3 w-3 mr-1" />
                  Cải thiện bởi AI
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold">Mẫu đặt chỗ</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Ngày cao điểm</span>
                    <span className="font-medium">
                      {data.userBehavior.bookingPatterns.peakBookingDays.join(', ')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Giờ cao điểm</span>
                    <span className="font-medium">
                      {data.userBehavior.bookingPatterns.peakBookingHours.join(', ')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Thời lượng trung bình</span>
                    <span className="font-medium">
                      {data.userBehavior.bookingPatterns.averageBookingDuration} giờ
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold">Chỉ số giữ chân</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Tỷ lệ đặt lại</span>
                    <span className="font-medium text-green-600">
                      {Number(data.userBehavior.retentionMetrics.repeatBookingRate).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Chuyển đổi yêu thích</span>
                    <span className="font-medium text-blue-600">
                      {Number(data.userBehavior.retentionMetrics.favoriteToBookingConversion).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Điểm hài lòng</span>
                    <span className="font-medium text-purple-600">
                      {Number(data.userBehavior.retentionMetrics.userSatisfactionScore).toFixed(1)}/5
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}