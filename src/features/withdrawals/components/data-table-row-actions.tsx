import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { type Row } from '@tanstack/react-table'
import { CheckCircle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { type WithdrawalRequest } from '../data/schema'
import { useWithdrawals } from './withdrawals-provider'

type DataTableRowActionsProps = {
  row: Row<WithdrawalRequest>
}

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
  const { setOpen, setCurrentRow } = useWithdrawals()

  const handleApprove = () => {
    setCurrentRow(row.original)
    setOpen('approve')
  }

  const handleReject = () => {
    setCurrentRow(row.original)
    setOpen('reject')
  }

  const status = row.original.status

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          className='data-[state=open]:bg-muted flex h-8 w-8 p-0'
        >
          <DotsHorizontalIcon className='h-4 w-4' />
          <span className='sr-only'>Mở menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-[160px]'>
        {status === 'pending' && (
          <>
            <DropdownMenuItem onClick={handleApprove} className='text-green-600'>
              Duyệt
              <DropdownMenuShortcut>
                <CheckCircle size={16} />
              </DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleReject} className='text-red-600'>
              Từ chối
              <DropdownMenuShortcut>
                <XCircle size={16} />
              </DropdownMenuShortcut>
            </DropdownMenuItem>
          </>
        )}
        {status !== 'pending' && (
          <DropdownMenuItem disabled>
            {status === 'approved' ? 'Đã duyệt' : 'Đã từ chối'}
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
