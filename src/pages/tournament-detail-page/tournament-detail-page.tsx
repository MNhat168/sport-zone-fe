import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { NavbarComponent } from '@/components/header/navbar-component';
import { FooterComponent } from '@/components/footer/footer-component';
import { useAppDispatch, useAppSelector } from '@/store/hook';
import { fetchTournamentById, registerForTournament } from '@/features/tournament/tournamentThunk';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Calendar,
  MapPin,
  Users,
  DollarSign,
  Trophy,
  Clock,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function TournamentDetailPage() {
  const { id } = useParams();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { currentTournament, loading } = useAppSelector((state) => state.tournament);
  const user = useAppSelector((state) => state.user.user);
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(fetchTournamentById(id));
    }
  }, [dispatch, id]);

  if (loading || !currentTournament) {
    return (
      <>
        <NavbarComponent />
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-gray-500">Đang tải...</p>
        </div>
        <FooterComponent />
      </>
    );
  }

  const isOrganizer = user?._id === currentTournament.organizer?._id;
  const isParticipant = currentTournament.participants?.some(
    (p) => p.user._id === user?._id
  );
  const canRegister = 
    user && 
    !isOrganizer && 
    !isParticipant && 
    currentTournament.status === 'pending' &&
    currentTournament.participants.length < currentTournament.maxParticipants;

  const handleRegister = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    setRegistering(true);
    try {
      await dispatch(registerForTournament({
        tournamentId: currentTournament._id,
        paymentMethod: 'wallet',
      })).unwrap();
      
      alert('Đăng ký thành công!');
    } catch (error: any) {
      alert(error.message || 'Đăng ký thất bại');
    } finally {
      setRegistering(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

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
      <Badge className={`${config.color} text-white text-lg px-4 py-1`}>
        {config.text}
      </Badge>
    );
  };

  return (
    <>
      <NavbarComponent />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Button variant="ghost" onClick={() => navigate('/tournaments')}>
                ← Quay lại
              </Button>
            </div>
            
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  {currentTournament.name}
                </h1>
                <div className="flex items-center gap-4">
                  {getStatusBadge(currentTournament.status)}
                  <Badge variant="outline" className="text-lg">
                    {currentTournament.sportType}
                  </Badge>
                </div>
              </div>

              {canRegister && (
                <Button 
                  onClick={handleRegister}
                  disabled={registering}
                  className="bg-green-600 hover:bg-green-700 text-lg px-8 py-6"
                >
                  {registering ? 'Đang xử lý...' : 'Đăng Ký Ngay'}
                </Button>
              )}

              {isParticipant && (
                <Badge className="bg-green-600 text-white text-lg px-4 py-2">
                  <CheckCircle2 className="h-5 w-5 mr-2" />
                  Đã Đăng Ký
                </Badge>
              )}
            </div>
          </div>

          {/* Alerts */}
          {currentTournament.status === 'pending' && (
            <Alert className="mb-6 border-yellow-500 bg-yellow-50">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                Giải đấu cần thêm{' '}
                <strong>
                  {Math.max(0, currentTournament.minParticipants - currentTournament.participants.length)} người
                </strong>{' '}
                để xác nhận. Hạn chót:{' '}
                <strong>{formatDate(currentTournament.confirmationDeadline)}</strong>
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Info Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Thông Tin Chi Tiết</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Địa điểm</p>
                        <p className="font-semibold">{currentTournament.location}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Thời gian</p>
                        <p className="font-semibold">
                          {formatDate(currentTournament.startDate)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Giờ thi đấu</p>
                        <p className="font-semibold">
                          {currentTournament.startTime} - {currentTournament.endTime}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <DollarSign className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Phí đăng ký</p>
                        <p className="font-semibold text-green-600">
                          {currentTournament.registrationFee.toLocaleString()} VNĐ
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <h4 className="font-semibold mb-2">Mô tả</h4>
                    <p className="text-gray-700 whitespace-pre-line">
                      {currentTournament.description}
                    </p>
                  </div>

                  {currentTournament.rules && (
                    <div className="pt-4 border-t">
                      <h4 className="font-semibold mb-2">Thể lệ</h4>
                      <p className="text-gray-700 whitespace-pre-line">
                        {currentTournament.rules}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Fields Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Sân Thi Đấu</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {currentTournament.fields?.map((fieldItem: any, index: number) => (
                      <Card key={index} className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold">{fieldItem.field?.name || 'N/A'}</h4>
                            <p className="text-sm text-gray-600">
                              {fieldItem.field?.location?.address || 'N/A'}
                            </p>
                          </div>
                          <Badge variant="outline">Sân {index + 1}</Badge>
                        </div>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Participants */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Người Tham Gia ({currentTournament.participants.length}/{currentTournament.maxParticipants})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Tiến độ đăng ký:</span>
                      <span className="font-semibold">
                        {Math.round((currentTournament.participants.length / currentTournament.minParticipants) * 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-green-600 h-3 rounded-full transition-all"
                        style={{ 
                          width: `${Math.min((currentTournament.participants.length / currentTournament.minParticipants) * 100, 100)}%` 
                        }}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    {currentTournament.participants.map((participant: any, index: number) => (
                      <div key={index} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded">
                        <Avatar>
                          <AvatarImage src={participant.user?.avatarUrl} />
                          <AvatarFallback>
                            {participant.user?.fullName?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-semibold">{participant.user?.fullName || 'Anonymous'}</p>
                          <p className="text-xs text-gray-500">
                            Đăng ký: {new Date(participant.registeredAt).toLocaleDateString('vi-VN')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Organizer Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Người Tổ Chức</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={currentTournament.organizer?.avatarUrl} />
                      <AvatarFallback>
                        {currentTournament.organizer?.fullName?.charAt(0) || 'O'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{currentTournament.organizer?.fullName}</p>
                      <p className="text-sm text-gray-500">{currentTournament.organizer?.email}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Stats Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Thống Kê</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Tổng thu từ đăng ký</p>
                    <p className="text-2xl font-bold text-green-600">
                      {currentTournament.totalRegistrationFeesCollected?.toLocaleString() || 0} VNĐ
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500 mb-1">Chi phí sân</p>
                    <p className="text-2xl font-bold text-red-600">
                      {currentTournament.totalFieldCost?.toLocaleString() || 0} VNĐ
                    </p>
                  </div>

                  <div className="pt-4 border-t">
                    <p className="text-sm text-gray-500 mb-1">Giải thưởng dự kiến</p>
                    <p className="text-xl font-bold text-purple-600">
                      {currentTournament.prizePool?.toLocaleString() || 0} VNĐ
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      <FooterComponent />
    </>
  );
}