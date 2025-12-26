import { getRouteApi } from '@tanstack/react-router'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { FieldOwnersTable } from './components/field-owners-table'
import { FieldOwnersProvider } from './components/field-owners-provider'
import { FieldOwnersDialogs } from './components/field-owners-dialogs'
import { useGetlistFieldOwnerProfilesQuery } from '@/store/services/fieldOwnersApi'

const route = getRouteApi('/_authenticated/field-owners/')

export function FieldOwners() {
  const search = route.useSearch()
  const navigate = route.useNavigate()

  const { data, isLoading, error } = useGetlistFieldOwnerProfilesQuery({
    page: search.page || 1,
    limit: search.pageSize || 10,
    status: search.status as string | undefined,
    search: search.search as string | undefined,
  })

  // Debug: Log API response
  if (error) {
    console.error('Field Owners API Error:', error)
  }
  if (data) {
    console.log('Field Owners API Response:', {
      data,
      dataLength: data?.data?.length,
      hasData: !!data?.data,
      fullResponse: data,
    })
  }

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
            <h2 className='text-2xl font-bold tracking-tight'>Chủ sân</h2>
            <p className='text-muted-foreground'>
              Quản lý chủ sân đã được duyệt và tài khoản của họ.
            </p>
          </div>
        </div>
        <FieldOwnersTable
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

