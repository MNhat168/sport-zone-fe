import { createAsyncThunk } from '@reduxjs/toolkit';
import axiosPrivate from '../../utils/axios/axiosPrivate';
import {
    MATCH_PROFILE_API,
    MATCH_CANDIDATES_API,
    SWIPE_API,
    MY_MATCHES_API,
    MATCH_DETAILS_API,
    UNMATCH_API,
    SCHEDULE_MATCH_API,
    CANCEL_MATCH_API,
    buildCandidatesQuery,
} from './matchingAPI';
import {
    setLoading,
    setError,
    setProfile,
    setCandidates,
    setMatches,
    setCurrentMatch,
    addMatch,
    removeCandidate,
} from './matchingSlice';

// ==================== MATCH PROFILE THUNKS ====================

export const fetchMatchProfile = createAsyncThunk(
    'matching/fetchProfile',
    async (_, { dispatch, rejectWithValue }) => {
        dispatch(setLoading(true));
        try {
            const response = await axiosPrivate.get(MATCH_PROFILE_API);
            const profile = response.data.data || response.data;
            if (profile) {
                dispatch(setProfile(profile));
            } else {
                dispatch(setProfile(null));
            }
            return profile;
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || 'Failed to fetch match profile';
            // 404 is expected if profile doesn't exist yet, don't set global error
            if (error.response?.status !== 404) {
                dispatch(setError(errorMsg));
            }
            return rejectWithValue(errorMsg);
        } finally {
            dispatch(setLoading(false));
        }
    }
);

export const createOrUpdateProfile = createAsyncThunk(
    'matching/upsertProfile',
    async (profileData: any, { dispatch, rejectWithValue }) => {
        dispatch(setLoading(true));
        try {
            const response = await axiosPrivate.post(MATCH_PROFILE_API, profileData);
            const profile = response.data.data || response.data;
            dispatch(setProfile(profile));
            return profile;
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || 'Failed to save match profile';
            dispatch(setError(errorMsg));
            return rejectWithValue(errorMsg);
        } finally {
            dispatch(setLoading(false));
        }
    }
);

// ==================== MATCHING THUNKS ====================

export const fetchCandidates = createAsyncThunk(
    'matching/fetchCandidates',
    async (filters: any, { dispatch, rejectWithValue }) => {
        dispatch(setLoading(true));
        try {
            const queryString = buildCandidatesQuery(filters);
            const response = await axiosPrivate.get(`${MATCH_CANDIDATES_API}?${queryString}`);
            const candidates = response.data.data || response.data || [];
            dispatch(setCandidates(candidates));
            return candidates;
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || 'Failed to fetch match candidates';
            dispatch(setError(errorMsg));
            return rejectWithValue(errorMsg);
        } finally {
            dispatch(setLoading(false));
        }
    }
);

export const swipeUser = createAsyncThunk(
    'matching/swipe',
    async (swipeData: { targetUserId: string; action: string; sportType: string }, { dispatch, rejectWithValue }) => {
        try {
            const response = await axiosPrivate.post(SWIPE_API, swipeData);
            const result = response.data.data || response.data;

            if (result.matched && result.match) {
                dispatch(addMatch(result.match));
            }

            dispatch(removeCandidate(swipeData.targetUserId));

            return result;
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || 'Failed to record swipe';
            dispatch(setError(errorMsg));
            return rejectWithValue(errorMsg);
        }
    }
);

// ==================== MATCH THUNKS ====================

export const fetchMyMatches = createAsyncThunk(
    'matching/fetchMatches',
    async (status: string | undefined, { dispatch, rejectWithValue }) => {
        dispatch(setLoading(true));
        try {
            const url = status ? `${MY_MATCHES_API}?status=${status}` : MY_MATCHES_API;
            const response = await axiosPrivate.get(url);
            const matches = response.data.data || response.data || [];
            dispatch(setMatches(matches));
            return matches;
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || 'Failed to fetch matches';
            dispatch(setError(errorMsg));
            return rejectWithValue(errorMsg);
        } finally {
            dispatch(setLoading(false));
        }
    }
);

export const fetchMatchById = createAsyncThunk(
    'matching/fetchMatchById',
    async (id: string, { dispatch, rejectWithValue }) => {
        dispatch(setLoading(true));
        try {
            const response = await axiosPrivate.get(MATCH_DETAILS_API(id));
            const match = response.data.data || response.data;
            dispatch(setCurrentMatch(match));
            return match;
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || 'Failed to fetch match details';
            dispatch(setError(errorMsg));
            return rejectWithValue(errorMsg);
        } finally {
            dispatch(setLoading(false));
        }
    }
);

export const unmatchById = createAsyncThunk(
    'matching/unmatch',
    async (id: string, { dispatch, rejectWithValue }) => {
        try {
            await axiosPrivate.delete(UNMATCH_API(id));
            dispatch(fetchMyMatches(undefined));
            return id;
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || 'Failed to unmatch';
            dispatch(setError(errorMsg));
            return rejectWithValue(errorMsg);
        }
    }
);

export const scheduleMatch = createAsyncThunk(
    'matching/scheduleMatch',
    async ({ id, scheduleData }: { id: string; scheduleData: any }, { dispatch, rejectWithValue }) => {
        try {
            const response = await axiosPrivate.post(SCHEDULE_MATCH_API(id), scheduleData);
            const match = response.data.data || response.data;
            dispatch(setCurrentMatch(match));
            return match;
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || 'Failed to schedule match';
            dispatch(setError(errorMsg));
            return rejectWithValue(errorMsg);
        }
    }
);

export const cancelMatch = createAsyncThunk(
    'matching/cancelMatch',
    async (id: string, { dispatch, rejectWithValue }) => {
        try {
            const response = await axiosPrivate.post(CANCEL_MATCH_API(id));
            const match = response.data.data || response.data;
            dispatch(setCurrentMatch(match));
            return match;
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || 'Failed to cancel match';
            dispatch(setError(errorMsg));
            return rejectWithValue(errorMsg);
        }
    }
);



/**
 * Create a booking for a 1:1 match
 */
export const createMatchBooking = createAsyncThunk(
    'matching/createMatchBooking',
    async ({ matchId, bookingData }: { matchId: string, bookingData: any }, { rejectWithValue }) => {
        try {
            const response = await axiosPrivate.post(`/matching/matches/${matchId}/book`, bookingData);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to create booking');
        }
    }
);

export const proposeMatch = createAsyncThunk(
    'matching/proposeMatch',
    async ({ matchId, bookingData }: { matchId: string, bookingData: any }, { rejectWithValue }) => {
        try {
            const response = await axiosPrivate.post(`/matching/matches/${matchId}/propose`, bookingData);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to send proposal');
        }
    }
);

export const acceptMatchProposal = createAsyncThunk(
    'matching/acceptProposal',
    async ({ matchId, bookingId }: { matchId: string, bookingId: string }, { rejectWithValue }) => {
        try {
            const response = await axiosPrivate.post(`/matching/matches/${matchId}/propose/${bookingId}/accept`);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to accept proposal');
        }
    }
);

export const rejectMatchProposal = createAsyncThunk(
    'matching/rejectProposal',
    async ({ matchId, bookingId }: { matchId: string, bookingId: string }, { rejectWithValue }) => {
        try {
            const response = await axiosPrivate.post(`/matching/matches/${matchId}/propose/${bookingId}/reject`);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to reject proposal');
        }
    }
);
