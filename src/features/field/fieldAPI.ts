import { BASE_URL } from "../../utils/constant-value/constant";

// Base endpoints
export const FIELDS_API = `${BASE_URL}/fields`;
export const FIELD_BY_ID_API = (id: string) => `${BASE_URL}/fields/${id}`;

// Field owner-specific endpoints now live under /field-owner
const FIELD_OWNER_FIELDS_BASE = `${BASE_URL}/field-owner/fields`;
export const CREATE_FIELD_API = FIELD_OWNER_FIELDS_BASE;
export const CREATE_FIELD_WITH_IMAGES_API = `${FIELD_OWNER_FIELDS_BASE}/with-images`;
export const UPDATE_FIELD_API = (id: string) => `${FIELD_OWNER_FIELDS_BASE}/${id}`;
export const DELETE_FIELD_API = (id: string) => `${FIELD_OWNER_FIELDS_BASE}/${id}`;

// Availability endpoints (Pure Lazy Creation)
export const FIELD_AVAILABILITY_API = (id: string) => `${BASE_URL}/fields/${id}/availability`;

// Price scheduling endpoints
export const SCHEDULE_PRICE_UPDATE_API = (id: string) => `${FIELD_OWNER_FIELDS_BASE}/${id}/schedule-price-update`;
export const CANCEL_SCHEDULED_PRICE_UPDATE_API = (id: string) => `${FIELD_OWNER_FIELDS_BASE}/${id}/scheduled-price-update`;
export const GET_SCHEDULED_PRICE_UPDATES_API = (id: string) => `${FIELD_OWNER_FIELDS_BASE}/${id}/scheduled-price-updates`;

// Field amenities endpoints
export const GET_FIELD_AMENITIES_API = (fieldId: string) => `${BASE_URL}/fields/${fieldId}/amenities`;
export const UPDATE_FIELD_AMENITIES_API = (fieldId: string) => `${FIELD_OWNER_FIELDS_BASE}/${fieldId}/amenities`;

// Location-based endpoints
export const GET_NEARBY_FIELDS_API = (
    lat: number,
    lng: number,
    radius?: number,
    limit?: number,
    sportType?: 'football' | 'tennis' | 'badminton' | 'pickleball' | 'basketball' | 'volleyball' | 'swimming' | 'gym'
) => {
    const params = new URLSearchParams({
        lat: lat.toString(),
        lng: lng.toString(),
        ...(radius ? { radius: radius.toString() } : {}),
        ...(limit ? { limit: limit.toString() } : {}),
        ...(sportType ? { sportType } : {})
    } as Record<string, string>);
    return `${BASE_URL}/fields/nearby?${params.toString()}`;
};

export const GET_FIELDS_BY_LOCATION_API = (location: string) => `${BASE_URL}/fields?location=${encodeURIComponent(location)}`;

// Field owner endpoints
export const GET_MY_FIELDS_API = FIELD_OWNER_FIELDS_BASE;
export const GET_MY_FIELDS_BOOKINGS_API = `${BASE_URL}/field-owner/bookings`;