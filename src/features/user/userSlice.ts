import { createSlice } from "@reduxjs/toolkit";
import {
    getUserProfile,
    updateUserProfile,
    setFavouriteSports,
    setFavouriteCoaches,
    removeFavouriteCoaches,
    setFavouriteFields,
    removeFavouriteFields,
    getFavouriteFields,
    getFavouriteCoaches,
} from "./userThunk";
import type { User, ErrorResponse } from "../../types/user-type";

interface UserState {
    user: User | null;
    loading: boolean;
    error: ErrorResponse | null;
    favouriteFields?: import('../../types/favourite-field').FavouriteField[] | null;
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
    favouriteFields: null,
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
        clearUser: (state) => {
            state.user = null;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        // Get User Profile
        builder
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
            });

        // Update User Profile
        builder
            .addCase(updateUserProfile.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateUserProfile.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload;
                state.error = null;
            })
            .addCase(updateUserProfile.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || { message: "Failed to update profile", status: "500" };
            });

        // Set Favourite Sports
        builder.addCase(setFavouriteSports.fulfilled, (state, action) => {
            state.user = action.payload;
        });

            // Get favourite fields
            .addCase((getFavouriteFields as any)?.pending, (state) => {
                // no-op or set a loading flag if desired
            })
            .addCase((getFavouriteFields as any)?.fulfilled, (state, action) => {
                state.favouriteFields = action.payload;
            })
            .addCase((getFavouriteFields as any)?.rejected, (_state, action) => {
                console.error('getFavouriteFields failed', action.payload);
            })

                    // Get favourite coaches
                    .addCase((getFavouriteCoaches as any)?.pending, (state) => {
                        // no-op or set loading
                    })
                    .addCase((getFavouriteCoaches as any)?.fulfilled, (state, action) => {
                        // store under a new key on state.user to avoid changing existing shape
                        (state as any).favouriteCoaches = action.payload;
                    })
                    .addCase((getFavouriteCoaches as any)?.rejected, (_state, action) => {
                        console.error('getFavouriteCoaches failed', action.payload);
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

        // Remove Favourite Coaches
        builder.addCase(removeFavouriteCoaches.fulfilled, (state, action) => {
            state.user = action.payload;
        });

        // Set Favourite Fields
        builder.addCase(setFavouriteFields.fulfilled, (state, action) => {
            state.user = action.payload;
        });

        // Remove Favourite Fields
        builder.addCase(removeFavouriteFields.fulfilled, (state, action) => {
            state.user = action.payload;
        });
    },
});

export const { clearUser } = userSlice.actions;

export default userSlice.reducer;
