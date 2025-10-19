import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { BookingState, ErrorResponse } from "../../types/booking-type";
import {
    createFieldBooking,
    cancelFieldBooking,
    createSessionBooking,
    cancelSessionBooking,
    getCoachBookings,
    getMyBookings,
    getCoachSchedule,
    setCoachHoliday,
} from "./bookingThunk";

const initialState: BookingState = {
    bookings: [],
    currentBooking: null,
    sessionBooking: null,
    coachSchedules: [],
    pagination: null,
    loading: false,
    error: null,
};

const bookingSlice = createSlice({
    name: "booking",
    initialState,
    reducers: {
        // Clear error
        clearError: (state) => {
            state.error = null;
        },
        
        // Reset booking state
        resetBookingState: (state) => {
            state.currentBooking = null;
            state.sessionBooking = null;
            state.error = null;
        },
        
        // Set current booking
        setCurrentBooking: (state, action) => {
            state.currentBooking = action.payload;
        },
        
        // Clear current booking
        clearCurrentBooking: (state) => {
            state.currentBooking = null;
        },
    },
    extraReducers: (builder) => {
        // Create Field Booking
        builder
            .addCase(createFieldBooking.fulfilled, (state, action) => {
                state.loading = false;
                state.currentBooking = action.payload;
                state.bookings.push(action.payload);
            })
            

        // Cancel Field Booking
        builder
            .addCase(cancelFieldBooking.fulfilled, (state, action) => {
                state.loading = false;
                // Update booking in the list
                const index = state.bookings.findIndex(booking => booking._id === action.payload._id);
                if (index !== -1) {
                    state.bookings[index] = action.payload;
                }
                // Update current booking if it's the same one
                if (state.currentBooking?._id === action.payload._id) {
                    state.currentBooking = action.payload;
                }
            })
            

        // Create Session Booking
        builder
            .addCase(createSessionBooking.fulfilled, (state, action) => {
                state.loading = false;
                state.sessionBooking = action.payload;
                // Add both bookings to the list
                state.bookings.push(action.payload.fieldBooking);
                state.bookings.push(action.payload.coachBooking);
            })
            

        // Cancel Session Booking
        builder
            .addCase(cancelSessionBooking.fulfilled, (state, action) => {
                state.loading = false;
                state.sessionBooking = action.payload;
                // Update bookings in the list
                const fieldIndex = state.bookings.findIndex(booking => booking._id === action.payload.fieldBooking._id);
                const coachIndex = state.bookings.findIndex(booking => booking._id === action.payload.coachBooking._id);
                if (fieldIndex !== -1) {
                    state.bookings[fieldIndex] = action.payload.fieldBooking;
                }
                if (coachIndex !== -1) {
                    state.bookings[coachIndex] = action.payload.coachBooking;
                }
            })
            

        // Get Coach Bookings
        builder
            .addCase(getCoachBookings.fulfilled, (state, action) => {
                state.loading = false;
                state.bookings = action.payload;
            })
            

        // Get My Bookings
        builder
            .addCase(getMyBookings.fulfilled, (state, action) => {
                state.loading = false;
                state.bookings = action.payload.bookings;
                state.pagination = action.payload.pagination;
            })
            

        // Get Coach Schedule
        builder
            .addCase(getCoachSchedule.fulfilled, (state, action) => {
                state.loading = false;
                state.coachSchedules = action.payload;
            })
            

        // Set Coach Holiday
        builder
            .addCase(setCoachHoliday.fulfilled, (state) => {
                state.loading = false;
                // Refresh coach schedules might be needed here
            })
            
            // Matchers: unify pending/rejected handling like authentication slice
            .addMatcher(
                (action) => action.type.startsWith("booking/") && action.type.endsWith("/pending"),
                (state) => {
                    state.loading = true;
                    state.error = null;
                }
            )
            .addMatcher(
                (action) => action.type.startsWith("booking/") && action.type.endsWith("/rejected"),
                (state, action: PayloadAction<ErrorResponse>) => {
                    state.loading = false;
                    state.error = action.payload || { message: "Unknown error", status: "500" };
                }
            );
    },
});

export const {
    clearError,
    resetBookingState,
    setCurrentBooking,
    clearCurrentBooking,
} = bookingSlice.actions;

export default bookingSlice.reducer;