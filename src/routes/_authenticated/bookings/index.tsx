import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { Bookings } from '@/features/bookings'
import { bookingStatuses, bookingTypes, paymentStatuses, approvalStatuses } from '@/features/bookings/data/data'

const bookingsSearchSchema = z.object({
  page: z.coerce.number().optional().catch(1),
  limit: z.number().optional().catch(20),
  search: z.string().optional().catch(''),
  courtId: z.string().optional().catch(''),
  status: z
    .array(z.enum(bookingStatuses.map((o) => o.value) as [string, ...string[]]))
    .optional()
    .catch([]),
  type: z
    .array(z.enum(bookingTypes.map((o) => o.value) as [string, ...string[]]))
    .optional()
    .catch([]),
  paymentStatus: z
    .array(z.enum(paymentStatuses.map((o) => o.value) as [string, ...string[]]))
    .optional()
    .catch([]),
  approvalStatus: z
    .array(z.enum(approvalStatuses.map((o) => o.value) as [string, ...string[]]))
    .optional()
    .catch([]),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  sortBy: z.enum(['createdAt', 'date', 'bookingAmount', 'status', 'type']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
})

export const Route = createFileRoute('/_authenticated/bookings/' as any)({
  validateSearch: bookingsSearchSchema,
  component: Bookings,
})

