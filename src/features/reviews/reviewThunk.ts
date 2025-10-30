import { createAsyncThunk } from "@reduxjs/toolkit";
import type { CreateCoachReviewForm } from "../../types/reviewTypes";
import { createCoachReviewAPI } from "./reviewAPI";

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
      return rejectWithValue(err.message || "Failed to create review");
    }
  }
);
