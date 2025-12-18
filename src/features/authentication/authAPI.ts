import { BASE_URL } from "../../utils/constant-value/constant";

export const LOGIN_API = `${BASE_URL}/auth/login`;
export const REGISTER_API = `${BASE_URL}/auth/register`;
export const GOOGLE_AUTH_API = `${BASE_URL}/auth/google/callback`;
export const GOOGLE_LOGIN_API = `${BASE_URL}/auth/google`;
export const LOGOUT_API = `${BASE_URL}/auth/logout`;
export const REFRESH_TOKEN_API = `${BASE_URL}/auth/refresh`;
export const VALIDATE_SESSION_API = `${BASE_URL}/auth/validate`;

export const FORGOT_PASSWORD_API = `${BASE_URL}/auth/forgot-password`;
export const RESET_PASSWORD_API = `${BASE_URL}/auth/reset-password`;
export const CHANGE_PASSWORD_API = `${BASE_URL}/users/change-password`;