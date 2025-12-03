import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { type Row } from '@tanstack/react-table'
import { Eye, CheckCircle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  type FieldOwnerRequest,
  type FieldOwnerProfile,
  type FieldOwnerProfileApi,
} from '../data/schema'
import { useFieldOwners } from './field-owners-provider'
import { useNavigate } from '@tanstack/react-router'

type DataTableRowActionsProps = {
  row: Row<FieldOwnerRequest | FieldOwnerProfile | FieldOwnerProfileApi>
}

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
  const { setOpen, setCurrentRow } = useFieldOwners()
  const navigate = useNavigate()

  const isRequestRow =
    'status' in row.original &&
    'documents' in row.original &&
    'personalInfo' in row.original &&
    'submittedAt' in row.original

  const isProfileRow =
    'facilityName' in row.original &&
    'isVerified' in row.original &&
    !('submittedAt' in row.original)

  const handleView = () => {
    // Open dialog for both requests and profiles
    if (isRequestRow || isProfileRow) {
      setCurrentRow(row.original as any)
      setOpen('view')
      return
    }

    // Fallback to navigation if neither type matches
    navigate({
      to: '/field-owners/$id',
      params: { id: row.original.id },
    } as any)
  }

  const handleApprove = () => {
    setCurrentRow(row.original)
    setOpen('approve')
  }

  const handleReject = () => {
    setCurrentRow(row.original)
    setOpen('reject')
  }

  const isRequest = 
    'status' in row.original && 
    row.original.status !== undefined &&
    (row.original.status === 'pending' || row.original.status === 'approved' || row.original.status === 'rejected')
  const status = isRequest && 'status' in row.original ? (row.original as FieldOwnerRequest).status : null

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          className='data-[state=open]:bg-muted flex h-8 w-8 p-0'
        >
          <DotsHorizontalIcon className='h-4 w-4' />
          <span className='sr-only'>Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-[160px]'>
        <DropdownMenuItem onClick={handleView}>
          View Details
          <DropdownMenuShortcut>
            <Eye size={16} />
          </DropdownMenuShortcut>
        </DropdownMenuItem>
        {isRequest && status === 'pending' && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleApprove} className='text-green-600'>
              Approve
              <DropdownMenuShortcut>
                <CheckCircle size={16} />
              </DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleReject} className='text-red-600'>
              Reject
              <DropdownMenuShortcut>
                <XCircle size={16} />
              </DropdownMenuShortcut>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

