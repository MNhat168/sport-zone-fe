import { createSlice } from "@reduxjs/toolkit";
import {
    getUserProfile,
    updateUserProfile,
    setFavouriteSports,
    setFavouriteCoaches,
    removeFavouriteCoaches,
    setFavouriteFields,
    removeFavouriteFields
} from "./userThunk";
import type { User, ErrorResponse } from "../../types/user-type";

interface UserState {
    user: User | null;
    loading: boolean;
    error: ErrorResponse | null;
}

const initialState: UserState = {
    user: null,
    loading: false,
    error: null,
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

        // Set Favourite Coaches
        builder.addCase(setFavouriteCoaches.fulfilled, (state, action) => {
            state.user = action.payload;
        });

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
