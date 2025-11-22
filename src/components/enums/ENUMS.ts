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

export interface SportRules {
  sportType: SportType;
  minParticipants: number;
  maxParticipants: number;
  minFieldsRequired: number;
  maxFieldsRequired: number;
  typicalDuration: number; // in hours
  teamSize: number;
  description: string;
  displayName: string; // Vietnamese name
}

export const SPORT_RULES_MAP: Record<SportType, SportRules> = {
  [SportType.FOOTBALL]: {
    sportType: SportType.FOOTBALL,
    minParticipants: 10,
    maxParticipants: 22,
    minFieldsRequired: 1,
    maxFieldsRequired: 2,
    typicalDuration: 2,
    teamSize: 11,
    description: 'Giải đấu bóng đá với 11 người mỗi đội',
    displayName: 'Bóng đá',
  },
  [SportType.TENNIS]: {
    sportType: SportType.TENNIS,
    minParticipants: 4,
    maxParticipants: 32,
    minFieldsRequired: 1,
    maxFieldsRequired: 8,
    typicalDuration: 4,
    teamSize: 1,
    description: 'Giải đấu quần vợt đơn',
    displayName: 'Quần vợt',
  },
  [SportType.BADMINTON]: {
    sportType: SportType.BADMINTON,
    minParticipants: 8,
    maxParticipants: 32,
    minFieldsRequired: 2,
    maxFieldsRequired: 8,
    typicalDuration: 4,
    teamSize: 2,
    description: 'Giải đấu cầu lông đôi',
    displayName: 'Cầu lông',
  },
  [SportType.PICKLEBALL]: {
    sportType: SportType.PICKLEBALL,
    minParticipants: 8,
    maxParticipants: 32,
    minFieldsRequired: 2,
    maxFieldsRequired: 6,
    typicalDuration: 3,
    teamSize: 2,
    description: 'Giải đấu pickleball đôi',
    displayName: 'Pickleball',
  },
  [SportType.BASKETBALL]: {
    sportType: SportType.BASKETBALL,
    minParticipants: 10,
    maxParticipants: 20,
    minFieldsRequired: 1,
    maxFieldsRequired: 3,
    typicalDuration: 3,
    teamSize: 5,
    description: 'Giải đấu bóng rổ với 5 người mỗi đội',
    displayName: 'Bóng rổ',
  },
  [SportType.VOLLEYBALL]: {
    sportType: SportType.VOLLEYBALL,
    minParticipants: 12,
    maxParticipants: 24,
    minFieldsRequired: 1,
    maxFieldsRequired: 4,
    typicalDuration: 3,
    teamSize: 6,
    description: 'Giải đấu bóng chuyền với 6 người mỗi đội',
    displayName: 'Bóng chuyền',
  },
  [SportType.SWIMMING]: {
    sportType: SportType.SWIMMING,
    minParticipants: 8,
    maxParticipants: 50,
    minFieldsRequired: 1,
    maxFieldsRequired: 2,
    typicalDuration: 2,
    teamSize: 1,
    description: 'Giải thi đấu bơi lội cá nhân',
    displayName: 'Bơi lội',
  },
  [SportType.GYM]: {
    sportType: SportType.GYM,
    minParticipants: 10,
    maxParticipants: 40,
    minFieldsRequired: 1,
    maxFieldsRequired: 1,
    typicalDuration: 2,
    teamSize: 1,
    description: 'Cuộc thi thể hình hoặc workshop',
    displayName: 'Gym/Fitness',
  },
};

export function getSportDisplayName(sportType: string): string {
  const sport = SPORT_RULES_MAP[sportType as SportType];
  return sport?.displayName || sportType;
}

export function getSportRules(sportType: string): SportRules | null {
  return SPORT_RULES_MAP[sportType as SportType] || null;
}

export type SportType = typeof SportType[keyof typeof SportType];

export const TransactionStatus = {
    PENDING: 'pending',
    PROCESSING: 'processing',
    SUCCEEDED: 'succeeded',
    FAILED: 'failed',
    CANCELLED: 'cancelled',
    REFUNDED: 'refunded',
} as const;

export type TransactionStatus = typeof TransactionStatus[keyof typeof TransactionStatus];
