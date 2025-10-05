import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import {
    signInWithEmailAndPassword,
    signUpWithEmailAndPassword,
    signInWithGoogle,
    logout,
} from "./authThunk";
import type { AuthResponse, ErrorResponse } from "../../types/authentication-type";

interface AuthState {
    _id: string | null;
    user: AuthResponse["user"] | null;
    token: string | null; // kept for backward-compatibility but unused with cookie auth
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

const storedUser = getStoredUser();

// Debug current auth state
console.log("🔑 Auth initialState - User:", storedUser?.fullName);

const initialState: AuthState = {
    _id: storedUser?._id || null,
    user: storedUser,
    token: null,
    loading: false,
    error: null,
    verifyStatus: undefined,
    verifyMessage: "",
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        clearAuth: (state) => {
            state.user = null;
            state.token = null;
            localStorage.removeItem("user");
        },
        updateUser: (state, action: PayloadAction<AuthResponse["user"]>) => {
            state.user = action.payload;
            localStorage.setItem("user", JSON.stringify(action.payload));
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

            if (storedUser) {
                try {
                    const parsedUser = JSON.parse(storedUser);
                    state.user = parsedUser;
                } catch (error) {
                    console.error("Error parsing user from localStorage:", error);
                }
            }
        },
    },

    extraReducers: (builder) => {
        builder
            // Xử lý các action từ authThunk
            .addCase(signInWithEmailAndPassword.fulfilled, (state, action) => {
                state.loading = false;
                const user = action.payload?.user;
                if (user) {
                    state.user = user;
                    state.token = null; // cookie-based auth: no token stored client-side
                    localStorage.setItem("user", JSON.stringify(user));
                } else {
                    state.error = { message: "Missing user in login response", status: "500" } as any;
                }
            })

            .addCase(signInWithGoogle.fulfilled, (state, action) => {
                state.loading = false;
                const user = (action.payload as any)?.user;
                if (user) {
                    state.user = user;
                    state.token = null;
                    localStorage.setItem("user", JSON.stringify(user));
                } else {
                    state.error = { message: "Missing user in google login response", status: "500" } as any;
                }
            })

            .addCase(signUpWithEmailAndPassword.fulfilled, (state) => {
                state.loading = false;
            })

            // server-side logout thunk (must be before addMatcher calls)
            .addCase(logout.fulfilled, (state) => {
                state.user = null;
                state.token = null;
                localStorage.removeItem("user");
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

export const { clearAuth, updateUser, refreshAvatar, syncFromLocalStorage } = authSlice.actions;
export default authSlice.reducer;
