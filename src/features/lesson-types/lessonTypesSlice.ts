import { createSlice } from "@reduxjs/toolkit";
import { createLessonType, deleteLessonType, getLessonType } from "./lessonTypesThunk";
import type { LessonTypeResponse } from "./lessonTypesThunk";

type State = {
    creating: boolean;
    createError: string | null;
    deleting: boolean;
    deleteError: string | null;
    fetching: boolean;
    fetchError: string | null;
    fetchedItem?: LessonTypeResponse | null;
};

const initialState: State = {
    creating: false,
    createError: null,
    deleting: false,
    deleteError: null,
    fetching: false,
    fetchError: null,
    fetchedItem: null,
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

        // get by id
        builder.addCase(getLessonType.pending, (state) => {
            state.fetching = true;
            state.fetchError = null;
            state.fetchedItem = null;
        });
        builder.addCase(getLessonType.fulfilled, (state, action) => {
            state.fetching = false;
            state.fetchError = null;
            state.fetchedItem = action.payload;
        });
        builder.addCase(getLessonType.rejected, (state, action) => {
            state.fetching = false;
            state.fetchError = action.payload?.message || action.error.message || "Failed to fetch";
            state.fetchedItem = null;
        });
    },
});

export default lessonTypesSlice.reducer;
