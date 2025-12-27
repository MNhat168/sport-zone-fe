import { FieldsProvider } from './components/fields-provider'
import { FieldsTable } from './components/fields-table'
import { FieldsDialogs } from './components/fields-dialogs'
import { useGetFieldsQuery } from '@/store/services/fieldsApi'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { getRouteApi } from '@tanstack/react-router'
import { type FieldsSearch } from './data/schema'
import { type NavigateFn } from '@/hooks/use-table-url-state'

const route = getRouteApi('/_authenticated/fields/')

export function Fields() {
    const search = route.useSearch() as FieldsSearch
    const navigate = route.useNavigate()

    const { data, isLoading } = useGetFieldsQuery({
        page: search.page || 1,
        limit: search.pageSize || 10,
        name: search.search,
    })

    return (
        <FieldsProvider>
            <Header fixed>
                <div className='ms-auto flex items-center space-x-4'>
                    <ThemeSwitch />
                    <ConfigDrawer />
                    <ProfileDropdown />
                </div>
            </Header>

            <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
                <div className='flex flex-wrap items-end justify-between gap-2'>
                    <div>
                        <h2 className='text-2xl font-bold tracking-tight'>Quản lý sân</h2>
                        <p className='text-muted-foreground'>
                            Xem và quản lý tất cả các sân trong hệ thống.
                        </p>
                    </div>
                </div>
                <FieldsTable
                    data={data?.fields || []}
                    search={search}
                    navigate={navigate as unknown as NavigateFn}
                    isLoading={isLoading}
                    pageCount={data?.pagination?.totalPages ?? 1}
                />
            </Main>

            <FieldsDialogs />
        </FieldsProvider>
    )
}
