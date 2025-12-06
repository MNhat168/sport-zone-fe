import { BASE_URL } from "../../utils/constant-value/constant";

export const GET_PROFILE_API = `${BASE_URL}/users/get-profile`;
export const UPDATE_PROFILE_API = `${BASE_URL}/users/me`;
export const SET_FAVOURITE_SPORTS_API = `${BASE_URL}/users/favourite-sports`;
export const SET_FAVOURITE_COACHES_API = `${BASE_URL}/users/favourite-coaches`;
export const REMOVE_FAVOURITE_COACHES_API = `${BASE_URL}/users/favourite-coaches`;
export const FORGOT_PASSWORD_API = `${BASE_URL}/users/forgot-password`;
export const SET_FAVOURITE_FIELDS_API = `${BASE_URL}/users/favourite-fields`;
export const REMOVE_FAVOURITE_FIELDS_API = `${BASE_URL}/users/favourite-fields`;
export const RESET_PASSWORD_API = `${BASE_URL}/users/reset-password`;
export const CHANGE_PASSWORD_API = `${BASE_URL}/users/change-password`;