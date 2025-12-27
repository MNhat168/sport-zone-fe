import { useMemo, useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { MapPin, Star, CheckCircle, XCircle, DollarSign, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useFields } from './fields-provider'
import { type Field } from '../data/schema'
import { useToggleFieldVerificationMutation } from '@/store/services/fieldsApi'
import { toast } from 'sonner'

export function FieldDetailDialog() {
    const { open, setOpen, currentRow } = useFields()
    const [toggleVerification, { isLoading }] = useToggleFieldVerificationMutation()
    const [isVerifying, setIsVerifying] = useState(false)

    const field = useMemo(() => {
        if (currentRow && 'name' in currentRow) {
            return currentRow as Field
        }
        return null
    }, [currentRow])

    const isOpen = open === 'view' && !!field

    const handleClose = () => {
        setOpen(null)
    }

    const handleToggleVerification = async () => {
        if (!field) return

        setIsVerifying(true)
        try {
            await toggleVerification({
                id: field.id,
                isAdminVerify: !field.isAdminVerify,
            }).unwrap()

            toast.success(
                field.isAdminVerify
                    ? 'Đã hủy xác minh sân thành công'
                    : 'Đã xác minh sân thành công'
            )
            handleClose()
        } catch (error) {
            console.error('Toggle verification error:', error)
            toast.error('Có lỗi xảy ra khi cập nhật trạng thái xác minh')
        } finally {
            setIsVerifying(false)
        }
    }

    if (!field) return null

    const location = typeof field.location === 'string'
        ? field.location
        : field.location?.address || ''

    return (
        <Dialog open={isOpen} onOpenChange={(nextOpen) => !nextOpen && handleClose()}>
            <DialogContent className='max-w-[calc(100%-2rem)] sm:max-w-6xl'>
                <DialogHeader>
                    <DialogTitle>Chi tiết sân</DialogTitle>
                    <DialogDescription>
                        Xem thông tin chi tiết về sân và trạng thái xác minh.
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className='max-h-[70vh] pe-3'>
                    <div className='space-y-6'>
                        {/* Header Section */}
                        <section className='space-y-4'>
                            <div className='flex flex-wrap items-center justify-between gap-4'>
                                <div>
                                    <p className='text-sm text-muted-foreground'>Sân thể thao</p>
                                    <p className='text-xl font-semibold'>{field.name}</p>
                                    {field.sportType && (
                                        <Badge variant='secondary' className='mt-1'>
                                            {field.sportType}
                                        </Badge>
                                    )}
                                </div>
                                <div className='flex flex-wrap items-center gap-2'>
                                    <Badge
                                        variant='outline'
                                        className={cn(
                                            field.isActive
                                                ? 'bg-green-500/10 text-green-600 border-green-500/20'
                                                : 'bg-gray-500/10 text-gray-600 border-gray-500/20'
                                        )}
                                    >
                                        {field.isActive ? 'Hoạt động' : 'Không hoạt động'}
                                    </Badge>
                                    <Badge
                                        variant='outline'
                                        className={cn(
                                            field.isAdminVerify
                                                ? 'bg-blue-500/10 text-blue-600 border-blue-500/20'
                                                : 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20'
                                        )}
                                    >
                                        {field.isAdminVerify ? (
                                            <>
                                                <CheckCircle className='h-3 w-3 mr-1' />
                                                Đã xác minh
                                            </>
                                        ) : (
                                            <>
                                                <XCircle className='h-3 w-3 mr-1' />
                                                Chưa xác minh
                                            </>
                                        )}
                                    </Badge>
                                </div>
                            </div>
                        </section>

                        <Separator />

                        {/* Main Content */}
                        <section className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                            {/* Left Column */}
                            <div className='space-y-4'>
                                <div className='rounded-md border p-6 space-y-4'>
                                    <h3 className='text-sm font-semibold'>Thông tin cơ bản</h3>

                                    {location && (
                                        <div className='flex items-start gap-2'>
                                            <MapPin className='h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0' />
                                            <div>
                                                <p className='text-xs text-muted-foreground mb-1'>Địa điểm</p>
                                                <p className='text-sm'>{location}</p>
                                            </div>
                                        </div>
                                    )}

                                    <div className='flex items-start gap-2'>
                                        <DollarSign className='h-4 w-4 text-muted-foreground mt-0.5' />
                                        <div>
                                            <p className='text-xs text-muted-foreground mb-1'>Giá cơ bản</p>
                                            <p className='text-sm font-medium'>
                                                {field.price || field.basePrice.toLocaleString('vi-VN') + ' VNĐ'}
                                            </p>
                                        </div>
                                    </div>

                                    {field.slotDuration && (
                                        <div className='flex items-start gap-2'>
                                            <Clock className='h-4 w-4 text-muted-foreground mt-0.5' />
                                            <div>
                                                <p className='text-xs text-muted-foreground mb-1'>Thời gian slot</p>
                                                <p className='text-sm'>{field.slotDuration} phút</p>
                                            </div>
                                        </div>
                                    )}

                                    {field.description && (
                                        <div>
                                            <p className='text-xs text-muted-foreground mb-1'>Mô tả</p>
                                            <p className='text-sm'>{field.description}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Rating */}
                                {(field.rating !== undefined || field.totalReviews !== undefined) && (
                                    <div className='rounded-md border p-6 space-y-4'>
                                        <h3 className='text-sm font-semibold'>Đánh giá</h3>
                                        <div className='flex items-center gap-2'>
                                            <Star className='h-5 w-5 text-yellow-500 fill-yellow-500' />
                                            <div>
                                                <p className='font-medium text-lg'>
                                                    {field.rating ? field.rating.toFixed(1) : '—'} / 5.0
                                                </p>
                                                <p className='text-sm text-muted-foreground'>
                                                    {field.totalReviews || 0} nhận xét
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Right Column - Images */}
                            <div className='space-y-4'>
                                <div className='rounded-md border p-6'>
                                    <h3 className='text-sm font-semibold mb-4'>Hình ảnh</h3>
                                    {field.images && field.images.length > 0 ? (
                                        <div className='grid grid-cols-2 gap-2'>
                                            {field.images.map((img, index) => (
                                                <img
                                                    key={index}
                                                    src={img}
                                                    alt={`${field.name} ${index + 1}`}
                                                    className='w-full h-32 object-cover rounded-md'
                                                />
                                            ))}
                                        </div>
                                    ) : (
                                        <p className='text-sm text-muted-foreground'>Không có hình ảnh</p>
                                    )}
                                </div>
                            </div>
                        </section>
                    </div>
                </ScrollArea>

                <DialogFooter>
                    <Button
                        variant={field.isAdminVerify ? 'destructive' : 'default'}
                        onClick={handleToggleVerification}
                        disabled={isLoading || isVerifying}
                    >
                        {isVerifying
                            ? 'Đang xử lý...'
                            : field.isAdminVerify
                                ? 'Hủy xác minh'
                                : 'Xác minh sân'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
