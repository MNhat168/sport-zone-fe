import { z } from 'zod'

export const withdrawalRequestSchema = z.object({
    _id: z.string(),
    userId: z.string(),
    userRole: z.enum(['field_owner', 'coach']),
    amount: z.number(),
    status: z.enum(['pending', 'approved', 'rejected']),
    bankAccount: z.string().optional(),
    bankName: z.string().optional(),
    rejectionReason: z.string().optional(),
    approvedBy: z.string().optional(),
    approvedAt: z.string().or(z.date()).optional(),
    rejectedBy: z.string().optional(),
    rejectedAt: z.string().or(z.date()).optional(),
    adminNotes: z.string().optional(),
    createdAt: z.string().or(z.date()),
    updatedAt: z.string().or(z.date()),
    user: z.object({
        _id: z.string(),
        fullName: z.string(),
        email: z.string(),
        phone: z.string().optional(),
    }).optional(),
})

export type WithdrawalRequest = z.infer<typeof withdrawalRequestSchema>

export const withdrawalRequestListResponseSchema = z.object({
    data: z.array(withdrawalRequestSchema),
    total: z.number(),
    page: z.number(),
    limit: z.number(),
    totalPages: z.number(),
})

export type WithdrawalRequestListResponse = z.infer<typeof withdrawalRequestListResponseSchema>
