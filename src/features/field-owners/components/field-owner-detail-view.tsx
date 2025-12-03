import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import type { FieldOwnerRequest } from '../data/schema'
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
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
  const navigate = useNavigate()
  const { setOpen, setCurrentRow, currentRow } = useFieldOwners()
  const [documentViewerOpen, setDocumentViewerOpen] = useState(false)
  const [documentViewerImages, setDocumentViewerImages] = useState<string[]>([])
  const [documentViewerTitle, setDocumentViewerTitle] = useState('')

  // Use currentRow from provider instead of API
  const fieldOwner = currentRow
  const isLoading = false
  const error = null

  const isApproving = false
  const isRejecting = false

  const handleViewDocuments = (type: 'id' | 'business' | 'bank') => {
    if (!fieldOwner) return

    // Type guard to check if it's a FieldOwnerRequest
    const isRequest = 'status' in fieldOwner && 'documents' in fieldOwner
    if (!isRequest) return

    const request = fieldOwner as FieldOwnerRequest

    // Note: ID documents (idFront/idBack) are deprecated - use eKYC instead
    // This is kept for backward compatibility with legacy data
    if (type === 'id') {
      // Check if eKYC is available (new method)
      if (request.ekycSessionId) {
        // eKYC verification - show status instead of documents
        toast.info('Identity verified via didit eKYC', {
          description: `Status: ${request.ekycStatus || 'pending'}`,
        })
        return
      }
      // Legacy: fallback to CCCD documents if available
      if (request.documents?.idFront && request.documents?.idBack) {
        setDocumentViewerImages([
          request.documents.idFront,
          request.documents.idBack,
        ])
        setDocumentViewerTitle('Identity Documents (CCCD) - Legacy')
      } else {
        toast.warning('No identity documents available')
        return
      }
    } else if (type === 'business' && request.documents?.businessLicense) {
      setDocumentViewerImages([request.documents.businessLicense])
      setDocumentViewerTitle('Business License')
    } else if (type === 'bank') {
      // Bank account is only available in FieldOwnerProfile, not FieldOwnerRequest
      toast.warning('Bank account information is not available for registration requests')
      return
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
          onClick={() => navigate({ to: '/field-owners' as any })}
          className='mt-4'
        >
          <ArrowLeft className='mr-2 h-4 w-4' />
          Back to List
        </Button>
      </div>
    )
  }

  // Type guard to check if it's a FieldOwnerRequest
  const isRequest = 
    fieldOwner && 
    'status' in fieldOwner && 
    'documents' in fieldOwner &&
    'personalInfo' in fieldOwner &&
    'submittedAt' in fieldOwner
  
  const request = isRequest ? (fieldOwner as FieldOwnerRequest) : null
  const status = request?.status ?? null
  const isPending = status === 'pending'

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-4'>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => navigate({ to: '/field-owners' as any })}
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
            {request && (
              <>
                <div>
                  <p className='text-sm text-muted-foreground'>Full Name</p>
                  <p className='font-medium'>{request.personalInfo.fullName}</p>
                </div>
                <div>
                  <p className='text-sm text-muted-foreground'>ID Number</p>
                  <p className='font-medium'>{request.personalInfo.idNumber}</p>
                </div>
                <div>
                  <p className='text-sm text-muted-foreground'>Address</p>
                  <p className='font-medium'>{request.personalInfo.address}</p>
                </div>
              </>
            )}
            {!isRequest && 'personalInfo' in fieldOwner && (
              <>
                <div>
                  <p className='text-sm text-muted-foreground'>Full Name</p>
                  <p className='font-medium'>{(fieldOwner as any).personalInfo?.fullName || 'N/A'}</p>
                </div>
                <div>
                  <p className='text-sm text-muted-foreground'>ID Number</p>
                  <p className='font-medium'>{(fieldOwner as any).personalInfo?.idNumber || 'N/A'}</p>
                </div>
                <div>
                  <p className='text-sm text-muted-foreground'>Address</p>
                  <p className='font-medium'>{(fieldOwner as any).personalInfo?.address || 'N/A'}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            {!isRequest && 'userInfo' in fieldOwner && (
              <>
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
              </>
            )}
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
                {'fieldInfo' in fieldOwner && fieldOwner.fieldInfo
                  ? (fieldOwner.fieldInfo as { name?: string }).name
                  : 'facilityName' in fieldOwner
                    ? (fieldOwner.facilityName as string | undefined) || 'N/A'
                    : 'N/A'}
              </p>
            </div>
            <div className='flex items-start gap-2'>
              <MapPin className='h-4 w-4 text-muted-foreground mt-1' />
              <div className='flex-1'>
                <p className='text-sm text-muted-foreground'>Address</p>
                <p className='font-medium'>
                  {'fieldInfo' in fieldOwner && fieldOwner.fieldInfo
                    ? (fieldOwner.fieldInfo as { address?: string }).address
                    : 'facilityLocation' in fieldOwner
                      ? (fieldOwner.facilityLocation as string | undefined) || 'N/A'
                      : 'N/A'}
                </p>
                {/* GPS information not available in current schema */}
              </div>
            </div>
            {/* FieldInfo is not part of the schema - this section is for future use if fieldInfo is added */}
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
            {request?.documents?.businessLicense && (
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

        {/* Bank Account - Only available for FieldOwnerProfile, not FieldOwnerRequest */}
        {!isRequest && 'bankAccounts' in fieldOwner && fieldOwner.bankAccounts && fieldOwner.bankAccounts.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Bank Account</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              {fieldOwner.bankAccounts.map((bankAccount, idx) => (
                <div key={idx} className='space-y-2 border-b pb-4 last:border-0'>
                  <div>
                    <p className='text-sm text-muted-foreground'>Account Name</p>
                    <p className='font-medium'>{bankAccount.accountName}</p>
                  </div>
                  <div>
                    <p className='text-sm text-muted-foreground'>Account Number</p>
                    <p className='font-medium'>{bankAccount.accountNumber}</p>
                  </div>
                  <div>
                    <p className='text-sm text-muted-foreground'>Bank Name</p>
                    <p className='font-medium'>{bankAccount.bankName}</p>
                  </div>
                  {bankAccount.branch && (
                    <div>
                      <p className='text-sm text-muted-foreground'>Branch</p>
                      <p className='font-medium'>{bankAccount.branch}</p>
                    </div>
                  )}
                  <div>
                    <p className='text-sm text-muted-foreground'>Status</p>
                    <Badge
                      variant='outline'
                      className={cn(
                        'mt-1',
                        bankAccountStatusColors.get(bankAccount.status)
                      )}
                    >
                      {bankAccount.status}
                    </Badge>
                  </div>
                  {bankAccount.verificationDocument && (
                    <Button
                      variant='outline'
                      className='w-full justify-start'
                      onClick={() => {
                        setDocumentViewerImages([bankAccount.verificationDocument!])
                        setDocumentViewerTitle('Bank Account Verification Document')
                        setDocumentViewerOpen(true)
                      }}
                    >
                      <CreditCard className='mr-2 h-4 w-4' />
                      View Verification Document
                    </Button>
                  )}
                </div>
              ))}
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
              {request?.rejectionReason && (
                <div>
                  <p className='text-sm text-muted-foreground'>Rejection Reason</p>
                  <p className='font-medium text-red-600'>
                    {request.rejectionReason}
                  </p>
                </div>
              )}
              {request?.submittedAt && (
                <div>
                  <p className='text-sm text-muted-foreground'>Submitted At</p>
                  <p className='font-medium'>
                    {request.submittedAt instanceof Date 
                      ? request.submittedAt.toLocaleString()
                      : new Date(request.submittedAt).toLocaleString()}
                  </p>
                </div>
              )}
              {request?.reviewedAt && (
                <div>
                  <p className='text-sm text-muted-foreground'>Reviewed At</p>
                  <p className='font-medium'>
                    {request.reviewedAt instanceof Date
                      ? request.reviewedAt.toLocaleString()
                      : new Date(request.reviewedAt).toLocaleString()}
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

