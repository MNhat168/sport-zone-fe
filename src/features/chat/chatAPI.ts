import { BASE_URL } from "../../utils/constant-value/constant";

export const CHAT_API = `${BASE_URL}/chat`;

// Endpoints
export const START_CHAT_API = `${CHAT_API}/start`;
export const GET_CHAT_ROOMS_API = `${CHAT_API}/rooms`;
export const GET_CHAT_ROOM_API = (id: string) => `${CHAT_API}/room/${id}`;
export const MARK_AS_READ_API = (id: string) => `${CHAT_API}/room/${id}/read`;
export const UPDATE_STATUS_API = (id: string) => `${CHAT_API}/room/${id}/status`;
export const UNREAD_COUNT_API = `${CHAT_API}/unread-count`;