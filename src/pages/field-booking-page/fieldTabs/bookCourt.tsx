import React, { useEffect, useState, useCallback } from 'react';
import { Calendar as CalendarIcon, Clock, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { DatePicker } from '@/components/ui/date-picker';
import type { Field, FieldAvailabilityData } from '@/types/field-type';
import { useLocation } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '@/store/hook';
import { checkFieldAvailability } from '@/features/field/fieldThunk';

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
}) => {
    const location = useLocation();
    const dispatch = useAppDispatch();
    const currentField = useAppSelector((state) => state.field.currentField);
    const venue = (venueProp || currentField || (location.state as any)?.venue) as Field | undefined;

    const getLocationText = (loc: any): string => {
        return typeof loc === 'string' ? loc : loc?.address || '';
    };

    const getMapEmbedSrc = (loc: any): string => {
        try {
            if (loc && typeof loc === 'object' && loc.geo && Array.isArray(loc.geo.coordinates)) {
                const [lng, lat] = loc.geo.coordinates as [number, number];
                if (typeof lat === 'number' && typeof lng === 'number' && !Number.isNaN(lat) && !Number.isNaN(lng)) {
                    return `https://www.google.com/maps?q=${encodeURIComponent(`${lat},${lng}`)}&z=15&output=embed`;
                }
            }
            const query = getLocationText(loc);
            if (query) {
                return `https://www.google.com/maps?q=${encodeURIComponent(query)}&z=15&output=embed`;
            }
        } catch {
            // Ignore errors and fall back to blank map
        }
        return 'about:blank';
    };

    // Log field data usage in BookCourt tab
    console.log('🏟️ [BOOK COURT TAB] Field data loaded:', {
        hasVenueProp: !!venueProp,
        hasCurrentField: !!currentField,
        hasLocationState: !!(location.state as any)?.venue,
        finalVenue: venue ? {
            id: venue.id,
            name: venue.name,
            location: venue.location,
            basePrice: venue.basePrice,
            sportType: venue.sportType,
            operatingHours: venue.operatingHours
        } : null
    });
    const [formData, setFormData] = useState<BookingFormData>({
        date: '',
        startTime: '',
        endTime: '',
        court: '',
    });
    // === Thêm state cho giờ bắt đầu & kết thúc ===
    const [selectedStartHour, setSelectedStartHour] = useState<number | null>(null);
    const [selectedEndHour, setSelectedEndHour] = useState<number | null>(null);

    // === State cho availability data ===
    const [availabilityData, setAvailabilityData] = useState<FieldAvailabilityData | null>(null);
    const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);
    const [availabilityError, setAvailabilityError] = useState<string | null>(null);

    // === Thêm danh sách các slot giờ ===
    const timeSlots = Array.from({ length: 24 }, (_, i) => i); // 0 -> 23h

    // === Helper functions for operating hours ===
    const getOperatingDays = (): string[] => {
        if (!venue?.operatingHours || venue.operatingHours.length === 0) {
            return ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        }
        return venue.operatingHours.map(hour => hour.day);
    };

    const getOperatingHoursForDay = (dayName: string) => {
        if (!venue?.operatingHours) return null;
        return venue.operatingHours.find(hour => hour.day === dayName);
    };

    // === Pricing helpers using field.priceRanges ===
    const toMinutes = (t: string): number => {
        const [hh = '00', mm = '00'] = (t || '00:00').split(':');
        return Number(hh) * 60 + Number(mm);
    };

    const getDayName = (date: Date): string => {
        const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        return dayNames[date.getDay()];
    };

    const getMultiplierFor = (day: string, timeHHmm: string): number => {
        const ranges = (venue?.priceRanges || []).filter(r => r.day === day);
        if (ranges.length === 0) return 1.0;
        const t = toMinutes(timeHHmm);
        const match = ranges.find(r => t >= toMinutes(r.start) && t < toMinutes(r.end));
        return match?.multiplier ?? 1.0;
    };

    const isDateDisabled = (date: Date): boolean => {
        // Disable past dates
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (date < today) {
            console.log('📅 [CALENDAR] Date disabled - past date:', date.toDateString());
            return true;
        }

        // Disable days not in operating hours
        const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const dayName = dayNames[date.getDay()];
        const operatingDays = getOperatingDays();
        const isOperatingDay = operatingDays.includes(dayName);
        
        if (!isOperatingDay) {
            console.log('📅 [CALENDAR] Date disabled - not operating day:', {
                date: date.toDateString(),
                dayName,
                operatingDays
            });
        }
        
        return !isOperatingDay;
    };

    const getAvailableTimeSlots = (selectedDate: Date): number[] => {
        if (!selectedDate || !venue?.operatingHours) {
            console.log('⏰ [TIME SLOTS] No date or operating hours, returning all slots');
            return timeSlots;
        }

        const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const dayName = dayNames[selectedDate.getDay()];
        const operatingHour = getOperatingHoursForDay(dayName);

        if (!operatingHour) {
            console.log('⏰ [TIME SLOTS] No operating hours for day:', dayName);
            return [];
        }

        const startHour = parseInt(operatingHour.start.split(':')[0]);
        const endHour = parseInt(operatingHour.end.split(':')[0]);
        // Tạo slots từ startHour đến endHour (bao gồm cả giờ cuối)
        // Ví dụ: 7:00-12:00 sẽ tạo slots [7, 8, 9, 10, 11, 12]
        const availableSlots = Array.from({ length: endHour - startHour + 1 }, (_, i) => startHour + i);
        
        console.log('⏰ [TIME SLOTS] Available slots for', dayName, ':', {
            operatingHour,
            startHour,
            endHour,
            availableSlots
        });
        
        return availableSlots;
    };

    // === Function để fetch availability data ===
    const fetchAvailabilityData = useCallback(async (selectedDate: string) => {
        if (!venue?.id || !selectedDate) {
            console.log('🚫 [AVAILABILITY] No venue ID or date provided');
            return;
        }

        setIsLoadingAvailability(true);
        setAvailabilityError(null);

        try {
            console.log('🔄 [AVAILABILITY] Fetching availability for:', {
                fieldId: venue.id,
                date: selectedDate
            });

            const result = await dispatch(checkFieldAvailability({
                id: venue.id,
                startDate: selectedDate,
                endDate: selectedDate
            })).unwrap();

            console.log('✅ [AVAILABILITY] Data received:', result);

            if (result.success && result.data && result.data.length > 0) {
                // Tìm data cho ngày được chọn
                const dayData = result.data.find(item => item.date === selectedDate);
                setAvailabilityData(dayData || null);
                
                console.log('📅 [AVAILABILITY] Day data set:', {
                    selectedDate,
                    dayData: dayData ? {
                        date: dayData.date,
                        isHoliday: dayData.isHoliday,
                        slotsCount: dayData.slots.length,
                        availableSlots: dayData.slots.filter(slot => slot.available).length
                    } : null
                });
            } else {
                setAvailabilityData(null);
                console.log('⚠️ [AVAILABILITY] No data received for date:', selectedDate);
            }
        } catch (error: any) {
            console.error('❌ [AVAILABILITY] Error fetching availability:', error);
            setAvailabilityError(error.message || 'Không thể tải thông tin khả dụng');
            setAvailabilityData(null);
        } finally {
            setIsLoadingAvailability(false);
        }
    }, [venue?.id, dispatch]);

    // === Function để check xem slot có available không ===
    const isSlotAvailable = (hour: number): boolean => {
        if (!availabilityData || !availabilityData.slots) {
            return true; // Nếu không có data, assume available
        }

        const timeString = `${String(hour).padStart(2, '0')}:00`;
        const slot = availabilityData.slots.find(s => s.startTime === timeString);
        
        if (!slot) {
            return true; // Nếu không tìm thấy slot, assume available
        }

        return slot.available;
    };


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

                // Fetch availability data if date is available
                if (parsed.date && venue?.id) {
                    fetchAvailabilityData(parsed.date);
                }
            }
        } catch {
            // Ignore malformed storage
            console.warn('Failed to parse bookingFormData from localStorage');
        }
    }, [venue?.id, fetchAvailabilityData]); // Add dependencies

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
        if (!venue || !formData.date || !formData.startTime || !formData.endTime) return 0;
        try {
            const dayName = getDayName(new Date(formData.date + 'T00:00:00'));
            const startHour = Number(formData.startTime.split(':')[0]);
            const endHour = Number(formData.endTime.split(':')[0]);
            if (endHour <= startHour) return 0;
            let total = 0;
            for (let h = startHour; h < endHour; h++) {
                const hh = String(h).padStart(2, '0');
                const mult = getMultiplierFor(dayName, `${hh}:00`);
                total += (venue.basePrice || 0) * mult;
            }
            return Math.round(total);
        } catch {
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

    // Kiểm tra xem form đã đầy đủ thông tin chưa
    const isFormValid = (): boolean => {
        return !!(
            formData.date &&
            formData.startTime &&
            formData.endTime &&
            venue?.basePrice &&
            venue.basePrice > 0
        );
    };

    const handleSubmit = () => {
        console.log('Form data:', formData);
        console.log('Subtotal:', calculateSubtotal());

        // // Validate required fields
        // if (!formData.date || !formData.startTime || !formData.endTime || !formData.court) {
        //     alert('Vui lòng điền đầy đủ các trường bắt buộc');
        //     return;
        // }

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
        if (!venue?.basePrice || venue.basePrice <= 0) {
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
                            {/* <p className="text-base font-normal font-['Outfit'] text-center text-[#6b7280]">
                                Đặt sân nhanh chóng, tiện lợi với cơ sở vật chất hiện đại.
                            </p> */}
                        </div>

                        {/* Venue Info */}
                        <div className="p-6 bg-gray-50 rounded-lg">
                            <div className="flex flex-wrap items-start gap-6">
                                {/* Venue Image and Details */}
                                <div className="flex-1 min-w-[800px]">
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
                                            <p className="text-base text-[#6b7280] font-['Outfit'] text-start">
                                                {venue.description}
                                            </p>
                                            
                                        </div>
                                    </div>
                                </div>

                                {/* Pricing Info */}
                                <div className="flex-1 min-w-[100px]">
                                    <div className="px-24 py-6 bg-white rounded-lg flex items-center justify-center">
                                        <div className="text-center">
                                            <div className="flex items-baseline gap-1 justify-center">
                                                <span className="text-2xl font-semibold text-emerald-600">
                                                    {formatVND(venue.basePrice)}
                                                </span>
                                                <span className="text-sm text-gray-500">/giờ</span>
                                            </div>
                                            <p className="text-sm text-[#1a1a1a] mt-1">Đơn giá theo giờ</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Static Map Preview (non-interactive) */}
                                <div className="flex-1 min-w-[400px]">
                                    <div className="w-full h-64 md:h-72 bg-white rounded-lg border border-gray-200 overflow-hidden">
                                        <iframe
                                            title="Venue location map"
                                            src={getMapEmbedSrc(venue.location as any)}
                                            className="w-full h-full pointer-events-none"
                                            loading="lazy"
                                            referrerPolicy="no-referrer-when-downgrade"
                                        />
                                    </div>
                                <p className="text-md text-[#6b7280] font-['Outfit'] mt-1 text-center">
                                    Địa chỉ: {getLocationText(venue.location as any)}
                                </p>
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
                                {/* Date Picker (popup) */}
                                <div className="space-y-2.5">
                                    <DatePicker
                                        label="Ngày"
                                        value={formData.date ? new Date(formData.date + 'T00:00:00') : undefined}
                                        onChange={(day) => {
                                            if (!day) {
                                                setFormData(prev => ({ ...prev, date: '' }));
                                                setSelectedStartHour(null);
                                                setSelectedEndHour(null);
                                                setAvailabilityData(null);
                                                return;
                                            }
                                            const yyyy = day.getFullYear();
                                            const mm = String(day.getMonth() + 1).padStart(2, '0');
                                            const dd = String(day.getDate()).padStart(2, '0');
                                            const ymd = `${yyyy}-${mm}-${dd}`;
                                            setFormData(prev => ({ ...prev, date: ymd }));
                                            
                                            // Reset time selection when date changes
                                            setSelectedStartHour(null);
                                            setSelectedEndHour(null);
                                            
                                            // Fetch availability data for selected date
                                            fetchAvailabilityData(ymd);
                                        }}
                                        disabled={(d) => {
                                            // past dates => disabled
                                            const today = new Date();
                                            today.setHours(0,0,0,0);
                                            const date = new Date(d);
                                            date.setHours(0,0,0,0);
                                            if (date < today) return true;
                                            // over 3 months from today => disabled
                                            const threeMonthsAhead = new Date(today);
                                            threeMonthsAhead.setMonth(threeMonthsAhead.getMonth() + 3);
                                            return date > threeMonthsAhead || isDateDisabled(d);
                                        }}
                                        buttonClassName="h-14 bg-white border-0 text-left"
                                        popoverAlign="start"
                                        captionLayout="dropdown-months"
                                        fromDate={(() => { const t=new Date(); t.setHours(0,0,0,0); return t; })()}
                                        toDate={(() => { const t=new Date(); t.setHours(0,0,0,0); t.setMonth(t.getMonth()+3); return t; })()}
                                    />
                                </div>
                                {/* Combined Time Range Selector */}
                                <div className="space-y-2.5">
                                    <Label className="text-base font-normal font-['Outfit']">Chọn khung giờ</Label>
                                    <div className="p-4 bg-gray-50 rounded-lg">
                                        {!formData.date ? (
                                            <p className="text-sm text-gray-500 font-['Outfit'] text-center py-4">
                                                Vui lòng chọn ngày trước khi chọn giờ
                                            </p>
                                        ) : isLoadingAvailability ? (
                                            <div className="flex items-center justify-center py-8">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-5 h-5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                                                    <p className="text-sm text-gray-600 font-['Outfit']">
                                                        Đang tải thông tin khả dụng...
                                                    </p>
                                                </div>
                                            </div>
                                        ) : availabilityError ? (
                                            <div className="text-center py-4">
                                                <p className="text-sm text-red-600 font-['Outfit'] mb-2">
                                                    {availabilityError}
                                                </p>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => formData.date && fetchAvailabilityData(formData.date)}
                                                    className="text-xs"
                                                >
                                                    Thử lại
                                                </Button>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="flex flex-wrap gap-2">
                                                    {(() => {
                                                        const selectedDate = formData.date ? new Date(formData.date + 'T00:00:00') : null;
                                                        const availableSlots = selectedDate ? getAvailableTimeSlots(selectedDate) : [];
                                                        
                                                        if (availableSlots.length === 0) {
                                                            return (
                                                                <p className="text-sm text-gray-500 font-['Outfit'] text-center py-4 w-full">
                                                                    Không có khung giờ khả dụng cho ngày này
                                                                </p>
                                                            );
                                                        }
                                                        
                                                        return availableSlots.map((hour) => {
                                                            const isStartHour = selectedStartHour === hour;
                                                            const isEndHour = selectedEndHour === hour;
                                                            const isInRange = selectedStartHour !== null && selectedEndHour !== null
                                                                && hour > selectedStartHour && hour < selectedEndHour;
                                                            const isSlotBooked = !isSlotAvailable(hour);
                                                            const dayName = formData.date ? getDayName(new Date(formData.date + 'T00:00:00')) : '';
                                                            const multiplier = dayName ? getMultiplierFor(dayName, `${String(hour).padStart(2,'0')}:00`) : 1.0;

                                                            return (
                                                                <button
                                                                    key={`time-${hour}`}
                                                                    type="button"
                                                                    disabled={isSlotBooked}
                                                                    onClick={() => {
                                                                        if (isSlotBooked) return; // Prevent click if slot is booked
                                                                        
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
                                                                    transition-all duration-200
                                                                    ${isSlotBooked
                                                                        ? "bg-red-100 border-red-300 text-red-500 cursor-not-allowed opacity-60"
                                                                        : isStartHour
                                                                            ? "bg-emerald-600 border-emerald-600 text-white shadow-md hover:scale-105"
                                                                            : isEndHour
                                                                                ? "bg-emerald-500 border-emerald-500 text-white shadow-md hover:scale-105"
                                                                                : isInRange
                                                                                    ? "bg-emerald-100 border-emerald-300 text-emerald-700 hover:scale-105"
                                                                                    : "bg-white border-gray-200 text-gray-700 hover:border-emerald-400 hover:scale-105"
                                                                    }
                                                                `}
                                                                >
                                                                    <div className="flex flex-col items-center leading-none">
                                                                        <span>{hour}</span>
                                                                        {formData.date && (
                                                                            <span className="text-[10px] opacity-70">x{Number(multiplier).toFixed(1)}</span>
                                                                        )}
                                                                    </div>
                                                                    {isSlotBooked && (
                                                                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
                                                                    )}
                                                                </button>
                                                            );
                                                        });
                                                    })()}
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
                                                    
                                                    {/* Availability status info */}
                                                    {availabilityData && (
                                                        <div className="mt-2 pt-2 border-t border-gray-200">
                                                            <div className="flex items-center gap-2 text-xs text-gray-600">
                                                                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                                                <span>Đã đặt</span>
                                                                <div className="w-2 h-2 bg-emerald-500 rounded-full ml-3"></div>
                                                                <span>Có thể đặt</span>
                                                            </div>
                                                            <p className="text-xs text-gray-500 mt-1">
                                                                {availabilityData.slots.filter(slot => slot.available).length} / {availabilityData.slots.length} khung giờ có thể đặt
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>

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
                                        Tổng phụ: {formatVND(calculateSubtotal())}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col items-center gap-3 py-5 bg-white/20 shadow-[0px_4px_44px_0px_rgba(211,211,211,0.25)]">
                    {/* Thông báo khi form chưa đầy đủ */}
                    {/* {!isFormValid() && (
                    <p className="text-sm text-gray-600 text-center">
                        Vui lòng điền đầy đủ thông tin: ngày, giờ bắt đầu, giờ kết thúc
                    </p>
                )} */}

                    <div className="flex justify-center items-center gap-5">
                        {/* <Button
                            variant="outline"
                            onClick={onBack}
                            className="px-5 py-3 bg-emerald-700 hover:bg-emerald-800 text-white border-emerald-700"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Quay lại
                        </Button> */}
                        <Button
                            onClick={handleSubmit}
                            disabled={!isFormValid()}
                            className={`px-5 py-3 text-white ${isFormValid()
                                    ? 'bg-gray-800 hover:bg-gray-900'
                                    : 'bg-gray-400 cursor-not-allowed'
                                }`}
                        >
                            Tiếp tục
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    </div>
                </div>
            </div>
        
    );
};

export default BookCourtTab;