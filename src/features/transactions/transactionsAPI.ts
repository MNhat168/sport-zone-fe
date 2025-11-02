import { BASE_URL } from "../../utils/constant-value/constant";

// Transactions API endpoints
export const CREATE_VNPAY_URL_API = `${BASE_URL}/transactions/create-vnpay-url`;
export const GET_TRANSACTION_BY_BOOKING_API = (bookingId: string) => `${BASE_URL}/transactions/booking/${bookingId}`;
export const UPDATE_TRANSACTION_STATUS_API = (transactionId: string) => `${BASE_URL}/transactions/${transactionId}/status`;
export const VERIFY_VNPAY_API = `${BASE_URL}/transactions/verify-vnpay`;
export const QUERY_VNPAY_TRANSACTION_API = `${BASE_URL}/transactions/vnpay-query-transaction`;
export const VNPAY_REFUND_API = `${BASE_URL}/transactions/vnpay-refund`;

