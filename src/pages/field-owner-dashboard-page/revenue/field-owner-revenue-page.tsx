"use client"

import { FieldOwnerDashboardLayout } from "@/components/layouts/field-owner-dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DollarSign, TrendingUp, Calendar, Download, Filter } from "lucide-react"
import { useAppSelector } from "@/store/hook"
import { useState } from "react"

export default function FieldOwnerRevenuePage() {
    const { fieldOwnerBookings } = useAppSelector((state) => state.field)
    const [selectedPeriod, setSelectedPeriod] = useState<"today" | "week" | "month" | "year">("month")

    // Tính toán doanh thu
    const allRevenue = fieldOwnerBookings
        ?.filter(b => b.transactionStatus === 'succeeded')
        .reduce((sum, b) => sum + (b.bookingAmount || 0), 0) || 0

    // Lọc theo period (placeholder logic)
    const filteredBookings = fieldOwnerBookings?.filter(b => b.transactionStatus === 'succeeded') || []
    const periodRevenue = allRevenue // Simplified - should filter by date

    // Tính toán thống kê
    const totalTransactions = filteredBookings.length
    const averageRevenue = totalTransactions > 0 ? periodRevenue / totalTransactions : 0

    const periods = [
        { value: "today", label: "Hôm nay" },
        { value: "week", label: "Tuần này" },
        { value: "month", label: "Tháng này" },
        { value: "year", label: "Năm nay" }
    ]

    return (
        <FieldOwnerDashboardLayout>
            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                            <DollarSign className="h-8 w-8 text-green-600" />
                            Quản lý Doanh thu
                        </h1>
                        <p className="text-gray-600 mt-2">
                            Theo dõi và quản lý doanh thu từ các đặt sân
                        </p>
                    </div>
                    <Button className="flex items-center gap-2">
                        <Download className="h-4 w-4" />
                        Xuất báo cáo
                    </Button>
                </div>

                {/* Period Filter */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Filter className="h-5 w-5" />
                            Lọc theo thời gian
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-2">
                            {periods.map((period) => (
                                <Button
                                    key={period.value}
                                    variant={selectedPeriod === period.value ? "default" : "outline"}
                                    onClick={() => setSelectedPeriod(period.value as any)}
                                    className={selectedPeriod === period.value ? "bg-green-600 hover:bg-green-700" : ""}
                                >
                                    {period.label}
                                </Button>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Revenue Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium text-gray-600">
                                Tổng doanh thu
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-gray-900">
                                {periodRevenue.toLocaleString('vi-VN')} ₫
                            </div>
                            <div className="flex items-center gap-1 mt-2 text-sm text-green-600">
                                <TrendingUp className="h-4 w-4" />
                                <span>+12.5% so với kỳ trước</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium text-gray-600">
                                Số giao dịch
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-gray-900">
                                {totalTransactions}
                            </div>
                            <div className="flex items-center gap-1 mt-2 text-sm text-gray-600">
                                <Calendar className="h-4 w-4" />
                                <span>Giao dịch thành công</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium text-gray-600">
                                Doanh thu trung bình
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-gray-900">
                                {averageRevenue.toLocaleString('vi-VN')} ₫
                            </div>
                            <div className="flex items-center gap-1 mt-2 text-sm text-gray-600">
                                <span>Trên mỗi giao dịch</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Revenue Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle>Biểu đồ Doanh thu</CardTitle>
                        <CardDescription>
                            Doanh thu theo thời gian
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                            <div className="text-center text-gray-500">
                                <TrendingUp className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                                <p>Biểu đồ doanh thu sẽ được hiển thị ở đây</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Transactions */}
                <Card>
                    <CardHeader>
                        <CardTitle>Giao dịch gần đây</CardTitle>
                        <CardDescription>
                            Danh sách các giao dịch thành công
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {filteredBookings.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <p>Chưa có giao dịch nào</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {filteredBookings.slice(0, 10).map((booking: any, index: number) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-900">
                                                {booking.fieldName || "Sân thể thao"}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                {booking.bookingDate ? new Date(booking.bookingDate).toLocaleDateString('vi-VN') : "N/A"}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-green-600">
                                                +{(booking.bookingAmount || 0).toLocaleString('vi-VN')} ₫
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {booking.status || "Đã xác nhận"}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </FieldOwnerDashboardLayout>
    )
}

