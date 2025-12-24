import { createFileRoute } from '@tanstack/react-router'
import Statistics from '@/features/admin/statistics'

export const Route = createFileRoute('/_authenticated/admin/statistics/')({
    component: Statistics,
})
