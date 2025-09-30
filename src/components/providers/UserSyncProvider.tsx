import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hook";
import { syncUserFromAuth } from "../../features/user/userSlice";
import { updateUser } from "../../features/authentication/authSlice";

/**
 * Component để đồng bộ user data giữa auth store và user store
 * Nên được đặt ở root level của app
 */
export const UserSyncProvider = ({ children }: { children: React.ReactNode }) => {
    const dispatch = useAppDispatch();
    const authUser = useAppSelector((state) => state.auth.user);
    const userStoreUser = useAppSelector((state) => state.user.user);

    useEffect(() => {
        // Sync from auth to user store when auth user changes
        if (authUser && (!userStoreUser || authUser._id !== userStoreUser._id)) {
            dispatch(syncUserFromAuth(authUser));
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