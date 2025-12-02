import { createAsyncThunk } from '@reduxjs/toolkit';
import axiosPublic from '../../utils/axios/axiosPublic';
import axiosPrivate from '../../utils/axios/axiosPrivate';
import {
  TOURNAMENTS_API,
  TOURNAMENT_BY_ID_API,
  AVAILABLE_FIELDS_API,
  CREATE_TOURNAMENT_API,
  REGISTER_FOR_TOURNAMENT_API,
  buildTournamentsQuery,
  buildAvailableFieldsQuery,
} from './tournamentAPI';
import {
  setLoading,
  setError,
  setTournaments,
  setCurrentTournament,
  setAvailableFields,
  addTournament,
  updateTournament,
  setSelectedTeam,
} from './tournamentSlice';

// Helper function to generate team colors
const getTeamColor = (teamNumber: number): string => {
  const colors = [
    '#EF4444', // Red
    '#3B82F6', // Blue
    '#10B981', // Green
    '#F59E0B', // Yellow
    '#8B5CF6', // Purple
    '#EC4899', // Pink
    '#06B6D4', // Cyan
    '#F97316', // Orange
    '#84CC16', // Lime
    '#6366F1', // Indigo
    '#14B8A6', // Teal
    '#F43F5E', // Rose
  ];
  return colors[(teamNumber - 1) % colors.length];
};

// In tournamentThunk.ts - Update the mapping function
const mapApiTournamentToAppTournament = (apiTournament: any): import("./tournamentSlice").Tournament => {
  console.log('Mapping tournament:', apiTournament);

  // Extract date values safely
  const tournamentDate = apiTournament?.tournamentDate ?
    (typeof apiTournament.tournamentDate === 'string' ?
      apiTournament.tournamentDate.split('T')[0] :
      apiTournament.tournamentDate.toISOString().split('T')[0]) : "";

  const registrationStart = apiTournament?.registrationStart ?
    (typeof apiTournament.registrationStart === 'string' ?
      apiTournament.registrationStart.split('T')[0] :
      apiTournament.registrationStart.toISOString().split('T')[0]) : "";

  const registrationEnd = apiTournament?.registrationEnd ?
    (typeof apiTournament.registrationEnd === 'string' ?
      apiTournament.registrationEnd.split('T')[0] :
      apiTournament.registrationEnd.toISOString().split('T')[0]) : "";

  const confirmationDeadline = apiTournament?.confirmationDeadline ?
    (typeof apiTournament.confirmationDeadline === 'string' ?
      apiTournament.confirmationDeadline.split('T')[0] :
      apiTournament.confirmationDeadline.toISOString().split('T')[0]) : "";

  // Calculate current teams based on participants and team size
  const teamSize = apiTournament?.teamSize || 1;
  const participantsCount = apiTournament?.participants?.length || 0;
  const currentTeams = Math.min(
    Math.ceil(participantsCount / teamSize),
    apiTournament?.numberOfTeams || 0
  );

  // Also add a proper isFull check:
  const isFull = participantsCount >= (apiTournament?.numberOfTeams || 0) * teamSize;

  // Map teams with default values if not provided
  const teams = Array.isArray(apiTournament?.teams)
    ? apiTournament.teams.map((team: any) => ({
      teamNumber: team.teamNumber || 0,
      name: team.name || `Team ${team.teamNumber}`,
      captain: team.captain || null,
      members: team.members || [],
      isFull: team.isFull || false,
      color: team.color || getTeamColor(team.teamNumber || 0),
      score: team.score || 0,
      matchesPlayed: team.matchesPlayed || 0,
      matchesWon: team.matchesWon || 0,
      matchesLost: team.matchesLost || 0,
      matchesDrawn: team.matchesDrawn || 0,
      points: team.points || 0,
      ranking: team.ranking || 0,
    }))
    : Array.from({ length: apiTournament?.numberOfTeams || 0 }).map((_, index) => ({
      teamNumber: index + 1,
      name: `Team ${index + 1}`,
      captain: null,
      members: [],
      isFull: false,
      color: getTeamColor(index + 1),
      score: 0,
      matchesPlayed: 0,
      matchesWon: 0,
      matchesLost: 0,
      matchesDrawn: 0,
      points: 0,
      ranking: 0,
    }));

  // Map participants with team numbers
  const participants = Array.isArray(apiTournament?.participants)
    ? apiTournament.participants.map((p: any) => {
      // Assign team numbers if not present (simple round-robin assignment)
      let teamNumber = p.teamNumber;
      if (!teamNumber && apiTournament.numberOfTeams && apiTournament.teamSize) {
        const participantIndex = apiTournament.participants.indexOf(p);
        teamNumber = Math.floor(participantIndex / apiTournament.teamSize) + 1;
      }

      return {
        user: p.user || null,
        registeredAt: p.registeredAt ?
          (typeof p.registeredAt === 'string' ? p.registeredAt : p.registeredAt.toISOString()) : "",
        teamNumber: teamNumber,
        position: p.position || 'Player',
      };
    })
    : [];

  // Map schedule if exists
  const schedule = Array.isArray(apiTournament?.schedule)
    ? apiTournament.schedule.map((match: any) => ({
      matchNumber: match.matchNumber || 0,
      round: match.round || 'Round 1',
      teamA: match.teamA || 0,
      teamB: match.teamB || 0,
      field: match.field || null,
      startTime: match.startTime ?
        (typeof match.startTime === 'string' ? match.startTime : match.startTime.toISOString()) : undefined,
      endTime: match.endTime ?
        (typeof match.endTime === 'string' ? match.endTime : match.endTime.toISOString()) : undefined,
      scoreA: match.scoreA,
      scoreB: match.scoreB,
      winner: match.winner,
      status: match.status || 'scheduled',
      referee: match.referee || null,
    }))
    : [];

  return {
    _id: apiTournament?._id || apiTournament?.id || "",
    name: apiTournament?.name || "",
    sportType: apiTournament?.sportType || "",
    category: apiTournament?.category || "",
    competitionFormat: apiTournament?.competitionFormat || "single_elimination",
    location: apiTournament?.location || "",
    tournamentDate: tournamentDate,
    registrationStart: registrationStart,
    registrationEnd: registrationEnd,
    startTime: apiTournament?.startTime || "",
    endTime: apiTournament?.endTime || "",
    maxParticipants: apiTournament?.maxParticipants || 0,
    minParticipants: apiTournament?.minParticipants || 0,
    registrationFee: apiTournament?.registrationFee || 0,
    description: apiTournament?.description || "",
    status: apiTournament?.status?.toLowerCase() || "",
    participants: participants,
    fields: Array.isArray(apiTournament?.fields) ? apiTournament.fields.map((f: any) => ({
      field: f.field || null
    })) : [],
    fieldsNeeded: apiTournament?.fieldsNeeded || 0,
    totalFieldCost: apiTournament?.totalFieldCost || 0,
    confirmationDeadline: confirmationDeadline,
    organizer: apiTournament?.organizer || null,
    rules: apiTournament?.rules || undefined,
    totalRegistrationFeesCollected: apiTournament?.totalRegistrationFeesCollected || 0,
    prizePool: apiTournament?.prizePool || 0,
    commissionRate: apiTournament?.commissionRate || 0.1,
    commissionAmount: apiTournament?.commissionAmount || 0,
    categories: apiTournament?.categories || [],
    // Team properties
    numberOfTeams: apiTournament?.numberOfTeams || 0,
    teamSize: teamSize,
    currentTeams: currentTeams,
    teams: teams,
    schedule: schedule,
    // Calculate team assignments if needed
    teamAssignments: apiTournament?.teamAssignments || generateTeamAssignments(
      participants,
      apiTournament?.numberOfTeams || 0,
      teamSize
    ),
  };
};

// Helper function to generate team assignments
const generateTeamAssignments = (participants: any[], numberOfTeams: number, teamSize: number) => {
  const assignments: any[] = [];

  for (let i = 0; i < numberOfTeams; i++) {
    const startIdx = i * teamSize;
    const endIdx = startIdx + teamSize;
    const teamParticipants = participants.slice(startIdx, endIdx);

    assignments.push({
      teamNumber: i + 1,
      participants: teamParticipants.map((p: any) => p.user),
      isFull: teamParticipants.length === teamSize,
      remainingSpots: teamSize - teamParticipants.length,
    });
  }

  return assignments;
};

export const fetchTournaments = createAsyncThunk(
  'tournament/fetchTournaments',
  async (filters: { sportType?: string; location?: string; status?: string }, { dispatch, rejectWithValue }) => {
    dispatch(setLoading(true));
    dispatch(setError(null));

    try {
      const queryString = buildTournamentsQuery(filters);
      const url = queryString ? `${TOURNAMENTS_API}?${queryString}` : TOURNAMENTS_API;

      console.log('Fetching tournaments from:', url);

      const response = await axiosPublic.get(url);
      console.log('API Response:', response);
      console.log('Response data structure:', response.data);

      // Handle different API response structures
      let tournaments: any[] = [];

      if (Array.isArray(response.data)) {
        tournaments = response.data;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        tournaments = response.data.data;
      } else if (response.data?.items && Array.isArray(response.data.items)) {
        tournaments = response.data.items;
      } else if (response.data?.tournaments && Array.isArray(response.data.tournaments)) {
        tournaments = response.data.tournaments;
      }

      console.log('Extracted tournaments:', tournaments);

      const mappedTournaments = tournaments.map(mapApiTournamentToAppTournament);
      console.log('Mapped tournaments:', mappedTournaments);

      dispatch(setTournaments(mappedTournaments));
      return mappedTournaments;
    } catch (error: any) {
      console.error('Error fetching tournaments:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Failed to fetch tournaments';
      dispatch(setError(errorMsg));
      return rejectWithValue(errorMsg);
    } finally {
      dispatch(setLoading(false));
    }
  }
);

// Fetch tournament by ID
export const fetchTournamentById = createAsyncThunk(
  'tournament/fetchTournamentById',
  async (id: string, { dispatch, rejectWithValue }) => {
    dispatch(setLoading(true));
    dispatch(setError(null));

    try {
      const response = await axiosPublic.get(TOURNAMENT_BY_ID_API(id));
      const mappedTournament = mapApiTournamentToAppTournament(response.data);

      dispatch(setCurrentTournament(mappedTournament));
      return mappedTournament;
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Failed to fetch tournament';
      dispatch(setError(errorMsg));
      return rejectWithValue(errorMsg);
    } finally {
      dispatch(setLoading(false));
    }
  }
);

// Fetch available fields
export const fetchAvailableFields = createAsyncThunk(
  'tournament/fetchAvailableFields',
  async (params: { sportType: string; location: string; date: string }, { dispatch, rejectWithValue }) => {
    dispatch(setLoading(true));
    dispatch(setError(null));

    try {
      const queryString = buildAvailableFieldsQuery(params);
      const response = await axiosPublic.get(`${AVAILABLE_FIELDS_API}?${queryString}`);

      // Extract fields from the response structure
      const fields = response.data.data || response.data || [];

      console.log('Extracted fields:', fields);
      dispatch(setAvailableFields(fields));
      return fields;
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Failed to fetch available fields';
      dispatch(setError(errorMsg));
      return rejectWithValue(errorMsg);
    } finally {
      dispatch(setLoading(false));
    }
  }
);

// Create tournament
export const createTournament = createAsyncThunk(
  'tournament/createTournament',
  async (tournamentData: any, { dispatch, rejectWithValue }) => {
    dispatch(setLoading(true));
    dispatch(setError(null));

    try {
      const response = await axiosPrivate.post(CREATE_TOURNAMENT_API, tournamentData);
      const mappedTournament = mapApiTournamentToAppTournament(response.data);

      dispatch(addTournament(mappedTournament));
      return mappedTournament;
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Failed to create tournament';
      dispatch(setError(errorMsg));
      return rejectWithValue(errorMsg);
    } finally {
      dispatch(setLoading(false));
    }
  }
);

// Register for tournament
export const registerForTournament = createAsyncThunk(
  'tournament/registerForTournament',
  async (data: { tournamentId: string; paymentMethod: string }, { dispatch, rejectWithValue }) => {
    dispatch(setLoading(true));
    dispatch(setError(null));

    try {
      const response = await axiosPrivate.post(REGISTER_FOR_TOURNAMENT_API, data);
      const mappedTournament = mapApiTournamentToAppTournament(response.data);

      dispatch(updateTournament(mappedTournament));
      return mappedTournament;
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Failed to register for tournament';
      dispatch(setError(errorMsg));
      return rejectWithValue(errorMsg);
    } finally {
      dispatch(setLoading(false));
    }
  }
);

// Select a team (for navigation)
export const selectTeam = createAsyncThunk(
  'tournament/selectTeam',
  async (teamNumber: number, { dispatch }) => {
    dispatch(setSelectedTeam(teamNumber));
    return teamNumber;
  }
);