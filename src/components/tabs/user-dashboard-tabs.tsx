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
import { useRef, useEffect, useState } from "react"

export function UserDashboardTabs() {
    const navigate = useNavigate()
    const location = useLocation()
    const scrollContainerRef = useRef<HTMLDivElement>(null)
    const wrapperRef = useRef<HTMLDivElement>(null)
    const [scrollState, setScrollState] = useState({ isAtStart: true, isAtEnd: false })

    const baseTabClasses = (isActive: boolean) =>
        `w-24 h-20 sm:w-36 sm:h-24 md:w-40 md:h-28 lg:w-48 lg:h-32 p-2 sm:p-3 md:p-4 rounded-[10px] border border-gray-200 flex flex-col justify-center items-center gap-1 sm:gap-1.5 md:gap-2.5 transition-all duration-200 flex-shrink-0 ${isActive
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

    // Define all tabs
    const tabs = [
        {
            path: "/user/single-bookings",
            label: "Đơn lẻ",
            icon: <Calendar className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 flex-shrink-0" />
        },
        {
            path: "/user/batch-bookings",
            label: "Hàng loạt",
            icon: <Calendar className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 flex-shrink-0" />
        },
        {
            path: "/user/recurring-bookings",
            label: "Cố định",
            icon: <Calendar className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 flex-shrink-0" />
        },
        {
            path: "/user/coach-bookings",
            label: "Đặt HLV",
            icon: <User className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 flex-shrink-0" />
        },
        {
            path: "/user/combined-bookings",
            label: "Combo Sân + HLV",
            icon: <LayoutDashboard className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
        },
    ]

    // Update scroll state and visual indicators
    const updateScrollState = () => {
        if (scrollContainerRef.current) {
            const container = scrollContainerRef.current
            const isAtStart = container.scrollLeft <= 5
            const isAtEnd = container.scrollLeft + container.clientWidth >= container.scrollWidth - 5
            setScrollState({ isAtStart, isAtEnd })

            // Update wrapper classes
            if (wrapperRef.current) {
                wrapperRef.current.classList.toggle('scroll-start', isAtStart)
                wrapperRef.current.classList.toggle('scroll-end', isAtEnd)
            }
        }
    }

    // Auto-scroll to active tab on mount/route change (only for mobile)
    useEffect(() => {
        if (scrollContainerRef.current && window.innerWidth < 768) {
            const activeTabIndex = tabs.findIndex(tab => isActive(tab.path))
            if (activeTabIndex >= 0) {
                const container = scrollContainerRef.current
                const tabElement = container.children[activeTabIndex] as HTMLElement
                if (tabElement) {
                    const containerRect = container.getBoundingClientRect()
                    const tabRect = tabElement.getBoundingClientRect()
                    const scrollLeft = tabElement.offsetLeft - container.offsetLeft - (containerRect.width / 2) + (tabRect.width / 2)
                    container.scrollTo({
                        left: scrollLeft,
                        behavior: 'smooth'
                    })
                }
            }
            // Update scroll state after scrolling
            setTimeout(updateScrollState, 100)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.pathname])

    // Check if any secondary tab is active
    const isSecondaryTabActive =
        isActive("/user/refund") ||
        isActive("/user-profile")

    return (
        <>
            <style>{`
                /* Desktop: Standard scrollbar */
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
                
                /* Mobile: Hide scrollbar but allow functionality */
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
            <div className="w-full px-4 md:px-12 pt-4 md:pt-6 pb-2 bg-gray-100 flex justify-center items-start md:overflow-visible">
                <div className="w-full flex justify-center items-start flex-wrap content-start">
                    <div className="flex-1 max-w-[1320px] px-2 md:px-3 flex flex-col justify-start items-start min-w-0">
                        {/* Mobile wrapper with visual indicators */}
                        <div ref={wrapperRef} className={`md:hidden w-full pb-4 relative`}>
                            <div
                                ref={scrollContainerRef}
                                className="no-scrollbar flex flex-row justify-start items-end gap-3 w-full overflow-x-auto overflow-y-hidden snap-x snap-mandatory pb-4"
                                style={{
                                    scrollBehavior: 'smooth',
                                    WebkitOverflowScrolling: 'touch',
                                }}
                                onScroll={updateScrollState}
                            >
                                {tabs.map((tab) => (
                                    <div
                                        key={tab.path}
                                        style={{
                                            flexShrink: 0,
                                            scrollSnapAlign: 'start'
                                        }}
                                    >
                                        <Button
                                            variant="ghost"
                                            className={baseTabClasses(isActive(tab.path))}
                                            onClick={() => handleNavigation(tab.path)}
                                            style={{
                                                touchAction: 'manipulation'
                                            }}
                                        >
                                            {tab.icon}
                                            <div className="text-center text-xs sm:text-sm md:text-base font-medium leading-tight px-1">
                                                {tab.label}
                                            </div>
                                        </Button>
                                    </div>
                                ))}

                                {/* Secondary Tabs - Dropdown Menu */}
                                <div
                                    style={{
                                        flexShrink: 0,
                                        scrollSnapAlign: 'start'
                                    }}
                                >
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                className={`w-24 h-20 sm:w-36 sm:h-24 md:w-40 md:h-28 lg:w-48 lg:h-32 p-2 sm:p-3 md:p-4 rounded-[10px] border border-gray-200 flex flex-col justify-center items-center gap-1 sm:gap-1.5 md:gap-2.5 transition-all duration-200 ${isSecondaryTabActive
                                                    ? "bg-emerald-700 text-white hover:bg-emerald-800"
                                                    : "bg-white text-black hover:bg-emerald-700 hover:text-white"
                                                    }`}
                                                style={{
                                                    touchAction: 'manipulation'
                                                }}
                                            >
                                                <MoreHorizontal className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 flex-shrink-0" />
                                                <div className="text-center text-xs sm:text-sm md:text-base font-medium leading-tight">Khác</div>
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

                        {/* Desktop: Standard scroll without touch events */}
                        <div className="hidden md:block w-full pb-4 md:pb-6">
                            <div
                                className="w-full flex justify-start items-end gap-3 md:gap-7 tabs-scroll-container overflow-x-auto"
                                style={{
                                    scrollBehavior: 'smooth',
                                    overflowY: 'hidden'
                                }}
                            >
                                {tabs.map((tab) => (
                                    <Button
                                        key={tab.path}
                                        variant="ghost"
                                        className={baseTabClasses(isActive(tab.path))}
                                        onClick={() => handleNavigation(tab.path)}
                                    >
                                        {tab.icon}
                                        <div className="text-center text-xs sm:text-sm md:text-base font-medium leading-tight px-1">
                                            {tab.label}
                                        </div>
                                    </Button>
                                ))}

                                {/* Secondary Tabs - Dropdown Menu */}
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            className={`w-24 h-20 sm:w-36 sm:h-24 md:w-40 md:h-28 lg:w-48 lg:h-32 p-2 sm:p-3 md:p-4 rounded-[10px] border border-gray-200 flex flex-col justify-center items-center gap-1 sm:gap-1.5 md:gap-2.5 transition-all duration-200 flex-shrink-0 ${isSecondaryTabActive
                                                ? "bg-emerald-700 text-white hover:bg-emerald-800"
                                                : "bg-white text-black hover:bg-emerald-700 hover:text-white"
                                                }`}
                                        >
                                            <MoreHorizontal className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 flex-shrink-0" />
                                            <div className="text-center text-xs sm:text-sm md:text-base font-medium leading-tight">Khác</div>
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
            </div>
        </>
    )
}
