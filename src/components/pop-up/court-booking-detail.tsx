import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

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
    paymentProofImageUrl?: string;
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
        paymentProofImageUrl
    } = bookingData || {};

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent
                showCloseButton={false}
                className="max-w-[1400px] sm:max-w-[1400px] w-[95vw] p-0 gap-0 bg-white rounded-lg border border-black/20"
            >
                <DialogTitle className="sr-only">Chi Tiết Đặt Sân</DialogTitle>
                {/* Header */}
                <div className="px-6 py-6 border-b border-[#E8F4FF] flex justify-between items-center rounded-t-lg">
                    <div className="flex flex-col gap-0">
                        <div className="flex items-center gap-3">
                            <h2 className="text-2xl font-semibold text-[#1A3353]">
                                Chi Tiết Đặt Sân
                            </h2>
                            <div className="px-[5px] py-[5px] bg-violet-600/20 rounded-sm">
                                <span className="text-sm font-normal text-violet-600">
                                    Sắp Tới
                                </span>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-red-600 hover:text-red-700 transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="px-6 py-6 space-y-6 max-h-[600px] overflow-y-auto">
                    {/* User Note (if any) */}
                    {note && (
                        <div className="p-3.5 bg-[#FFFBEA] rounded-[10px] border border-yellow-200">
                            <div className="pb-2">
                                <h3 className="text-lg font-semibold text-[#8A6D3B]">
                                    Ghi chú của khách hàng
                                </h3>
                            </div>
                            <p className="text-sm text-[#8A6D3B] whitespace-pre-wrap">{note}</p>
                        </div>
                    )}
                    {/* Court Information */}
                    <div className="p-3.5 bg-[#F8F8F8] rounded-[10px]">
                        <div className="pb-5">
                            <h3 className="text-lg font-semibold text-[#1A3353]">
                                Thông Tin Sân
                            </h3>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="flex flex-col gap-[5px]">
                                <h4 className="text-base font-medium text-[#1A3353]">
                                    Sân
                                </h4>
                                <p className="text-sm font-normal text-[#1A3353]">
                                    {academy}
                                </p>
                                <p className="text-sm font-normal text-[#26A65B]">
                                    {court}
                                </p>
                            </div>

                            <div className="flex flex-col gap-[5px]">
                                <h4 className="text-base font-medium text-[#1A3353]">
                                    Đặt Vào
                                </h4>
                                <p className="text-sm font-normal text-[#6B7280]">
                                    {bookedOn}
                                </p>
                            </div>

                            <div className="flex flex-col gap-[5px]">
                                <h4 className="text-base font-medium text-[#1A3353]">
                                    Tổng Số Giờ
                                </h4>
                                <p className="text-sm font-normal text-[#6B7280]">
                                    {totalHours}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Appointment Information */}
                    <div className="p-3.5 bg-[#F8F8F8] rounded-[10px]">
                        <div className="pb-5">
                            <h3 className="text-lg font-semibold text-[#1A3353]">
                                Thông Tin Lịch Hẹn
                            </h3>
                        </div>
                        <div className="px-4 pt-3.5 pb-4 border border-[#EDEDED]">
                            <div className="grid grid-cols-3 gap-4">
                                <div className="flex flex-col gap-[5px]">
                                    <h4 className="text-base font-medium text-[#1A3353]">
                                        Đặt Vào
                                    </h4>
                                    <p className="text-sm font-normal text-[#6B7280]">
                                        {bookingDate}
                                    </p>
                                </div>

                                <div className="flex flex-col gap-[5px]">
                                    <h4 className="text-base font-medium text-[#1A3353]">
                                        Ngày & Giờ
                                    </h4>
                                    <p className="text-sm font-normal text-[#6B7280]">
                                        {bookingDate}
                                    </p>
                                    <p className="text-sm font-normal text-[#6B7280]">
                                        {bookingTime}
                                    </p>
                                </div>

                                <div className="flex flex-col gap-[5px]">
                                    <h4 className="text-base font-medium text-[#1A3353]">
                                        Tổng Số Giờ
                                    </h4>
                                    <p className="text-sm font-normal text-[#6B7280]">
                                        {totalHours}
                                    </p>
                                </div>
                            </div>
                            {note && note.trim() && (
                                <div className="mt-4">
                                    <h4 className="text-base font-medium text-[#1A3353] mb-1">
                                        Ghi Chú Của Khách Hàng
                                    </h4>
                                    <p className="text-sm text-[#6B7280] whitespace-pre-wrap">
                                        {note}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Payment Details */}
                    <div className="p-3.5 bg-[#F8F8F8] rounded-[10px]">
                        <div className="pb-5">
                            <h3 className="text-lg font-semibold text-[#1A3353]">
                                Chi Tiết Thanh Toán
                            </h3>
                        </div>

                        <div className="space-y-3.5">
                            <div className="px-4 pt-3.5 pb-4 border border-[#EDEDED]">
                                <div className="grid grid-cols-4 gap-4">
                                    <div className="flex flex-col gap-[5px]">
                                        <h4 className="text-base font-medium text-[#1A3353]">
                                            Tiền sân
                                        </h4>
                                        <p className="text-sm font-normal text-[#6B7280]">
                                            {courtBookingAmount}
                                        </p>
                                    </div>

                                    <div className="flex flex-col gap-[5px]">
                                        <h4 className="text-base font-medium text-[#1A3353]">
                                            Tiện ích
                                        </h4>
                                        <p className="text-sm font-normal text-[#6B7280]">
                                            {amenitiesFee}
                                        </p>
                                    </div>

                                    <div className="flex flex-col gap-[5px]">
                                        <h4 className="text-base font-medium text-[#1A3353]">
                                            Phí Dịch Vụ
                                        </h4>
                                        <p className="text-sm font-normal text-[#6B7280]">
                                            {serviceCharge}
                                        </p>
                                    </div>

                                    <div className="flex flex-col gap-[5px]">
                                        <h4 className="text-base font-medium text-[#1A3353]">
                                            Tổng Số Tiền Đã Thanh Toán
                                        </h4>
                                        <p className="text-sm font-normal text-[#26A65B]">
                                            {totalAmountPaid}
                                        </p>
                                    </div>

                                    <div className="flex flex-col gap-[5px]">
                                        <h4 className="text-base font-medium text-[#1A3353]">
                                            Thanh Toán Vào
                                        </h4>
                                        <p className="text-sm font-normal text-[#6B7280]">
                                            {paidOn}
                                        </p>
                                    </div>

                                    <div className="flex flex-col gap-[5px]">
                                        <h4 className="text-base font-medium text-[#1A3353]">
                                            Mã Giao Dịch
                                        </h4>
                                        <p className="text-sm font-normal text-[#6B7280]">
                                            {transactionId}
                                        </p>
                                    </div>

                                    <div className="flex flex-col gap-[5px]">
                                        <h4 className="text-base font-medium text-[#1A3353]">
                                            Loại Thanh Toán
                                        </h4>
                                        <p className="text-sm font-normal text-[#6B7280]">
                                            {paymentType}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Proof Image */}
                            {paymentProofImageUrl && (
                                <div className="px-4 pt-3.5 pb-4 border border-[#EDEDED] mt-3.5">
                                    <h4 className="text-base font-medium text-[#1A3353] mb-3">
                                        Ảnh Chứng Minh Thanh Toán
                                    </h4>
                                    <div className="relative w-full max-w-md border-2 border-gray-200 rounded-lg overflow-hidden">
                                        <img
                                            src={paymentProofImageUrl}
                                            alt="Payment proof"
                                            className="w-full h-auto object-contain cursor-pointer hover:opacity-90 transition-opacity"
                                            onClick={() => window.open(paymentProofImageUrl, '_blank')}
                                        />
                                    </div>
                                    <p className="text-xs text-[#6B7280] mt-2">
                                        Nhấp vào ảnh để xem kích thước đầy đủ
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-6 border-t border-[#E8F4FF] flex justify-end items-center rounded-b-lg">
                    <Button
                        onClick={onClose}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-[10px] font-medium"
                    >
                        Đóng
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default CourtBookingDetails;
