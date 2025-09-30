import React, {useMemo, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, CreditCard, Shield, CheckCircle, Clock, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAppSelector } from "@/store/hook";
import { useLocation } from "react-router-dom";
import type { Field } from "@/types/field-type";
import { useBooking } from "@/features/booking/hooks/useBooking";
import type { CreateFieldBookingPayload, Booking } from "@/types/booking-type";

/**
 * Interface for booking form data
 */
interface BookingFormData {
    date: string;
    startTime: string;
    endTime: string;
    court: string;
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
}

/**
 * PaymentTab component - Final step to complete booking with payment
 */
export const PaymentTab: React.FC<PaymentTabProps> = ({
    venue: venueProp,
    bookingData,
    onPaymentComplete,
    onBack,
    courts = [],
}) => {
    const location = useLocation();
    const currentField = useAppSelector((state) => state.field.currentField);
    const user = useAppSelector((state) => state.user.user);
    const venue = (venueProp || currentField || (location.state as any)?.venue) as Field | undefined;
    const { createFieldBooking, loading: bookingLoading, error: bookingError, clearError } = useBooking();
    
    const [paymentMethod, setPaymentMethod] = useState<'credit_card' | 'bank_transfer' | 'cash'>('credit_card');
    const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
    const [paymentError, setPaymentError] = useState<string | null>(null);
    const [bookingId, setBookingId] = useState<string | null>(null);

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
            if (!raw) return { date: '', startTime: '', endTime: '', court: '' } as BookingFormData;
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
            return { date: '', startTime: '', endTime: '', court: '' } as BookingFormData;
        }
    }, [bookingData]);

    // Helper functions for formatting
    const formatDate = (dateString: string): string => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
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
        return date.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true 
        });
    };

    const calculateTotal = useCallback((): number => {
        if (!venue || !formData.startTime || !formData.endTime) return 0;
        
        const start = new Date(`1970-01-01T${formData.startTime}:00`);
        const end = new Date(`1970-01-01T${formData.endTime}:00`);
        const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
        
        const total = venue.pricePerHour * hours;
        return total > 0 ? total : 0;
    }, [venue, formData.startTime, formData.endTime]);

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
            formData.court &&
            calculateDuration() > 0 &&
            calculateTotal() > 0
        );
    }, [venue, formData.date, formData.startTime, formData.endTime, formData.court, calculateDuration, calculateTotal]);

    // Handle payment and create booking
    const handlePayment = async () => {
        if (!venue || !user) {
            setPaymentError('Missing venue or user information');
            return;
        }

        if (!isBookingDataValid) {
            setPaymentError('Missing or invalid booking data');
            return;
        }

        setPaymentStatus('processing');
        setPaymentError(null);
        clearError(); // Clear any previous booking errors

        try {
            // Prepare booking payload according to API spec
            const bookingPayload: CreateFieldBookingPayload = {
                scheduleId: formData.court, // Use selected court (schedule) ID
                slot: `${formData.date} ${formData.startTime}-${formData.endTime}`, // Include date for clarity
                totalPrice: Number(calculateTotal().toFixed(2)),
            };

            console.log('Creating booking with payload:', bookingPayload);

            // Create booking through Redux
            const result = await createFieldBooking(bookingPayload);

            // Check if the action was fulfilled
            if (result.meta.requestStatus === 'fulfilled') {
                // Booking successful
                const booking = result.payload as Booking;
                setBookingId(booking._id); // Using _id from API response
                setPaymentStatus('success');
                
                // Call parent callback after successful payment
                setTimeout(() => {
                    if (onPaymentComplete) {
                        onPaymentComplete(formData);
                    }
                }, 1500);
            } else {
                // Booking failed - result.payload contains error
                const error = result.payload as any;
                throw new Error(error?.message || 'Failed to create booking');
            }
            
        } catch (error: any) {
            console.error('Payment/Booking error:', error);
            setPaymentStatus('error');
            setPaymentError(
                bookingError?.message || 
                error.message || 
                'Payment failed. Please try again.'
            );
        }
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
                <CardContent className="p-6">
                    <div className="pb-10">
                        <h1 className="text-2xl font-semibold font-['Outfit'] text-center text-[#1a1a1a] mb-1">
                            Payment & Confirmation
                        </h1>
                        <p className="text-base font-normal font-['Outfit'] text-center text-[#6b7280]">
                            Complete your booking by processing the payment securely.
                        </p>
                    </div>
                    {!isBookingDataValid && (
                        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800">
                            Missing or invalid booking data. Please go back and complete your booking details.
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Main Content */}
            <div className="flex flex-wrap gap-6">
                {/* Payment Section */}
                <div className="flex-1 min-w-[600px]">
                    {paymentStatus === 'success' ? (
                        /* Success State */
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
                    ) : (
                        /* Payment Form */
                        <Card className="border border-gray-200">
                            <CardHeader className="border-b border-gray-200">
                                <CardTitle className="text-2xl font-semibold font-['Outfit'] flex items-center gap-2">
                                    <CreditCard className="w-6 h-6" />
                                    Payment Method
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-6">
                                {/* Payment Methods */}
                                <div className="space-y-4">
                                    <div 
                                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                                            paymentMethod === 'credit_card' 
                                                ? 'border-emerald-500 bg-emerald-50' 
                                                : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                        onClick={() => setPaymentMethod('credit_card')}
                                    >
                                        <div className="flex items-center gap-3">
                                            <CreditCard className="w-5 h-5 text-emerald-600" />
                                            <div>
                                                <p className="font-medium">Credit/Debit Card</p>
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
                                                <p className="font-medium">Bank Transfer</p>
                                                <p className="text-sm text-gray-600">Direct bank transfer</p>
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
                                                <p className="font-medium">Pay at Venue</p>
                                                <p className="text-sm text-gray-600">Cash payment on arrival</p>
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
                                        Your payment information is encrypted and secure. We never store your payment details.
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
                                Booking Summary
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                            {/* Venue Info */}
                            <div className="border-b border-gray-100 pb-4">
                                <h3 className="font-medium text-gray-900 mb-2">{venue.name}</h3>
                                <p className="text-sm text-gray-600">{venue.location}</p>
                            </div>

                            {/* Booking Details */}
                            <div className="space-y-3 border-b border-gray-100 pb-4">
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Court:</span>
                                    <span className="text-sm font-medium">
                                        {courts.find(c => c.id === formData.court)?.name || 'Selected Court'}
                                    </span>
                                </div>
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
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">
                                        ${venue.pricePerHour}/hr × {calculateDuration()} hours
                                    </span>
                                    <span className="text-sm font-medium">${calculateTotal().toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-lg font-semibold text-emerald-600 pt-2 border-t">
                                    <span>Total:</span>
                                    <span>${calculateTotal().toFixed(2)}</span>
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
                        Back
                    </Button>
                    <Button
                        onClick={handlePayment}
                        disabled={paymentStatus === 'processing' || bookingLoading || !isBookingDataValid}
                        className="px-5 py-3 bg-gray-800 hover:bg-gray-900 text-white"
                    >
                        {(paymentStatus === 'processing' || bookingLoading) ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                {bookingLoading ? 'Creating Booking...' : 'Processing Payment...'}
                            </>
                        ) : (
                            <>
                                Complete Payment - ${calculateTotal().toFixed(2)}
                            </>
                        )}
                    </Button>
                </div>
            )}
        </div>
    );
};

export default PaymentTab;