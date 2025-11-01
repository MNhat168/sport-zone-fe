import { createSlice } from "@reduxjs/toolkit";
import type { PaymentState } from "../../types/payment-type";
import {
    createVNPayUrl,
    getPaymentByBooking,
    updatePaymentStatus,
} from "./paymentThunk";
import { verifyVNPayPayment } from "./paymentThunk";

const initialState: PaymentState = {
    currentPayment: null,
    loading: false,
    error: null,
};

const paymentSlice = createSlice({
    name: "payment",
    initialState,
    reducers: {
        clearPaymentError: (state) => {
            state.error = null;
        },
        clearCurrentPayment: (state) => {
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

        // Get payment by booking
        builder.addCase(getPaymentByBooking.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(getPaymentByBooking.fulfilled, (state, action) => {
            state.loading = false;
            state.currentPayment = action.payload;
        });
        builder.addCase(getPaymentByBooking.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload || { message: "Failed to get payment", status: "500" };
        });

        // Update payment status
        builder.addCase(updatePaymentStatus.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(updatePaymentStatus.fulfilled, (state, action) => {
            state.loading = false;
            state.currentPayment = action.payload;
        });
        builder.addCase(updatePaymentStatus.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload || { message: "Failed to update payment status", status: "500" };
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

export const { clearPaymentError, clearCurrentPayment } = paymentSlice.actions;
export default paymentSlice.reducer;

