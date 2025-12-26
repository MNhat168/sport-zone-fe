"use client"
import { FieldOwnerDashboardLayout } from "@/components/layouts/field-owner-dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    DollarSign,
    TrendingUp,
    Calendar,
    Download,
    Filter,
    ChevronLeft,
    ChevronRight,
    MoreHorizontal
} from "lucide-react"
import { Loading } from "@/components/ui/loading"
import { useAppDispatch, useAppSelector } from "@/store/hook"
import { useMemo, useState, useEffect } from "react"
import { getMyFieldsBookings } from "@/features/field/fieldThunk"

// Custom Pagination Component
const CustomPagination = ({
    currentPage,
    totalPages,
    onPageChange,
    totalItems,
    itemsPerPage,
    currentStart,
    currentEnd
}: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    totalItems: number;
    itemsPerPage: number;
    currentStart: number;
    currentEnd: number;
}) => {
    const renderPageNumbers = () => {
        const maxPagesToShow = 5;
        const pageNumbers: number[] = []; // Explicitly type as number[]

        if (totalPages <= maxPagesToShow) {
            for (let i = 1; i <= totalPages; i++) {
                pageNumbers.push(i);
            }
        } else {
            const halfMax = Math.floor(maxPagesToShow / 2);
            let startPage = Math.max(1, currentPage - halfMax);
            let endPage = Math.min(totalPages, currentPage + halfMax);

            if (currentPage <= halfMax) {
                endPage = maxPagesToShow;
            } else if (currentPage >= totalPages - halfMax) {
                startPage = totalPages - maxPagesToShow + 1;
            }

            for (let i = startPage; i <= endPage; i++) {
                pageNumbers.push(i);
            }
        }

        return pageNumbers;
    };

    return (
        <div className="mt-6">
            <div className="flex items-center justify-center space-x-2">
                {/* Previous Button */}
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="h-8 w-8 p-0"
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>

                {/* First Page */}
                {currentPage > 3 && (
                    <>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onPageChange(1)}
                            className="h-8 w-8 p-0"
                        >
                            1
                        </Button>
                        {currentPage > 4 && (
                            <span className="px-1">
                                <MoreHorizontal className="h-4 w-4 text-gray-400" />
                            </span>
                        )}
                    </>
                )}

                {/* Page Numbers */}
                {renderPageNumbers().map((pageNum) => (
                    <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "ghost"}
                        size="sm"
                        onClick={() => onPageChange(pageNum)}
                        className="h-8 w-8 p-0"
                    >
                        {pageNum}
                    </Button>
                ))}

                {/* Last Page */}
                {currentPage < totalPages - 2 && (
                    <>
                        {currentPage < totalPages - 3 && (
                            <span className="px-1">
                                <MoreHorizontal className="h-4 w-4 text-gray-400" />
                            </span>
                        )}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onPageChange(totalPages)}
                            className="h-8 w-8 p-0"
                        >
                            {totalPages}
                        </Button>
                    </>
                )}

                {/* Next Button */}
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="h-8 w-8 p-0"
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>

            <div className="text-center mt-2 text-sm text-gray-500">
                Hiển thị {currentStart}-{currentEnd} của {totalItems} giao dịch
            </div>
        </div>
    );
};

export default function FieldOwnerRevenuePage() {
    const dispatch = useAppDispatch()
    const {
        fieldOwnerBookings,
        fieldOwnerBookingsLoading,
        fieldOwnerBookingsError,
        fieldOwnerBookingsPagination
    } = useAppSelector((state) => state.field)

    // Pagination state for bookings
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage] = useState(10)

    // Filter state
    const [selectedPeriod, setSelectedPeriod] = useState<"today" | "week" | "month" | "year">("month")

    // Fetch bookings with pagination
    useEffect(() => {
        dispatch(getMyFieldsBookings({
            page: currentPage,
            limit: itemsPerPage,
            transactionStatus: "succeeded" // Only fetch successful transactions for revenue
        }))
    }, [dispatch, currentPage, itemsPerPage])

    // Calculate period range
    const getPeriodRange = (period: "today" | "week" | "month" | "year") => {
        const now = new Date()
        const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
        let start: Date

        switch (period) {
            case "today":
                start = new Date(now.getFullYear(), now.getMonth(), now.getDate())
                break
            case "week": {
                const day = now.getDay() || 7
                start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (day - 1))
                break
            }
            case "year":
                start = new Date(now.getFullYear(), 0, 1)
                break
            case "month":
            default:
                start = new Date(now.getFullYear(), now.getMonth(), 1)
                break
        }
        return { start, end }
    }

    // Filter bookings by selected period
    const { periodRevenue, totalTransactions, averageRevenue } = useMemo(() => {
        const bookings = fieldOwnerBookings || []
        if (!bookings.length) {
            return {
                periodRevenue: 0,
                totalTransactions: 0,
                averageRevenue: 0,
            }
        }

        const { start, end } = getPeriodRange(selectedPeriod)

        const inRange = bookings.filter((b: any) => {
            const dateStr = b.bookingDate || b.createdAt || b.date
            if (!dateStr) return false
            const d = new Date(dateStr)
            if (Number.isNaN(d.getTime())) return false
            return d >= start && d < end
        })

        const revenue = inRange.reduce(
            (sum: number, b: any) => sum + (b.totalPrice || b.bookingAmount || 0),
            0
        )
        const txCount = inRange.length
        const avg = txCount > 0 ? revenue / txCount : 0

        return {
            periodRevenue: revenue,
            totalTransactions: txCount,
            averageRevenue: avg,
        }
    }, [fieldOwnerBookings, selectedPeriod])

    // Handle page change
    const handlePageChange = (page: number) => {
        setCurrentPage(page)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const periods = [
        { value: "today", label: "Hôm nay" },
        { value: "week", label: "Tuần này" },
        { value: "month", label: "Tháng này" },
        { value: "year", label: "Năm nay" }
    ]

    const totalPages = fieldOwnerBookingsPagination?.totalPages || 1
    const totalBookings = fieldOwnerBookingsPagination?.total || 0
    const startIndex = (currentPage - 1) * itemsPerPage + 1
    const endIndex = Math.min(currentPage * itemsPerPage, totalBookings)

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

                {/* Loading State */}
                {fieldOwnerBookingsLoading && (
                    <div className="flex items-center justify-center py-12 text-green-600">
                        <Loading size={32} className="mr-2" />
                        <span className="text-gray-600">Đang tải dữ liệu doanh thu...</span>
                    </div>
                )}

                {/* Error State */}
                {fieldOwnerBookingsError && !fieldOwnerBookingsLoading && (
                    <Card className="border-red-200 bg-red-50">
                        <CardContent className="py-6">
                            <div className="text-center text-red-600">
                                <p className="font-medium">Lỗi tải dữ liệu</p>
                                <p className="text-sm">{fieldOwnerBookingsError.message || "Có lỗi xảy ra khi tải dữ liệu doanh thu"}</p>
                                <Button
                                    variant="outline"
                                    className="mt-4 border-red-300 text-red-600 hover:bg-red-100"
                                    onClick={() => {
                                        setCurrentPage(1)
                                        dispatch(getMyFieldsBookings({
                                            page: 1,
                                            limit: itemsPerPage,
                                            transactionStatus: "succeeded"
                                        }))
                                    }}
                                >
                                    Thử lại
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Main Content - only show when not loading and no error */}
                {!fieldOwnerBookingsLoading && !fieldOwnerBookingsError && (
                    <>

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
                                        Tổng doanh thu ({periods.find(p => p.value === selectedPeriod)?.label.toLowerCase()})
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

                        {/* Recent Transactions with Pagination */}
                        <Card>
                            <CardHeader>
                                <div className="flex justify-between items-center">
                                    <div>
                                        <CardTitle>Giao dịch gần đây</CardTitle>
                                        <CardDescription>
                                            Danh sách các giao dịch thành công ({totalBookings} giao dịch)
                                        </CardDescription>
                                    </div>
                                    {totalBookings > itemsPerPage && (
                                        <div className="text-sm text-gray-500">
                                            Trang {currentPage} / {totalPages}
                                        </div>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent>
                                {fieldOwnerBookings?.length === 0 ? (
                                    <div className="text-center py-8 text-gray-500">
                                        <p>Chưa có giao dịch nào</p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="space-y-4">
                                            {fieldOwnerBookings?.map((booking: any, index: number) => (
                                                <div
                                                    key={booking.bookingId || index}
                                                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                                                >
                                                    <div className="flex-1">
                                                        <p className="font-medium text-gray-900">
                                                            {booking.fieldName || "Sân thể thao"}
                                                        </p>
                                                        <p className="text-sm text-gray-600">
                                                            {booking.date ? new Date(booking.date).toLocaleDateString('vi-VN') : "N/A"}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-bold text-green-600">
                                                            +{(booking.totalPrice || booking.bookingAmount || 0).toLocaleString('vi-VN')} ₫
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            {booking.status || "Đã xác nhận"}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Custom Pagination */}
                                        {totalBookings > itemsPerPage && (
                                            <CustomPagination
                                                currentPage={currentPage}
                                                totalPages={totalPages}
                                                onPageChange={handlePageChange}
                                                totalItems={totalBookings}
                                                itemsPerPage={itemsPerPage}
                                                currentStart={startIndex}
                                                currentEnd={endIndex}
                                            />
                                        )}
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </>
                )}
            </div>
        </FieldOwnerDashboardLayout>
    )
}