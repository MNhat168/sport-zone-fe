import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import {
    getUserProfile,
    updateUserProfile,
    forgotPassword,
    resetPassword,
    changePassword,
} from "./userThunk";
import type { User, ErrorResponse } from "../../types/user-type";

interface UserState {
    user: User | null;
    loading: boolean;
    error: ErrorResponse | null;
    updateLoading: boolean;
    updateError: ErrorResponse | null;
    forgotPasswordLoading: boolean;
    forgotPasswordSuccess: boolean;
    forgotPasswordError: ErrorResponse | null;
    resetPasswordLoading: boolean;
    resetPasswordSuccess: boolean;
    resetPasswordError: ErrorResponse | null;
    changePasswordLoading: boolean;
    changePasswordSuccess: boolean;
    changePasswordError: ErrorResponse | null;
}

const initialState: UserState = {
    user: null,
    loading: false,
    error: null,
    updateLoading: false,
    updateError: null,
    forgotPasswordLoading: false,
    forgotPasswordSuccess: false,
    forgotPasswordError: null,
    resetPasswordLoading: false,
    resetPasswordSuccess: false,
    resetPasswordError: null,
    changePasswordLoading: false,
    changePasswordSuccess: false,
    changePasswordError: null,
};

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
            state.updateError = null;
            state.forgotPasswordError = null;
            state.resetPasswordError = null;
            state.changePasswordError = null;
        },
        clearSuccessStates: (state) => {
            state.forgotPasswordSuccess = false;
            state.resetPasswordSuccess = false;
            state.changePasswordSuccess = false;
        },
        updateUserData: (state, action: PayloadAction<User>) => {
            state.user = action.payload;
        },
        // Sync user data with auth store
        syncUserFromAuth: (state, action: PayloadAction<User>) => {
            state.user = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            // Get user profile
            .addCase(getUserProfile.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getUserProfile.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload;
                state.error = null;
            })
            .addCase(getUserProfile.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || { message: "Failed to get profile", status: "500" };
            })

            // Update user profile
            .addCase(updateUserProfile.pending, (state) => {
                state.updateLoading = true;
                state.updateError = null;
            })
            .addCase(updateUserProfile.fulfilled, (state, action) => {
                state.updateLoading = false;
                state.user = action.payload;
                state.updateError = null;
            })
            .addCase(updateUserProfile.rejected, (state, action) => {
                state.updateLoading = false;
                state.updateError = action.payload || { message: "Failed to update profile", status: "500" };
            })

            // Forgot password
            .addCase(forgotPassword.pending, (state) => {
                state.forgotPasswordLoading = true;
                state.forgotPasswordError = null;
                state.forgotPasswordSuccess = false;
            })
            .addCase(forgotPassword.fulfilled, (state) => {
                state.forgotPasswordLoading = false;
                state.forgotPasswordSuccess = true;
                state.forgotPasswordError = null;
            })
            .addCase(forgotPassword.rejected, (state, action) => {
                state.forgotPasswordLoading = false;
                state.forgotPasswordError = action.payload || { message: "Failed to send reset email", status: "500" };
                state.forgotPasswordSuccess = false;
            })

            // Reset password
            .addCase(resetPassword.pending, (state) => {
                state.resetPasswordLoading = true;
                state.resetPasswordError = null;
                state.resetPasswordSuccess = false;
            })
            .addCase(resetPassword.fulfilled, (state) => {
                state.resetPasswordLoading = false;
                state.resetPasswordSuccess = true;
                state.resetPasswordError = null;
            })
            .addCase(resetPassword.rejected, (state, action) => {
                state.resetPasswordLoading = false;
                state.resetPasswordError = action.payload || { message: "Failed to reset password", status: "500" };
                state.resetPasswordSuccess = false;
            })

            // Change password
            .addCase(changePassword.pending, (state) => {
                state.changePasswordLoading = true;
                state.changePasswordError = null;
                state.changePasswordSuccess = false;
            })
            .addCase(changePassword.fulfilled, (state) => {
                state.changePasswordLoading = false;
                state.changePasswordSuccess = true;
                state.changePasswordError = null;
            })
            .addCase(changePassword.rejected, (state, action) => {
                state.changePasswordLoading = false;
                state.changePasswordError = action.payload || { message: "Failed to change password", status: "500" };
                state.changePasswordSuccess = false;
            });
    },
});

export const { 
    clearError, 
    clearSuccessStates, 
    updateUserData, 
    syncUserFromAuth 
} = userSlice.actions;

export default userSlice.reducer;