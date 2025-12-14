// File: src/components/tournaments/TournamentCard.tsx
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Clock, 
  Edit, 
  Eye, 
  MapPin, 
  MoreVertical, 
  Trash2, 
  Users,
  DollarSign,
  Lock
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from 'date-fns';

interface TournamentCardProps {
  tournament: any;
  onView: () => void;
  onEdit: () => void;
  onCancel: () => void;
  showActions?: boolean;
}

const TournamentCard: React.FC<TournamentCardProps> = ({ 
  tournament, 
  onView, 
  onEdit, 
  onCancel,
  showActions = true 
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

  const canEdit = ['draft', 'pending'].includes(tournament.status);
  const canCancel = ['draft', 'pending'].includes(tournament.status);

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
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
          {showActions && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onView}>
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onEdit} disabled={!canEdit}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Tournament
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={onCancel} 
                  disabled={!canCancel}
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
        <div className="flex items-center text-sm text-gray-600">
          <DollarSign className="h-4 w-4 mr-2" />
          <span>${tournament.registrationFee} per person</span>
        </div>
        <div className="flex justify-between items-center pt-4 border-t">
          <Badge className={getStatusColor(tournament.status)}>
            {tournament.status.charAt(0).toUpperCase() + tournament.status.slice(1)}
          </Badge>
          <span className="text-sm font-medium">
            {tournament.currentTeams}/{tournament.numberOfTeams} teams
          </span>
        </div>
      </CardContent>
      {showActions && (
        <CardFooter className="flex justify-between">
          <Button variant="outline" size="sm" onClick={onView}>
            <Eye className="h-4 w-4 mr-2" />
            View
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={onEdit}
            disabled={!canEdit}
          >
            {!canEdit && <Lock className="h-4 w-4 mr-2" />}
            <Edit className={`h-4 w-4 ${!canEdit ? 'mr-2' : ''}`} />
            {canEdit ? 'Edit' : 'Locked'}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default TournamentCard;