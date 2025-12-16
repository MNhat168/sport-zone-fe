import { BASE_URL } from "../../utils/constant-value/constant";

// Bank Account API endpoints - Dynamic based on role
// These will be determined at runtime in thunks based on user role from Redux state
export const getBankAccountBasePath = (role?: string) => {
    if (role === 'coach') {
        return `${BASE_URL}/coach/profile/bank-account`;
    }
    return `${BASE_URL}/field-owner/profile/bank-account`;
};

export const getBankAccountListPath = (role?: string) => {
    if (role === 'coach') {
        return `${BASE_URL}/coach/profile/bank-accounts`;
    }
    return `${BASE_URL}/field-owner/profile/bank-accounts`;
};

// Legacy exports for backward compatibility (defaults to field-owner)
export const ADD_BANK_ACCOUNT_API = `${BASE_URL}/field-owner/profile/bank-account`;
export const GET_MY_BANK_ACCOUNTS_API = `${BASE_URL}/field-owner/profile/bank-accounts`;
export const UPDATE_BANK_ACCOUNT_API = (id: string) => `${BASE_URL}/field-owner/profile/bank-account/${id}`;
export const DELETE_BANK_ACCOUNT_API = (id: string) => `${BASE_URL}/field-owner/profile/bank-account/${id}`;
export const SET_DEFAULT_BANK_ACCOUNT_API = (id: string) => `${BASE_URL}/field-owner/profile/bank-account/${id}/set-default`;
export const GET_VERIFICATION_STATUS_API = (id: string) => `${BASE_URL}/field-owner/profile/bank-account/${id}/verification-status`;

