import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { bookingListResponseSchema, type BookingList } from '@/features/bookings/data/schema'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

export type GetBookingsParams = {
  search?: string
  status?: string[]
  type?: string[]
  paymentStatus?: string[]
  approvalStatus?: string[]
  courtId?: string
  startDate?: string
  endDate?: string
  page?: number
  limit?: number
  sortBy?: 'createdAt' | 'date' | 'bookingAmount' | 'status' | 'type'
  sortOrder?: 'asc' | 'desc'
}

export type GetBookingsResponse = BookingList

export const bookingsApi = createApi({
  reducerPath: 'bookingsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    credentials: 'include',
    prepareHeaders: (headers) => {
      headers.set('Content-Type', 'application/json')
      headers.set('X-Client-Type', 'admin') // Phân biệt FE admin với FE user
      return headers
    },
  }),
  tagTypes: ['Bookings'],
  endpoints: (builder) => ({
    getBookings: builder.query<GetBookingsResponse, GetBookingsParams>({
      query: (params) => {
        const searchParams = new URLSearchParams()
        if (params.search) searchParams.set('search', params.search)
        if (params.page) searchParams.set('page', String(params.page))
        if (params.limit) searchParams.set('limit', String(params.limit))
        if (params.sortBy) searchParams.set('sortBy', params.sortBy)
        if (params.sortOrder) searchParams.set('sortOrder', params.sortOrder)
        if (params.startDate) searchParams.set('startDate', params.startDate)
        if (params.endDate) searchParams.set('endDate', params.endDate)
        if (params.courtId) searchParams.set('courtId', params.courtId)
        params.status?.forEach((v) => searchParams.append('status', v))
        params.type?.forEach((v) => searchParams.append('type', v))
        params.paymentStatus?.forEach((v) => searchParams.append('paymentStatus', v))
        params.approvalStatus?.forEach((v) => searchParams.append('approvalStatus', v))
        return `/admin/bookings?${searchParams.toString()}`
      },
      transformResponse: (response: unknown) => {
        const raw = response as any

        // Case 1: ResponseInterceptor bọc dạng { success, data: { data, total, ... } }
        if (raw && raw.success && raw.data && Array.isArray(raw.data.data)) {
          return raw.data as GetBookingsResponse
        }

        // Case 2: Endpoint trả trực tiếp payload { data, total, ... }
        if (raw && Array.isArray(raw.data) && typeof raw.total === 'number') {
          return raw as GetBookingsResponse
        }

        // Case 3: Dùng zod để parse các biến thể còn lại
        const parsed = bookingListResponseSchema.safeParse(raw)
        if (parsed.success) {
          const value = parsed.data as any
          if (Array.isArray(value.data)) {
            return value as GetBookingsResponse
          }
          if (value.data && Array.isArray(value.data.data)) {
            return value.data as GetBookingsResponse
          }
        }

        // Fallback cuối cùng: ép kiểu
        return raw as GetBookingsResponse
      },
      providesTags: ['Bookings'],
    }),
  }),
})

export const { useGetBookingsQuery } = bookingsApi

