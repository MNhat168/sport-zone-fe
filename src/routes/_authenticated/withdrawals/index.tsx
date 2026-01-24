import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { Withdrawals } from '@/features/withdrawals/withdrawals'

const withdrawalsSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
  status: z.enum(['pending', 'approved', 'rejected']).optional(),
  userRole: z.enum(['field_owner', 'coach']).optional(),
  search: z.string().optional(),
})

export const Route = createFileRoute('/_authenticated/withdrawals/')({
  component: Withdrawals,
  validateSearch: (search) => withdrawalsSearchSchema.parse(search),
})
