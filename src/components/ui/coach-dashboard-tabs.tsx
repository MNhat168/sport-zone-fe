import { useNavigate, useLocation } from "react-router-dom"
import { Button } from "@/components/ui/button"
import {
    Calendar,
    MessageSquare,
    Wallet,
    Settings,
    LayoutDashboard,
    MapPin,
    UserCheck,
    DollarSign,
} from "lucide-react"

export function CoachDashboardTabs() {
    const navigate = useNavigate()
    const location = useLocation()
    
    const baseTabClasses = (isActive: boolean) =>
        `flex flex-col items-center gap-2 rounded-2xl border border-gray-200 min-w-[140px] p-[20px] h-[90px] transition-all duration-200 ${isActive
            ? "bg-[#097f53] text-white hover:bg-[#097f53] hover:text-white"
            : "bg-white hover:bg-[#097f53] hover:text-white"
        }`


    const handleNavigation = (path: string) => {
        navigate(path)
    }

    const isActive = (path: string) => location.pathname === path

    return (
        <div className="bg-gray-100 py-8">
            <div className="max-w-[1320px] mx-auto">
                <div className="flex justify-center gap-3 overflow-x-auto rounded-lg">
                    <div className="flex justify-between items-center w-full">
                        <Button 
                            variant="ghost" 
                            className={baseTabClasses(isActive("/coach-dashboard"))}
                            onClick={() => handleNavigation("/coach-dashboard")}
                        >
                            <LayoutDashboard className="w-5 h-5" />
                            <span className="text-xs font-medium">Dashboard</span>
                        </Button>
                        <Button 
                            variant="ghost" 
                            className={baseTabClasses(isActive("/coach-courts"))}
                            onClick={() => handleNavigation("/coach-courts")}
                        >
                            <MapPin className="w-5 h-5" />
                            <span className="text-xs font-medium">Courts</span>
                        </Button>
                        <Button 
                            variant="ghost" 
                            className={baseTabClasses(isActive("/coach-requests"))}
                            onClick={() => handleNavigation("/coach-requests")}
                        >
                            <UserCheck className="w-5 h-5" />
                            <span className="text-xs font-medium">Requests</span>
                        </Button>
                        <Button 
                            variant="ghost" 
                            className={baseTabClasses(isActive("/coach-bookings"))}
                            onClick={() => handleNavigation("/coach-bookings")}
                        >
                            <Calendar className="w-5 h-5" />
                            <span className="text-xs font-medium">Bookings</span>
                        </Button>
                        <Button 
                            variant="ghost" 
                            className={baseTabClasses(isActive("/coach-chat"))}
                            onClick={() => handleNavigation("/coach-chat")}
                        >
                            <MessageSquare className="w-5 h-5" />
                            <span className="text-xs font-medium">Chat</span>
                        </Button>
                        <Button 
                            variant="ghost" 
                            className={baseTabClasses(isActive("/coach-earnings"))}
                            onClick={() => handleNavigation("/coach-earnings")}
                        >
                            <DollarSign className="w-5 h-5" />
                            <span className="text-xs font-medium">Earnings</span>
                        </Button>
                        <Button 
                            variant="ghost" 
                            className={baseTabClasses(isActive("/coach-wallet"))}
                            onClick={() => handleNavigation("/coach-wallet")}
                        >
                            <Wallet className="w-5 h-5" />
                            <span className="text-xs font-medium">Wallet</span>
                        </Button>
                        <Button 
                            variant="ghost" 
                            className={baseTabClasses(isActive("/coach-profile"))}
                            onClick={() => handleNavigation("/coach-profile")}
                        >
                            <Settings className="w-5 h-5" />
                            <span className="text-xs font-medium">Profile Setting</span>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}