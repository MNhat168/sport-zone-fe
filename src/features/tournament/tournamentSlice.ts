import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface Tournament {
  rules: any;
  totalRegistrationFeesCollected: any;
  prizePool: any;
  _id: string;
  name: string;
  sportType: string;
  location: string;
  startDate: string;
  endDate: string;
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
  }>;
  fields: Array<{
    field: any;
  }>;
  fieldsNeeded: number;
  totalFieldCost: number;
  confirmationDeadline: string;
  organizer: any;
}

interface TournamentState {
  tournaments: Tournament[];
  currentTournament: Tournament | null;
  availableFields: any[];
  loading: boolean;
  error: string | null;
}

const initialState: TournamentState = {
  tournaments: [],
  currentTournament: null,
  availableFields: [],
  loading: false,
  error: null,
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
  },
});

export const {
  setLoading,
  setError,
  setTournaments,
  setCurrentTournament,
  setAvailableFields,
  addTournament,
  updateTournament,
} = tournamentSlice.actions;

export default tournamentSlice.reducer;