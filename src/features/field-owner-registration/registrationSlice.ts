import { createSlice } from "@reduxjs/toolkit";
import {
    submitRegistrationRequest,
    getMyRegistrationStatus,
    type RegistrationRequestResponse,
} from "./registrationThunk";

interface RegistrationState {
    currentRequest: RegistrationRequestResponse | null;
    loading: boolean;
    error: string | null;
    submitting: boolean;
}

const initialState: RegistrationState = {
    currentRequest: null,
    loading: false,
    error: null,
    submitting: false,
};

const registrationSlice = createSlice({
    name: "registration",
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
        // Submit registration request
        builder
            .addCase(submitRegistrationRequest.pending, (state) => {
                state.submitting = true;
                state.error = null;
            })
            .addCase(submitRegistrationRequest.fulfilled, (state, action) => {
                state.submitting = false;
                state.currentRequest = action.payload;
                state.error = null;
            })
            .addCase(submitRegistrationRequest.rejected, (state, action) => {
                state.submitting = false;
                state.error = action.payload?.message || "Failed to submit registration request";
            });

        // Get my registration status
        builder
            .addCase(getMyRegistrationStatus.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getMyRegistrationStatus.fulfilled, (state, action) => {
                state.loading = false;
                state.currentRequest = action.payload;
                state.error = null;
            })
            .addCase(getMyRegistrationStatus.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || "Failed to get registration status";
            });
    },
});

export const { clearError, clearRegistration } = registrationSlice.actions;
export default registrationSlice.reducer;

