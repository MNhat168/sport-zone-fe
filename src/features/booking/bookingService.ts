import axiosPrivate from "@/utils/axios/axiosPrivate";
import { GET_MY_BOOKINGS_API, CANCEL_FIELD_BOOKING_API } from "./bookingAPI";
import type { GetMyBookingsParams, MyBookingsResponse } from "@/types/booking-type";
import logger from "@/utils/logger";

/**
 * Booking service layer for TanStack Query
 * Wraps API calls for user bookings
 */
export const bookingService = {
    /**
     * Get user's bookings with filters
     */
    getMyBookings: async (params: GetMyBookingsParams): Promise<MyBookingsResponse> => {
        // Build query string
        const queryParams = new URLSearchParams();
        if (params.status) queryParams.append('status', params.status);
        if (params.type) queryParams.append('type', params.type);
        if (params.recurringFilter) queryParams.append('recurringFilter', params.recurringFilter);
        if (params.page) queryParams.append('page', params.page.toString());
        if (params.limit) queryParams.append('limit', params.limit.toString());
        if (params.startDate) queryParams.append('startDate', params.startDate);
        if (params.endDate) queryParams.append('endDate', params.endDate);
        if (params.search) queryParams.append('search', params.search);

        const url = queryParams.toString()
            ? `${GET_MY_BOOKINGS_API}?${queryParams.toString()}`
            : GET_MY_BOOKINGS_API;

        const response = await axiosPrivate.get(url);

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
                pagination: null as any
            };
        }

        if (responseData?.bookings && Array.isArray(responseData.bookings)) {
            return {
                bookings: responseData.bookings,
                pagination: responseData.pagination || (null as any)
            };
        }

        if (responseData?.data && Array.isArray(responseData.data)) {
            return {
                bookings: responseData.data,
                pagination: null as any
            };
        }

        return {
            bookings: [],
            pagination: null as any
        };
    },

    /**
     * Cancel a booking
     */
    cancelBooking: async ({ id, courtId }: { id: string; courtId?: string }): Promise<any> => {
        const payload = courtId ? { courtId } : undefined;
        const response = await axiosPrivate.patch(CANCEL_FIELD_BOOKING_API(id), payload);
        return response.data;
    },

    /**
     * Get booking details by ID
     */
    getBookingDetail: async (bookingId: string): Promise<any> => {
        const response = await axiosPrivate.get(`/bookings/${bookingId}`);
        return response.data.data || response.data;
    },
};
