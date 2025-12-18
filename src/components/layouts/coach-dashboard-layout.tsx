import { CoachSidebar } from "@/components/sidebar/coach-dashboard-sidebar"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"

interface CoachDashboardLayoutProps {
    children: React.ReactNode
}

export function CoachDashboardLayout({
    children
}: CoachDashboardLayoutProps) {
    return (
        <SidebarProvider defaultOpen={true}>
            <div className="flex min-h-screen w-full">
                <CoachSidebar />
                <SidebarInset className="flex flex-col">
                    {/* Header with trigger */}
                    <header className="flex h-16 shrink-0 items-center gap-2 border-b border-sidebar-border bg-background px-4">
                        <SidebarTrigger className="-ml-1" />
                    </header>

                    {/* Main content */}
                    <main className="flex flex-1 flex-col overflow-auto bg-gray-50">
                        {children}
                    </main>
                </SidebarInset>
            </div>
        </SidebarProvider>
    )
}
