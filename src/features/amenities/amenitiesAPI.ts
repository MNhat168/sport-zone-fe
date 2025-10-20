import { BASE_URL } from "../../utils/constant-value/constant";

export const AMENITIES_API = `${BASE_URL}/amenities`;

// API Endpoints theo documentation
export const CREATE_AMENITY_API = AMENITIES_API; // POST /amenities
export const GET_AMENITIES_API = AMENITIES_API; // GET /amenities
export const GET_AMENITY_BY_ID_API = (id: string) => `${AMENITIES_API}/${id}`; // GET /amenities/{id}
export const UPDATE_AMENITY_API = (id: string) => `${AMENITIES_API}/${id}`; // PATCH /amenities/{id}
export const DELETE_AMENITY_API = (id: string) => `${AMENITIES_API}/${id}`; // DELETE /amenities/{id}
export const TOGGLE_AMENITY_STATUS_API = (id: string) => `${AMENITIES_API}/${id}/toggle-status`; // PATCH /amenities/{id}/toggle-status
export const GET_AMENITIES_BY_SPORT_TYPE_API = (sportType: string) => `${AMENITIES_API}/sport-type/${sportType}`; // GET /amenities/sport-type/{sportType}
export const GET_AMENITIES_BY_TYPE_API = (type: string) => `${AMENITIES_API}/type/${type}`; // GET /amenities/type/{type}
