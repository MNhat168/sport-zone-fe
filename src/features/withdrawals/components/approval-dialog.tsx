import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'
import { useWithdrawals } from './withdrawals-provider'
import {
  useApproveWithdrawalRequestMutation,
  useRejectWithdrawalRequestMutation,
} from '@/store/services/withdrawalsApi'
import { toast } from 'sonner'

const approveFormSchema = z.object({
  notes: z.string().optional(),
})

const rejectFormSchema = z.object({
  reason: z.string().min(1, 'Lý do từ chối là bắt buộc'),
})

type ApproveFormValues = z.infer<typeof approveFormSchema>
type RejectFormValues = z.infer<typeof rejectFormSchema>

const formatVND = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function ApprovalDialog() {
  const { open, setOpen, currentRow } = useWithdrawals()
  const [approveWithdrawal, { isLoading: isApproving }] =
    useApproveWithdrawalRequestMutation()
  const [rejectWithdrawal, { isLoading: isRejecting }] =
    useRejectWithdrawalRequestMutation()

  const isApproveOpen = open === 'approve'
  const isRejectOpen = open === 'reject'

  const approveForm = useForm<ApproveFormValues>({
    resolver: zodResolver(approveFormSchema),
    defaultValues: {
      notes: '',
    },
  })

  const rejectForm = useForm<RejectFormValues>({
    resolver: zodResolver(rejectFormSchema),
    defaultValues: {
      reason: '',
    },
  })

  const handleApprove = async (data: ApproveFormValues) => {
    if (!currentRow) return

    try {
      await approveWithdrawal({
        id: currentRow._id,
        data,
      }).unwrap()
      toast.success('Đã duyệt yêu cầu rút tiền thành công')
      setOpen(null)
      approveForm.reset()
    } catch (error: any) {
      toast.error(error?.data?.message || 'Không thể duyệt yêu cầu rút tiền')
    }
  }

  const handleReject = async (data: RejectFormValues) => {
    if (!currentRow) return

    try {
      await rejectWithdrawal({
        id: currentRow._id,
        data,
      }).unwrap()
      toast.success('Đã từ chối yêu cầu rút tiền')
      setOpen(null)
      rejectForm.reset()
    } catch (error: any) {
      toast.error(error?.data?.message || 'Không thể từ chối yêu cầu rút tiền')
    }
  }

  if (!currentRow) return null

  return (
    <>
      {/* Approve Dialog */}
      <Dialog open={isApproveOpen} onOpenChange={(open) => !open && setOpen(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Duyệt yêu cầu rút tiền</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn duyệt yêu cầu rút tiền này? Hệ thống sẽ trừ số dư và chuyển khoản.
            </DialogDescription>
          </DialogHeader>
          <Form {...approveForm}>
            <form onSubmit={approveForm.handleSubmit(handleApprove)}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium">Thông tin yêu cầu:</p>
                  <div className="bg-gray-50 p-3 rounded-lg space-y-1 text-sm">
                    <p><span className="font-medium">Người yêu cầu:</span> {currentRow.user?.fullName || 'N/A'}</p>
                    <p><span className="font-medium">Số tiền:</span> {formatVND(currentRow.amount)}</p>
                    {currentRow.bankAccount && (
                      <p><span className="font-medium">Tài khoản:</span> {currentRow.bankAccount} {currentRow.bankName ? `- ${currentRow.bankName}` : ''}</p>
                    )}
                  </div>
                </div>
                <FormField
                  control={approveForm.control}
                  name='notes'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ghi chú (tùy chọn)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder='Nhập ghi chú nếu có...'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => setOpen(null)}
                  disabled={isApproving}
                >
                  Hủy
                </Button>
                <Button type='submit' disabled={isApproving}>
                  {isApproving ? (
                    <>
                      <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                      Đang xử lý...
                    </>
                  ) : (
                    'Duyệt'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={isRejectOpen} onOpenChange={(open) => !open && setOpen(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Từ chối yêu cầu rút tiền</DialogTitle>
            <DialogDescription>
              Vui lòng nhập lý do từ chối yêu cầu rút tiền này.
            </DialogDescription>
          </DialogHeader>
          <Form {...rejectForm}>
            <form onSubmit={rejectForm.handleSubmit(handleReject)}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium">Thông tin yêu cầu:</p>
                  <div className="bg-gray-50 p-3 rounded-lg space-y-1 text-sm">
                    <p><span className="font-medium">Người yêu cầu:</span> {currentRow.user?.fullName || 'N/A'}</p>
                    <p><span className="font-medium">Số tiền:</span> {formatVND(currentRow.amount)}</p>
                  </div>
                </div>
                <FormField
                  control={rejectForm.control}
                  name='reason'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lý do từ chối *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder='Nhập lý do từ chối...'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => setOpen(null)}
                  disabled={isRejecting}
                >
                  Hủy
                </Button>
                <Button type='submit' variant='destructive' disabled={isRejecting}>
                  {isRejecting ? (
                    <>
                      <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                      Đang xử lý...
                    </>
                  ) : (
                    'Từ chối'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  )
}
