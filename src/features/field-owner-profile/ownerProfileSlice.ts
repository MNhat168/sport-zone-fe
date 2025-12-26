import { createSlice } from "@reduxjs/toolkit";
import type { FieldOwnerProfile } from "../../types/field-owner-profile-type";
import type { ErrorResponse } from "../../types/user-type";
import {
    createOwnerProfile,
    getMyOwnerProfile,
    updateMyOwnerProfile,
    getOwnerProfileById,
    fetchFieldOwnerProfile,
} from "./ownerProfileThunk";

interface OwnerProfileState {
    myProfile: FieldOwnerProfile | null;
    currentProfile: FieldOwnerProfile | null; // for public viewing by id
    loading: boolean;
    error: ErrorResponse | null;
    updating: boolean;
    updateError: ErrorResponse | null;
    creating: boolean;
    createError: ErrorResponse | null;
}

const initialState: OwnerProfileState = {
    myProfile: null,
    currentProfile: null,
    loading: false,
    error: null,
    updating: false,
    updateError: null,
    creating: false,
    createError: null,
};

const ownerProfileSlice = createSlice({
    name: "ownerProfile",
    initialState,
    reducers: {
        clearOwnerProfileError(state) {
            state.error = null;
            state.updateError = null;
            state.createError = null;
        },
    },
    extraReducers: (builder) => {
        // Get mine
        builder
            .addCase(getMyOwnerProfile.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getMyOwnerProfile.fulfilled, (state, action) => {
                state.loading = false;
                state.myProfile = action.payload;
            })
            .addCase(getMyOwnerProfile.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || null;
            })
            .addCase(fetchFieldOwnerProfile.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchFieldOwnerProfile.fulfilled, (state, action) => {
                state.loading = false;
                state.myProfile = action.payload;
            })
            .addCase(fetchFieldOwnerProfile.rejected, (state) => {
                state.loading = false;
            });
        // Create
        builder
            .addCase(createOwnerProfile.pending, (state) => {
                state.creating = true;
                state.createError = null;
            })
            .addCase(createOwnerProfile.fulfilled, (state, action) => {
                state.creating = false;
                state.myProfile = action.payload;
            })
            .addCase(createOwnerProfile.rejected, (state, action) => {
                state.creating = false;
                state.createError = action.payload || null;
            });

        // Update mine
        builder
            .addCase(updateMyOwnerProfile.pending, (state) => {
                state.updating = true;
                state.updateError = null;
            })
            .addCase(updateMyOwnerProfile.fulfilled, (state, action) => {
                state.updating = false;
                state.myProfile = action.payload;
            })
            .addCase(updateMyOwnerProfile.rejected, (state, action) => {
                state.updating = false;
                state.updateError = action.payload || null;
            });

        // Get by id (public)
        builder
            .addCase(getOwnerProfileById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getOwnerProfileById.fulfilled, (state, action) => {
                state.loading = false;
                state.currentProfile = action.payload;
            })
            .addCase(getOwnerProfileById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || null;
            });
    },
});

export const { clearOwnerProfileError } = ownerProfileSlice.actions;
export default ownerProfileSlice.reducer;


