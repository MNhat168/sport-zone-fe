import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "react-router-dom";
import { useAppSelector } from "@/store/hook";
import type { Field } from "@/types/field-type";

/**
 * Interface for booking form data
 */
interface BookingFormData {
    date: string;
    startTime: string;
    endTime: string;
    court: string;
    name?: string;
    email?: string;
    phone?: string;
}

/**
 * Props for ConfirmCourtTab component
 */
interface ConfirmCourtTabProps {
    /**
     * Venue information to display
     */
    venue?: Field;
    /**
     * Booking form data from previous step
     */
    bookingData?: BookingFormData;
    /**
     * Callback when form is submitted
     */
    onSubmit?: (formData: BookingFormData) => void;
    /**
     * Callback for back button
     */
    onBack?: () => void;
    /**
     * Available courts list
     */
    courts?: Array<{ id: string; name: string }>;
}
/**
 * ConfirmCourtTab component - Displays booking confirmation with venue details
 */
export const ConfirmCourtTab: React.FC<ConfirmCourtTabProps> = ({
    venue: venueProp,
    bookingData,
    onSubmit,
    onBack,
    // courts = [],
}) => {
    const location = useLocation();
    const currentField = useAppSelector((state) => state.field.currentField);
    const venue = (venueProp || currentField || (location.state as any)?.venue) as Field | undefined;
    
    // Log field data usage in ConfirmCourt tab
    console.log('✅ [CONFIRM COURT TAB] Field data loaded:', {
        hasVenueProp: !!venueProp,
        hasCurrentField: !!currentField,
        hasLocationState: !!(location.state as any)?.venue,
        finalVenue: venue ? {
            id: venue.id,
            name: venue.name,
            location: venue.location,
            basePrice: venue.basePrice,
            sportType: venue.sportType,
            owner: venue.owner
        } : null,
        bookingData: bookingData ? {
            date: bookingData.date,
            startTime: bookingData.startTime,
            endTime: bookingData.endTime,
            court: bookingData.court
        } : null
    });
    // Use booking data from props or initialize with empty values
    const formData: BookingFormData = {
        date: bookingData?.date || '',
        startTime: bookingData?.startTime || '',
        endTime: bookingData?.endTime || '',
        court: bookingData?.court || '',
        name: bookingData?.name || '',
        email: bookingData?.email || '',
        phone: bookingData?.phone || '',
    };

    // Helper functions for formatting
    const formatDate = (dateString: string): string => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            weekday: 'short', 
            month: 'short', 
            day: 'numeric' 
        });
    };
   
    const formatTime = (timeString: string): string => {
        if (!timeString) return '';
        const [hours, minutes] = timeString.split(':');
        const date = new Date();
        date.setHours(parseInt(hours), parseInt(minutes));
        return date.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true 
        });
    };

    const calculateCageTotal = (): number => {
        if (!venue || !formData.startTime || !formData.endTime) return 0;
        
        const start = new Date(`1970-01-01T${formData.startTime}:00`);
        const end = new Date(`1970-01-01T${formData.endTime}:00`);
        const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
        
        return venue.basePrice * hours;
    };

    const calculateSubtotal = (): number => {
        return calculateCageTotal();
    };

    const formatVND = (value: number): string => {
        try {
            return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
        } catch {
            return `${value.toLocaleString('vi-VN')} ₫`;
        }
    };

    const handleSubmit = () => {
        if (onSubmit) {
            onSubmit(formData);
        }
    };

    if (!venue) {
        return (
            <div className="w-full max-w-[1320px] mx-auto px-3 py-10">
                <Card className="border border-gray-200">
                    <CardContent className="p-6">
                        <p className="text-base text-[#6b7280]">No field selected. Please select a field to book.</p>
                        <div className="pt-4">
                            <Button variant="outline" onClick={onBack}>Back</Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }
    return (
        <div className="w-full max-w-[1320px] mx-auto px-3 flex flex-col gap-10">
            {/* Header Card */}
            <Card className="border border-gray-200">
                <CardContent className="p-6">
                    <div className="pb-10">
                        <h1 className="text-2xl font-semibold font-['Outfit'] text-center text-[#1a1a1a] mb-1">
                            Xác nhận đặt sân
                        </h1>
                        <p className="text-base font-normal font-['Outfit'] text-center text-[#6b7280]">
                            Cảm ơn bạn đã đặt sân! Vui lòng kiểm tra lại thông tin trước khi tiếp tục.
                        </p>
                    </div>

                    {/* Venue Info */}
                    <div className="p-6 bg-gray-50 rounded-lg">
                        <div className="flex flex-wrap items-start gap-6">
                            {/* Venue Image and Details */}
                            <div className="flex-1 min-w-[500px]">
                                <div className="flex items-start gap-4">
                                    {venue.images?.[0] && (
                                        <img
                                            src={venue.images[0]}
                                            alt={venue.name}
                                            className="w-24 h-28 rounded-lg object-cover"
                                        />
                                    )}
                                    <div className="flex-1">
                                        <h2 className="text-2xl font-semibold font-['Outfit'] text-[#1a1a1a] mb-2">
                                            {venue.name}
                                        </h2>
                                        <p className="text-base text-[#6b7280] font-['Outfit']">
                                            {venue.description}
                                        </p>
                                        <p className="text-sm text-[#6b7280] font-['Outfit'] mt-1">
                                            {venue.location}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Pricing Info */}
                            <div className="flex-1 min-w-[400px]">
                                <div className="px-24 py-6 bg-white rounded-lg flex items-center justify-center">
                                    <div className="text-center">
                                        <div className="flex items-baseline gap-1 justify-center">
                                            <span className="text-2xl font-semibold text-emerald-600">
                                                ${venue.basePrice}
                                            </span>
                                            <span className="text-sm text-gray-500">/hr</span>
                                        </div>
                                        <p className="text-sm text-[#1a1a1a] mt-1">Price per hour</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Main Content */}
            <div className="w-full max-w-[1320px] mx-auto px-3 py-8">
                <div className="space-y-8">
                    {/* Booking Details Section */}
                    <Card className="border border-gray-200">
                        <CardHeader className="border-b border-gray-200 bg-gray-50">
                            <CardTitle className="text-xl font-semibold text-gray-900">Chi tiết đặt sân</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="grid grid-cols-4 gap-6">
                                <div>
                                    <h4 className="text-sm font-medium text-gray-900 mb-2">Tên sân</h4>
                                    <p className="text-sm text-gray-600">{venue.name || "Chưa cập nhật"}</p>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-gray-900 mb-2">Ngày</h4>
                                    <p className="text-sm text-gray-600">{formatDate(formData.date) || "Mon, Jul 11"}</p>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-gray-900 mb-2">Giờ bắt đầu</h4>
                                    <p className="text-sm text-gray-600">{formatTime(formData.startTime) || "05:25 AM"}</p>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-gray-900 mb-2">Giờ kết thúc</h4>
                                    <p className="text-sm text-gray-600">{formatTime(formData.endTime) || "06:25 AM"}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Customer Information Section - Who is making the booking */}
                    {/*<Card className="border border-gray-200">
                        <CardHeader className="border-b border-gray-200 bg-gray-50">
                            <CardTitle className="text-xl font-semibold text-gray-900">Thông tin người đặt</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="grid grid-cols-3 gap-6">
                                <div>
                                    <h4 className="text-sm font-medium text-gray-900 mb-2">Họ và tên</h4>
                                    <p className="text-sm text-gray-600">{formData.name || 'Not provided'}</p>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-gray-900 mb-2">Email</h4>
                                    <p className="text-sm text-gray-600">{formData.email || 'Not provided'}</p>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-gray-900 mb-2">Số điện thoại</h4>
                                    <p className="text-sm text-gray-600">{formData.phone || 'Not provided'}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>*/}

                    {/* Venue Contact Information Section - Field owner/venue contact details */}
                    <Card className="border border-gray-200">
                        <CardHeader className="border-b border-gray-200 bg-gray-50">
                            <CardTitle className="text-xl font-semibold text-gray-900">Thông tin liên hệ sân</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="grid grid-cols-3 gap-6">
                                <div>
                                    <h4 className="text-sm font-medium text-gray-900 mb-2">Chủ sân</h4>
                                    <p className="text-sm text-gray-600">{venue?.owner?.name || venue?.owner?.id || 'Chưa cập nhật'}</p>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-gray-900 mb-2">Liên hệ</h4>
                                    <p className="text-sm text-gray-600">{venue?.owner?.contact || 'Chưa cập nhật'}</p>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-gray-900 mb-2">Tên sân</h4>
                                    <p className="text-sm text-gray-600">{venue?.name || 'SportZone Field'}</p>
                                </div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-gray-200">
                                <div>
                                    <h4 className="text-sm font-medium text-gray-900 mb-2">Địa chỉ</h4>
                                    <p className="text-sm text-gray-600">{venue?.location || 'Location not specified'}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Payment Information Section */}
                    <Card className="border border-gray-200">
                        <CardHeader className="border-b border-gray-200 bg-gray-50">
                            <CardTitle className="text-xl font-semibold text-gray-900">Thông tin thanh toán</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <h4 className="text-sm font-medium text-gray-900 mb-2">Tiền sân</h4>
                                    <p className="text-sm text-emerald-600 font-medium">
                                        {formatVND(venue?.basePrice || 0)}/giờ × {(() => {
                                            if (!formData.startTime || !formData.endTime) return '0';
                                            const start = new Date(`1970-01-01T${formData.startTime}:00`);
                                            const end = new Date(`1970-01-01T${formData.endTime}:00`);
                                            const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
                                            return hours > 0 ? hours : '0';
                                        })()} giờ
                                    </p>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-gray-900 mb-2">Tổng tiền</h4>
                                    <p className="text-lg font-semibold text-emerald-600">{formatVND(calculateSubtotal())}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center items-center gap-5 py-5 bg-white/20 shadow-[0px_4px_44px_0px_rgba(211,211,211,0.25)]">
                <Button
                    variant="outline"
                    onClick={onBack}
                    className="px-5 py-3 bg-emerald-700 hover:bg-emerald-800 text-white border-emerald-700"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Quay lại
                </Button>
                <Button
                    onClick={handleSubmit}
                    className="px-5 py-3 bg-gray-800 hover:bg-gray-900 text-white"
                >
                    Tiếp tục
                    <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
            </div>
        </div>
    )
}
