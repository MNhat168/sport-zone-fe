import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Search, User, LogOut } from "lucide-react";
import { useAppSelector, useAppDispatch } from "../../store/hook";
import { logout } from "../../features/authentication/authThunk";
import { clearUserAuth } from "../../lib/cookies";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { RootState } from "../../store/store";
import CoachDropdownMenuItems from "./coach-dropdown-menu";
import UserDropdownMenuItems from "./user-dropdown-menu";
import FieldOwnerDropdownMenuItems from "./field-owner-dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
export const NavbarComponent = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const auth = useAppSelector((state: RootState) => state.auth);
    
    // Debug log to verify user data
    console.log("🔍 Navbar - User:", auth.user?.fullName, "Role:", auth.user?.role);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 50);
        handleScroll();
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const handleLogout = () => {
        clearUserAuth();
        dispatch(logout());
        navigate("/");
    };
    const [openLogoutDialog, setOpenLogoutDialog] = useState(false)

    // Gom style theo trạng thái scroll
    const linkClass = isScrolled
        ? "text-sm font-medium text-gray-900 hover:text-green-600"
        : "text-sm font-medium text-white";
    const iconClass = isScrolled
        ? "h-5 w-5 text-gray-900 hover:text-green-600"
        : "h-5 w-5 text-white";
    const btnTriggerClass = isScrolled
        ? "text-gray-900 bg-white"
        : "text-white bg-transparent";

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
                ? "bg-white/95 shadow-md border-b border-gray-200"
                : "bg-transparent"
                }`}
        >
            <div className="container mx-auto max-w-screen-2xl flex h-16 items-center justify-between px-4">
                {/* Logo */}
                <Link
                    to="/"
                    className="text-2xl font-bold text-white bg-green-700 px-3 py-1 rounded-md"
                >
                    SportZone
                </Link>

                {/* Nav links */}
                <nav className="flex items-center gap-6">
                    <Link to="/" className={linkClass}>
                        Trang chủ
                    </Link>
                    <Link to="/fields" className={linkClass}>
                        Sân thể thao
                    </Link>
                    <Link to="/coach/booking" className={linkClass}>
                        Huấn luyện viên
                    </Link>
                    <Link to="/reviews" className={linkClass}>
                        Đánh giá
                    </Link>
                    <Link to="/about" className={linkClass}>
                        Về chúng tôi
                    </Link>
                    <Link to="/contact" className={linkClass}>
                        Liên hệ
                    </Link>
                    {auth.user?.role === "field_owner" && (
                        <Link to="/field-owner-dashboard" className={linkClass}>
                            Quản lý đặt sân
                        </Link>
                    )}
                </nav>

                {/* Actions */}
                <div className="flex items-center gap-4">
                    {/* Search */}
                    <Button variant="ghost" size="icon" className="hover:bg-transparent">
                        <Search className={iconClass} />
                        <span className="sr-only">Tìm kiếm</span>
                    </Button>

                    {auth.user ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={`flex items-center gap-2 transition-all duration-200 hover:bg-green-800 focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:outline-none active:scale-95 ${btnTriggerClass}`}
                                >
                                    <Avatar className="h-7 w-7">
                                        <AvatarImage
                                            src={auth.user?.avatarUrl}
                                            alt="User avatar"
                                        />
                                        <AvatarFallback>CN</AvatarFallback>
                                    </Avatar>
                                    <span className={linkClass}>{auth.user?.fullName || "Tài khoản"}</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                align="end"
                                className="w-48 bg-white shadow-md border border-gray-200 rounded-md"
                            >
                                {auth.user?.role === "user" && (
                                    <UserDropdownMenuItems />
                                )}
                                {auth.user?.role === "coach" && auth.user._id && (
                                    <CoachDropdownMenuItems userId={auth.user._id} />
                                )}
                                {auth.user?.role === "field_owner" && auth.user._id && (
                                    <FieldOwnerDropdownMenuItems 
                                        userId={auth.user._id}
                                        businessName={(auth.user as any).businessName}
                                    />
                                )}
                                <Button
                                    variant="ghost"
                                    className="w-full justify-start bg-white text-green-600 hover:bg-white-50 hover:text-green-700"
                                    onClick={handleLogout}
                                >
                                    <LogOut className="mr-2 h-4 w-4" />
                                    <span>Đăng xuất</span>
                                </Button>
                            </DropdownMenuContent>

                            <Dialog open={openLogoutDialog} onOpenChange={setOpenLogoutDialog}>
                                <DialogContent className="bg-white max-w-sm">
                                    <DialogHeader>
                                        <DialogTitle>Xác nhận đăng xuất</DialogTitle>
                                    </DialogHeader>
                                    <div className="py-4 text-base">Bạn có chắc chắn muốn đăng xuất không?</div>
                                    <DialogFooter>
                                        <Button variant="destructive" onClick={handleLogout}>
                                            Xác nhận
                                        </Button>
                                        <Button variant="outline" onClick={() => setOpenLogoutDialog(false)}>
                                            Hủy
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </DropdownMenu>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                className={`transition-all duration-200 ${btnTriggerClass}`}
                                onClick={() => navigate("/auth")}
                            >
                                <User className="mr-2 h-4 w-4" /> Đăng nhập
                            </Button>
                            <Button
                                className="bg-yellow-500 text-black font-semibold"
                                onClick={() => navigate("/auth")}
                            >
                                Đăng ký ngay
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};
