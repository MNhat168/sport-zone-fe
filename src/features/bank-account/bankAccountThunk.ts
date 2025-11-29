import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosPrivate from "../../utils/axios/axiosPrivate";
import {
    ADD_BANK_ACCOUNT_API,
    GET_MY_BANK_ACCOUNTS_API,
    VALIDATE_BANK_ACCOUNT_API,
    UPDATE_BANK_ACCOUNT_API,
    DELETE_BANK_ACCOUNT_API,
    SET_DEFAULT_BANK_ACCOUNT_API,
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

export type ValidateBankAccountPayload = {
    bankCode: string;
    accountNumber: string;
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
};

export type BankAccountValidationResponse = {
    isValid: boolean;
    accountName: string;
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
        const response = await axiosPrivate.post(ADD_BANK_ACCOUNT_API, payload);
        return response.data;
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
        const response = await axiosPrivate.get(GET_MY_BANK_ACCOUNTS_API);
        return response.data || [];
    } catch (error: any) {
        const errorResponse: ErrorResponse = {
            message: error.response?.data?.message || error.message || "Failed to get bank accounts",
            status: error.response?.status?.toString() || "500",
        };
        return thunkAPI.rejectWithValue(errorResponse);
    }
});

/**
 * Validate bank account via PayOS
 */
export const validateBankAccount = createAsyncThunk<
    BankAccountValidationResponse,
    ValidateBankAccountPayload,
    { rejectValue: ErrorResponse }
>("bankAccount/validate", async (payload, thunkAPI) => {
    try {
        const response = await axiosPrivate.post(VALIDATE_BANK_ACCOUNT_API, payload);
        return response.data;
    } catch (error: any) {
        const errorResponse: ErrorResponse = {
            message: error.response?.data?.message || error.message || "Failed to validate bank account",
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
        const response = await axiosPrivate.patch(UPDATE_BANK_ACCOUNT_API(id), updateData);
        return response.data;
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
        await axiosPrivate.delete(DELETE_BANK_ACCOUNT_API(accountId));
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
        const response = await axiosPrivate.patch(SET_DEFAULT_BANK_ACCOUNT_API(accountId));
        return response.data;
    } catch (error: any) {
        const errorResponse: ErrorResponse = {
            message: error.response?.data?.message || error.message || "Failed to set default bank account",
            status: error.response?.status?.toString() || "500",
        };
        return thunkAPI.rejectWithValue(errorResponse);
    }
});

