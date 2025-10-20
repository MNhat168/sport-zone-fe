export const BookingStep = {
    BOOK_COURT: 1,
    AMENITIES: 2,
    ORDER_CONFIRMATION: 3,
    PERSONAL_INFO: 4,
    PAYMENT: 5,
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
