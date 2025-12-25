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
                    title: "User Dashboard",
                    breadcrumb: ["Home", "User Dashboard"]
                }
            case "/user-booking-history":
                return {
                    title: "My Bookings",
                    breadcrumb: ["Home", "User Dashboard", "My Bookings"]
                }
            case "/user-invoices":
                return {
                    title: "Invoices",
                    breadcrumb: ["Home", "User Dashboard", "Invoices"]
                }
            case "/user-tournaments":
                return {
                    title: "Tournaments",
                    breadcrumb: ["Home", "User Dashboard", "Tournaments"]
                }
            case "/user-wallet":
                return {
                    title: "Wallet",
                    breadcrumb: ["Home", "User Dashboard", "Wallet"]
                }
            case "/user-profile":
                return {
                    title: "Profile Settings",
                    breadcrumb: ["Home", "User Dashboard", "Profile Settings"]
                }
            default:
                return {
                    title: "User Dashboard",
                    breadcrumb: ["Home", "User Dashboard"]
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
            <div className="relative max-w-[1320px] mx-auto px-12 py-12">
                <h1 className="text-4xl font-bold text-start mb-4 drop-shadow-md">
                    {headerInfo.title}
                </h1>
                <div className="flex items-center gap-2 text-sm opacity-90 drop-shadow">
                    {headerInfo.breadcrumb.map((item, index) => (
                        <div key={index} className="flex items-center gap-2">
                            <span>{item}</span>
                            {index < headerInfo.breadcrumb.length - 1 && (
                                <ChevronRight className="w-4 h-4" />
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
