import axiosPrivate from '../../utils/axios/axiosPrivate'
import { BASE_URL } from '../../utils/constant-value/constant'

// Field Owner QR Code Management API
export const fieldQrAPI = {
    /**
     * Get QR code for a field
     */
    getFieldQR: async (fieldId: string) => {
        const response = await axiosPrivate.get(
            `${BASE_URL}/field-owner/fields/${fieldId}/qr-code`
        )
        return response.data
    },

    /**
     * Generate QR code for a field
     * Returns existing QR if already generated
     */
    generateFieldQR: async (fieldId: string) => {
        const response = await axiosPrivate.post(
            `${BASE_URL}/field-owner/fields/${fieldId}/qr-code/generate`
        )
        return response.data
    },

    /**
     * Regenerate QR code for a field
     * Invalidates old QR and creates new one
     */
    regenerateFieldQR: async (fieldId: string) => {
        const response = await axiosPrivate.post(
            `${BASE_URL}/field-owner/fields/${fieldId}/qr-code/regenerate`
        )
        return response.data
    },
}

// Export types for TypeScript
export interface FieldQRCodeResponse {
    fieldId: string
    fieldName: string
    qrToken: string
    qrCodeUrl: string
    generatedAt: string
    isActive: boolean
}
