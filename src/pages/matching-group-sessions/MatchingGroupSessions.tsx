import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hook';
import { fetchGroupSessions, createGroupSession } from '@/features/matching/matchingThunk';
import { SkillLevel } from '@/features/matching/matchingSlice';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Loader2, Users, Calendar, Clock, MapPin, Plus, Search, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SportType } from '@/components/enums/ENUMS';
import { toast } from 'sonner';

const GroupSessionCard: React.FC<{ session: any; onClick: () => void }> = ({ session, onClick }) => {
    const isFull = session.currentPlayers?.length >= session.maxPlayers;

    return (
        <Card className="hover:shadow-lg transition-all cursor-pointer border-l-4 border-l-primary group" onClick={onClick}>
            <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                    <Badge variant="outline" className="capitalize">{session.sportType}</Badge>
                    <Badge variant={isFull ? "destructive" : "secondary"} className="flex gap-1 items-center">
                        <Users size={12} /> {session.currentPlayers?.length}/{session.maxPlayers}
                    </Badge>
                </div>
                <CardTitle className="text-xl mt-2 group-hover:text-primary transition-colors">{session.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-slate-600">
                <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-primary" />
                    <span>{new Date(session.scheduledDate).toLocaleDateString('vi-VN')}</span>
                </div>
                <div className="flex items-center gap-2">
                    <Clock size={16} className="text-primary" />
                    <span>{session.startTime} - {session.endTime}</span>
                </div>
                <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-primary" />
                    <span className="line-clamp-1">{session.location?.address}</span>
                </div>
            </CardContent>
            <CardFooter className="pt-2 border-t flex justify-between items-center text-sm">
                <div className="text-slate-500">Kỹ năng: <span className="font-semibold text-slate-800">{session.skillLevel}</span></div>
                <div className="font-bold text-primary">
                    {session.costPerPerson ? `${session.costPerPerson.toLocaleString()}đ` : 'Miễn phí'}
                </div>
            </CardFooter>
        </Card>
    );
};

const MatchingGroupSessions: React.FC = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { groupSessions, loading } = useAppSelector((state) => state.matching);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [filters, setFilters] = useState({
        sportType: 'all',
        skillLevel: 'any',
    });

    const [newSession, setNewSession] = useState({
        title: '',
        description: '',
        sportType: SportType.FOOTBALL as string,
        scheduledDate: '',
        startTime: '',
        endTime: '',
        maxPlayers: 10,
        requiredPlayers: 6,
        skillLevel: SkillLevel.INTERMEDIATE as SkillLevel,
        address: '',
    });

    useEffect(() => {
        dispatch(fetchGroupSessions({}));
    }, [dispatch]);

    const handleCreateSession = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                ...newSession,
                location: {
                    address: newSession.address,
                    coordinates: [105.8342, 21.0278] // Default for demo
                }
            };
            await dispatch(createGroupSession(payload)).unwrap();
            toast.success('Hội chơi đã được tạo thành công!');
            setIsCreateModalOpen(false);
            dispatch(fetchGroupSessions({}));
        } catch (error: any) {
            toast.error(error || 'Có lỗi xảy ra khi tạo hội chơi');
        }
    };

    return (
        <div className="space-y-6">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        {/* Title removed as it's handled by the parent page */}
                    </div>

                    <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                        <DialogTrigger asChild>
                            <Button className="h-14 px-8 text-lg font-bold shadow-lg hover:scale-105 transition-all">
                                <Plus size={20} className="mr-2" /> Tạo hội chơi
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[550px]">
                            <form onSubmit={handleCreateSession}>
                                <DialogHeader>
                                    <DialogTitle className="text-2xl">🎉 Tạo Hội Chơi Mới</DialogTitle>
                                    <DialogDescription>
                                        Mô tả chi tiết để mọi người dễ dàng tham gia cùng bạn nhé.
                                    </DialogDescription>
                                </DialogHeader>

                                <div className="grid gap-6 py-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="title">Tên hội chơi</Label>
                                        <Input
                                            id="title"
                                            placeholder="VD: Đá bóng tối thứ 3 hàng tuần"
                                            required
                                            value={newSession.title}
                                            onChange={(e) => setNewSession({ ...newSession, title: e.target.value })}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="sport">Môn thể thao</Label>
                                            <Select value={newSession.sportType} onValueChange={(v) => setNewSession({ ...newSession, sportType: v })}>
                                                <SelectTrigger id="sport"><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    {Object.entries(SportType).map(([key, value]) => (
                                                        <SelectItem key={key} value={value}>{value}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="skill">Yêu cầu trình độ</Label>
                                            <Select value={newSession.skillLevel} onValueChange={(v) => setNewSession({ ...newSession, skillLevel: v as SkillLevel })}>
                                                <SelectTrigger id="skill"><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value={SkillLevel.BEGINNER}>Mới chơi</SelectItem>
                                                    <SelectItem value={SkillLevel.INTERMEDIATE}>Trung bình</SelectItem>
                                                    <SelectItem value={SkillLevel.ADVANCED}>Khá/Giỏi</SelectItem>
                                                    <SelectItem value={SkillLevel.PROFESSIONAL}>Chuyên nghiệp</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="date">Ngày chơi</Label>
                                            <Input
                                                id="date"
                                                type="date"
                                                required
                                                value={newSession.scheduledDate}
                                                onChange={(e) => setNewSession({ ...newSession, scheduledDate: e.target.value })}
                                            />
                                        </div>
                                        <div className="flex gap-2">
                                            <div className="space-y-2 w-full">
                                                <Label htmlFor="start">Bắt đầu</Label>
                                                <Input
                                                    id="start"
                                                    type="time"
                                                    required
                                                    value={newSession.startTime}
                                                    onChange={(e) => setNewSession({ ...newSession, startTime: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-2 w-full">
                                                <Label htmlFor="end">Kết thúc</Label>
                                                <Input
                                                    id="end"
                                                    type="time"
                                                    required
                                                    value={newSession.endTime}
                                                    onChange={(e) => setNewSession({ ...newSession, endTime: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="address">Địa chỉ / Sân chơi</Label>
                                        <div className="relative">
                                            <MapPin className="absolute left-3 top-3 text-slate-400" size={16} />
                                            <Input
                                                id="address"
                                                className="pl-10"
                                                placeholder="VD: Sân bóng FPT, Quận 9"
                                                required
                                                value={newSession.address}
                                                onChange={(e) => setNewSession({ ...newSession, address: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="max">Số người tối đa</Label>
                                            <Input
                                                id="max"
                                                type="number"
                                                value={newSession.maxPlayers}
                                                onChange={(e) => setNewSession({ ...newSession, maxPlayers: parseInt(e.target.value) })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="req">Số người tối thiểu</Label>
                                            <Input
                                                id="req"
                                                type="number"
                                                value={newSession.requiredPlayers}
                                                onChange={(e) => setNewSession({ ...newSession, requiredPlayers: parseInt(e.target.value) })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <DialogFooter>
                                    <Button type="submit" className="w-full h-12 text-lg">Xác nhận tạo hội</Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-4 bg-white p-6 rounded-2xl shadow-sm border">
                    <div className="flex-1 min-w-[200px] relative">
                        <Search className="absolute left-3 top-3 text-slate-400" size={18} />
                        <Input className="pl-10 h-11" placeholder="Tìm kiếm hội chơi..." />
                    </div>

                    <Select value={filters.sportType} onValueChange={(v) => setFilters({ ...filters, sportType: v })}>
                        <SelectTrigger className="w-[180px] h-11"><SelectValue placeholder="Môn thể thao" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tất cả môn</SelectItem>
                            {Object.entries(SportType).map(([key, value]) => (
                                <SelectItem key={key} value={value}>{value}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Button variant="outline" className="h-11">
                        <Filter size={18} className="mr-2" /> Lọc thêm
                    </Button>
                </div>

                {/* List */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="w-12 h-12 animate-spin text-primary" />
                    </div>
                ) : groupSessions.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {groupSessions.map((session: any) => (
                            <GroupSessionCard
                                key={session._id}
                                session={session}
                                onClick={() => navigate(`/matching/group-sessions/${session._id}`)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
                        <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-2xl font-bold text-slate-800">Không tìm thấy hội nào</h3>
                        <p className="text-slate-500 mt-2">Hãy thử đổi bộ lọc hoặc là người đầu tiên tạo hội chơi mới!</p>
                        <Button variant="link" className="mt-4 text-primary font-bold" onClick={() => setIsCreateModalOpen(true)}>
                            Tạo hội chơi ngay
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MatchingGroupSessions;
