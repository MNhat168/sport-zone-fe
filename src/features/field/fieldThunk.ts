import { createAsyncThunk } from "@reduxjs/toolkit";
import type {
    FieldsResponse,
    FieldResponse,
    FieldAvailabilityResponse,
    CreateFieldPayload,
    UpdateFieldPayload,
    GetFieldsParams,
    GetMyFieldsParams,
    CheckAvailabilityParams,
    SchedulePriceUpdatePayload,
    CancelScheduledPriceUpdatePayload,
    ScheduledPriceUpdate,
    ErrorResponse,
    FieldAmenitiesResponse,
    UpdateFieldAmenitiesPayload,
    UpdateFieldAmenitiesResponse,
    FieldOwnerBookingsParams,
    FieldOwnerBookingsResponse,
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
    GET_FIELD_AMENITIES_API,
    UPDATE_FIELD_AMENITIES_API,
    GET_MY_FIELDS_API,
    GET_MY_FIELDS_BOOKINGS_API,
} from "./fieldAPI";

// Map API Field shape (fieldAPI.md) to app Field type used in UI
const mapApiFieldToAppField = (apiField: any): import("../../types/field-type").Field => {
    return {
        id: apiField?._id || apiField?.id || "",
        name: apiField?.name || "",
        sportType: apiField?.sportType || "",
        description: apiField?.description || "",
        location: apiField?.location || "",
        images: Array.isArray(apiField?.images) ? apiField.images : [],
        operatingHours: Array.isArray(apiField?.operatingHours) ? apiField.operatingHours : [],
        slotDuration: apiField?.slotDuration || 60,
        minSlots: apiField?.minSlots || 1,
        maxSlots: apiField?.maxSlots || 4,
        priceRanges: Array.isArray(apiField?.priceRanges) ? apiField.priceRanges : [],
        basePrice: Number(apiField?.basePrice ?? 0),
        price: apiField?.price || undefined, // Formatted price from backend (e.g., "250.000đ/giờ")
        isActive: apiField?.isActive ?? true,
        isAdminVerify: apiField?.isAdminVerify ?? false,
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
        ownerName: apiField?.ownerName,
        ownerPhone: apiField?.ownerPhone,
        courts: Array.isArray(apiField?.courts)
            ? apiField.courts.map((c: any) => ({
                id: c?._id || c?.id || "",
                name: c?.name || c?.courtName || "",
                courtNumber: c?.courtNumber,
                isActive: c?.isActive,
                field: c?.field?._id || c?.field || "",
            }))
            : undefined,
        totalBookings: apiField?.totalBookings,
        createdAt: apiField?.createdAt,
        updatedAt: apiField?.updatedAt,
        amenities: Array.isArray(apiField?.amenities) ? apiField.amenities : [],
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
        
        // Priority: sportTypes > sportType
        if (params.sportTypes && params.sportTypes.length > 0) {
            // Send as multiple query params: sportTypes=football&sportTypes=badminton
            params.sportTypes.forEach(sport => {
                queryParams.append("sportTypes", sport);
            });
        } else if (params.sportType) {
            // Backward compatible: single sport
            queryParams.append("sportType", params.sportType);
        }
        
        if ((params as any).sortBy) queryParams.append("sortBy", (params as any).sortBy);
        if ((params as any).sortOrder) queryParams.append("sortOrder", (params as any).sortOrder);

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

// Get my fields (for field owner)
export const getMyFields = createAsyncThunk<
    FieldsResponse,
    GetMyFieldsParams | undefined,
    { rejectValue: ErrorResponse }
>("field/getMyFields", async (params = {}, thunkAPI) => {
    try {
        const queryParams = new URLSearchParams();
        if (params.name) queryParams.append("name", params.name);
        if (params.sportType) queryParams.append("sportType", params.sportType);
        if (params.isActive !== undefined) queryParams.append("isActive", params.isActive.toString());
        if (params.page) queryParams.append("page", params.page.toString());
        if (params.limit) queryParams.append("limit", params.limit.toString());

        const url = queryParams.toString() ? `${GET_MY_FIELDS_API}?${queryParams}` : GET_MY_FIELDS_API;
        const response = await axiosPrivate.get(url);

        console.log("-----------------------------------------------------");
        console.log("Get my fields response:", response.data);
        console.log("-----------------------------------------------------");

        const raw = response.data;
        // Handle API response format: { success: true, data: { fields: [...], pagination: {...} } }
        const apiList = raw?.data?.fields || (Array.isArray(raw?.data) ? raw.data : Array.isArray(raw) ? raw : []);
        const mapped = apiList.map(mapApiFieldToAppField);
        return {
            success: true,
            data: mapped,
            pagination: raw?.data?.pagination || null
        } as unknown as FieldsResponse;
    } catch (error: any) {
        const errorResponse: ErrorResponse = {
            message: error.response?.data?.message || error.message || "Failed to fetch my fields",
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
        if (params.courtId) queryParams.append("courtId", params.courtId);

        const url = `${FIELD_AVAILABILITY_API(params.id)}?${queryParams}`;
        const response = await axiosPublic.get(url);

        console.log("-----------------------------------------------------");
        console.log("Check availability response:", response.data);
        console.log("-----------------------------------------------------");

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
        // Ensure location is in the correct format
        let requestPayload = { ...payload };

        // If location is a string, convert it to the required object format
        if (typeof requestPayload.location === 'string') {
            requestPayload = {
                ...requestPayload,
                location: {
                    address: requestPayload.location,
                    geo: {
                        type: "Point",
                        coordinates: [0, 0] // Default - should be replaced with actual coordinates
                    }
                } as any
            };
        }

        const response = await axiosPrivate.post(CREATE_FIELD_API, requestPayload);

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

// Create field with image upload (Owner only)
export const createFieldWithImages = createAsyncThunk<
    FieldResponse,
    { payload: CreateFieldPayload; images: File[]; locationData?: { address: string; geo: { type: 'Point'; coordinates: [number, number] } } },
    { rejectValue: ErrorResponse }
>("field/createFieldWithImages", async ({ payload, images, locationData }, thunkAPI) => {
    try {
        const formData = new FormData();

        // Add basic field data
        formData.append("name", payload.name);
        formData.append("sportType", payload.sportType);
        formData.append("description", payload.description);

        // Location must be a JSON string with address and geo.coordinates
        // Use locationData if provided, otherwise construct from payload.location
        let locationObject;
        if (locationData && locationData.geo.coordinates[0] !== 0 && locationData.geo.coordinates[1] !== 0) {
            locationObject = locationData;
        } else if (typeof payload.location === 'object' && 'geo' in payload.location) {
            locationObject = payload.location;
        } else {
            // Fallback: if only string address is provided (should not happen with new UI)
            locationObject = {
                address: payload.location as string,
                geo: {
                    type: "Point" as const,
                    coordinates: [0, 0] as [number, number]
                }
            };
        }
        formData.append("location", JSON.stringify(locationObject));

        // Add operating hours as JSON string
        formData.append("operatingHours", JSON.stringify(payload.operatingHours));

        // Add slot configuration as strings (required for multipart/form-data)
        formData.append("slotDuration", payload.slotDuration.toString());
        formData.append("minSlots", payload.minSlots.toString());
        formData.append("maxSlots", payload.maxSlots.toString());

        // Add base price as string (required for multipart/form-data)
        formData.append("basePrice", payload.basePrice.toString());

        // Add price ranges as JSON string (OPTIONAL)
        if (payload.priceRanges && payload.priceRanges.length > 0) {
            formData.append("priceRanges", JSON.stringify(payload.priceRanges));
        }

        // Add amenities as JSON string (OPTIONAL)
        if (payload.amenities && payload.amenities.length > 0) {
            formData.append("amenities", JSON.stringify(payload.amenities));
        }

        // Add image files (OPTIONAL)
        if (images && images.length > 0) {
            images.forEach((image) => {
                formData.append("images", image);
            });
        }

        // IMPORTANT: Do NOT set Content-Type header
        // Browser will automatically set it with the correct boundary
        const response = await axiosPrivate.post(CREATE_FIELD_WITH_IMAGES_API, formData);

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

// Get field amenities
export const getFieldAmenities = createAsyncThunk<
    FieldAmenitiesResponse,
    string,
    { rejectValue: ErrorResponse }
>("field/getFieldAmenities", async (fieldId, thunkAPI) => {
    try {
        const response = await axiosPublic.get(GET_FIELD_AMENITIES_API(fieldId));

        console.log("-----------------------------------------------------");
        console.log("Get field amenities response:", response.data);
        console.log("-----------------------------------------------------");

        const raw = response.data;
        return {
            fieldId: raw?.fieldId || fieldId,
            fieldName: raw?.fieldName || "",
            amenities: Array.isArray(raw?.amenities) ? raw.amenities : []
        };
    } catch (error: any) {
        const errorResponse: ErrorResponse = {
            message: error.response?.data?.message || error.message || "Failed to fetch field amenities",
            status: error.response?.status?.toString() || "500",
            errors: error.response?.data?.errors,
        };
        return thunkAPI.rejectWithValue(errorResponse);
    }
});

// Update field amenities (Owner only)
export const updateFieldAmenities = createAsyncThunk<
    UpdateFieldAmenitiesResponse,
    { fieldId: string; payload: UpdateFieldAmenitiesPayload },
    { rejectValue: ErrorResponse }
>("field/updateFieldAmenities", async ({ fieldId, payload }, thunkAPI) => {
    try {
        const response = await axiosPrivate.put(UPDATE_FIELD_AMENITIES_API(fieldId), payload);

        console.log("-----------------------------------------------------");
        console.log("Update field amenities response:", response.data);
        console.log("-----------------------------------------------------");

        const raw = response.data;
        return {
            success: raw?.success ?? true,
            message: raw?.message || "Updated field amenities",
            field: {
                id: raw?.field?.id || fieldId,
                name: raw?.field?.name || "",
                amenities: Array.isArray(raw?.field?.amenities) ? raw.field.amenities : []
            }
        };
    } catch (error: any) {
        const errorResponse: ErrorResponse = {
            message: error.response?.data?.message || error.message || "Failed to update field amenities",
            status: error.response?.status?.toString() || "500",
            errors: error.response?.data?.errors,
        };
        return thunkAPI.rejectWithValue(errorResponse);
    }
});

// Get my fields bookings with filter and pagination
export const getMyFieldsBookings = createAsyncThunk<
    FieldOwnerBookingsResponse,
    FieldOwnerBookingsParams | undefined,
    { rejectValue: ErrorResponse }
>("field/getMyFieldsBookings", async (params = {}, thunkAPI) => {
    try {
        const queryParams = new URLSearchParams();

        if (params.fieldName) queryParams.append('fieldName', params.fieldName);
        if (params.status) queryParams.append('status', params.status);
        if (params.transactionStatus) queryParams.append('transactionStatus', params.transactionStatus);
        if (params.date) queryParams.append('date', params.date);
        if (params.startDate) queryParams.append('startDate', params.startDate);
        if (params.endDate) queryParams.append('endDate', params.endDate);
        if (params.page) queryParams.append('page', params.page.toString());
        if (params.limit) queryParams.append('limit', params.limit.toString());

        const url = queryParams.toString()
            ? `${GET_MY_FIELDS_BOOKINGS_API}?${queryParams.toString()}`
            : GET_MY_FIELDS_BOOKINGS_API;

        const response = await axiosPrivate.get(url);
        const raw = response.data;

        // Handle different response formats
        // Format 1: { success: true, data: { bookings: [...], pagination: {...} } }
        // Format 2: { bookings: [...], pagination: {...} }
        if (raw?.success && raw?.data) {
            return raw as FieldOwnerBookingsResponse;
        } else if (raw?.bookings && raw?.pagination) {
            // Wrap in expected format
            return {
                success: true,
                data: {
                    bookings: raw.bookings,
                    pagination: raw.pagination
                }
            } as FieldOwnerBookingsResponse;
        }

        // Fallback: return as is
        return raw as FieldOwnerBookingsResponse;
    } catch (error: any) {
        const errorResponse: ErrorResponse = {
            message: error.response?.data?.message || error.message || "Failed to fetch field owner bookings",
            status: error.response?.status?.toString() || "500",
            errors: error.response?.data?.errors,
        };
        return thunkAPI.rejectWithValue(errorResponse);
    }
});

// Owner: get booking detail (with note)
export const ownerGetBookingDetail = createAsyncThunk<
    any,
    string,
    { rejectValue: ErrorResponse }
>("field/ownerGetBookingDetail", async (bookingId, thunkAPI) => {
    try {
        const { OWNER_BOOKING_DETAIL_API } = await import("./fieldAPI");
        const response = await axiosPrivate.get(OWNER_BOOKING_DETAIL_API(bookingId));
        // Backend wraps responses as { success: true, data: {...} }
        return response.data?.data ?? response.data;
    } catch (error: any) {
        const errorResponse: ErrorResponse = {
            message: error.response?.data?.message || error.message || "Failed to get booking detail",
            status: error.response?.status?.toString() || "500",
        };
        return thunkAPI.rejectWithValue(errorResponse);
    }
});

// Owner: accept user's note (send payment link if online)
export const ownerAcceptNote = createAsyncThunk<
    any,
    string,
    { rejectValue: ErrorResponse }
>("field/ownerAcceptNote", async (bookingId, thunkAPI) => {
    try {
        const { OWNER_ACCEPT_NOTE_API } = await import("./fieldAPI");
        const response = await axiosPrivate.patch(OWNER_ACCEPT_NOTE_API(bookingId));
        return response.data;
    } catch (error: any) {
        const errorResponse: ErrorResponse = {
            message: error.response?.data?.message || error.message || "Failed to accept booking note",
            status: error.response?.status?.toString() || "500",
        };
        return thunkAPI.rejectWithValue(errorResponse);
    }
});

// Owner: deny user's note
export const ownerDenyNote = createAsyncThunk<
    any,
    { bookingId: string; reason?: string },
    { rejectValue: ErrorResponse }
>("field/ownerDenyNote", async ({ bookingId, reason }, thunkAPI) => {
    try {
        const { OWNER_DENY_NOTE_API } = await import("./fieldAPI");
        const response = await axiosPrivate.patch(OWNER_DENY_NOTE_API(bookingId), reason ? { reason } : undefined);
        return response.data;
    } catch (error: any) {
        const errorResponse: ErrorResponse = {
            message: error.response?.data?.message || error.message || "Failed to deny booking note",
            status: error.response?.status?.toString() || "500",
        };
        return thunkAPI.rejectWithValue(errorResponse);
    }
});

// Owner: accept a booking
export const ownerAcceptBooking = createAsyncThunk<
    any,
    string,
    { rejectValue: ErrorResponse }
>("field/ownerAcceptBooking", async (bookingId, thunkAPI) => {
    try {
        const { OWNER_ACCEPT_BOOKING_API } = await import("./fieldAPI");
        const response = await axiosPrivate.patch(OWNER_ACCEPT_BOOKING_API(bookingId));
        return response.data?.data ?? response.data;
    } catch (error: any) {
        const errorResponse: ErrorResponse = {
            message: error.response?.data?.message || error.message || "Failed to accept booking",
            status: error.response?.status?.toString() || "500",
        };
        return thunkAPI.rejectWithValue(errorResponse);
    }
});

// Owner: reject a booking
export const ownerRejectBooking = createAsyncThunk<
    any,
    { bookingId: string; reason?: string },
    { rejectValue: ErrorResponse }
>("field/ownerRejectBooking", async ({ bookingId, reason }, thunkAPI) => {
    try {
        const { OWNER_REJECT_BOOKING_API } = await import("./fieldAPI");
        const response = await axiosPrivate.patch(OWNER_REJECT_BOOKING_API(bookingId), reason ? { reason } : undefined);
        return response.data?.data ?? response.data;
    } catch (error: any) {
        const errorResponse: ErrorResponse = {
            message: error.response?.data?.message || error.message || "Failed to reject booking",
            status: error.response?.status?.toString() || "500",
        };
        return thunkAPI.rejectWithValue(errorResponse);
    }
});
