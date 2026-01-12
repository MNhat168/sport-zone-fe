import { ApprovalDialog } from './approval-dialog'
import { RequestDetailDialog } from './request-detail-dialog'
import { ProfileDetailDialog } from './profile-detail-dialog'
import { RequestInfoDialog } from './request-info-dialog'
import { useFieldOwners } from './field-owners-provider'

export function FieldOwnersDialogs() {
  const { currentRow } = useFieldOwners()
  return (
    <>
      <ApprovalDialog
        key={`approval-${currentRow?.id}`}
      />
      <RequestInfoDialog
        key={`request-info-${currentRow?.id}`}
      />
      <RequestDetailDialog
        key={`request-detail-${currentRow?.id}`}
      />
      <ProfileDetailDialog
        key={`profile-detail-${currentRow?.id}`}
      />
    </>
  )
}
