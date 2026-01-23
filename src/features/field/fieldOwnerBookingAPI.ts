import axiosPrivate from "@/utils/axios/axiosPrivate";
import {
    GET_MY_FIELDS_BOOKINGS_API,
    OWNER_BOOKING_DETAIL_API,
    OWNER_ACCEPT_BOOKING_API,
    OWNER_REJECT_BOOKING_API,
} from "./fieldAPI";
import type { FieldOwnerBookingsParams, FieldOwnerBookingsResponse } from "@/types/field-type";

/**
 * API service for field owner booking operations
 * This wraps the axios calls and provides a clean interface for React Query
 */
export const fieldOwnerBookingAPI = {
    /**
     * Get field owner bookings with filters and pagination
     */
    async getMyFieldsBookings(params: FieldOwnerBookingsParams = {}): Promise<FieldOwnerBookingsResponse> {
        const queryParams = new URLSearchParams();

        if (params.fieldName) queryParams.append('fieldName', params.fieldName);
        if (params.status) queryParams.append('status', params.status);
        if (params.transactionStatus) queryParams.append('transactionStatus', params.transactionStatus);
        if (params.date) queryParams.append('date', params.date);
        if (params.startDate) queryParams.append('startDate', params.startDate);
        if (params.endDate) queryParams.append('endDate', params.endDate);
        if (params.page) queryParams.append('page', params.page.toString());
        if (params.limit) queryParams.append('limit', params.limit.toString());
        if (params.type) queryParams.append('type', params.type);
        if (params.recurringFilter) queryParams.append('recurringFilter', params.recurringFilter);
        if (params.recurringType) queryParams.append('recurringType', params.recurringType);
        if (params.sortBy) queryParams.append('sortBy', params.sortBy);
        if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

        const url = queryParams.toString()
            ? `${GET_MY_FIELDS_BOOKINGS_API}?${queryParams.toString()}`
            : GET_MY_FIELDS_BOOKINGS_API;

        const response = await axiosPrivate.get(url);
        const raw = response.data;

        // Handle different response formats
        if (raw?.success && raw?.data) {
            return raw as FieldOwnerBookingsResponse;
        } else if (raw?.bookings && raw?.pagination) {
            return {
                success: true,
                data: {
                    bookings: raw.bookings,
                    pagination: raw.pagination
                }
            } as FieldOwnerBookingsResponse;
        }

        return raw as FieldOwnerBookingsResponse;
    },

    /**
     * Get booking detail
     */
    async ownerGetBookingDetail(bookingId: string) {
        const response = await axiosPrivate.get(OWNER_BOOKING_DETAIL_API(bookingId));
        return response.data;
    },

    /**
     * Accept a booking
     */
    async ownerAcceptBooking(bookingId: string) {
        const response = await axiosPrivate.patch(OWNER_ACCEPT_BOOKING_API(bookingId));
        return response.data;
    },

    /**
     * Get cancellation info for owner
     */
    async getOwnerCancellationInfo(bookingId: string) {
        const response = await axiosPrivate.get(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/bookings/${bookingId}/cancellation-info?role=owner`);
        return response.data;
    },

    /**
     * Reject/cancel a booking
     */
    async ownerRejectBooking({ bookingId, reason }: { bookingId: string; reason?: string }) {
        const response = await axiosPrivate.patch(OWNER_REJECT_BOOKING_API(bookingId), reason ? { reason } : {});
        return response.data;
    },
};
