import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'
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
import { useCoaches } from './coaches-provider'
import {
    useApproveCoachRegistrationMutation,
    useRejectCoachRegistrationMutation,
} from '@/store/services/coachesApi'
import { toast } from 'sonner'
import { useNavigate } from '@tanstack/react-router'

const approveFormSchema = z.object({
    notes: z.string().optional(),
})

const rejectFormSchema = z.object({
    reason: z.string().min(1, 'Vui lòng nhập lý do từ chối'),
})

type ApproveFormValues = z.infer<typeof approveFormSchema>
type RejectFormValues = z.infer<typeof rejectFormSchema>

export function ApprovalDialog() {
    const { open, setOpen, currentRow } = useCoaches()
    const navigate = useNavigate()
    const [approveCoach, { isLoading: isApproving }] =
        useApproveCoachRegistrationMutation()
    const [rejectCoach, { isLoading: isRejecting }] =
        useRejectCoachRegistrationMutation()

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
        if (!currentRow || !('id' in currentRow)) return

        try {
            await approveCoach({
                id: currentRow.id,
                data,
            }).unwrap()
            toast.success('Đã duyệt đăng ký huấn luyện viên thành công')
            setOpen(null)
            approveForm.reset()
            navigate({ to: '/coaches/requests' })
        } catch (error: any) {
            toast.error(error?.data?.message || 'Không thể duyệt đăng ký')
        }
    }

    const handleReject = async (data: RejectFormValues) => {
        if (!currentRow || !('id' in currentRow)) return

        try {
            await rejectCoach({
                id: currentRow.id,
                data,
            }).unwrap()
            toast.success('Đã từ chối đăng ký huấn luyện viên')
            setOpen(null)
            rejectForm.reset()
            navigate({ to: '/coaches/requests' })
        } catch (error: any) {
            toast.error(error?.data?.message || 'Không thể từ chối đăng ký')
        }
    }

    if (!currentRow) return null

    return (
        <>
            {/* Approve Dialog */}
            <Dialog open={isApproveOpen} onOpenChange={(open) => !open && setOpen(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Duyệt đăng ký huấn luyện viên</DialogTitle>
                        <DialogDescription>
                            Bạn có chắc chắn muốn duyệt đăng ký huấn luyện viên này?
                            Hành động này sẽ kích hoạt tài khoản của họ.
                        </DialogDescription>
                    </DialogHeader>
                    <Form {...approveForm}>
                        <form onSubmit={approveForm.handleSubmit(handleApprove)}>
                            <FormField
                                control={approveForm.control}
                                name='notes'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Ghi chú (không bắt buộc)</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder='Thêm ghi chú cho việc duyệt này...'
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <DialogFooter className='mt-4'>
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
                                            Đang duyệt...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle className='mr-2 h-4 w-4' />
                                            Duyệt
                                        </>
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
                        <DialogTitle>Từ chối đăng ký huấn luyện viên</DialogTitle>
                        <DialogDescription>
                            Vui lòng cung cấp lý do từ chối đăng ký này. Người dùng
                            sẽ được thông báo về quyết định này.
                        </DialogDescription>
                    </DialogHeader>
                    <Form {...rejectForm}>
                        <form onSubmit={rejectForm.handleSubmit(handleReject)}>
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
                            <DialogFooter className='mt-4'>
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
                                            Đang từ chối...
                                        </>
                                    ) : (
                                        <>
                                            <XCircle className='mr-2 h-4 w-4' />
                                            Từ chối
                                        </>
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
