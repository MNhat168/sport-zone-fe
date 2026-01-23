import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hook';
import { fetchMatchById } from '@/features/matching/matchingThunk';
import { setCurrentMatch } from '@/features/matching/matchingSlice';
import { getChatRoom } from '@/features/chat/chatThunk';
import { Button } from '@/components/ui/button';
import ActiveChatView from '@/components/chat/active-chat-view';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
    ChevronLeft,
    MoreVertical,
    MessageCircle,
    Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import MatchBookingModal from './components/MatchBookingModal';

const MatchingMatchDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    const [isBookingModalOpen, setIsBookingModalOpen] = React.useState(false);

    const { currentMatch, loading } = useAppSelector((state) => state.matching);
    const { user } = useAppSelector((state) => state.auth);

    const currentUserId = user?._id || (user as any)?.id;

    // Determine other user
    const otherUser = currentMatch?.user1Id?._id === currentUserId
        ? currentMatch?.user2Id
        : currentMatch?.user1Id;

    useEffect(() => {
        if (id) {
            dispatch(fetchMatchById(id));
        }

        return () => {
            if (id) {
                dispatch(setCurrentMatch(null));
            }
        };
    }, [id, dispatch]);

    // Fetch and Set Chat Room when currentMatch is loaded
    useEffect(() => {
        if (currentMatch) {
            const chatRoomId = typeof currentMatch.chatRoomId === 'string'
                ? currentMatch.chatRoomId
                : (currentMatch.chatRoomId as any)?._id;

            if (chatRoomId) {
                dispatch(getChatRoom(chatRoomId));
            }
        }
    }, [currentMatch, dispatch]);

    if (loading && !currentMatch) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-50">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        );
    }

    if (!currentMatch && !loading) {
        return (
            <div className="flex h-screen flex-col items-center justify-center bg-slate-50 p-4 text-center">
                <MessageCircle className="mb-4 h-16 w-16 text-slate-300" />
                <h2 className="text-xl font-bold">Không tìm thấy thông tin bắt cặp</h2>
                <Button onClick={() => navigate('/matching/find-partner')} className="mt-4">
                    Quay lại Tìm Bạn Chơi
                </Button>
            </div>
        );
    }

    return (
        <div className="flex flex-col bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden h-[calc(100vh-160px)] min-h-[500px]">
            {/* Header */}
            <div className="flex h-16 items-center justify-between border-b px-6 bg-white/80 backdrop-blur-md z-10">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate(-1)}
                        className="rounded-full hover:bg-slate-100"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </Button>
                    <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 ring-2 ring-primary/10">
                            <AvatarImage src={otherUser?.avatarUrl} alt={otherUser?.fullName} />
                            <AvatarFallback className="bg-primary/5 text-primary font-bold">
                                {otherUser?.fullName?.charAt(0)}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <h3 className="text-sm font-black text-slate-800 leading-none">{otherUser?.fullName}</h3>
                            <div className="mt-1 flex items-center gap-2">
                                <Badge className="px-1.5 py-0 text-[10px] bg-primary/10 text-primary border-none uppercase font-bold">
                                    {currentMatch?.sportType}
                                </Badge>
                                <span className="text-[10px] text-slate-400 font-medium">Bắt cặp • {currentMatch?.matchedAt ? format(new Date(currentMatch.matchedAt), 'dd/MM') : ''}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="hidden sm:flex text-slate-500 font-bold hover:text-primary transition-colors"
                        onClick={() => setIsBookingModalOpen(true)}
                    >
                        Hẹn giờ chơi
                    </Button>
                    <Button variant="ghost" size="icon" className="rounded-full">
                        <MoreVertical className="w-5 h-5 text-slate-400" />
                    </Button>
                </div>
            </div>

            {/* Main Chat Content */}
            <div className="flex-1 relative bg-slate-50/30 min-h-0 overflow-hidden">
                <ActiveChatView onClose={() => navigate('/matching/swipe')} />
            </div>

            {/* Match Booking Modal */}
            {id && (
                <MatchBookingModal
                    isOpen={isBookingModalOpen}
                    onClose={() => setIsBookingModalOpen(false)}
                    matchId={id}
                    sportType={currentMatch?.sportType}
                />
            )}
        </div>
    );
};

export default MatchingMatchDetail;
