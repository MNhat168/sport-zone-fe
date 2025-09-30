import { createSlice } from "@reduxjs/toolkit";
import type { Field, ErrorResponse } from "../../types/field-type";
import {
    getAllFields,
    getFieldById,
    getFieldsByOwner,
    checkFieldAvailability,
    createField,
    updateField,
    deleteField,
} from "./fieldThunk";

interface FieldState {
    // Fields data
    fields: Field[];
    currentField: Field | null;
    ownerFields: Field[];
    
    // Pagination
    pagination: {
        page: number;
        limit: number;
        total: number;
    } | null;
    
    // Availability check
    availability: {
        available: boolean;
        conflictingBookings: Array<{
            id: string;
            startTime: string;
            endTime: string;
        }>;
    } | null;
    
    // Loading states
    loading: boolean;
    createLoading: boolean;
    updateLoading: boolean;
    deleteLoading: boolean;
    availabilityLoading: boolean;
    
    // Error states
    error: ErrorResponse | null;
    createError: ErrorResponse | null;
    updateError: ErrorResponse | null;
    deleteError: ErrorResponse | null;
    availabilityError: ErrorResponse | null;
}

const initialState: FieldState = {
    fields: [],
    currentField: null,
    ownerFields: [],
    pagination: null,
    availability: null,
    loading: false,
    createLoading: false,
    updateLoading: false,
    deleteLoading: false,
    availabilityLoading: false,
    error: null,
    createError: null,
    updateError: null,
    deleteError: null,
    availabilityError: null,
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
            state.updateError = null;
            state.deleteError = null;
            state.availabilityError = null;
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
                state.loading = true;
                state.error = null;
            })
            .addCase(getFieldById.fulfilled, (state, action) => {
                state.loading = false;
                state.currentField = action.payload.data;
                state.error = null;
            })
            .addCase(getFieldById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || { message: "Unknown error", status: "500" };
            })

            // Get fields by owner
            .addCase(getFieldsByOwner.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getFieldsByOwner.fulfilled, (state, action) => {
                state.loading = false;
                state.ownerFields = action.payload.data;
                state.error = null;
            })
            .addCase(getFieldsByOwner.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || { message: "Unknown error", status: "500" };
            })

            // Check availability
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
                state.ownerFields.unshift(action.payload.data);
                state.createError = null;
            })
            .addCase(createField.rejected, (state, action) => {
                state.createLoading = false;
                state.createError = action.payload || { message: "Unknown error", status: "500" };
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
                
                // Update in owner fields array
                const ownerFieldsIndex = state.ownerFields.findIndex(field => field.id === updatedField.id);
                if (ownerFieldsIndex !== -1) {
                    state.ownerFields[ownerFieldsIndex] = updatedField;
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
                
                // Remove from owner fields array
                state.ownerFields = state.ownerFields.filter(field => field.id !== fieldId);
                
                // Clear current field if it's the deleted one
                if (state.currentField?.id === fieldId) {
                    state.currentField = null;
                }
                
                state.deleteError = null;
            })
            .addCase(deleteField.rejected, (state, action) => {
                state.deleteLoading = false;
                state.deleteError = action.payload || { message: "Unknown error", status: "500" };
            });
    },
});

export const {
    clearCurrentField,
    clearAvailability,
    clearErrors,
    resetFieldState,
} = fieldSlice.actions;

export default fieldSlice.reducer;