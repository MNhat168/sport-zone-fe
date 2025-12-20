import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { CoachRequests } from '@/features/coaches/requests'

const coachRequestsSearchSchema = z.object({
    page: z.number().optional().catch(1),
    pageSize: z.number().optional().catch(10),
    status: z
        .array(
            z.enum([
                'pending',
                'approved',
                'rejected',
            ] as const)
        )
        .optional()
        .catch([]),
    sports: z.array(z.string()).optional().catch([]),
    search: z.string().optional().catch(''),
})

export const Route = createFileRoute('/_authenticated/coaches/requests')({
    validateSearch: coachRequestsSearchSchema,
    component: CoachRequests,
})
