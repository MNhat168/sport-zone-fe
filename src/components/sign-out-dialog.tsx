import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { useAppDispatch } from '@/store/hooks'
import { clearAuth } from '@/store/slices/authSlice'
import { useLogoutMutation } from '@/store/services/authApi'
import { ConfirmDialog } from '@/components/confirm-dialog'

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
      // Call API to logout (clear cookies)
      await logout().unwrap()
      
      // Clear Redux state
      dispatch(clearAuth())
      
      toast.success('Signed out successfully')
      
      // Navigate to sign-in page
      navigate({
        to: '/sign-in',
        replace: true,
      })
    } catch (_error) {
      // Even if API fails, still clear local state
      dispatch(clearAuth())
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
