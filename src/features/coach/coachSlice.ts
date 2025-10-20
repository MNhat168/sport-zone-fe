import { createSlice } from "@reduxjs/toolkit";
import type { Coach, LegacyCoach, CoachDetail, ErrorResponse } from "../../types/coach-type";
import {
    getCoaches,
    getCoachById,
    getAllCoaches,
} from "./coachThunk";

interface CoachState {
    // Coaches data
    coaches: Coach[];
    allCoaches: LegacyCoach[];
    currentCoach: CoachDetail | null;
    
    // Loading states
    loading: boolean;
    detailLoading: boolean;
    allCoachesLoading: boolean;
    
    // Error states
    error: ErrorResponse | null;
    detailError: ErrorResponse | null;
    allCoachesError: ErrorResponse | null;
}

const initialState: CoachState = {
    coaches: [],
    allCoaches: [],
    currentCoach: null,
    loading: false,
    detailLoading: false,
    allCoachesLoading: false,
    error: null,
    detailError: null,
    allCoachesError: null,
};

const coachSlice = createSlice({
    name: "coach",
    initialState,
    reducers: {
        clearCurrentCoach: (state) => {
            state.currentCoach = null;
        },
        clearErrors: (state) => {
            state.error = null;
            state.detailError = null;
            state.allCoachesError = null;
        },
        resetCoachState: () => initialState,
    },
    extraReducers: (builder) => {
        builder
            // Get coaches with filters
            .addCase(getCoaches.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getCoaches.fulfilled, (state, action) => {
                state.loading = false;
                state.coaches = action.payload.data;
                state.error = null;
            })
            .addCase(getCoaches.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || { message: "Unknown error", status: "500" };
            })

            // Get coach by ID
            .addCase(getCoachById.pending, (state) => {
                console.log("⏳ [COACH SLICE] getCoachById pending - setting detailLoading to true");
                state.detailLoading = true;
                state.detailError = null;
            })
            .addCase(getCoachById.fulfilled, (state, action) => {
                console.log("✅ [COACH SLICE] getCoachById fulfilled - updating currentCoach:", {
                    coachId: action.payload.data.id,
                    coachName: action.payload.data.name,
                    coachRating: action.payload.data.rating,
                    coachPrice: action.payload.data.price,
                    timestamp: new Date().toISOString()
                });
                state.detailLoading = false;
                state.currentCoach = action.payload.data;
                state.detailError = null;
            })
            .addCase(getCoachById.rejected, (state, action) => {
                console.error("❌ [COACH SLICE] getCoachById rejected:", {
                    error: action.payload,
                    timestamp: new Date().toISOString()
                });
                state.detailLoading = false;
                state.detailError = action.payload || { message: "Unknown error", status: "500" };
            })

            // Get all coaches (legacy format)
            .addCase(getAllCoaches.pending, (state) => {
                state.allCoachesLoading = true;
                state.allCoachesError = null;
            })
            .addCase(getAllCoaches.fulfilled, (state, action) => {
                state.allCoachesLoading = false;
                state.allCoaches = action.payload.data;
                state.allCoachesError = null;
            })
            .addCase(getAllCoaches.rejected, (state, action) => {
                state.allCoachesLoading = false;
                state.allCoachesError = action.payload || { message: "Unknown error", status: "500" };
            });
    },
});

export const {
    clearCurrentCoach,
    clearErrors,
    resetCoachState,
} = coachSlice.actions;

export default coachSlice.reducer;
