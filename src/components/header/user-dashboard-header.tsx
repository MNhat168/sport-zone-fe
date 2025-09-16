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
            case "/user-chat":
                return {
                    title: "Chat",
                    breadcrumb: ["Home", "User Dashboard", "Chat"]
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
    
    return (
        <div className="bg-gradient-to-r from-teal-800 via-blue-800 to-purple-800 text-white">
            <div className="container mx-auto px-12 py-12">
                <h1 className="text-4xl font-bold text-start mb-4">{headerInfo.title}</h1>
                <div className="flex items-center gap-2 text-sm opacity-90">
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
