import { BASE_URL } from "../../utils/constant-value/constant";

// VNPay Transactions API endpoints
export const CREATE_VNPAY_URL_API = `${BASE_URL}/transactions/create-vnpay-url`;
export const GET_TRANSACTION_BY_BOOKING_API = (bookingId: string) => `${BASE_URL}/transactions/booking/${bookingId}`;
export const UPDATE_TRANSACTION_STATUS_API = (transactionId: string) => `${BASE_URL}/transactions/${transactionId}/status`;
export const VERIFY_VNPAY_API = `${BASE_URL}/transactions/verify-vnpay`;
export const QUERY_VNPAY_TRANSACTION_API = `${BASE_URL}/transactions/vnpay-query-transaction`;
export const VNPAY_REFUND_API = `${BASE_URL}/transactions/vnpay-refund`;

// PayOS Transactions API endpoints
export const CREATE_PAYOS_PAYMENT_API = `${BASE_URL}/transactions/payos/create-payment`;
export const PAYOS_RETURN_API = `${BASE_URL}/transactions/payos/return`;
export const QUERY_PAYOS_TRANSACTION_API = (orderCode: number) => `${BASE_URL}/transactions/payos/query/${orderCode}`;
export const CANCEL_PAYOS_PAYMENT_API = (orderCode: number) => `${BASE_URL}/transactions/payos/cancel/${orderCode}`;

