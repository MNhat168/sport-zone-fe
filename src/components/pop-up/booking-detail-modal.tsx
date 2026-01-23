import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { X, Calendar, Clock, MapPin, CreditCard, FileText } from 'lucide-react';
import type { Booking } from '@/types/booking-type';
import type { Field } from '@/types/field-type';
import { PaymentMethod } from '@/types/payment-type';
import { formatCurrency } from '@/utils/format-currency';
import { getSportDisplayNameVN } from '@/components/enums/ENUMS';
import { useNavigate } from 'react-router-dom';

interface BookingDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    booking: Booking | null;
}

const BookingDetailModal: React.FC<BookingDetailModalProps> = ({ isOpen, onClose, booking }) => {
    const navigate = useNavigate();
    if (!booking) return null;

    // Extract field data
    const field = typeof booking.field === 'object' ? booking.field : null;
    const fieldData = field as Field | null;

    // Format dates
    const bookingDate = new Date(booking.date);
    const formattedDate = bookingDate.toLocaleDateString('vi-VN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const formattedDateShort = bookingDate.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });

    // Helper function to combine date and startTime for check-in
    const getStartDateTime = (): Date | null => {
        try {
            // Validate booking exists
            if (!booking) {
                console.error('No booking provided');
                return null;
            }

            // Validate date
            let dateObj: Date;
            if (typeof booking.date === 'object' && booking.date !== null && 'getTime' in booking.date) {
                dateObj = booking.date as Date;
            } else if (typeof booking.date === 'string') {
                dateObj = new Date(booking.date);
            } else {
                console.error('Invalid booking date:', booking.date);
                return null;
            }

            if (isNaN(dateObj.getTime())) {
                console.error('Invalid booking date:', booking.date);
                return null;
            }

            // Validate startTime
            if (!booking.startTime || typeof booking.startTime !== 'string') {
                console.error('Invalid startTime:', booking.startTime);
                return null;
            }

            if (!/^\d{2}:\d{2}$/.test(booking.startTime)) {
                console.error('Invalid startTime format:', booking.startTime);
                return null;
            }

            // Combine date and startTime
            const [year, month, day] = [
                dateObj.getFullYear(),
                String(dateObj.getMonth() + 1).padStart(2, '0'),
                String(dateObj.getDate()).padStart(2, '0')
            ];
            const dateTimeStr = `${year}-${month}-${day}T${booking.startTime}:00`;
            const dateTime = new Date(dateTimeStr);

            if (isNaN(dateTime.getTime())) {
                console.error('Invalid combined date/time:', { dateStr: `${year}-${month}-${day}`, startTime: booking.startTime });
                return null;
            }

            return dateTime;
        } catch (error) {
            console.error('Error parsing date/time:', error, { date: booking.date, startTime: booking.startTime });
            return null;
        }
    };

    // Calculate total price
    const totalPrice = booking.totalPrice ||
        ((booking.bookingAmount || 0) + (booking.platformFee || 0));

    // Calculate number of hours
    const startHour = parseInt(booking.startTime.split(':')[0]);
    const endHour = parseInt(booking.endTime.split(':')[0]);
    const numHours = endHour > startHour ? endHour - startHour : 0;

    // Get status badge color
    const getStatusBadgeVariant = (status: string) => {
        switch (status.toLowerCase()) {
            case 'confirmed':
                return 'default';
            case 'pending':
                return 'secondary';
            case 'cancelled':
                return 'destructive';
            case 'completed':
                return 'default';
            default:
                return 'secondary';
        }
    };

    const getStatusText = (status: string) => {
        switch (status.toLowerCase()) {
            case 'confirmed':
                return 'Đã xác nhận';
            case 'pending':
                return 'Chờ xác nhận';
            case 'cancelled':
                return 'Đã hủy';
            case 'completed':
                return 'Hoàn thành';
            default:
                return status;
        }
    };

    const getPaymentMethodText = (method: number): string => {
        switch (method) {
            case PaymentMethod.BANK_TRANSFER:
                return 'Chuyển khoản';
            case PaymentMethod.INTERNAL:
                return 'Nội bộ';
            case PaymentMethod.PAYOS:
                return 'PayOS';
            default:
                return `Phương thức ${method}`;
        }
    };

    const getPaymentStatusText = (status: string): string => {
        switch (status.toLowerCase()) {
            case 'pending':
                return 'Chờ thanh toán';
            case 'succeeded':
                return 'Thành công';
            case 'failed':
                return 'Thất bại';
            case 'refunded':
                return 'Đã hoàn tiền';
            default:
                return status;
        }
    };

    // Helper function to get location text from location object or string
    const getLocationText = (location: any): string => {
        if (!location) return '';
        if (typeof location === 'string') return location;
        if (typeof location === 'object') {
            // Handle location object with address property
            if (location.address) return location.address;
            // Fallback: try to construct from other properties
            const parts = [location.ward, location.district, location.city, location.province].filter(Boolean);
            return parts.length ? parts.join(', ') : 'Địa chỉ đang cập nhật';
        }
        return 'Địa chỉ đang cập nhật';
    };

    // Helper function to truncate booking ID
    const truncateBookingId = (id: string, maxLength: number = 10): string => {
        if (!id) return '';
        if (id.length <= maxLength) return id;
        return id.substring(0, maxLength) + '...';
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent
                showCloseButton={false}
                className="!max-w-7xl sm:!max-w-7xl md:!max-w-7xl lg:!max-w-7xl xl:!max-w-7xl w-[95vw] max-h-[90vh] p-0 gap-0 bg-white rounded-lg border border-gray-200 overflow-hidden"
            >
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-green-50 to-emerald-50">
                    <div className="flex items-center gap-3">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-bold text-gray-900">
                                Chi Tiết Đặt Sân
                            </DialogTitle>
                            <DialogDescription className="sr-only">
                                Thông tin chi tiết về đặt sân của bạn
                            </DialogDescription>
                        </DialogHeader>
                        <Badge
                            variant={getStatusBadgeVariant(booking.status)}
                            className="text-sm font-semibold"
                        >
                            {getStatusText(booking.status)}
                        </Badge>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 transition-colors p-1 rounded-md hover:bg-gray-100"
                        aria-label="Đóng"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Content - Scrollable */}
                <div className="px-6 py-6 max-h-[calc(90vh-180px)] overflow-y-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Field Information */}
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <MapPin className="h-5 w-5 text-green-600" />
                            Thông Tin Sân
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-start gap-3">
                                {fieldData?.images?.[0] && (
                                    <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200">
                                        <img
                                            src={fieldData.images[0]}
                                            alt={fieldData.name || 'Sân thể thao'}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = '/general-img-portrait.png';
                                            }}
                                        />
                                    </div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-base font-semibold text-gray-900 truncate">
                                        {fieldData?.name || 'Không có tên'}
                                    </h4>
                                    <p className="text-sm text-gray-600 mt-1">
                                        {fieldData?.sportType ? getSportDisplayNameVN(fieldData.sportType) : 'Không xác định'}
                                    </p>
                                    {fieldData?.location && (
                                        <p className="text-xs text-gray-500 mt-1 flex items-start gap-1">
                                            <span>📍</span>
                                            <span className="line-clamp-2">{getLocationText(fieldData.location)}</span>
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                {fieldData?.rating && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium text-gray-700">Đánh giá:</span>
                                        <span className="text-sm text-gray-900 font-semibold">
                                            {fieldData.rating.toFixed(1)} ⭐
                                        </span>
                                        {fieldData.totalReviews && (
                                            <span className="text-xs text-gray-500">
                                                ({fieldData.totalReviews} đánh giá)
                                            </span>
                                        )}
                                    </div>
                                )}
                                {fieldData?.basePrice && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium text-gray-700">Giá cơ bản:</span>
                                        <span className="text-sm text-gray-900 font-semibold">
                                            {formatCurrency(fieldData.basePrice)}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Booking Information */}
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-blue-600" />
                            Thông Tin Đặt Sân
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-gray-700">Ngày đặt</p>
                                <p className="text-base text-gray-900 font-semibold">{formattedDate}</p>
                                <p className="text-xs text-gray-500">{formattedDateShort}</p>
                            </div>

                            <div className="space-y-1">
                                <p className="text-sm font-medium text-gray-700 flex items-center gap-1">
                                    <Clock className="h-4 w-4" />
                                    Thời gian
                                </p>
                                <p className="text-base text-gray-900 font-semibold">
                                    {booking.startTime} - {booking.endTime}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {numHours} giờ ({booking.numSlots || 0} slot)
                                </p>
                            </div>

                            <div className="space-y-1">
                                <p className="text-sm font-medium text-gray-700">Mã đặt sân</p>
                                <p className="text-sm text-gray-600 font-mono" title={booking._id}>
                                    {truncateBookingId(booking._id)}
                                </p>
                            </div>
                        </div>

                        {booking.cancellationReason && (
                            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                                <p className="text-sm font-medium text-red-800">Lý do hủy:</p>
                                <p className="text-sm text-red-700 mt-1">{booking.cancellationReason}</p>
                            </div>
                        )}
                    </div>

                    {/* Payment Details */}
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <CreditCard className="h-5 w-5 text-purple-600" />
                            Chi Tiết Thanh Toán
                        </h3>
                        <div className="space-y-3">
                            {booking.bookingAmount !== undefined && (
                                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                                    <span className="text-sm text-gray-700">Tiền sân</span>
                                    <span className="text-sm font-semibold text-gray-900">
                                        {formatCurrency(booking.bookingAmount)}
                                    </span>
                                </div>
                            )}

                            {booking.amenitiesFee && booking.amenitiesFee > 0 && (
                                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                                    <span className="text-sm text-gray-700">Tiện ích</span>
                                    <span className="text-sm font-semibold text-gray-900">
                                        {formatCurrency(booking.amenitiesFee)}
                                    </span>
                                </div>
                            )}

                            {booking.platformFee !== undefined && booking.platformFee > 0 && (
                                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                                    <span className="text-sm text-gray-700">Phí dịch vụ</span>
                                    <span className="text-sm font-semibold text-gray-900">
                                        {formatCurrency(booking.platformFee)}
                                    </span>
                                </div>
                            )}

                            <Separator className="my-2" />

                            <div className="flex justify-between items-center py-2">
                                <span className="text-base font-semibold text-gray-900">Tổng cộng</span>
                                <span className="text-lg font-bold text-green-600">
                                    {formatCurrency(totalPrice)}
                                </span>
                            </div>

                            {typeof booking.payment === 'object' && booking.payment && (
                                <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
                                    <p className="text-sm font-medium text-gray-700">Thông tin thanh toán</p>
                                    <div className="text-xs text-gray-600 space-y-1">
                                        {booking.payment.method !== undefined && (
                                            <p>Phương thức: {getPaymentMethodText(booking.payment.method)}</p>
                                        )}
                                        {booking.payment.status && (
                                            <p>Trạng thái: {getPaymentStatusText(booking.payment.status)}</p>
                                        )}
                                        {booking.payment.transactionId && (
                                            <p>Mã giao dịch: {booking.payment.transactionId}</p>
                                        )}
                                        {booking.payment.amount !== undefined && (
                                            <p>Số tiền: {formatCurrency(booking.payment.amount)}</p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Additional Information */}
                    {((booking.selectedAmenities && booking.selectedAmenities.length > 0) || booking.pricingSnapshot) && (
                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <FileText className="h-5 w-5 text-orange-600" />
                                Thông Tin Bổ Sung
                            </h3>
                            <div className="space-y-3">
                                {booking.selectedAmenities && booking.selectedAmenities.length > 0 && (
                                    <div>
                                        <p className="text-sm font-medium text-gray-700 mb-2">Tiện ích đã chọn:</p>
                                        <div className="flex flex-wrap gap-2">
                                            {booking.selectedAmenities.map((amenityId, index) => (
                                                <Badge key={index} variant="outline" className="text-xs">
                                                    {amenityId}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {booking.pricingSnapshot && (
                                    <div className="text-sm text-gray-600 space-y-1">
                                        {booking.pricingSnapshot.basePrice && (
                                            <p>Giá cơ bản: {formatCurrency(booking.pricingSnapshot.basePrice)}</p>
                                        )}
                                        {booking.pricingSnapshot.appliedMultiplier && (
                                            <p>Hệ số áp dụng: {booking.pricingSnapshot.appliedMultiplier}x</p>
                                        )}
                                        {booking.pricingSnapshot.priceBreakdown && (
                                            <p className="text-xs text-gray-500 mt-2">
                                                {booking.pricingSnapshot.priceBreakdown}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Field QR Check-in Instructions - Only for confirmed and paid bookings */}
                    {(() => {
                        // Check if booking is confirmed
                        const isConfirmed = booking.status?.toLowerCase() === 'confirmed';

                        // Check payment status
                        const isPaid = booking.paymentStatus === 'paid' ||
                            (typeof booking.payment === 'object' && booking.payment?.status === 'succeeded');

                        return isConfirmed && isPaid ? (
                            <div className="lg:col-span-2 bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
                                <div className="flex items-start gap-4">
                                    <div className="text-4xl">📱</div>
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold text-blue-900 mb-2">
                                            Hướng dẫn Check-in
                                        </h3>
                                        <div className="text-sm text-blue-800 space-y-2">
                                            <p className="font-medium">Khi đến sân, vui lòng thực hiện các bước sau:</p>
                                            <ol className="list-decimal list-inside space-y-1 ml-2">
                                                <li>Mở ứng dụng trên điện thoại</li>
                                                <li>Tìm mã QR Check-in tại khu vực lễ tân của sân</li>
                                                <li>Quét mã QR bằng camera trong app</li>
                                                <li>Chọn booking của bạn để hoàn tất check-in</li>
                                            </ol>
                                            <div className="pt-3 border-t border-blue-200 mt-3">
                                                <p className="text-xs text-blue-700 italic">
                                                    💡 Lưu ý: Bạn không cần tạo mã QR riêng nữa. Chỉ cần quét mã có sẵn tại sân!
                                                </p>
                                            </div>
                                        </div>
                                        <Button
                                            onClick={() => {
                                                navigate('/user/qr-checkin');
                                                onClose();
                                            }}
                                            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white"
                                        >
                                            Đi đến trang Check-in
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ) : null;
                    })()}

                    {/* Booking Metadata */}
                    <div className="text-xs text-gray-500 space-y-1 pt-2 border-t border-gray-200 lg:col-span-2">
                        {booking.createdAt && (
                            <p>Đặt vào: {new Date(booking.createdAt).toLocaleString('vi-VN')}</p>
                        )}
                        {booking.updatedAt && booking.updatedAt !== booking.createdAt && (
                            <p>Cập nhật: {new Date(booking.updatedAt).toLocaleString('vi-VN')}</p>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-200 flex justify-end items-center bg-gray-50">
                    <Button
                        onClick={onClose}
                        className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md font-medium transition-colors"
                    >
                        Đóng
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default BookingDetailModal;

