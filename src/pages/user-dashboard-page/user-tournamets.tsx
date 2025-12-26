// File: src/pages/tournaments/MyTournaments.tsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Calendar,
  Clock,
  Edit,
  Eye,
  MapPin,
  MoreVertical,
  Plus,
  Trash2,
  Users,
  DollarSign,
  Calendar as CalendarIcon,
  AlertTriangle
} from 'lucide-react';
import type { AppDispatch, RootState } from '@/store/store';
import {
  fetchMyTournaments,
  updateTournamentById
} from '@/features/tournament/tournamentThunk';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { CancelTournamentModal } from '@/components/tournamnent/CancelTournamentModal';

// Layout Imports
import { UserDashboardTabs } from "@/components/tabs/user-dashboard-tabs";
import { NavbarDarkComponent } from "@/components/header/navbar-dark-component";
import { UserDashboardHeader } from "@/components/header/user-dashboard-header";
import { PageWrapper } from "@/components/layouts/page-wrapper";

const MyTournaments = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { tournaments, loading, error } = useSelector((state: RootState) => state.tournament);

  const [editingTournament, setEditingTournament] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [tournamentToCancel, setTournamentToCancel] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    rules: '',
    registrationFee: 0,
    startTime: '',
    endTime: ''
  });

  useEffect(() => {
    dispatch(fetchMyTournaments());
  }, [dispatch]);

  const handleEdit = (tournament: any) => {
    setEditingTournament(tournament);
    setFormData({
      name: tournament.name,
      description: tournament.description,
      rules: tournament.rules || '',
      registrationFee: tournament.registrationFee,
      startTime: tournament.startTime,
      endTime: tournament.endTime
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdate = async () => {
    if (!editingTournament) return;

    try {
      await dispatch(updateTournamentById({
        id: editingTournament._id,
        data: formData
      })).unwrap();

      toast.success('Tournament updated successfully');
      setIsEditDialogOpen(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update tournament');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'ongoing': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch {
      return dateString;
    }
  };

  return (
    <>
      <NavbarDarkComponent />
      <PageWrapper className="min-h-screen">
        <UserDashboardHeader />
        <UserDashboardTabs />

        <div className="container mx-auto px-12 py-8">
          {loading ? (
            <div className="container mx-auto px-4 py-8">
              <Skeleton className="h-8 w-48 mb-6" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => (
                  <Card key={i}>
                    <CardHeader>
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-1/2 mt-2" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-2/3" />
                    </CardContent>
                    <CardFooter>
                      <Skeleton className="h-10 w-full" />
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Giải Đấu Của Tôi</h1>
                  <p className="text-gray-600 mt-2">
                    Quản lý và chỉnh sửa các giải đấu bạn đã tạo
                  </p>
                </div>
                <Button onClick={() => navigate('/tournaments/create')} className="bg-green-600 hover:bg-green-700">
                  <Plus className="mr-2 h-4 w-4" />
                  Tạo Giải Đấu
                </Button>
              </div>

              {error && (
                <Alert variant="destructive" className="mb-6">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {tournaments.length === 0 ? (
                <Card>
                  <CardContent className="py-12">
                    <div className="text-center">
                      <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Chưa có giải đấu nào
                      </h3>
                      <p className="text-gray-500 mb-6">
                        Tạo giải đấu đầu tiên của bạn để bắt đầu
                      </p>
                      <Button onClick={() => navigate('/tournaments/create')} className="bg-green-600 hover:bg-green-700">
                        <Plus className="mr-2 h-4 w-4" />
                        Tạo Giải Đấu
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {tournaments.map((tournament) => (
                    <Card key={tournament._id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-xl line-clamp-1">
                              {tournament.name}
                            </CardTitle>
                            <CardDescription className="mt-1">
                              {tournament.sportType} • {tournament.category}
                            </CardDescription>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Tác Vụ</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => navigate(`/tournaments/${tournament._id}`)}>
                                <Eye className="mr-2 h-4 w-4" />
                                Xem Chi Tiết
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleEdit(tournament)}
                                disabled={!['draft', 'pending'].includes(tournament.status)}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Chỉnh Sửa
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setTournamentToCancel(tournament);
                                  setShowCancelModal(true);
                                }}
                                disabled={!['draft', 'pending'].includes(tournament.status)}
                                className="text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Hủy Giải Đấu
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span>{formatDate(tournament.tournamentDate)}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock className="h-4 w-4 mr-2" />
                          <span>{tournament.startTime} - {tournament.endTime}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="h-4 w-4 mr-2" />
                          <span className="line-clamp-1">{tournament.location}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Users className="h-4 w-4 mr-2" />
                          <span>{tournament.participants?.length || 0}/{tournament.maxParticipants} người tham gia</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <DollarSign className="h-4 w-4 mr-2" />
                          <span>
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(tournament.registrationFee)} / người
                          </span>
                        </div>
                        <div className="flex justify-between items-center pt-4 border-t">
                          <Badge className={getStatusColor(tournament.status)}>
                            {tournament.status.charAt(0).toUpperCase() + tournament.status.slice(1)}
                          </Badge>
                          <span className="text-sm font-medium">
                            {tournament.currentTeams}/{tournament.numberOfTeams} đội
                          </span>
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/tournaments/${tournament._id}`)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Xem
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(tournament)}
                          disabled={!['draft', 'pending'].includes(tournament.status)}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Sửa
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Edit Tournament Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Chỉnh Sửa Giải Đấu</DialogTitle>
                <DialogDescription>
                  Cập nhật thông tin giải đấu
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Tên
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="description" className="text-right">
                    Mô tả
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="col-span-3"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="rules" className="text-right">
                    Luật lệ
                  </Label>
                  <Textarea
                    id="rules"
                    value={formData.rules}
                    onChange={(e) => setFormData({ ...formData, rules: e.target.value })}
                    className="col-span-3"
                    rows={4}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="registrationFee" className="text-right">
                    Phí (VND)
                  </Label>
                  <Input
                    id="registrationFee"
                    type="number"
                    value={formData.registrationFee}
                    onChange={(e) => setFormData({ ...formData, registrationFee: parseFloat(e.target.value) })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="startTime">Giờ Bắt Đầu</Label>
                    <Input
                      id="startTime"
                      type="time"
                      value={formData.startTime}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="endTime">Giờ Kết Thúc</Label>
                    <Input
                      id="endTime"
                      type="time"
                      value={formData.endTime}
                      onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Hủy
                </Button>
                <Button onClick={handleUpdate}>Lưu Thay Đổi</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Cancel Tournament Modal */}
          {tournamentToCancel && (
            <CancelTournamentModal
              isOpen={showCancelModal}
              onClose={() => {
                setShowCancelModal(false);
                setTournamentToCancel(null);
              }}
              tournamentId={tournamentToCancel._id}
            />
          )}
        </div>
      </PageWrapper>
    </>
  );
};

export default MyTournaments;