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
    GET_TRANSACTION_BY_BOOKING_API,
    UPDATE_TRANSACTION_STATUS_API,
    VERIFY_VNPAY_API,
    QUERY_VNPAY_TRANSACTION_API,
    VNPAY_REFUND_API,
} from "./transactionsAPI";

/**
 * Create VNPay payment URL
 */
export const createVNPayUrl = createAsyncThunk<
    CreateVNPayUrlResponse,
    CreateVNPayUrlPayload,
    { rejectValue: ErrorResponse }
>("transactions/createVNPayUrl", async (payload, thunkAPI) => {
    try {
        console.log("[Transactions Thunk] Creating VNPay URL:", payload);
        const response = await axiosPrivate.get(
            `${CREATE_VNPAY_URL_API}?amount=${payload.amount}&orderId=${payload.orderId}`
        );
        
        console.log("[Transactions Thunk] Response status:", response.status);
        console.log("[Transactions Thunk] Response data:", response.data);
        console.log("[Transactions Thunk] Response data type:", typeof response.data);
        console.log("[Transactions Thunk] Response data keys:", Object.keys(response.data || {}));
        
        // Handle different response structures
        // Case 1: Direct { paymentUrl: "..." }
        if (response.data?.paymentUrl) {
            console.log("[Transactions Thunk] ✅ Found paymentUrl in response.data");
            return response.data;
        }
        
        // Case 2: Nested { data: { paymentUrl: "..." } }
        if (response.data?.data?.paymentUrl) {
            console.log("[Transactions Thunk] ✅ Found paymentUrl in response.data.data");
            return response.data.data;
        }
        
        // Case 3: { success: true, data: { paymentUrl: "..." } }
        if (response.data?.success && response.data?.data?.paymentUrl) {
            console.log("[Transactions Thunk] ✅ Found paymentUrl in success response");
            return response.data.data;
        }
        
        // Case 4: Response is the URL itself (string)
        if (typeof response.data === 'string' && response.data.startsWith('http')) {
            console.log("[Transactions Thunk] ✅ Response is direct URL string");
            return { paymentUrl: response.data };
        }
        
        // If none of the above, log error
        console.error("[Transactions Thunk] ❌ Cannot find paymentUrl in response");
        console.error("[Transactions Thunk] Response structure:", JSON.stringify(response.data, null, 2));
        
        throw new Error(`Backend response does not contain paymentUrl. Response: ${JSON.stringify(response.data)}`);
    } catch (error: any) {
        console.error("[Transactions Thunk] ❌ Error creating VNPay URL:", error);
        console.error("[Transactions Thunk] Error type:", error?.constructor?.name);
        console.error("[Transactions Thunk] Error message:", error?.message);
        console.error("[Transactions Thunk] Error response:", error?.response);
        console.error("[Transactions Thunk] Error response data:", error?.response?.data);
        console.error("[Transactions Thunk] Error response status:", error?.response?.status);
        
        const errorResponse: ErrorResponse = {
            message: error.response?.data?.message || 
                     error.response?.data?.error || 
                     error.message || 
                     "Failed to create VNPay URL",
            status: error.response?.status?.toString() || "500",
        };
        
        console.error("[Transactions Thunk] Returning error response:", errorResponse);
        return thunkAPI.rejectWithValue(errorResponse);
    }
});

/**
 * Get transaction by booking ID
 */
export const getTransactionByBooking = createAsyncThunk<
    Payment,
    string,
    { rejectValue: ErrorResponse }
>("transactions/getTransactionByBooking", async (bookingId, thunkAPI) => {
    try {
        console.log("Getting transaction for booking:", bookingId);
        const response = await axiosPrivate.get(GET_TRANSACTION_BY_BOOKING_API(bookingId));
        
        console.log("Transaction retrieved successfully:", response.data);
        return response.data;
    } catch (error: any) {
        console.error("Error getting transaction:", error);
        const errorResponse: ErrorResponse = {
            message: error.response?.data?.message || error.message || "Failed to get transaction",
            status: error.response?.status?.toString() || "500",
        };
        return thunkAPI.rejectWithValue(errorResponse);
    }
});

/**
 * Update transaction status (admin/staff only)
 */
export const updateTransactionStatus = createAsyncThunk<
    Payment,
    { transactionId: string; payload: UpdatePaymentStatusPayload },
    { rejectValue: ErrorResponse }
>("transactions/updateTransactionStatus", async ({ transactionId, payload }, thunkAPI) => {
    try {
        console.log("Updating transaction status:", transactionId, payload);
        const response = await axiosPrivate.patch(
            UPDATE_TRANSACTION_STATUS_API(transactionId),
            payload
        );
        
        console.log("Transaction status updated successfully:", response.data);
        return response.data;
    } catch (error: any) {
        console.error("Error updating transaction status:", error);
        const errorResponse: ErrorResponse = {
            message: error.response?.data?.message || error.message || "Failed to update transaction status",
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
    'transactions/verifyVNPayPayment',
    async (queryString, thunkAPI) => {
        try {
            console.log('[Transactions Thunk] Verifying VNPay payment');
            console.log('[Transactions Thunk] Received query string length:', queryString.length);
            
            // Parse and log query params to help debug
            const queryParams = new URLSearchParams(queryString.startsWith('?') ? queryString.slice(1) : queryString);
            const paramKeys = Array.from(queryParams.keys());
            console.log('[Transactions Thunk] Received query params:', paramKeys);
            
            // Check for essential VNPay params
            const hasSecureHash = queryParams.has('vnp_SecureHash');
            const hasTxnRef = queryParams.has('vnp_TxnRef');
            const hasResponseCode = queryParams.has('vnp_ResponseCode');
            
            if (!hasSecureHash) {
                console.error('[Transactions Thunk] ❌ Missing vnp_SecureHash in query params');
                console.error('[Transactions Thunk] Available params:', paramKeys);
            } else {
                console.log('[Transactions Thunk] ✅ Found vnp_SecureHash');
            }
            
            if (!hasTxnRef) {
                console.warn('[Transactions Thunk] ⚠️ Missing vnp_TxnRef in query params');
            }
            if (!hasResponseCode) {
                console.warn('[Transactions Thunk] ⚠️ Missing vnp_ResponseCode in query params');
            }

            const cleanQuery = queryString.startsWith('?') ? queryString.slice(1) : queryString;

            console.log('[Transactions Thunk] Calling verify endpoint with', cleanQuery.length, 'characters');
            const response = await axiosPrivate.get(`${VERIFY_VNPAY_API}?${cleanQuery}`);
            console.log('[Transactions Thunk] ✅ Verification successful');
            console.log('[Transactions Thunk] Response data:', response.data);
            console.log('[Transactions Thunk] Response data type:', typeof response.data);
            console.log('[Transactions Thunk] Response data keys:', Object.keys(response.data || {}));
            
            // Handle different response structures (similar to createVNPayUrl)
            let verificationResult = response.data;
            
            // Case 1: Direct response
            if (verificationResult?.success !== undefined || verificationResult?.paymentStatus !== undefined) {
                console.log('[Transactions Thunk] ✅ Found verification data in response.data');
            }
            // Case 2: Nested in data property
            else if (response.data?.data) {
                console.log('[Transactions Thunk] ✅ Found verification data in response.data.data');
                verificationResult = response.data.data;
            }
            // Case 3: Wrapped in success response
            else if (response.data?.success && response.data?.data) {
                console.log('[Transactions Thunk] ✅ Found verification data in response.data.data (nested success)');
                verificationResult = response.data.data;
            }
            
            console.log('[Transactions Thunk] Final verification result:', {
                success: verificationResult?.success,
                paymentStatus: verificationResult?.paymentStatus,
                bookingId: verificationResult?.bookingId,
                message: verificationResult?.message,
                fullResult: verificationResult
            });
            
            return verificationResult;
        } catch (error: any) {
            console.error('[Transactions Thunk] ❌ Verification error:', error);
            const errorResponse = {
                message: error.response?.data?.message || error.message || 'Failed to verify payment',
                status: error.response?.status?.toString() || '500',
            };
            return thunkAPI.rejectWithValue(errorResponse);
        }
    }
);

/**
 * Query VNPay transaction status
 * For admin to check transaction details from VNPay
 */
export const queryVNPayTransaction = createAsyncThunk<
    any,
    { orderId: string; transactionDate: string },
    { rejectValue: ErrorResponse }
>("transactions/queryVNPayTransaction", async (payload, thunkAPI) => {
    try {
        console.log('[Transactions Thunk] Querying VNPay transaction:', payload);
        
        const response = await axiosPrivate.post(
            QUERY_VNPAY_TRANSACTION_API,
            payload
        );
        
        console.log('[Transactions Thunk] ✅ Query successful:', response.data);
        return response.data;
    } catch (error: any) {
        console.error('[Transactions Thunk] ❌ Query error:', error);
        return thunkAPI.rejectWithValue({
            message: error.response?.data?.message || "Failed to query transaction",
            status: error.response?.status?.toString() || "500",
        });
    }
});

/**
 * Process VNPay refund
 * For admin to process refund via VNPay API
 */
export const processVNPayRefund = createAsyncThunk<
    any,
    {
        orderId: string;
        transactionDate: string;
        amount: number;
        transactionType: '02' | '03'; // 02: Full, 03: Partial
        createdBy: string;
        reason?: string;
    },
    { rejectValue: ErrorResponse }
>("transactions/processVNPayRefund", async (payload, thunkAPI) => {
    try {
        console.log('[Transactions Thunk] Processing VNPay refund:', payload);
        
        const response = await axiosPrivate.post(VNPAY_REFUND_API, payload);
        
        console.log('[Transactions Thunk] ✅ Refund processed:', response.data);
        return response.data;
    } catch (error: any) {
        console.error('[Transactions Thunk] ❌ Refund error:', error);
        return thunkAPI.rejectWithValue({
            message: error.response?.data?.message || "Failed to process refund",
            status: error.response?.status?.toString() || "500",
        });
    }
});

// Export legacy aliases for backward compatibility
export const getPaymentByBooking = getTransactionByBooking;
export const updatePaymentStatus = updateTransactionStatus;

