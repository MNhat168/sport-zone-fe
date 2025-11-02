import { createSlice } from "@reduxjs/toolkit";
import type { PaymentState } from "../../types/payment-type";
import {
    createVNPayUrl,
    getTransactionByBooking,
    updateTransactionStatus,
} from "./transactionsThunk";
import { verifyVNPayPayment } from "./transactionsThunk";

const initialState: PaymentState = {
    currentPayment: null,
    loading: false,
    error: null,
};

const transactionsSlice = createSlice({
    name: "transactions",
    initialState,
    reducers: {
        clearTransactionError: (state) => {
            state.error = null;
        },
        clearCurrentTransaction: (state) => {
            state.currentPayment = null;
        },
    },
    extraReducers: (builder) => {
        // Create VNPay URL
        builder.addCase(createVNPayUrl.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(createVNPayUrl.fulfilled, (state) => {
            state.loading = false;
        });
        builder.addCase(createVNPayUrl.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload || { message: "Failed to create VNPay URL", status: "500" };
        });

        // Get transaction by booking
        builder.addCase(getTransactionByBooking.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(getTransactionByBooking.fulfilled, (state, action) => {
            state.loading = false;
            state.currentPayment = action.payload;
        });
        builder.addCase(getTransactionByBooking.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload || { message: "Failed to get transaction", status: "500" };
        });

        // Update transaction status
        builder.addCase(updateTransactionStatus.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(updateTransactionStatus.fulfilled, (state, action) => {
            state.loading = false;
            state.currentPayment = action.payload;
        });
        builder.addCase(updateTransactionStatus.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload || { message: "Failed to update transaction status", status: "500" };
        });

        // Verify VNPay Payment (NEW)
        builder.addCase(verifyVNPayPayment.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(verifyVNPayPayment.fulfilled, (state) => {
            state.loading = false;
        });
        builder.addCase(verifyVNPayPayment.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload || { message: "Verification failed", status: "500" };
        });
    },
});

export const { clearTransactionError, clearCurrentTransaction } = transactionsSlice.actions;

// Export legacy aliases for backward compatibility
export const clearPaymentError = clearTransactionError;
export const clearCurrentPayment = clearCurrentTransaction;

export default transactionsSlice.reducer;

