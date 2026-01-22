"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hook";
import { createOwnerReservedBooking } from "@/features/booking/bookingThunk";
import { getMyFields } from "@/features/field/fieldThunk";
import axiosPrivate from "@/utils/axios/axiosPrivate";
import logger from "@/utils/logger";
import { formatCurrency } from "@/utils/format-currency";
import type { Field } from "@/types/field-type";
import type { Court } from "@/types/field-type";

interface OwnerReservedBookingModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

interface CourtOption {
    _id: string;
    name: string;
    courtNumber?: number;
}

export function OwnerReservedBookingModal({ isOpen, onClose, onSuccess }: OwnerReservedBookingModalProps) {
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

    // Fetch fields on mount
    useEffect(() => {
        if (isOpen && fields.length === 0) {
            dispatch(getMyFields({}));
        }
    }, [isOpen, dispatch, fields.length]);

    // Fetch courts when field is selected
    useEffect(() => {
        if (selectedFieldId && isOpen) {
            fetchCourts();
        } else {
            setCourts([]);
            setSelectedCourtId("");
        }
    }, [selectedFieldId, isOpen]);

    // Fetch pending balance
    useEffect(() => {
        if (isOpen) {
            fetchPendingBalance();
        }
    }, [isOpen]);

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
            setCourts(courtsData);
            if (courtsData.length === 1) {
                setSelectedCourtId(courtsData[0]._id || courtsData[0].id);
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
            const wallet = response.data?.data || response.data;
            setPendingBalance(wallet?.pendingBalance || 0);
        } catch (error: any) {
            logger.error("Error fetching pending balance:", error);
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

            onSuccess?.();
            onClose();
        } catch (error: any) {
            logger.error("Error creating owner-reserved booking:", error);
            setError(error?.message || "Không thể tạo booking. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (!loading) {
            setError(null);
            onClose();
        }
    };

    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split("T")[0];

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Khóa sân nhanh</DialogTitle>
                    <DialogDescription>
                        Tự đặt chỗ trên sân của bạn. Phí hệ thống sẽ được trừ từ số dư chờ xử lý.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Pending Balance Info */}
                    <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            Số dư chờ xử lý: <span className="font-semibold text-amber-600">{formatCurrency(pendingBalance, "VND")}</span>
                        </AlertDescription>
                    </Alert>

                    {/* Field Selection */}
                    <div className="space-y-2">
                        <Label htmlFor="field">Chọn sân *</Label>
                        <Select value={selectedFieldId} onValueChange={setSelectedFieldId} disabled={loading}>
                            <SelectTrigger id="field">
                                <SelectValue placeholder="Chọn sân" />
                            </SelectTrigger>
                            <SelectContent>
                                {fields.map((field) => (
                                    <SelectItem key={field.id} value={field.id}>
                                        {field.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Court Selection */}
                    {selectedFieldId && (
                        <div className="space-y-2">
                            <Label htmlFor="court">Chọn sân con *</Label>
                            {loadingCourts ? (
                                <div className="flex items-center gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    <span className="text-sm text-muted-foreground">Đang tải...</span>
                                </div>
                            ) : (
                                <Select value={selectedCourtId} onValueChange={setSelectedCourtId} disabled={loading || courts.length === 0}>
                                    <SelectTrigger id="court">
                                        <SelectValue placeholder="Chọn sân con" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {courts.map((court) => (
                                            <SelectItem key={court._id || court.id} value={court._id || court.id}>
                                                {court.name || (court.courtNumber ? `Sân ${court.courtNumber}` : "Sân")}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        </div>
                    )}

                    {/* Date Selection */}
                    <div className="space-y-2">
                        <Label htmlFor="date">Ngày *</Label>
                        <Input
                            id="date"
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            min={today}
                            disabled={loading}
                        />
                    </div>

                    {/* Time Selection */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="startTime">Giờ bắt đầu *</Label>
                            <Input
                                id="startTime"
                                type="time"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                                disabled={loading}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="endTime">Giờ kết thúc *</Label>
                            <Input
                                id="endTime"
                                type="time"
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                                disabled={loading}
                            />
                        </div>
                    </div>

                    {/* Note */}
                    <div className="space-y-2">
                        <Label htmlFor="note">Ghi chú (tùy chọn)</Label>
                        <Textarea
                            id="note"
                            placeholder="Ví dụ: Bảo trì hệ thống chiếu sáng, Giải đấu nội bộ..."
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            maxLength={200}
                            disabled={loading}
                            rows={3}
                        />
                        <p className="text-xs text-muted-foreground">{note.length}/200 ký tự</p>
                    </div>

                    {/* Price Information */}
                    {loadingPrice ? (
                        <div className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span className="text-sm text-muted-foreground">Đang tính toán phí...</span>
                        </div>
                    ) : originalPrice > 0 ? (
                        <div className="bg-muted p-4 rounded-lg space-y-2">
                            <div className="flex justify-between">
                                <span className="text-sm">Giá gốc của slot:</span>
                                <span className="font-semibold">{formatCurrency(originalPrice, "VND")}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm">Phí hệ thống (5%):</span>
                                <span className="font-semibold text-amber-600">{formatCurrency(systemFee, "VND")}</span>
                            </div>
                            <div className="pt-2 border-t">
                                <div className="flex justify-between">
                                    <span className="font-medium">Sẽ trừ từ số dư chờ xử lý:</span>
                                    <span className="font-bold text-amber-600">{formatCurrency(systemFee, "VND")}</span>
                                </div>
                            </div>
                            {systemFee > pendingBalance && (
                                <Alert variant="destructive" className="mt-2">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>
                                        Số dư không đủ! Cần: {formatCurrency(systemFee, "VND")}, Hiện có: {formatCurrency(pendingBalance, "VND")}
                                    </AlertDescription>
                                </Alert>
                            )}
                        </div>
                    ) : date && startTime && endTime ? (
                        <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>Vui lòng chọn sân và sân con để tính phí</AlertDescription>
                        </Alert>
                    ) : null}

                    {/* Error Message */}
                    {error && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={handleClose} disabled={loading}>
                        Hủy
                    </Button>
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
                        className="bg-emerald-600 hover:bg-emerald-700"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Đang xử lý...
                            </>
                        ) : (
                            <>
                                Xác nhận khóa sân
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
