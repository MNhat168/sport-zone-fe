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
    courtId: string;
    courtName?: string;
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
    courts?: Array<{ id: string; name: string; courtNumber?: number }>;
    courtsError?: string | null;
}

/**
 * BookCourtTab component - Displays booking form with venue details
 */
export const BookCourtTab: React.FC<BookCourtTabProps> = ({
    venue: venueProp,
    onSubmit,
    onBack,
    courts = [],
    courtsError,
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
        courtId: '',
        courtName: '',
    });
    // === Thêm state cho giờ bắt đầu & kết thúc (time strings HH:mm) ===
    const [selectedStartTime, setSelectedStartTime] = useState<string | null>(null);
    const [selectedEndTime, setSelectedEndTime] = useState<string | null>(null);

    // === State cho availability data ===
    const [availabilityData, setAvailabilityData] = useState<FieldAvailabilityData | null>(null);
    const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);
    const [availabilityError, setAvailabilityError] = useState<string | null>(null);

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

    // Helper function to format minutes to HH:mm
    const minutesToTimeString = (minutes: number): string => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
    };

    const getAvailableTimeSlots = (selectedDate: Date): string[] => {
        if (!selectedDate || !venue?.operatingHours) {
            console.log('⏰ [TIME SLOTS] No date or operating hours, returning empty');
            return [];
        }

        const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const dayName = dayNames[selectedDate.getDay()];
        const operatingHour = getOperatingHoursForDay(dayName);

        if (!operatingHour) {
            console.log('⏰ [TIME SLOTS] No operating hours for day:', dayName);
            return [];
        }

        // Get slotDuration from venue (default to 60 minutes if not available)
        const slotDuration = venue.slotDuration || 60;

        // Parse operating hours to minutes
        const startHour = parseInt(operatingHour.start.split(':')[0]);
        const startMinute = parseInt(operatingHour.start.split(':')[1] || '0');
        const endHour = parseInt(operatingHour.end.split(':')[0]);
        const endMinute = parseInt(operatingHour.end.split(':')[1] || '0');

        const startMinutes = startHour * 60 + startMinute;
        const endMinutes = endHour * 60 + endMinute;

        // Generate slots based on slotDuration (same logic as backend)
        const slots: string[] = [];
        for (let currentMinutes = startMinutes; currentMinutes < endMinutes; currentMinutes += slotDuration) {
            const slotEndMinutes = currentMinutes + slotDuration;
            if (slotEndMinutes > endMinutes) break;

            const startTime = minutesToTimeString(currentMinutes);
            slots.push(startTime);
        }

        console.log('⏰ [TIME SLOTS] Available slots for', dayName, ':', {
            operatingHour,
            slotDuration,
            startMinutes,
            endMinutes,
            slotsCount: slots.length,
            slots
        });

        return slots;
    };

    // === Function để fetch availability data ===
    const fetchAvailabilityData = useCallback(async (selectedDate: string, courtId?: string) => {
        if (!venue?.id || !selectedDate || !courtId) {
            console.log('🚫 [AVAILABILITY] Missing venue, date, or courtId');
            return;
        }

        setIsLoadingAvailability(true);
        setAvailabilityError(null);

        try {
            console.log('🔄 [AVAILABILITY] Fetching availability for:', {
                fieldId: venue.id,
                date: selectedDate,
                courtId
            });

            const result = await dispatch(checkFieldAvailability({
                id: venue.id,
                startDate: selectedDate,
                endDate: selectedDate,
                courtId,
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
    const isSlotAvailable = (timeString: string): boolean => {
        if (!availabilityData || !availabilityData.slots) {
            return true; // Nếu không có data, assume available
        }

        const slot = availabilityData.slots.find(s => s.startTime === timeString);

        if (!slot) {
            return true; // Nếu không tìm thấy slot, assume available
        }

        return slot.available;
    };

    // === Function để check xem slot có đã qua chưa (nếu là ngày hôm nay) ===
    const isSlotInPast = (slotTime: string, selectedDate: string): boolean => {
        if (!selectedDate) return false;

        const today = new Date();
        const selected = new Date(selectedDate + 'T00:00:00');
        
        // So sánh ngày (không tính giờ)
        const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const selectedDateOnly = new Date(selected.getFullYear(), selected.getMonth(), selected.getDate());
        
        // Nếu không phải ngày hôm nay, không disable
        if (selectedDateOnly.getTime() !== todayDateOnly.getTime()) {
            return false;
        }

        // Nếu là ngày hôm nay, check xem slot có đã qua chưa
        const [slotHour, slotMinute] = slotTime.split(':').map(Number);
        const slotTotal = slotHour * 60 + slotMinute;
        const nowTotal = today.getHours() * 60 + today.getMinutes();
        
        // Disable nếu slot đã qua (slot start time < current time)
        return slotTotal < nowTotal;
    };


    // Helper function to calculate endTime of a slot
    const getSlotEndTime = (startTime: string): string => {
        const slotDuration = venue?.slotDuration || 60;
        const startTotal = toMinutes(startTime);
        const endTotal = startTotal + slotDuration;
        return minutesToTimeString(endTotal);
    };

    // === Xử lý khi click slot - chọn theo block ===
    const handleSlotBlockClick = (slotTime: string) => {
        // Check if slot is in the past
        if (isSlotInPast(slotTime, formData.date)) {
            alert('Không thể chọn khung giờ đã qua. Vui lòng chọn khung giờ khác.');
            return;
        }

        const slotDuration = venue?.slotDuration || 60;
        const slotEndTime = getSlotEndTime(slotTime);

        if (selectedStartTime === null) {
            // Chọn block đầu tiên: set cả start và end của block đó
            setSelectedStartTime(slotTime);
            setSelectedEndTime(slotEndTime);
            setFormData((prev) => ({
                ...prev,
                startTime: slotTime,
                endTime: slotEndTime,
            }));
        } else {
            // Đã có selection: extend range
            const [currentStartHour, currentStartMin] = selectedStartTime.split(':').map(Number);
            const [currentEndHour, currentEndMin] = (selectedEndTime || getSlotEndTime(selectedStartTime)).split(':').map(Number);
            const [clickedHour, clickedMin] = slotTime.split(':').map(Number);

            const currentStartTotal = currentStartHour * 60 + currentStartMin;
            const currentEndTotal = currentEndHour * 60 + currentEndMin;
            const clickedTotal = clickedHour * 60 + clickedMin;

            // Determine new range based on clicked slot position
            let newStartTime: string;
            let newEndTime: string;

            if (clickedTotal < currentStartTotal) {
                // Click vào slot trước start -> extend về trước
                newStartTime = slotTime;
                newEndTime = selectedEndTime || getSlotEndTime(selectedStartTime);
            } else if (clickedTotal >= currentEndTotal) {
                // Click vào slot sau end -> extend về sau
                newStartTime = selectedStartTime;
                newEndTime = slotEndTime;
            } else {
                // Click vào slot trong range -> reset về block đó
                newStartTime = slotTime;
                newEndTime = slotEndTime;
            }

            // Validate range: check if all slots in range are available
            const newStartTotal = toMinutes(newStartTime);
            const newEndTotal = toMinutes(newEndTime);
            let hasBookedSlotInRange = false;

            for (let currentMinutes = newStartTotal; currentMinutes < newEndTotal; currentMinutes += slotDuration) {
                const checkSlotTime = minutesToTimeString(currentMinutes);
                if (!isSlotAvailable(checkSlotTime)) {
                    hasBookedSlotInRange = true;
                    break;
                }
            }

            if (hasBookedSlotInRange) {
                alert('Khoảng thời gian này có slot đã được đặt. Vui lòng chọn khoảng thời gian khác.');
                return;
            }

            setSelectedStartTime(newStartTime);
            setSelectedEndTime(newEndTime);
            setFormData((prev) => ({
                ...prev,
                startTime: newStartTime,
                endTime: newEndTime,
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
                ('date' in parsed || 'startTime' in parsed || 'endTime' in parsed || 'courtId' in parsed)
            ) {
                setFormData(prev => ({
                    date: parsed.date ?? prev.date,
                    startTime: parsed.startTime ?? prev.startTime,
                    endTime: parsed.endTime ?? prev.endTime,
                    courtId: parsed.courtId ?? prev.courtId,
                    courtName: parsed.courtName ?? prev.courtName,
                    name: parsed.name ?? prev.name,
                    email: parsed.email ?? prev.email,
                    phone: parsed.phone ?? prev.phone,
                }));

                // Cập nhật selectedStartTime và selectedEndTime từ localStorage
                if (parsed.startTime) {
                    setSelectedStartTime(parsed.startTime);
                }
                if (parsed.endTime) {
                    setSelectedEndTime(parsed.endTime);
                }

                // Fetch availability data if date is available
                if (parsed.date && venue?.id && (parsed.courtId || courts[0]?.id)) {
                    const targetCourtId = parsed.courtId || courts[0]?.id;
                    setFormData(prev => ({
                        ...prev,
                        courtId: targetCourtId,
                        courtName: prev.courtName || courts.find(c => c.id === targetCourtId)?.name || prev.courtName,
                    }));
                    fetchAvailabilityData(parsed.date, targetCourtId);
                }
            }
        } catch {
            // Ignore malformed storage
            console.warn('Failed to parse bookingFormData from localStorage');
        }
    }, [venue?.id, courts, fetchAvailabilityData]); // Add dependencies

    // Default select first court when list is available
    useEffect(() => {
        if (courts.length > 0 && !formData.courtId) {
            setFormData(prev => ({
                ...prev,
                courtId: courts[0].id,
                courtName: courts[0].name,
            }));
        }
    }, [courts, formData.courtId]);

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
            const startTotal = toMinutes(formData.startTime);
            const endTotal = toMinutes(formData.endTime);
            if (endTotal <= startTotal) return 0;

            // Calculate based on slotDuration
            const slotDuration = venue.slotDuration || 60;
            let total = 0;

            // Iterate through each slot in the booking range
            for (let currentMinutes = startTotal; currentMinutes < endTotal; currentMinutes += slotDuration) {
                const slotStartTime = minutesToTimeString(currentMinutes);
                const mult = getMultiplierFor(dayName, slotStartTime);
                // Price per slot = (slotDuration / 60) * basePrice * multiplier
                const slotPrice = (slotDuration / 60) * (venue.basePrice || 0) * mult;
                total += slotPrice;
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
            formData.courtId &&
            venue?.basePrice &&
            venue.basePrice > 0
        );
    };

    const handleSubmit = () => {
        console.log('Form data:', formData);
        console.log('Subtotal:', calculateSubtotal());

        // Validate required fields
        if (!formData.date || !formData.startTime || !formData.endTime) {
            alert('Vui lòng điền đầy đủ các trường bắt buộc');
            return;
        }

        if (!formData.courtId) {
            alert('Vui lòng chọn sân con (court)');
            return;
        }

        // Validate time range
        const startTotal = toMinutes(formData.startTime);
        const endTotal = toMinutes(formData.endTime);

        if (endTotal <= startTotal) {
            alert('Vui lòng chọn khoảng thời gian hợp lệ (giờ bắt đầu phải trước giờ kết thúc)');
            return;
        }

        // Validate slots match boundaries and constraints
        const slotDuration = venue?.slotDuration || 60;
        const numSlots = (endTotal - startTotal) / slotDuration;

        // Check if numSlots is an integer (slots must align with slotDuration)
        if (!Number.isInteger(numSlots)) {
            alert(`Khoảng thời gian phải là bội số của ${slotDuration} phút. Ví dụ: ${slotDuration} phút, ${slotDuration * 2} phút, ${slotDuration * 3} phút...`);
            return;
        }

        // Check min/max slots constraints
        if (venue?.minSlots && numSlots < venue.minSlots) {
            alert(`Số lượng slot tối thiểu là ${venue.minSlots} slot (${(venue.minSlots * slotDuration) / 60} giờ)`);
            return;
        }

        if (venue?.maxSlots && numSlots > venue.maxSlots) {
            alert(`Số lượng slot tối đa là ${venue.maxSlots} slot (${(venue.maxSlots * slotDuration) / 60} giờ)`);
            return;
        }

        // Validate that startTime and endTime match available slot boundaries
        const selectedDate = formData.date ? new Date(formData.date + 'T00:00:00') : null;
        if (selectedDate) {
            const availableSlots = getAvailableTimeSlots(selectedDate);
            const startTimeMatches = availableSlots.includes(formData.startTime);
            // endTime should be a valid slot startTime (it represents the start of the next slot after booking ends)
            const endTimeMatches = availableSlots.includes(formData.endTime);

            if (!startTimeMatches) {
                alert('Giờ bắt đầu không khớp với các slot khả dụng. Vui lòng chọn lại.');
                return;
            }

            if (!endTimeMatches) {
                alert('Giờ kết thúc không khớp với các slot khả dụng. Vui lòng chọn lại.');
                return;
            }

            // ✅ CRITICAL: Validate that ALL slots in the booking range are available (not hold/booked)
            // Generate all slots in the booking range
            const bookingSlots: string[] = [];
            for (let currentMinutes = startTotal; currentMinutes < endTotal; currentMinutes += slotDuration) {
                const slotTime = minutesToTimeString(currentMinutes);
                bookingSlots.push(slotTime);
            }

            // Check if any slot in the range is booked/hold
            const unavailableSlots = bookingSlots.filter(slotTime => !isSlotAvailable(slotTime));

            if (unavailableSlots.length > 0) {
                alert(`Các slot sau đã được đặt hoặc đang được giữ: ${unavailableSlots.join(', ')}. Vui lòng chọn khoảng thời gian khác.`);
                return;
            }

            // ✅ Validate that startTime is not in the past (if booking for today)
            if (isSlotInPast(formData.startTime, formData.date)) {
                alert('Không thể đặt khung giờ đã qua. Vui lòng chọn khung giờ khác.');
                return;
            }
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
                            {/* Court Selector */}
                            <div className="space-y-2.5">
                                <Label className="text-base font-normal font-['Outfit']">Chọn sân con (court)</Label>
                                {courtsError && (
                                    <p className="text-sm text-red-600 font-['Outfit']">{courtsError}</p>
                                )}
                                {courts.length === 0 ? (
                                    <p className="text-sm text-gray-500 font-['Outfit']">
                                        Chưa có sân con khả dụng. Vui lòng thử lại sau.
                                    </p>
                                ) : (
                                    <select
                                        className="w-full h-12 border border-gray-300 rounded-md px-3 focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-white"
                                        value={formData.courtId}
                                        onChange={(e) => {
                                            const newCourtId = e.target.value;
                                            const court = courts.find(c => c.id === newCourtId);
                                            setFormData(prev => ({
                                                ...prev,
                                                courtId: newCourtId,
                                                courtName: court?.name || prev.courtName,
                                                // Reset time selection when switching court
                                                startTime: '',
                                                endTime: '',
                                            }));
                                            setSelectedStartTime(null);
                                            setSelectedEndTime(null);
                                            setAvailabilityData(null);
                                            if (formData.date && newCourtId) {
                                                fetchAvailabilityData(formData.date, newCourtId);
                                            }
                                        }}
                                    >
                                        {courts.map(court => (
                                            <option key={court.id} value={court.id}>
                                                {court.name || `Court ${court.courtNumber ?? ''}`}
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </div>
                            {/* Date Picker (popup) */}
                            <div className="space-y-2.5">
                                <DatePicker
                                    label="Ngày"
                                    value={formData.date ? new Date(formData.date + 'T00:00:00') : undefined}
                                    onChange={(day) => {
                                        if (!day) {
                                            setFormData(prev => ({ ...prev, date: '' }));
                                            setSelectedStartTime(null);
                                            setSelectedEndTime(null);
                                            setAvailabilityData(null);
                                            return;
                                        }
                                        const yyyy = day.getFullYear();
                                        const mm = String(day.getMonth() + 1).padStart(2, '0');
                                        const dd = String(day.getDate()).padStart(2, '0');
                                        const ymd = `${yyyy}-${mm}-${dd}`;
                                        setFormData(prev => ({ ...prev, date: ymd }));

                                        // Reset time selection when date changes
                                        setSelectedStartTime(null);
                                        setSelectedEndTime(null);

                                        // Fetch availability data for selected date
                                        fetchAvailabilityData(ymd, formData.courtId || courts[0]?.id);
                                    }}
                                    disabled={(d) => {
                                        // past dates => disabled
                                        const today = new Date();
                                        today.setHours(0, 0, 0, 0);
                                        const date = new Date(d);
                                        date.setHours(0, 0, 0, 0);
                                        if (date < today) return true;
                                        // over 3 months from today => disabled
                                        const threeMonthsAhead = new Date(today);
                                        threeMonthsAhead.setMonth(threeMonthsAhead.getMonth() + 3);
                                        return date > threeMonthsAhead || isDateDisabled(d);
                                    }}
                                    buttonClassName="h-14 bg-white border-0 text-left"
                                    popoverAlign="start"
                                    captionLayout="dropdown-months"
                                    fromDate={(() => { const t = new Date(); t.setHours(0, 0, 0, 0); return t; })()}
                                    toDate={(() => { const t = new Date(); t.setHours(0, 0, 0, 0); t.setMonth(t.getMonth() + 3); return t; })()}
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
                                            {/* Legend */}
                                            <div className="mb-4 flex items-center gap-4 flex-wrap text-sm font-['Outfit']">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-4 h-4 bg-white border-2 border-gray-300 rounded"></div>
                                                    <span>Trống</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-4 h-4 bg-red-500 rounded"></div>
                                                    <span>Đã đặt</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-4 h-4 bg-gray-400 rounded opacity-60"></div>
                                                    <span>Khóa</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-4 h-4 bg-emerald-600 rounded"></div>
                                                    <span>Đã chọn</span>
                                                </div>
                                            </div>

                                            {/* Grid Layout */}
                                            <div className="overflow-x-auto">
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

                                                    return (
                                                        <div className="inline-block min-w-full">
                                                            {/* Time Header Row - Time labels on vertical lines */}
                                                            <div className="flex border-b-2 border-gray-300 bg-blue-50 relative pt-6">
                                                                <div className="w-24 shrink-0 border-r-2 border-gray-300 p-2 text-xs font-semibold font-['Outfit'] text-center">
                                                                    Giờ
                                                                </div>
                                                                <div className="flex flex-1 relative">
                                                                    {/* First vertical line with time label (start of first slot) */}
                                                                    {availableSlots.length > 0 && (
                                                                        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gray-400 z-10">
                                                                            <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 text-xs font-medium font-['Outfit'] text-gray-700 whitespace-nowrap bg-blue-50 px-1">
                                                                                {(() => {
                                                                                    const [displayHour, displayMin] = availableSlots[0].split(':');
                                                                                    return displayMin === '00' ? `${displayHour}:00` : availableSlots[0];
                                                                                })()}
                                                                            </div>
                                                                        </div>
                                                                    )}

                                                                    {/* Slot cells with time labels on right border */}
                                                                    {availableSlots.map((slotTime) => {
                                                                        const slotEndTime = getSlotEndTime(slotTime);
                                                                        const [displayHour, displayMin] = slotEndTime.split(':');
                                                                        const displayText = displayMin === '00' ? `${displayHour}:00` : slotEndTime;

                                                                        return (
                                                                            <div
                                                                                key={`header-${slotTime}`}
                                                                                className="flex-1 min-w-[60px] relative"
                                                                            >
                                                                                {/* Vertical line on the right with time label */}
                                                                                <div className="absolute right-0 top-0 bottom-0 w-0.5 bg-gray-400 z-10">
                                                                                    <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 text-xs font-medium font-['Outfit'] text-gray-700 whitespace-nowrap bg-blue-50 px-1">
                                                                                        {displayText}
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </div>

                                                            {/* Slot Row */}
                                                            <div className="flex border-b-2 border-gray-300 bg-white">
                                                                <div className="w-24 shrink-0 border-r-2 border-gray-300 p-2 text-xs font-medium font-['Outfit'] text-center bg-gray-50">
                                                                    {venue.name}
                                                                </div>
                                                                <div className="flex flex-1">
                                                                    {availableSlots.map((slotTime) => {
                                                                        const slotDuration = venue?.slotDuration || 60;
                                                                        const slotEndTime = getSlotEndTime(slotTime);

                                                                        // Check if this slot is the start of selected range
                                                                        const isStartSlot = selectedStartTime === slotTime;
                                                                        // Check if this slot's end matches the selected end time
                                                                        const isEndSlot = selectedEndTime === slotEndTime;

                                                                        // Check if slot is within selected range
                                                                        const isInRange = selectedStartTime !== null && selectedEndTime !== null
                                                                            && (() => {
                                                                                const [startHour, startMin] = selectedStartTime.split(':').map(Number);
                                                                                const [endHour, endMin] = selectedEndTime.split(':').map(Number);
                                                                                const [slotHour, slotMin] = slotTime.split(':').map(Number);
                                                                                const startTotal = startHour * 60 + startMin;
                                                                                const endTotal = endHour * 60 + endMin;
                                                                                const slotTotal = slotHour * 60 + slotMin;
                                                                                const slotEndTotal = slotTotal + slotDuration;
                                                                                // Slot is in range if it overlaps with selected range
                                                                                return slotTotal < endTotal && slotEndTotal > startTotal;
                                                                            })();

                                                                        const isSlotBooked = !isSlotAvailable(slotTime);
                                                                        const isSlotPast = isSlotInPast(slotTime, formData.date);
                                                                        const isSlotDisabled = isSlotBooked || isSlotPast;

                                                                        // Determine cell style
                                                                        let cellStyle = "bg-white border-r border-gray-200 cursor-pointer hover:bg-emerald-50 transition-colors";
                                                                        if (isSlotDisabled) {
                                                                            if (isSlotPast) {
                                                                                cellStyle = "bg-gray-400 border-r border-gray-200 cursor-not-allowed opacity-60";
                                                                            } else {
                                                                                cellStyle = "bg-red-500 border-r border-gray-200 cursor-not-allowed opacity-80";
                                                                            }
                                                                        } else if (isInRange) {
                                                                            if (isStartSlot) {
                                                                                cellStyle = "bg-emerald-600 border-r border-gray-200 cursor-pointer text-white font-semibold";
                                                                            } else if (isEndSlot) {
                                                                                cellStyle = "bg-emerald-600 border-r border-gray-200 cursor-pointer text-white font-semibold";
                                                                            } else {
                                                                                cellStyle = "bg-emerald-400 border-r border-gray-200 cursor-pointer text-white";
                                                                            }
                                                                        }

                                                                        return (
                                                                            <div
                                                                                key={`slot-${slotTime}`}
                                                                                className={`flex-1 min-w-[60px] h-12 flex items-center justify-center text-xs font-['Outfit'] relative ${cellStyle}`}
                                                                                onClick={() => {
                                                                                    if (isSlotDisabled) return; // Prevent click if slot is booked or past
                                                                                    handleSlotBlockClick(slotTime);
                                                                                }}
                                                                                title={isSlotPast ? "Đã qua" : isSlotBooked ? "Đã đặt" : `${slotTime} - ${slotEndTime}`}
                                                                            >
                                                                                {isStartSlot && selectedStartTime && "Bắt đầu"}
                                                                                {isEndSlot && selectedEndTime && !isStartSlot && "Kết thúc"}
                                                                                {isSlotBooked}
                                                                                {isSlotPast && !isSlotBooked}
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })()}
                                            </div>
                                            <div className="mt-3 space-y-1">
                                                {selectedStartTime !== null && (
                                                    <p className="text-sm text-emerald-600 font-['Outfit']">
                                                        Giờ bắt đầu: {selectedStartTime}
                                                    </p>
                                                )}
                                                {selectedEndTime !== null && (
                                                    <p className="text-sm text-emerald-600 font-['Outfit']">
                                                        Giờ kết thúc: {selectedEndTime}
                                                    </p>
                                                )}
                                                {selectedStartTime === null && (
                                                    <p className="text-sm text-gray-500 font-['Outfit']">
                                                        Nhấn vào ô để chọn giờ bắt đầu
                                                    </p>
                                                )}
                                                {selectedStartTime !== null && selectedEndTime === null && (
                                                    <p className="text-sm text-gray-500 font-['Outfit']">
                                                        Nhấn vào ô sau giờ bắt đầu để chọn giờ kết thúc
                                                    </p>
                                                )}

                                                {/* Availability status info */}
                                                {/* {availabilityData && (
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
                                                    )} */}
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
                                <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center shrink-0">
                                    <CalendarIcon className="w-5 h-5 text-emerald-600" />
                                </div>
                                <span className="text-base text-[#6b7280] font-['Outfit']">
                                    {formData.date || 'Chưa chọn ngày'}
                                </span>
                            </div>

                            {/* Court */}
                            <div className="flex items-center gap-2">
                                <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center shrink-0">
                                    <div className="w-5 h-5 text-emerald-600 font-semibold">#</div>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-base text-[#6b7280] font-['Outfit']">
                                        {(() => {
                                            const court = courts.find(c => c.id === formData.courtId);
                                            return court?.name || formData.courtName || 'Chưa chọn sân con';
                                        })()}
                                    </span>
                                </div>
                            </div>

                            {/* Time */}
                            <div className="flex items-center gap-2">
                                <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center shrink-0">
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