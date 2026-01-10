import axiosPrivate from '../../utils/axios/axiosPrivate'
import { BASE_URL } from '../../utils/constant-value/constant'

/**
 * Staff QR Check-in API
 * Used by staff/admin/field-owner to confirm check-in
 */
export const staffCheckinAPI = {
    /**
     * Confirm check-in with QR token
     * Requires staff/admin/fieldOwner role
     */
    confirmCheckIn: async (bookingId: string, token: string) => {
        const response = await axiosPrivate.post(
            `${BASE_URL}/bookings/${bookingId}/check-in`,
            { token }
        )
        return response.data
    },

    /**
     * Get booking details by ID (for preview before check-in)
     */
    getBookingDetails: async (bookingId: string) => {
        const response = await axiosPrivate.get(
            `${BASE_URL}/bookings/${bookingId}`
        )
        return response.data
    },
}

// Export types
export interface CheckInConfirmResponse {
    success: boolean
    booking: any
    walletTransaction: {
        pendingBalance: number
        availableBalance: number
    }
    checkedInAt: string
}
