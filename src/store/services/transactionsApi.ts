import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { transactionListResponseSchema, type TransactionList } from '@/features/transactions/data/schema'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

export type GetTransactionsParams = {
  search?: string
  status?: string[]
  type?: string[]
  method?: string[] // name dạng 'vnpay', 'payos', ...
  startDate?: string
  endDate?: string
  page?: number
  limit?: number
  sortBy?: 'createdAt' | 'amount' | 'status' | 'type' | 'method'
  sortOrder?: 'asc' | 'desc'
}

export type GetTransactionsResponse = TransactionList

export const transactionsApi = createApi({
  reducerPath: 'transactionsApi',
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
    getTransactions: builder.query<GetTransactionsResponse, GetTransactionsParams>({
      query: (params) => {
        const searchParams = new URLSearchParams()
        if (params.search) searchParams.set('search', params.search)
        if (params.page) searchParams.set('page', String(params.page))
        if (params.limit) searchParams.set('limit', String(params.limit))
        if (params.sortBy) searchParams.set('sortBy', params.sortBy)
        if (params.sortOrder) searchParams.set('sortOrder', params.sortOrder)
        if (params.startDate) searchParams.set('startDate', params.startDate)
        if (params.endDate) searchParams.set('endDate', params.endDate)
        params.status?.forEach((v) => searchParams.append('status', v))
        params.type?.forEach((v) => searchParams.append('type', v))
        params.method?.forEach((v) => searchParams.append('method', v))
        return `/admin/transactions?${searchParams.toString()}`
      },
      transformResponse: (response: unknown) => {
        // Chuẩn hóa các kiểu payload khác nhau từ BE về cùng 1 dạng TransactionList
        const raw = response as any

        // Case 1: ResponseInterceptor bọc dạng { success, data: { data, total, ... } }
        if (raw && raw.success && raw.data && Array.isArray(raw.data.data)) {
          return raw.data as GetTransactionsResponse
        }

        // Case 2: Endpoint trả trực tiếp payload { data, total, ... }
        if (raw && Array.isArray(raw.data) && typeof raw.total === 'number') {
          return raw as GetTransactionsResponse
        }

        // Case 3: Dùng zod để parse các biến thể còn lại
        const parsed = transactionListResponseSchema.safeParse(raw)
        if (parsed.success) {
          const value = parsed.data as any
          // Nếu đã là TransactionList (có data: Transaction[])
          if (Array.isArray(value.data)) {
            return value as GetTransactionsResponse
          }
          // Nếu được bọc thêm 1 lớp data nữa
          if (value.data && Array.isArray(value.data.data)) {
            return value.data as GetTransactionsResponse
          }
        }

        // Fallback cuối cùng: ép kiểu
        return raw as GetTransactionsResponse
      },
    }),
  }),
})

export const { useGetTransactionsQuery } = transactionsApi
