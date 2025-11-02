import { useNavigate, useLocation } from "react-router-dom"
import { Button } from "@/components/ui/button"
import {
    LayoutDashboard,
    Plus,
    List,
    Calendar,
    MessageSquare,
    FileText,
    Wallet,
    User,
    History,
} from "lucide-react"

export function FieldOwnerDashboardTabs() {
    const navigate = useNavigate()
    const location = useLocation()

    const baseTabClasses = (isActive: boolean) =>
        `w-36 h-24 p-3 rounded-[8px] border border-gray-100 flex flex-col justify-center items-center gap-1.5 transition-all duration-200 font-['Outfit'] ${isActive
            ? "bg-emerald-700 text-white hover:bg-emerald-800"
            : "bg-white text-black hover:bg-emerald-700 hover:text-white"
        }`

    const handleNavigation = (path: string) => {
        navigate(path)
    }

    const isActive = (path: string) => location.pathname === path
    const profilePath = "/field-owner/profile"

    return (
        <div className="w-full px-4 pt-6 pb-2 bg-gray-100">
            <div className="max-w-[1320px] mx-auto">
                <div className="w-full pb-6 flex flex-wrap justify-center items-center gap-4">
                    <Button
                        variant="ghost"
                        className={baseTabClasses(isActive("/field-owner-dashboard"))}
                        onClick={() => handleNavigation("/field-owner-dashboard")}
                    >
                        <LayoutDashboard className="w-5 h-5" />
                        <div className="text-center text-sm font-medium font-['Outfit']">Dashboard</div>
                    </Button>

                    <Button
                        variant="ghost"
                        className={baseTabClasses(isActive("/field/create"))}
                        onClick={() => handleNavigation("/field/create")}
                    >
                        <Plus className="w-5 h-5" />
                        <div className="text-center text-sm font-medium font-['Outfit']">Tạo sân mới</div>
                    </Button>

                    <Button
                        variant="ghost"
                        className={baseTabClasses(isActive("/field-owner/fields"))}
                        onClick={() => handleNavigation("/field-owner/fields")}
                    >
                        <List className="w-5 h-5" />
                        <div className="text-center text-sm font-medium font-['Outfit']">Danh sách sân</div>
                    </Button>

                    <Button
                        variant="ghost"
                        className={baseTabClasses(isActive("/field-owner/bookings"))}
                        onClick={() => handleNavigation("/field-owner/bookings")}
                    >
                        <Calendar className="w-5 h-5" />
                        <div className="text-center text-sm font-medium font-['Outfit']">Đặt sân</div>
                    </Button>

                    <Button
                        variant="ghost"
                        className={baseTabClasses(isActive("/field-owner/booking-history"))}
                        onClick={() => handleNavigation("/field-owner/booking-history")}
                    >
                        <History className="w-5 h-5" />
                        <div className="text-center text-sm font-medium font-['Outfit']">Lịch sử booking</div>
                    </Button>

                    <Button
                        variant="ghost"
                        className={baseTabClasses(isActive("/field-owner/analytics"))}
                        onClick={() => handleNavigation("/field-owner/analytics")}
                    >
                        <MessageSquare className="w-5 h-5" />
                        <div className="text-center text-sm font-medium font-['Outfit']">Chat</div>
                    </Button>

                    <Button
                        variant="ghost"
                        className={baseTabClasses(isActive("/field-owner/revenue"))}
                        onClick={() => handleNavigation("/field-owner/revenue")}
                    >
                        <FileText className="w-5 h-5" />
                        <div className="text-center text-sm font-medium font-['Outfit']">Doanh thu</div>
                    </Button>

                    <Button
                        variant="ghost"
                        className={baseTabClasses(isActive(profilePath))}
                        onClick={() => handleNavigation(profilePath)}
                    >
                        <User className="w-5 h-5" />
                        <div className="text-center text-sm font-medium font-['Outfit']">Profile</div>
                    </Button>

                    <Button
                        variant="ghost"
                        className={baseTabClasses(isActive("/field-owner/customers"))}
                        onClick={() => handleNavigation("/field-owner/customers")}
                    >
                        <Wallet className="w-5 h-5" />
                        <div className="text-center text-sm font-medium font-['Outfit']">Ví</div>
                    </Button>

                    {/* <Button
                        variant="ghost"
                        className={baseTabClasses(isActive("/field-owner/settings"))}
                        onClick={() => handleNavigation("/field-owner/settings")}
                    >
                        <User className="w-5 h-5" />
                        <div className="text-center text-sm font-medium font-['Outfit']">Cài đặt</div>
                    </Button> */}
                </div>
            </div>
        </div>
    )
}
