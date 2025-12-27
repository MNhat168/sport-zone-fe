import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import {
    coachProfileListResponseSchema,
    type CoachProfileListResponse,
} from '@/features/coaches/data/schema'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
export interface CoachProfileListParams {
    page?: number
    limit?: number
    search?: string
    isVerified?: boolean
    sports?: string[]
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
}

export interface CoachRegistrationRequestListParams {
    page?: number
    limit?: number
}

export interface ApproveCoachRegistrationPayload {
    notes?: string
}

export interface RejectCoachRegistrationPayload {
    reason: string
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

export const coachesApi = createApi({
    reducerPath: 'coachesApi',
    baseQuery: fetchBaseQuery({
        baseUrl: API_BASE_URL,
        credentials: 'include',
        prepareHeaders: (headers) => {
            headers.set('Content-Type', 'application/json')
            headers.set('X-Client-Type', 'admin')
            return headers
        },
    }),
    tagTypes: ['Coach', 'CoachRegistrationRequest'],
    endpoints: (builder) => ({
        // Get coach profiles (approved coaches)
        getCoachProfiles: builder.query<CoachProfileListResponse, CoachProfileListParams>({
            query: (params) => {
                const searchParams = new URLSearchParams()
                if (params.page) searchParams.set('page', params.page.toString())
                if (params.limit) searchParams.set('limit', params.limit.toString())
                if (params.search) searchParams.set('search', params.search)
                if (params.isVerified !== undefined) searchParams.set('isVerified', params.isVerified.toString())
                if (params.sports && params.sports.length > 0) {
                    params.sports.forEach(sport => searchParams.append('sports', sport))
                }
                if (params.sortBy) searchParams.set('sortBy', params.sortBy)
                if (params.sortOrder) searchParams.set('sortOrder', params.sortOrder)

                return `/coaches/admin/profiles?${searchParams.toString()}`
            },
            transformResponse: (response: unknown) => {
                const raw = response as { success?: boolean; data?: unknown }
                let parsed
                if (raw?.success && raw?.data) {
                    parsed = coachProfileListResponseSchema.parse(raw.data)
                } else {
                    parsed = coachProfileListResponseSchema.parse(response)
                }
                return transformDatesToStrings(parsed)
            },
            providesTags: ['Coach'],
        }),

        // Get coach registration requests
        getCoachRegistrationRequests: builder.query<any, CoachRegistrationRequestListParams>({
            query: (params) => {
                const searchParams = new URLSearchParams()
                if (params.page) searchParams.set('page', params.page.toString())
                if (params.limit) searchParams.set('limit', params.limit.toString())
                return `/coaches/registration?${searchParams.toString()}`
            },
            transformResponse: (response: any) => {
                // Transform Date objects to ISO strings for Redux serialization
                return transformDatesToStrings(response)
            },
            providesTags: ['CoachRegistrationRequest'],
        }),

        // Get coach registration request by ID
        getCoachRegistrationRequest: builder.query<any, string>({
            query: (id) => `/coaches/registration/${id}`,
            providesTags: ['CoachRegistrationRequest'],
        }),

        // Approve coach registration request
        approveCoachRegistration: builder.mutation<any, { id: string; data: ApproveCoachRegistrationPayload }>({
            query: ({ id, data }) => ({
                url: `/coaches/registration/${id}/approve`,
                method: 'PATCH',
                body: data,
            }),
            invalidatesTags: ['CoachRegistrationRequest', 'Coach'],
        }),

        // Reject coach registration request
        rejectCoachRegistration: builder.mutation<any, { id: string; data: RejectCoachRegistrationPayload }>({
            query: ({ id, data }) => ({
                url: `/coaches/registration/${id}/reject`,
                method: 'PATCH',
                body: data,
            }),
            invalidatesTags: ['CoachRegistrationRequest'],
        }),
    }),
})

export const {
    useGetCoachProfilesQuery,
    useGetCoachRegistrationRequestsQuery,
    useGetCoachRegistrationRequestQuery,
    useApproveCoachRegistrationMutation,
    useRejectCoachRegistrationMutation,
} = coachesApi
