import { useMutation, useQueryClient } from '@tanstack/react-query';
import { bookingService } from '@/features/booking/bookingService';
import { userBookingsKeys } from '../queries/useUserBookings';
import { toast } from 'sonner';

/**
 * Mutation hook for canceling a booking
 * Automatically invalidates booking list cache on success
 */
export function useCancelBooking() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ bookingId, courtId }: { bookingId: string; courtId?: string }) =>
            bookingService.cancelBooking({ id: bookingId, courtId }),
        onSuccess: () => {
            // Invalidate all booking lists to trigger refetch
            queryClient.invalidateQueries({
                queryKey: userBookingsKeys.all
            });
            toast.success('Đã hủy đặt sân thành công');
        },
        onError: (error: any) => {
            toast.error(error?.message || 'Có lỗi xảy ra khi hủy đặt sân');
        },
    });
}
