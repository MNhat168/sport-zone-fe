import { getRouteApi } from '@tanstack/react-router'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { useGetBookingsQuery } from '@/store/services/bookingsApi'
import { BookingsTable } from './components/bookings-table'

const route = getRouteApi('/_authenticated/bookings/' as any)

export function Bookings() {
  const search = route.useSearch() as any
  const navigate = route.useNavigate() as any

  const { data, isFetching } = useGetBookingsQuery({
    search: search.search || undefined,
    status: search.status && search.status.length > 0 ? search.status : undefined,
    type: search.type && search.type.length > 0 ? search.type : undefined,
    paymentStatus: search.paymentStatus && search.paymentStatus.length > 0 ? search.paymentStatus : undefined,
    approvalStatus: search.approvalStatus && search.approvalStatus.length > 0 ? search.approvalStatus : undefined,
    startDate: search.startDate || undefined,
    endDate: search.endDate || undefined,
    page: search.page,
    limit: search.limit,
    sortBy: search.sortBy,
    sortOrder: search.sortOrder,
  })

  const tableData = data?.data ?? []
  const meta = {
    total: data?.total ?? 0,
    page: data?.page ?? (search.page ?? 1),
    limit: data?.limit ?? (search.limit ?? 20),
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
            <h2 className='text-2xl font-bold tracking-tight'>Bookings</h2>
            <p className='text-muted-foreground'>
              Xem và lọc tất cả booking trong hệ thống.
            </p>
          </div>
        </div>
        <BookingsTable
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

