export const BookingStep = {
    BOOK_COURT: 1,
    AMENITIES: 2,
    ORDER_CONFIRMATION: 3,
    PERSONAL_INFO: 4,
    PAYMENT: 5,
} as const;

export type BookingStep = typeof BookingStep[keyof typeof BookingStep];

// ENUMS.ts - Enhanced with categories
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

// Competition formats
export const CompetitionFormat = {
    SINGLE_ELIMINATION: 'single_elimination',
    DOUBLE_ELIMINATION: 'double_elimination',
    ROUND_ROBIN: 'round_robin',
    GROUP_STAGE: 'group_stage',
    LEAGUE: 'league',
    KNOCKOUT: 'knockout'
} as const;

export type CompetitionFormat = typeof CompetitionFormat[keyof typeof CompetitionFormat];

// Sport-specific categories
export const SportCategories = {
    // Net sports (Tennis, Badminton, Pickleball)
    NET_SPORTS: {
        SINGLES: 'singles',
        DOUBLES: 'doubles',
        MIXED_DOUBLES: 'mixed_doubles'
    },
    
    // Football categories
    FOOTBALL: {
        MENS: 'mens',
        WOMENS: 'womens',
        MIXED: 'mixed',
        YOUTH: 'youth',
        VETERANS: 'veterans',
        FIVE_A_SIDE: '5_a_side',
        SEVEN_A_SIDE: '7_a_side',
        ELEVEN_A_SIDE: '11_a_side'
    },
    
    // Basketball categories  
    BASKETBALL: {
        MENS: 'mens',
        WOMENS: 'womens',
        THREE_ON_THREE: '3x3',
        FIVE_ON_FIVE: '5x5',
        YOUTH: 'youth'
    },
    
    // Volleyball categories
    VOLLEYBALL: {
        MENS: 'mens',
        WOMENS: 'womens', 
        MIXED: 'mixed',
        BEACH: 'beach',
        INDOOR: 'indoor'
    },
    
    // Swimming categories
    SWIMMING: {
        FREESTYLE: 'freestyle',
        BREASTSTROKE: 'breaststroke',
        BACKSTROKE: 'backstroke',
        BUTTERFLY: 'butterfly',
        INDIVIDUAL_MEDLEY: 'individual_medley',
        RELAY: 'relay'
    },
    
    // Gym/Fitness categories
    GYM: {
        BODYBUILDING: 'bodybuilding',
        POWERLIFTING: 'powerlifting',
        CROSSFIT: 'crossfit',
        CALISTHENICS: 'calisthenics',
        WEIGHTLIFTING: 'weightlifting'
    }
} as const;

export interface SportRules {
    sportType: SportType;
    minParticipants: number;
    maxParticipants: number;
    minFieldsRequired: number;
    maxFieldsRequired: number;
    typicalDuration: number;
    teamSize: number;
    description: string;
    displayName: string;
    availableCategories: string[];
    availableFormats: CompetitionFormat[];
    defaultFormat: CompetitionFormat;
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
        availableCategories: Object.values(SportCategories.FOOTBALL),
        availableFormats: [CompetitionFormat.GROUP_STAGE, CompetitionFormat.KNOCKOUT, CompetitionFormat.LEAGUE],
        defaultFormat: CompetitionFormat.GROUP_STAGE
    },
    [SportType.TENNIS]: {
        sportType: SportType.TENNIS,
        minParticipants: 4,
        maxParticipants: 32,
        minFieldsRequired: 1,
        maxFieldsRequired: 8,
        typicalDuration: 4,
        teamSize: 1,
        description: 'Giải đấu quần vợt',
        displayName: 'Quần vợt',
        availableCategories: Object.values(SportCategories.NET_SPORTS),
        availableFormats: [CompetitionFormat.SINGLE_ELIMINATION, CompetitionFormat.DOUBLE_ELIMINATION, CompetitionFormat.ROUND_ROBIN],
        defaultFormat: CompetitionFormat.SINGLE_ELIMINATION
    },
    [SportType.BADMINTON]: {
        sportType: SportType.BADMINTON,
        minParticipants: 8,
        maxParticipants: 32,
        minFieldsRequired: 2,
        maxFieldsRequired: 8,
        typicalDuration: 4,
        teamSize: 2,
        description: 'Giải đấu cầu lông',
        displayName: 'Cầu lông',
        availableCategories: Object.values(SportCategories.NET_SPORTS),
        availableFormats: [CompetitionFormat.SINGLE_ELIMINATION, CompetitionFormat.DOUBLE_ELIMINATION, CompetitionFormat.ROUND_ROBIN],
        defaultFormat: CompetitionFormat.SINGLE_ELIMINATION
    },
    [SportType.PICKLEBALL]: {
        sportType: SportType.PICKLEBALL,
        minParticipants: 8,
        maxParticipants: 32,
        minFieldsRequired: 2,
        maxFieldsRequired: 6,
        typicalDuration: 3,
        teamSize: 2,
        description: 'Giải đấu pickleball',
        displayName: 'Pickleball',
        availableCategories: Object.values(SportCategories.NET_SPORTS),
        availableFormats: [CompetitionFormat.SINGLE_ELIMINATION, CompetitionFormat.ROUND_ROBIN],
        defaultFormat: CompetitionFormat.ROUND_ROBIN
    },
    [SportType.BASKETBALL]: {
        sportType: SportType.BASKETBALL,
        minParticipants: 10,
        maxParticipants: 20,
        minFieldsRequired: 1,
        maxFieldsRequired: 3,
        typicalDuration: 3,
        teamSize: 5,
        description: 'Giải đấu bóng rổ',
        displayName: 'Bóng rổ',
        availableCategories: Object.values(SportCategories.BASKETBALL),
        availableFormats: [CompetitionFormat.SINGLE_ELIMINATION, CompetitionFormat.ROUND_ROBIN, CompetitionFormat.LEAGUE],
        defaultFormat: CompetitionFormat.SINGLE_ELIMINATION
    },
    [SportType.VOLLEYBALL]: {
        sportType: SportType.VOLLEYBALL,
        minParticipants: 12,
        maxParticipants: 24,
        minFieldsRequired: 1,
        maxFieldsRequired: 4,
        typicalDuration: 3,
        teamSize: 6,
        description: 'Giải đấu bóng chuyền',
        displayName: 'Bóng chuyền',
        availableCategories: Object.values(SportCategories.VOLLEYBALL),
        availableFormats: [CompetitionFormat.SINGLE_ELIMINATION, CompetitionFormat.ROUND_ROBIN],
        defaultFormat: CompetitionFormat.ROUND_ROBIN
    },
    [SportType.SWIMMING]: {
        sportType: SportType.SWIMMING,
        minParticipants: 8,
        maxParticipants: 50,
        minFieldsRequired: 1,
        maxFieldsRequired: 2,
        typicalDuration: 2,
        teamSize: 1,
        description: 'Giải thi đấu bơi lội',
        displayName: 'Bơi lội',
        availableCategories: Object.values(SportCategories.SWIMMING),
        availableFormats: [CompetitionFormat.SINGLE_ELIMINATION, CompetitionFormat.ROUND_ROBIN],
        defaultFormat: CompetitionFormat.SINGLE_ELIMINATION
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
        availableCategories: Object.values(SportCategories.GYM),
        availableFormats: [CompetitionFormat.SINGLE_ELIMINATION, CompetitionFormat.ROUND_ROBIN],
        defaultFormat: CompetitionFormat.SINGLE_ELIMINATION
    },
}

// Helper functions for display names
export const getCategoryDisplayName = (category: string, sportType: string): string => {
  const categoryMappings: Record<string, Record<string, string>> = {
    [SportType.TENNIS]: {
      'singles': 'Đơn',
      'doubles': 'Đôi',
      'mixed_doubles': 'Đôi nam nữ'
    },
    [SportType.BADMINTON]: {
      'singles': 'Đơn',
      'doubles': 'Đôi', 
      'mixed_doubles': 'Đôi nam nữ'
    },
    [SportType.PICKLEBALL]: {
      'singles': 'Đơn',
      'doubles': 'Đôi',
      'mixed_doubles': 'Đôi nam nữ'
    },
    [SportType.FOOTBALL]: {
      'mens': 'Nam',
      'womens': 'Nữ',
      'mixed': 'Nam nữ',
      'youth': 'Trẻ',
      'veterans': 'Cựu vận động viên',
      '5_a_side': '5 người',
      '7_a_side': '7 người',
      '11_a_side': '11 người'
    },
    [SportType.BASKETBALL]: {
      'mens': 'Nam',
      'womens': 'Nữ',
      '3x3': '3x3',
      '5x5': '5x5',
      'youth': 'Trẻ'
    },
    [SportType.VOLLEYBALL]: {
      'mens': 'Nam',
      'womens': 'Nữ',
      'mixed': 'Nam nữ',
      'beach': 'Bãi biển',
      'indoor': 'Trong nhà'
    },
    [SportType.SWIMMING]: {
      'freestyle': 'Tự do',
      'breaststroke': 'Ếch',
      'backstroke': 'Ngửa',
      'butterfly': 'Bướm',
      'individual_medley': 'Hỗn hợp cá nhân',
      'relay': 'Tiếp sức'
    },
    [SportType.GYM]: {
      'bodybuilding': 'Thể hình',
      'powerlifting': 'Cử tạ sức mạnh',
      'crossfit': 'CrossFit',
      'calisthenics': 'Thể dục dụng cụ',
      'weightlifting': 'Cử tạ'
    }
  };

  return categoryMappings[sportType]?.[category] || category;
};

export const getFormatDisplayName = (format: string): string => {
  const formatNames: Record<string, string> = {
    'single_elimination': 'Loại trực tiếp',
    'double_elimination': 'Loại kép',
    'round_robin': 'Vòng tròn',
    'group_stage': 'Vòng bảng',
    'league': 'Giải đấu',
    'knockout': 'Loại trực tiếp'
  };
  return formatNames[format] || format;
};

export const getSportDisplayNameVN = (sportType: string): string => {
  const sportNames: Record<string, string> = {
    [SportType.FOOTBALL]: 'Bóng đá',
    [SportType.TENNIS]: 'Quần vợt',
    [SportType.BADMINTON]: 'Cầu lông',
    [SportType.PICKLEBALL]: 'Pickleball',
    [SportType.BASKETBALL]: 'Bóng rổ',
    [SportType.VOLLEYBALL]: 'Bóng chuyền',
    [SportType.SWIMMING]: 'Bơi lội',
    [SportType.GYM]: 'Thể hình'
  };
  return sportNames[sportType] || sportType;
};

export function getSportDisplayName(sportType: string): string {
  const sport = SPORT_RULES_MAP[sportType as SportType];
  return sport?.displayName || sportType;
}

export function getSportRules(sportType: string): SportRules | null {
  return SPORT_RULES_MAP[sportType as SportType] || null;
}

export const TransactionStatus = {
    PENDING: 'pending',
    PROCESSING: 'processing',
    SUCCEEDED: 'succeeded',
    FAILED: 'failed',
    CANCELLED: 'cancelled',
    REFUNDED: 'refunded',
} as const;

export type TransactionStatus = typeof TransactionStatus[keyof typeof TransactionStatus];
