import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

export interface BookingMonthlyStat {
  year: number
  month: number
  type: string
  count: number
}

export interface GetBookingMonthlyStatsParams {
  year?: number
}

export const dashboardApi = createApi({
  reducerPath: 'dashboardApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    credentials: 'include',
    prepareHeaders: (headers) => {
      headers.set('Content-Type', 'application/json')
      headers.set('X-Client-Type', 'admin') // Phân biệt FE admin với FE user
      return headers
    },
  }),
  tagTypes: ['Dashboard'],
  endpoints: (builder) => ({
    // Get booking monthly stats (field bookings only)
    getBookingMonthlyStats: builder.query<
      BookingMonthlyStat[],
      GetBookingMonthlyStatsParams
    >({
      query: (params) => {
        const searchParams = new URLSearchParams()
        if (params.year) {
          searchParams.set('year', params.year.toString())
        }
        const queryString = searchParams.toString()
        return `/admin/booking-monthly-stats/field${queryString ? `?${queryString}` : ''}`
      },
      providesTags: ['Dashboard'],
    }),
  }),
})

export const { useGetBookingMonthlyStatsQuery } = dashboardApi

