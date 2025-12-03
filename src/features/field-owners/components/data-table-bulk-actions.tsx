import { type Table } from '@tanstack/react-table'
import { type FieldOwnerRequest, type FieldOwnerProfile, type FieldOwnerProfileApi } from '../data/schema'

type DataTableBulkActionsProps<TData> = {
  table: Table<TData>
}

export function DataTableBulkActions<TData extends FieldOwnerRequest | FieldOwnerProfile | FieldOwnerProfileApi>({
  table,
}: DataTableBulkActionsProps<TData>) {
  const selectedRows = table.getFilteredSelectedRowModel().rows

  if (selectedRows.length === 0) {
    return null
  }

  // Bulk actions can be implemented here if needed
  // For now, just return null as bulk actions are optional

  return null
}

