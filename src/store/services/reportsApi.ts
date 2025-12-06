import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

export type ReportField = {
  _id?: string
  name?: string
  address?: string
}

export type ReportReporter = {
  _id?: string
  fullName?: string
  email?: string
  phoneNumber?: string
}

export type Report = {
  _id: string
  category: string
  status: 'open' | 'in_review' | 'resolved' | 'closed'
  field?: string | ReportField | null
  reporter?: string | ReportReporter | null
  subject?: string | null
  description?: string | null
  initialAttachments?: string[]
  createdAt: string
  updatedAt?: string
  lastActivityAt: string
}

export type ReportList = {
  data: Report[]
  total: number
  page: number
  limit: number
  totalPages: number
  hasNextPage: boolean
}

export type GetReportsParams = {
  status?: string[]
  category?: string[]
  search?: string
  page?: number
  limit?: number
}

export type ReportMessage = {
  _id: string
  senderRole: 'user'|'admin'
  content?: string
  attachments: string[]
  createdAt: string
}

export type ReportMessagesResponse = {
  data: ReportMessage[]
  total: number
  page: number
  limit: number
  totalPages: number
  hasNextPage: boolean
}

type ApiEnvelope<T> = T | { data: T }

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const isReportList = (value: unknown): value is ReportList =>
  isObject(value) &&
  Array.isArray(value.data) &&
  typeof value.total === 'number' &&
  typeof value.page === 'number'

const isReportDetail = (value: unknown): value is Report =>
  isObject(value) && typeof value._id === 'string' && typeof value.status === 'string'

const isReportMessages = (value: unknown): value is ReportMessagesResponse =>
  isObject(value) &&
  Array.isArray(value.data) &&
  typeof value.total === 'number' &&
  typeof value.page === 'number'

const unwrap = <T>(
  payload: ApiEnvelope<T>,
  guard: (value: unknown) => value is T
): T => {
  if (isObject(payload) && 'data' in payload) {
    const nested = (payload as { data: unknown }).data
    if (guard(nested)) return nested
  }
  return payload as T
}

export const reportsApi = createApi({
  reducerPath: 'reportsApi',
  baseQuery: fetchBaseQuery({ baseUrl: API_BASE_URL, credentials: 'include' }),
  tagTypes: ['Reports', 'Report', 'Messages'],
  endpoints: (builder) => ({
    getReports: builder.query<ReportList, GetReportsParams>({
      query: (params) => {
        const sp = new URLSearchParams()
        if (params.page) sp.set('page', String(params.page))
        if (params.limit) sp.set('limit', String(params.limit))
        if (params.search) sp.set('search', params.search)
        params.status?.forEach((s) => sp.append('status', s))
        params.category?.forEach((c) => sp.append('category', c))
        return `/admin/reports?${sp.toString()}`
      },
      providesTags: () => [{ type: 'Reports', id: 'LIST' }],
      transformResponse: (raw: ApiEnvelope<ReportList>) => unwrap(raw, isReportList),
    }),
    getReportById: builder.query<Report, string>({
      query: (id) => `/reports/${id}`,
      providesTags: (_result, _err, id) => [{ type: 'Report', id }],
      transformResponse: (raw: ApiEnvelope<Report>) => unwrap(raw, isReportDetail),
    }),
    getReportMessages: builder.query<
      ReportMessagesResponse,
      { id: string; page?: number; limit?: number }
    >({
      query: ({ id, page = 1, limit = 20 }) =>
        `/reports/${id}/messages?page=${page}&limit=${limit}`,
      providesTags: (_res, _err, arg) => [{ type: 'Messages', id: arg.id }],
      transformResponse: (raw: ApiEnvelope<ReportMessagesResponse>) =>
        unwrap(raw, isReportMessages),
    }),
    postAdminMessage: builder.mutation<
      unknown,
      { id: string; formData: FormData }
    >({
      query: ({ id, formData }) => ({
        url: `/admin/reports/${id}/messages`,
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: (_res, _err, arg) => [
        { type: 'Messages', id: arg.id },
        { type: 'Report', id: arg.id },
      ],
    }),
    updateReportStatus: builder.mutation<
      Report,
      { id: string; status: 'open' | 'in_review' | 'resolved' | 'closed' }
    >({
      query: ({ id, status }) => ({
        url: `/admin/reports/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: (_res, _err, arg) => [
        { type: 'Report', id: arg.id },
        { type: 'Reports', id: 'LIST' },
      ],
      transformResponse: (raw: ApiEnvelope<Report>) =>
        unwrap(raw, isReportDetail),
    }),
  }),
})

export const {
  useGetReportsQuery,
  useGetReportByIdQuery,
  useGetReportMessagesQuery,
  usePostAdminMessageMutation,
  useUpdateReportStatusMutation,
} = reportsApi