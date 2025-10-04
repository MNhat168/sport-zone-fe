import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { AuthLayout } from '../auth-layout'
import { OtpForm } from './components/otp-form'

type OtpProps = {
  onNavigate?: (path: string) => void
}

export function Otp({ onNavigate }: OtpProps) {
  return (
    <AuthLayout>
      <Card className='gap-4'>
        <CardHeader>
          <CardTitle className='text-base tracking-tight'>
            Two-factor Authentication
          </CardTitle>
          <CardDescription>
            Please enter the authentication code. <br /> We have sent the
            authentication code to your email.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <OtpForm />
        </CardContent>
        <CardFooter>
          <p className='text-muted-foreground px-8 text-center text-sm'>
            Haven't received it?{' '}
            <button
              onClick={() => onNavigate?.('/sign-in')}
              className='hover:text-primary underline underline-offset-4'
            >
              Resend a new code.
            </button>
            .
          </p>
        </CardFooter>
      </Card>
    </AuthLayout>
  )
}
