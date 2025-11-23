import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { FieldOwners } from '@/features/field-owners'
import { ownerTypes, registrationStatuses } from '@/features/field-owners/data/data'

const fieldOwnersSearchSchema = z.object({
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
  ownerType: z
    .array(z.enum(ownerTypes.map((t) => t.value) as [string, ...string[]]))
    .optional()
    .catch([]),
  isVerified: z
    .array(z.enum(['verified', 'pending'] as const))
    .optional()
    .catch([]),
  search: z.string().optional().catch(''),
})

export const Route = createFileRoute('/_authenticated/field-owners/')({
  validateSearch: fieldOwnersSearchSchema,
  component: FieldOwners,
})

