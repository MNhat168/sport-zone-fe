import { useLocation } from "react-router-dom"
import { ChevronRight } from "lucide-react"

interface HeaderInfo {
    title: string
    breadcrumb: string[]
}

export function UserDashboardHeader() {
    const location = useLocation()

    const getHeaderInfo = (pathname: string): HeaderInfo => {
        switch (pathname) {
            case "/user-dashboard":
                return {
                    title: "Bảng điều khiển",
                    breadcrumb: ["Trang chủ", "Bảng điều khiển"]
                }
            case "/user-booking-history":
                return {
                    title: "Lịch sử đặt sân",
                    breadcrumb: ["Trang chủ", "Bảng điều khiển", "Lịch sử đặt sân"]
                }
            case "/user-invoices":
                return {
                    title: "Hóa đơn",
                    breadcrumb: ["Trang chủ", "Bảng điều khiển", "Hóa đơn"]
                }
            case "/user-tournaments":
                return {
                    title: "Giải đấu",
                    breadcrumb: ["Trang chủ", "Bảng điều khiển", "Giải đấu"]
                }

            case "/user-profile":
                return {
                    title: "Cài đặt tài khoản",
                    breadcrumb: ["Trang chủ", "Bảng điều khiển", "Cài đặt tài khoản"]
                }
            default:
                return {
                    title: "Bảng điều khiển",
                    breadcrumb: ["Trang chủ", "Bảng điều khiển"]
                }
        }
    }

    const headerInfo = getHeaderInfo(location.pathname)

    // Use shared banner image from public/banner.img
    const backgroundImage = "/banner.img/sport_banner_2.jpg"

    return (
        <div className="relative text-white">
            {/* Background image */}
            <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${backgroundImage})` }}
            />
            {/* Dark overlay to keep text readable */}
            <div className="absolute inset-0 bg-black/60" />

            {/* Content */}
            <div className="relative max-w-[1320px] mx-auto px-4 md:px-8 lg:px-12 py-6 md:py-8 lg:py-12">
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-start mb-3 md:mb-4 drop-shadow-md">
                    {headerInfo.title}
                </h1>
                <div className="flex items-center gap-1 md:gap-2 text-xs md:text-sm opacity-90 drop-shadow flex-wrap">
                    {headerInfo.breadcrumb.map((item, index) => (
                        <div key={index} className="flex items-center gap-1 md:gap-2">
                            <span className="truncate max-w-[120px] md:max-w-none">{item}</span>
                            {index < headerInfo.breadcrumb.length - 1 && (
                                <ChevronRight className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
