import { createSlice } from "@reduxjs/toolkit";
import type { Field, ErrorResponse } from "../../types/field-type";
import {
    getAllFields,
    getFieldById,
    checkFieldAvailability,
    createField,
    createFieldWithImages,
    updateField,
    deleteField,
    schedulePriceUpdate,
    cancelScheduledPriceUpdate,
    getScheduledPriceUpdates,
    getFieldAmenities,
    updateFieldAmenities,
} from "./fieldThunk";

interface FieldState {
    // Fields data
    fields: Field[];
    currentField: Field | null;
    pagination: import("../../types/field-type").Pagination | null;
    
    // Availability data (Pure Lazy Creation)
    availability: import("../../types/field-type").FieldAvailabilityData[] | null;
    
    // Price scheduling data
    scheduledPriceUpdates: import("../../types/field-type").ScheduledPriceUpdate[] | null;
    
    // Field amenities data
    fieldAmenities: import("../../types/field-type").FieldAmenity[] | null;
    
    // Loading states
    loading: boolean;
    createLoading: boolean;
    createWithImagesLoading: boolean;
    updateLoading: boolean;
    deleteLoading: boolean;
    availabilityLoading: boolean;
    priceSchedulingLoading: boolean;
    amenitiesLoading: boolean;
    
    // Error states
    error: ErrorResponse | null;
    createError: ErrorResponse | null;
    createWithImagesError: ErrorResponse | null;
    updateError: ErrorResponse | null;
    deleteError: ErrorResponse | null;
    availabilityError: ErrorResponse | null;
    priceSchedulingError: ErrorResponse | null;
    amenitiesError: ErrorResponse | null;
}

const initialState: FieldState = {
    fields: [],
    currentField: null,
    pagination: null,
    availability: null,
    scheduledPriceUpdates: null,
    fieldAmenities: null,
    loading: false,
    createLoading: false,
    createWithImagesLoading: false,
    updateLoading: false,
    deleteLoading: false,
    availabilityLoading: false,
    priceSchedulingLoading: false,
    amenitiesLoading: false,
    error: null,
    createError: null,
    createWithImagesError: null,
    updateError: null,
    deleteError: null,
    availabilityError: null,
    priceSchedulingError: null,
    amenitiesError: null,
};

const fieldSlice = createSlice({
    name: "field",
    initialState,
    reducers: {
        clearCurrentField: (state) => {
            state.currentField = null;
        },
        clearAvailability: (state) => {
            state.availability = null;
            state.availabilityError = null;
        },
        clearErrors: (state) => {
            state.error = null;
            state.createError = null;
            state.createWithImagesError = null;
            state.updateError = null;
            state.deleteError = null;
            state.availabilityError = null;
            state.priceSchedulingError = null;
            state.amenitiesError = null;
        },
        clearAmenities: (state) => {
            state.fieldAmenities = null;
            state.amenitiesError = null;
        },
        resetFieldState: () => initialState,
    },
    extraReducers: (builder) => {
        builder
            // Get all fields
            .addCase(getAllFields.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getAllFields.fulfilled, (state, action) => {
                state.loading = false;
                state.fields = action.payload.data;
                state.pagination = action.payload.pagination || null;
                state.error = null;
            })
            .addCase(getAllFields.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || { message: "Unknown error", status: "500" };
            })

            // Get field by ID
            .addCase(getFieldById.pending, (state) => {
                console.log("⏳ [FIELD SLICE] getFieldById pending - setting loading to true");
                state.loading = true;
                state.error = null;
            })
            .addCase(getFieldById.fulfilled, (state, action) => {
                console.log("✅ [FIELD SLICE] getFieldById fulfilled - updating currentField:", {
                    fieldId: action.payload.data.id,
                    fieldName: action.payload.data.name,
                    fieldLocation: action.payload.data.location,
                    fieldBasePrice: action.payload.data.basePrice,
                    timestamp: new Date().toISOString()
                });
                state.loading = false;
                state.currentField = action.payload.data;
                state.error = null;
            })
            .addCase(getFieldById.rejected, (state, action) => {
                console.error("❌ [FIELD SLICE] getFieldById rejected:", {
                    error: action.payload,
                    timestamp: new Date().toISOString()
                });
                state.loading = false;
                state.error = action.payload || { message: "Unknown error", status: "500" };
            })

            // Check availability (Pure Lazy Creation)
            .addCase(checkFieldAvailability.pending, (state) => {
                state.availabilityLoading = true;
                state.availabilityError = null;
            })
            .addCase(checkFieldAvailability.fulfilled, (state, action) => {
                state.availabilityLoading = false;
                state.availability = action.payload.data;
                state.availabilityError = null;
            })
            .addCase(checkFieldAvailability.rejected, (state, action) => {
                state.availabilityLoading = false;
                state.availabilityError = action.payload || { message: "Unknown error", status: "500" };
            })

            // Create field
            .addCase(createField.pending, (state) => {
                state.createLoading = true;
                state.createError = null;
            })
            .addCase(createField.fulfilled, (state, action) => {
                state.createLoading = false;
                state.fields.unshift(action.payload.data);
                state.createError = null;
            })
            .addCase(createField.rejected, (state, action) => {
                state.createLoading = false;
                state.createError = action.payload || { message: "Unknown error", status: "500" };
            })

            // Create field with images
            .addCase(createFieldWithImages.pending, (state) => {
                state.createWithImagesLoading = true;
                state.createWithImagesError = null;
            })
            .addCase(createFieldWithImages.fulfilled, (state, action) => {
                state.createWithImagesLoading = false;
                state.fields.unshift(action.payload.data);
                state.createWithImagesError = null;
            })
            .addCase(createFieldWithImages.rejected, (state, action) => {
                state.createWithImagesLoading = false;
                state.createWithImagesError = action.payload || { message: "Unknown error", status: "500" };
            })

            // Update field
            .addCase(updateField.pending, (state) => {
                state.updateLoading = true;
                state.updateError = null;
            })
            .addCase(updateField.fulfilled, (state, action) => {
                state.updateLoading = false;
                const updatedField = action.payload.data;
                
                // Update in fields array
                const fieldsIndex = state.fields.findIndex(field => field.id === updatedField.id);
                if (fieldsIndex !== -1) {
                    state.fields[fieldsIndex] = updatedField;
                }
                
                // Update current field if it's the same
                if (state.currentField?.id === updatedField.id) {
                    state.currentField = updatedField;
                }
                
                state.updateError = null;
            })
            .addCase(updateField.rejected, (state, action) => {
                state.updateLoading = false;
                state.updateError = action.payload || { message: "Unknown error", status: "500" };
            })

            // Delete field
            .addCase(deleteField.pending, (state) => {
                state.deleteLoading = true;
                state.deleteError = null;
            })
            .addCase(deleteField.fulfilled, (state, action) => {
                state.deleteLoading = false;
                const fieldId = action.payload.fieldId;
                
                // Remove from fields array
                state.fields = state.fields.filter(field => field.id !== fieldId);
                
                // Clear current field if it's the deleted one
                if (state.currentField?.id === fieldId) {
                    state.currentField = null;
                }
                
                state.deleteError = null;
            })
            .addCase(deleteField.rejected, (state, action) => {
                state.deleteLoading = false;
                state.deleteError = action.payload || { message: "Unknown error", status: "500" };
            })

            // Schedule price update
            .addCase(schedulePriceUpdate.pending, (state) => {
                state.priceSchedulingLoading = true;
                state.priceSchedulingError = null;
            })
            .addCase(schedulePriceUpdate.fulfilled, (state) => {
                state.priceSchedulingLoading = false;
                state.priceSchedulingError = null;
            })
            .addCase(schedulePriceUpdate.rejected, (state, action) => {
                state.priceSchedulingLoading = false;
                state.priceSchedulingError = action.payload || { message: "Unknown error", status: "500" };
            })

            // Cancel scheduled price update
            .addCase(cancelScheduledPriceUpdate.pending, (state) => {
                state.priceSchedulingLoading = true;
                state.priceSchedulingError = null;
            })
            .addCase(cancelScheduledPriceUpdate.fulfilled, (state) => {
                state.priceSchedulingLoading = false;
                state.priceSchedulingError = null;
            })
            .addCase(cancelScheduledPriceUpdate.rejected, (state, action) => {
                state.priceSchedulingLoading = false;
                state.priceSchedulingError = action.payload || { message: "Unknown error", status: "500" };
            })

            // Get scheduled price updates
            .addCase(getScheduledPriceUpdates.pending, (state) => {
                state.priceSchedulingLoading = true;
                state.priceSchedulingError = null;
            })
            .addCase(getScheduledPriceUpdates.fulfilled, (state, action) => {
                state.priceSchedulingLoading = false;
                state.scheduledPriceUpdates = action.payload.data;
                state.priceSchedulingError = null;
            })
            .addCase(getScheduledPriceUpdates.rejected, (state, action) => {
                state.priceSchedulingLoading = false;
                state.priceSchedulingError = action.payload || { message: "Unknown error", status: "500" };
            })

            // Get field amenities
            .addCase(getFieldAmenities.pending, (state) => {
                state.amenitiesLoading = true;
                state.amenitiesError = null;
            })
            .addCase(getFieldAmenities.fulfilled, (state, action) => {
                state.amenitiesLoading = false;
                state.fieldAmenities = action.payload.amenities;
                state.amenitiesError = null;
            })
            .addCase(getFieldAmenities.rejected, (state, action) => {
                state.amenitiesLoading = false;
                state.amenitiesError = action.payload || { message: "Unknown error", status: "500" };
            })

            // Update field amenities
            .addCase(updateFieldAmenities.pending, (state) => {
                state.amenitiesLoading = true;
                state.amenitiesError = null;
            })
            .addCase(updateFieldAmenities.fulfilled, (state, action) => {
                state.amenitiesLoading = false;
                state.fieldAmenities = action.payload.field.amenities;
                state.amenitiesError = null;
            })
            .addCase(updateFieldAmenities.rejected, (state, action) => {
                state.amenitiesLoading = false;
                state.amenitiesError = action.payload || { message: "Unknown error", status: "500" };
            });
    },
});

export const {
    clearCurrentField,
    clearAvailability,
    clearErrors,
    clearAmenities,
    resetFieldState,
} = fieldSlice.actions;

export default fieldSlice.reducer;