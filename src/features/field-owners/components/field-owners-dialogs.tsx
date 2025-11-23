import { ApprovalDialog } from './approval-dialog'
import { useFieldOwners } from './field-owners-provider'

export function FieldOwnersDialogs() {
  const { open } = useFieldOwners()
  return (
    <>
      <ApprovalDialog />
    </>
  )
}

