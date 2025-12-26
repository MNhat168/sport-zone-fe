import React, { useMemo, useState, useCallback, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, CheckCircle, AlertCircle, Wallet, Upload, X, ImageIcon, Clock } from "lucide-react";
import { Loading } from "@/components/ui/loading";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAppDispatch, useAppSelector } from "@/store/hook";
import { useLocation } from "react-router-dom";
import type { Field } from "@/types/field-type";
import { clearError } from "@/features/booking/bookingSlice";
import type { BookingFormData } from "./personalInfo";
// Helper function for formatting VND
const formatVND = (value: number): string => {
    try {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
    } catch {
        return `${value.toLocaleString('vi-VN')} ₫`;
    }
};

/**
 * Props for PaymentV2 component
 */
interface PaymentV2Props {
    venue?: Field;
    bookingData?: BookingFormData;
    onPaymentComplete?: (bookingData: BookingFormData) => void;
    onBack?: () => void;
    onCountdownExpired?: () => void; // Callback khi countdown hết
    amenities?: Array<{ id: string; name: string; price: number }>;
    selectedAmenityIds?: string[];
}

/**
 * PaymentV2 component - Bank transfer with proof image upload
 */
export const PaymentV2: React.FC<PaymentV2Props> = ({
    venue: venueProp,
    bookingData,
    onPaymentComplete,
    onBack,
    onCountdownExpired,
    amenities = [],
    selectedAmenityIds = [],
}) => {
    const location = useLocation();
    const dispatch = useAppDispatch();
    const currentField = useAppSelector((state) => state.field.currentField);
    const user = useAppSelector((state) => state.auth.user);
    const venue = (venueProp || currentField || (location.state as any)?.venue) as Field | undefined;

    const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
    const [paymentError, setPaymentError] = useState<string | null>(null);
    const [bookingId, setBookingId] = useState<string | null>(null);
    const [verificationResult, setVerificationResult] = useState<{
        status: string;
        reason?: string;
        isAiVerified: boolean;
    } | null>(null);
    const [heldBookingId, setHeldBookingId] = useState<string | null>(null);
    const [countdown, setCountdown] = useState<number>(300); // 5 minutes in seconds
    const [holdError, setHoldError] = useState<string | null>(null);
    const [proofImage, setProofImage] = useState<File | null>(null);
    const [proofPreview, setProofPreview] = useState<string | null>(null);
    const [bankAccount, setBankAccount] = useState<any>(null);
    const [loadingBankAccount, setLoadingBankAccount] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Use booking data from props or fallback to sessionStorage
    const formData: BookingFormData = useMemo(() => {
        if (bookingData) {
            return {
                date: bookingData.date || '',
                startTime: bookingData.startTime || '',
                endTime: bookingData.endTime || '',
                courtId: bookingData.courtId || '',
                courtName: bookingData.courtName || '',
                name: bookingData.name || '',
                email: bookingData.email || '',
                phone: bookingData.phone || '',
                note: (bookingData as any).note || '',
            };
        }
        try {
            const raw = sessionStorage.getItem('bookingFormData');
            if (!raw) return { date: '', startTime: '', endTime: '' } as BookingFormData;
            const parsed = JSON.parse(raw);
            return {
                date: parsed?.date || '',
                startTime: parsed?.startTime || '',
                endTime: parsed?.endTime || '',
                courtId: parsed?.courtId || '',
                courtName: parsed?.courtName || '',
                name: parsed?.name || '',
                email: parsed?.email || '',
                phone: parsed?.phone || '',
                note: parsed?.note || '',
            } as BookingFormData;
        } catch {
            return { date: '', startTime: '', endTime: '' } as BookingFormData;
        }
    }, [bookingData]);

    // Calculate helper functions first
    const calculateDuration = useCallback((): number => {
        if (!formData.startTime || !formData.endTime) return 0;

        const start = new Date(`1970-01-01T${formData.startTime}:00`);
        const end = new Date(`1970-01-01T${formData.endTime}:00`);
        const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);

        return hours > 0 ? hours : 0;
    }, [formData.startTime, formData.endTime]);

    const calculateAmenitiesTotal = useCallback((): number => {
        if (!amenities || !selectedAmenityIds?.length) return 0;
        try {
            return amenities
                .filter((a) => selectedAmenityIds.includes(a.id))
                .reduce((sum, a) => sum + (Number(a.price) || 0), 0);
        } catch { return 0; }
    }, [amenities, selectedAmenityIds]);

    const calculateSystemFee = useCallback((): number => {
        if (!venue || !formData.startTime || !formData.endTime) return 0;

        const start = new Date(`1970-01-01T${formData.startTime}:00`);
        const end = new Date(`1970-01-01T${formData.endTime}:00`);
        const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);

        const base = venue.basePrice * hours;
        const extras = calculateAmenitiesTotal();
        const baseAmount = base + extras;
        const systemFeeRate = 0.05; // 5% system fee
        const systemFee = Math.round(baseAmount * systemFeeRate);
        return systemFee > 0 ? systemFee : 0;
    }, [venue, formData.startTime, formData.endTime, calculateAmenitiesTotal]);

    const calculateTotal = useCallback((): number => {
        if (!venue || !formData.startTime || !formData.endTime) return 0;

        const start = new Date(`1970-01-01T${formData.startTime}:00`);
        const end = new Date(`1970-01-01T${formData.endTime}:00`);
        const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);

        const base = venue.basePrice * hours;
        const extras = calculateAmenitiesTotal();
        const baseAmount = base + extras;
        const systemFee = calculateSystemFee();
        const total = baseAmount + systemFee;
        return total > 0 ? total : 0;
    }, [venue, formData.startTime, formData.endTime, calculateAmenitiesTotal, calculateSystemFee]);

    const isBookingDataValid = useMemo(() => {
        return Boolean(
            venue &&
            formData.date &&
            formData.startTime &&
            formData.endTime &&
            calculateDuration() > 0 &&
            calculateTotal() > 0
        );
    }, [venue, formData.date, formData.startTime, formData.endTime, calculateDuration, calculateTotal]);

    // Fetch bank account info when component mounts
    useEffect(() => {
        if (venue?.id) {
            fetchBankAccount(venue.id);
        }
    }, [venue?.id]);

    // Restore held booking from sessionStorage on mount (created in PersonalInfo step)
    useEffect(() => {
        try {
            const storedBookingId = sessionStorage.getItem('heldBookingId');
            const storedHoldTime = sessionStorage.getItem('heldBookingTime');

            console.log('[PAYMENT V2] Checking sessionStorage for held booking:', {
                storedBookingId,
                storedHoldTime
            });

            // Validate stored booking ID
            if (!storedBookingId || storedBookingId.trim() === '' || storedBookingId === 'undefined' || storedBookingId === 'null') {
                console.warn('⚠️ [PAYMENT V2] Invalid or missing heldBookingId in sessionStorage:', storedBookingId);
                setHoldError('Chưa có booking được giữ chỗ. Vui lòng quay lại bước trước.');
                return;
            }

            if (storedHoldTime) {
                const holdTime = parseInt(storedHoldTime);
                if (isNaN(holdTime)) {
                    console.error('❌ [PAYMENT V2] Invalid hold time:', storedHoldTime);
                    setHoldError('Dữ liệu booking không hợp lệ. Vui lòng quay lại bước trước.');
                    return;
                }

                const now = Date.now();
                const elapsed = Math.floor((now - holdTime) / 1000);
                const remaining = 300 - elapsed; // 5 minutes = 300 seconds

                if (remaining > 0) {
                    setHeldBookingId(storedBookingId);
                    setCountdown(remaining);
                    console.log('✅ [PAYMENT V2] Restored held booking:', {
                        bookingId: storedBookingId,
                        remainingSeconds: remaining
                    });
                } else {
                    // Booking expired, clear sessionStorage
                    console.warn('⚠️ [PAYMENT V2] Held booking expired');
                    sessionStorage.removeItem('heldBookingId');
                    sessionStorage.removeItem('heldBookingCountdown');
                    sessionStorage.removeItem('heldBookingTime');
                    setHoldError('Thời gian giữ chỗ đã hết. Vui lòng quay lại và đặt lại.');
                }
            } else {
                console.warn('⚠️ [PAYMENT V2] No hold time found in sessionStorage');
                setHoldError('Chưa có booking được giữ chỗ. Vui lòng quay lại bước trước.');
            }
        } catch (error) {
            console.error('❌ [PAYMENT V2] Error restoring held booking:', error);
            setHoldError('Lỗi khi khôi phục thông tin booking. Vui lòng quay lại bước trước.');
        }
    }, []);

    // Booking hold is now created in PersonalInfo step, so we skip this useEffect
    // PaymentV2 only reads the existing hold from sessionStorage (see useEffect above)

    // Handle countdown expired - release slot and reset to step 1
    const handleCountdownExpired = useCallback(async () => {
        if (!heldBookingId) return;

        try {
            // Call public API to cancel booking hold (no auth required)
            const headers: HeadersInit = {
                'Content-Type': 'application/json',
            };

            const response = await fetch(`${import.meta.env.VITE_API_URL} /bookings/${heldBookingId}/cancel-hold`, {
                method: 'PATCH',
                headers,
                body: JSON.stringify({
                    cancellationReason: 'Thời gian giữ chỗ đã hết (5 phút)'
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Có lỗi xảy ra' }));
                console.error('[PaymentV2] Error cancelling booking on countdown expiry:', errorData);
            } else {
                console.log('[PaymentV2] ✅ Booking hold cancelled successfully');
            }
        } catch (error) {
            // Log error but continue with cleanup
            console.error('[PaymentV2] Error cancelling booking on countdown expiry:', error);
        }

        // Clear all sessionStorage (always run, even if API call fails)
        clearBookingLocal();
        sessionStorage.removeItem('heldBookingId');
        sessionStorage.removeItem('heldBookingCountdown');
        sessionStorage.removeItem('heldBookingTime');

        // Reset state
        setHeldBookingId(null);
        setCountdown(0);
        setHoldError('Thời gian giữ chỗ đã hết. Vui lòng quay lại và đặt lại.');

        // Callback to parent to reset to step 1
        onCountdownExpired?.();
    }, [heldBookingId, onCountdownExpired]);

    // Countdown timer effect
    useEffect(() => {
        if (!heldBookingId || countdown <= 0) return;

        const timer = setInterval(() => {
            setCountdown((prev) => {
                const newCountdown = prev - 1;
                if (newCountdown <= 0) {
                    clearInterval(timer);
                    // Booking expired - release slot and reset
                    handleCountdownExpired();
                    return 0;
                }
                // Update sessionStorage
                sessionStorage.setItem('heldBookingCountdown', newCountdown.toString());
                return newCountdown;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [heldBookingId, countdown, handleCountdownExpired]);

    const fetchBankAccount = async (fieldId: string) => {
        setLoadingBankAccount(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/fields/${fieldId}/bank-account`);
            if (response.ok) {
                const result = await response.json();
                // API returns { success: true, data: {...} } format
                const bankAccountData = result?.data || result;
                setBankAccount(bankAccountData);
            } else {
                console.error('Failed to fetch bank account:', response.status, response.statusText);
                setBankAccount(null);
            }
        } catch (error) {
            console.error('Error fetching bank account:', error);
            setBankAccount(null);
        } finally {
            setLoadingBankAccount(false);
        }
    };

    // Helper functions
    const formatDate = (dateString: string): string => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const formatTime = (timeString: string): string => {
        if (!timeString) return '';
        const [hours, minutes] = timeString.split(':');
        const date = new Date();
        date.setHours(parseInt(hours), parseInt(minutes));
        return date.toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
    };

    // Handle file selection
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            setPaymentError('Chỉ chấp nhận file ảnh (JPG, PNG, WEBP)');
            return;
        }

        // Validate file size (max 5MB)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            setPaymentError('File không được vượt quá 5MB');
            return;
        }

        setProofImage(file);
        setPaymentError(null);

        // Create preview
        const preview = URL.createObjectURL(file);
        setProofPreview(preview);
    };

    const handleRemoveImage = () => {
        if (proofPreview) {
            URL.revokeObjectURL(proofPreview);
        }
        setProofImage(null);
        setProofPreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // Clear persisted booking-related local storage
    const clearBookingLocal = () => {
        try {
            sessionStorage.removeItem('bookingFormData');
            sessionStorage.removeItem('selectedFieldId');
            sessionStorage.removeItem('amenitiesNote');
            sessionStorage.removeItem('heldBookingId');
            sessionStorage.removeItem('heldBookingCountdown');
            sessionStorage.removeItem('heldBookingTime');
        } catch {
            // ignore storage errors
        }
    };

    // Format countdown timer (MM:SS)
    const formatCountdown = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Handle payment submission (submit proof for held booking)
    const handlePayment = async () => {
        if (!proofImage) {
            setPaymentError('Vui lòng upload ảnh chứng minh thanh toán');
            return;
        }

        // Booking should already be held from PersonalInfo step
        if (!heldBookingId) {
            setPaymentError('Chưa có booking được giữ chỗ. Vui lòng quay lại bước trước.');
            return;
        }

        // Additional validation: ensure heldBookingId is a valid string
        if (typeof heldBookingId !== 'string' || heldBookingId.trim() === '' || heldBookingId === 'undefined') {
            console.error('[PaymentV2] Invalid heldBookingId:', heldBookingId);
            setPaymentError('ID booking không hợp lệ. Vui lòng quay lại bước trước.');
            return;
        }

        // Countdown chỉ là thông báo, không block submit
        // User có thể submit payment proof ngay khi có heldBookingId
        if (countdown <= 0) {
            // Chỉ warning, không block - vẫn cho phép submit
            console.warn('Countdown đã hết, nhưng vẫn cho phép submit payment proof');
        }

        setPaymentStatus('processing');
        setPaymentError(null);
        dispatch(clearError());

        try {
            console.log('[PaymentV2] Submitting payment proof for booking:', heldBookingId);

            // Create FormData with payment proof
            const formDataToSend = new FormData();
            formDataToSend.append('paymentProof', proofImage);

            // Optional auth token
            const token = sessionStorage.getItem('token');
            const headers: HeadersInit = {};
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            // Submit payment proof for existing booking
            const url = `${import.meta.env.VITE_API_URL}/bookings/${heldBookingId}/submit-payment-proof`;
            console.log('[PaymentV2] Submitting to URL:', url);

            const response = await fetch(url, {
                method: 'POST',
                headers,
                body: formDataToSend,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Có lỗi xảy ra' }));
                console.error('[PaymentV2] Server error:', errorData);
                throw new Error(errorData.message || 'Không thể gửi ảnh chứng minh. Vui lòng thử lại.');
            }

            const responseData = await response.json();
            // API wraps response in {success: true, data: booking} format
            const booking = responseData.data || responseData;
            console.log('[PaymentV2] Payment proof submitted successfully:', booking);
            setBookingId(booking._id || booking.id);

            // Check for AI verification result
            const isConfirmed = booking.status === 'confirmed';
            const transaction = booking.transaction;
            const isRejected = transaction?.paymentProofStatus === 'rejected';

            if (isConfirmed) {
                setVerificationResult({
                    status: 'confirmed',
                    isAiVerified: true
                });
            } else if (isRejected) {
                setVerificationResult({
                    status: 'rejected',
                    reason: transaction?.paymentProofRejectionReason,
                    isAiVerified: true
                });
            } else {
                setVerificationResult({
                    status: 'pending',
                    isAiVerified: false
                });
            }

            setPaymentStatus('success');

            // Clear sessionStorage
            clearBookingLocal();
            sessionStorage.removeItem('heldBookingId');
            sessionStorage.removeItem('heldBookingCountdown');
            sessionStorage.removeItem('heldBookingTime');

            // Clean up preview URL
            if (proofPreview) {
                URL.revokeObjectURL(proofPreview);
            }

            setTimeout(() => {
                onPaymentComplete?.(formData);
            }, 2000);
        } catch (error: any) {
            console.error('[PaymentV2] Error submitting payment proof:', error);
            const errorMessage = error?.message || 'Không thể gửi ảnh chứng minh. Vui lòng thử lại.';
            setPaymentError(errorMessage);
            setPaymentStatus('error');
        }
    };

    // Retry booking hold
    const handleRetryHold = () => {
        setHoldError(null);
        setHeldBookingId(null);
        // The useEffect will trigger again to create new hold
    };

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

    return (
        <div className="w-full max-w-[1320px] mx-auto px-3 flex flex-col gap-10">
            {/* Header Card */}
            <Card className="border border-gray-200">
                <CardContent className="">
                    <div className="">
                        <h1 className="text-2xl font-semibold text-center text-[#1a1a1a] mb-1">
                            Thanh toán & Xác nhận
                        </h1>
                        <p className="text-base font-normal text-center text-[#6b7280]">
                            Chuyển khoản vào tài khoản chủ sân và upload ảnh chứng minh.
                        </p>
                    </div>
                    {!isBookingDataValid && (
                        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 mt-4">
                            Thiếu hoặc dữ liệu đặt sân không hợp lệ. Vui lòng quay lại và hoàn thành thông tin.
                        </div>
                    )}
                    {/* Booking Hold Status - removed since hold happens in PersonalInfo step */}
                    {heldBookingId && countdown > 0 && (
                        <div className={`p-4 border rounded-lg mt-4 flex items-center justify-between ${countdown < 120
                            ? 'bg-red-50 border-red-200 text-red-800'
                            : 'bg-green-50 border-green-200 text-green-800'
                            }`}>
                            <div className="flex items-center gap-2">
                                <CheckCircle className="w-5 h-5" />
                                <span>Chỗ đã được giữ. Vui lòng upload ảnh chứng minh trong thời gian còn lại.</span>
                            </div>
                            <div className={`font-bold text-lg ${countdown < 120 ? 'text-red-600' : 'text-green-600'
                                }`}>
                                {formatCountdown(countdown)}
                            </div>
                        </div>
                    )}
                    {holdError && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 mt-4 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <AlertCircle className="w-5 h-5" />
                                <span>{holdError}</span>
                            </div>
                            <Button variant="outline" size="sm" onClick={handleRetryHold}>
                                Thử lại
                            </Button>
                        </div>
                    )}
                    {countdown <= 0 && heldBookingId && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 mt-4">
                            <AlertCircle className="w-5 h-5 inline mr-2" />
                            Thời gian giữ chỗ đã hết. Vui lòng quay lại và đặt lại.
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Main Content */}
            <div className="flex flex-wrap gap-6">
                {/* Payment Section */}
                <div className="flex-1 min-w-[600px]">
                    {paymentStatus === 'success' ? (
                        <Card className={`border ${verificationResult?.status === 'confirmed'
                            ? 'border-emerald-200 bg-emerald-50'
                            : verificationResult?.status === 'rejected'
                                ? 'border-red-200 bg-red-50'
                                : 'border-amber-200 bg-amber-50'
                            }`}>
                            <CardContent className="p-8 text-center space-y-4">
                                {verificationResult?.status === 'confirmed' ? (
                                    <CheckCircle className="w-16 h-16 text-emerald-600 mx-auto" />
                                ) : verificationResult?.status === 'rejected' ? (
                                    <AlertCircle className="w-16 h-16 text-red-600 mx-auto" />
                                ) : (
                                    <Clock className="w-16 h-16 text-amber-600 mx-auto" />
                                )}
                                <div>
                                    <h2 className={`text-2xl font-semibold ${verificationResult?.status === 'confirmed'
                                        ? 'text-emerald-800'
                                        : verificationResult?.status === 'rejected'
                                            ? 'text-red-800'
                                            : 'text-amber-800'
                                        }`}>
                                        {verificationResult?.status === 'confirmed'
                                            ? 'Thanh toán thành công!'
                                            : verificationResult?.status === 'rejected'
                                                ? 'Thanh toán bị từ chối'
                                                : 'Đã gửi yêu cầu đặt sân'}
                                    </h2>
                                    <p className={
                                        verificationResult?.status === 'confirmed'
                                            ? 'text-emerald-700'
                                            : verificationResult?.status === 'rejected'
                                                ? 'text-red-700'
                                                : 'text-amber-700'
                                    }>
                                        {verificationResult?.status === 'confirmed'
                                            ? 'Hệ thống AI đã xác nhận thanh toán của bạn thành công. Sân của bạn đã được đặt.'
                                            : verificationResult?.status === 'rejected'
                                                ? `AI không thể xác nhận thanh toán: ${verificationResult.reason || 'Vui lòng kiểm tra lại ảnh biên lai.'}`
                                                : 'Đơn đặt đang chờ chủ sân xác minh thanh toán thủ công. Email xác nhận sẽ được gửi khi chủ sân duyệt.'}
                                    </p>
                                </div>

                                {verificationResult?.status !== 'confirmed' && (
                                    <div className={`p-4 rounded-lg border text-sm ${verificationResult?.status === 'rejected'
                                        ? 'bg-red-100 border-red-200 text-red-800'
                                        : 'bg-amber-100 border-amber-200 text-amber-800'
                                        }`}>
                                        {verificationResult?.status === 'rejected' ? (
                                            <>
                                                <p className="font-semibold">Lý do từ chối:</p>
                                                <p>{verificationResult.reason}</p>
                                            </>
                                        ) : (
                                            <p>Bạn đã gửi ảnh chứng minh. Nếu bạn nhận ra mình đã gửi nhầm ảnh, bạn có thể thay thế bằng ảnh khác.</p>
                                        )}
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className={`mt-2 ${verificationResult?.status === 'rejected'
                                                ? 'border-red-300 text-red-800 hover:bg-red-200'
                                                : 'border-amber-300 text-amber-800 hover:bg-amber-200'
                                                }`}
                                            onClick={() => setPaymentStatus('idle')}
                                        >
                                            Thay thế bằng ảnh khác
                                        </Button>
                                    </div>
                                )}

                                <Badge variant="secondary" className={
                                    verificationResult?.status === 'confirmed'
                                        ? 'bg-emerald-100 text-emerald-800'
                                        : verificationResult?.status === 'rejected'
                                            ? 'bg-red-100 text-red-800'
                                            : 'bg-amber-100 text-amber-800'
                                }>
                                    Mã đặt sân: #{bookingId || 'N/A'}
                                </Badge>

                                <div className={`grid md:grid-cols-3 gap-3 text-sm border rounded-lg p-4 ${verificationResult?.status === 'confirmed'
                                    ? 'text-emerald-900 bg-white/60 border-emerald-100'
                                    : verificationResult?.status === 'rejected'
                                        ? 'text-red-900 bg-white/60 border-red-100'
                                        : 'text-amber-900 bg-white/60 border-amber-100'
                                    }`}>
                                    <div className="text-left md:text-center">
                                        <p className="font-semibold">Họ tên</p>
                                        <p className={
                                            verificationResult?.status === 'confirmed'
                                                ? 'text-emerald-700'
                                                : verificationResult?.status === 'rejected'
                                                    ? 'text-red-700'
                                                    : 'text-amber-700'
                                        }>{formData.name || user?.fullName || 'Khách'}</p>
                                    </div>
                                    <div className="text-left md:text-center">
                                        <p className="font-semibold">Email nhận thông báo</p>
                                        <p className={
                                            verificationResult?.status === 'confirmed'
                                                ? 'text-emerald-700'
                                                : verificationResult?.status === 'rejected'
                                                    ? 'text-red-700'
                                                    : 'text-amber-700'
                                        }>{formData.email || (user as any)?.email || '—'}</p>
                                    </div>
                                    <div className="text-left md:text-center">
                                        <p className="font-semibold">Số điện thoại</p>
                                        <p className={
                                            verificationResult?.status === 'confirmed'
                                                ? 'text-emerald-700'
                                                : verificationResult?.status === 'rejected'
                                                    ? 'text-red-700'
                                                    : 'text-amber-700'
                                        }>{formData.phone || (user as any)?.phone || '—'}</p>
                                    </div>
                                </div>

                                <p className={`text-xs ${verificationResult?.status === 'confirmed'
                                    ? 'text-emerald-700'
                                    : verificationResult?.status === 'rejected'
                                        ? 'text-red-700'
                                        : 'text-amber-700'
                                    }`}>
                                    Lưu ý: Email được gửi ngay sau khi đặt, qua hàng đợi nền; nếu không thấy, hãy kiểm tra hộp thư spam.
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card className="border border-gray-200">
                            <CardHeader className="border-b border-gray-200">
                                <CardTitle className="text-2xl font-semibold flex items-center gap-2">
                                    <Wallet className="w-6 h-6" />
                                    Thông tin chuyển khoản
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-6">
                                {/* Bank Account Info */}
                                {loadingBankAccount ? (
                                    <div className="flex items-center justify-center p-8">
                                        <Loading size={24} className="text-gray-400" />
                                        <span className="ml-2 text-gray-600">Đang tải thông tin tài khoản...</span>
                                    </div>
                                ) : bankAccount ? (
                                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-3">
                                        <h3 className="font-semibold text-blue-900">Thông tin tài khoản ngân hàng chủ sân:</h3>
                                        <div className="space-y-2 text-sm">
                                            <div><span className="font-medium">Chủ tài khoản:</span> {bankAccount.accountName}</div>
                                            <div><span className="font-medium">Số tài khoản:</span> {bankAccount.accountNumber}</div>
                                            <div><span className="font-medium">Ngân hàng:</span> {bankAccount.bankName}</div>
                                            {bankAccount.branch && (
                                                <div><span className="font-medium">Chi nhánh:</span> {bankAccount.branch}</div>
                                            )}
                                        </div>
                                        <div className="pt-2 border-t border-blue-300">
                                            <div className="text-lg font-bold text-blue-900">
                                                Số tiền cần chuyển: {formatVND(calculateTotal())}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                        <AlertCircle className="w-5 h-5 text-yellow-700 inline mr-2" />
                                        <span className="text-yellow-800">Không thể tải thông tin tài khoản ngân hàng. Vui lòng thử lại sau.</span>
                                    </div>
                                )}

                                {/* Payment Proof Upload */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">
                                        Ảnh chứng minh thanh toán <span className="text-red-500">*</span>
                                    </label>
                                    {proofPreview ? (
                                        <div className="relative border-2 border-gray-200 rounded-lg p-4">
                                            <img
                                                src={proofPreview}
                                                alt="Payment proof preview"
                                                className="w-full h-auto max-h-96 object-contain rounded"
                                            />
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                className="absolute top-2 right-2"
                                                onClick={handleRemoveImage}
                                            >
                                                <X className="w-4 h-4 mr-1" />
                                                Xóa
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center space-y-4 hover:border-primary transition-colors">
                                            <div className="flex flex-col items-center space-y-2">
                                                <Upload className="w-10 h-10 text-gray-400" />
                                                <div className="space-y-1">
                                                    <p className="text-sm font-medium text-gray-700">Chọn ảnh chứng minh thanh toán</p>
                                                    <p className="text-xs text-gray-500">Hỗ trợ: JPG, PNG, WEBP (tối đa 5MB)</p>
                                                </div>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => fileInputRef.current?.click()}
                                            >
                                                <ImageIcon className="w-4 h-4 mr-2" />
                                                Chọn ảnh
                                            </Button>
                                        </div>
                                    )}
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/jpeg,image/jpg,image/png,image/webp"
                                        className="hidden"
                                        onChange={handleFileSelect}
                                    />
                                </div>

                                {/* Error Message */}
                                {paymentError && (
                                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
                                        <AlertCircle className="w-5 h-5 inline mr-2" />
                                        {paymentError}
                                    </div>
                                )}

                                {/* Submit Button */}
                                <Button
                                    onClick={handlePayment}
                                    disabled={
                                        !isBookingDataValid ||
                                        !proofImage ||
                                        paymentStatus === 'processing' ||
                                        !!holdError
                                    }
                                    className="w-full"
                                    size="lg"
                                >
                                    {paymentStatus === 'processing' ? (
                                        <>
                                            <Loading size={16} className="mr-2" />
                                            Đang xử lý...
                                        </>
                                    ) : !proofImage ? (
                                        <>
                                            <Upload className="w-4 h-4 mr-2" />
                                            Vui lòng upload ảnh chứng minh
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle className="w-4 h-4 mr-2" />
                                            Xác nhận thanh toán
                                        </>
                                    )}
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Order Summary */}
                <div className="w-full md:w-80">
                    <Card className="border border-gray-200 sticky top-4">
                        <CardHeader className="border-b border-gray-200">
                            <CardTitle className="text-lg font-semibold">Tóm tắt đơn đặt</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                            <div className="space-y-3">
                                <div>
                                    <p className="text-sm text-gray-600">Sân</p>
                                    <p className="font-medium">{venue.name}</p>
                                </div>
                                {formData.courtName && (
                                    <div>
                                        <p className="text-sm text-gray-600">Sân con (court)</p>
                                        <p className="font-medium">{formData.courtName}</p>
                                    </div>
                                )}
                                <div>
                                    <p className="text-sm text-gray-600">Ngày</p>
                                    <p className="font-medium">{formatDate(formData.date)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Thời gian</p>
                                    <p className="font-medium">
                                        {formatTime(formData.startTime)} - {formatTime(formData.endTime)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Thời lượng</p>
                                    <p className="font-medium">{calculateDuration()} giờ</p>
                                </div>
                            </div>

                            <div className="border-t border-gray-200 pt-4 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Giá sân ({calculateDuration()}h)</span>
                                    <span>{formatVND((venue.basePrice || 0) * calculateDuration())}</span>
                                </div>
                                {calculateAmenitiesTotal() > 0 && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Tiện ích</span>
                                        <span>{formatVND(calculateAmenitiesTotal())}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Phí dịch vụ (5%)</span>
                                    <span>{formatVND(calculateSystemFee())}</span>
                                </div>
                                <div className="flex justify-between font-semibold text-lg pt-2 border-t border-gray-200">
                                    <span>Tổng cộng</span>
                                    <span>{formatVND(calculateTotal())}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Back Button */}
            {paymentStatus !== 'success' && (
                <div className="flex justify-start">
                    <Button variant="outline" onClick={onBack}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Quay lại
                    </Button>
                </div>
            )}
        </div>
    );
};

