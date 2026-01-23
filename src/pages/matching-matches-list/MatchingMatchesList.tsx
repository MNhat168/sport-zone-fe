import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hook';
import { fetchMyMatches } from '@/features/matching/matchingThunk';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Loader2, MessageCircle, Calendar, MoreHorizontal, UserX, Trophy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { unmatchById } from '@/features/matching/matchingThunk';
import { updateMatch } from '@/features/matching/matchingSlice';
import { useMatchingSocket } from '@/hooks/useMatchingSocket';
import ScheduleModal from '@/components/matching/ScheduleModal';

const MatchCard: React.FC<{ match: any; currentUserId: string; onOpenSchedule: (match: any) => void }> = ({
    match,
    currentUserId,
    onOpenSchedule
}) => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    // Determine which user is the "other" person
    const isUser1 = match.user1Id?._id === currentUserId;
    const otherUser = isUser1 ? match.user2Id : match.user1Id;

    if (!otherUser) return null;

    const handleUnmatch = async () => {
        if (window.confirm(`Bạn có chắc muốn hủy bắt cặp với ${otherUser.fullName}?`)) {
            try {
                await dispatch(unmatchById(match._id)).unwrap();
                toast.success('Đã hủy bắt cặp');
            } catch (error: any) {
                toast.error(error || 'Có lỗi xảy ra');
            }
        }
    };

    const hasBooking = !!match.bookingId;

    return (
        <Card className="hover:shadow-md transition-all overflow-hidden border border-slate-100">
            <CardContent className="p-0">
                <div className="flex flex-col sm:flex-row">
                    {/* User Avatar & Info */}
                    <div className="p-6 flex items-center gap-4 flex-1">
                        <Avatar className="h-16 w-16 border-2 border-primary/20">
                            <AvatarImage src={otherUser.avatar} alt={otherUser.fullName} />
                            <AvatarFallback>{otherUser.fullName?.charAt(0)}</AvatarFallback>
                        </Avatar>

                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <h3 className="font-bold text-lg">{otherUser.fullName}</h3>
                                <Badge variant="secondary" className="text-[10px] uppercase">{match.sportType}</Badge>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-500">
                                <Trophy size={14} className="text-yellow-600" />
                                <span>Trình độ: Tương đồng</span>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="p-4 bg-slate-50 sm:bg-transparent flex sm:flex-col items-center justify-center gap-2 border-t sm:border-t-0 sm:border-l">
                        <Button
                            className="w-full sm:w-auto h-11 px-6 rounded-full flex gap-2 font-bold"
                            onClick={() => navigate(`/matching/matches/${match._id}`)}
                        >
                            <MessageCircle size={18} /> Chat ngay
                        </Button>

                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="icon"
                                className={`rounded-full h-11 w-11 relative ${hasBooking ? 'border-primary/50 text-primary hover:bg-primary/5' : ''}`}
                                onClick={() => hasBooking && onOpenSchedule(match)}
                            >
                                <Calendar size={18} />
                                {hasBooking && (
                                    <span className="absolute top-0 right-0 flex h-3 w-3">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 border-2 border-white"></span>
                                    </span>
                                )}
                            </Button>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="rounded-full h-11 w-11">
                                        <MoreHorizontal size={18} />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem className="text-red-600 focus:text-red-600 flex gap-2" onClick={handleUnmatch}>
                                        <UserX size={16} /> Hủy kết nối
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

const MatchingMatchesList: React.FC = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { matches, loading } = useAppSelector((state) => state.matching);
    const { user } = useAppSelector((state) => state.auth);

    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [selectedMatch, setSelectedMatch] = React.useState<any>(null);

    const { onMatchConfirmed } = useMatchingSocket();

    useEffect(() => {
        dispatch(fetchMyMatches(undefined));
    }, [dispatch]);

    useEffect(() => {
        onMatchConfirmed((data) => {
            // Find the match in current list
            const matchToUpdate = matches.find(m => m._id === data.matchId);
            if (matchToUpdate) {
                // Update match status and booking info in Redux
                const updatedMatch = {
                    ...matchToUpdate,
                    status: data.status,
                    bookingId: data.bookingId,
                    scheduledDate: data.scheduledDate,
                    scheduledStartTime: data.startTime,
                    scheduledEndTime: data.endTime
                };
                dispatch(updateMatch(updatedMatch));
                toast.success('Lịch chơi đã được xác nhận!');
            }
        });
    }, [onMatchConfirmed, matches, dispatch]);

    const handleOpenSchedule = (match: any) => {
        setSelectedMatch(match);
        setIsModalOpen(true);
    };

    return (
        <div className="bg-transparent py-6 px-4">
            <div className="space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900">Bạn Bè & Đối Tác</h1>
                        <p className="text-slate-500">Danh sách những người bạn đã bắt cặp thành công.</p>
                    </div>
                    <Button onClick={() => navigate('/matching/find-partner')} variant="outline">
                        Tiếp tục tìm kiếm
                    </Button>
                </div>

                {loading && matches.length === 0 ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="w-10 h-10 animate-spin text-primary" />
                    </div>
                ) : matches.length > 0 ? (
                    <div className="grid gap-4">
                        {matches.map((match: any) => (
                            <MatchCard
                                key={match._id}
                                match={match}
                                currentUserId={user?._id || (user as any)?.id}
                                onOpenSchedule={handleOpenSchedule}
                            />
                        ))}
                    </div>
                ) : (
                    <Card className="text-center py-20 border-dashed">
                        <CardContent className="space-y-4">
                            <div className="bg-slate-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
                                <Users className="text-slate-300 w-10 h-10" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-xl font-bold">Chưa có lượt bắt cặp nào</h3>
                                <p className="text-slate-500 max-w-xs mx-auto">
                                    Hãy bắt đầu "quẹt" để tìm kiếm những đối tác chơi thể thao cùng trình độ với bạn.
                                </p>
                            </div>
                            <Button onClick={() => navigate('/matching/find-partner')} className="px-8 py-6 text-lg font-bold">
                                Bắt đầu ngay
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>

            <ScheduleModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                match={selectedMatch}
            />
        </div>
    );
};

const Users = ({ className, ...props }: any) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        {...props}
    >
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
);

export default MatchingMatchesList;
