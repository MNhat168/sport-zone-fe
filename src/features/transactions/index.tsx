import { getRouteApi } from '@tanstack/react-router'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { useGetTransactionsQuery } from '@/store/services/transactionsApi'
import { TransactionsTable } from './components/transactions-table'

const route = getRouteApi('/_authenticated/transactions/')

export function Transactions() {
  const search = route.useSearch()
  const navigate = route.useNavigate()

  const { data, isFetching } = useGetTransactionsQuery({
    search: search.search || undefined,
    status: search.status && search.status.length > 0 ? search.status : undefined,
    type: search.type && search.type.length > 0 ? search.type : undefined,
    method: search.method && search.method.length > 0 ? search.method : undefined,
    page: search.page,
    limit: search.limit,
    sortBy: search.sortBy,
    sortOrder: search.sortOrder,
  })

  const tableData = data?.data ?? []
  const meta = {
    total: data?.total ?? 0,
    page: data?.page ?? (search.page ?? 1),
    limit: data?.limit ?? (search.limit ?? 10),
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
            <h2 className='text-2xl font-bold tracking-tight'>Giao dịch</h2>
            <p className='text-muted-foreground'>
              Xem và lọc tất cả giao dịch trong hệ thống.
            </p>
          </div>
        </div>
        <TransactionsTable
          data={tableData}
          total={meta.total}
          limit={meta.limit}
          isLoading={isFetching}
          search={search}
          navigate={navigate}
        />
      </Main>
    </>
  )
}
