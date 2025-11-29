import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import {
  fieldOwnerProfileListResponseSchema,
  type FieldOwnerProfileListResponse,
} from '@/features/field-owners/data/schema'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

export interface FieldOwnerProfileListParams {
  page?: number
  limit?: number
  status?: string
  ownerType?: string
  search?: string
}

export interface RegistrationRequestListParams {
  page?: number
  limit?: number
}

export interface ApproveRegistrationRequestPayload {
  notes?: string
}

export interface RejectRegistrationRequestPayload {
  reason: string
}

export interface VerifyBankAccountPayload {
  notes?: string
  rejectionReason?: string
}

export const fieldOwnersApi = createApi({
  reducerPath: 'fieldOwnersApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    credentials: 'include',
    prepareHeaders: (headers) => {
      headers.set('Content-Type', 'application/json')
      return headers
    },
  }),
  tagTypes: ['FieldOwner', 'RegistrationRequest', 'BankAccount'],
  endpoints: (builder) => ({
    // Get field owner profiles (from /field-owner/admin/profiles)
    getlistFieldOwnerProfiles: builder.query<FieldOwnerProfileListResponse, FieldOwnerProfileListParams>({
      query: (params) => {
        const searchParams = new URLSearchParams()
        if (params.page) searchParams.set('page', params.page.toString())
        if (params.limit) searchParams.set('limit', params.limit.toString())
        if (params.status) searchParams.set('status', params.status)
        if (params.ownerType) searchParams.set('ownerType', params.ownerType)
        if (params.search) searchParams.set('search', params.search)

        return `/field-owner/admin/profiles?${searchParams.toString()}`
      },
      transformResponse: (response: unknown) => {
        // Handle API response format: { success: true, data: { data: [...], pagination: {...} } }
        // or direct format: { data: [...], pagination: {...} }
        const raw = response as { success?: boolean; data?: unknown }
        if (raw?.success && raw?.data) {
          // If API wraps response in { success: true, data: {...} }
          return fieldOwnerProfileListResponseSchema.parse(raw.data)
        }
        // Otherwise, parse the response directly
        const parsed = fieldOwnerProfileListResponseSchema.parse(response)
        return parsed
      },
      providesTags: ['FieldOwner'],
    }),

    // Get registration requests
    getRegistrationRequests: builder.query<any, RegistrationRequestListParams>({
      query: (params) => {
        const searchParams = new URLSearchParams()
        if (params.page) searchParams.set('page', params.page.toString())
        if (params.limit) searchParams.set('limit', params.limit.toString())
        return `/field-owner/admin/registration-requests?${searchParams.toString()}`
      },
      providesTags: ['RegistrationRequest'],
    }),

    // Get registration request by ID
    getRegistrationRequest: builder.query<any, string>({
      query: (id) => `/field-owner/admin/registration-requests/${id}`,
      providesTags: ['RegistrationRequest'],
    }),

    // Approve registration request
    approveFieldOwnerRegistration: builder.mutation<any, { id: string; data: ApproveRegistrationRequestPayload }>({
      query: ({ id, data }) => ({
        url: `/field-owner/admin/registration-requests/${id}/approve`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['RegistrationRequest', 'FieldOwner'],
    }),

    // Reject registration request
    rejectFieldOwnerRegistration: builder.mutation<any, { id: string; data: RejectRegistrationRequestPayload }>({
      query: ({ id, data }) => ({
        url: `/field-owner/admin/registration-requests/${id}/reject`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['RegistrationRequest'],
    }),

    // Verify bank account
    verifyBankAccount: builder.mutation<any, { id: string; data: VerifyBankAccountPayload }>({
      query: ({ id, data }) => ({
        url: `/field-owner/admin/bank-accounts/${id}/verify`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['BankAccount', 'FieldOwner'],
    }),

    // Reject bank account
    rejectBankAccount: builder.mutation<any, { id: string; data: VerifyBankAccountPayload }>({
      query: ({ id, data }) => ({
        url: `/field-owner/admin/bank-accounts/${id}/reject`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['BankAccount'],
    }),
  }),
})

export const {
  useGetlistFieldOwnerProfilesQuery,
  useGetRegistrationRequestsQuery,
  useGetRegistrationRequestQuery,
  useApproveFieldOwnerRegistrationMutation,
  useRejectFieldOwnerRegistrationMutation,
  useVerifyBankAccountMutation,
  useRejectBankAccountMutation,
} = fieldOwnersApi

