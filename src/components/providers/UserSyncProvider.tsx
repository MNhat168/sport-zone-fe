import { useEffect, useRef } from "react";
import { useAppDispatch } from "../../store/hook";
import { validateSession } from "../../features/authentication/authThunk";
import { getUserProfile } from "../../features/user/userThunk";

/**
 * Component để validate session khi app load
 * Nên được đặt ở root level của app
 */
export const UserSyncProvider = ({ children }: { children: React.ReactNode }) => {
    const dispatch = useAppDispatch();
    const hasValidated = useRef(false);

    // Validate session on mount if user exists in storage
    useEffect(() => {
        const validateOnMount = async () => {
            if (hasValidated.current) return;
            hasValidated.current = true;

            // Check if there's a stored user (from localStorage/sessionStorage/cookie)
            const hasStoredUser = !!(
                typeof document !== "undefined" && (
                    sessionStorage.getItem("user") ||
                    localStorage.getItem("user") ||
                    document.cookie.includes("user=")
                )
            );

            if (hasStoredUser) {
                console.log("🔐 Validating session on app init...");
                try {
                    await dispatch(validateSession()).unwrap();
                    console.log("✅ Session is valid");
                    // Fetch full profile to ensure fields like favouriteSports are populated
                    try {
                        await dispatch(getUserProfile() as any).unwrap();
                        console.log("✅ Fetched full user profile");
                    } catch (err) {
                        console.warn("⚠️ Failed to fetch full user profile after session validation", err);
                    }
                } catch (error) {
                    console.log("❌ Session validation failed, user will be logged out");
                }
            }
        };

        validateOnMount();
    }, [dispatch]);

    return <>{children}</>;
};