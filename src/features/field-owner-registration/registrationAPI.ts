import { BASE_URL } from "../../utils/constant-value/constant";
import axiosPrivate from "../../utils/axios/axiosPrivate";

// Field Owner Registration API endpoints
export const SUBMIT_REGISTRATION_REQUEST_API = `${BASE_URL}/field-owner/registration-request`;
export const GET_MY_REGISTRATION_STATUS_API = `${BASE_URL}/field-owner/registration-request/my`;
// Note: UPLOAD_REGISTRATION_DOCUMENT_API is now only used for business license uploads
// CCCD documents are handled via didit eKYC integration
export const UPLOAD_REGISTRATION_DOCUMENT_API = `${BASE_URL}/field-owner/registration-request/upload-document`;

// didit eKYC integration endpoints
const CREATE_EKYC_SESSION_API = `${BASE_URL}/field-owner/ekyc/session`;
const GET_EKYC_STATUS_API = (sessionId: string) =>
  `${BASE_URL}/field-owner/ekyc/status/${sessionId}`;

/**
 * Create didit eKYC session for current user.
 * Frontend will use redirectUrl to open didit widget (popup or redirect).
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
 * Returns status + optional ekyc data.
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


