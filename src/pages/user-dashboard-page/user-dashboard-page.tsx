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
import { UserDashboardTabs } from "@/components/ui/user-dashboard-tabs"
import { NavbarDarkComponent } from "@/components/header/navbar-dark-component"
import { UserDashboardHeader } from "@/components/header/user-dashboard-header"
import { mockBookings, mockCoachingSessions, mockFavorites, mockInvoices } from "@/components/mock-data/mock-data"
import { useState, useEffect, useRef } from "react"
export default function UserDashboardPage() {
    const [selectedTab, setSelectedTab] = useState<'court' | 'coaching'>('court')
    const [openDropdown, setOpenDropdown] = useState<string | null>(null)
    const dropdownRef = useRef<HTMLDivElement>(null)
    
    const handleMoreClick = (itemId: string) => {
        setOpenDropdown(openDropdown === itemId ? null : itemId)
    }
    
    const handleCancel = (itemId: string) => {
        console.log('Cancel booking:', itemId)
        setOpenDropdown(null)
    }
    
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
    
    return (
        <>
            <NavbarDarkComponent />
            {/* body */}
            <div className="min-h-screen">
                {/* Header Section */}
                <UserDashboardHeader />


                {/* Navigation Tabs */}
                <UserDashboardTabs />
                <div className="container mx-auto px-12 py-8">
                    <div className="space-y-8">
                        {/* Statistics Section */}
                            <div className="bg-white border rounded-xl p-6 shadow-sm border-gray-200">
                                <div>
                                    <h2 className="text-2xl font-semibold mb-2 text-start">Thống kê</h2>
                                    <p className="text-muted-foreground mb-6 text-start">Nâng cao trình độ với thống kê và mục tiêu được cá nhân hóa</p>
                                </div>
                                {/* Divider */}
                                <div className="border-t border-gray-200 my-6" />
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                                    <Card className="bg-gray-100 border-0 shadow-none">
                                        <CardContent className="p-6">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-3xl font-bold text-green-600 text-start">78</p>
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
                                                    <p className="text-3xl font-bold text-blue-600 text-start">45</p>
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
                                                    <p className="text-3xl font-bold text-purple-600 text-start">06</p>
                                                    <p className="text-sm text-muted-foreground text-start">Tổng số buổi học</p>
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
                                                    <p className="text-3xl font-bold text-emerald-600 text-start">$45,056</p>
                                                    <p className="text-sm text-muted-foreground text-start">Thanh toán</p>
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
                            <div >
                                <Card className="bg-white border rounded-xl p-6 shadow-sm border-gray-200">
                                    <CardHeader>
                                        <CardTitle className="text-xl font-semibold mb-2 text-start">Lịch hẹn hôm nay</CardTitle>
                                        <p className="text-muted-foreground text-start">Lịch trình cầu lông cá nhân của bạn</p>
                                    </CardHeader>
                                    {/* Divider */}
                                    <div className="border-t border-gray-200" />
                                    <CardContent>
                                        <div className="flex items-center gap-4 p-4 rounded-lg">
                                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                                                <span className="text-white font-semibold text-sm text-start">SC</span>
                                            </div>
                                            <div className="flex-1 grid grid-cols-6 gap-4 text-sm">
                                                <div className="text-start">
                                                    <p className="font-medium text-start">Tên sân</p>
                                                    <p className="text-muted-foreground text-start">Sân tổng hợp tiêu chuẩn 1</p>
                                                </div>
                                                <div className="text-start">
                                                    <p className="font-medium text-start">Ngày hẹn</p>
                                                    <p className="text-muted-foreground text-start">Thứ 2, 11/7</p>
                                                </div>
                                                <div className="text-start">
                                                    <p className="font-medium text-start">Giờ bắt đầu</p>
                                                    <p className="text-muted-foreground text-start">05:25 sáng</p>
                                                </div>
                                                <div className="text-start">
                                                    <p className="font-medium text-start">Giờ kết thúc</p>
                                                    <p className="text-muted-foreground text-start">06:25 sáng</p>
                                                </div>
                                                <div className="text-start">
                                                    <p className="font-medium text-start">Khách mời thêm</p>
                                                    <p className="text-muted-foreground text-start">4</p>
                                                </div>
                                                <div className="text-start">
                                                    <p className="font-medium text-start">Địa điểm</p>
                                                    <p className="text-muted-foreground text-start">Sant Marco</p>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                            {/* My Bookings, wallet, upcoming, favourites */}
                            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                                {/* Left Column */}
                                <div className="lg:col-span-3 space-y-8">
                                    {/* My Bookings */}
                                    <Card className="bg-white border rounded-xl p-6 shadow-sm border-gray-200">
                                        <CardHeader className="flex flex-row items-center justify-between py-2">
                                            <div className="flex flex-col space-y-1">
                                                <CardTitle className="text-xl font-semibold mb-2 text-start">Đặt sân của tôi</CardTitle>
                                                <p className="text-muted-foreground text-start">Đặt sân dễ dàng</p>
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
                                            <div className="border-t border-gray-200" />
                                            {selectedTab === 'court' ? (
                                                mockBookings.map((booking, index) => (
                                                    <div key={booking.id}>
                                                        <div className="flex items-center gap-4 p-4">
                                                            <div
                                                                className={`w-12 h-12 bg-gradient-to-br ${booking.color} rounded-lg flex items-center justify-center`}
                                                            >
                                                                <span className="text-white font-semibold text-xs">
                                                                    {booking.name
                                                                        .split(" ")
                                                                        .map((w) => w[0])
                                                                        .join("")}
                                                                </span>
                                                            </div>
                                                            <div className="flex-1 grid grid-cols-3 gap-4 text-sm text-start">
                                                                <div>
                                                                    <p className="font-medium">{booking.name}</p>
                                                                    <p className="text-muted-foreground">{booking.court}</p>
                                                                        <p className="text-muted-foreground">
                                                                        Khách: {booking.guests} • {booking.hours}
                                                                    </p>
                                                                </div>
                                                                <div>
                                                                    <p className="font-medium">Date & Time</p>
                                                                    <p className="text-muted-foreground">{booking.date}</p>
                                                                    <p className="text-muted-foreground">{booking.time}</p>
                                                                </div>
                                                    <div className="flex items-center justify-between">
                                                        <p className="text-lg font-bold text-green-600">{booking.price}</p>
                                                        <div className="relative" ref={dropdownRef}>
                                                            <Button 
                                                                variant="ghost" 
                                                                size="sm"
                                                                onClick={() => handleMoreClick(booking.id)}
                                                            >
                                                                <MoreHorizontal className="w-4 h-4" />
                                                            </Button>
                                                            {openDropdown === booking.id && (
                                                                <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[120px]">
                                                                    <button
                                                                        className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 rounded-lg"
                                                                        onClick={() => handleCancel(booking.id)}
                                                                    >
                                                                        <X className="w-4 h-4" />
                                                                        Cancel
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                            </div>
                                                        </div>
                                                        {index < mockBookings.length - 1 && (
                                                            <div className="border-t border-gray-200 mx-4" />
                                                        )}
                                                    </div>
                                                ))
                                            ) : (
                                                mockCoachingSessions.map((coach, index) => (
                                                    <div key={coach.id}>
                                                        <div className="flex items-center gap-4 p-4">
                                                            <div
                                                                className={`w-12 h-12 bg-gradient-to-br ${coach.color} rounded-lg flex items-center justify-center`}
                                                            >
                                                                <span className="text-white font-semibold text-xs">
                                                                    {coach.avatar}
                                                                </span>
                                                            </div>
                                                            <div className="flex-1 grid grid-cols-3 gap-4 text-sm text-start">
                                                                <div>
                                                                    <p className="font-medium">{coach.name}</p>
                                                                    <p className="text-muted-foreground">Một lần</p>
                                                                </div>
                                                                <div>
                                                                    <p className="font-medium">Date & Time</p>
                                                                    <p className="text-muted-foreground">{coach.date}</p>
                                                                    <p className="text-muted-foreground">{coach.time}</p>
                                                                </div>
                                                                <div className="flex items-center justify-between">
                                                                    <p className="text-lg font-bold text-green-600">{coach.price}</p>
                                                                    <div className="relative" ref={dropdownRef}>
                                                                        <Button 
                                                                            variant="ghost" 
                                                                            size="sm"
                                                                            onClick={() => handleMoreClick(coach.id)}
                                                                        >
                                                                            <MoreHorizontal className="w-4 h-4" />
                                                                        </Button>
                                                                        {openDropdown === coach.id && (
                                                                            <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[120px]">
                                                                                <button
                                                                                    className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 rounded-lg"
                                                                                    onClick={() => handleCancel(coach.id)}
                                                                                >
                                                                                    <X className="w-4 h-4" />
                                                                                    Cancel
                                                                                </button>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        {index < mockCoachingSessions.length - 1 && (
                                                            <div className="border-t border-gray-200 mx-4" />
                                                        )}
                                                    </div>
                                                ))
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
                                                    className="bg-white/20 hover:bg-white/30 text-white border-white/30 flex items-center justify-center gap-2"
                                                >
                                                    <Wallet className="w-4 h-4" />
                                                    Thêm thanh toán
                                                </Button>
                                            </div>


                                        </CardContent>
                                    </Card>

                                    {/* Upcoming Appointment */}
                                    <Card className="bg-white border rounded-xl p-6 shadow-sm border-gray-200">
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
                                            <div className="border-t border-gray-200 pt-4">
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
                                    <Card className="bg-white border rounded-xl p-6 shadow-sm border-gray-200">
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
                                            <div className="border-t border-gray-200 pt-4">
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
                                                         {index < 2 && <div className="border-t border-gray-200 mx-3" />}
                                                     </div>
                                                 ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                            {/* Recent Invoices Section */}
                            <Card className="bg-white border rounded-xl p-6 shadow-sm border-gray-200">
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
                                    <div className="border-t border-gray-200 pt-4">
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
                                                        <div className="border-t border-gray-200" />
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                    </div>
                </div>
            </div>

        </>
    )
}
