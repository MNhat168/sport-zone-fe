// Payment types based on API documentation

export const PaymentMethod = {
    CASH: 1,
    EBANKING: 2,
    CREDIT_CARD: 3,
    DEBIT_CARD: 4,
    MOMO: 5,
    ZALOPAY: 6,
    VNPAY: 7,
    BANK_TRANSFER: 8,
    QR_CODE: 9,
} as const;

export type PaymentMethod = typeof PaymentMethod[keyof typeof PaymentMethod];

export type PaymentStatus = 'pending' | 'succeeded' | 'failed' | 'refunded';

export interface Payment {
    _id: string;
    booking: string;
    user: string;
    amount: number;
    method: PaymentMethod;
    status: PaymentStatus;
    paymentNote?: string;
    transactionId?: string;
    paidBy?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateVNPayUrlPayload {
    amount: number; // VND amount (integer)
    orderId: string; // paymentId recommended
}

export interface CreateVNPayUrlResponse {
    paymentUrl: string;
}

export interface UpdatePaymentStatusPayload {
    status: PaymentStatus;
    transactionId?: string;
}

export interface PaymentState {
    currentPayment: Payment | null;
    loading: boolean;
    error: ErrorResponse | null;
}

export interface ErrorResponse {
    message: string;
    status: string;
}

