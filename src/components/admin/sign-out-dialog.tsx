import { useAuthStore } from '@/stores/auth-store'
import { ConfirmDialog } from '@/components/confirm-dialog'

interface SignOutDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onNavigate?: (path: string) => void
}

export function SignOutDialog({ open, onOpenChange, onNavigate }: SignOutDialogProps) {
  const { auth } = useAuthStore()

  const handleSignOut = () => {
    auth.reset()
    // Navigate to sign-in page
    onNavigate?.('/sign-in')
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title='Sign out'
      desc='Are you sure you want to sign out? You will need to sign in again to access your account.'
      confirmText='Sign out'
      handleConfirm={handleSignOut}
      className='sm:max-w-sm'
    />
  )
}
