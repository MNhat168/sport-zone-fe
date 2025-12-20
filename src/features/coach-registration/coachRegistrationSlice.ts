import { createSlice } from "@reduxjs/toolkit";
import {
    submitCoachRegistration,
    getMyCoachRegistration,
    type CoachRegistrationResponse,
} from "./coachRegistrationThunk";

interface CoachRegistrationState {
    currentRequest: CoachRegistrationResponse | null;
    loading: boolean;
    error: string | null;
    submitting: boolean;
}

const initialState: CoachRegistrationState = {
    currentRequest: null,
    loading: false,
    error: null,
    submitting: false,
};

const coachRegistrationSlice = createSlice({
    name: "coachRegistration",
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearRegistration: (state) => {
            state.currentRequest = null;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        // Submit coach registration
        builder
            .addCase(submitCoachRegistration.pending, (state) => {
                state.submitting = true;
                state.error = null;
            })
            .addCase(submitCoachRegistration.fulfilled, (state, action) => {
                state.submitting = false;
                state.currentRequest = action.payload;
                state.error = null;
            })
            .addCase(submitCoachRegistration.rejected, (state, action) => {
                state.submitting = false;
                state.error = action.payload?.message || "Failed to submit registration";
            });

        // Get my registration status
        builder
            .addCase(getMyCoachRegistration.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getMyCoachRegistration.fulfilled, (state, action) => {
                state.loading = false;
                state.currentRequest = action.payload;
                state.error = null;
            })
            .addCase(getMyCoachRegistration.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || "Failed to get registration status";
            });
    },
});

export const { clearError, clearRegistration } = coachRegistrationSlice.actions;
export default coachRegistrationSlice.reducer;
