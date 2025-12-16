import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { type Row } from '@tanstack/react-table'
import { Ban, CheckCircle2 } from 'lucide-react'
import { useState } from 'react'
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { suspendUser, unsuspendUser } from '../billingThunk'
import { toast } from 'sonner'
import { type OverdueAccount } from '../../../types/billing-type'

type DataTableRowActionsProps = {
  row: Row<OverdueAccount>
}

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
  const dispatch = useAppDispatch()
  const { suspendLoading, unsuspendLoading } = useAppSelector((state) => state.billing)
  const [suspendDialogOpen, setSuspendDialogOpen] = useState(false)
  const [unsuspendDialogOpen, setUnsuspendDialogOpen] = useState(false)
  const [suspendReason, setSuspendReason] = useState('')

  const account = row.original
  const isSuspended = account.subscriptionStatus === 'suspended'

  const handleSuspend = async () => {
    try {
      await dispatch(
        suspendUser({
          userId: account.userId,
          reason: suspendReason || undefined,
        })
      ).unwrap()
      toast.success(`User ${account.email} has been suspended`)
      setSuspendDialogOpen(false)
      setSuspendReason('')
    } catch (error: any) {
      toast.error(error?.message || 'Failed to suspend user')
    }
  }

  const handleUnsuspend = async () => {
    try {
      await dispatch(unsuspendUser({ userId: account.userId })).unwrap()
      toast.success(`User ${account.email} has been unsuspended`)
      setUnsuspendDialogOpen(false)
    } catch (error: any) {
      toast.error(error?.message || 'Failed to unsuspend user')
    }
  }

  return (
    <>
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
          {!isSuspended ? (
            <DropdownMenuItem
              onClick={() => setSuspendDialogOpen(true)}
              disabled={suspendLoading}
            >
              Suspend
              <DropdownMenuShortcut>
                <Ban size={16} />
              </DropdownMenuShortcut>
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem
              onClick={() => setUnsuspendDialogOpen(true)}
              disabled={unsuspendLoading}
            >
              Unsuspend
              <DropdownMenuShortcut>
                <CheckCircle2 size={16} />
              </DropdownMenuShortcut>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Suspend Dialog */}
      <AlertDialog open={suspendDialogOpen} onOpenChange={setSuspendDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Suspend User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to suspend {account.email}? This will prevent them from creating or editing listings.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className='space-y-4 py-4'>
            <div className='space-y-2'>
              <Label htmlFor='reason'>Reason (Optional)</Label>
              <Textarea
                id='reason'
                placeholder='Enter reason for suspension...'
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSuspend}
              disabled={suspendLoading}
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
            >
              {suspendLoading ? 'Suspending...' : 'Suspend'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Unsuspend Dialog */}
      <AlertDialog open={unsuspendDialogOpen} onOpenChange={setUnsuspendDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsuspend User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to unsuspend {account.email}? This will restore their access to create and edit listings.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleUnsuspend}
              disabled={unsuspendLoading}
            >
              {unsuspendLoading ? 'Unsuspending...' : 'Unsuspend'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

