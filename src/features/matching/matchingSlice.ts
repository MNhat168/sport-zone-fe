import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export const SkillLevel = {
    BEGINNER: 'beginner',
    INTERMEDIATE: 'intermediate',
    ADVANCED: 'advanced',
    PROFESSIONAL: 'professional',
    ANY: 'any',
} as const;
export type SkillLevel = typeof SkillLevel[keyof typeof SkillLevel];

export const Gender = {
    MALE: 'male',
    FEMALE: 'female',
    OTHER: 'other',
} as const;
export type Gender = typeof Gender[keyof typeof Gender];

export const GenderPreference = {
    MALE: 'male',
    FEMALE: 'female',
    ANY: 'any',
} as const;
export type GenderPreference = typeof GenderPreference[keyof typeof GenderPreference];

export const SwipeAction = {
    LIKE: 'like',
    PASS: 'pass',
    SUPER_LIKE: 'super_like',
} as const;
export type SwipeAction = typeof SwipeAction[keyof typeof SwipeAction];

export const MatchStatus = {
    ACTIVE: 'active',
    SCHEDULED: 'scheduled',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
} as const;
export type MatchStatus = typeof MatchStatus[keyof typeof MatchStatus];



export interface Location {
    address: string;
    coordinates: [number, number]; // [longitude, latitude]
}

export interface MatchProfile {
    _id: string;
    userId: any;
    sportPreferences: string[];
    skillLevel: SkillLevel;
    location: {
        address: string;
        coordinates: {
            type: string;
            coordinates: [number, number];
        };
        searchRadius: number;
    };
    gender: Gender;
    preferredGender: GenderPreference;
    age?: number;
    minAge?: number;
    maxAge?: number;
    photos: string[];
    bio?: string;
    availability?: any;
    isActive: boolean;
    lastActiveAt: string;
}

export interface Match {
    _id: string;
    user1Id: any;
    user2Id: any;
    sportType: string;
    status: MatchStatus;
    matchedAt: string;
    scheduledDate?: string;
    scheduledStartTime?: string;
    scheduledEndTime?: string;
    fieldId?: any;
    courtId?: any;
    chatRoomId?: any;
}



interface MatchingState {
    profile: MatchProfile | null;
    candidates: MatchProfile[];
    matches: Match[];
    currentMatch: Match | null;

    swipeHistory: any[];
    loading: boolean;
    error: string | null;
}

const initialState: MatchingState = {
    profile: null,
    candidates: [],
    matches: [],
    currentMatch: null,

    swipeHistory: [],
    loading: false,
    error: null,
};

const matchingSlice = createSlice({
    name: 'matching',
    initialState,
    reducers: {
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
        setError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
        },
        setProfile: (state, action: PayloadAction<MatchProfile | null>) => {
            state.profile = action.payload;
        },
        setCandidates: (state, action: PayloadAction<MatchProfile[]>) => {
            state.candidates = action.payload;
        },
        setMatches: (state, action: PayloadAction<Match[]>) => {
            state.matches = action.payload;
        },
        setCurrentMatch: (state, action: PayloadAction<Match | null>) => {
            state.currentMatch = action.payload;
        },
        setSwipeHistory: (state, action: PayloadAction<any[]>) => {
            state.swipeHistory = action.payload;
        },
        addMatch: (state, action: PayloadAction<Match>) => {
            state.matches.unshift(action.payload);
        },
        updateMatch: (state, action: PayloadAction<Match>) => {
            const index = state.matches.findIndex(m => m._id === action.payload._id);
            if (index !== -1) {
                state.matches[index] = action.payload;
            }
            if (state.currentMatch?._id === action.payload._id) {
                state.currentMatch = action.payload;
            }
        },

        removeCandidate: (state, action: PayloadAction<string>) => {
            state.candidates = state.candidates.filter(c => c.userId._id !== action.payload);
        },
    },
});

export const {
    setLoading,
    setError,
    setProfile,
    setCandidates,
    setMatches,
    setCurrentMatch,
    setSwipeHistory,
    addMatch,
    updateMatch,
    removeCandidate,
} = matchingSlice.actions;

export default matchingSlice.reducer;
