import { useState, useEffect } from "react"
import { useAppSelector } from "@/store/hook"
import { CoachDashboardLayout } from "@/components/layouts/coach-dashboard-layout"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, User, FileText } from "lucide-react" // Icons

const BookingStatusBadge = ({ status }: { status: string }) => {
    switch (status) {
        case "confirmed":
        case "completed":
            return <Badge className="bg-green-600">Đã xác nhận</Badge>
        case "pending":
            return <Badge className="bg-yellow-600">Chờ duyệt</Badge>
        case "cancelled":
            return <Badge className="bg-red-600">Đã hủy</Badge>
        default:
            return <Badge className="bg-gray-600">{status}</Badge>
    }
}

const getBookingDisplayStatus = (booking: any) => {
    if (booking.status === "completed") return "completed"
    if (booking.status === "cancelled" || booking.coachStatus === "declined")
        return "cancelled"
    if (booking.status === "confirmed" || booking.coachStatus === "accepted")
        return "confirmed"
    return "pending"
}

const PaymentStatusBadge = ({ status }: { status: string }) => {
    switch (status) {
        case "paid":
            return <Badge variant="outline" className="text-green-600 border-green-600">Đã thanh toán</Badge>
        case "unpaid":
            return <Badge variant="outline" className="text-yellow-600 border-yellow-600">Chưa thanh toán</Badge>
        case "refunded":
            return <Badge variant="outline" className="text-gray-600 border-gray-600">Đã hoàn tiền</Badge>
        default:
            return <Badge variant="outline">{status}</Badge>
    }
}


import axiosPrivate from "@/utils/axios/axiosPrivate"

export default function CoachBookingsPage() {
    const authUser = useAppSelector((state) => state.auth.user)
    const [bookings, setBookings] = useState<any[]>([])
    const [combinedBookings, setCombinedBookings] = useState<any[]>([]) // FIELD_COACH bookings
    const [loading, setLoading] = useState(true)
    const [loadingCombined, setLoadingCombined] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [errorCombined, setErrorCombined] = useState<string | null>(null)
    const [coachId, setCoachId] = useState<string | null>(null)
    useEffect(() => {
        const storedUser = sessionStorage.getItem("user")
        if (!storedUser) return

        const user = JSON.parse(storedUser)
        if (!user?._id) return

        axiosPrivate
            .get(`/profiles/coach-id/${user._id}`)
            .then((res) => {
                setCoachId(res.data?.data?.id)
            })
            .catch(console.error)
    }, [])
    useEffect(() => {
        const fetchBookings = async () => {
            try {
                // Fetch regular COACH bookings
                const response = await axiosPrivate.get('/bookings/coach/my-bookings/by-type?type=coach')
                const data = response.data;
                const bookingsData = Array.isArray(data) ? data : (data.data || []);
                setBookings(Array.isArray(bookingsData) ? bookingsData : [])
            } catch (err: any) {
                console.error("Error fetching bookings:", err)
                const errorMessage = err.response?.data?.message || err.message || "Không thể tải danh sách đặt lịch";
                setError(errorMessage)
            } finally {
                setLoading(false)
            }
        }

        const fetchCombinedBookings = async () => {
            try {
                // Fetch FIELD_COACH combined bookings
                const response = await axiosPrivate.get('/bookings/coach/my-bookings/by-type?type=field_coach')
                const data = response.data;
                const bookingsData = Array.isArray(data) ? data : (data.data || []);
                setCombinedBookings(Array.isArray(bookingsData) ? bookingsData : [])
            } catch (err: any) {
                console.error("Error fetching combined bookings:", err)
                const errorMessage = err.response?.data?.message || err.message || "Không thể tải danh sách đặt lịch kết hợp";
                setErrorCombined(errorMessage)
            } finally {
                setLoadingCombined(false)
            }
        }

        if (authUser) {
            fetchBookings()
            fetchCombinedBookings()
        }
    }, [authUser])
    const handleCompleteBooking = async (bookingId: string) => {
        if (!coachId) return

        try {
            await axiosPrivate.patch(
                `/bookings/coach/${coachId}/${bookingId}/complete`
            )

            setBookings((prev) =>
                prev.map((b) =>
                    (b._id || b.id) === bookingId
                        ? { ...b, status: "completed" }
                        : b
                )
            )
        } catch (err) {
            console.error("Complete booking failed", err)
        }
    }

    const handleCancelBooking = async (bookingId: string) => {
        if (!coachId) return

        try {
            await axiosPrivate.patch(
                `/bookings/coach/${coachId}/${bookingId}/cancel`
            )

            setBookings((prev) =>
                prev.map((b) =>
                    (b._id || b.id) === bookingId
                        ? { ...b, status: "cancelled", coachStatus: "declined" }
                        : b
                )
            )
        } catch (err) {
            console.error("Cancel booking failed", err)
        }
    }
    return (
        <CoachDashboardLayout>
            <div className="w-full mx-auto px-6 py-8">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">Quản lý đặt lịch</h1>
                    <p className="text-sm text-gray-500">Xem và quản lý các lịch đặt của bạn</p>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center p-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                ) : error ? (
                    <div className="bg-red-50 text-red-600 p-4 rounded-md">
                        {error}
                    </div>
                ) : bookings.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center p-12">
                            <Calendar className="h-12 w-12 text-gray-400 mb-4" />
                            <p className="text-gray-500 text-lg">Chưa có lịch đặt nào</p>
                        </CardContent>
                    </Card>
                ) : (
                    <Card>
                        <CardHeader>
                            <CardTitle>Danh sách đặt lịch</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Khách hàng</TableHead>
                                        <TableHead>Thời gian</TableHead>
                                        <TableHead>Chi tiết sân</TableHead>
                                        <TableHead>Giá</TableHead>
                                        <TableHead>Trạng thái</TableHead>
                                        <TableHead>Thanh toán</TableHead>
                                        <TableHead>Ghi chú</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {bookings.map((booking) => (
                                        <TableRow key={booking._id || booking.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <User className="h-4 w-4 text-gray-400" />
                                                    <div className="flex flex-col">
                                                        <span className="font-medium">{booking.user?.fullName}</span>
                                                        <span className="text-xs text-gray-500">{booking.user?.phoneNumber}</span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <Calendar className="h-3 w-3 text-gray-400" />
                                                        {new Date(booking.date).toLocaleDateString('vi-VN')}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <Clock className="h-3 w-3 text-gray-400" />
                                                        {booking.startTime} - {booking.endTime}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm">
                                                    <p className="font-medium">{booking.field?.name}</p>
                                                    <p className="text-xs text-gray-500 truncate max-w-[150px]">{booking.field?.location?.address || booking.field?.location}</p>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-medium text-primary flex items-center gap-1">
                                                    {booking.totalPrice?.toLocaleString('vi-VN')}đ
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <BookingStatusBadge status={booking.status} />
                                            </TableCell>
                                            <TableCell>
                                                <button
                                                    disabled={!coachId}
                                                    className="px-3 py-1 text-xs rounded-md bg-green-600 text-white
                                                            hover:bg-green-700 disabled:opacity-50"
                                                    onClick={() => handleCompleteBooking(booking._id || booking.id)}
                                                >
                                                    Hoàn thành
                                                </button>
                                                <button
                                                    disabled={!coachId}
                                                    className="px-3 py-1 text-xs rounded-md bg-red-600 text-white
                                                            hover:bg-red-700 disabled:opacity-50"
                                                    onClick={() => handleCancelBooking(booking._id || booking.id)}
                                                >
                                                    Hủy
                                                </button>
                                            </TableCell>

                                            <TableCell>
                                                <PaymentStatusBadge status={booking.paymentStatus} />
                                            </TableCell>
                                            <TableCell>
                                                {booking.note ? (
                                                    <div className="flex items-start gap-1 max-w-[150px]" title={booking.note}>
                                                        <FileText className="h-3 w-3 text-gray-400 mt-1 flex-shrink-0" />
                                                        <span className="text-sm truncate">{booking.note}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400 text-xs">-</span>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                )}

                {/* Combined Bookings Section (FIELD_COACH) */}
                <div className="mt-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Đặt lịch Sân + HLV</h2>
                    <p className="text-sm text-gray-500 mb-4">Các lịch đặt kết hợp giữa sân và huấn luyện viên</p>

                    {loadingCombined ? (
                        <div className="flex items-center justify-center p-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    ) : errorCombined ? (
                        <div className="bg-red-50 text-red-600 p-4 rounded-md">
                            {errorCombined}
                        </div>
                    ) : combinedBookings.length === 0 ? (
                        <Card>
                            <CardContent className="flex flex-col items-center justify-center p-12">
                                <Calendar className="h-12 w-12 text-gray-400 mb-4" />
                                <p className="text-gray-500 text-lg">Chưa có lịch đặt kết hợp nào</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card>
                            <CardHeader>
                                <CardTitle>Danh sách đặt lịch kết hợp (Sân + HLV)</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Khách hàng</TableHead>
                                            <TableHead>Thời gian</TableHead>
                                            <TableHead>Chi tiết sân</TableHead>
                                            <TableHead>Giá</TableHead>
                                            <TableHead>Trạng thái</TableHead>
                                            <TableHead>Thanh toán</TableHead>
                                            <TableHead>Ghi chú</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {combinedBookings.map((booking) => (
                                            <TableRow key={booking._id || booking.id}>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <User className="h-4 w-4 text-gray-400" />
                                                        <div className="flex flex-col">
                                                            <span className="font-medium">{booking.user?.fullName}</span>
                                                            <span className="text-xs text-gray-500">{booking.user?.phoneNumber}</span>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col gap-1">
                                                        <div className="flex items-center gap-2 text-sm">
                                                            <Calendar className="h-3 w-3 text-gray-400" />
                                                            {new Date(booking.date).toLocaleDateString('vi-VN')}
                                                        </div>
                                                        <div className="flex items-center gap-2 text-sm">
                                                            <Clock className="h-3 w-3 text-gray-400" />
                                                            {booking.startTime} - {booking.endTime}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-sm">
                                                        <p className="font-medium">{booking.field?.name}</p>
                                                        <p className="text-xs text-gray-500 truncate max-w-[150px]">{booking.field?.location?.address || booking.field?.location}</p>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="font-medium text-primary flex items-center gap-1">
                                                        {booking.totalPrice?.toLocaleString('vi-VN')}đ
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <BookingStatusBadge status={booking.status} />
                                                </TableCell>
                                                <TableCell>
                                                    <button
                                                        disabled={!coachId}
                                                        className="px-3 py-1 text-xs rounded-md bg-green-600 text-white
                                                                hover:bg-green-700 disabled:opacity-50"
                                                        onClick={() => handleCompleteBooking(booking._id || booking.id)}
                                                    >
                                                        Hoàn thành
                                                    </button>
                                                    <button
                                                        disabled={!coachId}
                                                        className="px-3 py-1 text-xs rounded-md bg-red-600 text-white
                                                                hover:bg-red-700 disabled:opacity-50"
                                                        onClick={() => handleCancelBooking(booking._id || booking.id)}
                                                    >
                                                        Hủy
                                                    </button>
                                                </TableCell>

                                                <TableCell>
                                                    <PaymentStatusBadge status={booking.paymentStatus} />
                                                </TableCell>
                                                <TableCell>
                                                    {booking.note ? (
                                                        <div className="flex items-start gap-1 max-w-[150px]" title={booking.note}>
                                                            <FileText className="h-3 w-3 text-gray-400 mt-1 flex-shrink-0" />
                                                            <span className="text-sm truncate">{booking.note}</span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-400 text-xs">-</span>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </CoachDashboardLayout>
    )
}
