import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { useAppDispatch } from '@/store/hooks'
import { clearAuth } from '@/store/slices/authSlice'
import { useLogoutMutation } from '@/store/services/authApi'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { removeCookie } from '@/lib/cookies'

interface SignOutDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SignOutDialog({ open, onOpenChange }: SignOutDialogProps) {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const [logout] = useLogoutMutation()

  const handleSignOut = async () => {
    try {
      // Call API to logout
      await logout().unwrap()
    } catch (_error) {
      // Ignore API errors, still clear local state
    } finally {
      // Clear sessionStorage (Bearer tokens)
      sessionStorage.removeItem('auth_access_token')
      sessionStorage.removeItem('auth_refresh_token')
      sessionStorage.removeItem('user')

      // Clear cookies (to avoid conflicts with backend cookie strategy)
      removeCookie('access_token')
      removeCookie('access_token_admin')

      // Clear Redux state
      dispatch(clearAuth())

      toast.success('Signed out successfully')

      // Navigate to sign-in page
      navigate({
        to: '/sign-in',
        replace: true,
      })
    }
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title='Sign out'
      desc='Are you sure you want to sign out? You will need to sign in again to access your account.'
      confirmText='Sign out'
      destructive
      handleConfirm={handleSignOut}
      className='sm:max-w-sm'
    />
  )
}
