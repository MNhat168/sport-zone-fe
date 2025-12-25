import { createSlice } from '@reduxjs/toolkit';
import type { FieldStats, CoachStats } from '../../types/reviewTypes';
import { getFieldStatsThunk, createFieldReviewThunk, getCoachStatsThunk } from './reviewThunk';

interface ReviewsState {
  fieldStats: Record<string, FieldStats | null>;
  coachStats: Record<string, CoachStats | null>;
  loading: boolean;
  error?: string | null;
}

const initialState: ReviewsState = {
  fieldStats: {},
  coachStats: {},
  loading: false,
  error: null,
};

const reviewsSlice = createSlice({
  name: 'reviews',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getFieldStatsThunk.pending, (state) => {
      state.loading = true;
      state.error = null;
    });

    builder.addCase(getFieldStatsThunk.fulfilled, (state, action) => {
      state.loading = false;
      const fieldId = action.meta.arg as string;
      if (fieldId) state.fieldStats[fieldId] = action.payload as FieldStats;
    });

    builder.addCase(getFieldStatsThunk.rejected, (state, action) => {
      state.loading = false;
      state.error = (action.payload as string) || action.error?.message || 'Failed to load field stats';
    });

    // When a new field review is created we mark the cached stats for that field as stale (null)
    builder.addCase(createFieldReviewThunk.fulfilled, (state, action) => {
      const createdReview = action.payload as any;
      const fieldId = createdReview?.field || createdReview?.fieldId;
      if (fieldId) state.fieldStats[String(fieldId)] = null;
    });

    // Coach stats handlers
    builder.addCase(getCoachStatsThunk.pending, (state) => {
      state.loading = true;
      state.error = null;
    });

    builder.addCase(getCoachStatsThunk.fulfilled, (state, action) => {
      state.loading = false;
      const coachId = action.meta.arg as string;
      if (coachId) state.coachStats[coachId] = action.payload as CoachStats;
    });

    builder.addCase(getCoachStatsThunk.rejected, (state, action) => {
      state.loading = false;
      state.error = (action.payload as string) || action.error?.message || 'Failed to load coach stats';
    });
  },
});

export const reviewReducer = reviewsSlice.reducer;

export const selectFieldStats = (state: any, fieldId: string): FieldStats | null => {
  return state.reviews?.fieldStats?.[fieldId] ?? null;
};

export default reviewReducer;
