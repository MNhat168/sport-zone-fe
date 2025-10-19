"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Clock, DollarSign, Building2, TrendingUp, Calendar } from "lucide-react"
import { NavbarDarkComponent } from "@/components/header/navbar-dark-component"
import { FieldOwnerDashboardHeader } from "@/components/header/field-owner-dashboard-header"
import { useState, useEffect } from "react"
import { useAppDispatch, useAppSelector } from "@/store/hook"
import { PageWrapper } from '@/components/layouts/page-wrapper'
import { getMyFields, getMyFieldsBookings } from "@/features/field/fieldThunk"
import { FieldOwnerDashboardTabs } from "@/components/ui/field-owner-dashboard-tabs"

export default function FieldOwnerDashboardPage() {
    const dispatch = useAppDispatch();
    
    // Redux state
    const { 
        fields, 
        fieldOwnerBookings,
        fieldOwnerBookingsLoading,
        fieldOwnerBookingsError
    } = useAppSelector((state) => state.field);

    const [selectedTab, setSelectedTab] = useState<"court" | "coaching">("court");
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 3;

    // Hàm để lọc và tải bookings
    const handleFilterBookings = (filters?: { 
        status?: "pending" | "confirmed" | "cancelled" | "completed"; 
        page?: number; 
        limit?: number 
    }) => {
        dispatch(getMyFieldsBookings({
            ...filters,
            page: filters?.page || currentPage,
            limit: filters?.limit || ITEMS_PER_PAGE
        }));
    };

    useEffect(() => {
        const loadOwnerData = () => {
            console.log("[useEffect] Đang tải dữ liệu chủ sân");

            // Lấy dữ liệu sân và lịch đặt bằng Redux thunks
            try {
                // Lấy dữ liệu sân của chủ sở hữu
                dispatch(getMyFields({}));

                // Lấy dữ liệu lịch đặt của chủ sở hữu với các tham số mặc định
                dispatch(getMyFieldsBookings({
                    page: 1,
                    limit: 50 // Lấy nhiều hơn để hiển thị đầy đủ
                }));
            } catch (err) {
                console.error("[loadOwnerData] Lỗi khi tải dữ liệu:", err);
            }
        };

        loadOwnerData();
    }, [dispatch]);

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Đặt lại thời gian về nửa đêm

    const isToday = (dateStr: string | undefined) => {
        if (!dateStr) return false;
        const date = new Date(dateStr);
        date.setHours(0, 0, 0, 0);
        return date.getTime() === today.getTime();
    };

    const isFuture = (dateStr: string | undefined) => {
        if (!dateStr) return false;
        const date = new Date(dateStr);
        date.setHours(0, 0, 0, 0);
        return date.getTime() > today.getTime();
    };

    // Sử dụng dữ liệu từ Redux store
    const bookingData = fieldOwnerBookings || [];

    // Debug log để kiểm tra dữ liệu
    console.log("🔍 [DEBUG] Booking data from Redux:", {
        bookingData,
        fieldOwnerBookings,
        fieldOwnerBookingsLoading,
        fieldOwnerBookingsError
    });

    // Hiển thị tất cả booking requests (không lọc theo status)
    const filteredBookings = bookingData;

    console.log("🔍 [DEBUG] All booking requests:", {
        filteredBookings,
        totalBookings: bookingData.length,
        pendingBookings: bookingData.filter(b => b.status === "pending").length,
        confirmedBookings: bookingData.filter(b => b.status === "confirmed").length,
        cancelledBookings: bookingData.filter(b => b.status === "cancelled").length,
        completedBookings: bookingData.filter(b => b.status === "completed").length
    });

    const totalPages = Math.ceil(filteredBookings.length / ITEMS_PER_PAGE);

    // Reset current page if it's beyond the total pages
    const validCurrentPage = Math.min(currentPage, Math.max(1, totalPages));

    const paginatedBookings = filteredBookings.slice(
        (validCurrentPage - 1) * ITEMS_PER_PAGE,
        validCurrentPage * ITEMS_PER_PAGE
    );

    console.log("🔍 [DEBUG] Pagination info:", {
        totalPages,
        currentPage,
        validCurrentPage,
        paginatedBookingsLength: paginatedBookings.length,
        filteredBookingsLength: filteredBookings.length
    });

    // Reset current page when filtered bookings change
    useEffect(() => {
        if (filteredBookings.length > 0 && currentPage > Math.ceil(filteredBookings.length / ITEMS_PER_PAGE)) {
            setCurrentPage(1);
        }
    }, [filteredBookings.length, currentPage]);

    const ongoingTodayBookings = bookingData.filter(
        (b) => b.status === "confirmed" && isToday(b.date)
    );

    const upcomingFutureBookings = bookingData.filter(
        (b) => b.status === "confirmed" && isFuture(b.date)
    );

    // Tính toán các chỉ số
    const totalFields = fields?.length || 0;
    const totalBookings = bookingData.length;
    const confirmedBookings = bookingData.filter(b => b.status === "confirmed").length;
    const totalRevenue = bookingData
        .filter(b => b.status === "confirmed")
        .reduce((sum, b) => sum + (b.totalPrice || 0), 0);

    // Dữ liệu cho phần thống kê
    const metrics = [
        {
            title: "Tổng số sân",
            value: totalFields.toString(),
            icon: Building2,
            color: "text-[#00775C]",
        },
        {
            title: "Tổng lượt đặt",
            value: totalBookings.toString(),
            icon: Calendar,
            color: "text-[#00775C]",
        },
        {
            title: "Lượt đặt đã xác nhận",
            value: confirmedBookings.toString(),
            icon: TrendingUp,
            color: "text-[#00775C]",
        },
        {
            title: "Tổng doanh thu",
            value: `${totalRevenue.toLocaleString('vi-VN')} ₫`,
            icon: DollarSign,
            color: "text-[#00775C]",
        },
    ]


    // Dữ liệu hoạt động gần đây từ Redux API (lấy 5 booking gần nhất)
    const recentActivity = bookingData
        .sort((a, b) => {
            // Sort by createdAt if available, otherwise by date
            const dateA = (a as any).createdAt || a.date;
            const dateB = (b as any).createdAt || b.date;
            return new Date(dateB).getTime() - new Date(dateA).getTime();
        })
        .slice(0, 5)
        .map(booking => {
            const userName = booking.customer?.fullName || "Người dùng không xác định";
            const fieldName = booking.fieldName || "Sân không xác định";
            const bookingDate = booking.date
                ? new Date(booking.date).toLocaleDateString("vi-VN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                })
                : "N/A";
            const bookingTime = `${booking.startTime || "N/A"} - ${booking.endTime || "N/A"}`;
            const amount = booking.totalPrice?.toLocaleString('vi-VN') + " ₫" || "0 ₫";
            
            let statusText = "";
            switch (booking.status) {
                case "pending":
                    statusText = "Đang chờ";
                    break;
                case "confirmed":
                    statusText = "Đã xác nhận";
                    break;
                case "completed":
                    statusText = "Hoàn thành";
                    break;
                case "cancelled":
                    statusText = "Đã hủy";
                    break;
                default:
                    statusText = "Không xác định";
            }

            return {
                date: bookingDate,
                time: bookingTime,
                user: userName,
                field: fieldName,
                amount: amount,
                status: statusText,
                bookingId: booking.bookingId
            };
        });

    return (
        <>
            <NavbarDarkComponent />
            <PageWrapper>
                <div className="min-h-screen">
                    <FieldOwnerDashboardHeader />
                    <FieldOwnerDashboardTabs />
                    <div className="max-w-[1320px] mx-auto py-8 space-y-8">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Phần thống kê - Bên trái */}
                            <div className="lg:col-span-1">
                                <div className="bg-white rounded-xl p-4 shadow-lg">
                                    <div>
                                        <h4 className="text-xl font-semibold mb-1 text-start">Thống kê</h4>
                                        <p className="text-muted-foreground mb-4 text-start">
                                            Theo dõi hiệu suất kinh doanh sân của bạn
                                        </p>
                                    </div>
                                    <div className="border-t border-gray-100 my-4" />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {metrics.map((metric, index) => (
                                            <Card key={index} className="bg-gray-50 border-0 shadow-none">
                                                <CardContent>
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <h3 className="text-xl font-bold text-green-600 text-start">{metric.value}</h3>
                                                            <p className="text-sm text-muted-foreground text-start">{metric.title}</p>
                                                        </div>
                                                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                                            <metric.icon className="w-6 h-6 text-blue-600" />
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="lg:col-span-1">
                                <div className="bg-white rounded-xl p-4 shadow-lg h-full">
                                    <div>
                                        <h4 className="text-xl font-semibold mb-1 text-start">Hồ sơ kinh doanh</h4>
                                        <p className="text-muted-foreground mb-4 text-start">
                                            Quản lý hồ sơ và cài đặt của chủ sân
                                        </p>
                                    </div>
                                    <div className="border-t border-gray-100 my-4" />

                                    {/* Tiến độ hôm nay */}
                                    <div className="mb-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-medium text-start">Lượt đặt hôm nay</span>
                                            <span className="text-sm font-medium text-start">{ongoingTodayBookings.length}</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div className="bg-green-500 h-2 rounded-full" style={{ width: `${Math.min((ongoingTodayBookings.length / (totalFields || 1)) * 100, 100)}%` }}></div>
                                        </div>
                                    </div>

                                    {/* Phần đã hoàn thành */}
                                    <div className="mb-4">
                                        <h3 className="text-sm font-semibold mb-2 text-start">Trạng thái hồ sơ</h3>
                                        <ul className="flex flex-wrap gap-2">
                                            <li className="flex items-center gap-2">
                                                <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                                                    <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                        <path
                                                            fillRule="evenodd"
                                                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                            clipRule="evenodd"
                                                        />
                                                    </svg>
                                                </div>
                                                <span className="text-sm text-start">Thông tin kinh doanh</span>
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                                                    <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                        <path
                                                            fillRule="evenodd"
                                                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                            clipRule="evenodd"
                                                        />
                                                    </svg>
                                                </div>
                                                <span className="text-sm text-start">Thiết lập thanh toán</span>
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                                                    <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                        <path
                                                            fillRule="evenodd"
                                                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                            clipRule="evenodd"
                                                        />
                                                    </svg>
                                                </div>
                                                <span className="text-sm text-start">Quản lý sân</span>
                                            </li>
                                        </ul>
                                    </div>

                                    {/* Phần cần hoàn thành */}
                                    <div>
                                        <h3 className="text-sm font-semibold mb-2 text-start">Cần hoàn thành</h3>
                                        <ul className="flex flex-wrap gap-2">
                                            <li className="flex items-center gap-2">
                                                <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                                                    <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                        <path
                                                            fillRule="evenodd"
                                                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                                            clipRule="evenodd"
                                                        />
                                                    </svg>
                                                </div>
                                                <span className="text-sm text-start">Thêm sân mới</span>
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                                                    <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                        <path
                                                            fillRule="evenodd"
                                                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                                            clipRule="evenodd"
                                                        />
                                                    </svg>
                                                </div>
                                                <span className="text-sm text-start">Thiết lập các mức giá</span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Phần lịch đặt trong ngày */}
                        <Card className="bg-white rounded-xl p-6 shadow-lg border-0">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="text-lg font-semibold mb-2 text-start">
                                        Lịch đặt trong ngày
                                    </CardTitle>
                                    <p className="text-muted-foreground text-start">
                                        Quản lý các lượt đặt và hoạt động trong ngày
                                    </p>
                                </div>
                                <Button className="bg-green-600 hover:bg-green-700 text-white">Xem tất cả</Button>
                            </CardHeader>
                            <div className="border-t border-gray-100" />
                            <CardContent>
                                {ongoingTodayBookings.length === 0 ? (
                                    <p className="text-muted-foreground text-center pt-4">Không có lịch đặt nào hôm nay</p>
                                ) : (
                                    ongoingTodayBookings.map((booking) => {
                                        const userName = booking.customer?.fullName || "Người dùng không xác định";
                                        const initials = userName
                                            .split(" ")
                                            .map((w) => w[0])
                                            .join("")
                                            .toUpperCase();
                                        const fieldName = booking.fieldName || "Sân không xác định";
                                        const bookingDate = booking.date
                                            ? new Date(booking.date).toLocaleDateString("vi-VN", {
                                                weekday: "short",
                                                month: "short",
                                                day: "numeric",
                                            })
                                            : "N/A";

                                        return (
                                            <div
                                                key={booking.bookingId}
                                                className="flex items-center p-4 bg-gray-50 rounded-lg mb-2"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                                        <Building2 className="w-6 h-6 text-blue-600" />
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-start">{fieldName}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3 ml-4">
                                                    <Avatar className="h-10 w-10">
                                                        <AvatarFallback className="bg-orange-100 text-orange-600">{initials}</AvatarFallback>
                                                    </Avatar>
                                                    <span className="font-medium text-start">{userName}</span>
                                                </div>
                                                <div className="flex-1 grid grid-cols-4 gap-6 text-sm ml-4">
                                                    <div>
                                                        <p className="font-medium text-muted-foreground text-start">Ngày đặt</p>
                                                        <p className="text-start">{bookingDate}</p>
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-muted-foreground text-start">Giờ bắt đầu</p>
                                                        <p className="text-start">{booking.startTime}</p>
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-muted-foreground text-start">Giờ kết thúc</p>
                                                        <p className="text-start">{booking.endTime}</p>
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-muted-foreground text-start">Số tiền</p>
                                                        <p className="text-start">{booking.totalPrice?.toLocaleString('vi-VN')} ₫</p>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </CardContent>
                        </Card>
                        {/* Phần hoạt động gần đây */}
                        <Card className="bg-white border rounded-xl shadow-sm border-gray-200">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="text-lg font-semibold text-start">Hoạt động gần đây</CardTitle>
                                    <p className="text-muted-foreground text-start">Xem các giao dịch và hoạt động gần đây</p>
                                </div>
                            </CardHeader>
                            <CardContent className="rounded-b-xl">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="bg-gray-50 border-b border-gray-200">
                                                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Khách hàng</th>
                                                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Sân</th>
                                                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Ngày</th>
                                                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Giờ</th>
                                                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Thanh toán</th>
                                                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Trạng thái</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {recentActivity.length === 0 ? (
                                                <tr>
                                                    <td colSpan={6} className="text-center py-12 text-muted-foreground">
                                                        Chưa có hoạt động nào
                                                    </td>
                                                </tr>
                                            ) : (
                                                recentActivity.map((activity) => (
                                                    <tr key={activity.bookingId} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                                        <td className="py-4 px-6">
                                                            <p className="font-medium text-sm text-gray-900 truncate text-start">{activity.user}</p>
                                                        </td>
                                                        <td className="py-4 px-6">
                                                            <p className="text-sm text-gray-700 truncate max-w-[200px] text-start">{activity.field}</p>
                                                        </td>
                                                        <td className="py-4 px-6">
                                                            <p className="text-sm text-gray-700 text-start">{activity.date}</p>
                                                        </td>
                                                        <td className="py-4 px-6">
                                                            <p className="text-sm text-gray-700 font-mono text-start">{activity.time}</p>
                                                        </td>
                                                        <td className="py-4 px-6">
                                                            <p className="font-semibold text-sm text-green-600 text-start">{activity.amount}</p>
                                                        </td>
                                                        <td className="py-4 px-6 flex justify-start">
                                                            <Badge
                                                                variant="secondary"
                                                                className={`text-xs font-medium ${
                                                                    activity.status === "Đã xác nhận"
                                                                        ? "bg-green-100 text-green-700 border-green-200"
                                                                        : activity.status === "Hoàn thành"
                                                                            ? "bg-blue-100 text-blue-700 border-blue-200"
                                                                            : activity.status === "Đã hủy"
                                                                                ? "bg-red-100 text-red-700 border-red-200"
                                                                                : "bg-yellow-100 text-yellow-700 border-yellow-200"
                                                                }`}
                                                            >
                                                                <p>{activity.status}</p>
                                                            </Badge>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>

                        
                        {/* Quản lý đặt sân & Doanh thu */}
                        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                            {/* Cột trái */}
                            <div className="lg:col-span-3 space-y-8">
                                {/* Yêu cầu đặt sân */}
                                <Card className="bg-white rounded-xl p-6 shadow-lg border-0">
                                    <CardHeader className="flex flex-row items-center justify-between py-2">
                                        <div className="flex flex-col space-y-1">
                                            <CardTitle className="text-lg font-semibold mb-2 text-start">Quản lý đặt sân</CardTitle>
                                            <p className="text-muted-foreground text-start">Xem và quản lý tất cả các lượt đặt sân từ khách hàng</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Button 
                                                variant="outline" 
                                                size="sm"
                                                onClick={() => handleFilterBookings({ page: 1 })}
                                                disabled={fieldOwnerBookingsLoading}
                                            >
                                                Làm mới
                                            </Button>
                                            <div className="flex gap-2 bg-gray-100 rounded-lg p-2">
                                                <Badge
                                                    variant={selectedTab === "court" ? "default" : "outline"}
                                                    className={`px-4 py-2 text-sm font-medium ${selectedTab === "court" ? "bg-green-600" : "border-0 bg-transparent hover:bg-black hover:text-white transition-colors duration-200 cursor-pointer"}`}
                                                    onClick={() => setSelectedTab("court")}
                                                >
                                                    Sân
                                                </Badge>
                                                <Badge
                                                    variant={selectedTab === "coaching" ? "default" : "outline"}
                                                    className={`px-4 py-2 text-sm font-medium ${selectedTab === "coaching" ? "bg-green-600" : "border-0 bg-transparent hover:bg-black hover:text-white transition-colors duration-200 cursor-pointer"}`}
                                                    onClick={() => setSelectedTab("coaching")}
                                                >
                                                    Huấn luyện
                                                </Badge>
                                            </div>
                                        </div>
                                    </CardHeader>

                                    <CardContent className="space-y-4 text-start">
                                        <div className="border-t border-gray-100" />

                                        {fieldOwnerBookingsLoading ? (
                                            <div className="flex justify-center items-center py-8">
                                                <div className="text-muted-foreground">Đang tải dữ liệu đặt sân...</div>
                                            </div>
                                        ) : fieldOwnerBookingsError ? (
                                            <div className="flex justify-center items-center py-8">
                                                <div className="text-red-600">Lỗi: {fieldOwnerBookingsError.message}</div>
                                            </div>
                                        ) : selectedTab === "court" && filteredBookings.length === 0 ? (
                                            <div className="text-center py-8 text-muted-foreground">
                                                Chưa có lượt đặt sân nào
                                            </div>
                                        ) : selectedTab === "court" && paginatedBookings.length > 0 ? (
                                            paginatedBookings.map((request) => {
                                                const userName = request.customer?.fullName || "Người dùng không xác định";

                                                const initials = userName
                                                    .split(" ")
                                                    .map((w) => w[0])
                                                    .join("")
                                                    .toUpperCase();

                                                const bookingDate = request.date
                                                    ? new Date(request.date).toLocaleDateString('vi-VN')
                                                    : "N/A";



                                                return (
                                                    <div key={request.bookingId}>
                                                        <div className="flex items-center gap-4 p-4">
                                                            <Avatar className="h-12 w-12">
                                                                <AvatarFallback className="bg-green-500 text-white font-semibold text-xs">{initials}</AvatarFallback>
                                                            </Avatar>

                                                            <div className="flex-1 grid grid-cols-3 gap-4 text-sm text-start">
                                                                <div>
                                                                    <p className="font-medium">{userName}</p>
                                                                    <p className="text-muted-foreground">{request.fieldName}</p>
                                                                    <p className="text-muted-foreground">
                                                                        {bookingDate} — {request.startTime || "N/A"} - {request.endTime || "N/A"}
                                                                    </p>
                                                                </div>

                                                                <div>
                                                                    <p className="font-medium">Trạng thái</p>
                                                                    <p
                                                                        className={`capitalize font-semibold ${request.status === "pending"
                                                                                ? "text-yellow-600"
                                                                                : request.status === "cancelled"
                                                                                    ? "text-red-600"
                                                                                    : request.status === "confirmed"
                                                                                        ? "text-green-600"
                                                                                        : request.status === "completed"
                                                                                            ? "text-blue-600"
                                                                                            : "text-gray-500"
                                                                            }`}
                                                                    >
                                                                        {request.status === 'pending' ? 'Đang chờ' : 
                                                                         request.status === 'cancelled' ? 'Đã hủy' : 
                                                                         request.status === 'confirmed' ? 'Đã xác nhận' : 
                                                                         request.status === 'completed' ? 'Hoàn thành' : 'Không xác định'}
                                                                    </p>
                                                                </div>

                                                                <div className="flex items-center justify-between">
                                                                    <p className="font-semibold text-green-600">
                                                                        {request.totalPrice?.toLocaleString('vi-VN')} ₫
                                                                    </p>
                                                                    {/* Hiển thị nút action dựa trên status */}
                                                                    {request.status === "pending" ? (
                                                                        <div className="flex space-x-2">
                                                                            <Button
                                                                                size="sm"
                                                                                className="bg-green-600 hover:bg-green-700"
                                                                            >
                                                                                Chấp nhận
                                                                            </Button>
                                                                            <Button
                                                                                size="sm"
                                                                                variant="outline"
                                                                                className="border-red-500 text-red-500 hover:bg-red-50"
                                                                            >
                                                                                Từ chối
                                                                            </Button>
                                                                        </div>
                                                                    ) : request.status === "confirmed" ? (
                                                                        <div className="flex space-x-2">
                                                                            <Button
                                                                                size="sm"
                                                                                variant="outline"
                                                                                className="border-blue-500 text-blue-500 hover:bg-blue-50"
                                                                            >
                                                                                Xem chi tiết
                                                                            </Button>
                                                                        </div>
                                                                    ) : request.status === "completed" ? (
                                                                        <div className="flex space-x-2">
                                                                            <Button
                                                                                size="sm"
                                                                                variant="outline"
                                                                                className="border-gray-500 text-gray-500 hover:bg-gray-50"
                                                                            >
                                                                                Đã hoàn thành
                                                                            </Button>
                                                                        </div>
                                                                    ) : request.status === "cancelled" ? (
                                                                        <div className="flex space-x-2">
                                                                            <Button
                                                                                size="sm"
                                                                                variant="outline"
                                                                                className="border-red-500 text-red-500 hover:bg-red-50"
                                                                            >
                                                                                Đã hủy
                                                                            </Button>
                                                                        </div>
                                                                    ) : null}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="border-t border-gray-100 mx-4" />
                                                    </div>
                                                );
                                            })
                                        ) : selectedTab === "court" && filteredBookings.length > 0 && paginatedBookings.length === 0 ? (
                                            <div className="text-center py-8 text-muted-foreground">
                                                Không có dữ liệu trong trang này
                                            </div>
                                        ) : null}
                                        {totalPages > 1 && (
                                            <div className="flex justify-center mt-4 space-x-2">
                                                <Button
                                                    variant="outline"
                                                    disabled={validCurrentPage === 1}
                                                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                                >
                                                    Trước
                                                </Button>
                                                <span className="self-center">
                                                    Trang {validCurrentPage} / {totalPages}
                                                </span>
                                                <Button
                                                    variant="outline"
                                                    disabled={validCurrentPage === totalPages}
                                                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                                                >
                                                    Sau
                                                </Button>
                                            </div>
                                        )}
                                    </CardContent>

                                </Card>
                            </div>

                            {/* Cột phải */}
                            <div className="lg:col-span-2 space-y-6">
                                {/* Tóm tắt doanh thu */}
                                <Card className="bg-gradient-to-br from-green-600 to-green-700 text-white">
                                    <CardContent>
                                        <div className="flex items-center justify-between mb-2 pt-6">
                                            <div>
                                                <p className="text-sm opacity-90">Doanh thu tháng này</p>
                                                <p className="text-xl font-bold">{totalRevenue.toLocaleString('vi-VN')} ₫</p>
                                            </div>
                                            <Button
                                                variant="secondary"
                                                className="bg-white/20 hover:bg-white/30 text-white flex items-center justify-center gap-2"
                                            >
                                                <DollarSign className="w-4 h-4" />
                                                Xem chi tiết
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Lịch đặt sắp tới */}
                                <Card className="bg-white rounded-xl p-6 shadow-lg border-0">
                                    <CardHeader className="flex flex-row items-center justify-between">
                                        <div className="flex flex-col space-y-2">
                                            <CardTitle className="text-start">Lịch đặt sắp tới</CardTitle>
                                            <p className="text-sm text-muted-foreground text-start">
                                                Quản lý tất cả các lịch đặt sân sắp tới.
                                            </p>
                                        </div>
                                        <div className="flex gap-2 bg-gray-100 rounded-lg p-2">
                                            <Badge variant="default" className="px-4 py-2 text-sm font-medium bg-green-600">
                                                Sân
                                            </Badge>
                                            <Badge
                                                variant="outline"
                                                className="px-4 py-2 text-sm font-medium border-0 bg-transparent hover:bg-black hover:text-white transition-colors duration-200"
                                            >
                                                Huấn luyện
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="border-t border-gray-100 pt-4">
                                            {upcomingFutureBookings.length === 0 ? (
                                                <p className="text-muted-foreground text-center">Không có lịch đặt sắp tới</p>
                                            ) : (
                                                upcomingFutureBookings.map((booking) => {
                                                    const userName = booking.customer?.fullName || "Người dùng không xác định";
                                                    const initials = userName
                                                        .split(" ")
                                                        .map((w) => w[0])
                                                        .join("")
                                                        .toUpperCase();

                                                    const fieldName = booking.fieldName || "Sân không xác định";

                                                    const bookingDate = booking.date
                                                        ? new Date(booking.date).toLocaleDateString("vi-VN", {
                                                            weekday: "short",
                                                            month: "short",
                                                            day: "numeric",
                                                        })
                                                        : "N/A";

                                                    return (
                                                        <div key={booking.bookingId} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg mb-3">
                                                            <Avatar className="h-10 w-10">
                                                                <AvatarFallback className="bg-blue-500 text-white font-semibold text-xs">{initials}</AvatarFallback>
                                                            </Avatar>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="font-medium text-gray-900 text-sm">{userName}</p>
                                                                <p className="text-sm text-gray-600 truncate">{fieldName}</p>
                                                                <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                                                                    <Clock className="w-3 h-3" />
                                                                    <span>{bookingDate} — {booking.startTime || "N/A"} - {booking.endTime || "N/A"}</span>
                                                                </div>
                                                            </div>
                                                            <Button variant="ghost" size="sm">
                                                                <TrendingUp className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                    );
                                                })
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>

                        
                    </div>
                </div>
            </PageWrapper>
        </>
    )
}