import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface Tournament {
  categories: string[];
  rules: any;
  totalRegistrationFeesCollected: any;
  prizePool: any;
  commissionRate?: number;
  commissionAmount?: number;
  _id: string;
  name: string;
  sportType: string;
  category: string;
  competitionFormat: string;
  location: string;
  tournamentDate: string;
  registrationStart: string;
  registrationEnd: string;
  startTime: string;
  endTime: string;
  maxParticipants: number;
  minParticipants: number;
  registrationFee: number;
  description: string;
  status: string;
  participants: Array<{
    user: any;
    registeredAt: string;
    teamNumber?: number;
    position?: string;
  }>;
  fields: Array<{
    field: any;
  }>;
  fieldsNeeded: number;
  totalFieldCost: number;
  confirmationDeadline: string;
  organizer: any;
  // Team-related properties
  numberOfTeams: number;
  teamSize: number;
  currentTeams: number;
  teams: Array<{
    teamNumber: number;
    name?: string;
    captain?: any;
    members: any[];
    isFull: boolean;
    color?: string;
    score: number;
    matchesPlayed: number;
    matchesWon: number;
    matchesLost: number;
    matchesDrawn: number;
    points: number;
    ranking: number;
  }>;
  // Team assignments for bracket
  teamAssignments?: any[];
  // Schedule
  schedule?: Array<{
    matchNumber: number;
    round: string;
    teamA: number;
    teamB: number;
    field?: any;
    startTime?: string;
    endTime?: string;
    scoreA?: number;
    scoreB?: number;
    winner?: number;
    status: string;
    referee?: any;
  }>;
}

interface TournamentState {
  tournaments: Tournament[];
  currentTournament: Tournament | null;
  availableFields: any[];
  loading: boolean;
  error: string | null;
  selectedTeam: number | null; // For team selection
}

const initialState: TournamentState = {
  tournaments: [],
  currentTournament: null,
  availableFields: [],
  loading: false,
  error: null,
  selectedTeam: null,
};

const tournamentSlice = createSlice({
  name: 'tournament',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setTournaments: (state, action: PayloadAction<Tournament[]>) => {
      state.tournaments = action.payload;
    },
    setCurrentTournament: (state, action: PayloadAction<Tournament | null>) => {
      state.currentTournament = action.payload;
    },
    setAvailableFields: (state, action: PayloadAction<any[]>) => {
      state.availableFields = action.payload;
    },
    setSelectedTeam: (state, action: PayloadAction<number | null>) => {
      state.selectedTeam = action.payload;
    },
    addTournament: (state, action: PayloadAction<Tournament>) => {
      state.tournaments.unshift(action.payload);
    },
    updateTournament: (state, action: PayloadAction<Tournament>) => {
      const index = state.tournaments.findIndex(t => t._id === action.payload._id);
      if (index !== -1) {
        state.tournaments[index] = action.payload;
      }
      if (state.currentTournament?._id === action.payload._id) {
        state.currentTournament = action.payload;
      }
    },
    updateTeam: (state, action: PayloadAction<{ tournamentId: string; team: Tournament['teams'][0] }>) => {
      const tournament = state.tournaments.find(t => t._id === action.payload.tournamentId);
      if (tournament) {
        const teamIndex = tournament.teams.findIndex(t => t.teamNumber === action.payload.team.teamNumber);
        if (teamIndex !== -1) {
          tournament.teams[teamIndex] = action.payload.team;
        } else {
          tournament.teams.push(action.payload.team);
        }
      }
      
      if (state.currentTournament?._id === action.payload.tournamentId) {
        const teamIndex = state.currentTournament.teams.findIndex(t => t.teamNumber === action.payload.team.teamNumber);
        if (teamIndex !== -1) {
          state.currentTournament.teams[teamIndex] = action.payload.team;
        } else {
          state.currentTournament.teams.push(action.payload.team);
        }
      }
    },
  },
});

export const {
  setLoading,
  setError,
  setTournaments,
  setCurrentTournament,
  setAvailableFields,
  setSelectedTeam,
  addTournament,
  updateTournament,
  updateTeam,
} = tournamentSlice.actions;

export default tournamentSlice.reducer;