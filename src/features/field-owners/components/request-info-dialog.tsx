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
import { useRequestAdditionalInfoMutation } from '@/store/services/fieldOwnersApi' // Ensure this is exported/updated
import { useFieldOwners } from './field-owners-provider'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

const formSchema = z.object({
    message: z.string().min(1, { message: 'Vui lòng nhập nội dung yêu cầu.' }),
})



export function RequestInfoDialog() {
    const { open, setOpen, currentRow } = useFieldOwners()
    const requestId = currentRow?.id || ''
    const applicantName = (currentRow as any)?.applicantName || (currentRow as any)?.userFullName || ''

    const [requestInfo, { isLoading }] = useRequestAdditionalInfoMutation()

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            message: '',
        },
    })

    function onSubmit(values: z.infer<typeof formSchema>) {
        requestInfo({ id: requestId, message: values.message })
            .unwrap()
            .then(() => {
                setOpen(null)
                form.reset()
                toast.success('Đã gửi yêu cầu bổ sung thông tin')
            })
            .catch(() => {
                toast.error('Có lỗi xảy ra khi gửi yêu cầu')
            })
    }

    return (
        <Dialog open={open === 'request-info'} onOpenChange={(isOpen) => !isOpen && setOpen(null)}>
            <DialogContent className='sm:max-w-[425px]'>
                <DialogHeader>
                    <DialogTitle>Yêu cầu bổ sung thông tin</DialogTitle>
                    <DialogDescription>
                        Gửi yêu cầu bổ sung thông tin cho {applicantName}. Người nộp đơn sẽ nhận được thông báo qua email.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className='grid gap-4 py-4'>
                        <FormField
                            control={form.control}
                            name='message'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nội dung yêu cầu</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder='Ví dụ: Vui lòng cung cấp hình ảnh rõ nét hơn của giấy phép kinh doanh...'
                                            className='resize-none'
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button type='button' variant='outline' onClick={() => setOpen(null)}>
                                Hủy
                            </Button>
                            <Button type='submit' disabled={isLoading}>
                                Gửi yêu cầu
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
