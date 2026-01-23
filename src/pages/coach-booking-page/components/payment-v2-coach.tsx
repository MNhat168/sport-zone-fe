"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, CheckCircle, AlertCircle, Clock, Copy, Wallet } from "lucide-react";
import { Loading } from "@/components/ui/loading";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useAppDispatch, useAppSelector } from "@/store/hook";
import { useNavigate } from "react-router-dom";
import { CustomSuccessToast, CustomFailedToast } from "@/components/toast/notificiation-toast";
import logger from "@/utils/logger";
import { createPayOSPayment } from "@/features/booking/bookingThunk";
import { clearError } from "@/features/booking/bookingSlice";
import { useSocket } from "@/hooks/useSocket";

interface BookingFormData {
    date: string;
    startTime: string;
    endTime: string;
    fieldId?: string;
    note?: string;
}

interface PaymentV2CoachProps {
    coachId: string;
    bookingData: BookingFormData;
    onBack?: () => void;
}

// Helper function for formatting VND
const formatVND = (value: number): string => {
    try {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
    } catch {
        return `${value.toLocaleString('vi-VN')} ₫`;
    }
};

/**
 * PaymentV2Coach component - PayOS payment integration for coach booking
 */
export const PaymentV2Coach: React.FC<PaymentV2CoachProps> = ({
    coachId,
    bookingData,
    onBack,
}) => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { currentCoach } = useAppSelector((state) => state.coach);
    const { loadingPayment } = useAppSelector((state) => state.booking);

    const [paymentError, setPaymentError] = useState<string | null>(null);

    // Held booking state (restored from localStorage if page is refreshed)
    const [heldBookingId, setHeldBookingId] = useState<string | null>(null);
    const [countdown, setCountdown] = useState<number>(300); // 5 minutes in seconds
    const [holdError, setHoldError] = useState<string | null>(null);
    const [bankAccount, setBankAccount] = useState<any>(null);
    const [loadingBankAccount, setLoadingBankAccount] = useState<boolean>(false);

    // WebSocket connection for real-time notifications
    const socket = useSocket('notifications');

    // Restore held booking from localStorage on mount (created in PersonalInfo step)
    useEffect(() => {
        try {
            const storedBookingId = localStorage.getItem('heldBookingId');
            const storedHoldTime = localStorage.getItem('heldBookingTime');

            logger.debug('[PAYMENT V2 COACH] Checking localStorage for held booking:', {
                storedBookingId,
                storedHoldTime
            });

            // Validate stored booking ID
            if (!storedBookingId || storedBookingId.trim() === '' || storedBookingId === 'undefined' || storedBookingId === 'null') {
                logger.warn('[PAYMENT V2 COACH] Invalid or missing heldBookingId in localStorage:', storedBookingId);
                setHoldError('Chưa có booking được giữ chỗ. Vui lòng quay lại bước trước.');
                return;
            }

            if (storedHoldTime) {
                const holdTime = parseInt(storedHoldTime);
                if (isNaN(holdTime)) {
                    logger.error('[PAYMENT V2 COACH] Invalid hold time:', storedHoldTime);
                    setHoldError('Dữ liệu booking không hợp lệ. Vui lòng quay lại bước trước.');
                    return;
                }

                const now = Date.now();
                const elapsed = Math.floor((now - holdTime) / 1000);
                const remaining = 300 - elapsed; // 5 minutes = 300 seconds

                if (remaining > 0) {
                    setHeldBookingId(storedBookingId);
                    setCountdown(remaining);
                    logger.debug('[PAYMENT V2 COACH] Restored held booking:', {
                        heldBookingId: storedBookingId,
                        remainingSeconds: remaining
                    });
                } else {
                    // Booking expired, clear localStorage
                    logger.warn('[PAYMENT V2 COACH] Held booking expired');
                    localStorage.removeItem('heldBookingId');
                    localStorage.removeItem('heldBookingCountdown');
                    localStorage.removeItem('heldBookingTime');
                    setHoldError('Thời gian giữ chỗ đã hết. Vui lòng quay lại và đặt lại.');
                }
            } else {
                logger.warn('[PAYMENT V2 COACH] No hold time found in localStorage');
                setHoldError('Chưa có booking được giữ chỗ. Vui lòng quay lại bước trước.');
            }
        } catch (error) {
            logger.error('[PAYMENT V2 COACH] Error restoring held booking:', error);
            setHoldError('Lỗi khi khôi phục thông tin booking. Vui lòng quay lại bước trước.');
        }
    }, []);

    // Handle countdown expired - release slot and reset
    const handleCountdownExpired = useCallback(async () => {
        if (!heldBookingId) return;

        try {
            // Call public API to cancel booking hold (no auth required)
            const headers: HeadersInit = {
                'Content-Type': 'application/json',
            };

            const response = await fetch(`${import.meta.env.VITE_API_URL}/bookings/${heldBookingId}/cancel-hold`, {
                method: 'PATCH',
                headers,
                body: JSON.stringify({
                    cancellationReason: 'Thời gian giữ chỗ đã hết (5 phút)'
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Có lỗi xảy ra' }));
                logger.error('[PaymentV2Coach] Error cancelling booking on countdown expiry:', errorData);
            } else {
                logger.debug('[PaymentV2Coach] Booking hold cancelled successfully');
            }
        } catch (error) {
            // Log error but continue with cleanup
            logger.error('[PaymentV2Coach] Error cancelling booking on countdown expiry:', error);
        }

        // Clear all localStorage (always run, even if API call fails)
        localStorage.removeItem('heldBookingId');
        localStorage.removeItem('heldBookingCountdown');
        localStorage.removeItem('heldBookingTime');

        // Reset state
        setHeldBookingId(null);
        setCountdown(0);
        setHoldError('Thời gian giữ chỗ đã hết. Vui lòng quay lại và đặt lại.');
    }, [heldBookingId]);

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
                // Update localStorage
                localStorage.setItem('heldBookingCountdown', newCountdown.toString());
                return newCountdown;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [heldBookingId, countdown, handleCountdownExpired]);

    // Format countdown timer (MM:SS)
    const formatCountdown = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };


    const calculateHours = useCallback((): number => {
        if (!bookingData.startTime || !bookingData.endTime) return 0;
        const start = new Date(`1970-01-01T${bookingData.startTime}:00`);
        const end = new Date(`1970-01-01T${bookingData.endTime}:00`);
        const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
        return hours > 0 ? hours : 0;
    }, [bookingData.startTime, bookingData.endTime]);

    const calculateBookingAmount = useCallback((): number => {
        if (!currentCoach?.price) return 0;
        const hours = calculateHours();
        return Math.round(currentCoach.price * hours);
    }, [currentCoach?.price, calculateHours]);

    const calculatePlatformFee = useCallback((): number => {
        const bookingAmount = calculateBookingAmount();
        return Math.round(bookingAmount * 0.05); // 5% platform fee
    }, [calculateBookingAmount]);

    const calculateTotal = useCallback((): number => {
        const bookingAmount = calculateBookingAmount();
        const platformFee = calculatePlatformFee();
        return bookingAmount + platformFee;
    }, [calculateBookingAmount, calculatePlatformFee]);

    const isBookingDataValid = useMemo(() => {
        return Boolean(
            coachId &&
            bookingData.date &&
            bookingData.startTime &&
            bookingData.endTime &&
            // fieldId is optional for coach bookings
            calculateHours() > 0 &&
            calculateTotal() > 0
        );
    }, [coachId, bookingData, calculateHours, calculateTotal]);

    // Clear persisted booking-related local storage
    const clearBookingLocal = () => {
        try {
            const itemsToRemove = [
                'heldBookingId',
                'heldBookingCountdown',
                'heldBookingTime'
            ];
            itemsToRemove.forEach(item => localStorage.removeItem(item));
            logger.debug('[PAYMENT V2 COACH] Booking local data cleared selectorively');
        } catch (error) {
            logger.error('Error clearing booking local storage:', error);
        }
    };

    // WebSocket listener for real-time payment success notifications
    useEffect(() => {
        if (!socket || !heldBookingId || paymentSuccess) return;

        const handleNotification = (notification: any) => {
            logger.debug('[PAYMENT V2 COACH] Received WebSocket notification:', notification);

            // Access bookingId from metadata (standard structure for backend notifications)
            const notificationBookingId = notification.metadata?.bookingId || notification.bookingId;
            const notificationType = notification.type;

            // Check if this is a payment success or booking confirmation notification for our booking
            const isMatch = (notificationType === 'PAYMENT_SUCCESS' || notificationType === 'BOOKING_CONFIRMED')
                && notificationBookingId === heldBookingId;

            if (isMatch) {
                logger.log('[PAYMENT V2 COACH] Success notification received via WebSocket!');

                // Close PayOS window
                if (payosWindow && !payosWindow.closed) {
                    payosWindow.close();
                }

                // Update state
                setPayosWindow(null);
                setPaymentSuccess(true);
                setPollAttempts(0);

                // Clear local storage
                clearBookingLocal();

                logger.debug('[PAYMENT V2 COACH] Session cleared, showing success message');
            }
        };

        socket.on('notification', handleNotification);

        return () => {
            socket.off('notification', handleNotification);
        };
    }, [socket, heldBookingId, payosWindow, paymentSuccess]);

    // Poll payment status when PayOS window is open
    useEffect(() => {
        if (!payosWindow || !heldBookingId) return;

        const MAX_POLL_ATTEMPTS = 150; // 150 attempts * 2 seconds = 5 minutes max
        let pollInterval: NodeJS.Timeout;

        pollInterval = setInterval(async () => {
            // Check if window is still open
            if (payosWindow.closed) {
                clearInterval(pollInterval);
                setPayosWindow(null);
                setPollAttempts(0);

                if (!paymentSuccess) {
                    logger.debug('[PAYMENT V2 COACH] PayOS window closed without payment');
                }
                return;
            }

            // Check if max polling attempts reached
            if (pollAttempts >= MAX_POLL_ATTEMPTS) {
                logger.warn('[PAYMENT V2 COACH] Max polling attempts reached (5 minutes)');
                clearInterval(pollInterval);
                setPayosWindow(null);
                setPollAttempts(0);
                setPaymentError('Timeout chờ thanh toán. Vui lòng kiểm tra lịch sử booking của bạn.');
                return;
            }

            setPollAttempts(prev => prev + 1);

            try {
                // Poll payment status
                const response = await fetch(
                    `${import.meta.env.VITE_API_URL}/bookings/${heldBookingId}`,
                    {
                        method: 'GET',
                        headers: { 'Content-Type': 'application/json' },
                    }
                );

                if (response.ok || response.status === 304) {
                    const rawData = await response.json();
                    const data = rawData.data || rawData;

                    logger.debug('[PAYMENT V2 COACH] Polling booking status:', {
                        bookingId: heldBookingId,
                        status: data.status,
                        paymentStatus: data.paymentStatus,
                        attempt: pollAttempts + 1
                    });

                    // Check if payment is successful
                    const isPaymentComplete =
                        data.status === 'confirmed' ||
                        data.paymentStatus === 'paid' ||
                        (data.paymentMethod === 'payos' && data.status === 'confirmed');

                    if (isPaymentComplete) {
                        clearInterval(pollInterval);

                        logger.log('[PAYMENT V2 COACH] Payment successful! Closing PayOS window...');

                        // Close PayOS window
                        if (!payosWindow.closed) {
                            payosWindow.close();
                        }

                        setPayosWindow(null);
                        setPaymentSuccess(true);
                        setPollAttempts(0);

                        // Clear local storage
                        clearBookingLocal();

                        logger.debug('[PAYMENT V2 COACH] Session cleared, showing success message');
                    }
                } else if (response.status === 404) {
                    logger.warn('[PAYMENT V2 COACH] Booking not found (404), stopping poll');
                    clearInterval(pollInterval);
                    setPayosWindow(null);
                    setPollAttempts(0);
                    setPaymentError('Booking không tồn tại. Vui lòng thử lại.');
                }
            } catch (error) {
                logger.error('[PAYMENT V2 COACH] Error polling payment status:', error);
                // Continue polling on error (don't stop)
            }
        }, 2000); // Poll every 2 seconds

        return () => {
            if (pollInterval) {
                clearInterval(pollInterval);
            }
        };
    }, [payosWindow, heldBookingId, paymentSuccess, pollAttempts]);

    // Handle PayOS payment initiation
    const handlePayWithPayOS = async () => {
        if (!heldBookingId) {
            setPaymentError('Chưa có booking được giữ chỗ. Vui lòng quay lại bước trước.');
            return;
        }

        dispatch(clearError());

        try {
            // Dispatch Redux action to create PayOS payment link
            const result = await dispatch(createPayOSPayment(heldBookingId)).unwrap();

            // Open PayOS checkout URL in new window
            if (result.checkoutUrl) {
                const paymentWindow = window.open(
                    result.checkoutUrl,
                    'PayOS Payment',
                    'width=800,height=900,left=200,top=100'
                );

                if (paymentWindow) {
                    setPayosWindow(paymentWindow);
                } else {
                    throw new Error('Không thể mở cửa sổ thanh toán. Vui lòng kiểm tra popup blocker.');
                }
            } else {
                throw new Error('Link thanh toán không tồn tại');
            }
        } catch (error: any) {
            logger.error('PayOS Error:', error);
            setPaymentError(error.message || 'Lỗi khi khởi tạo thanh toán PayOS');
        }
    };


    const formatDate = (dateString: string): string => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const formatTime = (timeString: string): string => {
        if (!timeString) return '';
        return timeString;
    };

    if (!isBookingDataValid) {
        return (
            <div className="w-full max-w-[1320px] mx-auto px-3 py-10">
                <Card className="border border-gray-200">
                    <CardContent className="p-6">
                        <p className="text-base text-[#6b7280]">Dữ liệu booking không hợp lệ. Vui lòng quay lại và chọn lại.</p>
                        <div className="pt-4">
                            <Button variant="outline" onClick={onBack}>Quay lại</Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const bookingAmount = calculateBookingAmount();
    const platformFee = calculatePlatformFee();
    const total = calculateTotal();
    const hours = calculateHours();

    // Show success screen if payment completed
    if (paymentSuccess) {
        return (
            <div className="w-full max-w-[1320px] mx-auto px-3 py-10">
                <Card className="border border-gray-200">
                    <CardContent className="p-8 text-center">
                        <div className="mb-6">
                            <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                                <svg
                                    className="w-12 h-12 text-green-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M5 13l4 4L19 7"
                                    />
                                </svg>
                            </div>
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-3">
                            Thanh toán thành công!
                        </h2>
                        <p className="text-lg text-gray-600 mb-6">
                            Đặt coach của bạn đã được xác nhận. Chúng tôi đã gửi email xác nhận đến bạn.
                        </p>
                        <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left max-w-md mx-auto">
                            <h3 className="font-semibold text-gray-900 mb-4">Thông tin đặt coach</h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Coach:</span>
                                    <span className="font-medium">{currentCoach?.name || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Ngày:</span>
                                    <span className="font-medium">{formatDate(bookingData.date)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Giờ:</span>
                                    <span className="font-medium">
                                        {formatTime(bookingData.startTime)} - {formatTime(bookingData.endTime)}
                                    </span>
                                </div>
                                <div className="flex justify-between pt-3 border-t">
                                    <span className="font-semibold text-gray-900">Tổng:</span>
                                    <span className="font-semibold text-green-600">
                                        {formatVND(total)}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <p className="text-sm text-gray-500">
                            Bạn có thể đóng trang này hoặc kiểm tra lịch sử đặt lịch trong tài khoản của bạn.
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="w-full max-w-[1320px] mx-auto px-3 py-10">
            <Card className="border border-gray-200">
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={onBack}>
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <CardTitle className="text-2xl">Xác nhận & Thanh toán</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Booking Hold Status */}
                    {heldBookingId && countdown > 0 && (
                        <div className={`p-4 border rounded-lg flex items-center justify-between ${countdown < 120
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
                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <AlertCircle className="w-5 h-5" />
                                <span>{holdError}</span>
                            </div>
                        </div>
                    )}
                    {countdown <= 0 && heldBookingId && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
                            <AlertCircle className="w-5 h-5 inline mr-2" />
                            Thời gian giữ chỗ đã hết. Vui lòng quay lại và đặt lại.
                        </div>
                    )}

                    {/* Booking Summary */}
                    <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                        <h3 className="font-semibold text-lg">Thông tin đặt lịch</h3>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                                <span className="text-muted-foreground">Ngày:</span>
                                <span className="ml-2 font-medium">{formatDate(bookingData.date)}</span>
                            </div>
                            <div>
                                <span className="text-muted-foreground">Giờ:</span>
                                <span className="ml-2 font-medium">{formatTime(bookingData.startTime)} - {formatTime(bookingData.endTime)}</span>
                            </div>
                            <div>
                                <span className="text-muted-foreground">Thời lượng:</span>
                                <span className="ml-2 font-medium">{hours} giờ</span>
                            </div>
                            <div>
                                <span className="text-muted-foreground">Coach:</span>
                                <span className="ml-2 font-medium">{currentCoach?.name || 'N/A'}</span>
                            </div>
                        </div>
                    </div>

                    {/* PayOS Payment Section */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Thanh toán qua PayOS</h3>
                        <p className="text-sm text-gray-600">
                            Quét mã QR hoặc thanh toán qua cổng PayOS để hoàn tất đặt lịch
                        </p>

                        <Button
                            onClick={handlePayWithPayOS}
                            disabled={!heldBookingId || countdown <= 0 || loadingPayment}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            {loadingPayment ? (
                                <>
                                    <Loading size={16} className="mr-2" />
                                    Đang tạo link thanh toán...
                                </>
                            ) : (
                                <>
                                    <Wallet className="w-5 h-5 mr-2" />
                                    Thanh toán qua PayOS
                                </>
                            )}
                        </Button>
                    </div>

                    {/* Error Message */}
                    {paymentError && (
                        <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                            <div className="flex items-center gap-2 text-red-800">
                                <AlertCircle className="h-5 w-5" />
                                <p className="font-medium">{paymentError}</p>
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-4 pt-4">
                        <Button
                            variant="outline"
                            onClick={onBack}
                            className="flex-1"
                            disabled={loadingPayment}
                        >
                            Quay lại
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

