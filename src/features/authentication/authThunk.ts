import { createAsyncThunk } from "@reduxjs/toolkit";
import type {
    AuthResponse,
    ErrorResponse,
    LoginPayload,
    RegisterPayload,
    RegisterResponse,
    GoogleAuthResponse,
} from "../../types/authentication-type";
import axiosPublic from "../../utils/axios/axiosPublic";
import { LOGIN_API, REGISTER_API, GOOGLE_LOGIN_API, LOGOUT_API } from "./authAPI";

export const signInWithEmailAndPassword = createAsyncThunk<
    Pick<AuthResponse, "user">,
    LoginPayload,
    { rejectValue: ErrorResponse }
>("auth/login", async (payload, thunkAPI) => {
    try {
        const response = await axiosPublic.post(LOGIN_API, payload);

        console.log("-----------------------------------------------------")
        console.log("Dữ liệu login trả về:", response.data);
        console.log("-----------------------------------------------------")

        const raw = response?.data?.data ?? response?.data;
        const user = raw?.user ?? raw?.data?.user ?? raw?.result?.user ?? null;
        if (!user) {
            throw new Error("Invalid login response: missing user");
        }
        return { user } as Pick<AuthResponse, "user">;
    } catch (error: any) {
        const errorResponse: ErrorResponse = {
            message: error.response?.data?.message || error.message || "Login failed",
            status: error.response?.status || "500",
        };
        return thunkAPI.rejectWithValue(errorResponse);
    }
});

// register
export const signUpWithEmailAndPassword = createAsyncThunk<
    RegisterResponse,
    RegisterPayload,
    { rejectValue: ErrorResponse } // type of error payload
>("auth/register", async (payload, thunkAPI) => {
    try {
        const response = await axiosPublic.post(REGISTER_API, payload);
        console.log("-----------------------------------------------------")
        console.log("Dữ liệu đăng ký trả về:", response.data);
        console.log("-----------------------------------------------------")
        return response.data;
    } catch (error: any) {
        const errorResponse: ErrorResponse = {
            message:
                error.response?.data?.message || error.message || "Register failed",
            status: error.response?.status || "500",
        };
        return thunkAPI.rejectWithValue(errorResponse);
    }
});

// Google 
export const signInWithGoogle = createAsyncThunk<
    Pick<AuthResponse, "user">,
    { token: string; avatar?: string; rememberMe?: boolean },
    { rejectValue: ErrorResponse }
>("auth/google", async (payload, thunkAPI) => {
    try {
        const response = await axiosPublic.post(GOOGLE_LOGIN_API, {
            token: payload.token,
            avatar: payload.avatar,
            rememberMe: payload.rememberMe,
        });

        const raw = response?.data?.data ?? response?.data;
        const user = raw?.user ?? raw?.data?.user ?? raw?.result?.user ?? null;
        if (!user) {
            throw new Error("Invalid google login response: missing user");
        }
        return { user } as Pick<AuthResponse, "user">;
    } catch (error: any) {
        return thunkAPI.rejectWithValue({
            message: error.response?.data?.message || error.message || "Google login failed",
            status: error.response?.status || "500",
        });
    }
});


// logout
export const logout = createAsyncThunk<
    { message: string },
    void,
    { rejectValue: ErrorResponse }
>("auth/logout", async (_, thunkAPI) => {
    try {
        const response = await axiosPublic.post(LOGOUT_API);
        return response.data;
    } catch (error: any) {
        return thunkAPI.rejectWithValue({
            message: error.response?.data?.message || error.message || "Logout failed",
            status: error.response?.status || "500",
        });
    }
});


// update
// delete
