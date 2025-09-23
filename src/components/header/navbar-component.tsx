import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Search, User, LogOut } from "lucide-react";
import { useAppSelector, useAppDispatch } from "../../store/hook";
import { logout } from "../../features/authentication/authSlice";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import type { RootState } from "../../store/store";
import CoachDropdownMenuItems from "./coach-dropdown-menu";
import UserDropdownMenuItems from "./user-dropdown-menu";

export const NavbarComponent = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const auth = useAppSelector((state: RootState) => state.auth);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 50);
        handleScroll();
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const handleLogout = () => {
        dispatch(logout());
        navigate("/");
    };

    // Gom style theo trạng thái scroll
    const linkClass = isScrolled
        ? "text-sm font-medium text-gray-900 hover:text-green-600"
        : "text-sm font-medium text-white hover:text-yellow-400";
    const iconClass = isScrolled
        ? "h-5 w-5 text-gray-900 hover:text-green-600"
        : "h-5 w-5 text-white hover:text-yellow-400";
    const btnTriggerClass = isScrolled
        ? "border-gray-300 text-gray-900 bg-white"
        : "border-white/30 text-white bg-transparent";

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
                    <Link to="/booking" className={linkClass}>
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
                                    className={`flex items-center gap-2 transition-all duration-200 ${btnTriggerClass}`}
                                >
                                    <Avatar className="h-7 w-7">
                                        <AvatarImage src={auth.user.avatarUrl} alt="User avatar" />
                                    </Avatar>
                                    <span className="text-gray-900">{auth.user?.fullName || "Tài khoản"}</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                align="end"
                                className="w-48 bg-white shadow-md border border-gray-200 rounded-md"
                            >
                                {auth.user?.role === "student" && (
                                    <CoachDropdownMenuItems userId={auth.user._id} />
                                )}
                                {auth.user?.role === "coach" && auth.user._id && (
                                    <UserDropdownMenuItems userId={auth.user._id} />
                                )}
                                <Button
                                    className="w-full justify-start hover:bg-green-50 hover:text-green-600"
                                    onClick={handleLogout}
                                >
                                    <LogOut className="mr-2 h-4 w-4" />
                                    <span>Đăng xuất</span>
                                </Button>
                            </DropdownMenuContent>
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
                                className="bg-yellow-500 text-black hover:bg-yellow-400 font-semibold"
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
