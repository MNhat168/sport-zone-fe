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

// Team size mapping based on sport category
export const TeamSizeMap: Record<string, Record<string, number>> = {
    [SportType.FOOTBALL]: {
        '5_a_side': 5,
        '7_a_side': 7,
        '11_a_side': 11,
        'mens': 11,
        'womens': 11,
        'mixed': 11,
        'youth': 11,
        'veterans': 11
    },
    [SportType.BASKETBALL]: {
        '3x3': 3,
        '5x5': 5,
        'mens': 5,
        'womens': 5,
        'youth': 5
    },
    [SportType.VOLLEYBALL]: {
        'mens': 6,
        'womens': 6,
        'mixed': 6,
        'beach': 2,
        'indoor': 6
    },
    [SportType.TENNIS]: {
        'singles': 1,
        'doubles': 2,
        'mixed_doubles': 2
    },
    [SportType.BADMINTON]: {
        'singles': 1,
        'doubles': 2,
        'mixed_doubles': 2
    },
    [SportType.PICKLEBALL]: {
        'singles': 1,
        'doubles': 2,
        'mixed_doubles': 2
    },
    [SportType.SWIMMING]: {
        'freestyle': 1,
        'breaststroke': 1,
        'backstroke': 1,
        'butterfly': 1,
        'individual_medley': 1,
        'relay': 4
    },
    [SportType.GYM]: {
        'bodybuilding': 1,
        'powerlifting': 1,
        'crossfit': 1,
        'calisthenics': 1,
        'weightlifting': 1
    }
};

export interface SportRules {
  sportType: SportType;
  minTeams: number;
  maxTeams: number;
  minParticipants: number;
  maxParticipants: number;
  // Keep both field and court properties for backward compatibility
  minFieldsRequired: number;
  maxFieldsRequired: number;
  minCourtsRequired: number; // Add this
  maxCourtsRequired: number; // Add this
  typicalDuration: number;
  description: string;
  displayName: string;
  availableCategories: string[];
  availableFormats: CompetitionFormat[];
  defaultFormat: CompetitionFormat;
  supportsTeamSizeOverride?: boolean;
}

export const SPORT_RULES_MAP: Record<SportType, SportRules> = {
  [SportType.FOOTBALL]: {
    sportType: SportType.FOOTBALL,
    minTeams: 4,
    maxTeams: 16,
    minParticipants: 20,
    maxParticipants: 176,
    minFieldsRequired: 1,
    maxFieldsRequired: 2,
    minCourtsRequired: 1, // Same as fields for football
    maxCourtsRequired: 2, // Same as fields for football
    typicalDuration: 2,
    description: 'Football tournament with flexible team sizes',
    displayName: 'Football',
    availableCategories: Object.values(SportCategories.FOOTBALL),
    availableFormats: [CompetitionFormat.GROUP_STAGE, CompetitionFormat.KNOCKOUT, CompetitionFormat.LEAGUE],
    defaultFormat: CompetitionFormat.GROUP_STAGE,
    supportsTeamSizeOverride: true
  },
  [SportType.TENNIS]: {
    sportType: SportType.TENNIS,
    minTeams: 8,
    maxTeams: 32,
    minParticipants: 8,
    maxParticipants: 64,
    minFieldsRequired: 1,
    maxFieldsRequired: 8,
    minCourtsRequired: 1, // Could be different
    maxCourtsRequired: 8, // Same as fields
    typicalDuration: 4,
    description: 'Tennis tournament',
    displayName: 'Tennis',
    availableCategories: Object.values(SportCategories.NET_SPORTS),
    availableFormats: [CompetitionFormat.SINGLE_ELIMINATION, CompetitionFormat.DOUBLE_ELIMINATION, CompetitionFormat.ROUND_ROBIN],
    defaultFormat: CompetitionFormat.SINGLE_ELIMINATION,
    supportsTeamSizeOverride: false
  },
  [SportType.BADMINTON]: {
    sportType: SportType.BADMINTON,
    minTeams: 8,
    maxTeams: 32,
    minParticipants: 8,
    maxParticipants: 64,
    minFieldsRequired: 2,
    maxFieldsRequired: 8,
    minCourtsRequired: 2, // Same as fields
    maxCourtsRequired: 8, // Same as fields
    typicalDuration: 4,
    description: 'Badminton tournament',
    displayName: 'Badminton',
    availableCategories: Object.values(SportCategories.NET_SPORTS),
    availableFormats: [CompetitionFormat.SINGLE_ELIMINATION, CompetitionFormat.DOUBLE_ELIMINATION, CompetitionFormat.ROUND_ROBIN],
    defaultFormat: CompetitionFormat.SINGLE_ELIMINATION,
    supportsTeamSizeOverride: false
  },
  [SportType.PICKLEBALL]: {
    sportType: SportType.PICKLEBALL,
    minTeams: 8,
    maxTeams: 32,
    minParticipants: 8,
    maxParticipants: 64,
    minFieldsRequired: 2,
    maxFieldsRequired: 6,
    minCourtsRequired: 2, // Same as fields
    maxCourtsRequired: 6, // Same as fields
    typicalDuration: 3,
    description: 'Pickleball tournament',
    displayName: 'Pickleball',
    availableCategories: Object.values(SportCategories.NET_SPORTS),
    availableFormats: [CompetitionFormat.SINGLE_ELIMINATION, CompetitionFormat.ROUND_ROBIN],
    defaultFormat: CompetitionFormat.ROUND_ROBIN,
    supportsTeamSizeOverride: false
  },
  [SportType.BASKETBALL]: {
    sportType: SportType.BASKETBALL,
    minTeams: 4,
    maxTeams: 16,
    minParticipants: 12,
    maxParticipants: 80,
    minFieldsRequired: 1,
    maxFieldsRequired: 3,
    minCourtsRequired: 1, // Same as fields
    maxCourtsRequired: 3, // Same as fields
    typicalDuration: 3,
    description: 'Basketball tournament with 5 players per team',
    displayName: 'Basketball',
    availableCategories: Object.values(SportCategories.BASKETBALL),
    availableFormats: [CompetitionFormat.SINGLE_ELIMINATION, CompetitionFormat.ROUND_ROBIN, CompetitionFormat.LEAGUE],
    defaultFormat: CompetitionFormat.SINGLE_ELIMINATION,
    supportsTeamSizeOverride: true
  },
  [SportType.VOLLEYBALL]: {
    sportType: SportType.VOLLEYBALL,
    minTeams: 4,
    maxTeams: 16,
    minParticipants: 8,
    maxParticipants: 96,
    minFieldsRequired: 1,
    maxFieldsRequired: 4,
    minCourtsRequired: 1, // Same as fields
    maxCourtsRequired: 4, // Same as fields
    typicalDuration: 3,
    description: 'Volleyball tournament with 6 players per team',
    displayName: 'Volleyball',
    availableCategories: Object.values(SportCategories.VOLLEYBALL),
    availableFormats: [CompetitionFormat.SINGLE_ELIMINATION, CompetitionFormat.ROUND_ROBIN],
    defaultFormat: CompetitionFormat.ROUND_ROBIN,
    supportsTeamSizeOverride: true
  },
  [SportType.SWIMMING]: {
    sportType: SportType.SWIMMING,
    minTeams: 1,
    maxTeams: 50,
    minParticipants: 4,
    maxParticipants: 200,
    minFieldsRequired: 1,
    maxFieldsRequired: 2,
    minCourtsRequired: 1, // Same as fields (lanes)
    maxCourtsRequired: 2, // Same as fields (lanes)
    typicalDuration: 2,
    description: 'Individual swimming competition',
    displayName: 'Swimming',
    availableCategories: Object.values(SportCategories.SWIMMING),
    availableFormats: [CompetitionFormat.SINGLE_ELIMINATION, CompetitionFormat.ROUND_ROBIN],
    defaultFormat: CompetitionFormat.SINGLE_ELIMINATION,
    supportsTeamSizeOverride: true
  },
  [SportType.GYM]: {
    sportType: SportType.GYM,
    minTeams: 1,
    maxTeams: 40,
    minParticipants: 4,
    maxParticipants: 120,
    minFieldsRequired: 1,
    maxFieldsRequired: 1,
    minCourtsRequired: 1, // Same as fields
    maxCourtsRequired: 1, // Same as fields
    typicalDuration: 2,
    description: 'Fitness competition or workshop',
    displayName: 'Gym/Fitness',
    availableCategories: Object.values(SportCategories.GYM),
    availableFormats: [CompetitionFormat.SINGLE_ELIMINATION, CompetitionFormat.ROUND_ROBIN],
    defaultFormat: CompetitionFormat.SINGLE_ELIMINATION,
    supportsTeamSizeOverride: true
  },
};

// Helper function to calculate participants based on teams and team size
export const calculateParticipants = (
    numTeams: number, 
    sportType: string, 
    category: string, 
    teamSize?: number
): number => {
    const baseTeamSize = TeamSizeMap[sportType]?.[category] || 1;
    const finalTeamSize = teamSize || baseTeamSize;
    return numTeams * finalTeamSize;
};

// Helper function to calculate teams based on participants and team size
export const calculateTeams = (
    numParticipants: number, 
    sportType: string, 
    category: string, 
    teamSize?: number
): number => {
    const baseTeamSize = TeamSizeMap[sportType]?.[category] || 1;
    const finalTeamSize = teamSize || baseTeamSize;
    return Math.floor(numParticipants / finalTeamSize);
};

// Helper function to get default team size for a category
export const getDefaultTeamSize = (sportType: string, category: string): number => {
    return TeamSizeMap[sportType]?.[category] || 1;
};

/**
 * Helper function to check if sport is team-based
 * @param sportType - The sport type to check
 * @returns True if the sport is team-based
 */
export const isTeamSport = (sportType: string): boolean => {
    const teamSports: SportType[] = [SportType.FOOTBALL, SportType.BASKETBALL, SportType.VOLLEYBALL];
    return teamSports.includes(sportType as SportType);
};

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
    'round_robinc': 'Vòng tròn',
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