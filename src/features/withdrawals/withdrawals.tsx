import { getRouteApi } from '@tanstack/react-router'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { WithdrawalsTable } from './components/withdrawals-table'
import { WithdrawalsProvider } from './components/withdrawals-provider'
import { WithdrawalsDialogs } from './components/withdrawals-dialogs'
import { useGetWithdrawalRequestsQuery } from '@/store/services/withdrawalsApi'

const route = getRouteApi('/_authenticated/withdrawals/')

export function Withdrawals() {
  const search = route.useSearch()
  const navigate = route.useNavigate()

  const { data, isLoading, isFetching } = useGetWithdrawalRequestsQuery({
    page: search.page || 1,
    limit: search.pageSize || 10,
    status: search.status as 'pending' | 'approved' | 'rejected' | undefined,
    userRole: search.userRole as 'field_owner' | 'coach' | undefined,
  })

  const requests = data?.data ?? []

  return (
    <WithdrawalsProvider>
      <Header fixed>
        <Search />
        <div className='ml-auto flex items-center gap-2'>
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>
      <Main>
        <div className='flex flex-1 flex-col gap-4 rounded-lg bg-muted/40 p-4 md:p-6 pt-6'>
          <div className='flex items-center justify-between'>
            <div>
              <h2 className='text-2xl font-bold tracking-tight'>
                Yêu cầu rút tiền
              </h2>
              <p className='text-muted-foreground'>
                Quản lý các yêu cầu rút tiền từ field-owner và coach
              </p>
            </div>
          </div>
          <WithdrawalsTable
            data={requests}
            search={search}
            navigate={navigate}
            isLoading={isLoading || isFetching}
          />
        </div>
      </Main>
      <WithdrawalsDialogs />
    </WithdrawalsProvider>
  )
}
