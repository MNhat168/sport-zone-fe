import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import {
  withdrawalRequestListResponseSchema,
  type WithdrawalRequestListResponse,
} from '@/features/withdrawals/data/schema'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

export interface WithdrawalRequestListParams {
  page?: number
  limit?: number
  status?: 'pending' | 'approved' | 'rejected'
  userRole?: 'field_owner' | 'coach'
}

export interface ApproveWithdrawalRequestPayload {
  notes?: string
}

export interface RejectWithdrawalRequestPayload {
  reason: string
}

export const withdrawalsApi = createApi({
  reducerPath: 'withdrawalsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers) => {
      headers.set('Content-Type', 'application/json')
      headers.set('X-Client-Type', 'admin')

      const token = sessionStorage.getItem('auth_access_token')
      if (token) {
        headers.set('Authorization', `Bearer ${token}`)
      }

      return headers
    },
  }),
  tagTypes: ['WithdrawalRequest'],
  endpoints: (builder) => ({
    // Get withdrawal requests list
    getWithdrawalRequests: builder.query<WithdrawalRequestListResponse, WithdrawalRequestListParams>({
      query: (params) => {
        const searchParams = new URLSearchParams()
        if (params.page) searchParams.set('page', params.page.toString())
        if (params.limit) searchParams.set('limit', params.limit.toString())
        if (params.status) searchParams.set('status', params.status)
        if (params.userRole) searchParams.set('userRole', params.userRole)

        return `/admin/withdrawal-requests?${searchParams.toString()}`
      },
      providesTags: ['WithdrawalRequest'],
      transformResponse: (response: any) => {
        return withdrawalRequestListResponseSchema.parse(response.data)
      },
    }),

    // Approve withdrawal request
    approveWithdrawalRequest: builder.mutation<
      { success: boolean; message: string; data: any },
      { id: string; data: ApproveWithdrawalRequestPayload }
    >({
      query: ({ id, data }) => ({
        url: `/admin/withdrawal-requests/${id}/approve`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['WithdrawalRequest'],
    }),

    // Reject withdrawal request
    rejectWithdrawalRequest: builder.mutation<
      { success: boolean; message: string; data: any },
      { id: string; data: RejectWithdrawalRequestPayload }
    >({
      query: ({ id, data }) => ({
        url: `/admin/withdrawal-requests/${id}/reject`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['WithdrawalRequest'],
    }),
  }),
})

export const {
  useGetWithdrawalRequestsQuery,
  useApproveWithdrawalRequestMutation,
  useRejectWithdrawalRequestMutation,
} = withdrawalsApi
