import { useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hook";
import { syncUserFromAuth } from "../../features/user/userSlice";
import { updateUser } from "../../features/authentication/authSlice";
import { validateSession } from "../../features/authentication/authThunk";

/**
 * Component để đồng bộ user data giữa auth store và user store
 * Nên được đặt ở root level của app
 */
export const UserSyncProvider = ({ children }: { children: React.ReactNode }) => {
    const dispatch = useAppDispatch();
    const authUser = useAppSelector((state) => state.auth.user);
    const userStoreUser = useAppSelector((state) => state.user.user);
    const hasValidated = useRef(false);

    // Validate session on mount if user exists in storage
    useEffect(() => {
        const validateOnMount = async () => {
            if (hasValidated.current) return;
            hasValidated.current = true;

            // Check if there's a stored user (from localStorage/sessionStorage/cookie)
            const hasStoredUser = !!(
                sessionStorage.getItem("user") ||
                localStorage.getItem("user") ||
                document.cookie.includes("user=")
            );

            if (hasStoredUser) {
                console.log("🔐 Validating session on app init...");
                try {
                    await dispatch(validateSession()).unwrap();
                    console.log("✅ Session is valid");
                } catch (error) {
                    console.log("❌ Session validation failed, user will be logged out");
                }
            }
        };

        validateOnMount();
    }, [dispatch]);

    useEffect(() => {
        // Only sync if authUser contains favouriteField (full profile)
        if (
            authUser &&
            (!userStoreUser || authUser._id !== userStoreUser._id)
        ) {
            if (Array.isArray(authUser.favouriteFields)) {
                dispatch(syncUserFromAuth(authUser));
            }
            // Otherwise, do not overwrite userStoreUser
        }
    }, [authUser, userStoreUser, dispatch]);

    useEffect(() => {
        // Sync from user store to auth when user data is updated
        if (userStoreUser && authUser && userStoreUser._id === authUser._id) {
            // Only update if data is different
            if (JSON.stringify(userStoreUser) !== JSON.stringify(authUser)) {
                dispatch(updateUser(userStoreUser));
            }
        }
    }, [userStoreUser, authUser, dispatch]);

    return <>{children}</>;
};