import { createAsyncThunk } from "@reduxjs/toolkit";
import type {
    FieldsResponse,
    FieldResponse,
    FieldAvailabilityResponse,
    CreateFieldPayload,
    UpdateFieldPayload,
    GetFieldsParams,
    CheckAvailabilityParams,
    ErrorResponse,
} from "../../types/field-type";
import axiosPublic from "../../utils/axios/axiosPublic";
import axiosPrivate from "../../utils/axios/axiosPrivate";
import {
    FIELDS_API,
    FIELD_BY_ID_API,
    FIELDS_BY_OWNER_API,
    FIELD_AVAILABILITY_API,
    CREATE_FIELD_API,
    UPDATE_FIELD_API,
    DELETE_FIELD_API,
} from "./fieldAPI";

// Map API Field shape (BookingFieldAPI.md / fieldAPI.md) to app Field type used in UI
const mapApiFieldToAppField = (apiField: any): import("../../types/field-type").Field => {
    return {
        id: apiField?._id || apiField?.id || "",
        name: apiField?.name || "",
        description: apiField?.description || "",
        location: apiField?.location || "",
        type: apiField?.sportType || apiField?.type || "",
        pricePerHour: Number(apiField?.basePrice ?? apiField?.pricePerHour ?? 0),
        availability: true,
        images: Array.isArray(apiField?.images) ? apiField.images : [],
        facilities: Array.isArray(apiField?.facilities) ? apiField.facilities : undefined,
        owner: {
            id: apiField?.owner?._id || apiField?.owner?.id || apiField?.owner || "",
            name: apiField?.owner?.businessName || apiField?.owner?.name || "",
            contact: apiField?.owner?.contactInfo?.phone || apiField?.owner?.contact || undefined,
        },
        totalBookings: apiField?.totalBookings,
        createdAt: apiField?.createdAt,
        updatedAt: apiField?.updatedAt,
    };
};

// Get all fields
export const getAllFields = createAsyncThunk<
    FieldsResponse,
    GetFieldsParams | undefined,
    { rejectValue: ErrorResponse }
>("field/getAllFields", async (params = {}, thunkAPI) => {
    try {
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.append("page", params.page.toString());
        if (params.limit) queryParams.append("limit", params.limit.toString());
        if (params.location) queryParams.append("location", params.location);
        if (params.type) queryParams.append("type", params.type);

        const url = queryParams.toString() ? `${FIELDS_API}?${queryParams}` : FIELDS_API;
        const response = await axiosPublic.get(url);

        console.log("-----------------------------------------------------");
        console.log("Get all fields response:", response.data);
        console.log("-----------------------------------------------------");

        const raw = response.data;
        const apiList = Array.isArray(raw?.data) ? raw.data : Array.isArray(raw) ? raw : [];
        const mapped = apiList.map(mapApiFieldToAppField);
        const pagination = raw?.pagination || null;
        return { success: true, data: mapped, pagination } as unknown as FieldsResponse;
    } catch (error: any) {
        const errorResponse: ErrorResponse = {
            message: error.response?.data?.message || error.message || "Failed to fetch fields",
            status: error.response?.status || "500",
        };
        return thunkAPI.rejectWithValue(errorResponse);
    }
});

// Get field by ID
export const getFieldById = createAsyncThunk<
    FieldResponse,
    string,
    { rejectValue: ErrorResponse }
>("field/getFieldById", async (id, thunkAPI) => {
    try {
        const response = await axiosPublic.get(FIELD_BY_ID_API(id));

        console.log("-----------------------------------------------------");
        console.log("Get field by ID response:", response.data);
        console.log("-----------------------------------------------------");

        const raw = response.data;
        const apiField = raw?.data ?? raw;
        const mapped = mapApiFieldToAppField(apiField);
        return { success: true, data: mapped, message: raw?.message } as unknown as FieldResponse;
    } catch (error: any) {
        const errorResponse: ErrorResponse = {
            message: error.response?.data?.message || error.message || "Failed to fetch field",
            status: error.response?.status || "500",
        };
        return thunkAPI.rejectWithValue(errorResponse);
    }
});

// Get fields by owner
export const getFieldsByOwner = createAsyncThunk<
    FieldsResponse,
    string,
    { rejectValue: ErrorResponse }
>("field/getFieldsByOwner", async (ownerId, thunkAPI) => {
    try {
        const response = await axiosPrivate.get(FIELDS_BY_OWNER_API(ownerId));

        console.log("-----------------------------------------------------");
        console.log("Get fields by owner response:", response.data);
        console.log("-----------------------------------------------------");

        const raw = response.data;
        const apiList = Array.isArray(raw?.data) ? raw.data : Array.isArray(raw) ? raw : [];
        const mapped = apiList.map(mapApiFieldToAppField);
        const pagination = raw?.pagination || null;
        return { success: true, data: mapped, pagination } as unknown as FieldsResponse;
    } catch (error: any) {
        const errorResponse: ErrorResponse = {
            message: error.response?.data?.message || error.message || "Failed to fetch owner's fields",
            status: error.response?.status || "500",
        };
        return thunkAPI.rejectWithValue(errorResponse);
    }
});

// Check field availability
export const checkFieldAvailability = createAsyncThunk<
    FieldAvailabilityResponse,
    CheckAvailabilityParams,
    { rejectValue: ErrorResponse }
>("field/checkAvailability", async (params, thunkAPI) => {
    try {
        const queryParams = new URLSearchParams();
        queryParams.append("date", params.date);
        queryParams.append("startTime", params.startTime);
        queryParams.append("endTime", params.endTime);

        const url = `${FIELD_AVAILABILITY_API(params.id)}?${queryParams}`;
        const response = await axiosPublic.get(url);

        console.log("-----------------------------------------------------");
        console.log("Check availability response:", response.data);
        console.log("-----------------------------------------------------");

        return response.data;
    } catch (error: any) {
        const errorResponse: ErrorResponse = {
            message: error.response?.data?.message || error.message || "Failed to check availability",
            status: error.response?.status || "500",
        };
        return thunkAPI.rejectWithValue(errorResponse);
    }
});

// Create field (Owner only)
export const createField = createAsyncThunk<
    FieldResponse,
    CreateFieldPayload,
    { rejectValue: ErrorResponse }
>("field/createField", async (payload, thunkAPI) => {
    try {
        const response = await axiosPrivate.post(CREATE_FIELD_API, payload);

        console.log("-----------------------------------------------------");
        console.log("Create field response:", response.data);
        console.log("-----------------------------------------------------");

        const raw = response.data;
        const apiField = raw?.data ?? raw;
        const mapped = mapApiFieldToAppField(apiField);
        return { success: true, data: mapped, message: raw?.message } as unknown as FieldResponse;
    } catch (error: any) {
        const errorResponse: ErrorResponse = {
            message: error.response?.data?.message || error.message || "Failed to create field",
            status: error.response?.status || "500",
            errors: error.response?.data?.errors,
        };
        return thunkAPI.rejectWithValue(errorResponse);
    }
});

// Update field (Owner only)
export const updateField = createAsyncThunk<
    FieldResponse,
    { id: string; payload: UpdateFieldPayload },
    { rejectValue: ErrorResponse }
>("field/updateField", async ({ id, payload }, thunkAPI) => {
    try {
        const response = await axiosPrivate.put(UPDATE_FIELD_API(id), payload);

        console.log("-----------------------------------------------------");
        console.log("Update field response:", response.data);
        console.log("-----------------------------------------------------");

        const raw = response.data;
        const apiField = raw?.data ?? raw;
        const mapped = mapApiFieldToAppField(apiField);
        return { success: true, data: mapped, message: raw?.message } as unknown as FieldResponse;
    } catch (error: any) {
        const errorResponse: ErrorResponse = {
            message: error.response?.data?.message || error.message || "Failed to update field",
            status: error.response?.status || "500",
            errors: error.response?.data?.errors,
        };
        return thunkAPI.rejectWithValue(errorResponse);
    }
});

// Delete field (Owner only)
export const deleteField = createAsyncThunk<
    { success: boolean; message: string; fieldId: string },
    string,
    { rejectValue: ErrorResponse }
>("field/deleteField", async (id, thunkAPI) => {
    try {
        const response = await axiosPrivate.delete(DELETE_FIELD_API(id));

        console.log("-----------------------------------------------------");
        console.log("Delete field response:", response.data);
        console.log("-----------------------------------------------------");

        return { ...response.data, fieldId: id };
    } catch (error: any) {
        const errorResponse: ErrorResponse = {
            message: error.response?.data?.message || error.message || "Failed to delete field",
            status: error.response?.status || "500",
        };
        return thunkAPI.rejectWithValue(errorResponse);
    }
});