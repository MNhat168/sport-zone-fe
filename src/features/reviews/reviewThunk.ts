import { createAsyncThunk } from "@reduxjs/toolkit";
import type { CreateCoachReviewForm, CreateFieldReviewForm } from "../../types/reviewTypes";
import { createCoachReviewAPI, createFieldReviewAPI } from "./reviewAPI";
import { getFieldStatsAPI } from './reviewAPI';
import { getCoachStatsAPI } from './reviewAPI';
import type { FieldStats } from '../../types/reviewTypes';
import type { CoachStats } from '../../types/reviewTypes';

/**
 * Thunk for creating a coach review
 * @param data - CreateCoachReviewForm
 * @returns Review object from API
 */
export const createCoachReviewThunk = createAsyncThunk(
  "reviews/createCoachReview",
  async (data: CreateCoachReviewForm, { rejectWithValue }) => {
    try {
      return await createCoachReviewAPI(data);
    } catch (err: any) {
      // Extract error response data which may contain profanity info
      const errorData = err?.response?.data || {};
      const message = errorData?.message || err.message || "Failed to create review";
      const flaggedWords = errorData?.flaggedWords || [];
      
      return rejectWithValue({
        message,
        flaggedWords,
        status: err?.response?.status,
        ...errorData
      });
    }
  }
);

/**
 * Thunk for creating a field review
 * @param data - CreateFieldReviewForm
 * @returns Review object from API
 */
export const createFieldReviewThunk = createAsyncThunk(
  "reviews/createFieldReview",
  async (data: CreateFieldReviewForm, { rejectWithValue }) => {
    try {
      return await createFieldReviewAPI(data);
    } catch (err: any) {
      // Extract error response data which may contain profanity info
      const errorData = err?.response?.data || {};
      const message = errorData?.message || err.message || "Failed to create field review";
      const flaggedWords = errorData?.flaggedWords || [];
      
      return rejectWithValue({
        message,
        flaggedWords,
        status: err?.response?.status,
        ...errorData
      });
    }
  }
);

/**
 * Thunk to fetch field aggregated stats (totalReviews, averageRating)
 */
export const getFieldStatsThunk = createAsyncThunk(
  'reviews/getFieldStats',
  async (fieldId: string, { rejectWithValue }) => {
    try {
      const res: FieldStats = await getFieldStatsAPI(fieldId);
      return res;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to fetch field stats');
    }
  }
);

/**
 * Thunk to fetch coach aggregated stats (totalReviews, averageRating)
 */
export const getCoachStatsThunk = createAsyncThunk(
  'reviews/getCoachStats',
  async (coachId: string, { rejectWithValue }) => {
    try {
      const res: CoachStats = await getCoachStatsAPI(coachId);
      return res;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to fetch coach stats');
    }
  }
);
