import { BASE_URL } from "../../utils/constant-value/constant";

// Base endpoints - All use /coaches (plural) as specified in coachesAPI.md
export const COACHES_API = `${BASE_URL}/coaches`;
export const COACH_BY_ID_API = (id: string) => `${BASE_URL}/coaches/${id}`;
export const ALL_COACHES_API = `${BASE_URL}/coaches/all`;
// Resolve coach profile by user id
export const COACH_ID_BY_USER_ID_API = (userId: string) => `${BASE_URL}/profiles/coach-id/${userId}`;
