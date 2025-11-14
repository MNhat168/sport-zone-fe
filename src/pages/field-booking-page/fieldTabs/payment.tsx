import React, {useMemo, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, CreditCard, Shield, CheckCircle, Clock, AlertCircle, Loader2, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAppDispatch, useAppSelector } from "@/store/hook";
import { useLocation, useNavigate } from "react-router-dom";
import type { Field } from "@/types/field-type";
import { createFieldBooking } from "@/features/booking/bookingThunk";
import { clearError } from "@/features/booking/bookingSlice";
import type { CreateFieldBookingPayload, Booking } from "@/types/booking-type";
import { PaymentMethod } from "@/types/payment-type";
import type { Payment } from "@/types/payment-type";
import { createVNPayUrl, createPayOSPayment } from "@/features/transactions/transactionsThunk";
import type { CreatePayOSPaymentPayload, PaymentItem } from "@/types/payment-type";

/**
 * Interface for booking form data
 */
interface BookingFormData {
    date: string;
    startTime: string;
    endTime: string;
    court?: string;
    name?: string;
    email?: string;
    phone?: string;
}

/**
 * Props for PaymentTab component
 */
interface PaymentTabProps {
    /**
     * Venue information to display
     */
    venue?: Field;
    /**
     * Booking form data from previous step
     */
    bookingData?: BookingFormData;
    /**
     * Callback when payment is completed
     */
    onPaymentComplete?: (bookingData: BookingFormData) => void;
    /**
     * Callback for back button
     */
    onBack?: () => void;
    /**
     * Available courts list
     */
    courts?: Array<{ id: string; name: string }>;
    /** Optional: amenities list and selected ids for fee calculation */
    amenities?: Array<{ id: string; name: string; price: number }>;
    selectedAmenityIds?: string[];
}

/**
 * PaymentTab component - Final step to complete booking with payment
 */
export const PaymentTab: React.FC<PaymentTabProps> = ({
    venue: venueProp,
    bookingData,
    onPaymentComplete,
    onBack,
    // courts = [],
    amenities = [],
    selectedAmenityIds = [],
}) => {
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const currentField = useAppSelector((state) => state.field.currentField);
    const user = useAppSelector((state) => state.user.user);
    const bookingLoading = useAppSelector((state) => state.booking.loading);
    const bookingError = useAppSelector((state) => state.booking.error);
    const venue = (venueProp || currentField || (location.state as any)?.venue) as Field | undefined;
    
    const [paymentMethod, setPaymentMethod] = useState<'vnpay' | 'payos' | 'credit_card' | 'bank_transfer' | 'cash'>('vnpay');
    const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
    const [paymentError, setPaymentError] = useState<string | null>(null);
    const [bookingId, setBookingId] = useState<string | null>(null);
    const [hasNote, setHasNote] = useState<boolean>(false);

    // Use booking data from props or fallback to localStorage
    const formData: BookingFormData = useMemo(() => {
        if (bookingData) {
            return {
                date: bookingData.date || '',
                startTime: bookingData.startTime || '',
                endTime: bookingData.endTime || '',
                court: bookingData.court || '',
                name: bookingData.name || '',
                email: bookingData.email || '',
                phone: bookingData.phone || '',
            };
        }
        try {
            const raw = localStorage.getItem('bookingFormData');
            if (!raw) return { date: '', startTime: '', endTime: '' } as BookingFormData;
            const parsed = JSON.parse(raw);
            return {
                date: parsed?.date || '',
                startTime: parsed?.startTime || '',
                endTime: parsed?.endTime || '',
                court: parsed?.court || '',
                name: parsed?.name || '',
                email: parsed?.email || '',
                phone: parsed?.phone || '',
            } as BookingFormData;
        } catch {
            return { date: '', startTime: '', endTime: '' } as BookingFormData;
        }
    }, [bookingData]);

    // Detect if user added a note in the amenities step
    React.useEffect(() => {
        try {
            const note = localStorage.getItem('amenitiesNote');
            setHasNote(Boolean(note && note.trim().length > 0));
        } catch {
            setHasNote(false);
        }
    }, []);

    // Helper functions for formatting
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

    const formatVND = (value: number): string => {
        try {
            return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
        } catch {
            return `${value.toLocaleString('vi-VN')} ₫`;
        }
    };

    // Helper to create short description for PayOS (max 25 characters)
    // PayOS API requirement: description must be max 25 characters
    const createPayOSDescription = (venueName?: string, date?: string, startTime?: string, endTime?: string): string => {
        const maxLength = 25;
        const baseText = 'Dat san'; // 8 characters
        
        // Try to include essential info: "Dat san" + date + time
        if (date && startTime && endTime) {
            try {
                // Format date as DD/MM (5 characters: "15/11")
                const dateObj = new Date(date);
                if (!isNaN(dateObj.getTime())) {
                    const day = dateObj.getDate().toString().padStart(2, '0');
                    const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
                    const shortDate = `${day}/${month}`;
                    
                    // Format time as HH-HH (e.g., "14-16", 5 characters)
                    const startHour = startTime.split(':')[0];
                    const endHour = endTime.split(':')[0];
                    const shortTime = `${startHour}-${endHour}`;
                    
                    // Build description: "Dat san DD/MM HH-HH" (8 + 1 + 5 + 1 + 5 = 20 characters)
                    let desc = `${baseText} ${shortDate} ${shortTime}`;
                    
                    // Ensure it doesn't exceed maxLength
                    if (desc.length <= maxLength) {
                        return desc;
                    }
                    
                    // If too long, try without date: "Dat san HH-HH" (8 + 1 + 5 = 14 characters)
                    desc = `${baseText} ${shortTime}`;
                    if (desc.length <= maxLength) {
                        return desc;
                    }
                }
            } catch (error) {
                console.warn('[PayOS] Error formatting description:', error);
            }
        }
        
        // Fallback: try with venue name if available
        if (venueName && venueName.trim()) {
            const availableLength = maxLength - baseText.length - 1; // -1 for space
            const shortVenueName = venueName.substring(0, availableLength);
            const desc = `${baseText} ${shortVenueName}`;
            return desc.substring(0, maxLength);
        }
        
        // Final fallback: just "Dat san"
        return baseText;
    };

    const calculateAmenitiesTotal = useCallback((): number => {
        if (!amenities || !selectedAmenityIds?.length) return 0;
        try {
            return amenities
                .filter((a) => selectedAmenityIds.includes(a.id))
                .reduce((sum, a) => sum + (Number(a.price) || 0), 0);
        } catch { return 0; }
    }, [amenities, selectedAmenityIds]);

    const calculateTotal = useCallback((): number => {
        if (!venue || !formData.startTime || !formData.endTime) return 0;
        
        const start = new Date(`1970-01-01T${formData.startTime}:00`);
        const end = new Date(`1970-01-01T${formData.endTime}:00`);
        const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
        
        const base = venue.basePrice * hours;
        const extras = calculateAmenitiesTotal();
        const total = base + extras;
        return total > 0 ? total : 0;
    }, [venue, formData.startTime, formData.endTime, calculateAmenitiesTotal]);

    const calculateDuration = useCallback((): number => {
        if (!formData.startTime || !formData.endTime) return 0;
        
        const start = new Date(`1970-01-01T${formData.startTime}:00`);
        const end = new Date(`1970-01-01T${formData.endTime}:00`);
        const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
        
        return hours > 0 ? hours : 0;
    }, [formData.startTime, formData.endTime]);

    const isBookingDataValid = useMemo(() => {
        return Boolean(
            venue &&
            formData.date &&
            formData.startTime &&
            formData.endTime &&
            // formData.court &&
            calculateDuration() > 0 &&
            calculateTotal() > 0
        );
    }, [venue, formData.date, formData.startTime, formData.endTime, calculateDuration, calculateTotal]);

    // Clear persisted booking-related local storage
    const clearBookingLocal = () => {
        try {
            localStorage.removeItem('bookingFormData');
            localStorage.removeItem('selectedFieldId');
            localStorage.removeItem('amenitiesNote');
        } catch {
            // ignore storage errors
        }
    };

    // Helper to map UI payment method to API enum
    const getPaymentMethodEnum = (): number => {
        switch (paymentMethod) {
            case 'vnpay':
                return PaymentMethod.VNPAY;
            case 'payos':
                return PaymentMethod.PAYOS;
            case 'credit_card':
                return PaymentMethod.CREDIT_CARD;
            case 'bank_transfer':
                return PaymentMethod.BANK_TRANSFER;
            case 'cash':
                return PaymentMethod.CASH;
            default:
                return PaymentMethod.CASH;
        }
    };

    // Core booking creation used by both flows
    const createBookingCore = async (): Promise<Booking | null> => {
        if (!venue || !user) {
            setPaymentError('Missing venue or user information');
            return null;
        }
        if (!isBookingDataValid) {
            setPaymentError('Missing or invalid booking data');
            return null;
        }
        try {
            const bookingPayload: CreateFieldBookingPayload = {
                fieldId: (venue as any)?.id || (venue as any)?._id || '',
                date: formData.date,
                startTime: formData.startTime,
                endTime: formData.endTime,
                selectedAmenities: selectedAmenityIds,
                paymentMethod: getPaymentMethodEnum(),
                paymentNote: paymentMethod === 'vnpay' ? 'VNPay online payment' : paymentMethod === 'payos' ? 'PayOS online payment' : undefined,
            };
            const result = await dispatch(createFieldBooking(bookingPayload));
            if (result.meta.requestStatus === 'fulfilled') {
                const payload: any = result.payload;
                const booking: Booking = (payload?.success && payload?.data) ? payload.data : payload;
                setBookingId((booking as any)?._id);
                return booking;
            } else {
                const error = result.payload as any;
                throw new Error(error?.message || 'Failed to create booking');
            }
        } catch (error: any) {
            console.error('Payment/Booking error:', error);
            setPaymentError(
                bookingError?.message || error.message || 'Payment failed. Please try again.'
            );
            return null;
        }
    };

    // Handle PayOS payment flow
    const handlePayOSPayment = async () => {
        setPaymentStatus('processing');
        setPaymentError(null);
        dispatch(clearError());
        
        // Step 1: Create booking with PayOS payment method
        const created = await createBookingCore();
        if (!created) { 
            setPaymentStatus('error'); 
            return; 
        }

        // Step 2: Derive paymentId and amount robustly
        const paymentObj = typeof created?.payment === 'object' ? created.payment as Payment : null;
        const paymentIdRaw = typeof created?.payment === 'string'
            ? created.payment
            : (paymentObj?._id || (created as any)?._id);

        // Compute amount fallbacks
        const durationHours = (() => {
            try {
                const start = new Date(`1970-01-01T${(created as any)?.startTime}:00`);
                const end = new Date(`1970-01-01T${(created as any)?.endTime}:00`);
                return (end.getTime() - start.getTime()) / (1000 * 60 * 60);
            } catch { return 0; }
        })();

        const beTotal = Number((created as any)?.totalPrice);
        const feTotal = calculateTotal();
        const snapshotBase = Number(created?.pricingSnapshot?.basePrice) || 0;
        const snapshotCalc = snapshotBase > 0 && durationHours > 0 ? Math.round(snapshotBase * durationHours) : 0;
        const amount = Math.round(
            Number.isFinite(beTotal) && beTotal > 0 ? beTotal :
            (feTotal > 0 ? feTotal : snapshotCalc)
        );

        const paymentId = paymentIdRaw ? String(paymentIdRaw) : '';

        console.log('[PayOS] Creating payment link for:', {
            paymentId,
            bookingId: (created as any)?._id,
            beTotal,
            feTotal,
            snapshotBase,
            durationHours,
            amount
        });

        // Step 3: Call backend API to create PayOS payment link
        if (!paymentId || !Number.isFinite(amount) || amount <= 0) {
            setPaymentError('Thiếu thông tin thanh toán (paymentId hoặc amount)');
            setPaymentStatus('error');
            return;
        }

        try {
            // Validate amount according to guide (min: 1000)
            if (amount < 1000) {
                setPaymentError('Số tiền thanh toán phải tối thiểu 1,000 VND');
                setPaymentStatus('error');
                return;
            }

            // Prepare items array according to guide
            const items: PaymentItem[] = [
                {
                    name: `Đặt sân ${venue?.name || 'sân bóng đá'}`,
                    quantity: 1,
                    price: amount,
                },
            ];

            // Validate amount = sum of items (according to guide)
            const calculatedAmount = items.reduce(
                (sum, item) => sum + (item.quantity * item.price), 
                0
            );

            if (calculatedAmount !== amount) {
                console.error('[PayOS] Amount mismatch:', { amount, calculatedAmount });
                setPaymentError('Lỗi tính toán số tiền. Vui lòng thử lại.');
                setPaymentStatus('error');
                return;
            }

            // Validate required fields according to guide
            if (!paymentId || !paymentId.trim()) {
                setPaymentError('Thiếu mã đơn hàng. Vui lòng thử lại.');
                setPaymentStatus('error');
                return;
            }

            // Create short description for PayOS (max 25 characters as per PayOS requirement)
            const description = createPayOSDescription(
                venue?.name,
                formData.date,
                formData.startTime,
                formData.endTime
            );
            
            if (!description.trim()) {
                setPaymentError('Thiếu mô tả thanh toán. Vui lòng thử lại.');
                setPaymentStatus('error');
                return;
            }
            
            // Validate description length (PayOS requirement: max 25 characters)
            // Note: createPayOSDescription already ensures max 25 chars, but double-check for safety
            if (description.length > 25) {
                console.error('[PayOS] ❌ Description exceeds 25 characters despite helper function:', description);
                setPaymentError('Mô tả thanh toán quá dài. Vui lòng thử lại.');
                setPaymentStatus('error');
                return;
            }
            
            console.log('[PayOS] Description created:', { description, length: description.length });

            // Validate items array
            if (!items || items.length === 0) {
                setPaymentError('Thiếu thông tin sản phẩm. Vui lòng thử lại.');
                setPaymentStatus('error');
                return;
            }

            // Validate each item has required fields
            for (const item of items) {
                if (!item.name || !item.name.trim()) {
                    setPaymentError('Tên sản phẩm không được để trống.');
                    setPaymentStatus('error');
                    return;
                }
                if (!Number.isInteger(item.quantity) || item.quantity < 1) {
                    setPaymentError('Số lượng sản phẩm không hợp lệ.');
                    setPaymentStatus('error');
                    return;
                }
                if (!Number.isFinite(item.price) || item.price < 1000) {
                    setPaymentError('Giá sản phẩm phải tối thiểu 1,000 VND.');
                    setPaymentStatus('error');
                    return;
                }
            }

            const payOSPayload: CreatePayOSPaymentPayload = {
                orderId: paymentId, // string (required)
                amount: amount, // number >= 1000 (required)
                description: description, // string (required)
                items: items, // array with at least 1 item (required)
                buyerName: formData.name || user?.fullName || undefined, // optional
                buyerEmail: formData.email || user?.email || undefined, // optional
                buyerPhone: formData.phone || user?.phone || undefined, // optional
                returnUrl: `${window.location.origin}/transactions/payos/return`, // optional
                cancelUrl: `${window.location.origin}/transactions/payos/cancel`, // optional
                expiredAt: 15, // optional (5-60 minutes)
            };

            console.log('[PayOS] Calling createPayOSPayment API with:', payOSPayload);
            console.log('[PayOS] Validation passed:', {
                orderId: !!payOSPayload.orderId,
                amount: payOSPayload.amount >= 1000,
                description: !!payOSPayload.description,
                itemsCount: payOSPayload.items.length,
                amountMatch: calculatedAmount === amount,
            });
            
            const result = await dispatch(createPayOSPayment(payOSPayload)).unwrap();

            console.log('[PayOS] API Response:', result);

            // Extract checkout URL from response
            let checkoutUrl: string | null = null;
            
            if ((result as any)?.checkoutUrl) {
                checkoutUrl = (result as any).checkoutUrl;
            } else if ((result as any)?.data?.checkoutUrl) {
                checkoutUrl = (result as any).data.checkoutUrl;
            }

            if (!checkoutUrl) {
                console.error('[PayOS] ❌ Cannot extract checkoutUrl from response');
                console.error('[PayOS] Full response:', JSON.stringify(result, null, 2));
                throw new Error(`Backend did not return checkoutUrl. Response: ${JSON.stringify(result)}`);
            }

            // Store booking ID for return page
            try { 
                localStorage.setItem('payosBookingId', (created as any)?._id); 
                if ((result as any)?.orderCode) {
                    localStorage.setItem('payosOrderCode', String((result as any).orderCode));
                }
            } catch { /* ignore */ }

            console.log('[PayOS] ✅ Checkout URL extracted:', checkoutUrl);
            console.log('[PayOS] Redirecting to PayOS checkout');
            
            // Redirect to PayOS checkout page
            window.location.href = checkoutUrl;
            return;
        } catch (error: any) {
            console.error('[PayOS] Error creating payment link:', error);
            const errorMessage = error?.payload?.message || 
                               error?.message || 
                               error?.response?.data?.message ||
                               'Không thể tạo liên kết thanh toán PayOS. Vui lòng thử lại.';
            setPaymentError(errorMessage);
            setPaymentStatus('error');
        }
    };

    // Handle VNPay payment flow
    const handleVNPayPayment = async () => {
        setPaymentStatus('processing');
        setPaymentError(null);
        dispatch(clearError());
        
        // Step 1: Create booking with VNPay payment method
        const created = await createBookingCore();
        if (!created) { 
            setPaymentStatus('error'); 
            return; 
        }

        // Step 2: Derive paymentId and amount robustly
        const paymentObj = typeof created?.payment === 'object' ? created.payment as Payment : null;
        const paymentIdRaw = typeof created?.payment === 'string'
            ? created.payment
            : (paymentObj?._id || (created as any)?._id);

        // Compute amount fallbacks
        const durationHours = (() => {
            try {
                const start = new Date(`1970-01-01T${(created as any)?.startTime}:00`);
                const end = new Date(`1970-01-01T${(created as any)?.endTime}:00`);
                return (end.getTime() - start.getTime()) / (1000 * 60 * 60);
            } catch { return 0; }
        })();

        const beTotal = Number((created as any)?.totalPrice);
        const feTotal = calculateTotal();
        const snapshotBase = Number(created?.pricingSnapshot?.basePrice) || 0;
        const snapshotCalc = snapshotBase > 0 && durationHours > 0 ? Math.round(snapshotBase * durationHours) : 0;
        const amount = Math.round(
            Number.isFinite(beTotal) && beTotal > 0 ? beTotal :
            (feTotal > 0 ? feTotal : snapshotCalc)
        );

        const paymentId = paymentIdRaw ? String(paymentIdRaw) : '';

        console.log('[VNPay] Creating payment URL for:', {
            paymentId,
            bookingId: (created as any)?._id,
            beTotal,
            feTotal,
            snapshotBase,
            durationHours,
            amount
        });

        // Step 3: Call backend API to create VNPay payment URL
        if (!paymentId || !Number.isFinite(amount) || amount <= 0) {
            setPaymentError('Thiếu thông tin thanh toán (paymentId hoặc amount)');
            setPaymentStatus('error');
            return;
        }

        try {
            // Call backend API to get VNPay payment URL
            console.log('[VNPay] Calling createVNPayUrl API with:', { amount, orderId: paymentId });
            
            const result = await dispatch(createVNPayUrl({
                amount,
                orderId: paymentId
            })).unwrap();

            console.log('[VNPay] API Response:', result);
            console.log('[VNPay] Response type:', typeof result);
            console.log('[VNPay] Response keys:', result ? Object.keys(result) : 'null');

            // Handle different response structures
            let paymentUrl: string | null = null;
                        
            // use type assertion to safely access possible shapes returned by backend
            if ((result as any)?.paymentUrl) {
                paymentUrl = (result as any).paymentUrl;
            } else if (typeof result === 'string' && (result as string).startsWith('http')) {
                paymentUrl = result as string;
            } else if ((result as any)?.data?.paymentUrl) {
                paymentUrl = (result as any).data.paymentUrl;
            }

            if (!paymentUrl) {
                console.error('[VNPay] ❌ Cannot extract paymentUrl from response');
                console.error('[VNPay] Full response:', JSON.stringify(result, null, 2));
                throw new Error(`Backend did not return paymentUrl. Response: ${JSON.stringify(result)}`);
            }

            // Store booking ID for return page
            try { 
                localStorage.setItem('vnpayBookingId', (created as any)?._id); 
            } catch { /* ignore */ }

            console.log('[VNPay] ✅ Payment URL extracted:', paymentUrl);
            console.log('[VNPay] Redirecting to VNPay gateway');
            
            // Redirect to VNPay payment gateway
            window.location.href = paymentUrl;
            return;
        } catch (error: any) {
            console.error('[VNPay] Error creating payment URL:', error);
            const errorMessage = error?.payload?.message || 
                               error?.message || 
                               error?.response?.data?.message ||
                               'Không thể tạo liên kết thanh toán VNPay. Vui lòng thử lại.';
            setPaymentError(errorMessage);
            setPaymentStatus('error');
        }
    };

    // Handle payment flow (no note, non-VNPay methods)
    // Direct payment handling - no need for separate review page
    const handlePayment = async () => {
        // If VNPay is selected, use VNPay flow
        if (paymentMethod === 'vnpay') {
            await handleVNPayPayment();
            return;
        }
        
        // If PayOS is selected, use PayOS flow
        if (paymentMethod === 'payos') {
            await handlePayOSPayment();
            return;
        }

        // For other payment methods (cash, bank_transfer), create booking directly
        setPaymentStatus('processing');
        setPaymentError(null);
        dispatch(clearError());
        const created = await createBookingCore();
        if (!created) { 
            setPaymentStatus('error'); 
            return; 
        }
        
        setPaymentStatus('success');
        clearBookingLocal();
        setTimeout(() => { onPaymentComplete?.(formData); }, 1500);
    };

    // Handle request-only booking flow (with note)
    const handlePlaceBookingPending = async () => {
        setPaymentStatus('processing');
        setPaymentError(null);
        dispatch(clearError());
        const created = await createBookingCore();
        if (!created) { setPaymentStatus('error'); return; }
        setPaymentStatus('success');
        clearBookingLocal();
        setTimeout(() => { onPaymentComplete?.(formData); }, 1500);
    };

    if (!venue) {
        return (
            <div className="w-full max-w-[1320px] mx-auto px-3 py-10">
                <Card className="border border-gray-200">
                    <CardContent className="p-6">
                        <p className="text-base text-[#6b7280]">No field selected. Please select a field to book.</p>
                        <div className="pt-4">
                            <Button variant="outline" onClick={onBack}>Back</Button>
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
                        <h1 className="text-2xl font-semibold font-['Outfit'] text-center text-[#1a1a1a] mb-1">
                            Thanh toán & Xác nhận
                        </h1>
                        <p className="text-base font-normal font-['Outfit'] text-center text-[#6b7280]">
                            Hoàn tất đặt sân bằng cách thanh toán an toàn.
                        </p>
                    </div>
                    {!isBookingDataValid && (
                        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800">
                            Thiếu hoặc dữ liệu đặt sân không hợp lệ. Vui lòng quay lại và hoàn thành thông tin.
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Main Content */}
            <div className="flex flex-wrap gap-6">
                {/* Payment Section */}
                <div className="flex-1 min-w-[600px]">
                    {paymentStatus === 'success' ? (
                        hasNote ? (
                            /* Success State (Pending) when note exists */
                            <Card className="border border-yellow-200 bg-yellow-50">
                                <CardContent className="p-8 text-center">
                                    <Clock className="w-16 h-16 text-yellow-600 mx-auto mb-4" />
                                    <h2 className="text-2xl font-semibold text-yellow-800 mb-2">
                                        Đã gửi yêu cầu đặt sân
                                    </h2>
                                    <p className="text-yellow-800 mb-4">
                                        Đơn đặt của bạn đang chờ chủ sân xác nhận. Chúng tôi sẽ gửi email hướng dẫn thanh toán khi được chấp nhận.
                                    </p>
                                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                                        Mã yêu cầu: #{bookingId || Math.random().toString(36).substr(2, 9).toUpperCase()}
                                    </Badge>
                                </CardContent>
                            </Card>
                        ) : (
                            /* Success State (Paid) */
                            <Card className="border border-emerald-200 bg-emerald-50">
                                <CardContent className="p-8 text-center">
                                    <CheckCircle className="w-16 h-16 text-emerald-600 mx-auto mb-4" />
                                    <h2 className="text-2xl font-semibold text-emerald-800 mb-2">
                                        Payment Successful!
                                    </h2>
                                    <p className="text-emerald-700 mb-4">
                                        Your booking has been confirmed. You will receive a confirmation email shortly.
                                    </p>
                                    <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">
                                        Booking ID: #{bookingId || Math.random().toString(36).substr(2, 9).toUpperCase()}
                                    </Badge>
                                </CardContent>
                            </Card>
                        )
                    ) : (
                        /* Payment Form */
                        <Card className="border border-gray-200">
                            <CardHeader className="border-b border-gray-200">
                                <CardTitle className="text-2xl font-semibold font-['Outfit'] flex items-center gap-2">
                                    <CreditCard className="w-6 h-6" />
                                    Phương thức thanh toán
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-6">
                                {hasNote && (
                                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3">
                                        <AlertCircle className="w-5 h-5 text-yellow-700 flex-shrink-0 mt-0.5" />
                                        <div className="text-yellow-800 text-sm">
                                            Bạn đã thêm ghi chú cho đơn đặt. Đơn đặt này cần chủ sân xác nhận trước khi thanh toán. Chúng tôi sẽ gửi email hướng dẫn thanh toán khi chủ sân chấp nhận.
                                        </div>
                                    </div>
                                )}
                                {/* Payment Methods */}
                                <div className={`space-y-4 ${hasNote ? 'opacity-50 pointer-events-none' : ''}`}>
                                    {/* VNPay - Recommended */}
                                    <div 
                                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all relative ${
                                            paymentMethod === 'vnpay' 
                                                ? 'border-emerald-500 bg-emerald-50' 
                                                : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                        onClick={() => setPaymentMethod('vnpay')}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Wallet className="w-5 h-5 text-emerald-600" />
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <p className="font-medium">VNPay</p>
                                                    <Badge className="bg-emerald-100 text-emerald-700 text-xs">Khuyến nghị</Badge>
                                                </div>
                                                <p className="text-sm text-gray-600">Thanh toán trực tuyến an toàn, nhanh chóng</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* PayOS */}
                                    <div 
                                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                                            paymentMethod === 'payos' 
                                                ? 'border-emerald-500 bg-emerald-50' 
                                                : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                        onClick={() => setPaymentMethod('payos')}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Wallet className="w-5 h-5 text-blue-600" />
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <p className="font-medium">PayOS</p>
                                                </div>
                                                <p className="text-sm text-gray-600">Thanh toán qua PayOS (QR Code, Banking)</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div 
                                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                                            paymentMethod === 'credit_card' 
                                                ? 'border-emerald-500 bg-emerald-50' 
                                                : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                        onClick={() => setPaymentMethod('credit_card')}
                                    >
                                        <div className="flex items-center gap-3">
                                            <CreditCard className="w-5 h-5 text-blue-600" />
                                            <div>
                                                <p className="font-medium">Thẻ tín dụng/Ghi nợ</p>
                                                <p className="text-sm text-gray-600">Visa, Mastercard, American Express</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div 
                                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                                            paymentMethod === 'bank_transfer' 
                                                ? 'border-emerald-500 bg-emerald-50' 
                                                : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                        onClick={() => setPaymentMethod('bank_transfer')}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Shield className="w-5 h-5 text-blue-600" />
                                            <div>
                                                <p className="font-medium">Chuyển khoản ngân hàng</p>
                                                <p className="text-sm text-gray-600">Chuyển khoản trực tiếp</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div 
                                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                                            paymentMethod === 'cash' 
                                                ? 'border-emerald-500 bg-emerald-50' 
                                                : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                        onClick={() => setPaymentMethod('cash')}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Clock className="w-5 h-5 text-orange-600" />
                                            <div>
                                                <p className="font-medium">Thanh toán tại sân</p>
                                                <p className="text-sm text-gray-600">Thanh toán tiền mặt khi đến nơi</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Error Display */}
                                {(paymentError || bookingError) && (
                                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                                        <p className="text-red-700">
                                            {paymentError || bookingError?.message || 'An error occurred'}
                                        </p>
                                    </div>
                                )}

                                {/* Security Notice */}
                                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Shield className="w-4 h-4 text-emerald-600" />
                                        <span className="text-sm font-medium text-gray-900">Secure Payment</span>
                                    </div>
                                        <p className="text-sm text-gray-600">
                                        Thông tin thanh toán của bạn được mã hóa và an toàn. Chúng tôi không lưu trữ chi tiết thanh toán của bạn.
                                        </p>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Booking Summary Sidebar */}
                <div className="w-96">
                    <Card className="border border-gray-200 sticky top-4">
                        <CardHeader className="border-b border-gray-200">
                            <CardTitle className="text-xl font-semibold font-['Outfit']">
                                Tóm tắt đặt sân
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                            {/* Venue Info */}
                            <div className="border-b border-gray-100 pb-4">
                                <h3 className="font-medium text-gray-900 mb-2">{venue.name}</h3>
                                <p className="text-sm text-gray-600">
                                    {typeof (venue as any)?.location === 'string' 
                                        ? (venue as any)?.location 
                                        : (venue as any)?.location?.address || 'Location not specified'}
                                </p>
                            </div>

                            {/* Booking Details */}
                            <div className="space-y-3 border-b border-gray-100 pb-4">
                                {/* <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Court:</span>
                                    <span className="text-sm font-medium">
                                        {courts.find(c => c.id === formData.court)?.name || 'Selected Court'}
                                    </span>
                                </div> */}
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Date:</span>
                                    <span className="text-sm font-medium">{formatDate(formData.date)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Time:</span>
                                    <span className="text-sm font-medium">
                                        {formatTime(formData.startTime)} - {formatTime(formData.endTime)}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Duration:</span>
                                    <span className="text-sm font-medium">{calculateDuration()} hours</span>
                                </div>
                            </div>

                            {/* Customer Info */}
                            <div className="space-y-3 border-b border-gray-100 pb-4">
                                <h4 className="font-medium text-gray-900">Customer Details</h4>
                                <div className="space-y-1">
                                    <p className="text-sm text-gray-600">{formData.name}</p>
                                    <p className="text-sm text-gray-600">{formData.email}</p>
                                    <p className="text-sm text-gray-600">{formData.phone}</p>
                                </div>
                            </div>

                            {/* Pricing */}
                            <div className="space-y-3">
                                {selectedAmenityIds?.length ? (
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Phí tiện ích</span>
                                        <span className="text-sm font-medium">{formatVND(calculateAmenitiesTotal())}</span>
                                    </div>
                                ) : null}
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">
                                        {formatVND(venue.basePrice)}/giờ × {calculateDuration()} giờ
                                    </span>
                                    <span className="text-sm font-medium">{formatVND(calculateTotal() - calculateAmenitiesTotal())}</span>
                                </div>
                                <div className="flex justify-between text-lg font-semibold text-emerald-600 pt-2 border-t">
                                    <span>Tổng:</span>
                                    <span>{formatVND(calculateTotal())}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Action Buttons */}
            {paymentStatus !== 'success' && (
                <div className="flex justify-center items-center gap-5 py-5 bg-white/20 shadow-[0px_4px_44px_0px_rgba(211,211,211,0.25)]">
                        <Button
                        variant="outline"
                        onClick={onBack}
                        disabled={paymentStatus === 'processing' || bookingLoading}
                        className="px-5 py-3 bg-emerald-700 hover:bg-emerald-800 text-white border-emerald-700"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Quay lại
                    </Button>
                    {hasNote ? (
                        <Button
                            onClick={handlePlaceBookingPending}
                            disabled={paymentStatus === 'processing' || bookingLoading || !isBookingDataValid}
                            className="px-5 py-3 bg-gray-800 hover:bg-gray-900 text-white"
                        >
                            {(paymentStatus === 'processing' || bookingLoading) ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    {bookingLoading ? 'Đang tạo đơn đặt...' : 'Đang gửi yêu cầu đặt sân...'}
                                </>
                            ) : (
                                <>Gửi yêu cầu đặt sân</>
                            )}
                        </Button>
                    ) : (
                        <Button
                            onClick={handlePayment}
                            disabled={paymentStatus === 'processing' || bookingLoading || !isBookingDataValid}
                            className="px-5 py-3 bg-gray-800 hover:bg-gray-900 text-white"
                        >
                            {(paymentStatus === 'processing' || bookingLoading) ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        {bookingLoading ? 'Đang tạo đơn đặt...' : 'Đang xử lý thanh toán...'}
                                </>
                            ) : (
                                <>
                                        Hoàn tất thanh toán - {formatVND(calculateTotal())}
                                </>
                            )}
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
};

export default PaymentTab;