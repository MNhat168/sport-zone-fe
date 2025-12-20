import { z } from 'zod'

// Status schemas
export const registrationStatusSchema = z.enum(['pending', 'approved', 'rejected'])
export type RegistrationStatus = z.infer<typeof registrationStatusSchema>

// Personal info schema
const personalInfoSchema = z.object({
    fullName: z.string(),
    idNumber: z.string(),
    address: z.string(),
})

// Location coordinates schema
const coordinatesSchema = z.object({
    lat: z.number(),
    lng: z.number(),
})

// Coach Registration Request schema (matches backend CoachRegistrationResponseDto)
export const coachRegistrationRequestSchema = z.object({
    id: z.string(),
    userId: z.string(),
    status: registrationStatusSchema,
    personalInfo: personalInfoSchema,
    sports: z.array(z.string()),
    certification: z.string(),
    hourlyRate: z.number(),
    bio: z.string(),
    experience: z.string(),
    locationAddress: z.string(),
    locationCoordinates: coordinatesSchema.optional(),
    profilePhoto: z.string().url().optional(),
    certificationPhotos: z.array(z.string().url()),
    submittedAt: z.coerce.date(),
    processedAt: z.coerce.date().optional(),
    processedBy: z.string().optional(),
    rejectionReason: z.string().optional(),
})

export type CoachRegistrationRequest = z.infer<typeof coachRegistrationRequestSchema>

// Approval/Rejection request schemas
export const approveRequestSchema = z.object({
    notes: z.string().optional(),
})

export const rejectRequestSchema = z.object({
    reason: z.string().min(1, 'Rejection reason is required'),
})

export type ApproveRequest = z.infer<typeof approveRequestSchema>
export type RejectRequest = z.infer<typeof rejectRequestSchema>

// List response schemas
export const coachRegistrationRequestListSchema = z.array(coachRegistrationRequestSchema)

// Pagination schema
export const paginationSchema = z.object({
    total: z.number().optional(),
    page: z.number().optional(),
    limit: z.number().optional(),
    totalPages: z.number().optional(),
    hasNextPage: z.boolean().optional(),
    hasPrevPage: z.boolean().optional(),
})

export type Pagination = z.infer<typeof paginationSchema>
