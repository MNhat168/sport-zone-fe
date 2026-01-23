import React, { useState, useEffect, useCallback } from 'react';
import { Clock, Loader2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { useAppDispatch } from '@/store/hook';
import { checkFieldAvailability } from '@/features/field/fieldThunk';
import type { FieldAvailabilityData } from '@/types/field-type';
import logger from '@/utils/logger';

interface TimeSlotSelectorProps {
    selectedDate: string; // YYYY-MM-DD format
    selectedCourtId: string;
    fieldId: string;
    operatingHours?: Array<{ day: string; start: string; end: string }>;
    slotDuration?: number; // in minutes
    onTimeRangeChange: (startTime: string, endTime: string) => void;
    selectedStart: string;
    selectedEnd: string;
    disabled?: boolean;
}

export const TimeSlotSelector: React.FC<TimeSlotSelectorProps> = ({
    selectedDate,
    selectedCourtId,
    fieldId,
    operatingHours = [],
    slotDuration = 60,
    onTimeRangeChange,
    selectedStart,
    selectedEnd,
    disabled = false,
}) => {
    const dispatch = useAppDispatch();

    const [availabilityData, setAvailabilityData] = useState<FieldAvailabilityData | null>(null);
    const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);
    const [availabilityError, setAvailabilityError] = useState<string | null>(null);
    const [selectedStartTime, setSelectedStartTime] = useState<string | null>(selectedStart || null);
    const [selectedEndTime, setSelectedEndTime] = useState<string | null>(selectedEnd || null);

    // Sync with parent
    useEffect(() => {
        setSelectedStartTime(selectedStart || null);
        setSelectedEndTime(selectedEnd || null);
    }, [selectedStart, selectedEnd]);

    // Helper: Convert time string to minutes
    const toMinutes = (t: string): number => {
        const [hh = '00', mm = '00'] = (t || '00:00').split(':');
        return Number(hh) * 60 + Number(mm);
    };

    // Helper: Convert minutes to time string
    const minutesToTimeString = (minutes: number): string => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
    };

    // Get day name from date
    const getDayName = (date: Date): string => {
        const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        return dayNames[date.getDay()];
    };

    // Get operating hours for date
    const getOperatingHoursForDay = (dayName: string) => {
        return operatingHours.find(hour => hour.day === dayName);
    };

    // Generate available time slots
    const getAvailableTimeSlots = (selectedDate: string): string[] => {
        if (!selectedDate || operatingHours.length === 0) {
            return [];
        }

        const date = new Date(selectedDate + 'T00:00:00');
        const dayName = getDayName(date);
        const operatingHour = getOperatingHoursForDay(dayName);

        if (!operatingHour) {
            return [];
        }

        const startMinutes = toMinutes(operatingHour.start);
        const endMinutes = toMinutes(operatingHour.end);

        const slots: string[] = [];
        for (let currentMinutes = startMinutes; currentMinutes < endMinutes; currentMinutes += slotDuration) {
            const slotEndMinutes = currentMinutes + slotDuration;
            if (slotEndMinutes > endMinutes) break;

            const startTime = minutesToTimeString(currentMinutes);
            slots.push(startTime);
        }

        return slots;
    };

    // Check if slot is available
    const isSlotAvailable = (timeString: string): boolean => {
        if (!availabilityData || !availabilityData.slots) {
            return true;
        }

        const slot = availabilityData.slots.find(s => s.startTime === timeString);
        return slot ? slot.available : true;
    };

    // Check if slot is in the past
    const isSlotInPast = (slotTime: string, selectedDate: string): boolean => {
        if (!selectedDate) return false;

        const today = new Date();
        const selected = new Date(selectedDate + 'T00:00:00');

        const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const selectedDateOnly = new Date(selected.getFullYear(), selected.getMonth(), selected.getDate());

        if (selectedDateOnly.getTime() !== todayDateOnly.getTime()) {
            return false;
        }

        const [slotHour, slotMinute] = slotTime.split(':').map(Number);
        const slotTotal = slotHour * 60 + slotMinute;
        const nowTotal = today.getHours() * 60 + today.getMinutes();

        return slotTotal < nowTotal;
    };

    // Get slot end time
    const getSlotEndTime = (startTime: string): string => {
        const startTotal = toMinutes(startTime);
        const endTotal = startTotal + slotDuration;
        return minutesToTimeString(endTotal);
    };

    // Fetch availability data
    const fetchAvailabilityData = useCallback(async () => {
        if (!fieldId || !selectedDate || !selectedCourtId) {
            console.log('[TIME SLOT DEBUG] Missing params:', { fieldId, selectedDate, selectedCourtId });
            return;
        }

        console.log('[TIME SLOT DEBUG] Fetching availability with params:', {
            fieldId,
            selectedDate,
            selectedCourtId,
        });

        setIsLoadingAvailability(true);
        setAvailabilityError(null);

        try {
            const result = await dispatch(checkFieldAvailability({
                id: fieldId,
                startDate: selectedDate,
                endDate: selectedDate,
                courtId: selectedCourtId,
            })).unwrap();

            console.log('[TIME SLOT DEBUG] Availability result:', result);

            if (result.success && result.data && result.data.length > 0) {
                const dayData = result.data.find(item => item.date === selectedDate);
                setAvailabilityData(dayData || null);
            } else {
                setAvailabilityData(null);
            }
        } catch (error: any) {
            console.error('[TIME SLOT DEBUG] Error fetching availability:', error);
            console.error('[TIME SLOT DEBUG] Error details:', {
                message: error.message,
                response: error.response,
                fieldId,
                selectedCourtId,
            });
            logger.error('[TIME SLOT] Error fetching availability:', error);
            setAvailabilityError(error.message || 'Không thể tải thông tin khả dụng');
            setAvailabilityData(null);
        } finally {
            setIsLoadingAvailability(false);
        }
    }, [fieldId, selectedDate, selectedCourtId, dispatch]);

    // Fetch availability when dependencies change
    useEffect(() => {
        if (selectedDate && selectedCourtId && fieldId) {
            fetchAvailabilityData();
        }
    }, [selectedDate, selectedCourtId, fieldId, fetchAvailabilityData]);

    // Handle slot click
    const handleSlotBlockClick = (slotTime: string) => {
        if (disabled || isSlotInPast(slotTime, selectedDate)) {
            return;
        }

        const slotEndTime = getSlotEndTime(slotTime);

        // Check if clicking on a slot that's already in the selected range - deselect if yes
        if (selectedStartTime !== null && selectedEndTime !== null) {
            const [startHour, startMin] = selectedStartTime.split(':').map(Number);
            const [endHour, endMin] = selectedEndTime.split(':').map(Number);
            const [clickedHour, clickedMin] = slotTime.split(':').map(Number);

            const startTotal = startHour * 60 + startMin;
            const endTotal = endHour * 60 + endMin;
            const clickedTotal = clickedHour * 60 + clickedMin;

            if (clickedTotal >= startTotal && clickedTotal < endTotal) {
                setSelectedStartTime(null);
                setSelectedEndTime(null);
                onTimeRangeChange('', '');
                return;
            }
        }

        if (selectedStartTime === null) {
            // First selection
            setSelectedStartTime(slotTime);
            setSelectedEndTime(slotEndTime);
            onTimeRangeChange(slotTime, slotEndTime);
        } else {
            // Extend range
            const [currentStartHour, currentStartMin] = selectedStartTime.split(':').map(Number);
            const [currentEndHour, currentEndMin] = (selectedEndTime || getSlotEndTime(selectedStartTime)).split(':').map(Number);
            const [clickedHour, clickedMin] = slotTime.split(':').map(Number);

            const currentStartTotal = currentStartHour * 60 + currentStartMin;
            const currentEndTotal = currentEndHour * 60 + currentEndMin;
            const clickedTotal = clickedHour * 60 + clickedMin;

            let newStartTime: string;
            let newEndTime: string;

            if (clickedTotal < currentStartTotal) {
                newStartTime = slotTime;
                newEndTime = selectedEndTime || getSlotEndTime(selectedStartTime);
            } else if (clickedTotal >= currentEndTotal) {
                newStartTime = selectedStartTime;
                newEndTime = slotEndTime;
            } else {
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
                return;
            }

            setSelectedStartTime(newStartTime);
            setSelectedEndTime(newEndTime);
            onTimeRangeChange(newStartTime, newEndTime);
        }
    };

    // Check if slot is in selected range
    const isSlotInRange = (slotTime: string): boolean => {
        if (!selectedStartTime || !selectedEndTime) return false;

        const slotTotal = toMinutes(slotTime);
        const startTotal = toMinutes(selectedStartTime);
        const endTotal = toMinutes(selectedEndTime);

        return slotTotal >= startTotal && slotTotal < endTotal;
    };

    const slots = getAvailableTimeSlots(selectedDate);

    if (!selectedDate) {
        return (
            <div className="space-y-2">
                <Label className="text-base font-semibold">Chọn khung giờ *</Label>
                <p className="text-sm text-gray-500">Vui lòng chọn ngày trước</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <Label className="text-base font-semibold flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Chọn khung giờ *
            </Label>

            {availabilityError && (
                <Alert variant="destructive">
                    <AlertDescription>{availabilityError}</AlertDescription>
                </Alert>
            )}

            {isLoadingAvailability ? (
                <div className="flex items-center justify-center p-8 border rounded-lg">
                    <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                    <span className="ml-2 text-sm text-gray-600">Đang tải khung giờ...</span>
                </div>
            ) : slots.length === 0 ? (
                <Alert>
                    <AlertDescription>
                        Không có khung giờ khả dụng cho ngày này
                    </AlertDescription>
                </Alert>
            ) : (
                <>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 max-h-96 overflow-y-auto p-2 border rounded-lg">
                        {slots.map((slot) => {
                            const slotAvailable = isSlotAvailable(slot);
                            const slotPast = isSlotInPast(slot, selectedDate);
                            const slotInRange = isSlotInRange(slot);
                            const slotDisabled = !slotAvailable || slotPast || disabled;

                            return (
                                <button
                                    key={slot}
                                    onClick={() => !slotDisabled && handleSlotBlockClick(slot)}
                                    disabled={slotDisabled}
                                    className={cn(
                                        "px-3 py-2 text-sm font-medium rounded-md transition-all duration-200",
                                        "focus:outline-none focus:ring-2 focus:ring-emerald-500",
                                        slotInRange
                                            ? "bg-emerald-600 text-white hover:bg-emerald-700"
                                            : slotDisabled
                                                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                                : "bg-white border-2 border-gray-200 text-gray-700 hover:border-emerald-500 hover:bg-emerald-50"
                                    )}
                                >
                                    {slot}
                                </button>
                            );
                        })}
                    </div>

                    {selectedStartTime && selectedEndTime && (
                        <div className="mt-4 p-4 bg-emerald-50 border-2 border-emerald-200 rounded-lg">
                            <p className="text-sm font-medium text-emerald-900">
                                Đã chọn: {selectedStartTime} - {selectedEndTime}
                            </p>
                            <p className="text-xs text-emerald-700 mt-1">
                                Thời lượng: {(toMinutes(selectedEndTime) - toMinutes(selectedStartTime)) / 60} giờ
                            </p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};
