// Base path for Field Owner Profile endpoints
export const OWNER_PROFILE_BASE = "/field-owner/profile";

// Endpoints
export const CREATE_OWNER_PROFILE_API = OWNER_PROFILE_BASE; // POST
export const GET_MY_OWNER_PROFILE_API = OWNER_PROFILE_BASE; // GET
export const UPDATE_OWNER_PROFILE_API = OWNER_PROFILE_BASE; // PATCH
export const GET_OWNER_PROFILE_BY_ID_API = (id: string) => `${OWNER_PROFILE_BASE}/${id}`; // GET public


