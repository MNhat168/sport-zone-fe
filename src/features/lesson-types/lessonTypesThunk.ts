import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosPrivate from "../../utils/axios/axiosPrivate";
import { LESSON_TYPES_API } from "./lessonTypesAPI";

import { LESSON_TYPE_BY_ID_API } from "./lessonTypesAPI";

export type CreateLessonTypePayload = {
    type: string;
    name: string;
    description: string;
    field: string; // field id
    lessonPrice: number; // smallest currency unit
};

export type LessonTypeResponse = {
    id: string;
    type: string;
    name: string;
    description: string;
    field: string;
    lessonPrice: number;
    user: string;
    createdAt?: string;
    updatedAt?: string;
};

export type ErrorResponse = {
    message: string;
    status: string;
    errors?: any;
};

export const createLessonType = createAsyncThunk<
    LessonTypeResponse,
    CreateLessonTypePayload,
    { rejectValue: ErrorResponse }
>("lessonTypes/create", async (payload, thunkAPI) => {
    try {
        const response = await axiosPrivate.post(LESSON_TYPES_API, payload);
        return response.data?.data || response.data;
    } catch (error: any) {
        const err: ErrorResponse = {
            message: error.response?.data?.message || error.message || "Failed to create lesson type",
            status: error.response?.status?.toString() || "500",
            errors: error.response?.data?.errors,
        };
        return thunkAPI.rejectWithValue(err);
    }
});

export const deleteLessonType = createAsyncThunk<
    void,
    { id: string },
    { rejectValue: ErrorResponse }
>("lessonTypes/delete", async (payload, thunkAPI) => {
    try {
        const url = LESSON_TYPE_BY_ID_API(payload.id);
        await axiosPrivate.delete(url);
        return;
    } catch (error: any) {
        const err: ErrorResponse = {
            message: error.response?.data?.message || error.message || "Failed to delete lesson type",
            status: error.response?.status?.toString() || "500",
            errors: error.response?.data?.errors,
        };
        return thunkAPI.rejectWithValue(err);
    }
});
