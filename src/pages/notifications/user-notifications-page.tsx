import { NavbarDarkComponent } from "@/components/header/navbar-dark-component";
import { PageWrapper } from "@/components/layouts/page-wrapper";
import NotificationsContent from "./notifications-content";

export default function UserNotificationsPage() {
    return (
        <>
            <NavbarDarkComponent />
            <PageWrapper>
                <NotificationsContent />
            </PageWrapper>
        </>
    );
}
