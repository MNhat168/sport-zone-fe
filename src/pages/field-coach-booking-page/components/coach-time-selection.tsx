import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Calendar as CalendarIcon, Clock } from "lucide-react";
import { DatePicker } from "@/components/ui/date-picker";

interface CoachTimeSelectionProps {
    coachId: string;
    coachName: string;
    coachPrice: number;
    onSubmit: (data: { date: string; startTime: string; endTime: string; note?: string }) => void;
    onBack: () => void;
}

export const CoachTimeSelection = ({ coachId, coachName, coachPrice, onSubmit, onBack }: CoachTimeSelectionProps) => {
    const [date, setDate] = useState<string>('');
    const [startTime, setStartTime] = useState<string>('');
    const [endTime, setEndTime] = useState<string>('');
    const [note, setNote] = useState<string>('');
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [selectedStartHour, setSelectedStartHour] = useState<number | null>(null);
    const [selectedEndHour, setSelectedEndHour] = useState<number | null>(null);
    const [availabilityData, setAvailabilityData] = useState<{ slots: Array<{ startTime: string; available: boolean }> } | null>(null);

    const fetchAvailableSlots = useCallback(async (selectedDate: string) => {
        if (!coachId) return;
        setLoadingSlots(true);
        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
            const response = await fetch(`${apiUrl}/coaches/${coachId}/slots?date=${selectedDate}`);
            const data = await response.json();
            let slots: any[] = [];
            if (data && Array.isArray(data)) {
                slots = data;
            } else if (data.data && Array.isArray(data.data)) {
                slots = data.data;
            }

            // Create slots for hours 8-21 (coach typical hours)
            const allHours = Array.from({ length: 14 }, (_, i) => i + 8);
            const availabilitySlots = allHours.map(hour => {
                const timeString = `${String(hour).padStart(2, '0')}:00`;
                const apiSlot = slots.find((s: any) => s.startTime === timeString);
                return {
                    startTime: timeString,
                    available: apiSlot ? apiSlot.available : true
                };
            });

            setAvailabilityData({ slots: availabilitySlots });
        } catch (error) {
            console.error('Failed to fetch available slots', error);
            setAvailabilityData(null);
        } finally {
            setLoadingSlots(false);
        }
    }, [coachId]);

    const isSlotAvailable = (hour: number): boolean => {
        if (!availabilityData || !availabilityData.slots) {
            return true;
        }
        const timeString = `${String(hour).padStart(2, '0')}:00`;
        const slot = availabilityData.slots.find(s => s.startTime === timeString);
        return slot ? slot.available : true;
    };

    const handleTimeSlotClick = (hour: number, type: "start" | "end") => {
        if (type === "start") {
            setSelectedStartHour(hour);
            setStartTime(`${String(hour).padStart(2, "0")}:00`);
            if (selectedEndHour !== null && selectedEndHour <= hour) {
                setSelectedEndHour(null);
                setEndTime('');
            }
        } else {
            setSelectedEndHour(hour);
            setEndTime(`${String(hour).padStart(2, "0")}:00`);
        }
    };

    const getAvailableTimeSlots = (): number[] => {
        return Array.from({ length: 14 }, (_, i) => i + 8); // 8 to 21
    };

    const calculateBookingAmount = (): number => {
        if (!coachPrice || !startTime || !endTime) return 0;
        const startHour = Number(startTime.split(':')[0]);
        const endHour = Number(endTime.split(':')[0]);
        if (endHour <= startHour) return 0;
        const hours = endHour - startHour;
        return Math.round(coachPrice * hours);
    };

    const formatVND = (value: number): string => {
        try {
            return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
        } catch {
            return `${value.toLocaleString('vi-VN')} ₫`;
        }
    };

    useEffect(() => {
        if (coachId && date) {
            fetchAvailableSlots(date);
        }
    }, [coachId, date, fetchAvailableSlots]);

    const handleSubmit = () => {
        if (!date || !startTime || !endTime) {
            alert('Vui lòng chọn đầy đủ ngày và giờ');
            return;
        }
        onSubmit({ date, startTime, endTime, note: note || undefined });
    };

    return (
        <div className="w-full max-w-[1320px] mx-auto px-3 py-10">
            {/* Header */}
            <Card className="border border-gray-200 mb-6">
                <CardContent className="p-6">
                    <h1 className="text-2xl font-semibold font-['Outfit'] text-center text-[#1a1a1a] mb-4">
                        Chọn thời gian với HLV {coachName}
                    </h1>
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-semibold text-emerald-600">
                                {formatVND(coachPrice)}
                            </span>
                            <span className="text-sm text-gray-500">/giờ</span>
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
                                Biểu mẫu đặt lịch
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                            {/* Date Picker */}
                            <div className="space-y-2.5">
                                <DatePicker
                                    label="Ngày"
                                    value={date ? new Date(date + 'T00:00:00') : undefined}
                                    onChange={(day) => {
                                        if (!day) {
                                            setDate('');
                                            setSelectedStartHour(null);
                                            setSelectedEndHour(null);
                                            setAvailabilityData(null);
                                            return;
                                        }
                                        const yyyy = day.getFullYear();
                                        const mm = String(day.getMonth() + 1).padStart(2, '0');
                                        const dd = String(day.getDate()).padStart(2, '0');
                                        const ymd = `${yyyy}-${mm}-${dd}`;
                                        setDate(ymd);

                                        // Reset time selection when date changes
                                        setSelectedStartHour(null);
                                        setSelectedEndHour(null);
                                        setStartTime('');
                                        setEndTime('');

                                        // Fetch availability data for selected date
                                        fetchAvailableSlots(ymd);
                                    }}
                                    disabled={(d) => {
                                        const today = new Date();
                                        today.setHours(0, 0, 0, 0);
                                        const dateToCheck = new Date(d);
                                        dateToCheck.setHours(0, 0, 0, 0);
                                        return dateToCheck < today;
                                    }}
                                    buttonClassName="h-14 bg-white border-0 text-left"
                                    popoverAlign="start"
                                    captionLayout="dropdown-months"
                                    fromDate={(() => { const t = new Date(); t.setHours(0, 0, 0, 0); return t; })()}
                                    toDate={(() => { const t = new Date(); t.setHours(0, 0, 0, 0); t.setMonth(t.getMonth() + 3); return t; })()}
                                />
                            </div>

                            {/* Time Range Selector */}
                            <div className="space-y-2.5">
                                <Label className="text-base font-normal font-['Outfit']">Chọn khung giờ</Label>
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    {!date ? (
                                        <p className="text-sm text-gray-500 font-['Outfit'] text-center py-4">
                                            Vui lòng chọn ngày trước khi chọn giờ
                                        </p>
                                    ) : loadingSlots ? (
                                        <div className="flex items-center justify-center py-8">
                                            <div className="flex items-center gap-3">
                                                <div className="w-5 h-5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                                                <p className="text-sm text-gray-600 font-['Outfit']">
                                                    Đang tải thông tin khả dụng...
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="flex flex-wrap gap-2">
                                                {getAvailableTimeSlots().map((hour) => {
                                                    const isStartHour = selectedStartHour === hour;
                                                    const isEndHour = selectedEndHour === hour;
                                                    const isInRange = selectedStartHour !== null && selectedEndHour !== null
                                                        && hour > selectedStartHour && hour < selectedEndHour;
                                                    const isSlotBooked = !isSlotAvailable(hour);

                                                    return (
                                                        <button
                                                            key={`time-${hour}`}
                                                            type="button"
                                                            disabled={isSlotBooked}
                                                            onClick={() => {
                                                                if (isSlotBooked) return;

                                                                if (selectedStartHour === null) {
                                                                    handleTimeSlotClick(hour, "start");
                                                                } else if (selectedEndHour === null && hour > selectedStartHour) {
                                                                    handleTimeSlotClick(hour, "end");
                                                                } else {
                                                                    handleTimeSlotClick(hour, "start");
                                                                }
                                                            }}
                                                            className={`
                                                            w-14 h-14 rounded-lg border-2 font-semibold font-['Outfit'] text-base
                                                            transition-all duration-200 relative
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
                                                            </div>
                                                            {isSlotBooked && (
                                                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
                                                            )}
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

                            {/* Note */}
                            <div className="space-y-2">
                                <Label htmlFor="note" className="text-base font-normal font-['Outfit']">Ghi chú (tùy chọn)</Label>
                                <Input
                                    id="note"
                                    type="text"
                                    placeholder="Ví dụ: Muốn học kỹ thuật ném bóng"
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    className="h-14 bg-gray-50 border-0"
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Booking Details Sidebar */}
                <div className="w-96">
                    <Card className="border border-gray-200">
                        <CardHeader className="border-b border-gray-200">
                            <CardTitle className="text-2xl font-semibold font-['Outfit']">
                                Chi tiết đặt lịch
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-5">
                            {/* Date */}
                            <div className="flex items-center gap-2">
                                <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center shrink-0">
                                    <CalendarIcon className="w-5 h-5 text-emerald-600" />
                                </div>
                                <span className="text-base text-[#6b7280] font-['Outfit']">
                                    {date || 'Chưa chọn ngày'}
                                </span>
                            </div>

                            {/* Time */}
                            <div className="flex items-center gap-2">
                                <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center shrink-0">
                                    <Clock className="w-5 h-5 text-emerald-600" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-base text-[#6b7280] font-['Outfit']">
                                        {startTime && endTime
                                            ? `${startTime} to ${endTime}`
                                            : 'Chưa chọn giờ'}
                                    </span>
                                    {startTime && endTime && (
                                        <span className="text-sm text-emerald-600 font-['Outfit']">
                                            Thời lượng: {(() => {
                                                const [startHour] = startTime.split(':').map(Number);
                                                const [endHour] = endTime.split(':').map(Number);
                                                const duration = endHour - startHour;
                                                return duration > 0 ? `${duration} giờ` : 'Khoảng thời gian không hợp lệ';
                                            })()}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Price */}
                            {startTime && endTime && (
                                <div className="pt-2">
                                    <Button
                                        className="w-full h-auto py-3 bg-emerald-700 hover:bg-emerald-800 text-white text-lg font-semibold font-['Outfit']"
                                        disabled
                                    >
                                        Tổng phụ: {formatVND(calculateBookingAmount())}
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center gap-5 mt-10">
                <Button
                    variant="outline"
                    onClick={onBack}
                    className="px-8 py-3 font-['Outfit']"
                >
                    Quay lại
                </Button>
                <Button
                    onClick={handleSubmit}
                    disabled={!date || !startTime || !endTime}
                    className={`px-8 py-3 text-white font-['Outfit'] ${(date && startTime && endTime)
                        ? 'bg-emerald-600 hover:bg-emerald-700'
                        : 'bg-gray-400 cursor-not-allowed'
                        }`}
                >
                    Tiếp tục
                </Button>
            </div>
        </div>
    );
};
