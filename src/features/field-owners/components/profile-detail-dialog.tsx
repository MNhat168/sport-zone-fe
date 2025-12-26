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
import { CalendarDays, Mail, MapPin, Phone, Globe, Star, ShieldCheck, ShieldX } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useFieldOwners } from './field-owners-provider'
import { type FieldOwnerProfileApi } from '../data/schema'

export function ProfileDetailDialog() {
  const { open, setOpen, currentRow } = useFieldOwners()

  const profile = useMemo(() => {
    if (
      currentRow &&
      'facilityName' in currentRow &&
      'isVerified' in currentRow &&
      !('submittedAt' in currentRow)
    ) {
      return currentRow as FieldOwnerProfileApi
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

  const updatedAt = profile?.updatedAt
    ? new Date(profile.updatedAt).toLocaleString('vi-VN', {
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
          <DialogTitle>Hồ sơ chủ sân</DialogTitle>
          <DialogDescription>
            Xem thông tin chi tiết về chủ sân và cơ sở của họ.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className='max-h-[70vh] pe-3'>
          <div className='space-y-6'>
            {/* Header Section */}
            <section className='space-y-4'>
              <div className='flex flex-wrap items-center justify-between gap-4'>
                <div>
                  <p className='text-sm text-muted-foreground'>Cơ sở</p>
                  <p className='text-xl font-semibold'>{profile.facilityName || '—'}</p>
                </div>
                <div className='flex flex-wrap items-center gap-2'>
                  <Badge
                    variant='outline'
                    className={cn(
                      profile.isVerified
                        ? 'bg-green-500/10 text-green-600 dark:text-green-500 border-green-500/20'
                        : 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-500 border-yellow-500/20'
                    )}
                  >
                    {profile.isVerified ? (
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
                    Tạo lúc:&nbsp;
                    <span className='font-medium text-foreground'>{createdAt}</span>
                  </div>
                )}
                {updatedAt && (
                  <div className='flex items-center gap-2'>
                    <CalendarDays className='h-4 w-4' />
                    Cập nhật:&nbsp;
                    <span className='font-medium text-foreground'>{updatedAt}</span>
                  </div>
                )}
              </div>
            </section>

            <Separator />

            {/* Main Content - 3 Column Grid Layout */}
            <section className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
              {/* Left Column: Owner Information */}
              <div className='space-y-2'>
                <p className='text-sm font-semibold text-muted-foreground'>
                  Thông tin chủ sân
                </p>
                <div className='rounded-md border p-6 space-y-4'>
                  <div>
                    <p className='text-xs text-muted-foreground mb-1'>Họ và tên</p>
                    <p className='font-medium text-base break-words'>
                      {profile.userFullName || '—'}
                    </p>
                  </div>
                  {profile.userEmail && (
                    <div className='flex items-start gap-2'>
                      <Mail className='h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0' />
                      <div className='flex-1 min-w-0'>
                        <p className='text-xs text-muted-foreground mb-1'>Email</p>
                        <p className='font-medium text-base break-words'>
                          {profile.userEmail}
                        </p>
                      </div>
                    </div>
                  )}
                  {profile.contactPhone && (
                    <div className='flex items-start gap-2'>
                      <Phone className='h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0' />
                      <div className='flex-1 min-w-0'>
                        <p className='text-xs text-muted-foreground mb-1'>Số điện thoại</p>
                        <p className='font-medium text-base break-words'>
                          {profile.contactPhone}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Middle Column: Facility Details */}
              <div className='space-y-6'>
                <div className='space-y-2'>
                  <p className='text-sm font-semibold text-muted-foreground'>
                    Chi tiết cơ sở
                  </p>
                  <div className='rounded-md border p-6 space-y-4'>
                    <div>
                      <p className='text-xs text-muted-foreground mb-1'>Tên cơ sở</p>
                      <p className='font-medium text-base break-words'>
                        {profile.facilityName || '—'}
                      </p>
                    </div>
                    {profile.facilityLocation && (
                      <div className='flex items-start gap-2'>
                        <MapPin className='h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0' />
                        <div className='flex-1 min-w-0'>
                          <p className='text-xs text-muted-foreground mb-1'>Địa điểm</p>
                          <p className='font-medium text-base break-words'>
                            {profile.facilityLocation}
                          </p>
                        </div>
                      </div>
                    )}
                    {profile.description && (
                      <div>
                        <p className='text-xs text-muted-foreground mb-1'>Mô tả</p>
                        <p className='font-medium text-base break-words'>
                          {profile.description}
                        </p>
                      </div>
                    )}
                    {profile.website && (
                      <div className='flex items-start gap-2'>
                        <Globe className='h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0' />
                        <div className='flex-1 min-w-0'>
                          <p className='text-xs text-muted-foreground mb-1'>Website</p>
                          <a
                            href={profile.website}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='font-medium text-base text-primary hover:underline break-all'
                          >
                            {profile.website}
                          </a>
                        </div>
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

              {/* Right Column: Sports & Amenities */}
              <div className='space-y-6'>
                {/* Supported Sports */}
                {profile.supportedSports && profile.supportedSports.length > 0 && (
                  <div className='space-y-2'>
                    <p className='text-sm font-semibold text-muted-foreground'>
                      Môn thể thao hỗ trợ
                    </p>
                    <div className='rounded-md border p-6'>
                      <div className='flex flex-wrap gap-2'>
                        {profile.supportedSports.map((sport, index) => (
                          <Badge key={index} variant='outline'>
                            {sport}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Amenities */}
                {profile.amenities && profile.amenities.length > 0 && (
                  <div className='space-y-2'>
                    <p className='text-sm font-semibold text-muted-foreground'>Tiện ích</p>
                    <div className='rounded-md border p-6'>
                      <div className='flex flex-wrap gap-2'>
                        {profile.amenities.map((amenity, index) => (
                          <Badge key={index} variant='outline'>
                            {amenity}
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

