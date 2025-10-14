export const BookingStep = {
    BOOK_COURT: 1,
    ORDER_CONFIRMATION: 2,
    PERSONAL_INFO: 3,
    PAYMENT: 4,
} as const;

export type BookingStep = typeof BookingStep[keyof typeof BookingStep];

export const SportType = {
    FOOTBALL: 'football',
    TENNIS: 'tennis',
    BADMINTON: 'badminton',
    PICKLEBALL: 'pickleball',
    BASKETBALL: 'basketball',
    VOLLEYBALL: 'volleyball',
    SWIMMING: 'swimming',
    GYM: 'gym'
} as const;

export type SportType = typeof SportType[keyof typeof SportType];
