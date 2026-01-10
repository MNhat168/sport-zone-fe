import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { AuthUser } from '../slices/authSlice'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

export interface LoginRequest {
  email: string
  password: string
  rememberMe?: boolean
}

export interface LoginResponse {
  user: AuthUser
}

export interface ValidateSessionResponse {
  user: AuthUser
}

export interface RegisterRequest {
  email: string
  password: string
  fullName: string
}

export interface ForgotPasswordRequest {
  email: string
}

export interface ResetPasswordRequest {
  email: string
  verificationToken: string
  newPassword: string
}

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers) => {
      headers.set('Content-Type', 'application/json')
      headers.set('X-Client-Type', 'admin') // Phân biệt FE admin với FE user
      
      // Add Bearer token if available
      const token = sessionStorage.getItem('auth_access_token')
      if (token) {
        headers.set('Authorization', `Bearer ${token}`)
      }
      
      return headers
    },
  }),
  tagTypes: ['Auth'],
  endpoints: (builder) => ({
    // Login mutation - use fallback endpoint for Bearer token
    login: builder.mutation<LoginResponse & { accessToken: string; refreshToken: string }, LoginRequest>({
      query: (credentials) => ({
        url: '/auth/login-fallback',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['Auth'],
    }),

    // Validate session query
    validateSession: builder.query<ValidateSessionResponse, void>({
      query: () => '/auth/validate',
      providesTags: ['Auth'],
    }),

    // Logout mutation
    logout: builder.mutation<{ message: string }, void>({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
      invalidatesTags: ['Auth'],
    }),

    // Refresh token mutation - returns tokens in response body
    refreshToken: builder.mutation<{ message: string; accessToken?: string; refreshToken?: string }, void>({
      query: () => {
        const refreshToken = sessionStorage.getItem('auth_refresh_token')
        return {
          url: '/auth/refresh',
          method: 'POST',
          headers: refreshToken ? {
            'Authorization': `Bearer ${refreshToken}`,
          } : {},
        }
      },
    }),

    // Register mutation
    register: builder.mutation<{ message: string }, RegisterRequest>({
      query: (data) => ({
        url: '/auth/register',
        method: 'POST',
        body: data,
      }),
    }),

    // Forgot password mutation
    forgotPassword: builder.mutation<{ message: string }, ForgotPasswordRequest>({
      query: (data) => ({
        url: '/auth/forgot-password',
        method: 'POST',
        body: data,
      }),
    }),

    // Reset password mutation
    resetPassword: builder.mutation<{ message: string }, ResetPasswordRequest>({
      query: (data) => ({
        url: '/auth/reset-password',
        method: 'POST',
        body: data,
      }),
    }),

    // Google login mutation - use fallback endpoint for Bearer token
    loginWithGoogle: builder.mutation<LoginResponse & { accessToken: string; refreshToken: string }, { sign_in_token: string; rememberMe?: boolean }>({
      query: (data) => ({
        url: '/auth/google-fallback',
        method: 'POST',
        body: {
          token: data.sign_in_token,
          rememberMe: data.rememberMe,
        },
      }),
      invalidatesTags: ['Auth'],
    }),
  }),
})

export const {
  useLoginMutation,
  useValidateSessionQuery,
  useLazyValidateSessionQuery,
  useLogoutMutation,
  useRefreshTokenMutation,
  useRegisterMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useLoginWithGoogleMutation,
} = authApi
