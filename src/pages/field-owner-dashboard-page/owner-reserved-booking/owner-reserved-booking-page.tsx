"use client";

import { useState, useEffect } from "react";
import { FieldOwnerDashboardLayout } from "@/components/layouts/field-owner-dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle, Lock, CheckCircle2 } from "lucide-react";
import { DatePicker } from "@/components/ui/date-picker";
import { OwnerFieldListSidebar } from "@/components/booking/owner-field-list-sidebar";
import { CourtRadioGroup } from "@/components/booking/court-radio-group";
import { TimeSlotSelector } from "@/components/booking/time-slot-selector";
import { useAppDispatch, useAppSelector } from "@/store/hook";
import { createOwnerReservedBooking } from "@/features/booking/bookingThunk";
import { getMyFields } from "@/features/field/fieldThunk";
import axiosPrivate from "@/utils/axios/axiosPrivate";
import logger from "@/utils/logger";
import { formatCurrency } from "@/utils/format-currency";
import { toast } from "sonner";
import type { Field } from "@/types/field-type";

interface CourtOption {
    _id?: string;
    id?: string;
    name: string;
    courtNumber?: number;
}

export default function OwnerReservedBookingPage() {
    const dispatch = useAppDispatch();
    const { fields } = useAppSelector((state) => state.field);

    const [selectedFieldId, setSelectedFieldId] = useState<string>("");
    const [selectedCourtId, setSelectedCourtId] = useState<string>("");
    const [courts, setCourts] = useState<CourtOption[]>([]);
    const [date, setDate] = useState<string>("");
    const [startTime, setStartTime] = useState<string>("");
    const [endTime, setEndTime] = useState<string>("");
    const [note, setNote] = useState<string>("");
    const [systemFee, setSystemFee] = useState<number>(0);
    const [originalPrice, setOriginalPrice] = useState<number>(0);
    const [loading, setLoading] = useState(false);
    const [loadingCourts, setLoadingCourts] = useState(false);
    const [loadingPrice, setLoadingPrice] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [pendingBalance, setPendingBalance] = useState<number>(0);
    const [success, setSuccess] = useState(false);

    // Fetch fields on mount
    useEffect(() => {
        if (fields.length === 0) {
            dispatch(getMyFields({}));
        }
    }, [dispatch, fields.length]);

    // Fetch courts when field is selected
    useEffect(() => {
        if (selectedFieldId) {
            fetchCourts();
        } else {
            setCourts([]);
            setSelectedCourtId("");
        }
    }, [selectedFieldId]);

    // Fetch pending balance
    useEffect(() => {
        fetchPendingBalance();
    }, []);

    // Calculate system fee when price info changes
    useEffect(() => {
        if (originalPrice > 0) {
            const fee = Math.round(originalPrice * 0.05); // 5% system fee
            setSystemFee(fee);
        } else {
            setSystemFee(0);
        }
    }, [originalPrice]);

    // Calculate price when time slot changes
    useEffect(() => {
        if (selectedFieldId && date && startTime && endTime) {
            // Only calculate if court is selected or if field has only one court
            if (selectedCourtId || courts.length === 1) {
                calculatePrice();
            } else {
                setOriginalPrice(0);
            }
        } else {
            setOriginalPrice(0);
        }
    }, [selectedFieldId, selectedCourtId, date, startTime, endTime, courts.length]);

    const fetchCourts = async () => {
        if (!selectedFieldId) return;

        setLoadingCourts(true);
        try {
            const response = await axiosPrivate.get(`/fields/${selectedFieldId}/courts`);
            const courtsData = response.data?.data || response.data || [];

            console.log('[DEBUG] Fetched courts for field:', selectedFieldId);
            console.log('[DEBUG] Courts data:', courtsData);
            console.log('[DEBUG] Courts count:', courtsData.length);

            setCourts(courtsData);
            if (courtsData.length === 1) {
                const autoSelectedCourtId = courtsData[0]._id || courtsData[0].id;
                console.log('[DEBUG] Auto-selecting single court:', autoSelectedCourtId);
                setSelectedCourtId(autoSelectedCourtId);
            }
        } catch (error: any) {
            logger.error("Error fetching courts:", error);
            setError("Không thể tải danh sách sân");
        } finally {
            setLoadingCourts(false);
        }
    };

    const fetchPendingBalance = async () => {
        try {
            const response = await axiosPrivate.get("/wallets/field-owner");
            console.log('[DEBUG] Wallet response:', response.data);

            // Backend ResponseInterceptor wraps response in { success: true, data: ... }
            // So response.data = { success: true, data: { pendingBalance, ... } }
            const wallet = response.data?.data || response.data;
            console.log('[DEBUG] Wallet object:', wallet);
            console.log('[DEBUG] Pending balance:', wallet?.pendingBalance);

            const pendingBalance = wallet?.pendingBalance ?? 0;
            setPendingBalance(pendingBalance);

            console.log('[DEBUG] Set pending balance to:', pendingBalance);
        } catch (error: any) {
            // Log detailed error information
            console.error('[DEBUG] Error fetching pending balance - Full error:', error);
            console.error('[DEBUG] Error response status:', error.response?.status);
            console.error('[DEBUG] Error response data:', error.response?.data);
            console.error('[DEBUG] Error message:', error.message);
            console.error('[DEBUG] Error config:', error.config);

            logger.error("Error fetching pending balance:", {
                message: error.message,
                status: error.response?.status,
                data: error.response?.data,
                url: error.config?.url
            });

            // Set to 0 on error to prevent UI issues
            setPendingBalance(0);
        }
    };

    const calculatePrice = async () => {
        if (!selectedFieldId || !date || !startTime || !endTime) return;

        // Use selectedCourtId or first court if only one court
        const courtIdToUse = selectedCourtId || (courts.length === 1 ? (courts[0]._id || courts[0].id) : "");

        setLoadingPrice(true);
        try {
            // Get field availability to calculate price
            const url = `/fields/${selectedFieldId}/availability?startDate=${date}&endDate=${date}${courtIdToUse ? `&courtId=${courtIdToUse}` : ""}`;
            const response = await axiosPrivate.get(url);

            const availability = response.data?.data || response.data || [];
            const dayData = availability.find((d: any) => d.date === date);

            if (dayData?.slots) {
                // Find slots that overlap with selected time range
                const selectedStart = timeToMinutes(startTime);
                const selectedEnd = timeToMinutes(endTime);

                let totalPrice = 0;
                for (const slot of dayData.slots) {
                    const slotStart = timeToMinutes(slot.startTime);
                    const slotEnd = timeToMinutes(slot.endTime);

                    // Check if slot overlaps with selected range
                    if (slotStart < selectedEnd && slotEnd > selectedStart) {
                        const overlapStart = Math.max(slotStart, selectedStart);
                        const overlapEnd = Math.min(slotEnd, selectedEnd);
                        const overlapMinutes = overlapEnd - overlapStart;
                        const slotDuration = slotEnd - slotStart;

                        // Calculate proportional price for overlapping portion
                        if (slot.price && slotDuration > 0) {
                            const proportionalPrice = (slot.price * overlapMinutes) / slotDuration;
                            totalPrice += proportionalPrice;
                        }
                    }
                }

                setOriginalPrice(Math.round(totalPrice));
            }
        } catch (error: any) {
            logger.error("Error calculating price:", error);
            // If calculation fails, try to get field basePrice
            const selectedField = fields.find((f) => f.id === selectedFieldId);
            if (selectedField?.basePrice) {
                const hours = calculateHours(startTime, endTime);
                setOriginalPrice(Math.round(selectedField.basePrice * hours));
            }
        } finally {
            setLoadingPrice(false);
        }
    };

    const timeToMinutes = (time: string): number => {
        const [hours, minutes] = time.split(":").map(Number);
        return hours * 60 + minutes;
    };

    const calculateHours = (start: string, end: string): number => {
        const startMin = timeToMinutes(start);
        const endMin = timeToMinutes(end);
        return (endMin - startMin) / 60;
    };

    const handleSubmit = async () => {
        if (!selectedFieldId || !selectedCourtId || !date || !startTime || !endTime) {
            setError("Vui lòng điền đầy đủ thông tin");
            return;
        }

        if (systemFee > pendingBalance) {
            setError(`Số dư chờ xử lý không đủ. Cần: ${formatCurrency(systemFee, "VND")}, Hiện có: ${formatCurrency(pendingBalance, "VND")}`);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            await dispatch(
                createOwnerReservedBooking({
                    fieldId: selectedFieldId,
                    courtId: selectedCourtId,
                    date,
                    startTime,
                    endTime,
                    note: note || undefined,
                })
            ).unwrap();

            // Reset form
            setSelectedFieldId("");
            setSelectedCourtId("");
            setDate("");
            setStartTime("");
            setEndTime("");
            setNote("");
            setOriginalPrice(0);
            setSystemFee(0);
            setSuccess(true);

            // Refresh pending balance
            await fetchPendingBalance();

            toast.success("Khóa sân thành công! 🎉");

            // Reset success message after 3 seconds
            setTimeout(() => {
                setSuccess(false);
            }, 3000);
        } catch (error: any) {
            logger.error("Error creating owner-reserved booking:", error);
            setError(error?.message || "Không thể tạo booking. Vui lòng thử lại.");
            toast.error(error?.message || "Không thể tạo booking. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    };

    // Get today's date
    const today = new Date();

    // Get selected field data
    const selectedField = fields.find(f => f.id === selectedFieldId);

    // Handle field selection
    const handleFieldSelect = (fieldId: string) => {
        setSelectedFieldId(fieldId);
        setSelectedCourtId("");
        setDate("");
        setStartTime("");
        setEndTime("");
    };

    // Handle time range change from TimeSlotSelector
    const handleTimeRangeChange = (start: string, end: string) => {
        setStartTime(start);
        setEndTime(end);
    };

    // Handle date change
    const handleDateChange = (selectedDate: Date | undefined) => {
        if (!selectedDate) {
            setDate("");
            setStartTime("");
            setEndTime("");
            return;
        }
        const yyyy = selectedDate.getFullYear();
        const mm = String(selectedDate.getMonth() + 1).padStart(2, '0');
        const dd = String(selectedDate.getDate()).padStart(2, '0');
        const ymd = `${yyyy}-${mm}-${dd}`;
        setDate(ymd);
        // Reset time when date changes
        setStartTime("");
        setEndTime("");
    };

    return (
        <FieldOwnerDashboardLayout>
            <div className="w-full px-4">
                {/* Header */}
                <div className="mb-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                            <Lock className="w-6 h-6 text-amber-600" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Khóa sân nhanh</h1>
                            <p className="text-gray-600 mt-1">
                                Tự đặt chỗ trên sân của bạn. Phí hệ thống sẽ được trừ từ số dư chờ xử lý.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Pending Balance Info */}
                <Alert className="mb-6">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        Số dư chờ xử lý: <span className="font-semibold text-amber-600">{formatCurrency(pendingBalance, "VND")}</span>
                    </AlertDescription>
                </Alert>

                {/* Success Message */}
                {success && (
                    <Alert className="bg-green-50 border-green-200 mb-6">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-800">
                            Khóa sân thành công! Booking đã được tạo và phí hệ thống đã được trừ từ số dư chờ xử lý.
                        </AlertDescription>
                    </Alert>
                )}

                {/* Error Message */}
                {error && (
                    <Alert variant="destructive" className="mb-6">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {/* 2-Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
                    {/* Left Sidebar - Field List */}
                    <div className="lg:sticky lg:top-4 lg:self-start">
                        <OwnerFieldListSidebar
                            fields={fields}
                            selectedFieldId={selectedFieldId}
                            onSelectField={handleFieldSelect}
                            loading={false}
                        />
                    </div>

                    {/* Right Content - Booking Form */}
                    <div>
                        {!selectedFieldId ? (
                            <Card>
                                <CardContent className="p-12 text-center">
                                    <Lock className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                        Chọn sân để bắt đầu
                                    </h3>
                                    <p className="text-gray-600">
                                        Vui lòng chọn một sân từ danh sách bên trái để tiếp tục.
                                    </p>
                                </CardContent>
                            </Card>
                        ) : (
                            <Card className="shadow-lg">
                                <CardHeader className="border-b">
                                    <CardTitle className="text-2xl">{selectedField?.name}</CardTitle>
                                    <p className="text-sm text-gray-600 mt-1">
                                        {typeof selectedField?.location === 'string'
                                            ? selectedField.location
                                            : (selectedField?.location as any)?.address || ''}
                                    </p>
                                </CardHeader>

                                <CardContent className="p-6 space-y-6">
                                    {/* Court Selection */}
                                    {loadingCourts ? (
                                        <div className="flex items-center gap-2">
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            <span className="text-sm text-gray-600">Đang tải danh sách sân con...</span>
                                        </div>
                                    ) : (
                                        <CourtRadioGroup
                                            courts={courts.map(c => {
                                                console.log('[DEBUG] Mapping court:', { _id: c._id, id: c.id, name: c.name });
                                                return {
                                                    _id: c._id,
                                                    id: c.id,
                                                    name: c.name,
                                                    courtNumber: c.courtNumber
                                                };
                                            })}
                                            selectedCourtId={selectedCourtId}
                                            onSelectCourt={(courtId) => {
                                                console.log('[DEBUG] Court selected:', courtId);
                                                console.log('[DEBUG] Current courts:', courts);
                                                setSelectedCourtId(courtId);
                                                // Reset time selection when court changes
                                                setStartTime("");
                                                setEndTime("");
                                            }}
                                            disabled={loading}
                                        />
                                    )}

                                    {/* Date Selection */}
                                    <div className="space-y-2">
                                        <DatePicker
                                            label="Chọn ngày *"
                                            value={date ? new Date(date + 'T00:00:00') : undefined}
                                            onChange={handleDateChange}
                                            disabled={(d) => !selectedCourtId || loading}
                                            fromDate={today}
                                        />
                                    </div>

                                    {/* Time Slot Selection */}
                                    {date && selectedCourtId && selectedField && (
                                        <TimeSlotSelector
                                            selectedDate={date}
                                            selectedCourtId={selectedCourtId}
                                            fieldId={selectedFieldId}
                                            operatingHours={selectedField.operatingHours}
                                            slotDuration={selectedField.slotDuration}
                                            onTimeRangeChange={handleTimeRangeChange}
                                            selectedStart={startTime}
                                            selectedEnd={endTime}
                                            disabled={loading}
                                        />
                                    )}

                                    {/* Note */}
                                    <div className="space-y-2">
                                        <Label htmlFor="note" className="text-base font-semibold">Ghi chú (tùy chọn)</Label>
                                        <Textarea
                                            id="note"
                                            placeholder="Ví dụ: Bảo trì hệ thống chiếu sáng, Giải đấu nội bộ..."
                                            value={note}
                                            onChange={(e) => setNote(e.target.value)}
                                            maxLength={200}
                                            disabled={loading}
                                            rows={4}
                                            className="resize-none"
                                        />
                                        <p className="text-xs text-gray-500">{note.length}/200 ký tự</p>
                                    </div>

                                    {/* Price Information */}
                                    {loadingPrice ? (
                                        <div className="flex items-center gap-2 p-4 bg-gray-50 rounded-lg">
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            <span className="text-sm text-gray-600">Đang tính toán phí...</span>
                                        </div>
                                    ) : originalPrice > 0 ? (
                                        <div className="bg-amber-50 p-6 rounded-lg space-y-3 border-2 border-amber-200">
                                            <h3 className="font-semibold text-lg mb-2">Thông tin phí</h3>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-gray-700">Giá gốc của slot:</span>
                                                <span className="font-semibold text-base">{formatCurrency(originalPrice, "VND")}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-gray-700">Phí hệ thống (5%):</span>
                                                <span className="font-semibold text-amber-600 text-base">{formatCurrency(systemFee, "VND")}</span>
                                            </div>
                                            <div className="pt-3 border-t border-amber-300">
                                                <div className="flex justify-between items-center">
                                                    <span className="font-medium text-base">Sẽ trừ từ số dư chờ xử lý:</span>
                                                    <span className="font-bold text-amber-600 text-lg">{formatCurrency(systemFee, "VND")}</span>
                                                </div>
                                            </div>
                                            {systemFee > pendingBalance && (
                                                <Alert variant="destructive" className="mt-3">
                                                    <AlertCircle className="h-4 w-4" />
                                                    <AlertDescription>
                                                        Số dư không đủ! Cần: {formatCurrency(systemFee, "VND")}, Hiện có: {formatCurrency(pendingBalance, "VND")}
                                                    </AlertDescription>
                                                </Alert>
                                            )}
                                        </div>
                                    ) : null}

                                    {/* Submit Button */}
                                    <div className="pt-4">
                                        <Button
                                            onClick={handleSubmit}
                                            disabled={
                                                loading ||
                                                !selectedFieldId ||
                                                !selectedCourtId ||
                                                !date ||
                                                !startTime ||
                                                !endTime ||
                                                systemFee > pendingBalance ||
                                                systemFee === 0
                                            }
                                            className="w-full bg-amber-600 hover:bg-amber-700 text-white h-12 text-base font-semibold"
                                            size="lg"
                                        >
                                            {loading ? (
                                                <>
                                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                                    Đang xử lý...
                                                </>
                                            ) : (
                                                <>
                                                    <Lock className="w-5 h-5 mr-2" />
                                                    Xác nhận khóa sân
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </FieldOwnerDashboardLayout>
    );
}
