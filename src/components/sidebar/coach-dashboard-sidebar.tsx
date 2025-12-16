import { useState, useEffect } from "react"
import { useLocation, Link, useNavigate } from "react-router-dom"
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
    SidebarFooter
} from "@/components/ui/sidebar"
import {
    LayoutDashboard,
    Calendar,
    Wallet,
    User,
    MessageSquare,
    LogOut,
    CheckSquare
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

interface MenuItem {
    title: string
    url: string
    icon: React.ComponentType<{ className?: string }>
    badge?: string
}

const menuItems: MenuItem[] = [
    {
        title: "Dashboard",
        url: "/coach/dashboard",
        icon: LayoutDashboard,
    },
    {
        title: "Schedule",
        url: "/coach/schedule",
        icon: Calendar,
    },
    {
        title: "Bookings",
        url: "/coach/bookings",
        icon: CheckSquare,
    },
    {
        title: "Verify Payments",
        url: "/coach/verify-payments",
        icon: CheckSquare,
    },
    {
        title: "Wallet",
        url: "/coach-wallet",
        icon: Wallet,
    },
    {
        title: "Chat",
        url: "/coach-chat",
        icon: MessageSquare,
    },
    {
        title: "Profile",
        url: "/coach/profile",
        icon: User,
    },
]

export function CoachSidebar() {
    const location = useLocation()
    const navigate = useNavigate()
    const dispatch = useAppDispatch()
    const authUser = useAppSelector((state) => state.auth.user)

    const handleLogout = () => {
        clearUserAuth()
        dispatch(logout())
        navigate("/")
    }

    const isActive = (path: string) => {
        if (path === "/coach/dashboard") {
            return location.pathname === path
        }
        return location.pathname.startsWith(path)
    }

    const userInitials = authUser?.fullName
        ? authUser.fullName
            .split(" ")
            .map((w) => w[0])
            .join("")
            .toUpperCase()
        : "CO"

    return (
        <Sidebar collapsible="icon" variant="sidebar">
            <SidebarHeader className="border-b border-sidebar-border">
                <div className="flex items-center gap-2 px-2 py-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white font-bold">
                        <User className="h-5 w-5" />
                    </div>
                    <div className="flex flex-col group-data-[collapsible=icon]:hidden">
                        <span className="text-sm font-semibold">SportZone</span>
                        <span className="text-xs text-muted-foreground">Coach Dashboard</span>
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
                                return (
                                    <SidebarMenuItem key={item.url}>
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
                                        <AvatarFallback className="bg-blue-600 text-white">
                                            {userInitials}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                                        <span className="truncate font-semibold">{authUser?.fullName || "Coach"}</span>
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
                                    <Link to="/coach/profile" className="cursor-pointer">
                                        <User className="mr-2 h-4 w-4" />
                                        <span>Profile</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={handleLogout}
                                    className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                                >
                                    <LogOut className="mr-2 h-4 w-4" />
                                    <span>Log out</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    )
}
