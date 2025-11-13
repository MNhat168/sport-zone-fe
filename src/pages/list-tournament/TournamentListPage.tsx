import { useEffect, useState } from 'react';
import { NavbarComponent } from '@/components/header/navbar-component';
import { FooterComponent } from '@/components/footer/footer-component';
import { useAppDispatch, useAppSelector } from '@/store/hook';
import { fetchTournaments } from '@/features/tournament/tournamentThunk';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Calendar,
    MapPin,
    Users,
    DollarSign,
    Trophy,
    Search,
    Plus
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function TournamentListPage() {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { tournaments, loading } = useAppSelector((state) => state.tournament);
    const user = useAppSelector((state) => state.user.user);

    const [filters, setFilters] = useState({
        sportType: 'all',
        location: '',
        status: 'pending',
    });

    useEffect(() => {
        dispatch(fetchTournaments(filters));
    }, [dispatch, filters]);

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            draft: { color: 'bg-gray-500', text: 'Nháp' },
            pending: { color: 'bg-yellow-500', text: 'Đang Chờ' },
            confirmed: { color: 'bg-green-500', text: 'Đã Xác Nhận' },
            ongoing: { color: 'bg-blue-500', text: 'Đang Diễn Ra' },
            completed: { color: 'bg-purple-500', text: 'Hoàn Thành' },
            cancelled: { color: 'bg-red-500', text: 'Đã Hủy' },
        };

        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;

        return (
            <Badge className={`${config.color} text-white`}>
                {config.text}
            </Badge>
        );
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    };

    useEffect(() => {
        console.log('Current tournaments state:', tournaments);
        console.log('Current loading state:', loading);
    }, [tournaments, loading]);

    useEffect(() => {
        console.log('Fetching tournaments with filters:', filters);
        dispatch(fetchTournaments(filters));
    }, [dispatch, filters]);

    return (
        <>
            <NavbarComponent />
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-4xl font-bold text-gray-900 mb-2">
                                Giải Đấu
                            </h1>
                            <p className="text-gray-600">
                                Khám phá và tham gia các giải đấu thể thao
                            </p>
                        </div>

                        {user && (
                            <Button
                                onClick={() => navigate('/tournaments/create')}
                                className="bg-green-600 hover:bg-green-700"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Tạo Giải Đấu
                            </Button>
                        )}
                    </div>

                    {/* Filters */}
                    <Card className="mb-8">
                        <CardContent className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Địa điểm
                                    </label>
                                    <Input
                                        placeholder="Tìm theo địa điểm..."
                                        value={filters.location}
                                        onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Môn thể thao
                                    </label>
                                    <Select
                                        value={filters.sportType}
                                        onValueChange={(val) => setFilters({ ...filters, sportType: val })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Tất cả" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Tất cả</SelectItem>
                                            <SelectItem value="football">Bóng đá</SelectItem>
                                            <SelectItem value="tennis">Quần vợt</SelectItem>
                                            <SelectItem value="badminton">Cầu lông</SelectItem>
                                            <SelectItem value="basketball">Bóng rổ</SelectItem>
                                            <SelectItem value="volleyball">Bóng chuyền</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Trạng thái
                                    </label>
                                    <Select
                                        value={filters.status}
                                        onValueChange={(val) => setFilters({ ...filters, status: val })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Chọn trạng thái" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Tất cả</SelectItem>
                                            <SelectItem value="pending">Đang chờ</SelectItem>
                                            <SelectItem value="confirmed">Đã xác nhận</SelectItem>
                                            <SelectItem value="ongoing">Đang diễn ra</SelectItem>
                                            <SelectItem value="completed">Hoàn thành</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex items-end">
                                    <Button
                                        onClick={() => dispatch(fetchTournaments(filters))}
                                        className="w-full"
                                    >
                                        <Search className="h-4 w-4 mr-2" />
                                        Tìm Kiếm
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Tournament List */}
                    {loading ? (
                        <div className="text-center py-12">
                            <p className="text-gray-500">Đang tải...</p>
                        </div>
                    ) : tournaments.length === 0 ? (
                        <Card className="text-center py-12">
                            <Trophy className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500 text-lg mb-4">
                                Chưa có giải đấu nào
                            </p>
                            {user && (
                                <Button
                                    onClick={() => navigate('/tournaments/create')}
                                    className="bg-green-600 hover:bg-green-700"
                                >
                                    Tạo Giải Đấu Đầu Tiên
                                </Button>
                            )}
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {tournaments.map((tournament) => (
                                <Card
                                    key={tournament._id}
                                    className="hover:shadow-lg transition-shadow cursor-pointer"
                                    onClick={() => navigate(`/tournaments/${tournament._id}`)}
                                >
                                    <CardContent className="p-6">
                                        <div className="flex justify-between items-start mb-3">
                                            <h3 className="text-xl font-bold text-gray-900 flex-1 pr-2">
                                                {tournament.name}
                                            </h3>
                                            {getStatusBadge(tournament.status)}
                                        </div>

                                        <Badge variant="outline" className="mb-3">
                                            {tournament.sportType}
                                        </Badge>

                                        <div className="space-y-2 text-sm">
                                            <p className="flex items-center gap-2 text-gray-600">
                                                <MapPin className="h-4 w-4" />
                                                {tournament.location}
                                            </p>

                                            <p className="flex items-center gap-2 text-gray-600">
                                                <Calendar className="h-4 w-4" />
                                                {formatDate(tournament.startDate)} - {formatDate(tournament.endDate)}
                                            </p>

                                            <p className="flex items-center gap-2 text-gray-600">
                                                <Users className="h-4 w-4" />
                                                {tournament.participants?.length || 0} / {tournament.maxParticipants} người
                                            </p>

                                            <p className="flex items-center gap-2 text-green-600 font-semibold">
                                                <DollarSign className="h-4 w-4" />
                                                {tournament.registrationFee.toLocaleString()} VNĐ
                                            </p>
                                        </div>

                                        {tournament.status === 'pending' && (
                                            <div className="mt-4 pt-4 border-t">
                                                <div className="flex justify-between text-sm text-gray-600 mb-2">
                                                    <span>Tiến độ:</span>
                                                    <span className="font-semibold">
                                                        {Math.round(((tournament.participants?.length || 0) / tournament.minParticipants) * 100)}%
                                                    </span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className="bg-green-600 h-2 rounded-full transition-all"
                                                        style={{
                                                            width: `${Math.min(((tournament.participants?.length || 0) / tournament.minParticipants) * 100, 100)}%`
                                                        }}
                                                    />
                                                </div>
                                                <p className="text-xs text-gray-500 mt-2">
                                                    Cần thêm {Math.max(0, tournament.minParticipants - (tournament.participants?.length || 0))} người
                                                </p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            <FooterComponent />
        </>
    );
}