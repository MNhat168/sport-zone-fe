import { useState } from 'react'
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
import { useFieldOwners } from './field-owners-provider'
// TODO: These hooks were removed. Need to add back if approval/reject functionality is needed
// import {
//   useApproveFieldOwnerMutation,
//   useRejectFieldOwnerMutation,
// } from '@/store/services/fieldOwnersApi'
import { toast } from 'sonner'
import { useNavigate } from '@tanstack/react-router'

const approveFormSchema = z.object({
  notes: z.string().optional(),
})

const rejectFormSchema = z.object({
  reason: z.string().min(1, 'Rejection reason is required'),
})

type ApproveFormValues = z.infer<typeof approveFormSchema>
type RejectFormValues = z.infer<typeof rejectFormSchema>

export function ApprovalDialog() {
  const { open, setOpen, currentRow } = useFieldOwners()
  const navigate = useNavigate()
  // TODO: These hooks were removed. Need to add back if approval/reject functionality is needed
  // const [approveFieldOwner, { isLoading: isApproving }] =
  //   useApproveFieldOwnerMutation()
  // const [rejectFieldOwner, { isLoading: isRejecting }] =
  //   useRejectFieldOwnerMutation()
  const isApproving = false
  const isRejecting = false

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

    // TODO: API was removed. Need to add back if approval functionality is needed
    toast.error('Approve functionality is currently unavailable')
    // try {
    //   await approveFieldOwner({
    //     id: currentRow.id,
    //     data,
    //   }).unwrap()
    //   toast.success('Field owner registration approved successfully')
    //   setOpen(null)
    //   approveForm.reset()
    //   navigate({ to: '/field-owners/requests' })
    // } catch (error: any) {
    //   toast.error(error?.data?.message || 'Failed to approve registration')
    // }
  }

  const handleReject = async (data: RejectFormValues) => {
    if (!currentRow || !('id' in currentRow)) return

    // TODO: API was removed. Need to add back if reject functionality is needed
    toast.error('Reject functionality is currently unavailable')
    // try {
    //   await rejectFieldOwner({
    //     id: currentRow.id,
    //     data,
    //   }).unwrap()
    //   toast.success('Field owner registration rejected')
    //   setOpen(null)
    //   rejectForm.reset()
    //   navigate({ to: '/field-owners/requests' })
    // } catch (error: any) {
    //   toast.error(error?.data?.message || 'Failed to reject registration')
    // }
  }

  if (!currentRow) return null

  return (
    <>
      {/* Approve Dialog */}
      <Dialog open={isApproveOpen} onOpenChange={(open) => !open && setOpen(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Field Owner Registration</DialogTitle>
            <DialogDescription>
              Are you sure you want to approve this field owner registration?
              This action will activate their account.
            </DialogDescription>
          </DialogHeader>
          <Form {...approveForm}>
            <form onSubmit={approveForm.handleSubmit(handleApprove)}>
              <FormField
                control={approveForm.control}
                name='notes'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='Add any notes about this approval...'
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
                  Cancel
                </Button>
                <Button type='submit' disabled={isApproving}>
                  {isApproving ? (
                    <>
                      <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                      Approving...
                    </>
                  ) : (
                    <>
                      <CheckCircle className='mr-2 h-4 w-4' />
                      Approve
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
            <DialogTitle>Reject Field Owner Registration</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this registration. The user
              will be notified of this decision.
            </DialogDescription>
          </DialogHeader>
          <Form {...rejectForm}>
            <form onSubmit={rejectForm.handleSubmit(handleReject)}>
              <FormField
                control={rejectForm.control}
                name='reason'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rejection Reason *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='Enter the reason for rejection...'
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
                  Cancel
                </Button>
                <Button type='submit' variant='destructive' disabled={isRejecting}>
                  {isRejecting ? (
                    <>
                      <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                      Rejecting...
                    </>
                  ) : (
                    <>
                      <XCircle className='mr-2 h-4 w-4' />
                      Reject
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

