import { createAsyncThunk } from '@reduxjs/toolkit';
import type {
  OverdueAccountsResponse,
  ErrorResponse,
  SuspendUserPayload,
} from '../../types/billing-type';
import axiosInstance from '../../lib/axios';
import {
  GET_OVERDUE_ACCOUNTS_API,
  SUSPEND_USER_API,
  UNSUSPEND_USER_API,
} from './billingAPI';

/**
 * Get overdue accounts
 */
export const getOverdueAccounts = createAsyncThunk<
  OverdueAccountsResponse,
  { page?: number; limit?: number },
  { rejectValue: ErrorResponse }
>('billing/getOverdueAccounts', async (params, thunkAPI) => {
  try {
    const response = await axiosInstance.get(
      GET_OVERDUE_ACCOUNTS_API(params.page, params.limit)
    );

    // Handle different response structures
    // Backend uses ResponseInterceptor that wraps responses as { success: true, data: ... }
    const raw = response.data;

    // Case 1: Wrapped in success object (most common - from ResponseInterceptor)
    if (raw && raw.success && raw.data) {
      // raw.data should be { data: [...], pagination: {...} }
      if (Array.isArray(raw.data.data) && raw.data.pagination) {
        return raw.data as OverdueAccountsResponse;
      }
      // If data is already the response structure
      if (Array.isArray(raw.data.data) || (raw.data.data && raw.data.pagination)) {
        return raw.data as OverdueAccountsResponse;
      }
    }

    // Case 2: Direct response with data and pagination (if interceptor skipped)
    if (raw && Array.isArray(raw.data) && raw.pagination) {
      return raw as OverdueAccountsResponse;
    }

    // Case 3: Response is nested deeper
    if (raw && raw.data && Array.isArray(raw.data.data) && raw.data.pagination) {
      return raw.data as OverdueAccountsResponse;
    }

    throw new Error('Invalid response structure from server');
  } catch (error: any) {
    const errorResponse: ErrorResponse = {
      message:
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Failed to fetch overdue accounts',
      status: error.response?.status?.toString() || '500',
    };
    return thunkAPI.rejectWithValue(errorResponse);
  }
});

/**
 * Suspend user
 */
export const suspendUser = createAsyncThunk<
  void,
  SuspendUserPayload,
  { rejectValue: ErrorResponse }
>('billing/suspendUser', async (payload, thunkAPI) => {
  try {
    await axiosInstance.post(SUSPEND_USER_API(payload.userId), {
      reason: payload.reason,
    });

    // Refetch overdue accounts after suspending
    const state = thunkAPI.getState() as any;
    const currentPage = state.billing.pagination?.page || 1;
    const currentLimit = state.billing.pagination?.limit || 10;
    thunkAPI.dispatch(getOverdueAccounts({ page: currentPage, limit: currentLimit }));
  } catch (error: any) {
    const errorResponse: ErrorResponse = {
      message:
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Failed to suspend user',
      status: error.response?.status?.toString() || '500',
    };
    return thunkAPI.rejectWithValue(errorResponse);
  }
});

/**
 * Unsuspend user
 */
export const unsuspendUser = createAsyncThunk<
  void,
  { userId: string },
  { rejectValue: ErrorResponse }
>('billing/unsuspendUser', async (payload, thunkAPI) => {
  try {
    await axiosInstance.post(UNSUSPEND_USER_API(payload.userId));

    // Refetch overdue accounts after unsuspending
    const state = thunkAPI.getState() as any;
    const currentPage = state.billing.pagination?.page || 1;
    const currentLimit = state.billing.pagination?.limit || 10;
    thunkAPI.dispatch(getOverdueAccounts({ page: currentPage, limit: currentLimit }));
  } catch (error: any) {
    const errorResponse: ErrorResponse = {
      message:
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Failed to unsuspend user',
      status: error.response?.status?.toString() || '500',
    };
    return thunkAPI.rejectWithValue(errorResponse);
  }
});

