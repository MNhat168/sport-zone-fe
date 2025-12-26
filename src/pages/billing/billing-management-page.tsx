import { useEffect } from 'react'
import { getRouteApi } from '@tanstack/react-router'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { getOverdueAccounts } from '@/features/billing/billingThunk'
import { BillingTable } from '@/features/billing/components/billing-table'
import { toast } from 'sonner'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'

const route = getRouteApi('/_authenticated/billing/')

export function BillingManagementPage() {
  const search = route.useSearch()
  const navigate = route.useNavigate()
  const dispatch = useAppDispatch()

  const { overdueAccounts, pagination, loading, error } = useAppSelector((state) => state.billing)

  const page = search.page ?? 1
  const limit = search.limit ?? 10

  useEffect(() => {
    dispatch(getOverdueAccounts({ page, limit }))
      .unwrap()
      .catch((err) => {
        toast.error(err?.message || 'Không thể tải danh sách tài khoản quá hạn')
      })
  }, [dispatch, page, limit])

  const tableData = overdueAccounts ?? []
  const meta = {
    total: pagination?.total ?? 0,
    page: pagination?.page ?? page,
    limit: pagination?.limit ?? limit,
  }

  return (
    <>
      <Header fixed>
        <Search />
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Quản lý thanh toán</h2>
            <p className='text-muted-foreground'>
              Xem và quản lý tài khoản quá hạn và trạng thái đăng ký.
            </p>
          </div>
        </div>
        {error && (
          <Alert variant='destructive'>
            <AlertCircle className='h-4 w-4' />
            <AlertTitle>Lỗi</AlertTitle>
            <AlertDescription>{error.message}</AlertDescription>
          </Alert>
        )}
        <BillingTable
          data={tableData}
          total={meta.total}
          limit={meta.limit}
          isLoading={loading}
          search={search}
          navigate={navigate}
        />
      </Main>
    </>
  )
}

