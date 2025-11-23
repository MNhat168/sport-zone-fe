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
// TODO: This hook was removed. Need to add back if requests page functionality is needed
// import { useGetFieldOwnerRequestsQuery } from '@/store/services/fieldOwnersApi'

const route = getRouteApi('/_authenticated/field-owners/requests')

export function FieldOwnerRequests() {
  const search = route.useSearch()
  const navigate = route.useNavigate()

  // TODO: API was removed. Need to add back if requests page functionality is needed
  // const { data, isLoading } = useGetFieldOwnerRequestsQuery({
  //   page: search.page || 1,
  //   limit: search.pageSize || 10,
  //   status: search.status as string | undefined,
  //   ownerType: search.ownerType as string | undefined,
  //   search: search.search as string | undefined,
  // })
  const data = { data: [] }
  const isLoading = false

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
              Field Owner Registration Requests
            </h2>
            <p className='text-muted-foreground'>
              Review and approve pending field owner registrations.
            </p>
          </div>
        </div>
        <FieldOwnersRequestsTable
          data={data?.data || []}
          search={search}
          navigate={navigate}
          isLoading={isLoading}
        />
      </Main>

      <FieldOwnersDialogs />
    </FieldOwnersProvider>
  )
}

