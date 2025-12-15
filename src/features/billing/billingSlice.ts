import { createSlice } from '@reduxjs/toolkit';
import type { BillingState } from '../../types/billing-type';
import {
  getOverdueAccounts,
  suspendUser,
  unsuspendUser,
} from './billingThunk';

const initialState: BillingState = {
  overdueAccounts: [],
  pagination: null,
  loading: false,
  error: null,
  suspendLoading: false,
  suspendError: null,
  unsuspendLoading: false,
  unsuspendError: null,
};

const billingSlice = createSlice({
  name: 'billing',
  initialState,
  reducers: {
    clearBillingError: (state) => {
      state.error = null;
      state.suspendError = null;
      state.unsuspendError = null;
    },
    clearOverdueAccounts: (state) => {
      state.overdueAccounts = [];
      state.pagination = null;
    },
  },
  extraReducers: (builder) => {
    // Get overdue accounts
    builder.addCase(getOverdueAccounts.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(getOverdueAccounts.fulfilled, (state, action) => {
      state.loading = false;
      state.overdueAccounts = action.payload.data;
      state.pagination = action.payload.pagination;
    });
    builder.addCase(getOverdueAccounts.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || { message: 'Failed to load overdue accounts', status: '500' };
    });

    // Suspend user
    builder.addCase(suspendUser.pending, (state) => {
      state.suspendLoading = true;
      state.suspendError = null;
    });
    builder.addCase(suspendUser.fulfilled, (state) => {
      state.suspendLoading = false;
    });
    builder.addCase(suspendUser.rejected, (state, action) => {
      state.suspendLoading = false;
      state.suspendError = action.payload || { message: 'Failed to suspend user', status: '500' };
    });

    // Unsuspend user
    builder.addCase(unsuspendUser.pending, (state) => {
      state.unsuspendLoading = true;
      state.unsuspendError = null;
    });
    builder.addCase(unsuspendUser.fulfilled, (state) => {
      state.unsuspendLoading = false;
    });
    builder.addCase(unsuspendUser.rejected, (state, action) => {
      state.unsuspendLoading = false;
      state.unsuspendError = action.payload || { message: 'Failed to unsuspend user', status: '500' };
    });
  },
});

export const { clearBillingError, clearOverdueAccounts } = billingSlice.actions;
export default billingSlice.reducer;

