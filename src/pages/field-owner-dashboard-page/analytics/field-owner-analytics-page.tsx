"use client"

import { FieldOwnerDashboardLayout } from "@/components/layouts/field-owner-dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { MessageSquare, TrendingUp, Users, Calendar, BarChart3, DollarSign } from "lucide-react"
import { useAppSelector } from "@/store/hook"

export default function FieldOwnerAnalyticsPage() {
    const { fields, fieldOwnerBookings } = useAppSelector((state) => state.field)
    
    // Tính toán thống kê
    const totalFields = fields.length
    const totalBookings = fieldOwnerBookings?.length || 0
    const confirmedBookings = fieldOwnerBookings?.filter(b => b.status === "confirmed" || b.transactionStatus === "succeeded").length || 0
    const totalRevenue = fieldOwnerBookings
        ?.filter(b => b.transactionStatus === 'succeeded')
        .reduce((sum, b) => sum + (b.bookingAmount || 0), 0) || 0

    const stats = [
        {
            title: "Tổng số sân",
            value: totalFields.toString(),
            icon: BarChart3,
            color: "text-blue-600",
            bgColor: "bg-blue-50"
        },
        {
            title: "Tổng lượt đặt",
            value: totalBookings.toString(),
            icon: Calendar,
            color: "text-green-600",
            bgColor: "bg-green-50"
        },
        {
            title: "Đặt sân đã xác nhận",
            value: confirmedBookings.toString(),
            icon: TrendingUp,
            color: "text-purple-600",
            bgColor: "bg-purple-50"
        },
        {
            title: "Tổng doanh thu",
            value: `${totalRevenue.toLocaleString('vi-VN')} ₫`,
            icon: DollarSign,
            color: "text-orange-600",
            bgColor: "bg-orange-50"
        }
    ]

    return (
        <FieldOwnerDashboardLayout>
            <div className="p-6 space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                        <MessageSquare className="h-8 w-8 text-green-600" />
                        Thống kê & Báo cáo
                    </h1>
                    <p className="text-gray-600 mt-2">
                        Xem tổng quan về hoạt động và hiệu suất của các sân thể thao
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {stats.map((stat, index) => {
                        const Icon = stat.icon
                        return (
                            <Card key={index} className="hover:shadow-lg transition-shadow">
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm font-medium text-gray-600">
                                        {stat.title}
                                    </CardTitle>
                                    <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                                        <Icon className={`h-5 w-5 ${stat.color}`} />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-gray-900">
                                        {stat.value}
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Revenue Chart Placeholder */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Biểu đồ Doanh thu</CardTitle>
                            <CardDescription>
                                Doanh thu theo tháng trong năm
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                                <div className="text-center text-gray-500">
                                    <BarChart3 className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                                    <p>Biểu đồ doanh thu sẽ được hiển thị ở đây</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Bookings Chart Placeholder */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Biểu đồ Đặt sân</CardTitle>
                            <CardDescription>
                                Số lượng đặt sân theo tháng
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                                <div className="text-center text-gray-500">
                                    <Calendar className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                                    <p>Biểu đồ đặt sân sẽ được hiển thị ở đây</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Additional Info */}
                <Card>
                    <CardHeader>
                        <CardTitle>Thông tin bổ sung</CardTitle>
                        <CardDescription>
                            Các tính năng thống kê nâng cao sẽ được phát triển trong tương lai
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                <Users className="h-5 w-5 text-gray-600" />
                                <div>
                                    <p className="font-medium text-gray-900">Phân tích khách hàng</p>
                                    <p className="text-sm text-gray-600">Đang phát triển</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                <TrendingUp className="h-5 w-5 text-gray-600" />
                                <div>
                                    <p className="font-medium text-gray-900">Xu hướng đặt sân</p>
                                    <p className="text-sm text-gray-600">Đang phát triển</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </FieldOwnerDashboardLayout>
    )
}

