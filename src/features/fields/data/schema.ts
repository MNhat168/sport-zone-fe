import { z } from 'zod'

// Field schema for approved/active fields
export const fieldSchema = z.object({
    id: z.string(),
    owner: z.string().optional(),
    name: z.string(),
    sportType: z.string().optional(),
    description: z.string().optional(),
    location: z.union([
        z.string(),
        z.object({
            address: z.string(),
            geo: z.object({
                type: z.literal('Point'),
                coordinates: z.array(z.number()),
            }).optional(),
        })
    ]).optional(),
    images: z.array(z.string()).optional(),
    operatingHours: z.array(z.object({
        day: z.union([z.string(), z.number()]).optional(),
        start: z.string().optional(),
        end: z.string().optional(),
        startTime: z.string().optional(),
        endTime: z.string().optional(),
        duration: z.number().optional(),
        isOpen: z.boolean().optional(),
    }).passthrough()).optional(),
    slotDuration: z.number().optional(),
    minSlots: z.number().optional(),
    maxSlots: z.number().optional(),
    priceRanges: z.array(z.object({
        day: z.union([z.string(), z.number()]).optional(),
        start: z.string().optional(),
        end: z.string().optional(),
        startTime: z.string().optional(),
        endTime: z.string().optional(),
        multiplier: z.number().optional(),
        price: z.number().optional(),
    }).passthrough()).optional(),
    basePrice: z.number(),
    price: z.string().optional(),
    isActive: z.boolean(),
    isAdminVerify: z.boolean(),
    maintenanceNote: z.string().optional(),
    maintenanceUntil: z.union([z.string(), z.coerce.date()]).optional(),
    rating: z.number().optional(),
    totalReviews: z.number().optional(),
    createdAt: z.union([z.string(), z.coerce.date()]).optional(),
    updatedAt: z.union([z.string(), z.coerce.date()]).optional(),
})

export type Field = z.infer<typeof fieldSchema>

// Pagination schema
export const paginationSchema = z.object({
    total: z.number(),
    page: z.number(),
    limit: z.number(),
    totalPages: z.number(),
    hasNextPage: z.boolean().optional(),
    hasPrevPage: z.boolean().optional(),
})

export type Pagination = z.infer<typeof paginationSchema>

// Field List Response schema
export const fieldListResponseSchema = z.object({
    fields: z.array(fieldSchema).default([]),
    pagination: paginationSchema.optional(),
})

export type FieldListResponse = z.infer<typeof fieldListResponseSchema>

export const fieldsSearchSchema = z.object({
    page: z.number().default(1).catch(1),
    pageSize: z.number().default(10).catch(10),
    search: z.string().optional(),
    sort: z.string().optional(),
    order: z.enum(['asc', 'desc']).optional(),
    isActive: z.union([z.string(), z.array(z.string())]).optional(),
    isVerified: z.union([z.string(), z.array(z.string())]).optional(),
})

export type FieldsSearch = z.infer<typeof fieldsSearchSchema>
