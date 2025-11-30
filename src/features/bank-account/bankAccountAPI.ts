import { BASE_URL } from "../../utils/constant-value/constant";

// Bank Account API endpoints
export const ADD_BANK_ACCOUNT_API = `${BASE_URL}/field-owner/profile/bank-account`;
export const GET_MY_BANK_ACCOUNTS_API = `${BASE_URL}/field-owner/profile/bank-accounts`;
export const VALIDATE_BANK_ACCOUNT_API = `${BASE_URL}/field-owner/bank-account/validate`;
export const UPDATE_BANK_ACCOUNT_API = (id: string) => `${BASE_URL}/field-owner/profile/bank-account/${id}`;
export const DELETE_BANK_ACCOUNT_API = (id: string) => `${BASE_URL}/field-owner/profile/bank-account/${id}`;
export const SET_DEFAULT_BANK_ACCOUNT_API = (id: string) => `${BASE_URL}/field-owner/profile/bank-account/${id}/set-default`;

