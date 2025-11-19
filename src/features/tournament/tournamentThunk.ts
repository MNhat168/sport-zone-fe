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
} from './tournamentSlice';

const mapApiTournamentToAppTournament = (apiTournament: any): import("./tournamentSlice").Tournament => {
  console.log('Mapping tournament:', apiTournament); // Debug log
  
  return {
    _id: apiTournament?._id || apiTournament?.id || "",
    name: apiTournament?.name || "",
    sportType: apiTournament?.sportType || "",
    location: apiTournament?.location || "",
    tournamentDate: apiTournament?.tournamentDate ? new Date(apiTournament.tournamentDate).toISOString().split('T')[0] : "",
    registrationStart: apiTournament?.registrationStart ? new Date(apiTournament.registrationStart).toISOString().split('T')[0] : "",
    registrationEnd: apiTournament?.registrationEnd ? new Date(apiTournament.registrationEnd).toISOString().split('T')[0] : "",
    startTime: apiTournament?.startTime || "",
    endTime: apiTournament?.endTime || "",
    maxParticipants: apiTournament?.maxParticipants || 0,
    minParticipants: apiTournament?.minParticipants || 0,
    registrationFee: apiTournament?.registrationFee || 0,
    description: apiTournament?.description || "",
    status: apiTournament?.status || "",
    participants: Array.isArray(apiTournament?.participants) ? apiTournament.participants.map((p: any) => ({
      user: p.user || null,
      registeredAt: p.registeredAt ? new Date(p.registeredAt).toISOString() : ""
    })) : [],
    fields: Array.isArray(apiTournament?.fields) ? apiTournament.fields.map((f: any) => ({
      field: f.field || null
    })) : [],
    fieldsNeeded: apiTournament?.fieldsNeeded || 0,
    totalFieldCost: apiTournament?.totalFieldCost || 0,
    confirmationDeadline: apiTournament?.confirmationDeadline ? new Date(apiTournament.confirmationDeadline).toISOString().split('T')[0] : "",
    organizer: apiTournament?.organizer || null,
    rules: apiTournament?.rules || undefined,
    totalRegistrationFeesCollected: apiTournament?.totalRegistrationFeesCollected || 0,
    prizePool: apiTournament?.prizePool || 0
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
      console.log('Response data:', response.data);
      
      // FIX: Extract the array from response.data.data
      const tournaments = Array.isArray(response.data.data) ? response.data.data : [];
      console.log('Tournaments array:', tournaments);
      
      const mappedTournaments = tournaments.map(mapApiTournamentToAppTournament);
      console.log('Mapped tournaments:', mappedTournaments);
      
      dispatch(setTournaments(mappedTournaments));
      return mappedTournaments;
    } catch (error: any) {
      console.error('Error fetching tournaments:', error);
      const errorMsg = error.response?.data?.message || 'Failed to fetch tournaments';
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

// In tournamentThunk.ts - fix the fetchAvailableFields thunk
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
      
      console.log('Extracted fields:', fields); // Debug log
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