import { createSlice } from '@reduxjs/toolkit';
import type { FieldStats } from '../../types/reviewTypes';
import { getFieldStatsThunk, createFieldReviewThunk } from './reviewThunk';

interface ReviewsState {
  fieldStats: Record<string, FieldStats | null>;
  loading: boolean;
  error?: string | null;
}

const initialState: ReviewsState = {
  fieldStats: {},
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
  },
});

export const reviewReducer = reviewsSlice.reducer;

export const selectFieldStats = (state: any, fieldId: string): FieldStats | null => {
  return state.reviews?.fieldStats?.[fieldId] ?? null;
};

export default reviewReducer;
