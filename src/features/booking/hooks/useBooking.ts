import { useAppSelector, useAppDispatch } from '@/store/hook';
import { 
    createFieldBooking, 
    cancelFieldBooking, 
    createSessionBooking, 
    getCoachSchedule 
} from '../bookingThunk';
import { clearError, resetBookingState, setCurrentBooking } from '../bookingSlice';
import type { 
    CreateFieldBookingPayload, 
    CreateSessionBookingPayload, 
    Booking 
} from '@/types/booking-type';

/**
 * Custom hook for booking operations
 * Provides booking state, actions, and async operations
 */
export const useBooking = () => {
    const dispatch = useAppDispatch();
    const bookingState = useAppSelector((state) => state.booking);

    /**
     * Create a field booking
     * @param payload - Booking data payload
     * @returns Promise with booking result
     */
    const handleCreateFieldBooking = async (payload: CreateFieldBookingPayload) => {
        try {
            const result = await dispatch(createFieldBooking(payload));
            return result;
        } catch (error) {
            console.error('Error creating field booking:', error);
            throw error;
        }
    };

    /**
     * Cancel a field booking
     * @param bookingId - ID of booking to cancel
     * @returns Promise with cancellation result
     */
    const handleCancelFieldBooking = async (bookingId: string) => {
        try {
            const result = await dispatch(cancelFieldBooking({ id: bookingId }));
            return result;
        } catch (error) {
            console.error('Error canceling field booking:', error);
            throw error;
        }
    };

    /**
     * Create a session booking (for coaching sessions)
     * @param payload - Session booking data
     * @returns Promise with booking result
     */
    const handleCreateSessionBooking = async (payload: CreateSessionBookingPayload) => {
        try {
            const result = await dispatch(createSessionBooking(payload));
            return result;
        } catch (error) {
            console.error('Error creating session booking:', error);
            throw error;
        }
    };

    /**
     * Get coach schedule
     * @param coachId - ID of the coach
     * @returns Promise with schedule data
     */
    const handleGetCoachSchedule = async (coachId: string) => {
        try {
            const result = await dispatch(getCoachSchedule({ coachId }));
            return result;
        } catch (error) {
            console.error('Error fetching coach schedule:', error);
            throw error;
        }
    };

    /**
     * Clear booking error
     */
    const handleClearError = () => {
        dispatch(clearError());
    };

    /**
     * Reset booking state
     */
    const handleResetBookingState = () => {
        dispatch(resetBookingState());
    };

    /**
     * Set current booking data
     * @param booking - Booking data to set
     */
    const handleSetCurrentBooking = (booking: Booking | null) => {
        dispatch(setCurrentBooking(booking));
    };

    return {
        // State
        bookings: bookingState.bookings,
        currentBooking: bookingState.currentBooking,
        coachSchedules: bookingState.coachSchedules,
        loading: bookingState.loading,
        error: bookingState.error,
        
        // Actions
        createFieldBooking: handleCreateFieldBooking,
        cancelFieldBooking: handleCancelFieldBooking,
        createSessionBooking: handleCreateSessionBooking,
        getCoachSchedule: handleGetCoachSchedule,
        clearError: handleClearError,
        resetBookingState: handleResetBookingState,
        setCurrentBooking: handleSetCurrentBooking,
        
        // Helper functions
        isLoading: bookingState.loading,
        hasError: !!bookingState.error,
    };
};

export default useBooking;