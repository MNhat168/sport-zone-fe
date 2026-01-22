"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { QRScanner } from '@/components/booking/qr-scanner'
import { Button } from '@/components/ui/button'
import { qrCheckinAPI, type UserBookingOption } from '@/features/booking/qrCheckinAPI'
import { toast } from 'sonner'
import { NavbarDarkComponent } from '@/components/header/navbar-dark-component'
import { PageWrapper } from '@/components/layouts/page-wrapper'
import { Clock, MapPin, CheckCircle2, QrCode as QrCodeIcon, AlertCircle } from 'lucide-react'
import logger from '@/utils/logger'

export default function UserQRCheckinPage() {
    const [isScanning, setIsScanning] = useState(false)
    const [bookings, setBookings] = useState<UserBookingOption[]>([])
    const [selectedBooking, setSelectedBooking] = useState<string | null>(null)
    const [scannedToken, setScannedToken] = useState<string | null>(null)
    const [fieldName, setFieldName] = useState<string>('')
    const [isCheckingIn, setIsCheckingIn] = useState(false)
    const [checkinSuccess, setCheckinSuccess] = useState(false)

    // Decode field QR token to extract fieldId
    const decodeFieldToken = (token: string): { fieldId: string; type: string } | null => {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]))

            if (payload.type !== 'field') {
                toast.error('Mã QR không phải của sân')
                return null
            }

            return {
                fieldId: payload.fieldId,
                type: payload.type
            }
        } catch (error) {
            logger.error('Failed to decode token:', error)
            toast.error('Mã QR không hợp lệ')
            return null
        }
    }

    const handleScanSuccess = async (decodedText: string) => {
        try {
            setIsScanning(false)

            // Decode token to get fieldId
            const tokenData = decodeFieldToken(decodedText)
            if (!tokenData) return

            setScannedToken(decodedText)

            // Fetch user's bookings for this field today
            const userBookings = await qrCheckinAPI.getCheckInOptions(tokenData.fieldId)

            if (userBookings.length === 0) {
                toast.error('Bạn không có booking nào tại sân này hôm nay')
                setBookings([])
                setFieldName('')
                return
            }

            setBookings(userBookings)
            setFieldName(userBookings[0]?.field?.name || 'Sân')

            // Auto-select if only one booking
            if (userBookings.length === 1) {
                setSelectedBooking(userBookings[0]._id)
            }

            toast.success(`Tìm thấy ${userBookings.length} booking tại ${userBookings[0]?.field?.name}`)
        } catch (error: any) {
            logger.error('Failed to fetch bookings:', error)
            toast.error(error.response?.data?.message || 'Không thể lấy thông tin booking')
            setBookings([])
        }
    }

    const handleCheckIn = async () => {
        if (!scannedToken || !selectedBooking) {
            toast.error('Vui lòng chọn booking để check-in')
            return
        }

        try {
            setIsCheckingIn(true)

            await qrCheckinAPI.confirmCheckInWithFieldQR(scannedToken, selectedBooking)

            setCheckinSuccess(true)
            toast.success('Check-in thành công! 🎉')

            // Reset after success
            setTimeout(() => {
                resetState()
            }, 3000)
        } catch (error: any) {
            logger.error('Check-in failed:', error)
            toast.error(error.response?.data?.message || 'Check-in thất bại')
        } finally {
            setIsCheckingIn(false)
        }
    }

    const resetState = () => {
        setBookings([])
        setSelectedBooking(null)
        setScannedToken(null)
        setFieldName('')
        setCheckinSuccess(false)
        setIsScanning(false)
    }

    const formatTime = (time: string) => {
        return time?.substring(0, 5) || time
    }

    return (
        <>
            <NavbarDarkComponent />
            <PageWrapper className="min-h-screen">
                <div className="container mx-auto px-4 py-8 max-w-6xl">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">
                            🎫 QR Check-in
                        </h1>
                        <p className="text-gray-600">
                            Quét mã QR tại sân để check-in vào booking của bạn
                        </p>
                    </div>

                    {checkinSuccess ? (
                        /* Success State */
                        <Card className="border-green-200 bg-green-50">
                            <CardContent className="p-12 text-center">
                                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
                                    <CheckCircle2 className="w-12 h-12 text-green-600" />
                                </div>
                                <h2 className="text-3xl font-bold text-green-900 mb-2">
                                    Check-in thành công! 🎉
                                </h2>
                                <p className="text-green-700 mb-6">
                                    Chúc bạn có trận đấu vui vẻ!
                                </p>
                                <Button
                                    onClick={resetState}
                                    className="bg-green-600 hover:bg-green-700"
                                >
                                    Check-in booking khác
                                </Button>
                            </CardContent>
                        </Card>
                    ) : bookings.length > 0 ? (
                        /* Booking Selection State */
                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <MapPin className="w-5 h-5 text-blue-600" />
                                        {fieldName}
                                    </CardTitle>
                                    <p className="text-sm text-gray-600 mt-1">
                                        Chọn booking của bạn để check-in
                                    </p>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {bookings.map((booking) => (
                                        <div
                                            key={booking._id}
                                            onClick={() => setSelectedBooking(booking._id)}
                                            className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${selectedBooking === booking._id
                                                ? 'border-blue-500 bg-blue-50'
                                                : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Clock className="w-4 h-4 text-gray-500" />
                                                        <span className="font-semibold text-gray-900">
                                                            {formatTime(booking.fieldStartTime)} - {formatTime(booking.fieldEndTime)}
                                                        </span>
                                                    </div>
                                                    {booking.court && (
                                                        <p className="text-sm text-gray-600">
                                                            {booking.court.name}
                                                        </p>
                                                    )}
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <span className={`text-xs px-2 py-1 rounded ${booking.status === 'confirmed'
                                                            ? 'bg-green-100 text-green-700'
                                                            : 'bg-gray-100 text-gray-700'
                                                            }`}>
                                                            {booking.status}
                                                        </span>
                                                        <span className={`text-xs px-2 py-1 rounded ${booking.paymentStatus === 'paid'
                                                            ? 'bg-blue-100 text-blue-700'
                                                            : 'bg-yellow-100 text-yellow-700'
                                                            }`}>
                                                            {booking.paymentStatus}
                                                        </span>
                                                    </div>
                                                </div>
                                                {selectedBooking === booking._id && (
                                                    <CheckCircle2 className="w-6 h-6 text-blue-600 flex-shrink-0" />
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>

                            <div className="flex gap-3">
                                <Button
                                    onClick={resetState}
                                    variant="outline"
                                    className="flex-1"
                                    disabled={isCheckingIn}
                                >
                                    Quét lại
                                </Button>
                                <Button
                                    onClick={handleCheckIn}
                                    disabled={!selectedBooking || isCheckingIn}
                                    className="flex-1 bg-green-600 hover:bg-green-700"
                                >
                                    {isCheckingIn ? 'Đang xác nhận...' : 'Xác nhận Check-in'}
                                </Button>
                            </div>
                        </div>
                    ) : (
                        /* QR Scanner State */
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2">
                                <QRScanner
                                    onScanSuccess={handleScanSuccess}
                                    isProcessing={false}
                                />
                            </div>

                            {/* Instructions Panel */}
                            <div className="space-y-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">📋 Hướng dẫn</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex gap-3">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 font-bold text-blue-600">
                                                1
                                            </div>
                                            <p className="text-sm text-gray-700">
                                                Tìm mã QR tại sân bạn đã đặt
                                            </p>
                                        </div>
                                        <div className="flex gap-3">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 font-bold text-blue-600">
                                                2
                                            </div>
                                            <p className="text-sm text-gray-700">
                                                Nhấn "Bắt đầu quét" để mở camera
                                            </p>
                                        </div>
                                        <div className="flex gap-3">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 font-bold text-blue-600">
                                                3
                                            </div>
                                            <p className="text-sm text-gray-700">
                                                Hướng camera vào mã QR của sân
                                            </p>
                                        </div>
                                        <div className="flex gap-3">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 font-bold text-blue-600">
                                                4
                                            </div>
                                            <p className="text-sm text-gray-700">
                                                Chọn booking và xác nhận check-in
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="bg-blue-50 border-blue-200">
                                    <CardContent className="p-4">
                                        <div className="flex items-start gap-2">
                                            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-medium text-blue-800 mb-1">
                                                    Lưu ý
                                                </p>
                                                <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
                                                    <li>Chỉ có thể check-in vào ngày đã đặt</li>
                                                    <li>Booking phải đã thanh toán</li>
                                                    <li>Mã QR chỉ dành cho sân bạn đã đặt</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    )}
                </div>
            </PageWrapper>
        </>
    )
}
