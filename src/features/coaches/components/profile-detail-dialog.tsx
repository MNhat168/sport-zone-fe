import { useMemo } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { CalendarDays, Mail, MapPin, Phone, Star, ShieldCheck, ShieldX, Award, Trophy } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCoaches } from './coaches-provider'
import { type CoachProfile } from '../data/schema'

export function ProfileDetailDialog() {
    const { open, setOpen, currentRow } = useCoaches()

    const profile = useMemo(() => {
        if (
            currentRow &&
            'fullName' in currentRow &&
            'sports' in currentRow &&
            'rating' in currentRow &&
            !('submittedAt' in currentRow)
        ) {
            return currentRow as CoachProfile
        }
        return null
    }, [currentRow])

    const isOpen = open === 'view' && !!profile

    const handleClose = () => {
        setOpen(null)
    }

    const createdAt = profile?.createdAt
        ? new Date(profile.createdAt).toLocaleString('vi-VN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
        : ''

    if (!profile) return null

    return (
        <Dialog open={isOpen} onOpenChange={(nextOpen) => !nextOpen && handleClose()}>
            <DialogContent className='max-w-[calc(100%-2rem)] sm:max-w-6xl'>
                <DialogHeader>
                    <DialogTitle>Hồ sơ huấn luyện viên</DialogTitle>
                    <DialogDescription>
                        Xem thông tin chi tiết về huấn luyện viên.
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className='max-h-[70vh] pe-3'>
                    <div className='space-y-6'>
                        {/* Header Section */}
                        <section className='space-y-4'>
                            <div className='flex flex-wrap items-center justify-between gap-4'>
                                <div className='flex items-center gap-4'>
                                    {profile.avatarUrl ? (
                                        <img
                                            src={profile.avatarUrl}
                                            alt={profile.fullName}
                                            className='w-16 h-16 rounded-full object-cover border-2 border-border'
                                        />
                                    ) : (
                                        <div className='w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center border-2 border-border'>
                                            <span className='text-2xl font-bold text-primary'>
                                                {profile.fullName.charAt(0)}
                                            </span>
                                        </div>
                                    )}
                                    <div>
                                        <p className='text-sm text-muted-foreground'>Huấn luyện viên</p>
                                        <p className='text-xl font-semibold'>{profile.fullName}</p>
                                        {profile.rank && (
                                            <Badge variant='secondary' className='mt-1'>
                                                <Trophy className='h-3 w-3 mr-1' />
                                                {profile.rank}
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                                <div className='flex flex-wrap items-center gap-2'>
                                    <Badge
                                        variant='outline'
                                        className={cn(
                                            profile.bankVerified
                                                ? 'bg-green-500/10 text-green-600 dark:text-green-500 border-green-500/20'
                                                : 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-500 border-yellow-500/20'
                                        )}
                                    >
                                        {profile.bankVerified ? (
                                            <>
                                                <ShieldCheck className='h-3 w-3 mr-1' />
                                                Đã xác minh
                                            </>
                                        ) : (
                                            <>
                                                <ShieldX className='h-3 w-3 mr-1' />
                                                Đang chờ
                                            </>
                                        )}
                                    </Badge>
                                </div>
                            </div>
                            <div className='flex flex-wrap items-center gap-6 text-sm text-muted-foreground'>
                                {createdAt && (
                                    <div className='flex items-center gap-2'>
                                        <CalendarDays className='h-4 w-4' />
                                        Tham gia:&nbsp;
                                        <span className='font-medium text-foreground'>{createdAt}</span>
                                    </div>
                                )}
                                <div className='flex items-center gap-2'>
                                    <Award className='h-4 w-4' />
                                    Buổi tập hoàn thành:&nbsp;
                                    <span className='font-medium text-foreground'>{profile.completedSessions}</span>
                                </div>
                            </div>
                        </section>

                        <Separator />

                        {/* Main Content - 3 Column Grid Layout */}
                        <section className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                            {/* Left Column: Contact Information */}
                            <div className='space-y-2'>
                                <p className='text-sm font-semibold text-muted-foreground'>
                                    Thông tin liên hệ
                                </p>
                                <div className='rounded-md border p-6 space-y-4'>
                                    {profile.email && (
                                        <div className='flex items-start gap-2'>
                                            <Mail className='h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0' />
                                            <div className='flex-1 min-w-0'>
                                                <p className='text-xs text-muted-foreground mb-1'>Email</p>
                                                <p className='font-medium text-base break-words'>
                                                    {profile.email}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                    {profile.phone && (
                                        <div className='flex items-start gap-2'>
                                            <Phone className='h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0' />
                                            <div className='flex-1 min-w-0'>
                                                <p className='text-xs text-muted-foreground mb-1'>Số điện thoại</p>
                                                <p className='font-medium text-base break-words'>
                                                    {profile.phone}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                    {profile.location && (
                                        <div className='flex items-start gap-2'>
                                            <MapPin className='h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0' />
                                            <div className='flex-1 min-w-0'>
                                                <p className='text-xs text-muted-foreground mb-1'>Địa điểm</p>
                                                <p className='font-medium text-base break-words'>
                                                    {typeof profile.location === 'string'
                                                        ? profile.location
                                                        : profile.location.address}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Middle Column: Professional Details */}
                            <div className='space-y-6'>
                                <div className='space-y-2'>
                                    <p className='text-sm font-semibold text-muted-foreground'>
                                        Chi tiết chuyên môn
                                    </p>
                                    <div className='rounded-md border p-6 space-y-4'>
                                        <div>
                                            <p className='text-xs text-muted-foreground mb-1'>Giá/giờ</p>
                                            <p className='font-medium text-lg text-primary'>
                                                {profile.hourlyRate.toLocaleString('vi-VN')} VNĐ
                                            </p>
                                        </div>
                                        {profile.experience && (
                                            <div>
                                                <p className='text-xs text-muted-foreground mb-1'>Kinh nghiệm</p>
                                                <p className='font-medium text-base break-words'>
                                                    {profile.experience}
                                                </p>
                                            </div>
                                        )}
                                        {profile.certification && (
                                            <div>
                                                <p className='text-xs text-muted-foreground mb-1'>Chứng chỉ</p>
                                                <p className='font-medium text-base break-words'>
                                                    {profile.certification}
                                                </p>
                                            </div>
                                        )}
                                        {profile.bio && (
                                            <div>
                                                <p className='text-xs text-muted-foreground mb-1'>Giới thiệu</p>
                                                <p className='font-medium text-base break-words'>
                                                    {profile.bio}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Rating & Reviews */}
                                <div className='space-y-2'>
                                    <p className='text-sm font-semibold text-muted-foreground'>
                                        Đánh giá & Nhận xét
                                    </p>
                                    <div className='rounded-md border p-6 space-y-4'>
                                        <div className='flex items-center gap-2'>
                                            <Star className='h-5 w-5 text-yellow-500 fill-yellow-500' />
                                            <div>
                                                <p className='text-xs text-muted-foreground mb-1'>Điểm đánh giá</p>
                                                <p className='font-medium text-lg'>
                                                    {profile.rating.toFixed(1)} / 5.0
                                                </p>
                                            </div>
                                        </div>
                                        <div>
                                            <p className='text-xs text-muted-foreground mb-1'>Tổng số nhận xét</p>
                                            <p className='font-medium text-base'>{profile.totalReviews} nhận xét</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Sports */}
                            <div className='space-y-6'>
                                {/* Supported Sports */}
                                {profile.sports && profile.sports.length > 0 && (
                                    <div className='space-y-2'>
                                        <p className='text-sm font-semibold text-muted-foreground'>
                                            Môn thể thao
                                        </p>
                                        <div className='rounded-md border p-6'>
                                            <div className='flex flex-wrap gap-2'>
                                                {profile.sports.map((sport, index) => (
                                                    <Badge key={index} variant='outline'>
                                                        {sport}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    )
}
