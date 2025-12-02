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
    GetMyBookingsParams,
    MyBookingsResponse,
    MyInvoicesResponse,
    UpcomingBooking,
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
    GET_MY_BOOKINGS_API,
    GET_MY_INVOICES_API,
    GET_UPCOMING_BOOKING_API,
    GET_COACH_SCHEDULE_API,
    SET_COACH_HOLIDAY_API,
} from "./bookingAPI";

/**
 * Get my invoices
 */
export const getMyInvoices = createAsyncThunk<
    MyInvoicesResponse,
    { page?: number; limit?: number; status?: string; type?: string },
    { rejectValue: ErrorResponse }
>("booking/getMyInvoices", async (params, thunkAPI) => {
    try {
        console.log("Getting my invoices with params:", params);

        const queryParams = new URLSearchParams();
        if (params?.page) queryParams.append('page', params.page.toString());
        if (params?.limit) queryParams.append('limit', params.limit.toString());
        if (params?.status) queryParams.append('status', params.status);
        if (params?.type) queryParams.append('type', params.type);

        const url = queryParams.toString() ? `${GET_MY_INVOICES_API}?${queryParams.toString()}` : GET_MY_INVOICES_API;
        const response = await axiosPrivate.get(url);

        console.log("My invoices response:", response.data);

        const responseData = response.data;
        // Support envelope: { success: true, data: { invoices, pagination } }
        if (responseData?.success && responseData?.data && responseData.data.invoices) {
            return {
                invoices: responseData.data.invoices,
                pagination: responseData.data.pagination || null,
            };
        }

        // Support direct response: { invoices, pagination }
        if (responseData?.invoices && Array.isArray(responseData.invoices)) {
            return {
                invoices: responseData.invoices,
                pagination: responseData.pagination || null,
            };
        }

        // Fallback: empty
        return {
            invoices: [],
            pagination: null,
        };
    } catch (error: any) {
        console.error("Error getting my invoices:", error);
        const errorResponse: ErrorResponse = {
            message: error.response?.data?.message || error.message || "Failed to get my invoices",
            status: error.response?.status?.toString() || "500",
        };
        return thunkAPI.rejectWithValue(errorResponse);
    }
});

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
 * Get my bookings
 */
export const getMyBookings = createAsyncThunk<
    MyBookingsResponse,
    GetMyBookingsParams,
    { rejectValue: ErrorResponse }
>("booking/getMyBookings", async (params, thunkAPI) => {
    try {
        console.log("Getting my bookings with params:", params);
        
        // Build query string
        const queryParams = new URLSearchParams();
        if (params.status) queryParams.append('status', params.status);
        if (params.type) queryParams.append('type', params.type);
        if (params.page) queryParams.append('page', params.page.toString());
        if (params.limit) queryParams.append('limit', params.limit.toString());
        
        const url = queryParams.toString() 
            ? `${GET_MY_BOOKINGS_API}?${queryParams.toString()}`
            : GET_MY_BOOKINGS_API;
            
        const response = await axiosPrivate.get(url);
        
        console.log("My bookings retrieved successfully:", response.data);
        console.log("Response data type:", typeof response.data);
        console.log("Is array:", Array.isArray(response.data));
        
        // Handle API response format: { success: true, data: { bookings: [...], pagination: {...} } }
        const responseData = response.data;
        if (responseData?.success && responseData?.data?.bookings) {
            return {
                bookings: responseData.data.bookings,
                pagination: responseData.data.pagination
            };
        }
        
        // Fallback for different response formats
        if (Array.isArray(responseData)) {
            return {
                bookings: responseData,
                pagination: null
            };
        }
        
        if (responseData?.bookings && Array.isArray(responseData.bookings)) {
            return {
                bookings: responseData.bookings,
                pagination: responseData.pagination || null
            };
        }
        
        if (responseData?.data && Array.isArray(responseData.data)) {
            return {
                bookings: responseData.data,
                pagination: null
            };
        }
        
        return {
            bookings: [],
            pagination: null
        };
    } catch (error: any) {
        console.error("Error getting my bookings:", error);
        const errorResponse: ErrorResponse = {
            message: error.response?.data?.message || error.message || "Failed to get my bookings",
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

/**
 * Get upcoming booking for current user
 */
export const getUpcomingBooking = createAsyncThunk<
    UpcomingBooking | null,
    void,
    { rejectValue: ErrorResponse }
>("booking/getUpcomingBooking", async (_, thunkAPI) => {
    try {
        console.log("Getting upcoming booking for current user");
        const response = await axiosPrivate.get(GET_UPCOMING_BOOKING_API);
        const responseData = response.data;

        if (responseData?.success && responseData?.data) {
            return responseData.data as UpcomingBooking;
        }

        if (responseData) {
            return responseData as UpcomingBooking;
        }

        return null;
    } catch (error: any) {
        console.error("Error getting upcoming booking:", error);
        const errorResponse: ErrorResponse = {
            message: error.response?.data?.message || error.message || "Failed to get upcoming booking",
            status: error.response?.status?.toString() || "500",
        };
        return thunkAPI.rejectWithValue(errorResponse);
    }
});