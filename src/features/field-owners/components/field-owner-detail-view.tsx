import { useState } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  FileText,
  MapPin,
  Phone,
  Mail,
  Building2,
  CreditCard,
  Image as ImageIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { DocumentViewer } from './document-viewer'
// TODO: These hooks were removed. Need to add back if detail view functionality is needed
// import {
//   useGetFieldOwnerByIdQuery,
//   useApproveFieldOwnerMutation,
//   useRejectFieldOwnerMutation,
// } from '@/store/services/fieldOwnersApi'
import { statusColors, bankAccountStatusColors } from '../data/data'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { ApprovalDialog } from './approval-dialog'
import { useFieldOwners } from './field-owners-provider'

export function FieldOwnerDetailView() {
  const { id } = useParams({ from: '/field-owners/$id' })
  const navigate = useNavigate()
  const { setOpen, setCurrentRow } = useFieldOwners()
  const [documentViewerOpen, setDocumentViewerOpen] = useState(false)
  const [documentViewerImages, setDocumentViewerImages] = useState<string[]>([])
  const [documentViewerTitle, setDocumentViewerTitle] = useState('')

  // TODO: API was removed. Need to add back if detail view functionality is needed
  // const {
  //   data: fieldOwner,
  //   isLoading,
  //   error,
  // } = useGetFieldOwnerByIdQuery(id || '', {
  //   skip: !id,
  // })
  const fieldOwner = null
  const isLoading = false
  const error = null

  // const [approveFieldOwner, { isLoading: isApproving }] =
  //   useApproveFieldOwnerMutation()
  // const [rejectFieldOwner, { isLoading: isRejecting }] =
  //   useRejectFieldOwnerMutation()
  const isApproving = false
  const isRejecting = false

  const handleViewDocuments = (type: 'id' | 'business' | 'bank') => {
    if (!fieldOwner) return

    // Note: ID documents (idFront/idBack) are deprecated - use eKYC instead
    // This is kept for backward compatibility with legacy data
    if (type === 'id') {
      // Check if eKYC is available (new method)
      if (fieldOwner.ekycSessionId) {
        // eKYC verification - show status instead of documents
        toast.info('Identity verified via didit eKYC', {
          description: `Status: ${fieldOwner.ekycStatus || 'pending'}`,
        })
        return
      }
      // Legacy: fallback to CCCD documents if available
      if (fieldOwner.documents?.idFront && fieldOwner.documents?.idBack) {
        setDocumentViewerImages([
          fieldOwner.documents.idFront,
          fieldOwner.documents.idBack,
        ])
        setDocumentViewerTitle('Identity Documents (CCCD) - Legacy')
      } else {
        toast.warning('No identity documents available')
        return
      }
    } else if (type === 'business' && fieldOwner.documents?.businessLicense) {
      setDocumentViewerImages([fieldOwner.documents.businessLicense])
      setDocumentViewerTitle('Business License')
    } else if (
      type === 'bank' &&
      fieldOwner.bankAccount?.verificationDocument
    ) {
      setDocumentViewerImages([fieldOwner.bankAccount.verificationDocument])
      setDocumentViewerTitle('Bank Account Verification Document')
    }
    setDocumentViewerOpen(true)
  }

  if (isLoading) {
    return (
      <div className='space-y-4'>
        <Skeleton className='h-10 w-48' />
        <Skeleton className='h-96 w-full' />
      </div>
    )
  }

  if (error || !fieldOwner) {
    return (
      <div className='flex flex-col items-center justify-center h-96'>
        <p className='text-muted-foreground'>
          {error ? 'Failed to load field owner details' : 'Field owner not found'}
        </p>
        <Button
          variant='outline'
          onClick={() => navigate({ to: '/field-owners' })}
          className='mt-4'
        >
          <ArrowLeft className='mr-2 h-4 w-4' />
          Back to List
        </Button>
      </div>
    )
  }

  const isRequest = 'status' in fieldOwner
  const status = isRequest ? fieldOwner.status : null
  const isPending = status === 'pending'

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-4'>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => navigate({ to: '/field-owners' })}
          >
            <ArrowLeft className='mr-2 h-4 w-4' />
            Back
          </Button>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>
              Field Owner Details
            </h2>
            <p className='text-muted-foreground'>
              Review registration information and documents
            </p>
          </div>
        </div>
        {isPending && (
          <div className='flex gap-2'>
            <Button
              variant='outline'
              onClick={async () => {
                // TODO: API was removed. Need to add back if approval functionality is needed
                toast.error('Approve functionality is currently unavailable')
                // try {
                //   await approveFieldOwner({
                //     id: fieldOwner.id,
                //     data: { notes: '' },
                //   }).unwrap()
                //   toast.success('Field owner registration approved successfully')
                //   navigate({ to: '/field-owners' })
                // } catch (error: any) {
                //   toast.error(error?.data?.message || 'Failed to approve registration')
                // }
              }}
              disabled={isApproving || isRejecting}
            >
              {isApproving ? (
                <>Loading...</>
              ) : (
                <>
                  <CheckCircle className='mr-2 h-4 w-4' />
                  Approve
                </>
              )}
            </Button>
            <Button
              variant='destructive'
              onClick={() => {
                setCurrentRow(fieldOwner)
                setOpen('reject')
              }}
              disabled={isApproving || isRejecting}
            >
              <XCircle className='mr-2 h-4 w-4' />
              Reject
            </Button>
          </div>
        )}
      </div>

      <div className='grid gap-6 md:grid-cols-2'>
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div>
              <p className='text-sm text-muted-foreground'>Full Name</p>
              <p className='font-medium'>{fieldOwner.personalInfo.fullName}</p>
            </div>
            <div>
              <p className='text-sm text-muted-foreground'>ID Number</p>
              <p className='font-medium'>{fieldOwner.personalInfo.idNumber}</p>
            </div>
            <div>
              <p className='text-sm text-muted-foreground'>Address</p>
              <p className='font-medium'>{fieldOwner.personalInfo.address}</p>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='flex items-center gap-2'>
              <Mail className='h-4 w-4 text-muted-foreground' />
              <div>
                <p className='text-sm text-muted-foreground'>Email</p>
                <p className='font-medium'>{fieldOwner.userInfo.email}</p>
              </div>
            </div>
            <div className='flex items-center gap-2'>
              <Phone className='h-4 w-4 text-muted-foreground' />
              <div>
                <p className='text-sm text-muted-foreground'>Phone</p>
                <p className='font-medium'>{fieldOwner.userInfo.phone}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Field Information */}
        <Card className='md:col-span-2'>
          <CardHeader>
            <CardTitle>Field Information</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div>
              <p className='text-sm text-muted-foreground'>Facility Name</p>
              <p className='font-medium'>
                {'fieldInfo' in fieldOwner
                  ? fieldOwner.fieldInfo.name
                  : 'facilityName' in fieldOwner
                    ? fieldOwner.facilityName
                    : 'N/A'}
              </p>
            </div>
            <div className='flex items-start gap-2'>
              <MapPin className='h-4 w-4 text-muted-foreground mt-1' />
              <div className='flex-1'>
                <p className='text-sm text-muted-foreground'>Address</p>
                <p className='font-medium'>
                  {'fieldInfo' in fieldOwner
                    ? fieldOwner.fieldInfo.address
                    : 'facilityLocation' in fieldOwner
                      ? fieldOwner.facilityLocation
                      : 'N/A'}
                </p>
                {'fieldInfo' in fieldOwner && fieldOwner.fieldInfo.gps && (
                  <p className='text-xs text-muted-foreground mt-1'>
                    GPS: {fieldOwner.fieldInfo.gps.lat}, {fieldOwner.fieldInfo.gps.lng}
                  </p>
                )}
              </div>
            </div>
            {'fieldInfo' in fieldOwner && (
              <>
                <div>
                  <p className='text-sm text-muted-foreground'>Pitch Count</p>
                  <p className='font-medium'>{fieldOwner.fieldInfo.pitchCount}</p>
                </div>
                <div>
                  <p className='text-sm text-muted-foreground'>Pitch Types</p>
                  <div className='flex flex-wrap gap-2 mt-1'>
                    {fieldOwner.fieldInfo.pitchTypes.map((type, idx) => (
                      <Badge key={idx} variant='outline'>
                        {type}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <p className='text-sm text-muted-foreground'>Pricing</p>
                  <div className='grid grid-cols-2 gap-4 mt-1'>
                    <div>
                      <p className='text-xs text-muted-foreground'>Peak Hour</p>
                      <p className='font-medium'>
                        {fieldOwner.fieldInfo.pricePerHour.peak.toLocaleString()} VND
                      </p>
                    </div>
                    <div>
                      <p className='text-xs text-muted-foreground'>Off-Peak Hour</p>
                      <p className='font-medium'>
                        {fieldOwner.fieldInfo.pricePerHour.offpeak.toLocaleString()} VND
                      </p>
                    </div>
                  </div>
                </div>
                {fieldOwner.fieldInfo.images.length > 0 && (
                  <div>
                    <p className='text-sm text-muted-foreground mb-2'>Field Images</p>
                    <div className='grid grid-cols-4 gap-2'>
                      {fieldOwner.fieldInfo.images.slice(0, 4).map((img, idx) => (
                        <img
                          key={idx}
                          src={img}
                          alt={`Field ${idx + 1}`}
                          className='w-full h-24 object-cover rounded-md cursor-pointer hover:opacity-80'
                          onClick={() => {
                            setDocumentViewerImages(fieldOwner.fieldInfo.images)
                            setDocumentViewerTitle('Field Images')
                            setDocumentViewerOpen(true)
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Documents */}
        <Card>
          <CardHeader>
            <CardTitle>Documents</CardTitle>
          </CardHeader>
          <CardContent className='space-y-3'>
            <Button
              variant='outline'
              className='w-full justify-start'
              onClick={() => handleViewDocuments('id')}
            >
              <FileText className='mr-2 h-4 w-4' />
              View ID Documents
            </Button>
            {fieldOwner.documents.businessLicense && (
              <Button
                variant='outline'
                className='w-full justify-start'
                onClick={() => handleViewDocuments('business')}
              >
                <Building2 className='mr-2 h-4 w-4' />
                View Business License
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Bank Account */}
        {fieldOwner.bankAccount && (
          <Card>
            <CardHeader>
              <CardTitle>Bank Account</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div>
                <p className='text-sm text-muted-foreground'>Account Name</p>
                <p className='font-medium'>{fieldOwner.bankAccount.accountName}</p>
              </div>
              <div>
                <p className='text-sm text-muted-foreground'>Account Number</p>
                <p className='font-medium'>{fieldOwner.bankAccount.accountNumber}</p>
              </div>
              <div>
                <p className='text-sm text-muted-foreground'>Bank Name</p>
                <p className='font-medium'>{fieldOwner.bankAccount.bankName}</p>
              </div>
              {fieldOwner.bankAccount.branch && (
                <div>
                  <p className='text-sm text-muted-foreground'>Branch</p>
                  <p className='font-medium'>{fieldOwner.bankAccount.branch}</p>
                </div>
              )}
              <div>
                <p className='text-sm text-muted-foreground'>Status</p>
                <Badge
                  variant='outline'
                  className={cn(
                    'mt-1',
                    bankAccountStatusColors.get(fieldOwner.bankAccount.status)
                  )}
                >
                  {fieldOwner.bankAccount.status}
                </Badge>
              </div>
              {fieldOwner.bankAccount.verificationDocument && (
                <Button
                  variant='outline'
                  className='w-full justify-start'
                  onClick={() => handleViewDocuments('bank')}
                >
                  <CreditCard className='mr-2 h-4 w-4' />
                  View Verification Document
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Status */}
        {isRequest && (
          <Card className='md:col-span-2'>
            <CardHeader>
              <CardTitle>Registration Status</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div>
                <p className='text-sm text-muted-foreground'>Status</p>
                <Badge
                  variant='outline'
                  className={cn('mt-1', statusColors.get(status || 'pending'))}
                >
                  {status}
                </Badge>
              </div>
              {fieldOwner.rejectionReason && (
                <div>
                  <p className='text-sm text-muted-foreground'>Rejection Reason</p>
                  <p className='font-medium text-red-600'>
                    {fieldOwner.rejectionReason}
                  </p>
                </div>
              )}
              <div>
                <p className='text-sm text-muted-foreground'>Submitted At</p>
                <p className='font-medium'>
                  {fieldOwner.submittedAt.toLocaleString()}
                </p>
              </div>
              {fieldOwner.reviewedAt && (
                <div>
                  <p className='text-sm text-muted-foreground'>Reviewed At</p>
                  <p className='font-medium'>
                    {fieldOwner.reviewedAt.toLocaleString()}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      <DocumentViewer
        images={documentViewerImages}
        title={documentViewerTitle}
        isOpen={documentViewerOpen}
        onClose={() => setDocumentViewerOpen(false)}
      />
      <ApprovalDialog />
    </div>
  )
}

