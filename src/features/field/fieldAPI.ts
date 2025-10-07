import { BASE_URL } from "../../utils/constant-value/constant";

// Base endpoints - All use /fields (plural) as specified in fieldAPI.md
export const FIELDS_API = `${BASE_URL}/fields`;
export const FIELD_BY_ID_API = (id: string) => `${BASE_URL}/fields/${id}`;
export const CREATE_FIELD_API = `${BASE_URL}/fields`;
export const CREATE_FIELD_WITH_IMAGES_API = `${BASE_URL}/fields/with-images`;
export const UPDATE_FIELD_API = (id: string) => `${BASE_URL}/fields/${id}`;
export const DELETE_FIELD_API = (id: string) => `${BASE_URL}/fields/${id}`;

// Availability endpoints (Pure Lazy Creation)
export const FIELD_AVAILABILITY_API = (id: string) => `${BASE_URL}/fields/${id}/availability`;

// Price scheduling endpoints
export const SCHEDULE_PRICE_UPDATE_API = (id: string) => `${BASE_URL}/fields/${id}/schedule-price-update`;
export const CANCEL_SCHEDULED_PRICE_UPDATE_API = (id: string) => `${BASE_URL}/fields/${id}/scheduled-price-update`;
export const GET_SCHEDULED_PRICE_UPDATES_API = (id: string) => `${BASE_URL}/fields/${id}/scheduled-price-updates`;