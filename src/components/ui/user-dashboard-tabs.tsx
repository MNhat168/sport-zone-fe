import { useNavigate, useLocation } from "react-router-dom"
import { Button } from "@/components/ui/button"
import {
    Calendar,
    MessageSquare,
    FileText,
    Wallet,
    Settings,
    LayoutDashboard,
} from "lucide-react"

export function UserDashboardTabs() {
    const navigate = useNavigate()
    const location = useLocation()
    
    const baseTabClasses = (isActive: boolean) =>
        `flex flex-col items-center gap-2 rounded-2xl border border-gray-200 shadow-sm min-w-[190px] p-[35px] h-[121px] transition-all duration-200 ${
            isActive 
            ? "bg-[#097f53] text-white shadow-md hover:bg-[#097f53] hover:text-white hover:shadow-md" 
            : "bg-white hover:bg-[#097f53] hover:text-white hover:shadow-md"
        }`

    const handleNavigation = (path: string) => {
        navigate(path)
    }

    const isActive = (path: string) => location.pathname === path

    return (
        <div className="flex justify-center gap-4 mb-8 overflow-x-auto bg-gray-100 py-8 rounded-lg">
            <div className="flex space-x-4 items-center">
                <Button 
                    variant="ghost" 
                    className={baseTabClasses(isActive("/user-dashboard"))}
                    onClick={() => handleNavigation("/user-dashboard")}
                >
                    <LayoutDashboard className="w-6 h-6" />
                    <span className="text-sm font-medium">Dashboard</span>
                </Button>
                <Button 
                    variant="ghost" 
                    className={baseTabClasses(isActive("/user-booking-history"))}
                    onClick={() => handleNavigation("/user-booking-history")}
                >
                    <Calendar className="w-6 h-6" />
                    <span className="text-sm font-medium">My Bookings</span>
                </Button>
                <Button 
                    variant="ghost" 
                    className={baseTabClasses(isActive("/user-chat"))}
                    onClick={() => handleNavigation("/user-chat")}
                >
                    <MessageSquare className="w-6 h-6" />
                    <span className="text-sm font-medium">Chat</span>
                </Button>
                <Button 
                    variant="ghost" 
                    className={baseTabClasses(isActive("/user-invoices"))}
                    onClick={() => handleNavigation("/user-invoices")}
                >
                    <FileText className="w-6 h-6" />
                    <span className="text-sm font-medium">Invoices</span>
                </Button>
                <Button 
                    variant="ghost" 
                    className={baseTabClasses(isActive("/user-wallet"))}
                    onClick={() => handleNavigation("/user-wallet")}
                >
                    <Wallet className="w-6 h-6" />
                    <span className="text-sm font-medium">Wallet</span>
                </Button>
                <Button 
                    variant="ghost" 
                    className={baseTabClasses(isActive("/user-profile"))}
                    onClick={() => handleNavigation("/user-profile")}
                >
                    <Settings className="w-6 h-6" />
                    <span className="text-sm font-medium">Profile Setting</span>
                </Button>
            </div>
        </div>
    )
}
