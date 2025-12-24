import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Users, DollarSign, Target, BarChart3, Award, TrendingUp as UpTrend, TrendingDown as DownTrend } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface DetailedInsightsPanelProps {
  insights: any;
  type: 'revenue' | 'popularity' | 'sports' | 'dashboard';
  loading: boolean;
  title?: string;
}

export function DetailedInsightsPanel({ insights, type, loading, title }: DetailedInsightsPanelProps) {
  if (loading) {
    return (
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!insights) {
    return (
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground p-8">
            No detailed insights available
          </div>
        </CardContent>
      </Card>
    );
  }

  const getIcon = () => {
    switch(type) {
      case 'revenue': return <DollarSign className="h-5 w-5" />;
      case 'popularity': return <Users className="h-5 w-5" />;
      case 'sports': return <Target className="h-5 w-5" />;
      default: return <BarChart3 className="h-5 w-5" />;
    }
  };

  const getTitle = () => {
    if (title) return title;
    switch(type) {
      case 'revenue': return 'Revenue Analytics';
      case 'popularity': return 'Popularity Analysis';
      case 'sports': return 'Sports Performance';
      default: return 'Detailed Insights';
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getIcon()}
          {getTitle()}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Summary */}
        {insights.summary && (
          <div className="rounded-lg bg-primary/5 p-4 border">
            <h4 className="font-semibold mb-2 text-primary">Executive Summary</h4>
            <p className="text-sm">{insights.summary}</p>
          </div>
        )}

        {/* Key Metrics Grid */}
        {insights.metrics && Object.keys(insights.metrics).length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Monthly Growth */}
            {insights.metrics.monthlyGrowth !== undefined && (
              <div className="flex flex-col p-4 bg-card rounded-lg border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">MoM Growth</span>
                  {insights.metrics.monthlyGrowth >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-600" />
                  )}
                </div>
                <span className={`text-2xl font-bold ${
                  insights.metrics.monthlyGrowth >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {insights.metrics.monthlyGrowth >= 0 ? '+' : ''}{insights.metrics.monthlyGrowth}%
                </span>
              </div>
            )}
            
            {/* Average Revenue */}
            {insights.metrics.avgRevenue !== undefined && (
              <div className="flex flex-col p-4 bg-card rounded-lg border">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Avg Monthly</span>
                </div>
                <span className="text-2xl font-bold">
                  ${(insights.metrics.avgRevenue / 1000).toFixed(1)}K
                </span>
              </div>
            )}
            
            {/* Conversion Rate */}
            {insights.metrics.avgConversionRate !== undefined && (
              <div className="flex flex-col p-4 bg-card rounded-lg border">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Avg Conversion</span>
                </div>
                <span className={`text-2xl font-bold ${
                  insights.metrics.avgConversionRate >= 30 ? 'text-green-600' :
                  insights.metrics.avgConversionRate >= 15 ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {insights.metrics.avgConversionRate.toFixed(1)}%
                </span>
              </div>
            )}
            
            {/* Correlation Score */}
            {insights.metrics.correlationScore !== undefined && (
              <div className="flex flex-col p-4 bg-card rounded-lg border">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Correlation</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold">
                    {insights.metrics.correlationScore.toFixed(2)}
                  </span>
                  <Progress 
                    value={insights.metrics.correlationScore * 100} 
                    className="w-16 h-1.5"
                  />
                </div>
              </div>
            )}

            {/* YTD Revenue */}
            {insights.metrics.ytdRevenue !== undefined && (
              <div className="flex flex-col p-4 bg-card rounded-lg border">
                <div className="text-sm text-muted-foreground mb-2">YTD Revenue</div>
                <span className="text-2xl font-bold">
                  ${(insights.metrics.ytdRevenue / 1000).toFixed(1)}K
                </span>
              </div>
            )}

            {/* Platform Health */}
            {insights.metrics.platformHealth && (
              <div className="flex flex-col p-4 bg-card rounded-lg border">
                <div className="text-sm text-muted-foreground mb-2">Platform Health</div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">
                    {insights.metrics.platformHealth}
                  </span>
                  {insights.metrics.platformHealth === 'Excellent' && (
                    <Award className="h-5 w-5 text-green-600" />
                  )}
                </div>
              </div>
            )}

            {/* Overall Growth */}
            {insights.metrics.overallGrowth !== undefined && (
              <div className="flex flex-col p-4 bg-card rounded-lg border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Overall Growth</span>
                  <UpTrend className="h-4 w-4 text-green-600" />
                </div>
                <span className="text-2xl font-bold text-green-600">
                  +{insights.metrics.overallGrowth}%
                </span>
              </div>
            )}

            {/* User Satisfaction */}
            {insights.metrics.userSatisfaction !== undefined && (
              <div className="flex flex-col p-4 bg-card rounded-lg border">
                <div className="text-sm text-muted-foreground mb-2">User Satisfaction</div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold">
                    {insights.metrics.userSatisfaction.toFixed(1)}
                  </span>
                  <span className="text-sm text-muted-foreground">/5</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Sports Ranking Table */}
        {insights.metrics?.sportsRanking && insights.metrics.sportsRanking.length > 0 && (
          <div>
            <h4 className="font-semibold mb-3">Sports Popularity Ranking</h4>
            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-left p-3">Rank</th>
                    <th className="text-left p-3">Sport</th>
                    <th className="text-left p-3">Tier</th>
                    <th className="text-left p-3">Bookings</th>
                    <th className="text-left p-3">Revenue</th>
                    <th className="text-left p-3">Popularity Score</th>
                  </tr>
                </thead>
                <tbody>
                  {insights.metrics.sportsRanking.slice(0, 8).map((sport: any, index: number) => (
                    <tr key={index} className="border-b hover:bg-muted/50">
                      <td className="p-3 font-medium">#{sport.ranking}</td>
                      <td className="p-3 font-medium">{sport.sportType}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded text-xs ${
                          sport.tier?.includes('S-Tier') ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                          sport.tier?.includes('A-Tier') ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                          sport.tier?.includes('B-Tier') ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                          'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                        }`}>
                          {sport.tier || 'N/A'}
                        </span>
                      </td>
                      <td className="p-3">{sport.fieldBookings?.toLocaleString() || 0}</td>
                      <td className="p-3">${sport.fieldRevenue ? (sport.fieldRevenue / 1000).toFixed(1) + 'K' : '0'}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{sport.popularityScore.toFixed(1)}</span>
                          <Progress 
                            value={(sport.popularityScore / (insights.metrics.sportsRanking[0]?.popularityScore || 1)) * 100} 
                            className="w-20 h-1.5"
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Top Performers */}
        {insights.metrics?.topPerformers && insights.metrics.topPerformers.length > 0 && (
          <div>
            <h4 className="font-semibold mb-3">Top Performers</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {insights.metrics.topPerformers.map((performer: any, index: number) => (
                <div key={index} className="p-4 bg-card rounded-lg border">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`h-3 w-3 rounded-full ${
                        index === 0 ? 'bg-yellow-500' :
                        index === 1 ? 'bg-gray-400' :
                        'bg-amber-700'
                      }`} />
                      <span className="font-semibold">#{index + 1}</span>
                    </div>
                    <Award className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="font-medium truncate mb-1">
                    {performer.fieldOwnerName || performer.coachName || 'Unknown'}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <div className="text-muted-foreground">Conversion</div>
                      <div className={`font-medium ${
                        performer.conversionRate >= 30 ? 'text-green-600' :
                        performer.conversionRate >= 15 ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {performer.conversionRate?.toFixed(1)}%
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Bookings</div>
                      <div className="font-medium">{performer.bookings?.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Revenue</div>
                      <div className="font-medium">
                        ${performer.totalRevenue ? (performer.totalRevenue / 1000).toFixed(1) + 'K' : '0'}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Rating</div>
                      <div className="font-medium">{performer.avgRating?.toFixed(1) || 'N/A'}/5</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Detailed Analysis */}
        {insights.detailedAnalysis && insights.detailedAnalysis.length > 0 && (
          <div>
            <h4 className="font-semibold mb-3">Detailed Analysis</h4>
            <div className="space-y-3">
              {insights.detailedAnalysis.map((point: string, index: number) => (
                <div key={index} className="flex items-start p-3 bg-card rounded-lg border">
                  <div className={`h-2 w-2 rounded-full mt-1.5 mr-3 flex-shrink-0 ${
                    point.toLowerCase().includes('growth') || point.toLowerCase().includes('increase') ? 'bg-green-500' :
                    point.toLowerCase().includes('decline') || point.toLowerCase().includes('decrease') ? 'bg-red-500' :
                    'bg-blue-500'
                  }`} />
                  <span className="text-sm">{point}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommendations */}
        {insights.recommendations && insights.recommendations.length > 0 && (
          <div className="rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 p-4 border border-green-200 dark:border-green-800">
            <h4 className="font-semibold mb-3 text-green-700 dark:text-green-400">
              Strategic Recommendations
            </h4>
            <ul className="space-y-2">
              {insights.recommendations.map((rec: string, index: number) => (
                <li key={index} className="flex items-start">
                  <div className="h-2 w-2 rounded-full bg-green-600 mt-1.5 mr-2 flex-shrink-0" />
                  <span className="text-sm">{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Growth Rates Chart */}
        {insights.metrics?.growthRates && Object.keys(insights.metrics.growthRates).length > 0 && (
          <div>
            <h4 className="font-semibold mb-3">Growth Rates by Category</h4>
            <div className="space-y-3">
              {Object.entries(insights.metrics.growthRates).map(([category, rate]: [string, any]) => (
                <div key={category} className="flex items-center justify-between p-3 bg-card rounded-lg border">
                  <span className="text-sm font-medium">{category}</span>
                  <div className="flex items-center gap-2">
                    <span className={`font-medium ${
                      typeof rate === 'string' && rate.includes('-') ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {typeof rate === 'string' ? rate : `${rate > 0 ? '+' : ''}${rate}%`}
                    </span>
                    {typeof rate === 'string' && rate.includes('-') ? (
                      <DownTrend className="h-4 w-4 text-red-600" />
                    ) : (
                      <UpTrend className="h-4 w-4 text-green-600" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Key Opportunities */}
        {insights.metrics?.topOpportunities && insights.metrics.topOpportunities.length > 0 && (
          <div className="rounded-lg bg-blue-50 dark:bg-blue-950/20 p-4 border border-blue-200 dark:border-blue-800">
            <h4 className="font-semibold mb-3 text-blue-700 dark:text-blue-400">
              Key Opportunities
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {insights.metrics.topOpportunities.map((opportunity: string, index: number) => (
                <div key={index} className="p-3 bg-white dark:bg-blue-900/30 rounded border border-blue-100 dark:border-blue-800">
                  <div className="font-medium text-sm mb-1">{opportunity}</div>
                  <div className="text-xs text-muted-foreground">
                    High potential area for growth and optimization
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}