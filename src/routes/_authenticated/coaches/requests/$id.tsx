import { createFileRoute } from '@tanstack/react-router'
import { CoachDetail } from '@/features/coaches/detail'

export const Route = createFileRoute('/_authenticated/coaches/requests/$id')({
    component: CoachDetail,
})
