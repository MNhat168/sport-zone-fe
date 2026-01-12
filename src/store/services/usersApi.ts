import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { userListResponseSchema, type UserList } from '@/features/users/data/schema'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

export type GetUsersParams = {
  search?: string
  role?: string[]
  status?: string[]
  page?: number
  limit?: number
  sortBy?: 'fullName' | 'email' | 'createdAt' | 'updatedAt'
  sortOrder?: 'asc' | 'desc'
}

export type GetUsersResponse = UserList

export const usersApi = createApi({
  reducerPath: 'usersApi',
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
  endpoints: (builder) => ({
    getUsers: builder.query<GetUsersResponse, GetUsersParams>({
      query: (params) => {
        const searchParams = new URLSearchParams()
        if (params.search) searchParams.set('search', params.search)
        if (params.page) searchParams.set('page', params.page.toString())
        if (params.limit) searchParams.set('limit', params.limit.toString())
        if (params.sortBy) searchParams.set('sortBy', params.sortBy)
        if (params.sortOrder) searchParams.set('sortOrder', params.sortOrder)
        params.role?.forEach((value) => searchParams.append('role', value))
        params.status?.forEach((value) => searchParams.append('status', value))

        return `/users/list?${searchParams.toString()}`
      },
      transformResponse: (response: unknown) => {
        const parsed = userListResponseSchema.parse(response)
        return parsed.data
      },
    }),
  }),
})

export const { useGetUsersQuery } = usersApi

