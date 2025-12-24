"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { NavbarDarkComponent } from "../../components/header/navbar-dark-component";
import PageHeader from "../../components/header-banner/page-header";
import { PageWrapper } from "../../components/layouts/page-wrapper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar as CalendarIcon, Clock, ArrowRight } from "lucide-react";
import { DatePicker } from "@/components/ui/date-picker";
import { useAppDispatch, useAppSelector } from "../../store/hook";
import { getCoachById } from "../../features/coach/coachThunk";
import { PaymentV2Coach } from "./components/payment-v2-coach";
import { PersonalInfoCoach } from "./components/personal-info-coach";

interface BookingFormData {
    date: string;
    startTime: string;
    endTime: string;
    fieldId?: string;
    note?: string;
}

const CoachBookingFlow = () => {
    const params = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { currentCoach, detailLoading } = useAppSelector((state) => state.coach);
    
    const coachId = params.id || (location.state as any)?.coachId;
    const initialData = (location.state as any) || {};

    const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
    const [bookingData, setBookingData] = useState<BookingFormData>({
        date: initialData.date || '',
        startTime: initialData.startTime || '',
        endTime: initialData.endTime || '',
        fieldId: initialData.fieldId || '',
        note: '',
    });
    const [loadingSlots, setLoadingSlots] = useState(false);
    // State for time selection (similar to field booking)
    const [selectedStartHour, setSelectedStartHour] = useState<number | null>(null);
    const [selectedEndHour, setSelectedEndHour] = useState<number | null>(null);
    // Availability data structure (similar to field booking)
    const [availabilityData, setAvailabilityData] = useState<{ slots: Array<{ startTime: string; available: boolean }> } | null>(null);

    const breadcrumbs = [
        { label: "Trang chủ", href: "/" },
        { label: "Đặt huấn luyện viên", href: "/coaches" },
        { label: "Đặt lịch" }
    ];

    // Fetch coach data
    useEffect(() => {
        if (coachId) {
            dispatch(getCoachById(coachId));
        }
    }, [dispatch, coachId]);

    const fetchAvailableSlots = useCallback(async (date: string) => {
        if (!coachId) return;
        setLoadingSlots(true);
        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
            const response = await fetch(`${apiUrl}/coaches/${coachId}/slots?date=${date}`);
            const data = await response.json();
            let slots: any[] = [];
            if (data && Array.isArray(data)) {
                slots = data;
            } else if (data.data && Array.isArray(data.data)) {
                slots = data.data;
            }
            
            // Convert to availability data format (similar to field booking)
            // Create slots for hours 8-21 (coach typical hours)
            const allHours = Array.from({ length: 14 }, (_, i) => i + 8); // 8 to 21
            const availabilitySlots = allHours.map(hour => {
                const timeString = `${String(hour).padStart(2, '0')}:00`;
                // Check if this time slot is available from API
                const apiSlot = slots.find((s: any) => s.startTime === timeString);
                return {
                    startTime: timeString,
                    available: apiSlot ? apiSlot.available : true // Default to available if not found
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
    
    // Check if slot is available
    const isSlotAvailable = (hour: number): boolean => {
        if (!availabilityData || !availabilityData.slots) {
            return true; // If no data, assume available
        }
        const timeString = `${String(hour).padStart(2, '0')}:00`;
        const slot = availabilityData.slots.find(s => s.startTime === timeString);
        return slot ? slot.available : true;
    };
    
    // Handle time slot click (similar to field booking)
    const handleTimeSlotClick = (hour: number, type: "start" | "end") => {
        if (type === "start") {
            setSelectedStartHour(hour);
            setBookingData(prev => ({
                ...prev,
                startTime: `${String(hour).padStart(2, "0")}:00`,
                endTime: prev.endTime && Number(prev.endTime.split(":")[0]) <= hour ? "" : prev.endTime,
            }));
            setSelectedEndHour(null); // reset end hour if selecting new start
        } else {
            setSelectedEndHour(hour);
            setBookingData(prev => ({
                ...prev,
                endTime: `${String(hour).padStart(2, "0")}:00`,
            }));
        }
    };
    
    // Get available time slots (8-21 for coach)
    const getAvailableTimeSlots = (): number[] => {
        return Array.from({ length: 14 }, (_, i) => i + 8); // 8 to 21
    };
    
    // Calculate booking amount
    const calculateBookingAmount = (): number => {
        if (!currentCoach?.price || !bookingData.startTime || !bookingData.endTime) return 0;
        const startHour = Number(bookingData.startTime.split(':')[0]);
        const endHour = Number(bookingData.endTime.split(':')[0]);
        if (endHour <= startHour) return 0;
        const hours = endHour - startHour;
        return Math.round((currentCoach.price || 0) * hours);
    };
    
    const formatVND = (value: number): string => {
        try {
            return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
        } catch {
            return `${value.toLocaleString('vi-VN')} ₫`;
        }
    };

    // Fetch available slots when date changes
    useEffect(() => {
        if (coachId && bookingData.date) {
            fetchAvailableSlots(bookingData.date);
        }
    }, [coachId, bookingData.date, fetchAvailableSlots]);
    
    // Update selected hours when bookingData changes
    useEffect(() => {
        if (bookingData.startTime) {
            const startHour = parseInt(bookingData.startTime.split(':')[0]);
            setSelectedStartHour(startHour);
        } else {
            setSelectedStartHour(null);
        }
        if (bookingData.endTime) {
            const endHour = parseInt(bookingData.endTime.split(':')[0]);
            setSelectedEndHour(endHour);
        } else {
            setSelectedEndHour(null);
        }
    }, [bookingData.startTime, bookingData.endTime]);

    const handleStep1Submit = () => {
        if (!bookingData.date || !bookingData.startTime || !bookingData.endTime) {
            alert('Vui lòng chọn đầy đủ ngày và giờ');
            return;
        }
        // FieldId is now optional - no validation needed
        setBookingData(prev => ({ ...prev, fieldId: prev.fieldId || undefined }));
        setCurrentStep(2); // Move to PersonalInfo step
    };

    const handlePersonalInfoSubmit = (formData: BookingFormData) => {
        setBookingData(prev => ({ ...prev, ...formData }));
        setCurrentStep(3); // Move to Payment step
    };

    const handleBack = () => {
        if (currentStep === 3) {
            setCurrentStep(2); // From Payment -> back to PersonalInfo
        } else if (currentStep === 2) {
            setCurrentStep(1); // From PersonalInfo -> back to Step 1
        } else {
            navigate(`/coaches/${coachId}`);
        }
    };

    if (detailLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Đang tải thông tin huấn luyện viên...</p>
                </div>
            </div>
        );
    }

    if (currentStep === 1) {
        return (
            <>
                <NavbarDarkComponent />
                <PageWrapper>
                    <PageHeader title="Đặt lịch với huấn luyện viên" breadcrumbs={breadcrumbs} />
                    
                    <div className="w-full max-w-[1320px] mx-auto px-3 flex flex-col gap-10">
                        {/* Header Card */}
                        <Card className="border border-gray-200">
                            <CardContent className="p-6">
                                <div className="pb-10">
                                    <h1 className="text-2xl font-semibold text-center text-[#1a1a1a] mb-1">
                                        Đặt lịch với huấn luyện viên
                                    </h1>
                                </div>

                                {/* Coach Info */}
                                {currentCoach && (
                                    <div className="p-6 bg-gray-50 rounded-lg">
                                        <div className="flex items-start gap-4">
                                            {currentCoach.avatar && (
                                                <img
                                                    src={currentCoach.avatar}
                                                    alt={currentCoach.name}
                                                    className="w-24 h-24 rounded-lg object-cover"
                                                />
                                            )}
                                            <div className="flex-1">
                                                <h2 className="text-2xl font-semibold text-[#1a1a1a] mb-2">
                                                    {currentCoach.name}
                                                </h2>
                                                <p className="text-base text-[#6b7280]">
                                                    {currentCoach.description || 'Huấn luyện viên chuyên nghiệp'}
                                                </p>
                                                <div className="mt-2 flex items-baseline gap-1">
                                                    <span className="text-2xl font-semibold text-emerald-600">
                                                        {formatVND(currentCoach.price || 0)}
                                                    </span>
                                                    <span className="text-sm text-gray-500">/giờ</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Main Content */}
                        <div className="flex flex-wrap gap-6">
                            {/* Booking Form */}
                            <div className="flex-1 min-w-[600px]">
                                <Card className="border border-gray-200">
                                    <CardHeader className="border-b border-gray-200">
                                        <CardTitle className="text-2xl font-semibold">
                                            Biểu mẫu đặt lịch
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-6 space-y-4">
                                        {/* Date Picker */}
                                        <div className="space-y-2.5">
                                            <DatePicker
                                                label="Ngày"
                                                value={bookingData.date ? new Date(bookingData.date + 'T00:00:00') : undefined}
                                                onChange={(day) => {
                                                    if (!day) {
                                                        setBookingData(prev => ({ ...prev, date: '' }));
                                                        setSelectedStartHour(null);
                                                        setSelectedEndHour(null);
                                                        setAvailabilityData(null);
                                                        return;
                                                    }
                                                    const yyyy = day.getFullYear();
                                                    const mm = String(day.getMonth() + 1).padStart(2, '0');
                                                    const dd = String(day.getDate()).padStart(2, '0');
                                                    const ymd = `${yyyy}-${mm}-${dd}`;
                                                    setBookingData(prev => ({ ...prev, date: ymd }));
                                                    
                                                    // Reset time selection when date changes
                                                    setSelectedStartHour(null);
                                                    setSelectedEndHour(null);
                                                    
                                                    // Fetch availability data for selected date
                                                    fetchAvailableSlots(ymd);
                                                }}
                                                disabled={(d) => {
                                                    // past dates => disabled
                                                    const today = new Date();
                                                    today.setHours(0,0,0,0);
                                                    const date = new Date(d);
                                                    date.setHours(0,0,0,0);
                                                    return date < today;
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
                                            <Label className="text-base font-normal">Chọn khung giờ</Label>
                                            <div className="p-4 bg-gray-50 rounded-lg">
                                                {!bookingData.date ? (
                                                    <p className="text-sm text-gray-500 text-center py-4">
                                                        Vui lòng chọn ngày trước khi chọn giờ
                                                    </p>
                                                ) : loadingSlots ? (
                                                    <div className="flex items-center justify-center py-8">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-5 h-5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                                                            <p className="text-sm text-gray-600">
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
                                                                        w-14 h-14 rounded-lg border-2 font-semibold text-base
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
                                                                <p className="text-sm text-emerald-600">
                                                                    Giờ bắt đầu: {String(selectedStartHour).padStart(2, "0")}:00
                                                                </p>
                                                            )}
                                                            {selectedEndHour !== null && (
                                                                <p className="text-sm text-emerald-600">
                                                                    Giờ kết thúc: {String(selectedEndHour).padStart(2, "0")}:00
                                                                </p>
                                                            )}
                                                            {selectedStartHour === null && (
                                                                <p className="text-sm text-gray-500">
                                                                    Nhấn vào ô để chọn giờ bắt đầu
                                                                </p>
                                                            )}
                                                            {selectedStartHour !== null && selectedEndHour === null && (
                                                                <p className="text-sm text-gray-500">
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

                                        {/* Note */}
                                        <div className="space-y-2">
                                            <Label htmlFor="note" className="text-base font-normal">Ghi chú (tùy chọn)</Label>
                                            <Input
                                                id="note"
                                                type="text"
                                                placeholder="Ví dụ: Muốn học kỹ thuật ném bóng"
                                                value={bookingData.note || ''}
                                                onChange={(e) => setBookingData(prev => ({ ...prev, note: e.target.value }))}
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
                                        <CardTitle className="text-2xl font-semibold">
                                            Chi tiết đặt lịch
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-6 space-y-5">
                                        {/* Date */}
                                        <div className="flex items-center gap-2">
                                            <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center shrink-0">
                                                <CalendarIcon className="w-5 h-5 text-emerald-600" />
                                            </div>
                                            <span className="text-base text-[#6b7280]">
                                                {bookingData.date || 'Chưa chọn ngày'}
                                            </span>
                                        </div>

                                        {/* Time */}
                                        <div className="flex items-center gap-2">
                                            <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center shrink-0">
                                                <Clock className="w-5 h-5 text-emerald-600" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-base text-[#6b7280]">
                                                    {bookingData.startTime && bookingData.endTime
                                                        ? `${bookingData.startTime} to ${bookingData.endTime}`
                                                        : 'Chưa chọn giờ'}
                                                </span>
                                                {bookingData.startTime && bookingData.endTime && (
                                                    <span className="text-sm text-emerald-600">
                                                        Thời lượng: {(() => {
                                                            const [startHour] = bookingData.startTime.split(':').map(Number);
                                                            const [endHour] = bookingData.endTime.split(':').map(Number);
                                                            const duration = endHour - startHour;
                                                            return duration > 0 ? `${duration} giờ` : 'Khoảng thời gian không hợp lệ';
                                                        })()}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Coach Price */}
                                        {currentCoach && bookingData.startTime && bookingData.endTime && (
                                            <div className="pt-2">
                                                <Button
                                                    className="w-full h-auto py-3 bg-emerald-700 hover:bg-emerald-800 text-white text-lg font-semibold"
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
                        <div className="flex flex-col items-center gap-3 py-5 bg-white/20 shadow-[0px_4px_44px_0px_rgba(211,211,211,0.25)]">
                            <div className="flex justify-center items-center gap-5">
                                <Button
                                    onClick={handleStep1Submit}
                                    disabled={!bookingData.date || !bookingData.startTime || !bookingData.endTime}
                                    className={`px-5 py-3 text-white ${(bookingData.date && bookingData.startTime && bookingData.endTime)
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
                </PageWrapper>
            </>
        );
    }

    // Step 2: PersonalInfo
    if (currentStep === 2) {
        return (
            <>
                <NavbarDarkComponent />
                <PageWrapper>
                    <PageHeader title="Đặt lịch với huấn luyện viên" breadcrumbs={breadcrumbs} />
                    <PersonalInfoCoach
                        coachId={coachId || ''}
                        bookingData={bookingData}
                        onSubmit={handlePersonalInfoSubmit}
                        onBack={handleBack}
                    />
                </PageWrapper>
            </>
        );
    }

    // Step 3: Payment (STK + QR + Upload receipt)
    return (
        <PaymentV2Coach
            coachId={coachId || ''}
            bookingData={bookingData}
            onBack={handleBack}
        />
    );
};

export default CoachBookingFlow;

