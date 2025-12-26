import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { FieldOwnerSidebar } from "@/components/sidebar/field-owner-dashboard-sidebar";
import NotificationsContent from "./notifications-content";

export default function FieldOwnerNotificationsPage() {
    return (
        <SidebarProvider>
            <FieldOwnerSidebar />
            <SidebarInset>
                <main className="flex-1">
                    <NotificationsContent />
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
