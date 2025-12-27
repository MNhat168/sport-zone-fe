import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { Fields } from '@/features/fields'

const fieldsSearchSchema = z.object({
  page: z.number().default(1).catch(1),
  pageSize: z.number().default(10).catch(10),
  search: z.string().optional(),
  sort: z.string().optional(),
  order: z.enum(['asc', 'desc']).optional(),
  isActive: z.union([z.string(), z.array(z.string())]).optional(),
  isVerified: z.union([z.string(), z.array(z.string())]).optional(),
})

export const Route = createFileRoute('/_authenticated/fields/')({
  component: Fields,
  validateSearch: (search) => fieldsSearchSchema.parse(search),
})
