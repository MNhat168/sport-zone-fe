import { createSlice } from "@reduxjs/toolkit";
import { createLessonType, deleteLessonType } from "./lessonTypesThunk";

type State = {
    creating: boolean;
    createError: string | null;
    deleting: boolean;
    deleteError: string | null;
};

const initialState: State = {
    creating: false,
    createError: null,
    deleting: false,
    deleteError: null,
};

const lessonTypesSlice = createSlice({
    name: "lessonTypes",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(createLessonType.pending, (state) => {
            state.creating = true;
            state.createError = null;
        });
        builder.addCase(createLessonType.fulfilled, (state) => {
            state.creating = false;
            state.createError = null;
        });
        builder.addCase(createLessonType.rejected, (state, action) => {
            state.creating = false;
            state.createError = action.payload?.message || action.error.message || "Failed to create";
        });
        // delete
        builder.addCase(deleteLessonType.pending, (state) => {
            state.deleting = true;
            state.deleteError = null;
        });
        builder.addCase(deleteLessonType.fulfilled, (state) => {
            state.deleting = false;
            state.deleteError = null;
        });
        builder.addCase(deleteLessonType.rejected, (state, action) => {
            state.deleting = false;
            state.deleteError = action.payload?.message || action.error.message || "Failed to delete";
        });
    },
});

export default lessonTypesSlice.reducer;
