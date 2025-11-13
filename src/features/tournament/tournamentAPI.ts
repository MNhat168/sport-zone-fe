import { BASE_URL } from "../../utils/constant-value/constant";

// Base tournament endpoints
export const TOURNAMENTS_API = `${BASE_URL}/tournaments`;
export const TOURNAMENT_BY_ID_API = (id: string) => `${BASE_URL}/tournaments/${id}`;
export const CREATE_TOURNAMENT_API = `${BASE_URL}/tournaments`;
export const REGISTER_FOR_TOURNAMENT_API = `${BASE_URL}/tournaments/register`;
export const AVAILABLE_FIELDS_API = `${BASE_URL}/tournaments/available-fields`;

export const buildTournamentsQuery = (filters: { sportType?: string; location?: string; status?: string }) => {
  const params = new URLSearchParams();
  if (filters.sportType && filters.sportType !== 'all') params.append('sportType', filters.sportType);
  if (filters.location) params.append('location', filters.location);
  if (filters.status && filters.status !== 'all') params.append('status', filters.status);
  return params.toString();
};

export const buildAvailableFieldsQuery = (params: { sportType: string; location: string; date: string }) => {
  const queryParams = new URLSearchParams(params);
  return queryParams.toString();
};