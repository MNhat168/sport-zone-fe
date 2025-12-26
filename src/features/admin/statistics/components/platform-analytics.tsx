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
            Revenue Analysis
            {aiGenerated && (
              <Badge variant="outline" className="ml-2">
                <Brain className="h-3 w-3 mr-1" />
                AI Enhanced
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="sports">
            <TabsList>
              <TabsTrigger value="sports">By Sport</TabsTrigger>
              <TabsTrigger value="type">By Type</TabsTrigger>
              <TabsTrigger value="periods">Peak Periods</TabsTrigger>
            </TabsList>
            
            <TabsContent value="sports" className="space-y-4">
              {data.revenueAnalysis?.revenueBySport?.map((item: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-semibold">{item.percentage}%</span>
                    </div>
                    <div>
                      <p className="font-medium">{item.sport}</p>
                      <p className="text-sm text-muted-foreground">
                        ${item.revenue.toLocaleString()}
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
                    <Badge>{item.percentage}%</Badge>
                  </div>
                  <div className="text-2xl font-bold">
                    ${item.revenue.toLocaleString()}
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
            Sports Popularity Ranking
            {aiGenerated && (
              <Badge variant="outline" className="ml-2">
                <Brain className="h-3 w-3 mr-1" />
                AI Enhanced
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
                      <span>{sport.bookings} bookings</span>
                      <span>{sport.tournaments} tournaments</span>
                      <span>{sport.favorites} favorites</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">{sport.score}/100</div>
                  <div className="text-sm text-muted-foreground">Popularity Score</div>
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
              User Behavior Insights
              {aiGenerated && (
                <Badge variant="outline" className="ml-2">
                  <Brain className="h-3 w-3 mr-1" />
                  AI Enhanced
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold">Booking Patterns</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Peak Days</span>
                    <span className="font-medium">
                      {data.userBehavior.bookingPatterns.peakBookingDays.join(', ')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Peak Hours</span>
                    <span className="font-medium">
                      {data.userBehavior.bookingPatterns.peakBookingHours.join(', ')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Avg Duration</span>
                    <span className="font-medium">
                      {data.userBehavior.bookingPatterns.averageBookingDuration} hours
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-semibold">Retention Metrics</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Repeat Booking Rate</span>
                    <span className="font-medium text-green-600">
                      {data.userBehavior.retentionMetrics.repeatBookingRate}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Favorite Conversion</span>
                    <span className="font-medium text-blue-600">
                      {data.userBehavior.retentionMetrics.favoriteToBookingConversion}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Satisfaction Score</span>
                    <span className="font-medium text-purple-600">
                      {data.userBehavior.retentionMetrics.userSatisfactionScore}/5
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