import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

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
    tagTypes: ['CoachRegistrationRequest'],
    endpoints: (builder) => ({
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
            invalidatesTags: ['CoachRegistrationRequest'],
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
    useGetCoachRegistrationRequestsQuery,
    useGetCoachRegistrationRequestQuery,
    useApproveCoachRegistrationMutation,
    useRejectCoachRegistrationMutation,
} = coachesApi
