import { useMemo, useState } from 'react'
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
import { Button } from '@/components/ui/button'
import { CalendarDays, FileText, IdCard, MapPin, ShieldCheck, ShieldX, ShieldAlert, Image as ImageIcon } from 'lucide-react'
import { ownerTypes, statusColors } from '../data/data'
import { useFieldOwners } from './field-owners-provider'
import { DocumentViewer } from './document-viewer'
import { type FieldOwnerRequest } from '../data/schema'

export function RequestDetailDialog() {
  const { open, setOpen, currentRow } = useFieldOwners()
  const [documentViewerOpen, setDocumentViewerOpen] = useState(false)
  const [documentViewerImages, setDocumentViewerImages] = useState<string[]>([])
  const [documentViewerTitle, setDocumentViewerTitle] = useState('')
  const [documentViewerInitialIndex, setDocumentViewerInitialIndex] = useState(0)

  const request = useMemo(() => {
    if (
      currentRow &&
      'personalInfo' in currentRow &&
      'submittedAt' in currentRow
    ) {
      return currentRow as FieldOwnerRequest
    }
    return null
  }, [currentRow])

  const isOpen = open === 'view' && !!request

  const handleClose = () => {
    setDocumentViewerOpen(false)
    setOpen(null)
  }

  const submittedAt = request
    ? new Date(request.submittedAt).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : ''

  const ownerTypeLabel = request
    ? ownerTypes.find((type) => type.value === request.ownerType)?.label ??
      request.ownerType
    : ''

  const openDocumentViewer = (title: string, images: string[], initialIndex: number = 0) => {
    if (images.length === 0) return
    setDocumentViewerImages(images)
    setDocumentViewerTitle(title)
    setDocumentViewerInitialIndex(initialIndex)
    setDocumentViewerOpen(true)
  }

  if (!request) return null

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(nextOpen) => !nextOpen && handleClose()}>
        <DialogContent className='max-w-[calc(100%-2rem)] sm:max-w-6xl'>
          <DialogHeader>
            <DialogTitle>Field Owner Registration</DialogTitle>
            <DialogDescription>
              Review the applicant&apos;s submitted information and documents.
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className='max-h-[70vh] pe-3'>
            <div className='space-y-6'>
              {/* Header Section */}
              <section className='space-y-4'>
                <div className='flex flex-wrap items-center justify-between gap-4'>
                  <div>
                    <p className='text-sm text-muted-foreground'>Applicant</p>
                    <p className='text-xl font-semibold'>
                      {request.personalInfo.fullName}
                    </p>
                  </div>
                  <div className='flex flex-wrap items-center gap-2'>
                    <Badge variant='outline'>{ownerTypeLabel}</Badge>
                    <Badge
                      variant='outline'
                      className={statusColors.get(request.status)}
                    >
                      {request.status}
                    </Badge>
                  </div>
                </div>
                <div className='flex flex-wrap items-center gap-6 text-sm text-muted-foreground'>
                  <div className='flex items-center gap-2'>
                    <CalendarDays className='h-4 w-4' />
                    Submitted:&nbsp;
                    <span className='font-medium text-foreground'>{submittedAt}</span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <IdCard className='h-4 w-4' />
                    ID:&nbsp;
                    <span className='font-medium text-foreground'>
                      {request.personalInfo.idNumber}
                    </span>
                  </div>
                </div>
              </section>

              <Separator />

              {/* Main Content - 3 Column Grid Layout */}
              <section className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                {/* Left Column: Personal Information */}
                <div className='space-y-2'>
                  <p className='text-sm font-semibold text-muted-foreground'>
                    Personal Information
                  </p>
                  <div className='rounded-md border p-6 space-y-4'>
                    <div>
                      <p className='text-xs text-muted-foreground mb-1'>Full Name</p>
                      <p className='font-medium text-base break-words'>{request.personalInfo.fullName}</p>
                    </div>
                    <div>
                      <p className='text-xs text-muted-foreground mb-1'>ID Number</p>
                      <p className='font-medium text-base break-words'>{request.personalInfo.idNumber}</p>
                    </div>
                    <div>
                      <p className='text-xs text-muted-foreground mb-1'>Address</p>
                      <p className='font-medium text-base break-words'>{request.personalInfo.address}</p>
                    </div>
                  </div>
                </div>

                {/* Middle Column: Additional Details, Identity Verification, Documents */}
                <div className='space-y-6'>
                  <div className='space-y-2'>
                    <p className='text-sm font-semibold text-muted-foreground'>
                      Additional Details
                    </p>
                    <div className='rounded-md border p-6 space-y-4'>
                      <div>
                        <p className='text-xs text-muted-foreground mb-1'>Owner Type</p>
                        <p className='font-medium text-base'>{ownerTypeLabel}</p>
                      </div>
                      <div>
                        <p className='text-xs text-muted-foreground mb-1'>Status</p>
                        <Badge
                          variant='outline'
                          className={statusColors.get(request.status)}
                        >
                          {request.status}
                        </Badge>
                      </div>
                      <div className='flex items-start gap-2'>
                        <MapPin className='h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0' />
                        <div className='flex-1 min-w-0'>
                          <p className='text-xs text-muted-foreground mb-1'>Address</p>
                          <p className='font-medium text-base break-words'>{request.personalInfo.address}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Identity Verification */}
                  <div className='space-y-3'>
                    <p className='text-sm font-semibold text-muted-foreground'>
                      Identity Verification
                    </p>
                    
                    {/* eKYC Status (new method) */}
                    {request.ekycSessionId ? (
                      <div className='rounded-md border p-6 space-y-3'>
                        <div className='flex items-center justify-between'>
                          <div className='flex items-center gap-2'>
                            {request.ekycStatus === 'verified' && (
                              <ShieldCheck className='h-5 w-5 text-green-600' />
                            )}
                            {request.ekycStatus === 'failed' && (
                              <ShieldX className='h-5 w-5 text-red-600' />
                            )}
                            {(request.ekycStatus === 'pending' || !request.ekycStatus) && (
                              <ShieldAlert className='h-5 w-5 text-yellow-600' />
                            )}
                            <p className='text-sm font-semibold'>didit eKYC Verification</p>
                          </div>
                          <Badge
                            variant='outline'
                            className={
                              request.ekycStatus === 'verified'
                                ? 'border-green-600 text-green-600'
                                : request.ekycStatus === 'failed'
                                ? 'border-red-600 text-red-600'
                                : 'border-yellow-600 text-yellow-600'
                            }
                          >
                            {request.ekycStatus || 'pending'}
                          </Badge>
                        </div>
                        <div className='text-xs text-muted-foreground space-y-1'>
                          <p>Session ID: {request.ekycSessionId}</p>
                          {request.ekycVerifiedAt && (
                            <p>Verified At: {new Date(request.ekycVerifiedAt).toLocaleString()}</p>
                          )}
                          {request.ekycData && (
                            <div className='mt-2 pt-2 border-t'>
                              <p className='font-medium text-foreground mb-1'>Extracted Data:</p>
                              <p>Name: {request.ekycData.fullName}</p>
                              <p>ID: {request.ekycData.idNumber}</p>
                              <p>Address: {request.ekycData.address}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      /* Legacy: CCCD Documents (deprecated, for backward compatibility) */
                      request.documents?.idFront && request.documents?.idBack && (
                        <div className='rounded-md border border-yellow-200 bg-yellow-50 p-6 space-y-3'>
                          <div className='flex items-center gap-2'>
                            <ShieldAlert className='h-4 w-4 text-yellow-600' />
                            <p className='text-xs font-medium text-yellow-800'>
                              Legacy: Using deprecated CCCD document upload
                            </p>
                          </div>
                          <Button
                            variant='outline'
                            className='justify-start w-full'
                            onClick={() =>
                              openDocumentViewer('Identity Documents (Legacy)', [
                                request.documents!.idFront!,
                                request.documents!.idBack!,
                              ])
                            }
                          >
                            <FileText className='mr-2 h-4 w-4' />
                            View ID Documents (Legacy)
                          </Button>
                        </div>
                      )
                    )}

                    {/* Business License (still used) */}
                    {request.documents?.businessLicense && (
                      <Button
                        variant='outline'
                        className='justify-start w-full'
                        onClick={() =>
                          openDocumentViewer('Business License', [
                            request.documents!.businessLicense as string,
                          ])
                        }
                      >
                        <FileText className='mr-2 h-4 w-4' />
                        View Business License
                      </Button>
                    )}
                  </div>
                </div>

                {/* Right Column: Field Images */}
                {request.fieldImages && request.fieldImages.length > 0 && (
                  <div className='space-y-3'>
                    <div className='flex items-center justify-between'>
                      <p className='text-sm font-semibold text-muted-foreground'>
                        Field Images
                      </p>
                      <Badge variant='outline'>{request.fieldImages.length} images</Badge>
                    </div>
                    
                    <div className='rounded-md border p-6'>
                      <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-4'>
                        {request.fieldImages.map((imageUrl, index) => (
                          <button
                            key={index}
                            onClick={() =>
                              openDocumentViewer('Field Images', request.fieldImages || [], index)
                            }
                            className='relative group rounded-md overflow-hidden border-2 border-transparent hover:border-primary transition-all aspect-square'
                          >
                            <img
                              src={imageUrl}
                              alt={`Field image ${index + 1}`}
                              className='w-full h-full object-cover'
                              onError={(e) => {
                                const target = e.target as HTMLImageElement
                                target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect width="100" height="100" fill="%23ddd"/%3E%3Ctext x="50" y="50" text-anchor="middle" dy=".3em" fill="%23999"%3EImage%3C/text%3E%3C/svg%3E'
                              }}
                            />
                            <div className='absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center'>
                              <ImageIcon className='h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity' />
                            </div>
                          </button>
                        ))}
                      </div>
                      <Button
                        variant='outline'
                        className='justify-start w-full mt-4'
                        onClick={() =>
                          openDocumentViewer('Field Images', request.fieldImages || [])
                        }
                      >
                        <ImageIcon className='mr-2 h-4 w-4' />
                        View All Field Images ({request.fieldImages.length})
                      </Button>
                    </div>
                  </div>
                )}
              </section>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <DocumentViewer
        images={documentViewerImages}
        title={documentViewerTitle}
        isOpen={documentViewerOpen}
        onClose={() => setDocumentViewerOpen(false)}
        currentIndex={documentViewerInitialIndex}
      />
    </>
  )
}

