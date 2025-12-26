import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { type Row } from '@tanstack/react-table'
import { Ban, CheckCircle2 } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
            <span className='sr-only'>Mở menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='w-[160px]'>
          {!isSuspended ? (
            <DropdownMenuItem
              onClick={() => setSuspendDialogOpen(true)}
              disabled={suspendLoading}
            >
              Tạm ngưng
              <DropdownMenuShortcut>
                <Ban size={16} />
              </DropdownMenuShortcut>
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem
              onClick={() => setUnsuspendDialogOpen(true)}
              disabled={unsuspendLoading}
            >
              Gỡ tạm ngưng
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
            <AlertDialogTitle>Tạm ngưng người dùng</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc muốn tạm ngưng {account.email}? Việc này sẽ ngăn họ tạo hoặc chỉnh sửa tin.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className='space-y-4 py-4'>
            <div className='space-y-2'>
              <Label htmlFor='reason'>Lý do (không bắt buộc)</Label>
              <Textarea
                id='reason'
                placeholder='Nhập lý do tạm ngưng...'
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSuspend}
              disabled={suspendLoading}
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
            >
              {suspendLoading ? 'Đang tạm ngưng...' : 'Tạm ngưng'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Unsuspend Dialog */}
      <AlertDialog open={unsuspendDialogOpen} onOpenChange={setUnsuspendDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Gỡ tạm ngưng người dùng</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc muốn gỡ tạm ngưng {account.email}? Việc này sẽ khôi phục quyền tạo và chỉnh sửa tin.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleUnsuspend}
              disabled={unsuspendLoading}
            >
              {unsuspendLoading ? 'Đang gỡ tạm ngưng...' : 'Gỡ tạm ngưng'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

