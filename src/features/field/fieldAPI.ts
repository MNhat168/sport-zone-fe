import { BASE_URL } from "../../utils/constant-value/constant";

export const FIELDS_API = `${BASE_URL}/fields`;
export const FIELD_BY_ID_API = (id: string) => `${BASE_URL}/fields/${id}`;
export const FIELDS_BY_OWNER_API = (ownerId: string) => `${BASE_URL}/fields/owner/${ownerId}`;
export const FIELD_AVAILABILITY_API = (id: string) => `${BASE_URL}/fields/${id}/availability`;
export const CREATE_FIELD_API = `${BASE_URL}/fields`;
export const UPDATE_FIELD_API = (id: string) => `${BASE_URL}/fields/${id}`;
export const DELETE_FIELD_API = (id: string) => `${BASE_URL}/fields/${id}`;