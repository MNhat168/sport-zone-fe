import axiosPublic from "@/utils/axios/axiosPublic";

export type FieldItem = {
    id: string;
    owner: string;
    name: string;
    sportType: string;
    description: string;
    location: string;
    images: string[];
    pricePerHour: number;
    isActive: boolean;
    maintenanceNote?: string;
    maintenanceUntil?: string;
    rating: number;
    totalReviews: number;
};

export type CoachItem = {
    id: string;
    fullName: string;
    email: string;
    avatarUrl?: string;
    isVerified: boolean;
    sports: string[];
    certification?: string;
    hourlyRate?: number;
    bio?: string;
    rating?: number;
    totalReviews?: number;
};

type ApiResponse<T> = { code: number; message: string; data: T };

export async function searchFields(params: { name?: string; location?: string; sportType?: string }) {
    const response = await axiosPublic.get<ApiResponse<FieldItem[]>>("/fields", { params });
    return response.data.data;
}

export async function searchCoaches(params: { name?: string; sportType?: string; minRate?: number; maxRate?: number }) {
    const response = await axiosPublic.get<ApiResponse<CoachItem[]>>("/coaches", { params });
    return response.data.data;
}


