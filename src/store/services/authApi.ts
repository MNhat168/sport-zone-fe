import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { AuthUser } from '../slices/authSlice'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

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
    credentials: 'include', // Quan trọng: gửi cookies trong mỗi request
    prepareHeaders: (headers) => {
      headers.set('Content-Type', 'application/json')
      return headers
    },
  }),
  tagTypes: ['Auth'],
  endpoints: (builder) => ({
    // Login mutation
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: '/auth/login',
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

    // Refresh token mutation
    refreshToken: builder.mutation<{ message: string }, void>({
      query: () => ({
        url: '/auth/refresh',
        method: 'POST',
      }),
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

    // Google login mutation
    loginWithGoogle: builder.mutation<LoginResponse, { sign_in_token: string; rememberMe?: boolean }>({
      query: (data) => ({
        url: '/auth/google',
        method: 'POST',
        body: data,
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
