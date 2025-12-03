import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { Transactions } from '@/features/transactions'
import { statusOptions, typeOptions, methodOptions } from '@/features/transactions/data/data'

const txSearchSchema = z.object({
  page: z.coerce.number().optional().catch(1),
  limit: z.number().optional().catch(10),
  search: z.string().optional().catch(''),
  status: z
    .array(z.enum(statusOptions.map((o) => o.value) as [string, ...string[]]))
    .optional()
    .catch([]),
  type: z
    .array(z.enum(typeOptions.map((o) => o.value) as [string, ...string[]]))
    .optional()
    .catch([]),
  method: z
    .array(z.enum(methodOptions.map((o) => o.value) as [string, ...string[]]))
    .optional()
    .catch([]),
  sortBy: z.enum(['createdAt', 'amount', 'status', 'type', 'method']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
})

export const Route = createFileRoute('/_authenticated/transactions/')({
  validateSearch: txSearchSchema,
  component: Transactions,
})
