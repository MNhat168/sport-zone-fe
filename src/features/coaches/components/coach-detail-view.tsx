import { useParams, useNavigate } from '@tanstack/react-router'
import { ArrowLeft, CheckCircle, XCircle, User, Award, MapPin, DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useGetCoachRegistrationRequestQuery } from '@/store/services/coachesApi'
import { statusColors } from '../data/data'
import { cn } from '@/lib/utils'
import { useCoaches } from './coaches-provider'

export function CoachDetailView() {
    const { id } = useParams({ strict: false })
    const navigate = useNavigate()
    const { setOpen, setCurrentRow } = useCoaches()

    const { data, isLoading, error } = useGetCoachRegistrationRequestQuery(id as string, {
        skip: !id,
    })

    const coach = data?.data

    if (isLoading) {
        return (
            <div className='space-y-4'>
                <Skeleton className='h-10 w-48' />
                <Skeleton className='h-96 w-full' />
            </div>
        )
    }

    if (error || !coach) {
        return (
            <div className='flex flex-col items-center justify-center h-96'>
                <p className='text-muted-foreground'>
                    {error ? 'Không thể tải chi tiết huấn luyện viên' : 'Không tìm thấy huấn luyện viên'}
                </p>
                <Button
                    variant='outline'
                    onClick={() => navigate({ to: '/coaches/requests' as any })}
                    className='mt-4'
                >
                    <ArrowLeft className='mr-2 h-4 w-4' />
                    Về danh sách
                </Button>
            </div>
        )
    }

    const isPending = coach.status === 'pending'

    return (
        <div className='space-y-6'>
            <div className='flex items-center justify-between'>
                <div className='flex items-center gap-4'>
                    <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => navigate({ to: '/coaches/requests' as any })}
                    >
                        <ArrowLeft className='mr-2 h-4 w-4' />
                        Quay lại
                    </Button>
                    <div>
                        <h2 className='text-2xl font-bold tracking-tight'>
                            Chi tiết đăng ký huấn luyện viên
                        </h2>
                        <p className='text-muted-foreground'>
                            Xem xét hồ sơ và chứng chỉ của huấn luyện viên
                        </p>
                    </div>
                </div>
                {isPending && (
                    <div className='flex gap-2'>
                        <Button
                            variant='outline'
                            onClick={() => {
                                setCurrentRow(coach)
                                setOpen('approve')
                            }}
                        >
                            <CheckCircle className='mr-2 h-4 w-4' />
                            Duyệt
                        </Button>
                        <Button
                            variant='destructive'
                            onClick={() => {
                                setCurrentRow(coach)
                                setOpen('reject')
                            }}
                        >
                            <XCircle className='mr-2 h-4 w-4' />
                            Từ chối
                        </Button>
                    </div>
                )}
            </div>

            <div className='grid gap-6 md:grid-cols-2'>
                {/* Personal Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className='flex items-center gap-2'>
                            <User className='h-5 w-5' />
                            Thông tin cá nhân
                        </CardTitle>
                    </CardHeader>
                    <CardContent className='space-y-4'>
                        <div>
                            <p className='text-sm text-muted-foreground'>Họ và tên</p>
                            <p className='font-medium'>{coach.personalInfo.fullName}</p>
                        </div>
                        <div>
                            <p className='text-sm text-muted-foreground'>Số CCCD/CMND</p>
                            <p className='font-medium'>{coach.personalInfo.idNumber}</p>
                        </div>
                        <div>
                            <p className='text-sm text-muted-foreground'>Địa chỉ</p>
                            <p className='font-medium'>{coach.personalInfo.address}</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Coach Profile */}
                <Card>
                    <CardHeader>
                        <CardTitle className='flex items-center gap-2'>
                            <Award className='h-5 w-5' />
                            Thông tin chuyên môn
                        </CardTitle>
                    </CardHeader>
                    <CardContent className='space-y-4'>
                        <div>
                            <p className='text-sm text-muted-foreground'>Môn thể thao</p>
                            <div className='flex flex-wrap gap-1 mt-1'>
                                {coach.sports.map((sport: string, idx: number) => (
                                    <Badge key={idx} variant='secondary'>{sport}</Badge>
                                ))}
                            </div>
                        </div>
                        <div>
                            <p className='text-sm text-muted-foreground'>Chứng chỉ</p>
                            <p className='font-medium'>{coach.certification}</p>
                        </div>
                        <div>
                            <p className='text-sm text-muted-foreground'>Đơn giá/giờ</p>
                            <p className='font-medium flex items-center gap-1'>
                                <DollarSign className='h-4 w-4' />
                                {new Intl.NumberFormat('vi-VN', {
                                    style: 'currency',
                                    currency: 'VND',
                                }).format(coach.hourlyRate)}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Location */}
                <Card>
                    <CardHeader>
                        <CardTitle className='flex items-center gap-2'>
                            <MapPin className='h-5 w-5' />
                            Địa điểm
                        </CardTitle>
                    </CardHeader>
                    <CardContent className='space-y-4'>
                        <div>
                            <p className='text-sm text-muted-foreground'>Địa điểm tập luyện</p>
                            <p className='font-medium'>{coach.locationAddress}</p>
                        </div>
                        {coach.locationCoordinates && (
                            <div>
                                <p className='text-sm text-muted-foreground'>Toạ độ</p>
                                <p className='font-medium text-sm'>
                                    {coach.locationCoordinates.lat}, {coach.locationCoordinates.lng}
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Bio & Experience */}
                <Card className='md:col-span-1'>
                    <CardHeader>
                        <CardTitle>Kinh nghiệm & Tiểu sử</CardTitle>
                    </CardHeader>
                    <CardContent className='space-y-4'>
                        <div>
                            <p className='text-sm text-muted-foreground'>Kinh nghiệm</p>
                            <p className='font-medium whitespace-pre-wrap'>{coach.experience}</p>
                        </div>
                        <div>
                            <p className='text-sm text-muted-foreground'>Tiểu sử</p>
                            <p className='font-medium whitespace-pre-wrap'>{coach.bio}</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Photos */}
                {coach.profilePhoto && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Ảnh hồ sơ</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <img
                                src={coach.profilePhoto}
                                alt='Profile'
                                className='w-full h-48 object-cover rounded-md'
                            />
                        </CardContent>
                    </Card>
                )}

                {coach.certificationPhotos && coach.certificationPhotos.length > 0 && (
                    <Card className={coach.profilePhoto ? 'md:col-span-1' : 'md:col-span-2'}>
                        <CardHeader>
                            <CardTitle>Tài liệu chứng chỉ</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className='grid grid-cols-2 gap-2'>
                                {coach.certificationPhotos.map((photo: string, idx: number) => (
                                    <img
                                        key={idx}
                                        src={photo}
                                        alt={`Certification ${idx + 1}`}
                                        className='w-full h-32 object-cover rounded-md'
                                    />
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Status */}
                <Card className='md:col-span-2'>
                    <CardHeader>
                        <CardTitle>Trạng thái đăng ký</CardTitle>
                    </CardHeader>
                    <CardContent className='space-y-4'>
                        <div>
                            <p className='text-sm text-muted-foreground'>Trạng thái</p>
                            <Badge
                                variant='outline'
                                className={cn('mt-1', statusColors.get(coach.status))}
                            >
                                {coach.status}
                            </Badge>
                        </div>
                        {coach.rejectionReason && (
                            <div>
                                <p className='text-sm text-muted-foreground'>Lý do từ chối</p>
                                <p className='font-medium text-red-600'>{coach.rejectionReason}</p>
                            </div>
                        )}
                        <div>
                            <p className='text-sm text-muted-foreground'>Nộp lúc</p>
                            <p className='font-medium'>
                                {new Date(coach.submittedAt).toLocaleString()}
                            </p>
                        </div>
                        {coach.processedAt && (
                            <div>
                                <p className='text-sm text-muted-foreground'>Xử lý lúc</p>
                                <p className='font-medium'>
                                    {new Date(coach.processedAt).toLocaleString()}
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
