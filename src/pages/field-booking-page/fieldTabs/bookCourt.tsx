import React, { useEffect, useState } from 'react';
import { Calendar as CalendarIcon, Clock, ArrowLeft, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import type { Field } from '@/types/field-type';
import { useLocation } from 'react-router-dom';
import { useAppSelector } from '@/store/hook';

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
 * Props for BookCourtTab component
 */
interface BookCourtTabProps {
    /**
     * Venue information to display
     */
    venue?: Field;
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
 * BookCourtTab component - Displays booking form with venue details
 */
export const BookCourtTab: React.FC<BookCourtTabProps> = ({
    venue: venueProp,
    onSubmit,
    onBack,
    courts = [],
}) => {
    const location = useLocation();
    const currentField = useAppSelector((state) => state.field.currentField);
    const venue = (venueProp || currentField || (location.state as any)?.venue) as Field | undefined;
    const [formData, setFormData] = useState<BookingFormData>({
        date: '',
        startTime: '',
        endTime: '',
        court: '',
    });
    // === Thêm state cho giờ bắt đầu & kết thúc ===
    const [selectedStartHour, setSelectedStartHour] = useState<number | null>(null);
    const [selectedEndHour, setSelectedEndHour] = useState<number | null>(null);

    // === Thêm danh sách các slot giờ ===
    const timeSlots = Array.from({ length: 24 }, (_, i) => i); // 0 -> 23h

    // === Xử lý khi click giờ ===
    const handleTimeSlotClick = (hour: number, type: "start" | "end") => {
        if (type === "start") {
            setSelectedStartHour(hour);
            setFormData((prev) => ({
                ...prev,
                startTime: `${String(hour).padStart(2, "0")}:00`,
                endTime: prev.endTime && Number(prev.endTime.split(":")[0]) <= hour ? "" : prev.endTime,
            }));
            setSelectedEndHour(null); // reset giờ kết thúc nếu chọn lại giờ bắt đầu
        } else {
            setSelectedEndHour(hour);
            setFormData((prev) => ({
                ...prev,
                endTime: `${String(hour).padStart(2, "0")}:00`,
            }));
        }
    };
    // Prefill form from localStorage if available
    useEffect(() => {
        try {
            const raw = localStorage.getItem('bookingFormData');
            if (!raw) return;
            const parsed = JSON.parse(raw);
            if (
                parsed &&
                typeof parsed === 'object' &&
                ('date' in parsed || 'startTime' in parsed || 'endTime' in parsed || 'court' in parsed)
            ) {
                setFormData(prev => ({
                    date: parsed.date ?? prev.date,
                    startTime: parsed.startTime ?? prev.startTime,
                    endTime: parsed.endTime ?? prev.endTime,
                    court: parsed.court ?? prev.court,
                    name: parsed.name ?? prev.name,
                    email: parsed.email ?? prev.email,
                    phone: parsed.phone ?? prev.phone,
                }));

                // Cập nhật selectedStartHour và selectedEndHour từ localStorage
                if (parsed.startTime) {
                    const startHour = parseInt(parsed.startTime.split(':')[0]);
                    setSelectedStartHour(startHour);
                }
                if (parsed.endTime) {
                    const endHour = parseInt(parsed.endTime.split(':')[0]);
                    setSelectedEndHour(endHour);
                }
            }
        } catch {
            // Ignore malformed storage
            console.warn('Failed to parse bookingFormData from localStorage');
        }
    }, []);

    if (!venue) {
        return (
            <div className="w-full max-w-[1320px] mx-auto px-3 py-10">
                <Card className="border border-gray-200">
                    <CardContent className="p-6">
                        <p className="text-base text-[#6b7280]">Chưa chọn sân. Vui lòng chọn sân để đặt.</p>
                        <div className="pt-4">
                            <Button variant="outline" onClick={onBack}>Quay lại</Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const calculateSubtotal = (): number => {
        if (!formData.startTime || !formData.endTime) {
            console.log('Missing time values:', { startTime: formData.startTime, endTime: formData.endTime });
            return 0;
        }
        
        try {
            // Parse time strings to calculate duration
            const [startHour, startMinute] = formData.startTime.split(':').map(Number);
            const [endHour, endMinute] = formData.endTime.split(':').map(Number);
            
            console.log('Parsed times:', { 
                startTime: formData.startTime, 
                endTime: formData.endTime,
                startHour, startMinute, endHour, endMinute 
            });
            
            // Convert to minutes for easier calculation
            const startTotalMinutes = startHour * 60 + startMinute;
            const endTotalMinutes = endHour * 60 + endMinute;
            
            // Calculate duration in hours
            const durationInMinutes = endTotalMinutes - startTotalMinutes;
            const durationInHours = durationInMinutes / 60;
            
            console.log('Duration calculation:', { 
                startTotalMinutes, 
                endTotalMinutes, 
                durationInMinutes, 
                durationInHours 
            });
            
            // Return 0 if negative duration (invalid time range)
            if (durationInHours <= 0) {
                console.log('Invalid duration:', durationInHours);
                return 0;
            }
            
            // Calculate total price: hours * price per hour
            console.log('Venue data:', { venue, pricePerHour: venue?.pricePerHour });
            const subtotal = Math.round(durationInHours * (venue?.pricePerHour || 0) * 100) / 100;
            console.log('Final subtotal:', subtotal);
            return subtotal;
        } catch (error) {
            console.error('Error calculating subtotal:', error);
            return 0;
        }
    };

    const formatVND = (value: number): string => {
        try {
            return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
        } catch {
            return `${value.toLocaleString('vi-VN')} ₫`;
        }
    };

    

    const handleSubmit = () => {
        console.log('Form data:', formData);
        console.log('Subtotal:', calculateSubtotal());

        // Validate required fields
        if (!formData.date || !formData.startTime || !formData.endTime || !formData.court) {
            alert('Vui lòng điền đầy đủ các trường bắt buộc');
            return;
        }

        // Validate time range
        const [startHour, startMinute] = formData.startTime.split(':').map(Number);
        const [endHour, endMinute] = formData.endTime.split(':').map(Number);
        const startTotal = startHour * 60 + startMinute;
        const endTotal = endHour * 60 + endMinute;

        if (endTotal <= startTotal) {
            alert('Vui lòng chọn khoảng thời gian hợp lệ (giờ bắt đầu phải trước giờ kết thúc)');
            return;
        }

        // Validate price
        if (!venue?.pricePerHour || venue.pricePerHour <= 0) {
            alert('Sân chưa có giá. Vui lòng liên hệ quản lý để cập nhật giá.');
            return;
        }

        if (onSubmit) {
            onSubmit(formData);
            localStorage.setItem('bookingFormData', JSON.stringify(formData));
        }
    };

    return (
        <div className="w-full max-w-[1320px] mx-auto px-3 flex flex-col gap-10">
            {/* Header Card */}
            <Card className="border border-gray-200">
                <CardContent className="p-6">
                    <div className="pb-10">
                        <h1 className="text-2xl font-semibold font-['Outfit'] text-center text-[#1a1a1a] mb-1">
                            Đặt sân
                        </h1>
                        <p className="text-base font-normal font-['Outfit'] text-center text-[#6b7280]">
                            Đặt sân nhanh chóng, tiện lợi với cơ sở vật chất hiện đại.
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
                                                {formatVND(venue.pricePerHour)}
                                            </span>
                                            <span className="text-sm text-gray-500">/giờ</span>
                                        </div>
                                        <p className="text-sm text-[#1a1a1a] mt-1">Đơn giá theo giờ</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Main Content */}
            <div className="flex flex-wrap gap-6">
                {/* Booking Form */}
                <div className="flex-1 min-w-[600px]">
                    <Card className="border border-gray-200">
                        <CardHeader className="border-b border-gray-200">
                            <CardTitle className="text-2xl font-semibold font-['Outfit']">
                                Biểu mẫu đặt sân
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                            {/* Date Picker (reused from ui) */}
                            <div className="space-y-2.5">
                                <DatePicker
                                    label="Ngày"
                                    value={formData.date ? new Date(formData.date + 'T00:00:00') : undefined}
                                    onChange={(day) => {
                                        if (!day) {
                                            setFormData(prev => ({ ...prev, date: '' }));
                                            return;
                                        }
                                        const yyyy = day.getFullYear();
                                        const mm = String(day.getMonth() + 1).padStart(2, '0');
                                        const dd = String(day.getDate()).padStart(2, '0');
                                        const ymd = `${yyyy}-${mm}-${dd}`;
                                        setFormData(prev => ({ ...prev, date: ymd }));
                                    }}
                                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                                    buttonClassName="h-14 bg-gray-50 border-0 text-left"
                                    popoverAlign="start"
                                />
                            </div>
                            {/* Combined Time Range Selector */}
                            <div className="space-y-2.5">
                                <Label className="text-base font-normal font-['Outfit']">Chọn khung giờ</Label>
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <div className="flex flex-wrap gap-2">
                                        {timeSlots.map((hour) => {
                                            const isStartHour = selectedStartHour === hour;
                                            const isEndHour = selectedEndHour === hour;
                                            const isInRange = selectedStartHour !== null && selectedEndHour !== null
                                                && hour > selectedStartHour && hour < selectedEndHour;

                                            return (
                                                <button
                                                    key={`time-${hour}`}
                                                    type="button"
                                                    onClick={() => {
                                                        if (selectedStartHour === null) {
                                                            // Chọn giờ bắt đầu
                                                            handleTimeSlotClick(hour, "start");
                                                        } else if (selectedEndHour === null && hour > selectedStartHour) {
                                                            // Chọn giờ kết thúc
                                                            handleTimeSlotClick(hour, "end");
                                                        } else {
                                                            // Reset và chọn lại giờ bắt đầu
                                                            handleTimeSlotClick(hour, "start");
                                                        }
                                                    }}
                                                    className={`
                                                        w-14 h-14 rounded-lg border-2 font-semibold font-['Outfit'] text-base
                                                        transition-all duration-200 hover:scale-105
                                                        ${isStartHour
                                                            ? "bg-emerald-600 border-emerald-600 text-white shadow-md"
                                                            : isEndHour
                                                                ? "bg-emerald-500 border-emerald-500 text-white shadow-md"
                                                                : isInRange
                                                                    ? "bg-emerald-100 border-emerald-300 text-emerald-700"
                                                                    : "bg-white border-gray-200 text-gray-700 hover:border-emerald-400"
                                                        }
                                                    `}
                                                >
                                                    {hour}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    <div className="mt-3 space-y-1">
                                        {selectedStartHour !== null && (
                                            <p className="text-sm text-emerald-600 font-['Outfit']">
                                                Giờ bắt đầu: {String(selectedStartHour).padStart(2, "0")}:00
                                            </p>
                                        )}
                                        {selectedEndHour !== null && (
                                            <p className="text-sm text-emerald-600 font-['Outfit']">
                                                Giờ kết thúc: {String(selectedEndHour).padStart(2, "0")}:00
                                            </p>
                                        )}
                                        {selectedStartHour === null && (
                                            <p className="text-sm text-gray-500 font-['Outfit']">
                                                Nhấn vào ô để chọn giờ bắt đầu
                                            </p>
                                        )}
                                        {selectedStartHour !== null && selectedEndHour === null && (
                                            <p className="text-sm text-gray-500 font-['Outfit']">
                                                Nhấn vào ô sau giờ bắt đầu để chọn giờ kết thúc
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>


                            {/* Court Selection */}
                            <div className="space-y-2.5">
                                <Label className="text-base font-normal font-['Outfit']">Sân</Label>
                                <Select
                                    value={formData.court}
                                    onValueChange={(value) => setFormData(prev => ({ ...prev, court: value }))}
                                >
                                    <SelectTrigger className="h-14 bg-gray-50 border-0">
                                    <SelectValue placeholder="Chọn sân" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {courts.map(court => (
                                            <SelectItem key={court.id} value={court.id}>
                                                {court.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Guest Selection removed */}
                        </CardContent>
                    </Card>
                </div>

                {/* Booking Details Sidebar */}
                <div className="w-96">
                    <Card className="border border-gray-200">
                        <CardHeader className="border-b border-gray-200">
                            <CardTitle className="text-2xl font-semibold font-['Outfit']">
                                Chi tiết đặt sân
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-5">
                            {/* Court */}
                            <div className="flex items-center gap-2">
                                <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <CalendarIcon className="w-5 h-5 text-emerald-600" />
                                </div>
                                <span className="text-base text-[#6b7280] font-['Outfit']">
                                    {formData.court
                                        ? courts.find(c => c.id === formData.court)?.name
                                        : 'Chưa chọn sân'}
                                </span>
                            </div>

                            {/* Date */}
                            <div className="flex items-center gap-2">
                                <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <CalendarIcon className="w-5 h-5 text-emerald-600" />
                                </div>
                                <span className="text-base text-[#6b7280] font-['Outfit']">
                                    {formData.date || 'Chưa chọn ngày'}
                                </span>
                            </div>

                            {/* Time */}
                            <div className="flex items-center gap-2">
                                <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Clock className="w-5 h-5 text-emerald-600" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-base text-[#6b7280] font-['Outfit']">
                                        {formData.startTime && formData.endTime
                                            ? `${formData.startTime} to ${formData.endTime}`
                                            : 'Chưa chọn giờ'}
                                    </span>
                                    {formData.startTime && formData.endTime && (
                                        <span className="text-sm text-emerald-600 font-['Outfit']">
                                            Thời lượng: {(() => {
                                                const [startHour, startMinute] = formData.startTime.split(':').map(Number);
                                                const [endHour, endMinute] = formData.endTime.split(':').map(Number);
                                                const startTotal = startHour * 60 + startMinute;
                                                const endTotal = endHour * 60 + endMinute;
                                                const duration = (endTotal - startTotal) / 60;
                                                return duration > 0 ? `${duration} giờ` : 'Khoảng thời gian không hợp lệ';
                                            })()}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Guests removed */}

                            {/* Subtotal */}
                            <div className="pt-2">
                                <Button
                                    className="w-full h-auto py-3 bg-emerald-700 hover:bg-emerald-800 text-white text-lg font-semibold font-['Outfit']"
                                    disabled
                                >
                                    Tổng phụ : ${calculateSubtotal()}
                                </Button>
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
    );
};

export default BookCourtTab;