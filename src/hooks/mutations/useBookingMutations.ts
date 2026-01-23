import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fieldOwnerBookingAPI } from '@/features/field/fieldOwnerBookingAPI';
import { fieldOwnerBookingsKeys } from '../queries/useFieldOwnerBookings';
import { toast } from 'sonner';

/**
 * Mutation hook for accepting a booking
 * Automatically invalidates booking list cache on success
 */
export function useAcceptBooking() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (bookingId: string) => fieldOwnerBookingAPI.ownerAcceptBooking(bookingId),
        onSuccess: () => {
            // Invalidate all booking lists to trigger refetch
            queryClient.invalidateQueries({
                queryKey: fieldOwnerBookingsKeys.all
            });
            toast.success('Đã chấp nhận đặt chỗ');
        },
        onError: (error: any) => {
            toast.error(error?.message || 'Có lỗi xảy ra khi chấp nhận đặt chỗ');
        },
    });
}

/**
 * Mutation hook for rejecting/canceling a booking
 * Automatically invalidates booking list cache on success
 */
export function useRejectBooking() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ bookingId }: { bookingId: string }) =>
            fieldOwnerBookingAPI.ownerRejectBooking({ bookingId }),
        onSuccess: () => {
            // Invalidate all booking lists to trigger refetch
            queryClient.invalidateQueries({
                queryKey: fieldOwnerBookingsKeys.all
            });
            toast.success('Đã từ chối đặt chỗ');
        },
        onError: (error: any) => {
            toast.error(error?.message || 'Có lỗi xảy ra khi từ chối đặt chỗ');
        },
    });
}
