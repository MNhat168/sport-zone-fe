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
  tagTypes: ['FieldOwner'],
  endpoints: (builder) => ({
    // Get field owner profiles (from /fields/admin/list-owner-profiles)
    getlistFieldOwnerProfiles: builder.query<FieldOwnerProfileListResponse, FieldOwnerProfileListParams>({
      query: (params) => {
        const searchParams = new URLSearchParams()
        if (params.page) searchParams.set('page', params.page.toString())
        if (params.limit) searchParams.set('limit', params.limit.toString())
        if (params.status) searchParams.set('status', params.status)
        if (params.ownerType) searchParams.set('ownerType', params.ownerType)
        if (params.search) searchParams.set('search', params.search)

        return `/fields/admin/list-owner-profiles?${searchParams.toString()}`
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
  }),
})

export const {
  useGetlistFieldOwnerProfilesQuery,
} = fieldOwnersApi

