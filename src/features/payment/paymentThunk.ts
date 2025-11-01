import { createAsyncThunk } from "@reduxjs/toolkit";
import type {
    Payment,
    CreateVNPayUrlPayload,
    CreateVNPayUrlResponse,
    UpdatePaymentStatusPayload,
    ErrorResponse,
} from "../../types/payment-type";
import axiosPrivate from "../../utils/axios/axiosPrivate";
import {
    CREATE_VNPAY_URL_API,
    GET_PAYMENT_BY_BOOKING_API,
    UPDATE_PAYMENT_STATUS_API,
    VERIFY_VNPAY_API,
} from "./paymentAPI";

/**
 * Create VNPay payment URL
 */
export const createVNPayUrl = createAsyncThunk<
    CreateVNPayUrlResponse,
    CreateVNPayUrlPayload,
    { rejectValue: ErrorResponse }
>("payment/createVNPayUrl", async (payload, thunkAPI) => {
    try {
        console.log("[Payment Thunk] Creating VNPay URL:", payload);
        const response = await axiosPrivate.get(
            `${CREATE_VNPAY_URL_API}?amount=${payload.amount}&orderId=${payload.orderId}`
        );
        
        console.log("[Payment Thunk] Response status:", response.status);
        console.log("[Payment Thunk] Response data:", response.data);
        console.log("[Payment Thunk] Response data type:", typeof response.data);
        console.log("[Payment Thunk] Response data keys:", Object.keys(response.data || {}));
        
        // Handle different response structures
        // Case 1: Direct { paymentUrl: "..." }
        if (response.data?.paymentUrl) {
            console.log("[Payment Thunk] ✅ Found paymentUrl in response.data");
            return response.data;
        }
        
        // Case 2: Nested { data: { paymentUrl: "..." } }
        if (response.data?.data?.paymentUrl) {
            console.log("[Payment Thunk] ✅ Found paymentUrl in response.data.data");
            return response.data.data;
        }
        
        // Case 3: { success: true, data: { paymentUrl: "..." } }
        if (response.data?.success && response.data?.data?.paymentUrl) {
            console.log("[Payment Thunk] ✅ Found paymentUrl in success response");
            return response.data.data;
        }
        
        // Case 4: Response is the URL itself (string)
        if (typeof response.data === 'string' && response.data.startsWith('http')) {
            console.log("[Payment Thunk] ✅ Response is direct URL string");
            return { paymentUrl: response.data };
        }
        
        // If none of the above, log error
        console.error("[Payment Thunk] ❌ Cannot find paymentUrl in response");
        console.error("[Payment Thunk] Response structure:", JSON.stringify(response.data, null, 2));
        
        throw new Error(`Backend response does not contain paymentUrl. Response: ${JSON.stringify(response.data)}`);
    } catch (error: any) {
        console.error("[Payment Thunk] ❌ Error creating VNPay URL:", error);
        console.error("[Payment Thunk] Error type:", error?.constructor?.name);
        console.error("[Payment Thunk] Error message:", error?.message);
        console.error("[Payment Thunk] Error response:", error?.response);
        console.error("[Payment Thunk] Error response data:", error?.response?.data);
        console.error("[Payment Thunk] Error response status:", error?.response?.status);
        
        const errorResponse: ErrorResponse = {
            message: error.response?.data?.message || 
                     error.response?.data?.error || 
                     error.message || 
                     "Failed to create VNPay URL",
            status: error.response?.status?.toString() || "500",
        };
        
        console.error("[Payment Thunk] Returning error response:", errorResponse);
        return thunkAPI.rejectWithValue(errorResponse);
    }
});

/**
 * Get payment by booking ID
 */
export const getPaymentByBooking = createAsyncThunk<
    Payment,
    string,
    { rejectValue: ErrorResponse }
>("payment/getPaymentByBooking", async (bookingId, thunkAPI) => {
    try {
        console.log("Getting payment for booking:", bookingId);
        const response = await axiosPrivate.get(GET_PAYMENT_BY_BOOKING_API(bookingId));
        
        console.log("Payment retrieved successfully:", response.data);
        return response.data;
    } catch (error: any) {
        console.error("Error getting payment:", error);
        const errorResponse: ErrorResponse = {
            message: error.response?.data?.message || error.message || "Failed to get payment",
            status: error.response?.status?.toString() || "500",
        };
        return thunkAPI.rejectWithValue(errorResponse);
    }
});

/**
 * Update payment status (admin/staff only)
 */
export const updatePaymentStatus = createAsyncThunk<
    Payment,
    { paymentId: string; payload: UpdatePaymentStatusPayload },
    { rejectValue: ErrorResponse }
>("payment/updatePaymentStatus", async ({ paymentId, payload }, thunkAPI) => {
    try {
        console.log("Updating payment status:", paymentId, payload);
        const response = await axiosPrivate.patch(
            UPDATE_PAYMENT_STATUS_API(paymentId),
            payload
        );
        
        console.log("Payment status updated successfully:", response.data);
        return response.data;
    } catch (error: any) {
        console.error("Error updating payment status:", error);
        const errorResponse: ErrorResponse = {
            message: error.response?.data?.message || error.message || "Failed to update payment status",
            status: error.response?.status?.toString() || "500",
        };
        return thunkAPI.rejectWithValue(errorResponse);
    }
});

/**
 * Verify VNPay payment after redirect
 * NEW: Call this immediately when user returns from VNPay
 */
export interface VNPayVerificationResult {
    success: boolean;
    paymentStatus: 'succeeded' | 'failed' | 'pending';
    bookingId: string;
    message: string;
    reason?: string;
}

export const verifyVNPayPayment = createAsyncThunk<
    VNPayVerificationResult,
    string,
    { rejectValue: { message: string; status: string } }
>(
    'payment/verifyVNPayPayment',
    async (queryString, thunkAPI) => {
        try {
            console.log('[Payment Thunk] Verifying VNPay payment');
            console.log('[Payment Thunk] Received query string length:', queryString.length);
            
            // Parse and log query params to help debug
            const queryParams = new URLSearchParams(queryString.startsWith('?') ? queryString.slice(1) : queryString);
            const paramKeys = Array.from(queryParams.keys());
            console.log('[Payment Thunk] Received query params:', paramKeys);
            
            // Check for essential VNPay params
            const hasSecureHash = queryParams.has('vnp_SecureHash');
            const hasTxnRef = queryParams.has('vnp_TxnRef');
            const hasResponseCode = queryParams.has('vnp_ResponseCode');
            
            if (!hasSecureHash) {
                console.error('[Payment Thunk] ❌ Missing vnp_SecureHash in query params');
                console.error('[Payment Thunk] Available params:', paramKeys);
            } else {
                console.log('[Payment Thunk] ✅ Found vnp_SecureHash');
            }
            
            if (!hasTxnRef) {
                console.warn('[Payment Thunk] ⚠️ Missing vnp_TxnRef in query params');
            }
            if (!hasResponseCode) {
                console.warn('[Payment Thunk] ⚠️ Missing vnp_ResponseCode in query params');
            }

            const cleanQuery = queryString.startsWith('?') ? queryString.slice(1) : queryString;

            console.log('[Payment Thunk] Calling verify endpoint with', cleanQuery.length, 'characters');
            const response = await axiosPrivate.get(`${VERIFY_VNPAY_API}?${cleanQuery}`);
            console.log('[Payment Thunk] ✅ Verification successful:', response.data);
            return response.data;
        } catch (error: any) {
            console.error('[Payment Thunk] ❌ Verification error:', error);
            const errorResponse = {
                message: error.response?.data?.message || error.message || 'Failed to verify payment',
                status: error.response?.status?.toString() || '500',
            };
            return thunkAPI.rejectWithValue(errorResponse);
        }
    }
);

