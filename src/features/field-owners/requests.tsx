import { getRouteApi } from '@tanstack/react-router'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { FieldOwnersRequestsTable } from './components/field-owners-requests-table'
import { FieldOwnersProvider } from './components/field-owners-provider'
import { FieldOwnersDialogs } from './components/field-owners-dialogs'
import { useGetRegistrationRequestsQuery } from '@/store/services/fieldOwnersApi'

const route = getRouteApi('/_authenticated/field-owners/requests')

export function FieldOwnerRequests() {
  const search = route.useSearch()
  const navigate = route.useNavigate()

  const { data, isLoading, isFetching } = useGetRegistrationRequestsQuery({
    page: search.page || 1,
    limit: search.pageSize || 10,
  })
  const requests = data?.data?.data ?? []

  return (
    <FieldOwnersProvider>
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
            <h2 className='text-2xl font-bold tracking-tight'>
              Yêu cầu đăng ký chủ sân
            </h2>
            <p className='text-muted-foreground'>
              Xem xét và duyệt các yêu cầu đăng ký chủ sân đang chờ.
            </p>
          </div>
        </div>
        <FieldOwnersRequestsTable
          data={requests}
          search={search}
          navigate={navigate}
          isLoading={isLoading || isFetching}
        />
      </Main>

      <FieldOwnersDialogs />
    </FieldOwnersProvider>
  )
}

