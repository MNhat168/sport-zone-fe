import { useLocation } from "react-router-dom"
import { ChevronRight } from "lucide-react"

interface HeaderInfo {
    title: string
    breadcrumb: string[]
}

export function CoachDashboardHeader() {
    const location = useLocation()
    
    const getHeaderInfo = (pathname: string): HeaderInfo => {
        switch (pathname) {
            case "/coach/dashboard":
                return {
                    title: "Coach Dashboard",
                    breadcrumb: ["Home", "Coach Dashboard"]
                }
            case "/coach-courts":
                return {
                    title: "Courts",
                    breadcrumb: ["Home", "Coach Dashboard", "Courts"]
                }
            case "/coach-requests":
                return {
                    title: "Requests",
                    breadcrumb: ["Home", "Coach Dashboard", "Requests"]
                }
            case "/coach/schedule":
                return {
                    title: "Schedule",
                    breadcrumb: ["Home", "Coach Dashboard", "Schedule"]
                }
            case "/coach-chat":
                return {
                    title: "Chat",
                    breadcrumb: ["Home", "Coach Dashboard", "Chat"]
                }
            case "/coach-earnings":
                return {
                    title: "Earnings",
                    breadcrumb: ["Home", "Coach Dashboard", "Earnings"]
                }
            case "/coach-wallet":
                return {
                    title: "Wallet",
                    breadcrumb: ["Home", "Coach Dashboard", "Wallet"]
                }
            case "/coach-profile":
                return {
                    title: "Profile Settings",
                    breadcrumb: ["Home", "Coach Dashboard", "Profile Settings"]
                }
            default:
                return {
                    title: "Coach Dashboard",
                    breadcrumb: ["Home", "Coach Dashboard"]
                }
        }
    }
    
    const headerInfo = getHeaderInfo(location.pathname)
    
    return (
        <div className="bg-gradient-to-r from-teal-800 via-blue-800 to-purple-800 text-white">
            <div className="max-w-[1320px] mx-auto px-12 py-12">
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
