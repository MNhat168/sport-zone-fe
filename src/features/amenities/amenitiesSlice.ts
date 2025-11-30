import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import {
  createAmenity,
  getAmenities,
  getAmenityById,
  updateAmenity,
  deleteAmenity,
  toggleAmenityStatus,
  getAmenitiesBySportType,
  getAmenitiesByType,
  getAmenitiesByTypeAndSport,
} from "./amenitiesThunk";
import type { Amenity, ErrorResponse, AmenitiesResponse } from "../../types/amenities-type";

interface AmenitiesState {
  amenities: Amenity[];
  currentAmenity: Amenity | null;
  total: number;
  page: number;
  limit: number;
  loading: boolean;
  error: ErrorResponse | null;
}

const initialState: AmenitiesState = {
  amenities: [],
  currentAmenity: null,
  total: 0,
  page: 1,
  limit: 10,
  loading: false,
  error: null,
};

const amenitiesSlice = createSlice({
  name: "amenities",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentAmenity: (state) => {
      state.currentAmenity = null;
    },
    setCurrentAmenity: (state, action: PayloadAction<Amenity>) => {
      state.currentAmenity = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create amenity
      .addCase(createAmenity.fulfilled, (state, action) => {
        state.loading = false;
        state.amenities.unshift(action.payload);
        state.total += 1;
      })
      
      // Get amenities
      .addCase(getAmenities.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload as AmenitiesResponse;
        state.amenities = Array.isArray(payload) ? payload : (payload.data || []);
        state.total = Array.isArray(payload) ? payload.length : (payload.total || 0);
        state.page = Array.isArray(payload) ? 1 : (payload.page || 1);
        state.limit = Array.isArray(payload) ? payload.length : (payload.limit || 10);
      })
      
      // Get amenity by ID
      .addCase(getAmenityById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentAmenity = action.payload;
      })
      
      // Update amenity
      .addCase(updateAmenity.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.amenities.findIndex(amenity => amenity._id === action.payload._id);
        if (index !== -1) {
          state.amenities[index] = action.payload;
        }
        if (state.currentAmenity?._id === action.payload._id) {
          state.currentAmenity = action.payload;
        }
      })
      
      // Delete amenity
      .addCase(deleteAmenity.fulfilled, (state, action) => {
        state.loading = false;
        state.amenities = state.amenities.filter(amenity => amenity._id !== action.meta.arg);
        state.total -= 1;
        if (state.currentAmenity?._id === action.meta.arg) {
          state.currentAmenity = null;
        }
      })
      
      // Toggle amenity status
      .addCase(toggleAmenityStatus.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.amenities.findIndex(amenity => amenity._id === action.payload._id);
        if (index !== -1) {
          state.amenities[index] = action.payload;
        }
        if (state.currentAmenity?._id === action.payload._id) {
          state.currentAmenity = action.payload;
        }
      })
      
      // Get amenities by sport type
      .addCase(getAmenitiesBySportType.fulfilled, (state, action) => {
        state.loading = false;
        state.amenities = action.payload;
      })
      
      // Get amenities by type
      .addCase(getAmenitiesByType.fulfilled, (state, action) => {
        state.loading = false;
        state.amenities = action.payload;
      })
      
      // Get amenities by type and sport
      .addCase(getAmenitiesByTypeAndSport.fulfilled, (state, action) => {
        state.loading = false;
        state.amenities = action.payload;
      })
      
      // Handle loading states
      .addMatcher(
        (action) => action.type.endsWith("/pending"),
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )
      // Handle error states
      .addMatcher(
        (action) => action.type.endsWith("/rejected"),
        (state, action: { payload?: ErrorResponse }) => {
          state.loading = false;
          state.error = action.payload || { statusCode: 500, message: "Unknown error", error: "Internal Server Error" };
        }
      );
  },
});

export const { clearError, clearCurrentAmenity, setCurrentAmenity } = amenitiesSlice.actions;
export default amenitiesSlice.reducer;
