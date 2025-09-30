import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosPublic from "../../utils/axios/axiosPublic";
import axiosPrivate from "../../utils/axios/axiosPrivate";
import { 
    GET_PROFILE_API, 
    UPDATE_PROFILE_API, 
    FORGOT_PASSWORD_API, 
    RESET_PASSWORD_API 
} from "./userAPI";
import type { 
    User, 
    UpdateProfilePayload, 
    ForgotPasswordPayload, 
    ResetPasswordPayload,
    ChangePasswordPayload,
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
        return response.data;
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

        const response = await axiosPrivate.put(
            `${UPDATE_PROFILE_API}/${payload.userId}`, 
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

// Forgot password
export const forgotPassword = createAsyncThunk<
    { message: string },
    ForgotPasswordPayload,
    { rejectValue: ErrorResponse }
>("user/forgotPassword", async (payload, thunkAPI) => {
    try {
        const response = await axiosPublic.post(FORGOT_PASSWORD_API, payload);
        
        console.log("-----------------------------------------------------");
        console.log("Dữ liệu forgot password trả về:", response.data);
        console.log("-----------------------------------------------------");
        
        return response.data;
    } catch (error: any) {
        const errorResponse: ErrorResponse = {
            message: error.response?.data?.message || error.message || "Failed to send reset email",
            status: error.response?.status || "500",
        };
        return thunkAPI.rejectWithValue(errorResponse);
    }
});

// Reset password
export const resetPassword = createAsyncThunk<
    { message: string },
    ResetPasswordPayload,
    { rejectValue: ErrorResponse }
>("user/resetPassword", async (payload, thunkAPI) => {
    try {
        const response = await axiosPublic.post(RESET_PASSWORD_API, payload);
        
        console.log("-----------------------------------------------------");
        console.log("Dữ liệu reset password trả về:", response.data);
        console.log("-----------------------------------------------------");
        
        return response.data;
    } catch (error: any) {
        const errorResponse: ErrorResponse = {
            message: error.response?.data?.message || error.message || "Failed to reset password",
            status: error.response?.status || "500",
        };
        return thunkAPI.rejectWithValue(errorResponse);
    }
});

// Change password (for logged in users)
export const changePassword = createAsyncThunk<
    { message: string },
    ChangePasswordPayload,
    { rejectValue: ErrorResponse }
>("user/changePassword", async (payload, thunkAPI) => {
    try {
        const response = await axiosPrivate.post(`${UPDATE_PROFILE_API}/change-password`, payload);
        
        console.log("-----------------------------------------------------");
        console.log("Dữ liệu change password trả về:", response.data);
        console.log("-----------------------------------------------------");
        
        return response.data;
    } catch (error: any) {
        const errorResponse: ErrorResponse = {
            message: error.response?.data?.message || error.message || "Failed to change password",
            status: error.response?.status || "500",
        };
        return thunkAPI.rejectWithValue(errorResponse);
    }
});