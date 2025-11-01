import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Calendar,
    Wallet,
    Clock,
    Users,
    ChevronRight,
    MoreHorizontal,
    X,
} from "lucide-react"
import { UserDashboardTabs } from "@/components/tabs/user-dashboard-tabs"
import { NavbarDarkComponent } from "@/components/header/navbar-dark-component"
import { UserDashboardHeader } from "@/components/header/user-dashboard-header"
import { PageWrapper } from "@/components/layouts/page-wrapper"
import { mockFavorites, mockInvoices } from "@/components/mock-data/mock-data"
import { useState, useEffect, useRef } from "react"
import { useAppSelector, useAppDispatch } from "../../store/hook"
import { getMyBookings, cancelFieldBooking } from "../../features/booking/bookingThunk"
import type { Booking } from "../../types/booking-type"

export default function UserDashboardPage() {
    const dispatch = useAppDispatch()
    const bookingState = useAppSelector((state) => state?.booking)
    const bookings = bookingState?.bookings || []
    const pagination = bookingState?.pagination || null
    const loading = bookingState?.loading || false
    const error = bookingState?.error || null
    
    const [selectedTab, setSelectedTab] = useState<'court' | 'coaching'>('court')
    const [openDropdown, setOpenDropdown] = useState<string | null>(null)
    const dropdownRef = useRef<HTMLDivElement>(null)

    const handleMoreClick = (itemId: string) => {
        setOpenDropdown(openDropdown === itemId ? null : itemId)
    }

    const handleCancel = async (bookingId: string) => {
        try {
            await dispatch(cancelFieldBooking({ id: bookingId })).unwrap()
            setOpenDropdown(null)
            // Refresh bookings after cancellation
            dispatch(getMyBookings({ type: selectedTab === 'court' ? 'field' : 'coach' }))
        } catch (error) {
            console.error('Failed to cancel booking:', error)
        }
    }

    // Load bookings when component mounts and when selectedTab changes
    useEffect(() => {
        dispatch(getMyBookings({ type: selectedTab === 'court' ? 'field' : 'coach' }))
    }, [dispatch, selectedTab])

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setOpenDropdown(null)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [])

    // Helper function to format booking data for display
    const formatBookingData = (booking: Booking) => {
        const field = typeof booking.field === 'object' ? booking.field : null
        const user = typeof booking.user === 'object' ? booking.user : null
        
        // Format date - handle both ISO string and date string formats
        const bookingDate = new Date(booking.date)
        const formattedDate = bookingDate.toLocaleDateString('vi-VN', {
            weekday: 'long',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        })
        
        // Format price with Vietnamese currency
        const formattedPrice = new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(booking.totalPrice)
        
        return {
            id: booking._id,
            name: field?.name || 'Unknown Field',
            court: field?.sportType || 'Unknown Sport',
            date: formattedDate,
            time: `${booking.startTime} - ${booking.endTime}`,
            price: formattedPrice,
            status: booking.status,
            color: booking.status === 'confirmed' ? 'from-green-500 to-green-600' : 
                   booking.status === 'pending' ? 'from-yellow-500 to-yellow-600' :
                   booking.status === 'cancelled' ? 'from-red-500 to-red-600' : 'from-gray-500 to-gray-600'
        }
    }

    // Debug logging
    console.log('Bookings from Redux:', bookings)
    console.log('Pagination from Redux:', pagination)
    console.log('Bookings type:', typeof bookings)
    console.log('Is array:', Array.isArray(bookings))

    // Filter bookings by type
    const filteredBookings = bookings.filter(booking => {
        if (selectedTab === 'court') {
            return booking.type === 'field'
        } else {
            return booking.type === 'coach'
        }
    })

    // Get today's bookings
    const today = new Date().toISOString().split('T')[0]
    const todayBookings = bookings.filter(booking => booking.date === today && booking.status === 'confirmed')
    const nextBooking = todayBookings.length > 0 ? todayBookings[0] : null

    // Early return if bookings is not properly initialized
    if (!Array.isArray(bookings)) {
        return (
            <>
                <NavbarDarkComponent />
                <PageWrapper className="min-h-screen">
                    <div className="flex items-center justify-center py-8">
                        <div className="text-muted-foreground">Đang khởi tạo...</div>
                    </div>
                </PageWrapper>
            </>
        )
    }

    return (
        <>
            <NavbarDarkComponent />
            <PageWrapper className="min-h-screen">
                <UserDashboardHeader />
                <UserDashboardTabs />

                <div className="max-w-[1320px] mx-auto py-8 space-y-8">
                    {/* Statistics Section */}
                    <div className="bg-white rounded-xl p-6 shadow-lg">
                        <div>
                            <h2 className="text-2xl font-semibold mb-2 text-start">Thống kê</h2>
                            <p className="text-muted-foreground mb-6 text-start">Nâng cao trình độ với thống kê và mục tiêu được cá nhân hóa</p>
                        </div>
                        <div className="border-t border-gray-100 my-6" />
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            <Card className="bg-gray-100 border-0 shadow-none">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-3xl font-bold text-green-600 text-start">
                                                {bookings.filter(b => b.type === 'field').length}
                                            </p>
                                            <p className="text-sm text-muted-foreground text-start">Tổng số sân đã đặt</p>
                                        </div>
                                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                            <Calendar className="w-6 h-6 text-green-600" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-gray-100 border-0 shadow-none">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-3xl font-bold text-blue-600 text-start">
                                                {bookings.filter(b => b.type === 'coach').length}
                                            </p>
                                            <p className="text-sm text-muted-foreground text-start">Tổng số huấn luyện viên đã đặt</p>
                                        </div>
                                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                            <Users className="w-6 h-6 text-blue-600" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-gray-100 border-0 shadow-none">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-3xl font-bold text-purple-600 text-start">
                                                {bookings.filter(b => b.status === 'confirmed').length}
                                            </p>
                                            <p className="text-sm text-muted-foreground text-start">Đặt sân đã xác nhận</p>
                                        </div>
                                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                            <Clock className="w-6 h-6 text-purple-600" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-gray-100 border-0 shadow-none">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-3xl font-bold text-emerald-600 text-start">
                                                {new Intl.NumberFormat('vi-VN', {
                                                    style: 'currency',
                                                    currency: 'VND'
                                                }).format(bookings.reduce((total, booking) => total + booking.totalPrice, 0))}
                                            </p>
                                            <p className="text-sm text-muted-foreground text-start">Tổng thanh toán</p>
                                        </div>
                                        <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                                            <Wallet className="w-6 h-6 text-emerald-600" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Today's Appointment Section */}
                    <Card className="bg-white rounded-xl p-6 shadow-lg border-0">
                        <CardHeader>
                            <CardTitle className="text-xl font-semibold mb-2 text-start">Lịch hẹn hôm nay</CardTitle>
                            <p className="text-muted-foreground text-start">Lịch trình cầu lông cá nhân của bạn</p>
                        </CardHeader>
                        <div className="border-t border-gray-100" />
                        <CardContent>
                            {nextBooking ? (
                                <div className="flex items-center gap-4 p-4 rounded-lg">
                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                                        <span className="text-white font-semibold text-sm text-start">
                                            {typeof nextBooking.field === 'object' && nextBooking.field 
                                                ? nextBooking.field.name.split(' ').map(w => w[0]).join('')
                                                : 'SC'
                                            }
                                        </span>
                                    </div>
                                    <div className="flex-1 grid grid-cols-6 gap-4 text-sm">
                                        <div className="text-start">
                                            <p className="font-medium text-start">Tên sân</p>
                                            <p className="text-muted-foreground text-start">
                                                {typeof nextBooking.field === 'object' && nextBooking.field 
                                                    ? nextBooking.field.name 
                                                    : 'Unknown Field'
                                                }
                                            </p>
                                        </div>
                                        <div className="text-start">
                                            <p className="font-medium text-start">Ngày hẹn</p>
                                            <p className="text-muted-foreground text-start">
                                                {new Date(nextBooking.date).toLocaleDateString('vi-VN', {
                                                    weekday: 'long',
                                                    year: 'numeric',
                                                    month: '2-digit',
                                                    day: '2-digit'
                                                })}
                                            </p>
                                        </div>
                                        <div className="text-start">
                                            <p className="font-medium text-start">Giờ bắt đầu</p>
                                            <p className="text-muted-foreground text-start">{nextBooking.startTime}</p>
                                        </div>
                                        <div className="text-start">
                                            <p className="font-medium text-start">Giờ kết thúc</p>
                                            <p className="text-muted-foreground text-start">{nextBooking.endTime}</p>
                                        </div>
                                        <div className="text-start">
                                            <p className="font-medium text-start">Loại</p>
                                            <p className="text-muted-foreground text-start">
                                                {nextBooking.type === 'field' ? 'Sân thể thao' : 'Huấn luyện viên'}
                                            </p>
                                        </div>
                                        <div className="text-start">
                                            <p className="font-medium text-start">Trạng thái</p>
                                            <p className="text-muted-foreground text-start">{nextBooking.status}</p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center py-8">
                                    <div className="text-muted-foreground">Không có lịch hẹn nào hôm nay</div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* My Bookings, wallet, upcoming, favourites */}
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                        {/* Left Column */}
                        <div className="lg:col-span-3 space-y-8">
                            {/* My Bookings */}
                            <Card className="bg-white rounded-xl p-6 shadow-lg border-0">
                                <CardHeader className="flex flex-row items-center justify-between py-2">
                                    <div className="flex flex-col space-y-1">
                                        <CardTitle className="text-xl font-semibold mb-2 text-start">Đặt sân của tôi</CardTitle>
                                        <p className="text-muted-foreground text-start">
                                            Đặt sân dễ dàng
                                            {pagination && (
                                                <span className="ml-2 text-sm">
                                                    ({pagination.total} booking{pagination.total !== 1 ? 's' : ''})
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                    <div className="flex gap-2 bg-gray-100 rounded-lg p-2">
                                        <Badge
                                            variant={selectedTab === 'court' ? 'default' : 'outline'}
                                            className={`px-4 py-2 text-sm font-medium ${selectedTab === 'court' ? 'bg-green-600' : 'border-0 bg-transparent hover:bg-black hover:text-white transition-colors duration-200 cursor-pointer'}`}
                                            onClick={() => setSelectedTab('court')}
                                        >
                                            Court
                                        </Badge>
                                        <Badge
                                            variant={selectedTab === 'coaching' ? 'default' : 'outline'}
                                            className={`px-4 py-2 text-sm font-medium ${selectedTab === 'coaching' ? 'bg-green-600' : 'border-0 bg-transparent hover:bg-black hover:text-white transition-colors duration-200 cursor-pointer'}`}
                                            onClick={() => setSelectedTab('coaching')}
                                        >
                                            Coaching
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4 text-start">
                                    <div className="border-t border-gray-100" />
                                    {loading ? (
                                        <div className="flex items-center justify-center py-8">
                                            <div className="text-muted-foreground">Đang tải...</div>
                                        </div>
                                    ) : error ? (
                                        <div className="flex items-center justify-center py-8">
                                            <div className="text-red-600">Lỗi: {error.message}</div>
                                        </div>
                                    ) : filteredBookings.length === 0 ? (
                                        <div className="flex items-center justify-center py-8">
                                            <div className="text-muted-foreground">Chưa có booking nào</div>
                                        </div>
                                    ) : (
                                        filteredBookings.map((booking, index) => {
                                            const formattedBooking = formatBookingData(booking)
                                            return (
                                                <div key={booking._id}>
                                                    <div className="flex items-center gap-4 p-4">
                                                        <div
                                                            className={`w-12 h-12 bg-gradient-to-br ${formattedBooking.color} rounded-lg flex items-center justify-center`}
                                                        >
                                                            <span className="text-white font-semibold text-xs">
                                                                {formattedBooking.name
                                                                    .split(" ")
                                                                    .map((w) => w[0])
                                                                    .join("")}
                                                            </span>
                                                        </div>
                                                        <div className="flex-1 grid grid-cols-3 gap-4 text-sm text-start">
                                                            <div>
                                                                <p className="font-medium">{formattedBooking.name}</p>
                                                                <p className="text-muted-foreground">{formattedBooking.court}</p>
                                                                <p className="text-muted-foreground">
                                                                    Trạng thái: {formattedBooking.status}
                                                                </p>
                                                            </div>
                                                            <div>
                                                                <p className="font-medium">Date & Time</p>
                                                                <p className="text-muted-foreground">{formattedBooking.date}</p>
                                                                <p className="text-muted-foreground">{formattedBooking.time}</p>
                                                            </div>
                                                            <div className="flex items-center justify-between">
                                                                <p className="text-lg font-bold text-green-600">{formattedBooking.price}</p>
                                                                {booking.status !== 'cancelled' && (
                                                                    <div className="relative" ref={dropdownRef}>
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            onClick={() => handleMoreClick(booking._id)}
                                                                        >
                                                                            <MoreHorizontal className="w-4 h-4" />
                                                                        </Button>
                                                                        {openDropdown === booking._id && (
                                                                            <div className="absolute right-0 top-8 bg-white rounded-lg shadow-xl z-10 min-w-[120px]">
                                                                                <button
                                                                                    className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 rounded-lg"
                                                                                    onClick={() => handleCancel(booking._id)}
                                                                                >
                                                                                    <X className="w-4 h-4" />
                                                                                    Cancel
                                                                                </button>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {index < filteredBookings.length - 1 && (
                                                        <div className="border-t border-gray-100 mx-4" />
                                                    )}
                                                </div>
                                            )
                                        })
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Right Column */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Wallet Balance */}
                            <Card className="bg-gradient-to-br from-green-600 to-green-700 text-white">
                                <CardContent>
                                    <div className="flex items-center justify-between mb-2">
                                        <div>
                                            <p className="text-sm opacity-90">Số dư ví của bạn</p>
                                            <p className="text-3xl font-bold">$4,544</p>
                                        </div>
                                        <Button
                                            variant="secondary"
                                            className="bg-white/20 hover:bg-white/30 text-white flex items-center justify-center gap-2"
                                        >
                                            <Wallet className="w-4 h-4" />
                                            Thêm thanh toán
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Upcoming Appointment */}
                            <Card className="bg-white rounded-xl p-6 shadow-lg border-0">
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <div className="flex flex-col space-y-2">
                                        <CardTitle className="text-start">Lịch hẹn sắp tới</CardTitle>
                                        <p className="text-sm text-muted-foreground text-start">Quản lý tất cả các đặt sân sắp tới của bạn.</p>
                                    </div>
                                    <div className="flex gap-2 bg-gray-100 rounded-lg p-2">
                                        <Badge variant="default" className="px-4 py-2 text-sm font-medium bg-green-600">
                                            Court
                                        </Badge>
                                        <Badge variant="outline" className="px-4 py-2 text-sm font-medium border-0 bg-transparent hover:bg-black hover:text-white transition-colors duration-200">
                                            Coaching
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="border-t border-gray-100 pt-4">
                                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                            <div className="w-10 h-10 bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg flex items-center justify-center">
                                                <span className="text-white font-semibold text-xs">LS</span>
                                            </div>
                                            <div className="flex-1 text-start">
                                                <p className="font-medium text-sm">Học viện thể thao Leap</p>
                                                <p className="text-xs text-muted-foreground">Sân 1</p>
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                                    <Clock className="w-3 h-3" />
                                                    <span>18:00 đến 20:00</span>
                                                </div>
                                            </div>
                                            <Button variant="ghost" size="sm">
                                                <MoreHorizontal className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* My Favourites */}
                            <Card className="bg-white rounded-xl p-6 shadow-lg border-0">
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <div className="flex flex-col space-y-2">
                                        <CardTitle className="text-start">Yêu thích của tôi</CardTitle>
                                        <p className="text-sm text-muted-foreground text-start">Danh sách sân yêu thích của tôi</p>
                                    </div>
                                    <div className="flex gap-2 bg-gray-100 rounded-lg p-2">
                                        <Badge variant="default" className="px-4 py-2 text-sm font-medium bg-green-600">
                                            Court
                                        </Badge>
                                        <Badge variant="outline" className="px-4 py-2 text-sm font-medium border-0 bg-transparent hover:bg-black hover:text-white transition-colors duration-200">
                                            Coaching
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="border-t border-gray-100 pt-4">
                                        {mockFavorites.map((favorite, index) => (
                                            <div key={`favorite-${index}`}>
                                                <div className="flex items-center gap-3 p-3 rounded-lg">
                                                    <div
                                                        className={`w-8 h-8 bg-gradient-to-br ${favorite.color} rounded-lg flex items-center justify-center`}
                                                    >
                                                        <span className="text-white font-semibold text-xs">
                                                            {favorite.name
                                                                .split(" ")
                                                                .map((w) => w[0])
                                                                .join("")}
                                                        </span>
                                                    </div>
                                                    <div className="flex-1 text-start">
                                                        <p className="font-medium text-sm">{favorite.name}</p>
                                                        <p className="text-xs text-muted-foreground">{favorite.bookings}</p>
                                                    </div>
                                                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                                                </div>
                                                {index < 2 && <div className="border-t border-gray-100 mx-3" />}
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Recent Invoices Section */}
                    <Card className="bg-white rounded-xl p-6 shadow-lg border-0">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-xl font-semibold mb-2 text-start">Hóa đơn gần đây</CardTitle>
                                <p className="text-muted-foreground text-start">Truy cập các hóa đơn gần đây liên quan đến đặt sân</p>
                            </div>
                            <div className="flex gap-2 bg-gray-100 rounded-lg p-2">
                                <Badge variant="default" className="px-4 py-2 text-sm font-medium bg-green-600">
                                    Court
                                </Badge>
                                <Badge variant="outline" className="px-4 py-2 text-sm font-medium border-0 bg-transparent hover:bg-black hover:text-white transition-colors duration-200">
                                    Coaching
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="border-t border-gray-100 pt-4">
                                <div className="space-y-4">
                                    <div className="grid grid-cols-5 gap-4 text-sm font-bold bg-gray-100 text-gray-700 pb-2 px-4 py-3">
                                        <div className="text-start">Tên sân</div>
                                        <div className="text-start">Ngày & Giờ</div>
                                        <div className="text-start">Thanh toán</div>
                                        <div className="text-start">Đã thanh toán</div>
                                        <div className="text-start">Trạng thái</div>
                                    </div>
                                    {mockInvoices.map((invoice, index) => (
                                        <div key={invoice.id}>
                                            <div className="grid grid-cols-5 gap-4 items-center py-3">
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className={`w-8 h-8 bg-gradient-to-br ${invoice.color} rounded-lg flex items-center justify-center`}
                                                    >
                                                        <span className="text-white font-semibold text-xs">
                                                            {invoice.name
                                                                .split(" ")
                                                                .map((w) => w[0])
                                                                .join("")}
                                                        </span>
                                                    </div>
                                                    <div className="text-start">
                                                        <p className="font-medium text-sm">{invoice.name}</p>
                                                        <p className="text-xs text-muted-foreground">{invoice.court}</p>
                                                    </div>
                                                </div>
                                                <div className="text-start">
                                                    <p className="text-sm">{invoice.date}</p>
                                                    <p className="text-xs text-muted-foreground">{invoice.time}</p>
                                                </div>
                                                <div className="font-semibold text-start">{invoice.payment}</div>
                                                <div className="text-sm text-muted-foreground text-start">{invoice.paidOn}</div>
                                                <div className="text-start">
                                                    <Badge variant="secondary" className="bg-green-100 text-green-700">
                                                        Đã thanh toán
                                                    </Badge>
                                                </div>
                                            </div>
                                            {index < mockInvoices.length - 1 && (
                                                <div className="border-t border-gray-100" />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </PageWrapper>
        </>
    )
}