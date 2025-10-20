import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import {
    signInWithEmailAndPassword,
    signUpWithEmailAndPassword,
    signInWithGoogle,
    logout,
    validateSession,
    refreshToken,
} from "./authThunk";
import type { AuthResponse, ErrorResponse } from "../../types/authentication-type";
import { clearUserAuth } from "../../lib/cookies";

interface AuthState {
    _id: string | null;
    user: AuthResponse["user"] | null;
    token: string | null; // kept for backward-compatibility but unused with cookie auth
    loading: boolean;
    error: ErrorResponse | null;
    verifyStatus?: "pending" | "success" | "error";
    verifyMessage?: string;
}

const readUserFromCookie = (): any | null => {
    try {
        if (typeof document === "undefined") return null;
        const match = document.cookie.match(/user=([^;]+)/);
        if (!match) return null;
        const userStr = decodeURIComponent(match[1]);
        return JSON.parse(userStr);
    } catch { return null; }
};

const getStoredUser = () => {
    try {
        // Ưu tiên cookie trước, rồi fallback localStorage
        const fromCookie = readUserFromCookie();
        if (fromCookie) return fromCookie;
        // Sau cookie, ưu tiên sessionStorage (rememberMe = false)
        const sessionUserStr = sessionStorage.getItem("user");
        if (sessionUserStr) return JSON.parse(sessionUserStr);
        // Cuối cùng mới đến localStorage (rememberMe = true)
        const localUserStr = localStorage.getItem("user");
        return localUserStr ? JSON.parse(localUserStr) : null;
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
            clearUserAuth();
        },
        updateUser: (state, action: PayloadAction<AuthResponse["user"]>) => {
            state.user = action.payload;
            // Ghi vào nơi đang sử dụng hiện tại: ưu tiên sessionStorage nếu có, ngược lại localStorage
            const isSessionActive = !!sessionStorage.getItem("user");
            const target = isSessionActive ? sessionStorage : localStorage;
            target.setItem("user", JSON.stringify(action.payload));
        },
        // Thêm action để force refresh avatar
        refreshAvatar: (state) => {
            if (state.user) {
                state.user = { ...state.user };
                const isSessionActive = !!sessionStorage.getItem("user");
                const target = isSessionActive ? sessionStorage : localStorage;
                target.setItem("user", JSON.stringify(state.user));
            }
        },
        // Đồng bộ lại user từ cookie trước, rồi mới đến localStorage
        syncFromLocalStorage: (state) => {
            const cookieUser = readUserFromCookie();
            if (cookieUser) {
                state.user = cookieUser;
                return;
            }
            const sessionUser = sessionStorage.getItem("user");
            if (sessionUser) {
                try {
                    const parsedUser = JSON.parse(sessionUser);
                    state.user = parsedUser;
                } catch (error) {
                    console.error("Error parsing user from localStorage:", error);
                }
                return;
            }
            const localUser = localStorage.getItem("user");
            if (localUser) {
                try {
                    const parsedUser = JSON.parse(localUser);
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
                    const rememberMe = Boolean((action as any).meta?.arg?.rememberMe);
                    const target = rememberMe ? localStorage : sessionStorage;
                    target.setItem("user", JSON.stringify(user));
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
                    const rememberMe = Boolean((action as any).meta?.arg?.rememberMe);
                    const target = rememberMe ? localStorage : sessionStorage;
                    target.setItem("user", JSON.stringify(user));
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
                clearUserAuth();
                try {
                    sessionStorage.removeItem("user");
                    localStorage.removeItem("user");
                } catch {}
            })
            
            // Validate session
            .addCase(validateSession.fulfilled, (state, action) => {
                state.loading = false;
                const user = action.payload?.user;
                if (user) {
                    state.user = user;
                    state.error = null;
                    // Update storage with validated user
                    const isSessionActive = !!sessionStorage.getItem("user");
                    const target = isSessionActive ? sessionStorage : localStorage;
                    target.setItem("user", JSON.stringify(user));
                }
            })
            .addCase(validateSession.rejected, (state, action) => {
                state.loading = false;
                state.user = null;
                state.token = null;
                clearUserAuth();
                try {
                    sessionStorage.removeItem("user");
                    localStorage.removeItem("user");
                } catch {}
            })
            
            // Refresh token
            .addCase(refreshToken.fulfilled, (state, action) => {
                state.loading = false;
                const user = action.payload?.user;
                if (user) {
                    state.user = user;
                    state.error = null;
                    // Update storage with refreshed token
                    const isSessionActive = !!sessionStorage.getItem("user");
                    const target = isSessionActive ? sessionStorage : localStorage;
                    target.setItem("user", JSON.stringify(user));
                }
            })
            .addCase(refreshToken.rejected, (state) => {
                state.loading = false;
                state.user = null;
                state.token = null;
                clearUserAuth();
                try {
                    sessionStorage.removeItem("user");
                    localStorage.removeItem("user");
                } catch {}
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
