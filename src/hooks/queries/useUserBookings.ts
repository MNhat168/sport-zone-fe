import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { bookingService } from '@/features/booking/bookingService';
import type { GetMyBookingsParams, MyBookingsResponse } from '@/types/booking-type';

// Query key factory for user bookings
export const userBookingsKeys = {
    all: ['userBookings'] as const,
    lists: () => [...userBookingsKeys.all, 'list'] as const,
    list: (params: GetMyBookingsParams) =>
        [...userBookingsKeys.lists(), params] as const,
    detail: (id: string) => [...userBookingsKeys.all, 'detail', id] as const,
};

/**
 * Hook for fetching user bookings with automatic background refetch
 * Replaces getMyBookings thunk
 */
export function useUserBookings(
    params: GetMyBookingsParams,
    options?: Partial<UseQueryOptions<MyBookingsResponse, Error, MyBookingsResponse, any>>
) {
    return useQuery({
        queryKey: userBookingsKeys.list(params),
        queryFn: async () => {
            const response = await bookingService.getMyBookings(params);
            return response;
        },
        // Only re-render when data or error actually changes
        notifyOnChangeProps: ['data', 'error'] as const,
        // Automatic background refetch every 30 seconds
        refetchInterval: 30000,
        // Don't refetch in background when window is not focused
        refetchIntervalInBackground: false,
        // Keep previous data while fetching new data (no loading flicker)
        placeholderData: (previousData) => previousData,
        ...options,
    });
}

/**
 * Hook for fetching single booking details
 */
export function useUserBookingDetail(
    bookingId: string,
    options?: Partial<UseQueryOptions<any, Error, any, any>>
) {
    return useQuery({
        queryKey: userBookingsKeys.detail(bookingId),
        queryFn: () => bookingService.getBookingDetail(bookingId),
        enabled: !!bookingId,
        ...options,
    });
}
