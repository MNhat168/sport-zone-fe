import React, { useState, useEffect, useCallback } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
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

    // Sync with parent props
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

    // Get operating hours for day
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

    // Check if slot is available (from API data)
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
            return;
        }

        setIsLoadingAvailability(true);
        setAvailabilityError(null);

        try {
            const result = await dispatch(checkFieldAvailability({
                id: fieldId,
                startDate: selectedDate,
                endDate: selectedDate,
                courtId: selectedCourtId,
            })).unwrap();

            if (result.success && result.data && result.data.length > 0) {
                const dayData = result.data.find(item => item.date === selectedDate);
                setAvailabilityData(dayData || null);
            } else {
                setAvailabilityData(null);
            }
        } catch (error: any) {
            logger.error('[TIME SLOT] Error fetching availability:', error);
            setAvailabilityError(error.message || 'Không thể tải thông tin khả dụng');
            setAvailabilityData(null);
        } finally {
            setIsLoadingAvailability(false);
        }
    }, [fieldId, selectedDate, selectedCourtId, dispatch]);

    // Fetch when dependencies change
    useEffect(() => {
        if (selectedDate && selectedCourtId && fieldId) {
            fetchAvailabilityData();
        }
    }, [selectedDate, selectedCourtId, fieldId, fetchAvailabilityData]);

    // Handle slot click ( Selection Logic)
    const handleSlotBlockClick = (slotTime: string) => {
        // Prevent clicking disabled or past slots
        if (disabled || isSlotInPast(slotTime, selectedDate)) {
            return;
        }
        if (!isSlotAvailable(slotTime)) {
            return;
        }

        const slotEndTime = getSlotEndTime(slotTime);

        // Case 1: Deselect if clicking inside current range
        if (selectedStartTime !== null && selectedEndTime !== null) {
            const startTotal = toMinutes(selectedStartTime);
            const endTotal = toMinutes(selectedEndTime);
            const clickedTotal = toMinutes(slotTime);

            if (clickedTotal >= startTotal && clickedTotal < endTotal) {
                setSelectedStartTime(null);
                setSelectedEndTime(null);
                onTimeRangeChange('', '');
                return;
            }
        }

        // Case 2: New selection or Extend selection
        if (selectedStartTime === null) {
            // First selection: set precise block
            setSelectedStartTime(slotTime);
            setSelectedEndTime(slotEndTime);
            onTimeRangeChange(slotTime, slotEndTime);
        } else {
            // Extend range
            const currentStartTotal = toMinutes(selectedStartTime);
            const currentEndTotal = toMinutes(selectedEndTime || getSlotEndTime(selectedStartTime));
            const clickedTotal = toMinutes(slotTime);

            let newStartTime: string;
            let newEndTime: string;

            if (clickedTotal < currentStartTotal) {
                // Extend backwards
                newStartTime = slotTime;
                newEndTime = selectedEndTime || getSlotEndTime(selectedStartTime);
            } else if (clickedTotal >= currentEndTotal) {
                // Extend forwards
                newStartTime = selectedStartTime;
                newEndTime = slotEndTime;
            } else {
                // Should be covered by Case 1, but fallback to single block
                newStartTime = slotTime;
                newEndTime = slotEndTime;
            }

            // Validation: Check if all slots in the new range are available
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
                // Alternatively, reset to just the clicked block if users try to bridge a booked slot
                // For now, we just ignore the extension attempt
                // alert('Khoảng thời gian bạn chọn có chứa slot đã được đặt.');
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
            <div className="space-y-4">
                <Label className="text-base font-semibold text-gray-900">Chọn khung giờ *</Label>
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-center text-gray-500 text-sm">
                    Vui lòng chọn ngày để xem lịch trống
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <Label className="text-base font-semibold text-gray-900">Chọn khung giờ *</Label>

            {availabilityError && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{availabilityError}</AlertDescription>
                </Alert>
            )}

            {isLoadingAvailability ? (
                <div className="flex flex-col items-center justify-center p-12 border border-gray-100 rounded-xl bg-gray-50/50">
                    <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mb-3" />
                    <span className="text-sm font-medium text-gray-600">Đang tải lịch trống...</span>
                </div>
            ) : slots.length === 0 ? (
                <Alert className="bg-amber-50 border-amber-200">
                    <AlertCircle className="h-4 w-4 text-amber-600" />
                    <AlertDescription className="text-amber-800">
                        Không có khung giờ nào khả dụng cho ngày này.
                    </AlertDescription>
                </Alert>
            ) : (
                <div className="p-4 bg-gray-50 rounded-lg">
                    {/* Legend */}
                    <div className="mb-4 flex items-center gap-4 flex-wrap text-sm">
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

                    {/* Timeline Grid */}
                    <div className="overflow-x-auto">
                        <div className="inline-block min-w-full">
                            {/* Time Header Row - Time labels on vertical lines */}
                            <div className="flex border-b-2 border-gray-300 bg-blue-50 relative pt-6">
                                <div className="w-24 shrink-0 border-r-2 border-gray-300 p-2 text-xs font-semibold text-center">
                                    Giờ
                                </div>
                                <div className="flex flex-1 relative">
                                    {/* First vertical line with time label (start of first slot) */}
                                    {slots.length > 0 && (
                                        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gray-400 z-10">
                                            <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 text-xs font-medium text-gray-700 whitespace-nowrap bg-blue-50 px-1">
                                                {(() => {
                                                    const [displayHour, displayMin] = slots[0].split(':');
                                                    return displayMin === '00' ? `${displayHour}:00` : slots[0];
                                                })()}
                                            </div>
                                        </div>
                                    )}

                                    {/* Slot cells with time labels on right border */}
                                    {slots.map((slotTime) => {
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
                                                    <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 text-xs font-medium text-gray-700 whitespace-nowrap bg-blue-50 px-1">
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
                                <div className="w-24 shrink-0 border-r-2 border-gray-300 p-2 text-xs font-medium text-center bg-gray-50">

                                </div>
                                <div className="flex flex-1">
                                    {slots.map((slotTime) => {
                                        const slotEndTime = getSlotEndTime(slotTime);

                                        // Check if this slot is the start of selected range
                                        const isStartSlot = selectedStartTime === slotTime;
                                        // Check if this slot's end matches the selected end time
                                        const isEndSlot = selectedEndTime === slotEndTime;

                                        // Check if slot is within selected range
                                        const isInRange = selectedStartTime !== null && selectedEndTime !== null
                                            && (() => {
                                                const startTotal = toMinutes(selectedStartTime);
                                                const endTotal = toMinutes(selectedEndTime);
                                                const slotTotal = toMinutes(slotTime);
                                                const slotEndTotal = slotTotal + slotDuration;
                                                // Slot is in range if it overlaps with selected range
                                                return slotTotal < endTotal && slotEndTotal > startTotal;
                                            })();

                                        const isSlotBooked = !isSlotAvailable(slotTime);
                                        const isSlotPast = isSlotInPast(slotTime, selectedDate);
                                        const isSlotDisabled = isSlotBooked || isSlotPast || disabled;

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
                                                className={`flex-1 min-w-[60px] h-12 flex items-center justify-center text-xs relative ${cellStyle}`}
                                                onClick={() => {
                                                    if (isSlotDisabled) return;
                                                    handleSlotBlockClick(slotTime);
                                                }}
                                                title={isSlotPast ? "Đã qua" : isSlotBooked ? "Đã đặt" : `${slotTime} - ${slotEndTime}`}
                                            >
                                                {isStartSlot && selectedStartTime && "Bắt đầu"}
                                                {isEndSlot && selectedEndTime && !isStartSlot && "Kết thúc"}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Instruction Text */}
                    <div className="mt-3 space-y-1">
                        {selectedStartTime !== null && (
                            <p className="text-sm text-emerald-600">
                                Giờ bắt đầu: {selectedStartTime}
                            </p>
                        )}
                        {selectedEndTime !== null && (
                            <p className="text-sm text-emerald-600">
                                Giờ kết thúc: {selectedEndTime}
                            </p>
                        )}
                        {selectedStartTime === null && (
                            <p className="text-sm text-gray-500 text-center">
                                Nhấn vào ô để chọn giờ bắt đầu
                            </p>
                        )}
                        {selectedStartTime !== null && selectedEndTime === null && (
                            <p className="text-sm text-gray-500 text-center">
                                Nhấn vào ô sau giờ bắt đầu để chọn giờ kết thúc
                            </p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
