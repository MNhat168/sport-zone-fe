import { BASE_URL } from "../../utils/constant-value/constant";

export const CHAT_API = `${BASE_URL}/chat`;

// Endpoints
export const START_CHAT_API = `${CHAT_API}/start`;
export const START_COACH_CHAT_API = `${CHAT_API}/coach/start`;
export const GET_CHAT_ROOMS_API = `${CHAT_API}/rooms`;
export const GET_CHAT_ROOM_API = (id: string) => `${CHAT_API}/room/${id}`;
export const GET_FIELD_OWNER_CHAT_ROOMS_API = `${CHAT_API}/field-owner/rooms`;
export const GET_COACH_CHAT_ROOMS_API = `${CHAT_API}/coach/rooms`;
export const MARK_AS_READ_API = (id: string) => `${CHAT_API}/room/${id}/read`;
export const UPDATE_STATUS_API = (id: string) => `${CHAT_API}/room/${id}/status`;
export const UNREAD_COUNT_API = `${CHAT_API}/unread-count`;