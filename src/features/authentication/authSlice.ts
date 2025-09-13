import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import {
    signInWithEmailAndPassword,
    signUpWithEmailAndPassword,
    signInWithGoogle,
} from "./authThunk";
import type { AuthResponse, ErrorResponse } from "../../types/authentication-type";

interface AuthState {
    _id: string | null;
    user: AuthResponse["user"] | null;
    token: string | null;
    loading: boolean;
    error: ErrorResponse | null;
    verifyStatus?: "pending" | "success" | "error";
    verifyMessage?: string;
}

const getStoredUser = () => {
    try {
        const userStr = localStorage.getItem("user");
        return userStr ? JSON.parse(userStr) : null;
    } catch {
        return null;
    }
};

const initialState: AuthState = {
    _id: getStoredUser()?._id || null,
    user: getStoredUser(),
    token: localStorage.getItem("token") || null,
    loading: false,
    error: null,
    verifyStatus: undefined,
    verifyMessage: "",
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        logout: (state) => {
            state.user = null;
            state.token = null;
            localStorage.removeItem("token");
            localStorage.removeItem("user");
        },
        updateUser: (state, action: PayloadAction<AuthResponse["user"]>) => {
            state.user = action.payload;
            localStorage.setItem("user", JSON.stringify(action.payload));
            const token = localStorage.getItem("token");
            if (token) {
                state.token = token;
            }
        },
        // Thêm action để force refresh avatar
        refreshAvatar: (state) => {
            if (state.user) {
                state.user = { ...state.user };
                localStorage.setItem("user", JSON.stringify(state.user));
            }
        },
        // Thêm action để sync từ localStorage
        syncFromLocalStorage: (state) => {
            const storedUser = localStorage.getItem("user");
            const storedToken = localStorage.getItem("token");

            if (storedUser) {
                try {
                    const parsedUser = JSON.parse(storedUser);
                    state.user = parsedUser;
                } catch (error) {
                    console.error("Error parsing user from localStorage:", error);
                }
            }

            if (storedToken) {
                state.token = storedToken;
            }
        },
    },

    extraReducers: (builder) => {
        builder
            // Xử lý các action từ authThunk
            .addCase(signInWithEmailAndPassword.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload.user;
                state.token = action.payload.access_token;
                localStorage.setItem("user", JSON.stringify(action.payload.user));
                localStorage.setItem("token", action.payload.access_token);
            })

            .addCase(signInWithGoogle.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload.data.user;
                state.token = action.payload.data.access_token;
                localStorage.setItem("user", JSON.stringify(action.payload.data.user));
                localStorage.setItem("token", action.payload.data.access_token);
            })

            .addCase(signUpWithEmailAndPassword.fulfilled, (state) => {
                state.loading = false;
            })

            .addMatcher(
                (action) => action.type.endsWith("/pending"),
                (state) => {
                    state.loading = true;
                    state.error = null;
                }
            )
            // Xử lý chung cho tất cả rejected action
            .addMatcher(
                (action) => action.type.endsWith("/rejected"),
                (state, action: PayloadAction<ErrorResponse>) => {
                    state.loading = false;
                    state.error = action.payload || { message: "Unknown error" };
                }
            );
    },
});

export const { logout, updateUser, refreshAvatar, syncFromLocalStorage } = authSlice.actions;
export default authSlice.reducer;
