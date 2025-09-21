// import { useState, useEffect } from "react"; // No longer needed
import { Link } from "react-router-dom";
import { Button } from "../ui/button";
import { LogOut, Search } from "lucide-react";
import { AnimatedButton } from "../animation/motion.config";
import { useAppSelector } from "@store/hook";
import { ChatBubbleOvalLeftEllipsisIcon } from "@heroicons/react/24/outline";
import type { RootState } from "../../store/store";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar";
import { NotificationBell } from "./notification-bell";
import CoachDropdownMenuItems from "./coach-dropdown-menu";
import UserDropdownMenuItems from "./user-dropdown-menu";

export const NavbarDarkComponent = () => {
    const auth = useAppSelector((state: RootState) => state.auth);

    return (
        <>
            <header 
                className="w-full bg-white text-black border-b border-gray-300 shadow-sm"
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    zIndex: 9999,
                    willChange: 'transform, opacity'
                }}
            >
                <div className="container max-w-screen-2xl mx-auto px-4 flex h-16 items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Link to="/" className="flex items-center gap-2">
                            <span className="text-2xl tracking-widest bg-primary-800 letter-sp text-green px-2 py-1 rounded-md">
                                <h1 className="title-lingora">SportZone</h1>
                            </span>
                        </Link>
                    </div>
                    <nav className="hidden md:flex items-center gap-6">
                        <Link
                            to="/"
                            className="text-sm font-medium text-black hover:text-green-500 transition-colors duration-200"
                        >
                            Trang chủ
                        </Link>
                        <Link
                            to="/courses"
                            className="text-sm font-medium text-black hover:text-green-500 transition-colors duration-200"
                        >
                            Các sân
                        </Link>
                        <Link
                            to="/coaches"
                            className="text-sm font-medium text-black hover:text-green-500 transition-colors duration-200"
                        >
                            Huấn luyện viên
                        </Link>
                        <Link
                            to="/reviews"
                            className="text-sm font-medium text-black hover:text-green-500 transition-colors duration-200"
                        >
                            Đánh giá
                        </Link>
                        <Link
                            to="/about"
                            className="text-sm font-medium text-black hover:text-green-500 transition-colors duration-200"
                        >
                            Về chúng tôi
                        </Link>
                        <Link
                            to="/recruitment"
                            className="text-sm font-medium text-black hover:text-green-500 transition-colors duration-200"
                        >
                            Tuyển dụng
                        </Link>
                        {auth.user?.role === "coach" && (
                            <>
                                <Link
                                    to="/chat"
                                    className="text-sm font-medium text-black hover:text-green-500 transition-colors duration-200"
                                >
                                    Trò chuyện
                                </Link>
                                <Link
                                    to="/coach"
                                    className="text-sm font-medium text-black hover:text-green-500 transition-colors duration-200"
                                >
                                    Dashboard
                                </Link>
                                <Link
                                    to="/coach/calendar"
                                    className="text-sm font-medium text-black hover:text-green-500 transition-colors duration-200"
                                >
                                    Lịch huấn luyện
                                </Link>
                            </>
                        )}
                    </nav>
                    <div className="flex items-center gap-4">
                        {auth.user ? (
                            <Link
                                to="/chat"
                                className="text-sm font-medium hover:text-green-500 transition-colors duration-200"
                            >
                                <ChatBubbleOvalLeftEllipsisIcon className="h-5 w-5 text-black hover:text-green-500 transition-colors duration-200" />
                            </Link>
                        ) : (
                            ""
                        )}
                        <Button variant="ghost" size="icon" className="text-black hover:text-green-500 hover:bg-transparent transition-colors duration-200">
                            <Search className="h-5 w-5" />
                            <span className="sr-only">Tìm kiếm</span>
                        </Button>

                        {auth.user ? (
                            <div className="flex items-center gap-2 hover:cursor-pointer">
                                <NotificationBell userId={auth.user._id} />
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className="md:flex bg-white text-primary-800 hover:bg-primary-800 hover:cursor-pointer hover:text-white shadow-md border-gray-300"
                                        >
                                            <Avatar className="mr-2 h-7 w-7">
                                                <AvatarImage
                                                    src={
                                                        auth.user?.avatarUrl ||
                                                        "https://ui-avatars.com/api/?name=CN&background=random&size=128"
                                                    }
                                                    alt="@shadcn"
                                                />
                                                <AvatarFallback>CN</AvatarFallback>
                                            </Avatar>
                                            {auth.user.fullName || "Tài khoản"}
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
                                    </DropdownMenuContent>
                                    <DropdownMenuContent align="end" className="w-48 bg-white shadow-md border border-gray-200 rounded-md">
                                        {auth.user?.role === "coach" && (
                                            <Button
                                                className="w-full justify-start hover:bg-green-50 hover:text-green-600"
                                            >
                                                <LogOut className="mr-2 h-4 w-4" />
                                                <span>Sân của bạn</span>
                                            </Button>
                                        )}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        ) : (
                            <>
                                <Link to="/login">
                                    <AnimatedButton>
                                        <Button
                                            variant="outline"
                                            className="hidden md:flex bg-white text-black border-gray-300 hover:bg-green-500 hover:text-white hover:border-green-500 transition-colors duration-200"
                                        >
                                            Đăng nhập
                                        </Button>
                                    </AnimatedButton>
                                </Link>
                                <Link to="/login">
                                    <AnimatedButton>
                                        <Button className="bg-primary-800 text-white hover:bg-green-500 hover:border-green-500 transition-colors duration-200">
                                            Đăng ký học thử
                                        </Button>
                                    </AnimatedButton>
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </header>
        </>
    );
};