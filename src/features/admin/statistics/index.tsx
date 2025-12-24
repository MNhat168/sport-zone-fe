import { useState, useEffect, useRef, useCallback } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import axios from '@/lib/axios'
import { StatisticsChart } from './components/statistics-chart'
import { StatisticsList } from './components/statistics-list'
import { PlatformAnalytics } from './components/platform-analytics'
import { Loader2, TrendingUp, Users, DollarSign, Calendar, Target, Brain, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'

export default function Statistics() {
    const [activeTab, setActiveTab] = useState('overview')
    const [analyticsData, setAnalyticsData] = useState<any>({})
    const [fieldOwnerData, setFieldOwnerData] = useState<any[]>([])
    const [coachData, setCoachData] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [aiThinking, setAiThinking] = useState(false)
    const [aiGenerated, setAiGenerated] = useState(false)
    const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)

    // In index.tsx, update fetchRawData function:
    const fetchRawData = async () => {
        try {
            const [
                analyticsRes,
                fieldOwnersRes,
                coachesRes
            ] = await Promise.all([
                axios.get('/admin/statistics/platform-analytics?ai=false'),
                axios.get('/admin/statistics/field-owners?ai=false'),
                axios.get('/admin/statistics/coaches?ai=false')
            ])

            return {
                analytics: analyticsRes.data.data || analyticsRes.data, // Extract nested data
                fieldOwners: fieldOwnersRes.data.data || fieldOwnersRes.data || [],
                 coaches: coachesRes.data.data || coachesRes.data || []
            }
        } catch (error) {
            console.error('Failed to fetch statistics', error)
            throw error
        }
    }

    // Function to trigger AI analysis
    const triggerAiAnalysis = async () => {
        setAiThinking(true)
        try {
            // Call AI endpoints with ai=true parameter
            const [
                aiAnalyticsRes,
                aiFieldOwnersRes,
                aiCoachesRes
            ] = await Promise.all([
                axios.get('/admin/statistics/platform-analytics?ai=true'),
                axios.get('/admin/statistics/field-owners?ai=true'),
                axios.get('/admin/statistics/coaches?ai=true')
            ])

            // Update data with AI insights
            setAnalyticsData(aiAnalyticsRes.data)
            setFieldOwnerData(aiFieldOwnersRes.data || [])
            setCoachData(aiCoachesRes.data || [])
            setAiGenerated(true)

            toast.success('AI insights generated successfully!', {
                description: 'Fresh analysis completed with latest data.'
            })
        } catch (error) {
            console.error('Failed to generate AI insights', error)
            toast.error('AI analysis failed', {
                description: 'Using cached data instead.'
            })
        } finally {
            setAiThinking(false)
        }
    }

    // Manual refresh function
    const refreshData = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const data = await fetchRawData()
            setAnalyticsData(data.analytics)
            setFieldOwnerData(data.fieldOwners)
            setCoachData(data.coaches)

            // Reset AI generated flag since we have fresh raw data
            if (!aiGenerated) {
                setAiGenerated(false)
            }
        } catch (error) {
            console.error('Failed to fetch statistics', error)
            setError('Failed to load analytics data')
        } finally {
            setLoading(false)
        }
    }, [aiGenerated])

    // Setup polling for data
    useEffect(() => {
        // Initial fetch
        refreshData()

        // Set up polling every 5 seconds
        pollingIntervalRef.current = setInterval(refreshData, 500000)

        // Cleanup
        return () => {
            if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current)
            }
        }
    }, [refreshData])

    // Stop polling when component unmounts or tab changes
    useEffect(() => {
        if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current)
        }

        // Restart polling with new tab
        pollingIntervalRef.current = setInterval(refreshData, 500000)

        return () => {
            if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current)
            }
        }
    }, [activeTab, refreshData])

    if (loading) {
        return (
            <div className="flex justify-center items-center h-96">
                <Loader2 className="animate-spin h-8 w-8" />
            </div>
        )
    }

    // In your index.tsx, after the loading check, add:
    console.log('Analytics Data Structure:', analyticsData);
    console.log('Has summary?', !!analyticsData.summary);
    console.log('Has revenueAnalysis?', !!analyticsData.revenueAnalysis);
    console.log('Has popularityAnalysis?', !!analyticsData.popularityAnalysis);

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
            </div>
        )
    }

    return (
        <div className='flex flex-col space-y-6 p-6'>
            <div className='flex items-center justify-between'>
                <div>
                    <h2 className='text-3xl font-bold tracking-tight'>
                        AI-Powered Analytics Dashboard
                    </h2>
                    <p className='text-muted-foreground'>
                        Comprehensive insights and performance analytics
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={refreshData}
                        disabled={aiThinking}
                    >
                        <RefreshCw className={`h-4 w-4 mr-2 ${aiThinking ? 'animate-spin' : ''}`} />
                        Refresh Data
                    </Button>

                    <Button
                        variant="default"
                        size="sm"
                        onClick={triggerAiAnalysis}
                        disabled={aiThinking}
                    >
                        {aiThinking ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                AI Thinking...
                            </>
                        ) : (
                            <>
                                <Brain className="h-4 w-4 mr-2" />
                                {aiGenerated ? 'Refresh AI Insights' : 'Generate AI Insights'}
                            </>
                        )}
                    </Button>
                </div>
            </div>

            {!aiGenerated && (
                <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded">
                    <div className="flex items-center">
                        <Brain className="h-5 w-5 mr-2" />
                        <p>
                            <strong>AI Insights Available:</strong> Click "Generate AI Insights" button to get
                            intelligent analysis of your current data.
                        </p>
                    </div>
                </div>
            )}

            {activeTab === 'overview' && analyticsData.summary && (
                <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                ${analyticsData.summary.totalRevenue?.toLocaleString()}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {analyticsData.summary.growthRate}% from last year
                                {aiGenerated && <span className="ml-2 text-green-600">✓ AI Enhanced</span>}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {analyticsData.summary.totalBookings?.toLocaleString()}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Field & Coach bookings combined
                                {aiGenerated && <span className="ml-2 text-green-600">✓ AI Enhanced</span>}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {analyticsData.summary.totalUsers?.toLocaleString()}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Active platform users
                                {aiGenerated && <span className="ml-2 text-green-600">✓ AI Enhanced</span>}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {analyticsData.summary.averageRating?.toFixed(1)}/5
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Platform satisfaction score
                                {aiGenerated && <span className="ml-2 text-green-600">✓ AI Enhanced</span>}
                            </p>
                        </CardContent>
                    </Card>
                </div>
            )}

            <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="field-owners">Field Owners</TabsTrigger>
                    <TabsTrigger value="coaches">Coaches</TabsTrigger>
                    <TabsTrigger value="analytics">Advanced Analytics</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                    {analyticsData.revenueAnalysis && (
                        <StatisticsChart
                            data={analyticsData.revenueAnalysis}
                            activeTab="overview"
                            chartType="revenue"
                        />
                    )}

                    {/* Always render PlatformAnalytics if we have analyticsData */}
                    {Object.keys(analyticsData).length > 0 && (
                        <PlatformAnalytics data={analyticsData} aiGenerated={aiGenerated} />
                    )}
                </TabsContent>

                <TabsContent value="field-owners" className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Field Owners Performance</h3>
                        {aiGenerated && (
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                AI Enhanced
                            </span>
                        )}
                    </div>
                    <StatisticsChart data={fieldOwnerData} activeTab="field-owners" />
                    <StatisticsList data={fieldOwnerData} loading={false} activeTab="field-owners" aiGenerated={aiGenerated} />
                </TabsContent>

                <TabsContent value="coaches" className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Coaches Performance</h3>
                        {aiGenerated && (
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                AI Enhanced
                            </span>
                        )}
                    </div>
                    <StatisticsChart data={coachData} activeTab="coaches" />
                    <StatisticsList data={coachData} loading={false} activeTab="coaches" aiGenerated={aiGenerated} />
                </TabsContent>

                <TabsContent value="analytics" className="space-y-6">
                    {analyticsData.recommendations && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Target className="h-5 w-5" />
                                    Strategic Recommendations
                                    {aiGenerated && (
                                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                            AI Generated
                                        </span>
                                    )}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {analyticsData.recommendations.map((rec: string, idx: number) => (
                                        <div key={idx} className="p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                                            <div className="flex items-start gap-3">
                                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                                    <span className="text-sm font-semibold">{idx + 1}</span>
                                                </div>
                                                <p className="text-sm">{rec}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    )
}