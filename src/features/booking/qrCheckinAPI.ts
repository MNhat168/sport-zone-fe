import axiosPrivate from '../../utils/axios/axiosPrivate'
import { BASE_URL } from '../../utils/constant-value/constant'

// QR Check-in API endpoints
export const qrCheckinAPI = {
    /**
     * @deprecated Old booking-specific QR generation is no longer supported
     * Users should scan field QR codes at the venue instead
     */
    // generateQR: DEPRECATED - removed

    /**
     * @deprecated Check-in window is no longer applicable for field QR check-in
     */
    // getCheckInWindow: DEPRECATED - removed

    /**
     * Get user's bookings for a field today (for field QR check-in)
     * Used when user scans a field QR code
     */
    getCheckInOptions: async (fieldId: string) => {
        const response = await axiosPrivate.get(
            `${BASE_URL}/bookings/check-in/options`,
            { params: { fieldId } }
        )
        return response.data?.data || []
    },

    /**
     * Confirm check-in with field QR token
     * Used for field QR check-in flow
     */
    confirmCheckInWithFieldQR: async (token: string, bookingId: string) => {
        const response = await axiosPrivate.post(
            `${BASE_URL}/bookings/check-in`,
            { token, bookingId }
        )
        return response.data
    },
}

// Export types for TypeScript
// DEPRECATED interfaces removed: QRCheckInResponse, CheckInWindowResponse

export interface UserBookingOption {
    _id: string
    date: string
    fieldStartTime: string
    fieldEndTime: string
    field: {
        _id: string
        name: string
    }
    court?: {
        _id: string
        name: string
        courtNumber: number
    }
    status: string
    paymentStatus: string
}
