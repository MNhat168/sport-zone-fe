export const BookingStep = {
    BOOK_COURT: 1,
    ORDER_CONFIRMATION: 2,
    PERSONAL_INFO: 3,
    PAYMENT: 4,
} as const;

export type BookingStep = typeof BookingStep[keyof typeof BookingStep];