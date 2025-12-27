import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { fieldListResponseSchema, type FieldListResponse, type Field } from '@/features/fields/data/schema'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

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
            ;(transformed as any)[key] = transformDatesToStrings(value)
        }
        return transformed
    }

    return obj
}

export interface GetFieldsParams {
    page?: number
    limit?: number
    name?: string
    location?: string
    sportType?: string
    sportTypes?: string[]
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
}

export const fieldsApi = createApi({
    reducerPath: 'fieldsApi',
    baseQuery: fetchBaseQuery({
        baseUrl: API_BASE_URL,
        prepareHeaders: (headers) => {
            const token = localStorage.getItem('accessToken')
            if (token) {
                headers.set('Authorization', `Bearer ${token}`)
            }
            headers.set('X-Client-Type', 'admin')
            return headers
        },
    }),
    tagTypes: ['Fields'],
    endpoints: (builder) => ({
        getFields: builder.query<FieldListResponse, GetFieldsParams>({
            query: (params) => ({
                url: '/fields/paginated',
                params,
            }),
            transformResponse: (response: unknown) => {
                try {
                    // Handle API response format: { success: true, data: { fields: [...], pagination: {...} } }
                    // or direct format: { fields: [...], pagination: {...} }
                    const raw = response as { success?: boolean; data?: unknown }
                    let dataToParse: unknown
                    
                    if (raw?.success && raw?.data) {
                        // If API wraps response in { success: true, data: {...} }
                        dataToParse = raw.data
                    } else if ((raw as any)?.data && (raw as any)?.data?.fields) {
                        // If API wraps response in { data: { fields: [...], pagination: {...} } }
                        dataToParse = (raw as any).data
                    } else {
                        // Otherwise, parse the response directly
                        dataToParse = response
                    }

                    // Normalize operatingHours and priceRanges to handle different formats
                    if (dataToParse && typeof dataToParse === 'object' && 'fields' in dataToParse) {
                        const fieldsData = dataToParse as { fields?: unknown[]; pagination?: unknown }
                        if (Array.isArray(fieldsData.fields)) {
                            fieldsData.fields = fieldsData.fields.map((field: any) => {
                                if (field?.operatingHours && Array.isArray(field.operatingHours)) {
                                    // Filter out invalid operating hours entries
                                    field.operatingHours = field.operatingHours.filter((oh: any) => {
                                        // Keep entries that have at least day or start/end
                                        return oh && (oh.day !== undefined || oh.start !== undefined || oh.end !== undefined)
                                    })
                                }
                                if (field?.priceRanges && Array.isArray(field.priceRanges)) {
                                    // Filter out invalid price ranges entries
                                    field.priceRanges = field.priceRanges.filter((pr: any) => {
                                        // Keep entries that have at least day or start/end or multiplier
                                        return pr && (pr.day !== undefined || pr.start !== undefined || pr.end !== undefined || pr.multiplier !== undefined)
                                    })
                                }
                                return field
                            })
                        }
                    }

                    const parsed = fieldListResponseSchema.parse(dataToParse)
                    // Transform Date objects to ISO strings for Redux serialization
                    return transformDatesToStrings(parsed)
                } catch (error) {
                    console.error('Field list response validation error:', error)
                    console.error('Raw response:', response)
                    // Return a default structure to prevent crash
                    return {
                        fields: [],
                        pagination: {
                            total: 0,
                            page: 1,
                            limit: 10,
                            totalPages: 0,
                            hasNextPage: false,
                            hasPrevPage: false,
                        },
                    }
                }
            },
            providesTags: ['Fields'],
        }),

        toggleFieldVerification: builder.mutation<Field, { id: string; isAdminVerify: boolean }>({
            query: ({ id, isAdminVerify }) => ({
                url: `/fields/admin/${id}/verify`,
                method: 'PATCH',
                body: { isAdminVerify },
            }),
            invalidatesTags: ['Fields'],
        }),
    }),
})

export const {
    useGetFieldsQuery,
    useToggleFieldVerificationMutation,
} = fieldsApi
