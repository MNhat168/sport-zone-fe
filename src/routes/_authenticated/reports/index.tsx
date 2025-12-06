import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { Reports } from '@/features/reports'

const searchSchema = z.object({
  page: z.coerce.number().optional().catch(1),
  limit: z.number().optional().catch(20),
  search: z.string().optional().catch(''),
  status: z.array(z.enum(['open','in_review','resolved','closed'])).optional().catch([]),
  category: z.array(z.string()).optional().catch([]),
})

export const Route = createFileRoute('/_authenticated/reports/')({
  validateSearch: searchSchema,
  component: Reports,
})