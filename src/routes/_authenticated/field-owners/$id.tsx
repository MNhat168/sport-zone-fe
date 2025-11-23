import { createFileRoute } from '@tanstack/react-router'
import { FieldOwnerDetail } from '@/features/field-owners/detail'

export const Route = createFileRoute('/_authenticated/field-owners/$id')({
  component: FieldOwnerDetail,
})

