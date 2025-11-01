import { BASE_URL } from "../../utils/constant-value/constant";

// Payment API endpoints
export const CREATE_VNPAY_URL_API = `${BASE_URL}/payments/create-vnpay-url`;
export const GET_PAYMENT_BY_BOOKING_API = (bookingId: string) => `${BASE_URL}/payments/booking/${bookingId}`;
export const UPDATE_PAYMENT_STATUS_API = (paymentId: string) => `${BASE_URL}/payments/${paymentId}/status`;
export const VERIFY_VNPAY_API = `${BASE_URL}/payments/verify-vnpay`;

