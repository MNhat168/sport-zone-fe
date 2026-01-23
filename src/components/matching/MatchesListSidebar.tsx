import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hook';
import { fetchMyMatches, unmatchById } from '@/features/matching/matchingThunk';
import { fetchUnreadPerMatch } from '@/features/chat/chatThunk';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Loader2, MessageCircle, MoreHorizontal, UserX, Trophy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const MatchesListSidebar: React.FC = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { matches, loading } = useAppSelector((state) => state.matching);
    const { user } = useAppSelector((state) => state.auth);
    const { unreadPerMatch } = useAppSelector((state) => state.chat);
    const [unmatchTarget, setUnmatchTarget] = React.useState<{ id: string, name: string } | null>(null);

    useEffect(() => {
        dispatch(fetchMyMatches(undefined));
        dispatch(fetchUnreadPerMatch());
    }, [dispatch]);

    const getCurrentUserId = () => {
        return user?._id || (user as any)?.id;
    };

    const currentUserId = getCurrentUserId();

    const handleConfirmUnmatch = async () => {
        if (!unmatchTarget) return;
        try {
            await dispatch(unmatchById(unmatchTarget.id)).unwrap();
            toast.success('Đã hủy bắt cặp');
            dispatch(fetchMyMatches(undefined));
        } catch (error: any) {
            toast.error(error || 'Có lỗi xảy ra');
        }
        setUnmatchTarget(null);
    };

    return (
        <div className="flex flex-col h-full relative">
            <ScrollArea className="flex-1">
                {loading && matches.length === 0 ? (
                    <div className="flex justify-center py-10">
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    </div>
                ) : matches.length > 0 ? (
                    <div className="space-y-2 px-2 pb-2">
                        {matches.map((match: any) => {
                            const isUser1 = match.user1Id?._id === currentUserId;
                            const otherUser = isUser1 ? match.user2Id : match.user1Id;
                            const unreadCount = unreadPerMatch[match._id] || 0;

                            if (!otherUser) return null;

                            return (
                                <div
                                    key={match._id}
                                    className="group flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-all cursor-pointer border border-transparent hover:border-slate-100 relative"
                                    onClick={() => navigate(`/matching/matches/${match._id}`)}
                                >
                                    <Avatar className="h-10 w-10 border border-slate-200 shrink-0">
                                        <AvatarImage src={otherUser.avatar} alt={otherUser.fullName} />
                                        <AvatarFallback>{otherUser.fullName?.charAt(0)}</AvatarFallback>
                                    </Avatar>

                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-sm text-slate-700 truncate">{otherUser.fullName}</h4>
                                        <div className="flex items-center gap-1 text-[10px] text-slate-500">
                                            <Trophy size={10} className="text-yellow-600" />
                                            <span className="truncate">{match.sportType}</span>
                                        </div>
                                    </div>

                                    {/* Unread badge */}
                                    {unreadCount > 0 && (
                                        <div className="bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1.5 shadow-md">
                                            {unreadCount > 99 ? '99+' : unreadCount}
                                        </div>
                                    )}

                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-7 w-7 rounded-full hover:bg-white hover:shadow-sm"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <MoreHorizontal size={14} className="text-slate-400" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-40">
                                                <DropdownMenuItem
                                                    className="text-red-600 focus:text-red-600 flex gap-2 cursor-pointer"
                                                    onSelect={(e) => {
                                                        e.preventDefault();
                                                        setUnmatchTarget({ id: match._id, name: otherUser.fullName });
                                                    }}
                                                >
                                                    <UserX size={14} /> Hủy kết nối
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-10 px-4">
                        <div className="bg-slate-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                            <MessageCircle className="text-slate-300 w-6 h-6" />
                        </div>
                        <p className="text-xs text-slate-500">Chưa có lượt bắt cặp nào</p>
                    </div>
                )}
            </ScrollArea>

            <AlertDialog open={!!unmatchTarget} onOpenChange={(open) => !open && setUnmatchTarget(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Hủy kết nối?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc muốn hủy bắt cặp với <span className="font-bold text-slate-900">{unmatchTarget?.name}</span>?
                            Hành động này không thể hoàn tác và đoạn chat sẽ bị xóa.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirmUnmatch} className="bg-red-600 hover:bg-red-700">
                            Xác nhận hủy
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default MatchesListSidebar;
