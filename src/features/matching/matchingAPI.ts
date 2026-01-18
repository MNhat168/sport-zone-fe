import { BASE_URL } from "../../utils/constant-value/constant";

// Matching Profiles
export const MATCH_PROFILE_API = `${BASE_URL}/matching/profile`;
export const MATCH_CANDIDATES_API = `${BASE_URL}/matching/candidates`;
export const SWIPE_API = `${BASE_URL}/matching/swipe`;

// Matches
export const MY_MATCHES_API = `${BASE_URL}/matching/matches`;
export const MATCH_DETAILS_API = (id: string) => `${BASE_URL}/matching/matches/${id}`;
export const UNMATCH_API = (id: string) => `${BASE_URL}/matching/matches/${id}/unmatch`;
export const SCHEDULE_MATCH_API = (id: string) => `${BASE_URL}/matching/matches/${id}/schedule`;
export const CANCEL_MATCH_API = (id: string) => `${BASE_URL}/matching/matches/${id}/cancel`;
export const SWIPE_HISTORY_API = `${BASE_URL}/matching/swipe-history`;

// Helpers
export const buildCandidatesQuery = (filters: {
    sportType: string;
    maxDistance?: number;
    skillLevel?: string;
    genderPreference?: string;
    limit?: number;
}) => {
    const params = new URLSearchParams();
    params.append('sportType', filters.sportType);
    if (filters.maxDistance) params.append('maxDistance', filters.maxDistance.toString());
    if (filters.skillLevel && filters.skillLevel !== 'any') params.append('skillLevel', filters.skillLevel);
    if (filters.genderPreference && filters.genderPreference !== 'any') params.append('genderPreference', filters.genderPreference);
    if (filters.limit) params.append('limit', filters.limit.toString());
    return params.toString();
};
