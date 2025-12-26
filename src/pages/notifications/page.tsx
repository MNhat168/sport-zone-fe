import { useAppSelector } from "@/store/hook";
import UserNotificationsPage from "./user-notifications-page";
import FieldOwnerNotificationsPage from "./field-owner-notifications-page";
import CoachNotificationsPage from "./coach-notifications-page";

/**
 * Router component that renders the appropriate notification page
 * based on the user's role
 */
export default function NotificationsPage() {
    const user = useAppSelector((state) => state.auth.user);

    // Route to appropriate notification page based on role
    switch (user?.role) {
        case 'field_owner':
            return <FieldOwnerNotificationsPage />;
        case 'coach':
            return <CoachNotificationsPage />;
        case 'user':
        default:
            return <UserNotificationsPage />;
    }
}

