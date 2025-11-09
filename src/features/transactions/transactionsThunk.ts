import { createAsyncThunk } from "@reduxjs/toolkit";
import type {
    Payment,
    CreateVNPayUrlPayload,
    CreateVNPayUrlResponse,
    UpdatePaymentStatusPayload,
    ErrorResponse,
    CreatePayOSPaymentPayload,
    PayOSPaymentLinkResponse,
    PayOSVerificationResult,
    PayOSQueryResult,
    CancelPayOSPaymentResponse,
} from "../../types/payment-type";
import axiosPrivate from "../../utils/axios/axiosPrivate";
import {
    CREATE_VNPAY_URL_API,
    GET_TRANSACTION_BY_BOOKING_API,
    UPDATE_TRANSACTION_STATUS_API,
    VERIFY_VNPAY_API,
    QUERY_VNPAY_TRANSACTION_API,
    VNPAY_REFUND_API,
    CREATE_PAYOS_PAYMENT_API,
    PAYOS_RETURN_API,
    QUERY_PAYOS_TRANSACTION_API,
    CANCEL_PAYOS_PAYMENT_API,
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

// ============================================
// PayOS Payment Thunks
// ============================================

/**
 * Create PayOS payment link
 * This creates a payment link and returns checkout URL for user to pay
 */
export const createPayOSPayment = createAsyncThunk<
    PayOSPaymentLinkResponse,
    CreatePayOSPaymentPayload,
    { rejectValue: ErrorResponse }
>("transactions/createPayOSPayment", async (payload, thunkAPI) => {
    try {
        console.log("[PayOS Thunk] Creating PayOS payment:", payload);
        
        const response = await axiosPrivate.post(CREATE_PAYOS_PAYMENT_API, payload);
        const responseData = response.data;
        
        console.log("[PayOS Thunk] ✅ Raw payment link response:", responseData);

        // Some backends wrap the payload in { success, data } or nested data objects.
        // Normalize the response so the component layer always receives the expected shape.
        let normalized: any = responseData;

        if (responseData?.data?.checkoutUrl) {
            normalized = responseData.data;
        } else if (responseData?.success && responseData?.data) {
            normalized = responseData.data;
        }

        if (!normalized?.checkoutUrl) {
            console.error("[PayOS Thunk] ❌ Missing checkoutUrl in normalized payload");
            throw new Error(
                `Backend response does not contain checkoutUrl. Response: ${JSON.stringify(responseData)}`
            );
        }

        // Ensure required fields exist per guide
        const rawOrderCode = normalized.orderCode ?? responseData?.orderCode;
        const parsedOrderCode = typeof rawOrderCode === "string" ? Number(rawOrderCode) : rawOrderCode;

        const rawAmount = normalized.amount ?? responseData?.amount ?? payload.amount;
        const parsedAmount = typeof rawAmount === "string" ? Number(rawAmount) : rawAmount;

        const safeOrderCode =
            typeof parsedOrderCode === "number" && Number.isFinite(parsedOrderCode)
                ? parsedOrderCode
                : 0;
        const safeAmount =
            typeof parsedAmount === "number" && Number.isFinite(parsedAmount)
                ? parsedAmount
                : payload.amount;

        const normalizedPayload: PayOSPaymentLinkResponse = {
            paymentLinkId: normalized.paymentLinkId ?? responseData?.paymentLinkId ?? "",
            checkoutUrl: normalized.checkoutUrl,
            qrCodeUrl: normalized.qrCodeUrl ?? responseData?.qrCodeUrl,
            orderCode: safeOrderCode,
            amount: safeAmount,
            status: normalized.status ?? responseData?.status ?? "PENDING",
        };

        if (!normalizedPayload.paymentLinkId) {
            console.warn("[PayOS Thunk] ⚠️ paymentLinkId missing from response payload");
        }
        if (!Number.isFinite(normalizedPayload.orderCode)) {
            console.warn("[PayOS Thunk] ⚠️ orderCode missing or invalid in response payload");
        }
        if (!Number.isFinite(normalizedPayload.amount)) {
            console.warn("[PayOS Thunk] ⚠️ amount missing or invalid in response payload");
        }

        console.log("[PayOS Thunk] ✅ Normalized PayOS payload:", normalizedPayload);

        return normalizedPayload;
    } catch (error: any) {
        console.error("[PayOS Thunk] ❌ Error creating PayOS payment:", error);
        console.error("[PayOS Thunk] Error response:", error.response?.data);
        console.error("[PayOS Thunk] Error status:", error.response?.status);
        
        // Extract error message from various possible locations
        let errorMessage = "Failed to create PayOS payment";
        
        if (error.response?.data) {
            const responseData = error.response.data;
            // Try multiple possible error message fields
            errorMessage = responseData.message || 
                          responseData.error || 
                          responseData.desc ||
                          (typeof responseData === 'string' ? responseData : errorMessage);
        } else if (error.message) {
            errorMessage = error.message;
        }
        
        const errorResponse: ErrorResponse = {
            message: errorMessage,
            status: error.response?.status?.toString() || "500",
        };
        
        return thunkAPI.rejectWithValue(errorResponse);
    }
});

/**
 * Verify PayOS payment after return from PayOS checkout
 * Called when user is redirected back from PayOS payment page
 */
export const verifyPayOSPayment = createAsyncThunk<
    PayOSVerificationResult,
    string,
    { rejectValue: ErrorResponse }
>("transactions/verifyPayOSPayment", async (queryString, thunkAPI) => {
    try {
        console.log("[PayOS Thunk] Verifying PayOS payment with query:", queryString);
        
        // Send the complete query string to backend for verification
        const response = await axiosPrivate.get(`${PAYOS_RETURN_API}${queryString}`);
        const responseData = response.data;
        
        console.log("[PayOS Thunk] ✅ Raw verification response:", responseData);

        let normalized: any = responseData;

        if (responseData?.data?.paymentStatus) {
            normalized = responseData.data;
        } else if (responseData?.success !== undefined && responseData?.data) {
            normalized = responseData.data;
        }

        if (!normalized || normalized.paymentStatus === undefined) {
            console.error("[PayOS Thunk] ❌ Missing paymentStatus in verification payload");
            throw new Error(
                `Backend response does not contain paymentStatus. Response: ${JSON.stringify(responseData)}`
            );
        }

        const normalizedPayload: PayOSVerificationResult = {
            success: normalized.success ?? responseData?.success ?? false,
            paymentStatus: normalized.paymentStatus,
            bookingId: normalized.bookingId ?? responseData?.bookingId ?? "",
            message: normalized.message ?? responseData?.message ?? "",
            reason: normalized.reason ?? responseData?.reason,
            orderCode: normalized.orderCode ?? responseData?.orderCode,
            reference: normalized.reference ?? responseData?.reference,
            amount: normalized.amount ?? responseData?.amount ?? 0,
        };
        
        console.log("[PayOS Thunk] ✅ Normalized verification result:", normalizedPayload);
        return normalizedPayload;
    } catch (error: any) {
        console.error("[PayOS Thunk] ❌ Error verifying PayOS payment:", error);
        
        const errorResponse: ErrorResponse = {
            message: error.response?.data?.message || 
                     error.response?.data?.error || 
                     error.message || 
                     "Failed to verify PayOS payment",
            status: error.response?.status?.toString() || "500",
        };
        
        return thunkAPI.rejectWithValue(errorResponse);
    }
});

/**
 * Query PayOS transaction status by order code
 * Used to check payment status after creation
 */
export const queryPayOSTransaction = createAsyncThunk<
    PayOSQueryResult,
    number,
    { rejectValue: ErrorResponse }
>("transactions/queryPayOSTransaction", async (orderCode, thunkAPI) => {
    try {
        console.log("[PayOS Thunk] Querying transaction for order code:", orderCode);
        
        const response = await axiosPrivate.get(QUERY_PAYOS_TRANSACTION_API(orderCode));
        const responseData = response.data;
        
        console.log("[PayOS Thunk] ✅ Raw transaction status response:", responseData);

        let normalized: any = responseData;

        if (responseData?.data?.status) {
            normalized = responseData.data;
        } else if (responseData?.success && responseData?.data) {
            normalized = responseData.data;
        }

        if (!normalized || normalized.status === undefined) {
            console.error("[PayOS Thunk] ❌ Missing status in PayOS query response");
            throw new Error(
                `Backend response does not contain transaction status. Response: ${JSON.stringify(responseData)}`
            );
        }
        
        const normalizedPayload: PayOSQueryResult = {
            orderCode: normalized.orderCode ?? responseData?.orderCode ?? orderCode,
            amount: normalized.amount ?? responseData?.amount ?? 0,
            description: normalized.description ?? responseData?.description ?? "",
            status: normalized.status,
            accountNumber: normalized.accountNumber ?? responseData?.accountNumber,
            reference: normalized.reference ?? responseData?.reference,
            transactionDateTime: normalized.transactionDateTime ?? responseData?.transactionDateTime,
            createdAt: normalized.createdAt ?? responseData?.createdAt ?? Date.now(),
            cancelledAt: normalized.cancelledAt ?? responseData?.cancelledAt,
        };
        
        console.log("[PayOS Thunk] ✅ Normalized transaction status:", normalizedPayload);
        return normalizedPayload;
    } catch (error: any) {
        console.error("[PayOS Thunk] ❌ Error querying transaction:", error);
        
        const errorResponse: ErrorResponse = {
            message: error.response?.data?.message || 
                     error.response?.data?.error || 
                     error.message || 
                     "Failed to query PayOS transaction",
            status: error.response?.status?.toString() || "500",
        };
        
        return thunkAPI.rejectWithValue(errorResponse);
    }
});

/**
 * Cancel PayOS payment by order code
 * Used when user wants to cancel pending payment
 */
export const cancelPayOSPayment = createAsyncThunk<
    CancelPayOSPaymentResponse,
    { orderCode: number; cancellationReason?: string },
    { rejectValue: ErrorResponse }
>("transactions/cancelPayOSPayment", async ({ orderCode, cancellationReason }, thunkAPI) => {
    try {
        console.log("[PayOS Thunk] Cancelling payment for order code:", orderCode);
        
        const response = await axiosPrivate.post(
            CANCEL_PAYOS_PAYMENT_API(orderCode),
            { cancellationReason }
        );
        const responseData = response.data;
        
        console.log("[PayOS Thunk] ✅ Raw cancel response:", responseData);

        let normalized: any = responseData;

        if (responseData?.data?.status) {
            normalized = responseData.data;
        } else if (responseData?.success && responseData?.data) {
            normalized = responseData.data;
        }

        if (!normalized || normalized.status !== 'CANCELLED') {
            console.warn("[PayOS Thunk] ⚠️ Unexpected cancel response payload:", normalized);
        }

        const normalizedPayload: CancelPayOSPaymentResponse = {
            orderCode: normalized.orderCode ?? responseData?.orderCode ?? orderCode,
            status: normalized.status ?? 'CANCELLED',
            message: normalized.message ?? responseData?.message ?? 'Transaction cancelled',
        };
        
        console.log("[PayOS Thunk] ✅ Normalized cancel response:", normalizedPayload);
        return normalizedPayload;
    } catch (error: any) {
        console.error("[PayOS Thunk] ❌ Error cancelling payment:", error);
        
        const errorResponse: ErrorResponse = {
            message: error.response?.data?.message || 
                     error.response?.data?.error || 
                     error.message || 
                     "Failed to cancel PayOS payment",
            status: error.response?.status?.toString() || "500",
        };
        
        return thunkAPI.rejectWithValue(errorResponse);
    }
});

// Export legacy aliases for backward compatibility
export const getPaymentByBooking = getTransactionByBooking;
export const updatePaymentStatus = updateTransactionStatus;

