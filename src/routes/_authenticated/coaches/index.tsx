import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { Coaches } from '@/features/coaches'

const coachesSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
  sports: z.array(z.string()).optional().catch([]),
  isVerified: z
    .array(z.enum(['verified', 'pending'] as const))
    .optional()
    .catch([]),
  search: z.string().optional().catch(''),
})

export const Route = createFileRoute('/_authenticated/coaches/')({
  validateSearch: (search) => coachesSearchSchema.parse(search),
  component: Coaches,
})
