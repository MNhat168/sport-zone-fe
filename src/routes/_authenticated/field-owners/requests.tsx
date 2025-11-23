import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { FieldOwnerRequests } from '@/features/field-owners/requests'
import { ownerTypes, registrationStatuses } from '@/features/field-owners/data/data'

const fieldOwnerRequestsSearchSchema = z.object({
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
  search: z.string().optional().catch(''),
})

export const Route = createFileRoute('/_authenticated/field-owners/requests')({
  validateSearch: fieldOwnerRequestsSearchSchema,
  component: FieldOwnerRequests,
})

