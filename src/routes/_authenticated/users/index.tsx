import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { Users } from '@/features/users'
import { roleOptions } from '@/features/users/data/data'

const usersSearchSchema = z.object({
  page: z.number().optional().catch(1),
  limit: z.number().optional().catch(10),
  search: z.string().optional().catch(''),
  status: z
    .array(z.enum(['active', 'inactive']))
    .optional()
    .catch([]),
  role: z
    .array(z.enum(roleOptions.map((r) => r.value)))
    .optional()
    .catch([]),
  sortBy: z.enum(['fullName', 'email', 'createdAt', 'updatedAt']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
})

export const Route = createFileRoute('/_authenticated/users/')({
  validateSearch: usersSearchSchema,
  component: Users,
})
