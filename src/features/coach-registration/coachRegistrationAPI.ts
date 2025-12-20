import { BASE_URL } from "../../utils/constant-value/constant";
import axiosPrivate from "../../utils/axios/axiosPrivate";

// Coach Registration API endpoints
export const SUBMIT_COACH_REGISTRATION_API = `${BASE_URL}/coaches/registration`;
export const GET_MY_COACH_REGISTRATION_API = `${BASE_URL}/coaches/registration/my-request`;
export const UPLOAD_COACH_DOCUMENT_API = `${BASE_URL}/field-owner/registration-request/upload-document`; // Reuse existing upload endpoint

// didit eKYC integration endpoints (same as field owner)
const CREATE_EKYC_SESSION_API = `${BASE_URL}/field-owner/ekyc/session`;
const GET_EKYC_STATUS_API = (sessionId: string) =>
    `${BASE_URL}/field-owner/ekyc/status/${sessionId}`;

/**
 * Create didit eKYC session for current user.
 */
export const createEkycSession = async (): Promise<{
    sessionId: string;
    redirectUrl: string;
}> => {
    const response = await axiosPrivate.post(CREATE_EKYC_SESSION_API);

    const data = response.data?.data ?? response.data;
    return {
        sessionId: data.sessionId,
        redirectUrl: data.redirectUrl,
    };
};

/**
 * Get didit eKYC session status (for polling).
 */
export const getEkycStatus = async (
    sessionId: string,
): Promise<{
    status: "pending" | "verified" | "failed" | "timeout";
    data?: {
        fullName: string;
        idNumber: string;
        address: string;
    };
    verifiedAt?: string;
}> => {
    const url = GET_EKYC_STATUS_API(sessionId);
    const response = await axiosPrivate.get(url);

    const raw = response.data?.data ?? response.data;

    return {
        status: raw.status,
        data: raw.data,
        verifiedAt: raw.verifiedAt,
    };
};
