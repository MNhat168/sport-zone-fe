import { createSlice } from "@reduxjs/toolkit";
import type { Coach, LegacyCoach, CoachDetail, ErrorResponse } from "../../types/coach-type";
import {
    getCoaches,
    getCoachById,
    getAllCoaches,
    getCoachIdByUserId,
} from "./coachThunk";

interface CoachState {
    // Coaches data
    coaches: Coach[];
    allCoaches: LegacyCoach[];
    currentCoach: CoachDetail | null;
    resolvedCoachId: string | null;
    resolvedCoachRaw: any | null;
    
    // Loading states
    loading: boolean;
    detailLoading: boolean;
    allCoachesLoading: boolean;
    resolveCoachIdLoading: boolean;
    
    // Error states
    error: ErrorResponse | null;
    detailError: ErrorResponse | null;
    allCoachesError: ErrorResponse | null;
    resolveCoachIdError: ErrorResponse | null;
}

const initialState: CoachState = {
    coaches: [],
    allCoaches: [],
    currentCoach: null,
    resolvedCoachId: null,
    resolvedCoachRaw: null,
    loading: false,
    detailLoading: false,
    allCoachesLoading: false,
    resolveCoachIdLoading: false,
    error: null,
    detailError: null,
    allCoachesError: null,
    resolveCoachIdError: null,
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
            state.resolveCoachIdError = null;
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
            })
            
            // Resolve coach id by user id
            .addCase(getCoachIdByUserId.pending, (state) => {
                state.resolveCoachIdLoading = true;
                state.resolveCoachIdError = null;
            })
            .addCase(getCoachIdByUserId.fulfilled, (state, action) => {
                state.resolveCoachIdLoading = false;
                state.resolvedCoachId = action.payload.coachId ?? null;
                state.resolvedCoachRaw = action.payload.data ?? null;
                state.resolveCoachIdError = null;
            })
            .addCase(getCoachIdByUserId.rejected, (state, action) => {
                state.resolveCoachIdLoading = false;
                state.resolveCoachIdError = action.payload || { message: "Unknown error", status: "500" };
            });
    },
});

export const {
    clearCurrentCoach,
    clearErrors,
    resetCoachState,
} = coachSlice.actions;

export default coachSlice.reducer;
