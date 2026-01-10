import { useState, useEffect } from "react"
import { useLocation, Link, useNavigate, useParams } from "react-router-dom"
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubItem,
    SidebarMenuSubButton,
    SidebarFooter
} from "@/components/ui/sidebar"
import {
    LayoutDashboard,
    Plus,
    List,
    FileText,
    Wallet,
    User,
    History,
    Building2,
    LogOut,
    Eye,
    Edit,
    Trophy,
    CalendarDays,
    Repeat,
    Calendar,
    Users,
    QrCode,
} from "lucide-react"
import { useAppSelector, useAppDispatch } from "@/store/hook"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { logout } from "@/features/authentication/authThunk"
import { clearUserAuth } from "@/lib/cookies"
import { NotificationBell } from "@/components/header/notification-bell"
import { Loading } from "@/components/ui/loading"

interface MenuItem {
    title: string
    url: string
    icon: React.ComponentType<{ className?: string }>
    badge?: string
}

const menuItems: MenuItem[] = [
    {
        title: "Dashboard",
        url: "/field-owner-dashboard",
        icon: LayoutDashboard,
    },
    {
        title: "Tạo sân mới",
        url: "/field/create",
        icon: Plus,
    },
    {
        title: "Quản lý sân",
        url: "/field-owner/fields",
        icon: List,
    },
    {
        title: "Đặt sân đơn lẻ",
        url: "/field-owner/single-bookings",
        icon: CalendarDays,
    },
    {
        title: "Đặt sân nhiều ngày liên tiếp",
        url: "/field-owner/consecutive-bookings",
        icon: Calendar,
    },
    {
        title: "Đặt sân định kỳ hàng tuần",
        url: "/field-owner/recurring-bookings",
        icon: Repeat,
    },
    {
        title: "Đặt sân kèm HLV",
        url: "/field-owner/field-coach-bookings",
        icon: Users,
    },
    {
        title: "Quét QR Check-in",
        url: "/field-owner/check-in",
        icon: QrCode,
    },
    {
        title: "Ví",
        url: "/field-owner/wallet",
        icon: Wallet,
    },
    {
        title: "Profile",
        url: "/field-owner/profile",
        icon: User,
    },
]

const fieldCreateTabs = [
    { id: 'basic', label: 'Thông tin cơ bản' },
    { id: 'price', label: 'Giá sân' },
    { id: 'availability', label: 'Lịch trống' },
    { id: 'overview', label: 'Tổng quan' },
    { id: 'includes', label: 'Bao gồm' },
    { id: 'rules', label: 'Quy định' },
    { id: 'amenities', label: 'Tiện ích' },
    { id: 'gallery', label: 'Thư viện ảnh' },
    { id: 'locations', label: 'Vị trí' }
]

const bookingHistoryTabs = [
    { id: 'pending', label: 'Đang Chờ' },
    { id: 'succeeded', label: 'Thành Công' },
    { id: 'cancelled', label: 'Đã Hủy' },
    { id: 'refunded', label: 'Đã Hoàn Tiền' }
]

// Single booking tabs - filter by booking status (no pending)
const singleBookingTabs = [
    { id: 'confirmed', label: 'Đã Xác Nhận' },
    { id: 'cancelled', label: 'Đã Hủy' },
    { id: 'completed', label: 'Hoàn Thành' }
]

const fieldsTabs = [
    { id: 'list', label: 'Danh sách sân', icon: List, url: '/field-owner/fields' },
    { id: 'view', label: 'Xem chi tiết', icon: Eye, url: null }, // Will be set dynamically
    { id: 'edit', label: 'Chỉnh sửa', icon: Edit, url: null }, // Will be set dynamically
]

export function FieldOwnerSidebar() {
    const location = useLocation()
    const navigate = useNavigate()
    const dispatch = useAppDispatch()
    const { fieldId } = useParams<{ fieldId: string }>()
    const authUser = useAppSelector((state) => state.auth.user)
    const isFieldCreatePage = location.pathname === "/field/create"
    const isFieldBookingPage = location.pathname === "/field-owner/field-bookings"
    const isFieldsPage = location.pathname.startsWith("/field-owner/fields")
    const isSingleBookingsPage = location.pathname.startsWith("/field-owner/single-bookings")
    const isConsecutiveBookingsPage = location.pathname.startsWith("/field-owner/consecutive-bookings")
    const isRecurringBookingsPage = location.pathname.startsWith("/field-owner/recurring-bookings")
    const isFieldCoachBookingsPage = location.pathname.startsWith("/field-owner/field-coach-bookings")
    const [isCreateFieldSubmenuOpen, setIsCreateFieldSubmenuOpen] = useState(isFieldCreatePage)
    const [isFieldBookingSubmenuOpen, setIsFieldBookingSubmenuOpen] = useState(isFieldBookingPage)
    const [isFieldsSubmenuOpen, setIsFieldsSubmenuOpen] = useState(isFieldsPage)
    const [isSingleBookingsSubmenuOpen, setIsSingleBookingsSubmenuOpen] = useState(isSingleBookingsPage)
    const [isConsecutiveBookingsSubmenuOpen, setIsConsecutiveBookingsSubmenuOpen] = useState(isConsecutiveBookingsPage)
    const [isRecurringBookingsSubmenuOpen, setIsRecurringBookingsSubmenuOpen] = useState(isRecurringBookingsPage)
    const [isFieldCoachBookingsSubmenuOpen, setIsFieldCoachBookingsSubmenuOpen] = useState(isFieldCoachBookingsPage)
    const [activeSubTab, setActiveSubTab] = useState<string | null>(null)
    const [activeFieldBookingTab, setActiveFieldBookingTab] = useState<string | null>(null)
    const [activeFieldsTab, setActiveFieldsTab] = useState<string | null>(null)
    const [activeSingleBookingTab, setActiveSingleBookingTab] = useState<string | null>(null)
    const [activeConsecutiveBookingTab, setActiveConsecutiveBookingTab] = useState<string | null>(null)
    const [activeRecurringBookingTab, setActiveRecurringBookingTab] = useState<string | null>(null)
    const [activeFieldCoachBookingTab, setActiveFieldCoachBookingTab] = useState<string | null>(null)

    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const handleLogout = async () => {
        setIsLoggingOut(true);
        // Small delay to let the animation show
        await new Promise(resolve => setTimeout(resolve, 800));

        // Ensure all local state is wiped before moving away
        clearUserAuth();

        // Clear ALL auth-related storage (for both cookie and Bearer modes)
        try {
            sessionStorage.clear(); // Clear everything in sessionStorage
            localStorage.removeItem("user"); // Keep other localStorage items intact

            // Explicitly clear auth tokens (redundant but safe)
            sessionStorage.removeItem("auth_access_token");
            sessionStorage.removeItem("auth_refresh_token");
            sessionStorage.removeItem("auth_method");
        } catch (error) {
            console.error("Failed to clear storage:", error);
        }

        try {
            await dispatch(logout()).unwrap();
        } catch (error) {
            console.error("Server-side logout failed:", error);
        } finally {
            // Force reload to ensure clean state
            window.location.href = "/";
        }
    }

    // Auto-open submenu when on field/create page
    useEffect(() => {
        setIsCreateFieldSubmenuOpen(isFieldCreatePage)
    }, [isFieldCreatePage])

    // Auto-open submenu when on field-booking page
    useEffect(() => {
        setIsFieldBookingSubmenuOpen(isFieldBookingPage)
    }, [isFieldBookingPage])

    // Auto-open submenu when on field coach bookings page
    useEffect(() => {
        setIsFieldCoachBookingsSubmenuOpen(isFieldCoachBookingsPage)
    }, [isFieldCoachBookingsPage])

    // Auto-open submenu when on fields page
    useEffect(() => {
        setIsFieldsSubmenuOpen(isFieldsPage)
        if (isFieldsPage) {
            if (!fieldId) {
                setActiveFieldsTab('list')
            } else if (location.pathname.includes('/edit')) {
                setActiveFieldsTab('edit')
            } else {
                setActiveFieldsTab('view')
            }
        }
    }, [isFieldsPage, fieldId, location.pathname])

    // Auto-open submenu when on single bookings page
    useEffect(() => {
        setIsSingleBookingsSubmenuOpen(isSingleBookingsPage)
    }, [isSingleBookingsPage])

    // Auto-open submenu when on consecutive bookings page
    useEffect(() => {
        setIsConsecutiveBookingsSubmenuOpen(isConsecutiveBookingsPage)
    }, [isConsecutiveBookingsPage])

    // Auto-open submenu when on recurring bookings page
    useEffect(() => {
        setIsRecurringBookingsSubmenuOpen(isRecurringBookingsPage)
    }, [isRecurringBookingsPage])

    // Auto-open submenu when on field coach bookings page
    useEffect(() => {
        setIsFieldCoachBookingsSubmenuOpen(isFieldCoachBookingsPage)
    }, [isFieldCoachBookingsPage])

    const isActive = (path: string) => {
        if (path === "/field-owner-dashboard") {
            return location.pathname === path
        }
        return location.pathname.startsWith(path)
    }

    const handleTabClick = (tabId: string) => {
        setActiveSubTab(tabId)
        const element = document.getElementById(`section-${tabId}`)
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
    }

    const handleFieldBookingTabClick = (tabId: string) => {
        setActiveFieldBookingTab(tabId)
        // Dispatch custom event to notify the page about tab change
        window.dispatchEvent(new CustomEvent('booking-history-tab-change', { detail: { tab: tabId } }))
    }

    const handleCreateFieldClick = (e: React.MouseEvent) => {
        e.preventDefault()
        if (isFieldCreatePage) {
            // If already on the page, just toggle submenu
            setIsCreateFieldSubmenuOpen(!isCreateFieldSubmenuOpen)
        } else {
            // If not on the page, navigate and open submenu
            setIsCreateFieldSubmenuOpen(true)
            navigate("/field/create")
        }
    }

    const handleFieldBookingClick = (e: React.MouseEvent) => {
        e.preventDefault()
        if (isFieldBookingPage) {
            // If already on the page, just toggle submenu
            setIsFieldBookingSubmenuOpen(!isFieldBookingSubmenuOpen)
        } else {
            // If not on the page, navigate and open submenu
            setIsFieldBookingSubmenuOpen(true)
            navigate("/field-owner/field-bookings")
        }
    }

    const handleFieldsClick = (e: React.MouseEvent) => {
        e.preventDefault()
        if (isFieldsPage) {
            // If already on the page, just toggle submenu
            setIsFieldsSubmenuOpen(!isFieldsSubmenuOpen)
        } else {
            // If not on the page, navigate and open submenu
            setIsFieldsSubmenuOpen(true)
            navigate("/field-owner/fields")
        }
    }

    const handleFieldsTabClick = (tabId: string) => {
        setActiveFieldsTab(tabId)
        if (tabId === 'list') {
            navigate('/field-owner/fields')
        } else if (tabId === 'view' && fieldId) {
            navigate(`/field-owner/fields/${fieldId}`)
        } else if (tabId === 'edit' && fieldId) {
            navigate(`/field-owner/fields/${fieldId}/edit`)
        }
    }

    const handleSingleBookingsClick = (e: React.MouseEvent) => {
        e.preventDefault()
        if (isSingleBookingsPage) {
            setIsSingleBookingsSubmenuOpen(!isSingleBookingsSubmenuOpen)
        } else {
            setIsSingleBookingsSubmenuOpen(true)
            navigate("/field-owner/single-bookings")
        }
    }

    const handleConsecutiveBookingsClick = (e: React.MouseEvent) => {
        e.preventDefault()
        if (isConsecutiveBookingsPage) {
            setIsConsecutiveBookingsSubmenuOpen(!isConsecutiveBookingsSubmenuOpen)
        } else {
            setIsConsecutiveBookingsSubmenuOpen(true)
            navigate("/field-owner/consecutive-bookings")
        }
    }

    const handleRecurringBookingsClick = (e: React.MouseEvent) => {
        e.preventDefault()
        if (isRecurringBookingsPage) {
            setIsRecurringBookingsSubmenuOpen(!isRecurringBookingsSubmenuOpen)
        } else {
            setIsRecurringBookingsSubmenuOpen(true)
            navigate("/field-owner/recurring-bookings")
        }
    }

    const handleSingleBookingTabClick = (tabId: string) => {
        setActiveSingleBookingTab(tabId)
        window.dispatchEvent(new CustomEvent('single-booking-tab-change', { detail: { tab: tabId } }))
    }

    const handleConsecutiveBookingTabClick = (tabId: string) => {
        setActiveConsecutiveBookingTab(tabId)
        window.dispatchEvent(new CustomEvent('consecutive-booking-tab-change', { detail: { tab: tabId } }))
    }

    const handleRecurringBookingTabClick = (tabId: string) => {
        setActiveRecurringBookingTab(tabId)
        window.dispatchEvent(new CustomEvent('recurring-booking-tab-change', { detail: { tab: tabId } }))
    }

    const handleFieldCoachBookingsClick = (e: React.MouseEvent) => {
        e.preventDefault()
        if (isFieldCoachBookingsPage) {
            setIsFieldCoachBookingsSubmenuOpen(!isFieldCoachBookingsSubmenuOpen)
        } else {
            setIsFieldCoachBookingsSubmenuOpen(true)
            navigate("/field-owner/field-coach-bookings")
        }
    }

    const handleFieldCoachBookingTabClick = (tabId: string) => {
        setActiveFieldCoachBookingTab(tabId)
        window.dispatchEvent(new CustomEvent('field-coach-booking-tab-change', { detail: { tab: tabId } }))
    }

    const userInitials = authUser?.fullName
        ? authUser.fullName
            .split(" ")
            .map((w) => w[0])
            .join("")
            .toUpperCase()
        : "FO"

    return (
        <>
            {isLoggingOut && (
                <div className="fixed inset-0 z-[9999] bg-white/80 backdrop-blur-sm flex items-center justify-center transition-all duration-300">
                    <Loading size={100} />
                </div>
            )}
            <Sidebar collapsible="icon" variant="sidebar">
                <SidebarHeader className="border-b border-sidebar-border">
                    <div className="flex items-center justify-between px-2 py-4">
                        <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-600 text-white font-bold">
                                <Building2 className="h-5 w-5" />
                            </div>
                            <div className="flex flex-col group-data-[collapsible=icon]:hidden">
                                <span className="text-sm font-semibold">SportZone</span>
                                <span className="text-xs text-muted-foreground">Field Owner</span>
                            </div>
                        </div>
                        <div className="group-data-[collapsible=icon]:hidden">
                            <NotificationBell
                                userId={authUser?._id ?? null}
                                onNotificationReceived={(notification) => {
                                    // Dispatch custom event for dashboard to refresh bookings
                                    window.dispatchEvent(new CustomEvent('new-booking-notification', {
                                        detail: notification
                                    }));
                                }}
                            />
                        </div>
                    </div>
                </SidebarHeader>

                <SidebarContent>
                    <SidebarGroup>
                        <SidebarGroupLabel>Menu</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {menuItems.map((item) => {
                                    const Icon = item.icon
                                    const isCreateField = item.url === "/field/create"
                                    const isFieldBooking = item.url === "/field-owner/field-bookings"
                                    const isFieldCoachBooking = item.url === "/field-owner/field-coach-bookings"
                                    const isFields = item.url === "/field-owner/fields"
                                    const isSingleBookings = item.url === "/field-owner/single-bookings"
                                    const isConsecutiveBookings = item.url === "/field-owner/consecutive-bookings"
                                    const isRecurringBookings = item.url === "/field-owner/recurring-bookings"
                                    return (
                                        <SidebarMenuItem key={item.url}>
                                            {isCreateField ? (
                                                <SidebarMenuButton
                                                    isActive={isActive(item.url)}
                                                    tooltip={item.title}
                                                    onClick={handleCreateFieldClick}
                                                    className={isActive(item.url) ? "bg-primary text-white hover:bg-primary/90 hover:text-white data-[active=true]:bg-primary data-[active=true]:text-white" : ""}
                                                >
                                                    <Icon />
                                                    <span>{item.title}</span>
                                                    {item.badge && (
                                                        <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-sidebar-primary text-sidebar-primary-foreground text-xs">
                                                            {item.badge}
                                                        </span>
                                                    )}
                                                </SidebarMenuButton>
                                            ) : isFieldBooking ? (
                                                <SidebarMenuButton
                                                    isActive={isActive(item.url)}
                                                    tooltip={item.title}
                                                    onClick={handleFieldBookingClick}
                                                    className={isActive(item.url) ? "bg-primary text-white hover:bg-primary/90 hover:text-white data-[active=true]:bg-primary data-[active=true]:text-white" : ""}
                                                >
                                                    <Icon />
                                                    <span>{item.title}</span>
                                                    {item.badge && (
                                                        <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-sidebar-primary text-sidebar-primary-foreground text-xs">
                                                            {item.badge}
                                                        </span>
                                                    )}
                                                </SidebarMenuButton>
                                            ) : isFieldCoachBooking ? (
                                                <SidebarMenuButton
                                                    isActive={isActive(item.url)}
                                                    tooltip={item.title}
                                                    onClick={handleFieldCoachBookingsClick}
                                                    className={isActive(item.url) ? "bg-primary text-white hover:bg-primary/90 hover:text-white data-[active=true]:bg-primary data-[active=true]:text-white" : ""}
                                                >
                                                    <Icon />
                                                    <span>{item.title}</span>
                                                    {item.badge && (
                                                        <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-sidebar-primary text-sidebar-primary-foreground text-xs">
                                                            {item.badge}
                                                        </span>
                                                    )}
                                                </SidebarMenuButton>
                                            ) : isFields ? (
                                                <SidebarMenuButton
                                                    isActive={isActive(item.url)}
                                                    tooltip={item.title}
                                                    onClick={handleFieldsClick}
                                                    className={isActive(item.url) ? "bg-primary text-white hover:bg-primary/90 hover:text-white data-[active=true]:bg-primary data-[active=true]:text-white" : ""}
                                                >
                                                    <Icon />
                                                    <span>{item.title}</span>
                                                    {item.badge && (
                                                        <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-sidebar-primary text-sidebar-primary-foreground text-xs">
                                                            {item.badge}
                                                        </span>
                                                    )}
                                                </SidebarMenuButton>
                                            ) : isSingleBookings ? (
                                                <SidebarMenuButton
                                                    isActive={isActive(item.url)}
                                                    tooltip={item.title}
                                                    onClick={handleSingleBookingsClick}
                                                    className={isActive(item.url) ? "bg-primary text-white hover:bg-primary/90 hover:text-white data-[active=true]:bg-primary data-[active=true]:text-white" : ""}
                                                >
                                                    <Icon />
                                                    <span>{item.title}</span>
                                                    {item.badge && (
                                                        <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-sidebar-primary text-sidebar-primary-foreground text-xs">
                                                            {item.badge}
                                                        </span>
                                                    )}
                                                </SidebarMenuButton>
                                            ) : isConsecutiveBookings ? (
                                                <SidebarMenuButton
                                                    isActive={isActive(item.url)}
                                                    tooltip={item.title}
                                                    onClick={handleConsecutiveBookingsClick}
                                                    className={isActive(item.url) ? "bg-primary text-white hover:bg-primary/90 hover:text-white data-[active=true]:bg-primary data-[active=true]:text-white" : ""}
                                                >
                                                    <Icon />
                                                    <span>{item.title}</span>
                                                    {item.badge && (
                                                        <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-sidebar-primary text-sidebar-primary-foreground text-xs">
                                                            {item.badge}
                                                        </span>
                                                    )}
                                                </SidebarMenuButton>
                                            ) : isRecurringBookings ? (
                                                <SidebarMenuButton
                                                    isActive={isActive(item.url)}
                                                    tooltip={item.title}
                                                    onClick={handleRecurringBookingsClick}
                                                    className={isActive(item.url) ? "bg-primary text-white hover:bg-primary/90 hover:text-white data-[active=true]:bg-primary data-[active=true]:text-white" : ""}
                                                >
                                                    <Icon />
                                                    <span>{item.title}</span>
                                                    {item.badge && (
                                                        <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-sidebar-primary text-sidebar-primary-foreground text-xs">
                                                            {item.badge}
                                                        </span>
                                                    )}
                                                </SidebarMenuButton>
                                            ) : (
                                                <SidebarMenuButton
                                                    asChild
                                                    isActive={isActive(item.url)}
                                                    tooltip={item.title}
                                                    className={isActive(item.url) ? "bg-primary text-white hover:bg-primary/90 hover:text-white data-[active=true]:bg-primary data-[active=true]:text-white" : ""}
                                                >
                                                    <Link to={item.url}>
                                                        <Icon />
                                                        <span>{item.title}</span>
                                                        {item.badge && (
                                                            <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-sidebar-primary text-sidebar-primary-foreground text-xs">
                                                                {item.badge}
                                                            </span>
                                                        )}
                                                    </Link>
                                                </SidebarMenuButton>
                                            )}
                                            {isCreateField && isCreateFieldSubmenuOpen && (
                                                <SidebarMenuSub>
                                                    {fieldCreateTabs.map((tab) => (
                                                        <SidebarMenuSubItem key={tab.id}>
                                                            <SidebarMenuSubButton
                                                                onClick={() => handleTabClick(tab.id)}
                                                                isActive={activeSubTab === tab.id}
                                                                className={activeSubTab === tab.id ? "bg-primary text-white hover:bg-primary/90 hover:text-white data-[active=true]:bg-primary data-[active=true]:text-white" : ""}
                                                            >
                                                                <span>{tab.label}</span>
                                                            </SidebarMenuSubButton>
                                                        </SidebarMenuSubItem>
                                                    ))}
                                                </SidebarMenuSub>
                                            )}
                                            {isFieldBooking && isFieldBookingSubmenuOpen && (
                                                <SidebarMenuSub>
                                                    {bookingHistoryTabs.map((tab) => (
                                                        <SidebarMenuSubItem key={tab.id}>
                                                            <SidebarMenuSubButton
                                                                onClick={() => handleFieldBookingTabClick(tab.id)}
                                                                isActive={activeFieldBookingTab === tab.id}
                                                                className={activeFieldBookingTab === tab.id ? "bg-primary text-white hover:bg-primary/90 hover:text-white data-[active=true]:bg-primary data-[active=true]:text-white" : ""}
                                                            >
                                                                <span>{tab.label}</span>
                                                            </SidebarMenuSubButton>
                                                        </SidebarMenuSubItem>
                                                    ))}
                                                </SidebarMenuSub>
                                            )}
                                            {isFieldCoachBooking && isFieldCoachBookingsSubmenuOpen && (
                                                <SidebarMenuSub>
                                                    {bookingHistoryTabs.map((tab) => (
                                                        <SidebarMenuSubItem key={tab.id}>
                                                            <SidebarMenuSubButton
                                                                onClick={() => handleFieldCoachBookingTabClick(tab.id)}
                                                                isActive={activeFieldCoachBookingTab === tab.id}
                                                                className={activeFieldCoachBookingTab === tab.id ? "bg-primary text-white hover:bg-primary/90 hover:text-white data-[active=true]:bg-primary data-[active=true]:text-white" : ""}
                                                            >
                                                                <span>{tab.label}</span>
                                                            </SidebarMenuSubButton>
                                                        </SidebarMenuSubItem>
                                                    ))}
                                                </SidebarMenuSub>
                                            )}
                                            {isFields && isFieldsSubmenuOpen && (
                                                <SidebarMenuSub>
                                                    {fieldsTabs.map((tab) => {
                                                        // Only show view and edit tabs if fieldId exists
                                                        if ((tab.id === 'view' || tab.id === 'edit') && !fieldId) {
                                                            return null
                                                        }
                                                        const TabIcon = tab.icon
                                                        return (
                                                            <SidebarMenuSubItem key={tab.id}>
                                                                <SidebarMenuSubButton
                                                                    onClick={() => handleFieldsTabClick(tab.id)}
                                                                    isActive={activeFieldsTab === tab.id}
                                                                    className={activeFieldsTab === tab.id ? "bg-primary text-white hover:bg-primary/90 hover:text-white data-[active=true]:bg-primary data-[active=true]:text-white" : ""}
                                                                >
                                                                    <TabIcon className="h-4 w-4" />
                                                                    <span>{tab.label}</span>
                                                                </SidebarMenuSubButton>
                                                            </SidebarMenuSubItem>
                                                        )
                                                    })}
                                                </SidebarMenuSub>
                                            )}
                                            {isSingleBookings && isSingleBookingsSubmenuOpen && (
                                                <SidebarMenuSub>
                                                    {singleBookingTabs.map((tab) => (
                                                        <SidebarMenuSubItem key={tab.id}>
                                                            <SidebarMenuSubButton
                                                                onClick={() => handleSingleBookingTabClick(tab.id)}
                                                                isActive={activeSingleBookingTab === tab.id}
                                                                className={activeSingleBookingTab === tab.id ? "bg-primary text-white hover:bg-primary/90 hover:text-white data-[active=true]:bg-primary data-[active=true]:text-white" : ""}
                                                            >
                                                                <span>{tab.label}</span>
                                                            </SidebarMenuSubButton>
                                                        </SidebarMenuSubItem>
                                                    ))}
                                                </SidebarMenuSub>
                                            )}

                                            {isConsecutiveBookings && isConsecutiveBookingsSubmenuOpen && (
                                                <SidebarMenuSub>
                                                    {singleBookingTabs.map((tab) => (
                                                        <SidebarMenuSubItem key={tab.id}>
                                                            <SidebarMenuSubButton
                                                                onClick={() => handleConsecutiveBookingTabClick(tab.id)}
                                                                isActive={activeConsecutiveBookingTab === tab.id}
                                                                className={activeConsecutiveBookingTab === tab.id ? "bg-primary text-white hover:bg-primary/90 hover:text-white data-[active=true]:bg-primary data-[active=true]:text-white" : ""}
                                                            >
                                                                <span>{tab.label}</span>
                                                            </SidebarMenuSubButton>
                                                        </SidebarMenuSubItem>
                                                    ))}
                                                </SidebarMenuSub>
                                            )}

                                            {isRecurringBookings && isRecurringBookingsSubmenuOpen && (
                                                <SidebarMenuSub>
                                                    {singleBookingTabs.map((tab) => (
                                                        <SidebarMenuSubItem key={tab.id}>
                                                            <SidebarMenuSubButton
                                                                onClick={() => handleRecurringBookingTabClick(tab.id)}
                                                                isActive={activeRecurringBookingTab === tab.id}
                                                                className={activeRecurringBookingTab === tab.id ? "bg-primary text-white hover:bg-primary/90 hover:text-white data-[active=true]:bg-primary data-[active=true]:text-white" : ""}
                                                            >
                                                                <span>{tab.label}</span>
                                                            </SidebarMenuSubButton>
                                                        </SidebarMenuSubItem>
                                                    ))}
                                                </SidebarMenuSub>
                                            )}
                                        </SidebarMenuItem>

                                    )
                                })}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                </SidebarContent>

                <SidebarFooter className="border-t border-sidebar-border">
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <SidebarMenuButton
                                        size="lg"
                                        className="data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground w-full"
                                    >
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={authUser?.avatarUrl} alt={authUser?.fullName || "User"} />
                                            <AvatarFallback className="bg-green-600 text-white">
                                                {userInitials}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                                            <span className="truncate font-semibold">{authUser?.fullName || "Field Owner"}</span>
                                            <span className="truncate text-xs text-muted-foreground">{authUser?.email || ""}</span>
                                        </div>
                                    </SidebarMenuButton>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    side="top"
                                    align="end"
                                    className="w-56 bg-white shadow-lg border border-gray-200 rounded-md"
                                >
                                    <DropdownMenuItem asChild>
                                        <Link to="/field-owner/profile" className="cursor-pointer">
                                            <User className="mr-2 h-4 w-4" />
                                            <span>Hồ sơ</span>
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={handleLogout}
                                        className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                                    >
                                        <LogOut className="mr-2 h-4 w-4" />
                                        <span>Đăng xuất</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarFooter>
            </Sidebar>
        </>
    )
}