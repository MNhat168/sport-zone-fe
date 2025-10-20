import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosPrivate from "../../utils/axios/axiosPrivate";
import axiosPublic from "../../utils/axios/axiosPublic";
import {
    CREATE_OWNER_PROFILE_API,
    GET_MY_OWNER_PROFILE_API,
    UPDATE_OWNER_PROFILE_API,
    GET_OWNER_PROFILE_BY_ID_API,
} from "./ownerProfileAPI";
import type {
    FieldOwnerProfile,
    CreateOwnerProfilePayload,
    UpdateOwnerProfilePayload,
} from "../../types/field-owner-profile-type";
import type { ErrorResponse } from "../../types/user-type";

export const createOwnerProfile = createAsyncThunk<
    FieldOwnerProfile,
    CreateOwnerProfilePayload,
    { rejectValue: ErrorResponse }
>("ownerProfile/create", async (payload, thunkAPI) => {
    try {
        const response = await axiosPrivate.post(CREATE_OWNER_PROFILE_API, payload);
        return response.data.data as FieldOwnerProfile;
    } catch (error: any) {
        const errorResponse: ErrorResponse = {
            message: error.response?.data?.message || error.message || "Failed to create owner profile",
            status: String(error.response?.status || "500"),
        };
        return thunkAPI.rejectWithValue(errorResponse);
    }
});

export const getMyOwnerProfile = createAsyncThunk<
    FieldOwnerProfile,
    void,
    { rejectValue: ErrorResponse }
>("ownerProfile/getMine", async (_, thunkAPI) => {
    try {
        const response = await axiosPrivate.get(GET_MY_OWNER_PROFILE_API);
        return response.data.data as FieldOwnerProfile;
    } catch (error: any) {
        const errorResponse: ErrorResponse = {
            message: error.response?.data?.message || error.message || "Failed to get owner profile",
            status: String(error.response?.status || "500"),
        };
        return thunkAPI.rejectWithValue(errorResponse);
    }
});

export const updateMyOwnerProfile = createAsyncThunk<
    FieldOwnerProfile,
    UpdateOwnerProfilePayload,
    { rejectValue: ErrorResponse }
>("ownerProfile/updateMine", async (payload, thunkAPI) => {
    try {
        const response = await axiosPrivate.patch(UPDATE_OWNER_PROFILE_API, payload);
        return response.data.data as FieldOwnerProfile;
    } catch (error: any) {
        const errorResponse: ErrorResponse = {
            message: error.response?.data?.message || error.message || "Failed to update owner profile",
            status: String(error.response?.status || "500"),
        };
        return thunkAPI.rejectWithValue(errorResponse);
    }
});

export const getOwnerProfileById = createAsyncThunk<
    FieldOwnerProfile,
    string,
    { rejectValue: ErrorResponse }
>("ownerProfile/getById", async (id, thunkAPI) => {
    try {
        const response = await axiosPublic.get(GET_OWNER_PROFILE_BY_ID_API(id));
        return response.data.data as FieldOwnerProfile;
    } catch (error: any) {
        const errorResponse: ErrorResponse = {
            message: error.response?.data?.message || error.message || "Failed to get owner profile by id",
            status: String(error.response?.status || "500"),
        };
        return thunkAPI.rejectWithValue(errorResponse);
    }
});


