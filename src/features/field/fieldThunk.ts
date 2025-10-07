import { createAsyncThunk } from "@reduxjs/toolkit";
import type {
    FieldsResponse,
    FieldResponse,
    FieldAvailabilityResponse,
    CreateFieldPayload,
    UpdateFieldPayload,
    GetFieldsParams,
    CheckAvailabilityParams,
    SchedulePriceUpdatePayload,
    CancelScheduledPriceUpdatePayload,
    ScheduledPriceUpdate,
    ErrorResponse,
} from "../../types/field-type";
import axiosPublic from "../../utils/axios/axiosPublic";
import axiosPrivate from "../../utils/axios/axiosPrivate";
import {
    FIELDS_API,
    FIELD_BY_ID_API,
    FIELD_AVAILABILITY_API,
    CREATE_FIELD_API,
    CREATE_FIELD_WITH_IMAGES_API,
    UPDATE_FIELD_API,
    DELETE_FIELD_API,
    SCHEDULE_PRICE_UPDATE_API,
    CANCEL_SCHEDULED_PRICE_UPDATE_API,
    GET_SCHEDULED_PRICE_UPDATES_API,
} from "./fieldAPI";

// Map API Field shape (fieldAPI.md) to app Field type used in UI
const mapApiFieldToAppField = (apiField: any): import("../../types/field-type").Field => {
    return {
        id: apiField?._id || apiField?.id || "",
        name: apiField?.name || "",
        sportType: apiField?.sportType || "", // Use only 'sportType' as per new API
        description: apiField?.description || "",
        location: apiField?.location || "",
        images: Array.isArray(apiField?.images) ? apiField.images : [],
        operatingHours: Array.isArray(apiField?.operatingHours) ? apiField.operatingHours : [],
        slotDuration: apiField?.slotDuration || 60,
        minSlots: apiField?.minSlots || 1,
        maxSlots: apiField?.maxSlots || 4,
        priceRanges: Array.isArray(apiField?.priceRanges) ? apiField.priceRanges : [],
        basePrice: Number(apiField?.basePrice ?? 0), // Use only 'basePrice' as per new API
        isActive: apiField?.isActive ?? true,
        maintenanceNote: apiField?.maintenanceNote,
        maintenanceUntil: apiField?.maintenanceUntil,
        rating: apiField?.rating || 0,
        totalReviews: apiField?.totalReviews || 0,
        owner: {
            id: apiField?.owner?._id || apiField?.owner?.id || apiField?.owner || "",
            businessName: apiField?.owner?.businessName,
            name: apiField?.owner?.name,
            contactInfo: apiField?.owner?.contactInfo,
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
        if (params.name) queryParams.append("name", params.name);
        if (params.location) queryParams.append("location", params.location);
        if (params.sportType) queryParams.append("sportType", params.sportType);

        const url = queryParams.toString() ? `${FIELDS_API}?${queryParams}` : FIELDS_API;
        const response = await axiosPublic.get(url);

        console.log("-----------------------------------------------------");
        console.log("Get all fields response:", response.data);
        console.log("-----------------------------------------------------");

        const raw = response.data;
        const apiList = Array.isArray(raw?.data) ? raw.data : Array.isArray(raw) ? raw : [];
        const mapped = apiList.map(mapApiFieldToAppField);
        return { success: true, data: mapped } as unknown as FieldsResponse;
    } catch (error: any) {
        const errorResponse: ErrorResponse = {
            message: error.response?.data?.message || error.message || "Failed to fetch fields",
            status: error.response?.status?.toString() || "500",
            errors: error.response?.data?.errors,
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
        console.log("🚀 [FIELD THUNK] Starting getFieldById request:", {
            fieldId: id,
            apiUrl: FIELD_BY_ID_API(id),
            timestamp: new Date().toISOString()
        });
        
        const response = await axiosPublic.get(FIELD_BY_ID_API(id));

        console.log("📥 [FIELD THUNK] Raw API response received:", {
            fieldId: id,
            status: response.status,
            data: response.data,
            timestamp: new Date().toISOString()
        });

        const raw = response.data;
        const apiField = raw?.data ?? raw;
        const mapped = mapApiFieldToAppField(apiField);
        
        console.log("🔄 [FIELD THUNK] Field data mapped successfully:", {
            fieldId: id,
            originalApiField: apiField,
            mappedField: {
                id: mapped.id,
                name: mapped.name,
                location: mapped.location,
                basePrice: mapped.basePrice,
                sportType: mapped.sportType,
                isActive: mapped.isActive
            },
            timestamp: new Date().toISOString()
        });
        
        return { success: true, data: mapped, message: raw?.message } as unknown as FieldResponse;
    } catch (error: any) {
        console.error("❌ [FIELD THUNK] Error fetching field by ID:", {
            fieldId: id,
            error: error.message,
            status: error.response?.status,
            responseData: error.response?.data,
            timestamp: new Date().toISOString()
        });
        
        const errorResponse: ErrorResponse = {
            message: error.response?.data?.message || error.message || "Failed to fetch field",
            status: error.response?.status?.toString() || "500",
            errors: error.response?.data?.errors,
        };
        return thunkAPI.rejectWithValue(errorResponse);
    }
});

// Check field availability (Pure Lazy Creation)
export const checkFieldAvailability = createAsyncThunk<
    FieldAvailabilityResponse,
    CheckAvailabilityParams,
    { rejectValue: ErrorResponse }
>("field/checkAvailability", async (params, thunkAPI) => {
    try {
        const queryParams = new URLSearchParams();
        queryParams.append("startDate", params.startDate);
        queryParams.append("endDate", params.endDate);

        const url = `${FIELD_AVAILABILITY_API(params.id)}?${queryParams}`;
        const response = await axiosPublic.get(url);

        console.log("-----------------------------------------------------");
        console.log("Check availability response:", response.data);
        console.log("-----------------------------------------------------");

        // According to fieldAPI.md, the response is directly an array of availability data
        const raw = response.data;
        const availabilityData = Array.isArray(raw?.data) ? raw.data : Array.isArray(raw) ? raw : [];
        
        return { 
            success: true, 
            data: availabilityData 
        } as FieldAvailabilityResponse;
    } catch (error: any) {
        const errorResponse: ErrorResponse = {
            message: error.response?.data?.message || error.message || "Failed to check availability",
            status: error.response?.status?.toString() || "500",
            errors: error.response?.data?.errors,
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
            status: error.response?.status?.toString() || "500",
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
            status: error.response?.status?.toString() || "500",
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
            status: error.response?.status?.toString() || "500",
            errors: error.response?.data?.errors,
        };
        return thunkAPI.rejectWithValue(errorResponse);
    }
});

// Create field with image upload (Owner only)
export const createFieldWithImages = createAsyncThunk<
    FieldResponse,
    { payload: CreateFieldPayload; images: File[] },
    { rejectValue: ErrorResponse }
>("field/createFieldWithImages", async ({ payload, images }, thunkAPI) => {
    try {
        const formData = new FormData();
        
        // Add field data as JSON strings
        formData.append("name", payload.name);
        formData.append("sportType", payload.sportType);
        formData.append("description", payload.description);
        formData.append("location", payload.location);
        formData.append("operatingHours", JSON.stringify(payload.operatingHours));
        formData.append("slotDuration", payload.slotDuration.toString());
        formData.append("minSlots", payload.minSlots.toString());
        formData.append("maxSlots", payload.maxSlots.toString());
        formData.append("priceRanges", JSON.stringify(payload.priceRanges));
        formData.append("basePrice", payload.basePrice.toString());
        
        // Add image files
        images.forEach((image) => {
            formData.append("images", image);
        });

        const response = await axiosPrivate.post(CREATE_FIELD_WITH_IMAGES_API, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });

        console.log("-----------------------------------------------------");
        console.log("Create field with images response:", response.data);
        console.log("-----------------------------------------------------");

        const raw = response.data;
        const apiField = raw?.data ?? raw;
        const mapped = mapApiFieldToAppField(apiField);
        return { success: true, data: mapped, message: raw?.message } as unknown as FieldResponse;
    } catch (error: any) {
        const errorResponse: ErrorResponse = {
            message: error.response?.data?.message || error.message || "Failed to create field with images",
            status: error.response?.status?.toString() || "500",
            errors: error.response?.data?.errors,
        };
        return thunkAPI.rejectWithValue(errorResponse);
    }
});

// Schedule price update (Owner only)
export const schedulePriceUpdate = createAsyncThunk<
    { success: boolean; message: string; effectiveDate: string; updateId?: string },
    { id: string; payload: SchedulePriceUpdatePayload },
    { rejectValue: ErrorResponse }
>("field/schedulePriceUpdate", async ({ id, payload }, thunkAPI) => {
    try {
        const response = await axiosPrivate.post(SCHEDULE_PRICE_UPDATE_API(id), payload);

        console.log("-----------------------------------------------------");
        console.log("Schedule price update response:", response.data);
        console.log("-----------------------------------------------------");

        // According to fieldAPI.md, response includes success, message, effectiveDate, and updateId
        const raw = response.data;
        return {
            success: raw?.success ?? true,
            message: raw?.message || "Price update scheduled successfully",
            effectiveDate: raw?.effectiveDate || payload.effectiveDate,
            updateId: raw?.updateId
        };
    } catch (error: any) {
        const errorResponse: ErrorResponse = {
            message: error.response?.data?.message || error.message || "Failed to schedule price update",
            status: error.response?.status?.toString() || "500",
            errors: error.response?.data?.errors,
        };
        return thunkAPI.rejectWithValue(errorResponse);
    }
});

// Cancel scheduled price update (Owner only)
export const cancelScheduledPriceUpdate = createAsyncThunk<
    { success: boolean; message: string },
    { id: string; payload: CancelScheduledPriceUpdatePayload },
    { rejectValue: ErrorResponse }
>("field/cancelScheduledPriceUpdate", async ({ id, payload }, thunkAPI) => {
    try {
        const response = await axiosPrivate.delete(CANCEL_SCHEDULED_PRICE_UPDATE_API(id), {
            data: payload,
        });

        console.log("-----------------------------------------------------");
        console.log("Cancel scheduled price update response:", response.data);
        console.log("-----------------------------------------------------");

        // According to fieldAPI.md, response includes success and message
        const raw = response.data;
        return {
            success: raw?.success ?? true,
            message: raw?.message || "Scheduled price update cancelled"
        };
    } catch (error: any) {
        const errorResponse: ErrorResponse = {
            message: error.response?.data?.message || error.message || "Failed to cancel scheduled price update",
            status: error.response?.status?.toString() || "500",
            errors: error.response?.data?.errors,
        };
        return thunkAPI.rejectWithValue(errorResponse);
    }
});

// Get scheduled price updates (Owner only)
export const getScheduledPriceUpdates = createAsyncThunk<
    { success: boolean; data: ScheduledPriceUpdate[] },
    string,
    { rejectValue: ErrorResponse }
>("field/getScheduledPriceUpdates", async (id, thunkAPI) => {
    try {
        const response = await axiosPrivate.get(GET_SCHEDULED_PRICE_UPDATES_API(id));

        console.log("-----------------------------------------------------");
        console.log("Get scheduled price updates response:", response.data);
        console.log("-----------------------------------------------------");

        // According to fieldAPI.md, the response is directly an array of scheduled updates
        const raw = response.data;
        const scheduledUpdates = Array.isArray(raw?.data) ? raw.data : Array.isArray(raw) ? raw : [];
        
        return {
            success: true,
            data: scheduledUpdates
        };
    } catch (error: any) {
        const errorResponse: ErrorResponse = {
            message: error.response?.data?.message || error.message || "Failed to get scheduled price updates",
            status: error.response?.status?.toString() || "500",
            errors: error.response?.data?.errors,
        };
        return thunkAPI.rejectWithValue(errorResponse);
    }
});