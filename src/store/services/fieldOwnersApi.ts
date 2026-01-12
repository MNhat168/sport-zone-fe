import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import {
  fieldOwnerProfileListResponseSchema,
  type FieldOwnerProfileListResponse,
} from '@/features/field-owners/data/schema'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
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

// Helper function to recursively transform Date objects to ISO strings
// This ensures Redux state is serializable
function transformDatesToStrings<T>(obj: T): T {
  if (obj === null || obj === undefined) {
    return obj
  }

  if (obj instanceof Date) {
    return obj.toISOString() as T
  }

  if (Array.isArray(obj)) {
    return obj.map(transformDatesToStrings) as T
  }

  if (typeof obj === 'object' && obj.constructor === Object) {
    const transformed = {} as T
    for (const [key, value] of Object.entries(obj)) {
      ; (transformed as any)[key] = transformDatesToStrings(value)
    }
    return transformed
  }

  return obj
}

export const fieldOwnersApi = createApi({
  reducerPath: 'fieldOwnersApi',
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
        let parsed
        if (raw?.success && raw?.data) {
          // If API wraps response in { success: true, data: {...} }
          parsed = fieldOwnerProfileListResponseSchema.parse(raw.data)
        } else {
          // Otherwise, parse the response directly
          parsed = fieldOwnerProfileListResponseSchema.parse(response)
        }
        // Transform Date objects to ISO strings for Redux serialization
        return transformDatesToStrings(parsed)
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

    requestAdditionalInfo: builder.mutation<
      void,
      { id: string; message: string }
    >({
      query: ({ id, message }) => ({
        url: `/field-owner/admin/registration-requests/${id}/request-info`,
        method: 'POST',
        body: { message },
      }),
      invalidatesTags: ['RegistrationRequest'],
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
  useRequestAdditionalInfoMutation,
  useRejectFieldOwnerRegistrationMutation,
  useVerifyBankAccountMutation,
  useRejectBankAccountMutation,
} = fieldOwnersApi

