// File: src/pages/tournaments/MyTournaments.tsx
import { useState, useEffect } from 'react';
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
import { Loading } from '@/components/ui/loading';
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
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
  Calendar as CalendarIcon,
} from 'lucide-react';
import type { AppDispatch, RootState } from '@/store/store';
import {
  fetchMyTournaments,
  fetchMyParticipatedTournaments,
  updateTournamentById
} from '@/features/tournament/tournamentThunk';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { CancelTournamentModal } from '@/components/tournamnent/CancelTournamentModal';
import { NavbarDarkComponent } from "@/components/header/navbar-dark-component";
import { UserDashboardHeader } from "@/components/header/user-dashboard-header";
import { UserDashboardTabs } from "@/components/tabs/user-dashboard-tabs";
import { PageWrapper } from "@/components/layouts/page-wrapper";

const MyTournaments = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { tournaments, participatedTournaments, loading } = useSelector((state: RootState) => state.tournament);

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
    dispatch(fetchMyParticipatedTournaments());
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

  const LoadingComponent = () => (
    <div className="flex items-center justify-center py-12">
      <div className="text-center">
        <Loading size={48} className="text-green-600 mx-auto mb-4" />
        <p className="text-muted-foreground">Đang tải danh sách giải đấu...</p>
      </div>
    </div>
  );

  return (
    <>
      <NavbarDarkComponent />
      <PageWrapper className="min-h-screen">
        <UserDashboardHeader />
        <UserDashboardTabs />

        <div className="max-w-[1320px] mx-auto px-12 py-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Tournaments</h1>
              <p className="text-gray-600 mt-2">
                Manage your created tournaments and participation history
              </p>
            </div>
            <Button onClick={() => navigate('/tournaments/create')} className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="mr-2 h-4 w-4" />
              Create New Tournament
            </Button>
          </div>

          <Tabs defaultValue="created" className="space-y-8">
            <TabsList className="bg-gray-100 p-1 rounded-lg">
              <TabsTrigger value="created" className="px-6 py-2 rounded-md transition-all active:bg-white active:shadow-sm">
                <Plus className="mr-2 h-4 w-4" />
                Created Tournaments
                <Badge variant="secondary" className="ml-2 bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                  {tournaments.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="participated" className="px-6 py-2 rounded-md transition-all active:bg-white active:shadow-sm">
                <Users className="mr-2 h-4 w-4" />
                Joined Tournaments
                <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-700 hover:bg-blue-100">
                  {participatedTournaments.length}
                </Badge>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="created" className="space-y-6">
              {loading ? <LoadingComponent /> : (
                tournaments.length === 0 ? (
                  <Card className="border-dashed">
                    <CardContent className="py-12">
                      <div className="text-center">
                        <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          No tournaments created yet
                        </h3>
                        <p className="text-gray-500 mb-6">
                          Create your first tournament to get started as an organizer
                        </p>
                        <Button variant="outline" onClick={() => navigate('/tournaments/create')}>
                          <Plus className="mr-2 h-4 w-4" />
                          Create Tournament
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {tournaments.map((tournament) => (
                      <TournamentCard
                        key={tournament._id}
                        tournament={tournament}
                        isOrganizer={true}
                        onEdit={handleEdit}
                        onCancel={(t) => {
                          setTournamentToCancel(t);
                          setShowCancelModal(true);
                        }}
                        onView={(id) => navigate(`/tournaments/${id}`)}
                      />
                    ))}
                  </div>
                )
              )}
            </TabsContent>

            <TabsContent value="participated" className="space-y-6">
              {loading ? <LoadingComponent /> : (
                participatedTournaments.length === 0 ? (
                  <Card className="border-dashed">
                    <CardContent className="py-12">
                      <div className="text-center">
                        <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          No joinings yet
                        </h3>
                        <p className="text-gray-500 mb-6">
                          Join a tournament to see it here
                        </p>
                        <Button variant="outline" onClick={() => navigate('/tournaments')}>
                          <Eye className="mr-2 h-4 w-4" />
                          Browse Tournaments
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {participatedTournaments.map((tournament) => (
                      <TournamentCard
                        key={tournament._id}
                        tournament={tournament}
                        isOrganizer={false}
                        onView={(id) => navigate(`/tournaments/${id}`)}
                      />
                    ))}
                  </div>
                )
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Edit Tournament Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Edit Tournament</DialogTitle>
              <DialogDescription>
                Update tournament information
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
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
                  Description
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
                  Rules
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
                  Fee ($)
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
                  <Label htmlFor="startTime">Start Time</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="endTime">End Time</Label>
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
                Cancel
              </Button>
              <Button onClick={handleUpdate}>Save Changes</Button>
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
      </PageWrapper>
    </>
  );
};

// Sub-component for individual tournament card
const TournamentCard = ({
  tournament,
  isOrganizer,
  onEdit,
  onCancel,
  onView
}: {
  tournament: any;
  isOrganizer: boolean;
  onEdit?: (t: any) => void;
  onCancel?: (t: any) => void;
  onView: (id: string) => void;
}) => {
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
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
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
          {isOrganizer && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onView(tournament._id)}>
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onEdit?.(tournament)}
                  disabled={!['draft', 'pending'].includes(tournament.status)}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Tournament
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onCancel?.(tournament)}
                  disabled={!['draft', 'pending'].includes(tournament.status)}
                  className="text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Cancel Tournament
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
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
          <span>{tournament.participants?.length || 0}/{tournament.maxParticipants} participants</span>
        </div>
        {!isOrganizer && (
          <div className="flex items-center text-sm text-gray-600 italic">
            <span className="text-emerald-600 font-medium">Joined as Participant</span>
          </div>
        )}
        <div className="flex justify-between items-center pt-4 border-t">
          <Badge className={getStatusColor(tournament.status)}>
            {tournament.status.charAt(0).toUpperCase() + tournament.status.slice(1)}
          </Badge>
          <span className="text-sm font-medium">
            {tournament.currentTeams}/{tournament.numberOfTeams} teams
          </span>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={() => onView(tournament._id)}
        >
          <Eye className="h-4 w-4 mr-2" />
          View
        </Button>
        {isOrganizer && (
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onEdit?.(tournament)}
            disabled={!['draft', 'pending'].includes(tournament.status)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default MyTournaments;
