import { createAsyncThunk } from "@reduxjs/toolkit";
import type {
    CoachesResponse,
    CoachDetailResponse,
    LegacyCoachesResponse,
    CoachFilters,
    ErrorResponse,
} from "../../types/coach-type";
import axiosPublic from "../../utils/axios/axiosPublic";
import {
    COACHES_API,
    COACH_BY_ID_API,
    ALL_COACHES_API,
} from "./coachAPI";

// Map API Coach shape (coachesAPI.md) to app Coach type used in UI
const mapApiCoachToAppCoach = (apiCoach: any): import("../../types/coach-type").Coach => {
    return {
        id: apiCoach?.id || "",
        fullName: apiCoach?.fullName || "",
        email: apiCoach?.email || "",
        avatarUrl: apiCoach?.avatarUrl,
        isVerified: apiCoach?.isVerified ?? false,
        sports: Array.isArray(apiCoach?.sports) ? apiCoach.sports : [],
        certification: apiCoach?.certification || "",
        hourlyRate: Number(apiCoach?.hourlyRate ?? 0),
        bio: apiCoach?.bio || "",
        rating: Number(apiCoach?.rating ?? 0),
        totalReviews: Number(apiCoach?.totalReviews ?? 0),
    };
};

// Map API Legacy Coach shape to app LegacyCoach type
const mapApiLegacyCoachToAppLegacyCoach = (apiCoach: any): import("../../types/coach-type").LegacyCoach => {
    return {
        id: apiCoach?.id || "",
        name: apiCoach?.name || "",
        location: apiCoach?.location || "",
        description: apiCoach?.description || "",
        rating: Number(apiCoach?.rating ?? 0),
        totalReviews: Number(apiCoach?.totalReviews ?? 0),
        price: Number(apiCoach?.price ?? 0),
        nextAvailability: apiCoach?.nextAvailability || null,
    };
};

// Map API Coach Detail shape to app CoachDetail type
const mapApiCoachDetailToAppCoachDetail = (apiCoach: any): import("../../types/coach-type").CoachDetail => {
    return {
        id: apiCoach?.id || "",
        name: apiCoach?.name || "",
        profileImage: apiCoach?.profileImage || "",
        description: apiCoach?.description || "",
        rating: Number(apiCoach?.rating ?? 0),
        reviewCount: Number(apiCoach?.reviewCount ?? 0),
        location: apiCoach?.location || "",
        level: apiCoach?.level || "",
        completedSessions: Number(apiCoach?.completedSessions ?? 0),
        createdAt: apiCoach?.createdAt || "",
        availableSlots: Array.isArray(apiCoach?.availableSlots) ? apiCoach.availableSlots : [],
        lessonTypes: Array.isArray(apiCoach?.lessonTypes) ? apiCoach.lessonTypes : [],
        price: Number(apiCoach?.price ?? 0),
        coachingDetails: {
            experience: apiCoach?.coachingDetails?.experience || "",
            certification: apiCoach?.coachingDetails?.certification || "",
        },
    };
};

// Get coaches with filters
export const getCoaches = createAsyncThunk<
    CoachesResponse,
    CoachFilters | undefined,
    { rejectValue: ErrorResponse }
>("coach/getCoaches", async (filters = {}, thunkAPI) => {
    try {
        const queryParams = new URLSearchParams();
        if (filters.name) queryParams.append("name", filters.name);
        if (filters.sportType) queryParams.append("sportType", filters.sportType);
        if (filters.minRate) queryParams.append("minRate", filters.minRate.toString());
        if (filters.maxRate) queryParams.append("maxRate", filters.maxRate.toString());

        const url = queryParams.toString() ? `${COACHES_API}?${queryParams}` : COACHES_API;
        const response = await axiosPublic.get(url);

        console.log("-----------------------------------------------------");
        console.log("Get coaches response:", response.data);
        console.log("-----------------------------------------------------");

        const raw = response.data;
        const apiList = Array.isArray(raw?.data) ? raw.data : Array.isArray(raw) ? raw : [];
        const mapped = apiList.map(mapApiCoachToAppCoach);
        return { success: true, data: mapped, message: raw?.message } as CoachesResponse;
    } catch (error: any) {
        const errorResponse: ErrorResponse = {
            message: error.response?.data?.message || error.message || "Failed to fetch coaches",
            status: error.response?.status?.toString() || "500",
            errors: error.response?.data?.errors,
        };
        return thunkAPI.rejectWithValue(errorResponse);
    }
});

// Get coach by ID
export const getCoachById = createAsyncThunk<
    CoachDetailResponse,
    string,
    { rejectValue: ErrorResponse }
>("coach/getCoachById", async (id, thunkAPI) => {
    try {
        console.log("🚀 [COACH THUNK] Starting getCoachById request:", {
            coachId: id,
            apiUrl: COACH_BY_ID_API(id),
            timestamp: new Date().toISOString()
        });
        
        const response = await axiosPublic.get(COACH_BY_ID_API(id));

        console.log("📥 [COACH THUNK] Raw API response received:", {
            coachId: id,
            status: response.status,
            data: response.data,
            timestamp: new Date().toISOString()
        });

        const raw = response.data;
        const apiCoach = raw?.data ?? raw;
        const mapped = mapApiCoachDetailToAppCoachDetail(apiCoach);
        
        console.log("🔄 [COACH THUNK] Coach data mapped successfully:", {
            coachId: id,
            originalApiCoach: apiCoach,
            mappedCoach: {
                id: mapped.id,
                name: mapped.name,
                location: mapped.location,
                price: mapped.price,
                rating: mapped.rating,
                availableSlots: mapped.availableSlots.length,
                lessonTypes: mapped.lessonTypes.length
            },
            timestamp: new Date().toISOString()
        });
        
        return { success: true, data: mapped, message: raw?.message } as CoachDetailResponse;
    } catch (error: any) {
        console.error("❌ [COACH THUNK] Error fetching coach by ID:", {
            coachId: id,
            error: error.message,
            status: error.response?.status,
            responseData: error.response?.data,
            timestamp: new Date().toISOString()
        });
        
        const errorResponse: ErrorResponse = {
            message: error.response?.data?.message || error.message || "Failed to fetch coach",
            status: error.response?.status?.toString() || "500",
            errors: error.response?.data?.errors,
        };
        return thunkAPI.rejectWithValue(errorResponse);
    }
});

// Get all coaches (legacy format)
export const getAllCoaches = createAsyncThunk<
    LegacyCoachesResponse,
    void,
    { rejectValue: ErrorResponse }
>("coach/getAllCoaches", async (_, thunkAPI) => {
    try {
        const response = await axiosPublic.get(ALL_COACHES_API);

        console.log("-----------------------------------------------------");
        console.log("Get all coaches (legacy) response:", response.data);
        console.log("-----------------------------------------------------");

        const raw = response.data;
        const apiList = Array.isArray(raw?.data) ? raw.data : Array.isArray(raw) ? raw : [];
        const mapped = apiList.map(mapApiLegacyCoachToAppLegacyCoach);
        return { success: true, data: mapped, message: raw?.message } as LegacyCoachesResponse;
    } catch (error: any) {
        const errorResponse: ErrorResponse = {
            message: error.response?.data?.message || error.message || "Failed to fetch all coaches",
            status: error.response?.status?.toString() || "500",
            errors: error.response?.data?.errors,
        };
        return thunkAPI.rejectWithValue(errorResponse);
    }
});
