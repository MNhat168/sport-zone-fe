import { createFileRoute } from '@tanstack/react-router'
import { ReportDetail } from '@/features/reports/detail'

export const Route = createFileRoute('/_authenticated/reports/$reportId')({
  component: ReportDetail,
})