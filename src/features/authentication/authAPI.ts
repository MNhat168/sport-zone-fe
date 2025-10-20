import { BASE_URL } from "../../utils/constant-value/constant";

export const LOGIN_API = `${BASE_URL}/Auth/login`;
export const REGISTER_API = `${BASE_URL}/Auth/register`;
export const GOOGLE_AUTH_API = `${BASE_URL}/Auth/google/callback`;
export const GOOGLE_LOGIN_API = `${BASE_URL}/Auth/google`;
export const LOGOUT_API = `${BASE_URL}/Auth/logout`;
export const REFRESH_TOKEN_API = `${BASE_URL}/Auth/refresh`;
export const VALIDATE_SESSION_API = `${BASE_URL}/Auth/validate`;