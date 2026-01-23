import { useNavigate, useLocation } from "react-router-dom"
import { Button } from "@/components/ui/button"
import {
    LayoutDashboard,
    Calendar,
    Wallet,
    User,
    MoreHorizontal,
} from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function UserDashboardTabs() {
    const navigate = useNavigate()
    const location = useLocation()

    const baseTabClasses = (isActive: boolean) =>
        `w-48 h-32 p-4 rounded-[10px] border border-gray-200 flex flex-col justify-center items-center gap-2.5 transition-all duration-200 flex-shrink-0 ${isActive
            ? "bg-emerald-700 text-white hover:bg-emerald-800"
            : "bg-white text-black hover:bg-emerald-700 hover:text-white"
        }`

    const handleNavigation = (path: string) => {
        navigate(path)
    }

    const isActive = (path: string) => {
        if (path === "/user-dashboard") {
            return location.pathname === path;
        }
        return location.pathname.startsWith(path);
    }

    // Check if any secondary tab is active
    const isSecondaryTabActive =
        isActive("/user/refund") ||
        isActive("/user-profile")

    return (
        <>
            <style>{`
                .tabs-scroll-container {
                    scrollbar-width: thin;
                    scrollbar-color: #cbd5e0 transparent;
                }
                .tabs-scroll-container::-webkit-scrollbar {
                    height: 6px;
                }
                .tabs-scroll-container::-webkit-scrollbar-track {
                    background: transparent;
                }
                .tabs-scroll-container::-webkit-scrollbar-thumb {
                    background-color: #cbd5e0;
                    border-radius: 3px;
                }
                .tabs-scroll-container::-webkit-scrollbar-thumb:hover {
                    background-color: #a0aec0;
                }
            `}</style>
            <div className="w-full pl-[530.63px] pr-[530.62px] pt-6 pb-2 bg-gray-100 flex justify-start items-start overflow-hidden">
                <div className="w-full flex justify-center items-start flex-wrap content-start">
                    <div className="flex-1 max-w-[1320px] px-3 flex flex-col justify-start items-start">
                        <div className="w-full pb-6 flex justify-start items-end gap-7 overflow-x-auto tabs-scroll-container" style={{ scrollBehavior: 'smooth' }}>
                            {/* Primary Tabs - Visible with horizontal scroll */}
                            {/* <Button
                                variant="ghost"
                                className={baseTabClasses(isActive("/user-dashboard"))}
                                onClick={() => handleNavigation("/user-dashboard")}
                            >
                                <LayoutDashboard className="w-6 h-6" />
                                <div className="text-center text-base font-medium">Tổng quan</div>
                            </Button> */}

                            <Button
                                variant="ghost"
                                className={baseTabClasses(isActive("/user/single-bookings"))}
                                onClick={() => handleNavigation("/user/single-bookings")}
                            >
                                <Calendar className="w-6 h-6" />
                                <div className="text-center text-base font-medium">Đơn lẻ</div>
                            </Button>

                            <Button
                                variant="ghost"
                                className={baseTabClasses(isActive("/user/batch-bookings"))}
                                onClick={() => handleNavigation("/user/batch-bookings")}
                            >
                                <Calendar className="w-6 h-6" />
                                <div className="text-center text-base font-medium">Hàng loạt</div>
                            </Button>

                            <Button
                                variant="ghost"
                                className={baseTabClasses(isActive("/user/recurring-bookings"))}
                                onClick={() => handleNavigation("/user/recurring-bookings")}
                            >
                                <Calendar className="w-6 h-6" />
                                <div className="text-center text-base font-medium">Cố định</div>
                            </Button>

                            <Button
                                variant="ghost"
                                className={baseTabClasses(isActive("/user/coach-bookings"))}
                                onClick={() => handleNavigation("/user/coach-bookings")}
                            >
                                <User className="w-6 h-6" />
                                <div className="text-center text-base font-medium">Đặt HLV</div>
                            </Button>

                            <Button
                                variant="ghost"
                                className={baseTabClasses(isActive("/user/combined-bookings"))}
                                onClick={() => handleNavigation("/user/combined-bookings")}
                            >
                                <LayoutDashboard className="w-6 h-6" />
                                <div className="text-center text-base font-medium">Combo Sân + HLV</div>
                            </Button>

                            {/* Secondary Tabs - Dropdown Menu */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        className={`w-48 h-32 p-4 rounded-[10px] border border-gray-200 flex flex-col justify-center items-center gap-2.5 transition-all duration-200 flex-shrink-0 ${isSecondaryTabActive
                                                ? "bg-emerald-700 text-white hover:bg-emerald-800"
                                                : "bg-white text-black hover:bg-emerald-700 hover:text-white"
                                            }`}
                                    >
                                        <MoreHorizontal className="w-6 h-6" />
                                        <div className="text-center text-base font-medium">Khác</div>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    align="end"
                                    className="w-56 bg-white shadow-md border border-gray-200 rounded-md"
                                >
                                    <DropdownMenuItem
                                        asChild
                                        className={`cursor-pointer ${isActive("/user/refund")
                                                ? "bg-emerald-50 text-emerald-700"
                                                : "text-black hover:bg-gray-50"
                                            }`}
                                    >
                                        <button
                                            onClick={() => handleNavigation("/user/refund")}
                                            className="w-full flex items-center p-2"
                                        >
                                            <Wallet className="mr-2 h-5 w-5" />
                                            <span className="text-base">Hoàn tiền</span>
                                        </button>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        asChild
                                        className={`cursor-pointer ${isActive("/user-profile")
                                                ? "bg-emerald-50 text-emerald-700"
                                                : "text-black hover:bg-gray-50"
                                            }`}
                                    >
                                        <button
                                            onClick={() => handleNavigation("/user-profile")}
                                            className="w-full flex items-center p-2"
                                        >
                                            <User className="mr-2 h-5 w-5" />
                                            <span className="text-base">Cài đặt tài khoản</span>
                                        </button>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
