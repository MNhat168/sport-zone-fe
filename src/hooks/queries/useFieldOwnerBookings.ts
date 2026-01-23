import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { fieldOwnerBookingAPI } from '@/features/field/fieldOwnerBookingAPI';
import type { FieldOwnerBookingsParams } from '@/types/field-type';

// Query key factory for field owner bookings
export const fieldOwnerBookingsKeys = {
    all: ['fieldOwnerBookings'] as const,
    lists: () => [...fieldOwnerBookingsKeys.all, 'list'] as const,
    list: (params: FieldOwnerBookingsParams) =>
        [...fieldOwnerBookingsKeys.lists(), params] as const,
    detail: (id: string) => [...fieldOwnerBookingsKeys.all, 'detail', id] as const,
};

/**
 * Hook for fetching field owner bookings with automatic background refetch
 * This replaces the manual polling mechanism in booking pages
 */
export function useFieldOwnerBookings(
    params: FieldOwnerBookingsParams,
    options?: Partial<UseQueryOptions<any, Error, any, any>>
) {
    return useQuery({
        queryKey: fieldOwnerBookingsKeys.list(params),
        queryFn: async () => {
            const response = await fieldOwnerBookingAPI.getMyFieldsBookings(params);
            return response;
        },
        // Only re-render when data or error actually changes
        // This prevents unnecessary renders during background refetch
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
export function useFieldOwnerBookingDetail(
    bookingId: string,
    options?: Partial<UseQueryOptions<any, Error, any, any>>
) {
    return useQuery({
        queryKey: fieldOwnerBookingsKeys.detail(bookingId),
        queryFn: () => fieldOwnerBookingAPI.ownerGetBookingDetail(bookingId),
        enabled: !!bookingId,
        ...options,
    });
}
