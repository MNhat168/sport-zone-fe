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
  setAvailableCourts,
} from './tournamentSlice';
import { BASE_URL } from '@/utils/constant-value/constant';



const mapApiTournamentToAppTournament = (apiTournament: any): import("./tournamentSlice").Tournament | null => {
  console.log('Raw API tournament data:', apiTournament); // Debug log
  
  // Check if apiTournament is null or undefined
  if (!apiTournament) {
    console.error('apiTournament is null or undefined');
    return null;
  }

  // Extract date values safely
  const tournamentDate = apiTournament?.tournamentDate ? 
    (typeof apiTournament.tournamentDate === 'string' ? 
      apiTournament.tournamentDate.split('T')[0] : 
      apiTournament.tournamentDate?.toISOString?.()?.split('T')[0] || "") : "";

  // Debug: Check the actual values
  console.log('Extracted values:', {
    maxParticipants: apiTournament?.maxParticipants,
    minParticipants: apiTournament?.minParticipants,
    numberOfTeams: apiTournament?.numberOfTeams,
    teamSize: apiTournament?.teamSize,
    participants: apiTournament?.participants
  });

  // Calculate current teams based on participants and team size
  const teamSize = apiTournament?.teamSize || 1;
  const participantsCount = apiTournament?.participants?.length || 0;
  
  // Use the actual values from API, don't recalculate
  const maxParticipants = apiTournament?.maxParticipants || 0;
  const minParticipants = apiTournament?.minParticipants || 0;
  const numberOfTeams = apiTournament?.numberOfTeams || 0;

  const currentTeams = Math.min(
    Math.ceil(participantsCount / teamSize),
    numberOfTeams
  );

  return {
  _id: apiTournament?._id || apiTournament?.id || "",
  name: apiTournament?.name || "",
  sportType: apiTournament?.sportType || "",
  category: apiTournament?.category || "",
  competitionFormat: apiTournament?.competitionFormat || "single_elimination",
  location: apiTournament?.location || "",
  tournamentDate: tournamentDate,
  registrationStart: apiTournament?.registrationStart ?
    (typeof apiTournament.registrationStart === 'string' ?
      apiTournament.registrationStart.split('T')[0] :
      apiTournament.registrationStart?.toISOString?.()?.split('T')[0] || "") : "",
  registrationEnd: apiTournament?.registrationEnd ?
    (typeof apiTournament.registrationEnd === 'string' ?
      apiTournament.registrationEnd.split('T')[0] :
      apiTournament.registrationEnd?.toISOString?.()?.split('T')[0] || "") : "",
  startTime: apiTournament?.startTime || "",
  endTime: apiTournament?.endTime || "",
  // USE THE ACTUAL VALUES FROM API
  maxParticipants: maxParticipants,
  minParticipants: minParticipants,
  registrationFee: apiTournament?.registrationFee || 0,
  description: apiTournament?.description || "",
  status: apiTournament?.status?.toLowerCase() || "",
  participants: Array.isArray(apiTournament?.participants) ? apiTournament.participants : [],
  fields: Array.isArray(apiTournament?.fields) ? apiTournament.fields : [],
  fieldsNeeded: apiTournament?.fieldsNeeded || 0,
  totalFieldCost: apiTournament?.totalFieldCost || 0,
  confirmationDeadline: apiTournament?.confirmationDeadline ?
    (typeof apiTournament.confirmationDeadline === 'string' ?
      apiTournament.confirmationDeadline.split('T')[0] :
      apiTournament.confirmationDeadline?.toISOString?.()?.split('T')[0] || "") : "",
  organizer: apiTournament?.organizer || null,
  rules: apiTournament?.rules || undefined,
  totalRegistrationFeesCollected: apiTournament?.totalRegistrationFeesCollected || 0,
  prizePool: apiTournament?.prizePool || 0,
  commissionRate: apiTournament?.commissionRate || 0.1,
  commissionAmount: apiTournament?.commissionAmount || 0,
  categories: apiTournament?.categories || [],
  // Team properties - USE ACTUAL VALUES
  numberOfTeams: numberOfTeams,
  teamSize: teamSize,
  currentTeams: currentTeams,
  teams: Array.isArray(apiTournament?.teams) ? apiTournament.teams : [],
  schedule: Array.isArray(apiTournament?.schedule) ? apiTournament.schedule : [],
};
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

      const validTournaments = mappedTournaments.filter((t): t is import("./tournamentSlice").Tournament => t !== null);

      dispatch(setTournaments(validTournaments));
      return validTournaments;
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

export const fetchTournamentById = createAsyncThunk(
  'tournament/fetchTournamentById',
  async (id: string, { dispatch, rejectWithValue }) => {
    dispatch(setLoading(true));
    dispatch(setError(null));

    try {
      const response = await axiosPublic.get(TOURNAMENT_BY_ID_API(id));
      console.log('API response for tournament:', response.data); // Add this line for debugging
      
      // Make sure we're passing the correct data structure
      const tournamentData = response.data.data || response.data;
      console.log('Extracted tournament data:', tournamentData); // Debug log
      
      const mappedTournament = mapApiTournamentToAppTournament(tournamentData);
      console.log('Mapped tournament:', mappedTournament); // Debug log

      dispatch(setCurrentTournament(mappedTournament));
      return mappedTournament;
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Failed to fetch tournament';
      console.error('Error fetching tournament:', error); // Add detailed error logging
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

      if (!mappedTournament) {
        const errorMsg = 'Invalid tournament data returned from API';
        dispatch(setError(errorMsg));
        return rejectWithValue(errorMsg);
      }

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

/// Register for tournament
export const registerForTournament = createAsyncThunk(
  'tournament/registerForTournament',
  async (data: { tournamentId: string; paymentMethod: string }, { dispatch, rejectWithValue }) => {
    dispatch(setLoading(true));
    dispatch(setError(null));

    try {
      const response = await axiosPrivate.post(REGISTER_FOR_TOURNAMENT_API, data);
      const fullResponse = response.data; // Keep the full response
      
      // Still update tournament in state
      if (fullResponse.tournament) {
        const mappedTournament = mapApiTournamentToAppTournament(fullResponse.tournament);
        if (mappedTournament) {
          dispatch(updateTournament(mappedTournament));
        }
      }
      
      // ✅ Return the FULL response including paymentUrl, orderCode, etc.
      return fullResponse;
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

// Add new thunk for fetching available courts
export const fetchAvailableCourts = createAsyncThunk(
  'tournament/fetchAvailableCourts',
  async (params: { sportType: string; location: string; date: string }, { dispatch, rejectWithValue }) => {
    dispatch(setLoading(true));
    dispatch(setError(null));

    try {
      const queryString = buildAvailableCourtsQuery(params); // New function
      const response = await axiosPublic.get(`${AVAILABLE_COURTS_API}?${queryString}`);

      // Extract courts from the response structure
      const courts = response.data.data || response.data || [];

      console.log('Extracted courts:', courts);
      dispatch(setAvailableCourts(courts));
      return courts;
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Failed to fetch available courts';
      dispatch(setError(errorMsg));
      return rejectWithValue(errorMsg);
    } finally {
      dispatch(setLoading(false));
    }
  }
);

// Add API endpoint
export const AVAILABLE_COURTS_API = `${BASE_URL}/tournaments/available-courts`;

export const buildAvailableCourtsQuery = (params: { sportType: string; location: string; date: string }) => {
  const queryParams = new URLSearchParams(params);
  return queryParams.toString();
};