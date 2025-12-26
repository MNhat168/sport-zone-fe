import { useNavigate, useLocation } from "react-router-dom"
import { Button } from "@/components/ui/button"
import {
    LayoutDashboard,
    Calendar,

    Wallet,
    User,
} from "lucide-react"

export function UserDashboardTabs() {
    const navigate = useNavigate()
    const location = useLocation()

    const baseTabClasses = (isActive: boolean) =>
        `w-48 h-32 p-4 rounded-[10px] border border-gray-200 flex flex-col justify-center items-center gap-2.5 transition-all duration-200 ${isActive
            ? "bg-emerald-700 text-white hover:bg-emerald-800"
            : "bg-white text-black hover:bg-emerald-700 hover:text-white"
        }`

    const handleNavigation = (path: string) => {
        navigate(path)
    }

    const isActive = (path: string) => location.pathname === path

    return (
        <div className="w-full pl-[530.63px] pr-[530.62px] pt-6 pb-2 bg-gray-100 flex justify-start items-start overflow-hidden">
            <div className="w-full flex justify-center items-start flex-wrap content-start">
                <div className="flex-1 max-w-[1320px] px-3 flex flex-col justify-start items-start">
                    <div className="w-full pb-6 flex justify-start items-end gap-7">
                        <Button
                            variant="ghost"
                            className={baseTabClasses(isActive("/user-dashboard"))}
                            onClick={() => handleNavigation("/user-dashboard")}
                        >
                            <LayoutDashboard className="w-6 h-6" />
                            <div className="text-center text-base font-medium">Tổng quan</div>
                        </Button>

                        <Button
                            variant="ghost"
                            className={baseTabClasses(isActive("/user-booking-history"))}
                            onClick={() => handleNavigation("/user-booking-history")}
                        >
                            <Calendar className="w-6 h-6" />
                            <div className="text-center text-base font-medium">Lịch sử đặt sân</div>
                        </Button>

                        {/* <Button
                            variant="ghost"
                            className={baseTabClasses(isActive("/user-invoices"))}
                            onClick={() => handleNavigation("/user-invoices")}
                        >
                            <FileText className="w-6 h-6" />
                            <div className="text-center text-base font-medium">Invoices</div>
                        </Button> */}

                        <Button
                            variant="ghost"
                            className={baseTabClasses(isActive("/user-tournaments"))}
                            onClick={() => handleNavigation("/user-tournaments")}
                        >
                            <Wallet className="w-6 h-6" />
                            <div className="text-center text-base font-medium">Giải đấu</div>
                        </Button>

                        <Button
                            variant="ghost"
                            className={baseTabClasses(isActive("/user-profile"))}
                            onClick={() => handleNavigation("/user-profile")}
                        >
                                <User className="w-6 h-6" />
                                <div className="text-center text-base font-medium">Cài đặt tài khoản</div>
                            </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
