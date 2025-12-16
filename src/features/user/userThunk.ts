import { SET_FAVOURITE_SPORTS_API, SET_FAVOURITE_COACHES_API, REMOVE_FAVOURITE_COACHES_API } from "./userAPI";
// Set favourite sports
export interface SetFavouriteSportsPayload {
    favouriteSports: string[];
}

export const setFavouriteSports = createAsyncThunk<
    User,
    SetFavouriteSportsPayload,
    { rejectValue: ErrorResponse }
>("user/setFavouriteSports", async (payload, thunkAPI) => {
    try {
        const response = await axiosPrivate.post(SET_FAVOURITE_SPORTS_API, payload);
        return response.data.data;
    } catch (error: any) {
        const errorResponse: ErrorResponse = {
            message: error.response?.data?.message || error.message || "Failed to set favourite sports",
            status: error.response?.status || "500",
        };
        return thunkAPI.rejectWithValue(errorResponse);
    }
});
import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosPrivate from "../../utils/axios/axiosPrivate";
import {
    GET_PROFILE_API,
    UPDATE_PROFILE_API,
    SET_FAVOURITE_FIELDS_API,
    REMOVE_FAVOURITE_FIELDS_API
} from "./userAPI";
import type {
    User,
    UpdateProfilePayload,
    ErrorResponse
} from "../../types/user-type";

// Get user profile
export const getUserProfile = createAsyncThunk<
    User,
    void,
    { rejectValue: ErrorResponse }
>("user/getUserProfile", async (_, thunkAPI) => {
    try {
        const response = await axiosPrivate.get(GET_PROFILE_API);
        console.log("-----------------------------------------------------");
        console.log("Dữ liệu profile trả về:", response.data);
        console.log("-----------------------------------------------------");
        return response.data.data;
    } catch (error: any) {
        const errorResponse: ErrorResponse = {
            message: error.response?.data?.message || error.message || "Failed to get profile",
            status: error.response?.status || "500",
        };
        return thunkAPI.rejectWithValue(errorResponse);
    }
});

// Update user profile
export const updateUserProfile = createAsyncThunk<
    User,
    UpdateProfilePayload,
    { rejectValue: ErrorResponse }
>("user/updateProfile", async (payload, thunkAPI) => {
    try {
        const formData = new FormData();

        // Append text fields
        if (payload.fullName) formData.append('fullName', payload.fullName);
        if (payload.email) formData.append('email', payload.email);
        if (payload.phone) formData.append('phone', payload.phone);

        // Append file if exists
        if (payload.avatar) {
            formData.append('avatar', payload.avatar);
        }

        const response = await axiosPrivate.patch(
            UPDATE_PROFILE_API,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );

        console.log("-----------------------------------------------------");
        console.log("Dữ liệu update profile trả về:", response.data);
        console.log("-----------------------------------------------------");

        return response.data;
    } catch (error: any) {
        const errorResponse: ErrorResponse = {
            message: error.response?.data?.message || error.message || "Failed to update profile",
            status: error.response?.status || "500",
        };
        return thunkAPI.rejectWithValue(errorResponse);
    }
});

// Set favourite coaches

// Set favourite coaches
export interface SetFavouriteCoachesPayload {
    favouriteCoaches: string[];
}

export const setFavouriteCoaches = createAsyncThunk<
    User,
    SetFavouriteCoachesPayload,
    { rejectValue: ErrorResponse }
>("user/setFavouriteCoaches", async (payload, thunkAPI) => {
    try {
        const response = await axiosPrivate.post(SET_FAVOURITE_COACHES_API, payload);
        // API returns updated user in response.data.data
        return response.data.data;
    } catch (error: any) {
        const errorResponse: ErrorResponse = {
            message: error.response?.data?.message || error.message || "Failed to set favourite coaches",
            status: error.response?.status || "500",
        };
        return thunkAPI.rejectWithValue(errorResponse);
    }
});

// Remove favourite coaches
export interface RemoveFavouriteCoachesPayload {
    favouriteCoaches: string[];
}

export const removeFavouriteCoaches = createAsyncThunk<
    User,
    RemoveFavouriteCoachesPayload,
    { rejectValue: ErrorResponse }
>("user/removeFavouriteCoaches", async (payload, thunkAPI) => {
    try {
        // axios delete with body needs `data` option
        const response = await axiosPrivate.delete(REMOVE_FAVOURITE_COACHES_API, { data: payload });
        return response.data.data;
    } catch (error: any) {
        const errorResponse: ErrorResponse = {
            message: error.response?.data?.message || error.message || "Failed to remove favourite coaches",
            status: error.response?.status || "500",
        };
        return thunkAPI.rejectWithValue(errorResponse);
    }
});

// Set favourite fields
export interface SetFavouriteFieldsPayload {
    favouriteFields: string[];
}

export const setFavouriteFields = createAsyncThunk<
    User,
    SetFavouriteFieldsPayload,
    { rejectValue: ErrorResponse }
>("user/setFavouriteFields", async (payload, thunkAPI) => {
    try {
        const response = await axiosPrivate.post(SET_FAVOURITE_FIELDS_API, payload);
        console.log("setFavouriteFields API response:", response.data);
        // Handle different response structures
        return response.data.data || response.data;
    } catch (error: any) {
        console.error("setFavouriteFields API error:", error.response?.data || error.message);
        const errorResponse: ErrorResponse = {
            message: error.response?.data?.message || error.message || "Failed to set favourite fields",
            status: error.response?.status || "500",
        };
        return thunkAPI.rejectWithValue(errorResponse);
    }
});

// Remove favourite fields
export interface RemoveFavouriteFieldsPayload {
    favouriteFields: string[];
}

export const removeFavouriteFields = createAsyncThunk<
    User,
    RemoveFavouriteFieldsPayload,
    { rejectValue: ErrorResponse }
>("user/removeFavouriteFields", async (payload, thunkAPI) => {
    try {
        const response = await axiosPrivate.delete(REMOVE_FAVOURITE_FIELDS_API, { data: payload });
        console.log("removeFavouriteFields API response:", response.data);
        // Handle different response structures
        return response.data.data || response.data;
    } catch (error: any) {
        console.error("removeFavouriteFields API error:", error.response?.data || error.message);
        const errorResponse: ErrorResponse = {
            message: error.response?.data?.message || error.message || "Failed to remove favourite fields",
            status: error.response?.status || "500",
        };
        return thunkAPI.rejectWithValue(errorResponse);
    }
});