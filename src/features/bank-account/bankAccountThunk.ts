import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosPrivate from "../../utils/axios/axiosPrivate";
import {

    getBankAccountBasePath,
    getBankAccountListPath,
} from "./bankAccountAPI";

export type CreateBankAccountPayload = {
    accountName: string;
    accountNumber: string;
    bankCode: string;
    bankName: string;
    branch?: string;
    verificationDocument?: string;
    isDefault?: boolean;
};

export type UpdateBankAccountPayload = {
    id: string;
    accountName?: string;
    accountNumber?: string;
    bankCode?: string;
    bankName?: string;
    branch?: string;
    verificationDocument?: string;
    isDefault?: boolean;
};


export type BankAccountResponse = {
    id: string;
    fieldOwner: string;
    accountName: string;
    accountNumber: string;
    bankCode: string;
    bankName: string;
    branch?: string;
    verificationDocument?: string;
    status: 'pending' | 'verified' | 'rejected';
    isDefault: boolean;
    accountNameFromPayOS?: string;
    isValidatedByPayOS: boolean;
    verifiedAt?: string;
    verifiedBy?: string;
    rejectionReason?: string;
    createdAt: string;
    updatedAt: string;
    // Verification payment fields
    verificationUrl?: string;
    verificationQrCode?: string;
    verificationPaymentStatus?: 'pending' | 'paid' | 'failed';
    needsVerification?: boolean;
    verificationOrderCode?: string;
};


export type VerificationStatusResponse = {
    status: 'pending' | 'verified' | 'failed';
    verificationUrl?: string;
    qrCodeUrl?: string;
    needsVerification?: boolean;
    verificationPaymentStatus?: 'pending' | 'paid' | 'failed';
    verificationOrderCode?: string;
};

export type ErrorResponse = {
    message: string;
    status: string;
    errors?: any;
};

/**
 * Add bank account
 */
export const addBankAccount = createAsyncThunk<
    BankAccountResponse,
    CreateBankAccountPayload,
    { rejectValue: ErrorResponse }
>("bankAccount/add", async (payload, thunkAPI) => {
    try {
        // Get user role from Redux state
        const state = thunkAPI.getState() as any;
        const userRole = state?.auth?.user?.role;

        // Use appropriate API endpoint based on role
        const apiUrl = getBankAccountBasePath(userRole);
        const response = await axiosPrivate.post(apiUrl, payload);
        return response.data?.data;
    } catch (error: any) {
        const errorResponse: ErrorResponse = {
            message: error.response?.data?.message || error.message || "Failed to add bank account",
            status: error.response?.status?.toString() || "500",
            errors: error.response?.data?.errors,
        };
        return thunkAPI.rejectWithValue(errorResponse);
    }
});

/**
 * Get my bank accounts
 */
export const getMyBankAccounts = createAsyncThunk<
    BankAccountResponse[],
    void,
    { rejectValue: ErrorResponse }
>("bankAccount/getMyAccounts", async (_, thunkAPI) => {
    try {
        // Get user role from Redux state
        const state = thunkAPI.getState() as any;
        const userRole = state?.auth?.user?.role;

        // Use appropriate API endpoint based on role
        const apiUrl = getBankAccountListPath(userRole);
        const response = await axiosPrivate.get(apiUrl);
        return response.data?.data || [];
    } catch (error: any) {
        const errorResponse: ErrorResponse = {
            message: error.response?.data?.message || error.message || "Failed to get bank accounts",
            status: error.response?.status?.toString() || "500",
        };
        return thunkAPI.rejectWithValue(errorResponse);
    }
});


/**
 * Update bank account
 */
export const updateBankAccount = createAsyncThunk<
    BankAccountResponse,
    UpdateBankAccountPayload,
    { rejectValue: ErrorResponse }
>("bankAccount/update", async (payload, thunkAPI) => {
    try {
        const { id, ...updateData } = payload;
        // Get user role from Redux state
        const state = thunkAPI.getState() as any;
        const userRole = state?.auth?.user?.role;
        const basePath = getBankAccountBasePath(userRole);
        const response = await axiosPrivate.patch(`${basePath}/${id}`, updateData);
        return response.data?.data;
    } catch (error: any) {
        const errorResponse: ErrorResponse = {
            message: error.response?.data?.message || error.message || "Failed to update bank account",
            status: error.response?.status?.toString() || "500",
            errors: error.response?.data?.errors,
        };
        return thunkAPI.rejectWithValue(errorResponse);
    }
});

/**
 * Delete bank account
 */
export const deleteBankAccount = createAsyncThunk<
    string,
    string,
    { rejectValue: ErrorResponse }
>("bankAccount/delete", async (accountId, thunkAPI) => {
    try {
        // Get user role from Redux state
        const state = thunkAPI.getState() as any;
        const userRole = state?.auth?.user?.role;
        const basePath = getBankAccountBasePath(userRole);
        await axiosPrivate.delete(`${basePath}/${accountId}`);
        return accountId;
    } catch (error: any) {
        const errorResponse: ErrorResponse = {
            message: error.response?.data?.message || error.message || "Failed to delete bank account",
            status: error.response?.status?.toString() || "500",
        };
        return thunkAPI.rejectWithValue(errorResponse);
    }
});

/**
 * Set default bank account
 */
export const setDefaultBankAccount = createAsyncThunk<
    BankAccountResponse,
    string,
    { rejectValue: ErrorResponse }
>("bankAccount/setDefault", async (accountId, thunkAPI) => {
    try {
        // Get user role from Redux state
        const state = thunkAPI.getState() as any;
        const userRole = state?.auth?.user?.role;
        const basePath = getBankAccountBasePath(userRole);
        const response = await axiosPrivate.patch(`${basePath}/${accountId}/set-default`);
        return response.data?.data;
    } catch (error: any) {
        const errorResponse: ErrorResponse = {
            message: error.response?.data?.message || error.message || "Failed to set default bank account",
            status: error.response?.status?.toString() || "500",
        };
        return thunkAPI.rejectWithValue(errorResponse);
    }
});

/**
 * Get verification status for bank account
 */
export const getVerificationStatus = createAsyncThunk<
    VerificationStatusResponse,
    string,
    { rejectValue: ErrorResponse }
>("bankAccount/getVerificationStatus", async (accountId, thunkAPI) => {
    try {
        // Get user role from Redux state
        const state = thunkAPI.getState() as any;
        const userRole = state?.auth?.user?.role;
        const basePath = getBankAccountBasePath(userRole);
        const response = await axiosPrivate.get(`${basePath}/${accountId}/verification-status`);
        return response.data?.data;
    } catch (error: any) {
        const errorResponse: ErrorResponse = {
            message: error.response?.data?.message || error.message || "Failed to get verification status",
            status: error.response?.status?.toString() || "500",
        };
        return thunkAPI.rejectWithValue(errorResponse);
    }
});

