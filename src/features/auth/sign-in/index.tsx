import { useSearch } from '@tanstack/react-router'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { AuthLayout } from '../auth-layout'
import { UserAuthForm } from './components/user-auth-form'

export function SignIn() {
  const { redirect } = useSearch({ from: '/(auth)/sign-in' })

  return (
    <AuthLayout>
      <Card className='gap-4'>
        <CardHeader>
          <CardTitle className='text-lg tracking-tight'>Đăng nhập</CardTitle>
          <CardDescription>
            Nhập email và mật khẩu để <br />
            đăng nhập vào tài khoản của bạn
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UserAuthForm redirectTo={redirect} />
        </CardContent>
        <CardFooter>
          <p className='text-muted-foreground px-8 text-center text-sm'>
            Khi bấm Đăng nhập, bạn đồng ý với{' '}
            <a
              href='/terms'
              className='hover:text-primary underline underline-offset-4'
            >
              Điều khoản dịch vụ
            </a>{' '}
            và{' '}
            <a
              href='/privacy'
              className='hover:text-primary underline underline-offset-4'
            >
              Chính sách bảo mật
            </a>
            .
          </p>
        </CardFooter>
      </Card>
    </AuthLayout>
  )
}
