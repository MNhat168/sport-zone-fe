import { createAsyncThunk } from "@reduxjs/toolkit";
import type { CreateCoachReviewForm, CreateFieldReviewForm } from "../../types/reviewTypes";
import { createCoachReviewAPI, createFieldReviewAPI } from "./reviewAPI";

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
      return rejectWithValue(err.message || "Failed to create field review");
    }
  }
);
