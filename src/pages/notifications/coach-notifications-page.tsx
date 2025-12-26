import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { CoachSidebar } from "@/components/sidebar/coach-dashboard-sidebar";
import NotificationsContent from "./notifications-content";

export default function CoachNotificationsPage() {
    return (
        <SidebarProvider>
            <CoachSidebar />
            <SidebarInset>
                <main className="flex-1">
                    <NotificationsContent />
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
