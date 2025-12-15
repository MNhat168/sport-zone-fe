import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { BillingManagementPage } from '@/pages/billing/billing-management-page'

const billingSearchSchema = z.object({
  page: z.coerce.number().optional().catch(1),
  limit: z.number().optional().catch(10),
  search: z.string().optional().catch(''),
})

export const Route = createFileRoute('/_authenticated/billing/')({
  validateSearch: billingSearchSchema,
  component: BillingManagementPage,
})

