import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, Copy, Check } from 'lucide-react';

interface BookingData {
    academy?: string;
    court?: string;
    bookedOn?: string;
    bookingDate?: string;
    bookingTime?: string;
    totalHours?: string;
    courtBookingAmount?: string;
    amenitiesFee?: string;
    serviceCharge?: string; // platform fee
    totalAmountPaid?: string;
    paidOn?: string;
    transactionId?: string;
    paymentType?: string;
    note?: string;
    customer?: {
        fullName: string;
        phone: string;
        email: string;
    };
    amenities?: string[];
    originalBooking?: any;
    fieldAddress?: string;
    bookingAmount?: string;
    platformFee?: string;
}

interface CourtBookingDetailsProps {
    isOpen: boolean;
    onClose: () => void;
    bookingData?: BookingData;
}

const CourtBookingDetails: React.FC<CourtBookingDetailsProps> = ({ isOpen, onClose, bookingData }) => {
    const {
        academy = '—',
        court = '—',
        bookedOn = '—',
        bookingDate = '—',
        bookingTime = '—',
        totalHours = '—',
        courtBookingAmount = '—',
        amenitiesFee = '—',
        serviceCharge = '—',
        totalAmountPaid = '—',
        paidOn = '—',
        transactionId = '—',
        paymentType = '—',
        note = '',
        customer,
        fieldAddress,
        bookingAmount,
        platformFee,
        originalBooking
    } = bookingData || {};

    const [isCopied, setIsCopied] = React.useState(false);

    const handleCopyId = (id: string) => {
        navigator.clipboard.writeText(id);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    const bookingId = originalBooking?._id || originalBooking?.id;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent
                showCloseButton={false}
                className="max-w-[900px] sm:max-w-[900px] w-[95vw] p-0 gap-0 bg-white rounded-lg border border-gray-300"
            >
                <DialogTitle className="sr-only">Chi Tiết Đặt Sân</DialogTitle>

                {/* Header */}
                <div className="px-8 py-6 border-b border-gray-200 bg-white">
                    <div className="flex items-start justify-between">
                        <div>
                            <h2 className="text-2xl font-semibold text-gray-900">
                                Chi tiết đặt sân
                            </h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="px-8 py-6 max-h-[70vh] overflow-y-auto">
                    {/* Customer Header with Status */}
                    {customer && (
                        <div className="mb-6">
                            <div className="flex items-center justify-between mb-3">
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Người đặt sân</p>
                                    <h3 className="text-xl font-semibold text-gray-900">{customer.fullName}</h3>
                                </div>
                                <div className="px-3 py-1 bg-green-100 rounded text-sm font-medium text-green-700">
                                    Đã xác nhận
                                </div>
                            </div>

                            <div className="flex items-center gap-6 text-sm text-gray-600">
                                <div className="flex items-center gap-2">
                                    <span className="text-gray-400">📅</span>
                                    <span>Ngày đặt: {bookingDate}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-gray-400">⏰</span>
                                    <span>Giờ: {bookingTime}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* User Note */}
                    {note && (
                        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                            <p className="text-sm font-medium text-amber-900 mb-1">Ghi chú của khách hàng</p>
                            <p className="text-sm text-amber-800 whitespace-pre-wrap">{note}</p>
                        </div>
                    )}

                    {/* Main Content Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Left Column - Personal Info */}
                        <div>
                            <h4 className="text-sm font-medium text-gray-900 mb-4">Thông tin cá nhân</h4>
                            <div className="space-y-4">
                                {customer && (
                                    <>
                                        <div>
                                            <label className="text-xs text-gray-500 block mb-1">Họ và tên</label>
                                            <p className="text-sm font-medium text-gray-900">{customer.fullName}</p>
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-500 block mb-1">Số điện thoại</label>
                                            <p className="text-sm font-medium text-gray-900">{customer.phone}</p>
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-500 block mb-1">Email</label>
                                            <p className="text-sm font-medium text-gray-900">{customer.email}</p>
                                        </div>
                                    </>
                                )}

                                <div className="pt-3 border-t border-gray-100">
                                    <label className="text-xs text-gray-500 block mb-1">Sân</label>
                                    <p className="text-sm font-semibold text-gray-900">{academy}</p>
                                    <p className="text-sm text-green-600 mt-1">{court}</p>
                                </div>

                                {fieldAddress && (
                                    <div>
                                        <label className="text-xs text-gray-500 block mb-1">Địa chỉ</label>
                                        <p className="text-sm text-gray-700">{fieldAddress}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right Column - Booking Details */}
                        <div>
                            <h4 className="text-sm font-medium text-gray-900 mb-4">Thông tin đặt sân</h4>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs text-gray-500 block mb-1">Mã đặt sân</label>
                                    <div className="flex items-center gap-2">
                                        <p className="text-sm font-medium text-gray-900 font-mono">
                                            {bookingId || '—'}
                                        </p>
                                        {bookingId && (
                                            <button
                                                onClick={() => handleCopyId(bookingId)}
                                                className="text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
                                                title="Sao chép mã"
                                            >
                                                <Copy className="h-3.5 w-3.5" />
                                            </button>
                                        )}
                                    </div>
                                </div >

                                <div>
                                    <label className="text-xs text-gray-500 block mb-1">Ngày đặt</label>
                                    <p className="text-sm font-medium text-gray-900">{bookingDate}</p>
                                </div>

                                <div>
                                    <label className="text-xs text-gray-500 block mb-1">Thời gian</label>
                                    <p className="text-sm font-medium text-gray-900">{bookingTime}</p>
                                </div>

                                <div className="pt-3 border-t border-gray-100">
                                    {bookingAmount && bookingAmount !== '—' && (
                                        <div className="flex items-baseline justify-between mb-2">
                                            <span className="text-sm text-gray-600">Tiền sân</span>
                                            <span className="text-sm font-medium text-gray-900">{bookingAmount}</span>
                                        </div>
                                    )}

                                    {platformFee && platformFee !== '—' && platformFee !== '0 đ' && platformFee !== '0 d' && (
                                        <div className="flex items-baseline justify-between mb-2">
                                            <span className="text-sm text-gray-600">Phí hệ thống</span>
                                            <span className="text-sm font-medium text-gray-900">{platformFee}</span>
                                        </div>
                                    )}

                                    {amenitiesFee && amenitiesFee !== '0 d' && amenitiesFee !== '—' && (
                                        <div className="flex items-baseline justify-between mb-2">
                                            <span className="text-sm text-gray-600">Tiện ích</span>
                                            <span className="text-sm font-medium text-gray-900">{amenitiesFee}</span>
                                        </div>
                                    )}

                                    <div className="flex items-baseline justify-between mt-3 pt-3 border-t border-gray-200">
                                        <span className="text-sm font-medium text-gray-900">Tổng số tiền</span>
                                        <span className="text-xl font-bold text-green-600">{totalAmountPaid}</span>
                                    </div>
                                </div>
                            </div >
                        </div >
                    </div >
                </div >

                {/* Footer */}
                < div className="px-8 py-4 border-t border-gray-200 bg-gray-50 flex justify-end" >
                    <Button
                        onClick={onClose}
                        className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                    >
                        Đóng
                    </Button>
                </div >
            </DialogContent >
        </Dialog >
    );
};

export default CourtBookingDetails;
