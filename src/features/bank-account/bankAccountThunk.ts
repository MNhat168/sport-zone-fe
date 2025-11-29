import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosPrivate from "../../utils/axios/axiosPrivate";
import {
    ADD_BANK_ACCOUNT_API,
    GET_MY_BANK_ACCOUNTS_API,
    VALIDATE_BANK_ACCOUNT_API,
} from "./bankAccountAPI";

export type CreateBankAccountPayload = {
    accountName: string;
    accountNumber: string;
    bankCode: string;
    bankName: string;
    branch?: string;
    verificationDocument?: string;
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

