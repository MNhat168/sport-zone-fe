import React from 'react';
import {
    Dialog,
    DialogContent,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface BookingData {
    academy?: string;
    court?: string;
    bookedOn?: string;
    pricePerGuest?: string;
    maxGuests?: string;
    bookingDate?: string;
    bookingTime?: string;
    totalHours?: string;
    courtBookingAmount?: string;
    additionalGuests?: string;
    additionalGuestsAmount?: string;
    serviceCharge?: string;
    totalAmountPaid?: string;
    paidOn?: string;
    transactionId?: string;
    paymentType?: string;
}

interface CourtBookingDetailsProps {
    isOpen: boolean;
    onClose: () => void;
    bookingData?: BookingData;
}

const CourtBookingDetails: React.FC<CourtBookingDetailsProps> = ({ isOpen, onClose, bookingData }) => {
    const {
        academy = 'Wing Sports Academy',
        court = 'Court 1',
        bookedOn = 'Mon, Jul 14',
        pricePerGuest = '$15',
        maxGuests = '2',
        bookingDate = 'Mon, Jul 14',
        bookingTime = '05:00 PM - 08:00 PM',
        totalHours = '2',
        courtBookingAmount = '$150',
        additionalGuests = '2',
        additionalGuestsAmount = '$30',
        serviceCharge = '$20',
        totalAmountPaid = '$180',
        paidOn = 'Mon, Jul 14',
        transactionId = '#5464164445676781641',
        paymentType = 'Wallet',
    } = bookingData || {};

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent 
                showCloseButton={false}
                className="max-w-[1400px] sm:max-w-[1400px] w-[95vw] p-0 gap-0 bg-white rounded-lg border border-black/20"
            >
                {/* Header */}
                <div className="px-6 py-6 border-b border-[#E8F4FF] flex justify-between items-center rounded-t-lg">
                    <div className="flex flex-col gap-0">
                        <div className="flex items-center gap-3">
                            <h2 className="text-2xl font-semibold text-[#1A3353] font-['Outfit']">
                                Chi Tiết Đặt Sân
                            </h2>
                            <div className="px-[5px] py-[5px] bg-violet-600/20 rounded-sm">
                                <span className="text-sm font-normal text-violet-600 font-['Outfit']">
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
                    {/* Court Information */}
                    <div className="p-3.5 bg-[#F8F8F8] rounded-[10px]">
                        <div className="pb-5">
                            <h3 className="text-lg font-semibold text-[#1A3353] font-['Outfit']">
                                Thông Tin Sân
                            </h3>
                        </div>
                        <div className="grid grid-cols-4 gap-4">
                            <div className="flex items-center gap-2.5">
                                <div className="w-11 h-11 rounded-[10px] overflow-hidden flex-shrink-0">
                                    <img
                                        src="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAUFBQUFBQUGBgUICAcICAsKCQkKCxEMDQwNDBEaEBMQEBMQGhcbFhUWGxcpIBwcICkvJyUnLzkzMzlHREddXX0BBQUFBQUFBQYGBQgIBwgICwoJCQoLEQwNDA0MERoQExAQExAaFxsWFRYbFykgHBwgKS8nJScvOTMzOUdER11dff/CABEIASwBLAMBIgACEQEDEQH/xAA2AAAABwEBAQAAAAAAAAAAAAAAAQIDBAUGBwgJAQADAQEBAQEAAAAAAAAAAAAAAQIDBAUGB//aAAwDAQACEAMQAAAAmP1q/A/"
                                        alt="Đặt sân"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="flex flex-col gap-[5px]">
                                    <h4 className="text-base font-medium text-[#1A3353] font-['Outfit']">
                                        {academy}
                                    </h4>
                                    <p className="text-sm font-normal text-[#26A65B] font-['Outfit']">
                                        {court}
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-col gap-[5px]">
                                <h4 className="text-base font-medium text-[#1A3353] font-['Outfit']">
                                    Đặt Vào
                                </h4>
                                <p className="text-sm font-normal text-[#6B7280] font-['Outfit']">
                                    {bookedOn}
                                </p>
                            </div>

                            <div className="flex flex-col gap-[5px]">
                                <h4 className="text-base font-medium text-[#1A3353] font-['Outfit']">
                                    Giá Mỗi Khách
                                </h4>
                                <p className="text-sm font-normal text-[#6B7280] font-['Outfit']">
                                    {pricePerGuest}
                                </p>
                            </div>

                            <div className="flex flex-col gap-[5px]">
                                <h4 className="text-base font-medium text-[#1A3353] font-['Outfit']">
                                    Số Lượng Khách Tối Đa
                                </h4>
                                <p className="text-sm font-normal text-[#6B7280] font-['Outfit']">
                                    {maxGuests}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Appointment Information */}
                    <div className="p-3.5 bg-[#F8F8F8] rounded-[10px]">
                        <div className="pb-5">
                            <h3 className="text-lg font-semibold text-[#1A3353] font-['Outfit']">
                                Thông Tin Lịch Hẹn
                            </h3>
                        </div>
                        <div className="px-4 pt-3.5 pb-4 border border-[#EDEDED]">
                            <div className="grid grid-cols-3 gap-4">
                                <div className="flex flex-col gap-[5px]">
                                    <h4 className="text-base font-medium text-[#1A3353] font-['Outfit']">
                                        Đặt Vào
                                    </h4>
                                    <p className="text-sm font-normal text-[#6B7280] font-['Outfit']">
                                        {bookingDate}
                                    </p>
                                </div>

                                <div className="flex flex-col gap-[5px]">
                                    <h4 className="text-base font-medium text-[#1A3353] font-['Outfit']">
                                        Ngày & Giờ
                                    </h4>
                                    <p className="text-sm font-normal text-[#6B7280] font-['Outfit']">
                                        {bookingDate}
                                    </p>
                                    <p className="text-sm font-normal text-[#6B7280] font-['Outfit']">
                                        {bookingTime}
                                    </p>
                                </div>

                                <div className="flex flex-col gap-[5px]">
                                    <h4 className="text-base font-medium text-[#1A3353] font-['Outfit']">
                                        Tổng Số Giờ
                                    </h4>
                                    <p className="text-sm font-normal text-[#6B7280] font-['Outfit']">
                                        {totalHours}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Payment Details */}
                    <div className="p-3.5 bg-[#F8F8F8] rounded-[10px]">
                        <div className="pb-5">
                            <h3 className="text-lg font-semibold text-[#1A3353] font-['Outfit']">
                                Chi Tiết Thanh Toán
                            </h3>
                        </div>

                        <div className="space-y-3.5">
                            <div className="px-4 pt-3.5 pb-4 border border-[#EDEDED]">
                                <div className="grid grid-cols-4 gap-4">
                                    <div className="flex flex-col gap-[5px]">
                                        <h4 className="text-base font-medium text-[#1A3353] font-['Outfit']">
                                            Số Tiền Đặt Sân
                                        </h4>
                                        <p className="text-sm font-normal text-[#6B7280] font-['Outfit']">
                                            {courtBookingAmount}
                                        </p>
                                    </div>

                                    <div className="flex flex-col gap-[5px]">
                                        <h4 className="text-base font-medium text-[#1A3353] font-['Outfit']">
                                            Khách Thêm
                                        </h4>
                                        <p className="text-sm font-normal text-[#6B7280] font-['Outfit']">
                                            {additionalGuests}
                                        </p>
                                    </div>

                                    <div className="flex flex-col gap-[5px]">
                                        <h4 className="text-base font-medium text-[#1A3353] font-['Outfit']">
                                            Số Tiền Khách Thêm
                                        </h4>
                                        <p className="text-sm font-normal text-[#6B7280] font-['Outfit']">
                                            {additionalGuestsAmount}
                                        </p>
                                    </div>

                                    <div className="flex flex-col gap-[5px]">
                                        <h4 className="text-base font-medium text-[#1A3353] font-['Outfit']">
                                            Phí Dịch Vụ
                                        </h4>
                                        <p className="text-sm font-normal text-[#6B7280] font-['Outfit']">
                                            {serviceCharge}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="px-4 pt-3.5 pb-4 border border-[#EDEDED]">
                                <div className="grid grid-cols-4 gap-4">
                                    <div className="flex flex-col gap-[5px]">
                                        <h4 className="text-base font-medium text-[#1A3353] font-['Outfit']">
                                            Tổng Số Tiền Đã Thanh Toán
                                        </h4>
                                        <p className="text-sm font-normal text-[#26A65B] font-['Outfit']">
                                            {totalAmountPaid}
                                        </p>
                                    </div>

                                    <div className="flex flex-col gap-[5px]">
                                        <h4 className="text-base font-medium text-[#1A3353] font-['Outfit']">
                                            Thanh Toán Vào
                                        </h4>
                                        <p className="text-sm font-normal text-[#6B7280] font-['Outfit']">
                                            {paidOn}
                                        </p>
                                    </div>

                                    <div className="flex flex-col gap-[5px]">
                                        <h4 className="text-base font-medium text-[#1A3353] font-['Outfit']">
                                            Mã Giao Dịch
                                        </h4>
                                        <p className="text-sm font-normal text-[#6B7280] font-['Outfit']">
                                            {transactionId}
                                        </p>
                                    </div>

                                    <div className="flex flex-col gap-[5px]">
                                        <h4 className="text-base font-medium text-[#1A3353] font-['Outfit']">
                                            Loại Thanh Toán
                                        </h4>
                                        <p className="text-sm font-normal text-[#6B7280] font-['Outfit']">
                                            {paymentType}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-6 border-t border-[#E8F4FF] flex justify-end items-center rounded-b-lg">
                    <Button
                        onClick={onClose}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-[10px] font-medium font-['Outfit']"
                    >
                        Đóng
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default CourtBookingDetails;