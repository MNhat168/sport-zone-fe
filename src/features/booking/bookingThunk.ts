import { createAsyncThunk } from "@reduxjs/toolkit";
import type {
    Booking,
    SessionBookingResponse,
    CoachSchedule,
    CreateFieldBookingPayload,
    CreateSessionBookingPayload,
    CancelBookingPayload,
    CancelSessionBookingPayload,
    SetCoachHolidayPayload,
    GetCoachScheduleParams,
    ErrorResponse,
} from "../../types/booking-type";
import axiosPrivate from "../../utils/axios/axiosPrivate";
import axiosPublic from "../../utils/axios/axiosPublic";
import {
    CREATE_FIELD_BOOKING_API,
    CANCEL_FIELD_BOOKING_API,
    CREATE_SESSION_BOOKING_API,
    CANCEL_SESSION_BOOKING_API,
    GET_COACH_BOOKINGS_API,
    GET_COACH_SCHEDULE_API,
    SET_COACH_HOLIDAY_API,
} from "./bookingAPI";

/**
 * Create field booking
 */
export const createFieldBooking = createAsyncThunk<
    Booking,
    CreateFieldBookingPayload,
    { rejectValue: ErrorResponse }
>("booking/createFieldBooking", async (payload, thunkAPI) => {
    try {
        console.log("Creating field booking:", payload);
        const response = await axiosPrivate.post(CREATE_FIELD_BOOKING_API, payload);
        
        console.log("Field booking created successfully:", response.data);
        return response.data;
    } catch (error: any) {
        console.error("Error creating field booking:", error);
        const errorResponse: ErrorResponse = {
            message: error.response?.data?.message || error.message || "Failed to create field booking",
            status: error.response?.status?.toString() || "500",
        };
        return thunkAPI.rejectWithValue(errorResponse);
    }
});

/**
 * Cancel field booking
 */
export const cancelFieldBooking = createAsyncThunk<
    Booking,
    { id: string; payload?: CancelBookingPayload },
    { rejectValue: ErrorResponse }
>("booking/cancelFieldBooking", async ({ id, payload }, thunkAPI) => {
    try {
        console.log("Cancelling field booking:", id, payload);
        const response = await axiosPrivate.patch(CANCEL_FIELD_BOOKING_API(id), payload);
        
        console.log("Field booking cancelled successfully:", response.data);
        return response.data;
    } catch (error: any) {
        console.error("Error cancelling field booking:", error);
        const errorResponse: ErrorResponse = {
            message: error.response?.data?.message || error.message || "Failed to cancel field booking",
            status: error.response?.status?.toString() || "500",
        };
        return thunkAPI.rejectWithValue(errorResponse);
    }
});

/**
 * Create session booking (field + coach)
 */
export const createSessionBooking = createAsyncThunk<
    SessionBookingResponse,
    CreateSessionBookingPayload,
    { rejectValue: ErrorResponse }
>("booking/createSessionBooking", async (payload, thunkAPI) => {
    try {
        console.log("Creating session booking:", payload);
        const response = await axiosPrivate.post(CREATE_SESSION_BOOKING_API, payload);
        
        console.log("Session booking created successfully:", response.data);
        return response.data;
    } catch (error: any) {
        console.error("Error creating session booking:", error);
        const errorResponse: ErrorResponse = {
            message: error.response?.data?.message || error.message || "Failed to create session booking",
            status: error.response?.status?.toString() || "500",
        };
        return thunkAPI.rejectWithValue(errorResponse);
    }
});

/**
 * Cancel session booking (field + coach)
 */
export const cancelSessionBooking = createAsyncThunk<
    SessionBookingResponse,
    CancelSessionBookingPayload,
    { rejectValue: ErrorResponse }
>("booking/cancelSessionBooking", async (payload, thunkAPI) => {
    try {
        console.log("Cancelling session booking:", payload);
        const response = await axiosPrivate.patch(CANCEL_SESSION_BOOKING_API, payload);
        
        console.log("Session booking cancelled successfully:", response.data);
        return response.data;
    } catch (error: any) {
        console.error("Error cancelling session booking:", error);
        const errorResponse: ErrorResponse = {
            message: error.response?.data?.message || error.message || "Failed to cancel session booking",
            status: error.response?.status?.toString() || "500",
        };
        return thunkAPI.rejectWithValue(errorResponse);
    }
});

/**
 * Get coach bookings
 */
export const getCoachBookings = createAsyncThunk<
    Booking[],
    string,
    { rejectValue: ErrorResponse }
>("booking/getCoachBookings", async (coachId, thunkAPI) => {
    try {
        console.log("Getting coach bookings for:", coachId);
        const response = await axiosPublic.get(GET_COACH_BOOKINGS_API(coachId));
        
        console.log("Coach bookings retrieved successfully:", response.data);
        return response.data;
    } catch (error: any) {
        console.error("Error getting coach bookings:", error);
        const errorResponse: ErrorResponse = {
            message: error.response?.data?.message || error.message || "Failed to get coach bookings",
            status: error.response?.status?.toString() || "500",
        };
        return thunkAPI.rejectWithValue(errorResponse);
    }
});

/**
 * Get coach schedule by date range
 */
export const getCoachSchedule = createAsyncThunk<
    CoachSchedule[],
    GetCoachScheduleParams,
    { rejectValue: ErrorResponse }
>("booking/getCoachSchedule", async ({ coachId, startDate, endDate }, thunkAPI) => {
    try {
        console.log("Getting coach schedule:", { coachId, startDate, endDate });
        const url = `${GET_COACH_SCHEDULE_API(coachId)}?startDate=${startDate}&endDate=${endDate}`;
        const response = await axiosPublic.get(url);
        
        console.log("Coach schedule retrieved successfully:", response.data);
        return response.data;
    } catch (error: any) {
        console.error("Error getting coach schedule:", error);
        const errorResponse: ErrorResponse = {
            message: error.response?.data?.message || error.message || "Failed to get coach schedule",
            status: error.response?.status?.toString() || "500",
        };
        return thunkAPI.rejectWithValue(errorResponse);
    }
});

/**
 * Set coach holiday
 */
export const setCoachHoliday = createAsyncThunk<
    { modifiedCount: number },
    SetCoachHolidayPayload,
    { rejectValue: ErrorResponse }
>("booking/setCoachHoliday", async (payload, thunkAPI) => {
    try {
        console.log("Setting coach holiday:", payload);
        const response = await axiosPrivate.post(SET_COACH_HOLIDAY_API, payload);
        
        console.log("Coach holiday set successfully:", response.data);
        return response.data;
    } catch (error: any) {
        console.error("Error setting coach holiday:", error);
        const errorResponse: ErrorResponse = {
            message: error.response?.data?.message || error.message || "Failed to set coach holiday",
            status: error.response?.status?.toString() || "500",
        };
        return thunkAPI.rejectWithValue(errorResponse);
    }
});