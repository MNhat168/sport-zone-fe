import { createFileRoute } from '@tanstack/react-router'
import RefundManagementPage from '@/features/refund-management/refund-management-page'

export const Route = createFileRoute('/_authenticated/refund-management/' as any)({
    component: RefundManagementPage,
})
