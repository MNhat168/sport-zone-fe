import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';


import { Button } from '@/components/ui/button';
import { UserCircle, Flame, ChevronRight, ChevronLeft, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppSelector, useAppDispatch } from '@/store/hook';
import { fetchMatchingUnreadCount } from '@/features/chat/chatThunk';


export const MatchingSidebar: React.FC = () => {
    const [isCollapsed, setIsCollapsed] = React.useState(false);
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const location = useLocation();
    const { matchingUnreadCount } = useAppSelector((state) => state.chat);

    // Fetch unread count on mount
    useEffect(() => {
        dispatch(fetchMatchingUnreadCount());
    }, [dispatch]);

    const menuItems = [
        {
            label: '1on1 Matching',
            icon: Flame,
            path: '/matching/swipe',
            hasNotification: false,
        },

        {
            label: 'Matches',
            icon: MessageCircle,
            path: '/matching/matches',
            hasNotification: matchingUnreadCount > 0,
        },
        {
            label: 'Match Profile',
            icon: UserCircle,
            path: '/matching/profile',
            hasNotification: false,
        },
    ];

    const isActive = (path: string) => location.pathname === path;

    return (
        <div className={cn(
            "h-[calc(100vh-120px)] bg-white/80 backdrop-blur-xl border border-slate-200/50 flex flex-col p-4 shadow-2xl shadow-slate-200/50 transition-all duration-500 ease-in-out relative group/sidebar",
            isCollapsed ? "w-24 rounded-[40px] px-3" : "w-[320px] rounded-[48px]"
        )}>
            {/* Collapse Toggle */}
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="absolute -right-3 top-10 w-8 h-8 bg-white border border-slate-200 rounded-full flex items-center justify-center shadow-lg hover:bg-primary hover:text-white hover:border-primary transition-all duration-300 z-50 invisible group-hover/sidebar:visible"
            >
                {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>

            {/* Header */}
            <div className={cn("mb-8 px-2 shrink-0 transition-opacity duration-300", isCollapsed && "opacity-0 invisible h-0 mb-0")}>
                <h2 className="text-2xl font-black text-slate-800 tracking-tighter">Matching</h2>
                <p className="text-[10px] text-primary font-bold uppercase tracking-[0.2em]">Find Playmates</p>
            </div>

            {/* Navigation */}
            <nav className="space-y-3 mb-10 shrink-0">
                {menuItems.map((item) => {
                    const active = isActive(item.path);
                    const Icon = item.icon;
                    return (
                        <Button
                            key={item.path}
                            variant="ghost"
                            className={cn(
                                "w-full justify-start gap-3 h-14 rounded-2xl transition-all duration-300 relative",
                                isCollapsed ? "px-0 justify-center h-14 w-14 mx-auto" : "px-5",
                                active
                                    ? "bg-primary text-white shadow-xl shadow-primary/25 hover:bg-primary/90"
                                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                            )}
                            onClick={() => navigate(item.path)}
                        >
                            <Icon className={cn("shrink-0", isCollapsed ? "w-6 h-6" : "w-5 h-5")} />
                            {!isCollapsed && (
                                <span className="font-bold text-sm tracking-tight">{item.label}</span>
                            )}
                            {/* Notification indicator */}
                            {item.hasNotification && (
                                <span className={cn(
                                    "bg-red-500 rounded-full animate-pulse",
                                    isCollapsed ? "absolute -top-1 -right-1 w-3 h-3" : "ml-auto w-2 h-2"
                                )} />
                            )}
                        </Button>
                    );
                })}
            </nav>

            {/* Footer or extra space if needed */}
            <div className="flex-1" />
        </div>
    );
};
