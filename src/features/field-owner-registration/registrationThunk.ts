import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosPrivate from "../../utils/axios/axiosPrivate";
import axiosUpload from "../../utils/axios/axiosUpload";
import {
    SUBMIT_REGISTRATION_REQUEST_API,
    GET_MY_REGISTRATION_STATUS_API,
    UPLOAD_REGISTRATION_DOCUMENT_API,
} from "./registrationAPI";

export type CreateRegistrationRequestPayload = {
    personalInfo: {
        fullName: string;
        idNumber: string;
        address: string;
    };
    // Field images (required >= 5 URLs when submitting)
    fieldImages: string[];
    // Documents: only business license (optional)
    documents?: {
        businessLicense?: string;
    };
    // eKYC fields
    ekycSessionId?: string;
    ekycData?: {
        fullName: string;
        idNumber: string;
        address: string;
    };
    // Bank account information (optional, can be added later)
    bankAccount?: {
        accountName?: string;
        accountNumber?: string;
        bankCode?: string;
        bankName?: string;
    };
    // Owner type (individual or business)
    ownerType?: 'individual' | 'business';
};

export type RegistrationRequestResponse = {
    id: string;
    userId: string;
    personalInfo: {
        fullName: string;
        idNumber: string;
        address: string;
    };
    documents?: {
        businessLicense?: string;
    };
    fieldImages: string[];
    status: 'pending' | 'approved' | 'rejected';
    rejectionReason?: string;
    submittedAt: string;
    reviewedAt?: string;
    reviewedBy?: string;
    ownerType?: 'individual' | 'business';
};

export type ErrorResponse = {
    message: string;
    status: string;
    errors?: any;
};

/**
 * Submit field owner registration request
 */
export const submitRegistrationRequest = createAsyncThunk<
    RegistrationRequestResponse,
    CreateRegistrationRequestPayload,
    { rejectValue: ErrorResponse }
>("registration/submit", async (payload, thunkAPI) => {
    try {
        const response = await axiosPrivate.post(SUBMIT_REGISTRATION_REQUEST_API, payload);
        return response.data;
    } catch (error: any) {
        const errorResponse: ErrorResponse = {
            message: error.response?.data?.message || error.message || "Failed to submit registration request",
            status: error.response?.status?.toString() || "500",
            errors: error.response?.data?.errors,
        };
        return thunkAPI.rejectWithValue(errorResponse);
    }
});

/**
 * Get my registration request status
 */
export const getMyRegistrationStatus = createAsyncThunk<
    RegistrationRequestResponse | null,
    void,
    { rejectValue: ErrorResponse }
>("registration/getMyStatus", async (_, thunkAPI) => {
    try {
        const response = await axiosPrivate.get(GET_MY_REGISTRATION_STATUS_API);
        const registration = response.data?.data ?? response.data;
        return (registration as RegistrationRequestResponse) || null;
    } catch (error: any) {
        if (error.response?.status === 404) {
            return null; // No registration request found
        }
        const errorResponse: ErrorResponse = {
            message: error.response?.data?.message || error.message || "Failed to get registration status",
            status: error.response?.status?.toString() || "500",
        };
        return thunkAPI.rejectWithValue(errorResponse);
    }
});

/**
 * Upload business license document (image or PDF)
 * Note: This is now only used for business license uploads.
 * CCCD documents are handled via didit eKYC integration.
 */
export const uploadRegistrationDocument = createAsyncThunk<
    string,
    File,
    { rejectValue: ErrorResponse }
>("registration/uploadDocument", async (file, thunkAPI) => {
    try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await axiosUpload.post<{ success: boolean; data: { url: string } }>(
            UPLOAD_REGISTRATION_DOCUMENT_API,
            formData,
        );

        // Backend wraps response with { success: true, data: { url: "..." } }
        const url = response.data?.data?.url;
        if (!url || typeof url !== 'string' || url.trim() === '') {
            throw new Error('URL không hợp lệ từ server');
        }
        return url;
    } catch (error: any) {
        const errorResponse: ErrorResponse = {
            message: error.response?.data?.message || error.message || "Failed to upload document",
            status: error.response?.status?.toString() || "500",
            errors: error.response?.data?.errors,
        };
        return thunkAPI.rejectWithValue(errorResponse);
    }
});

