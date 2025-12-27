import { getRouteApi } from '@tanstack/react-router'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { CoachesTable } from './components/coaches-table'
import { CoachesProvider } from './components/coaches-provider'
import { CoachesDialogs } from './components/coaches-dialogs'
import { useGetCoachProfilesQuery } from '@/store/services/coachesApi'

const route = getRouteApi('/_authenticated/coaches/')

export function Coaches() {
    const search = route.useSearch()
    const navigate = route.useNavigate()

    const { data, isLoading, error } = useGetCoachProfilesQuery({
        page: search.page || 1,
        limit: search.pageSize || 10,
        search: search.search as string | undefined,
        isVerified: search.isVerified?.[0] === 'verified' ? true : search.isVerified?.[0] === 'pending' ? false : undefined,
        sports: search.sports as string[] | undefined,
    })

    // Debug: Log API response
    if (error) {
        console.error('Coaches API Error:', error)
    }
    if (data) {
        console.log('Coaches API Response:', {
            data,
            dataLength: data?.data?.length,
            hasData: !!data?.data,
            fullResponse: data,
        })
    }

    return (
        <CoachesProvider>
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
                        <h2 className='text-2xl font-bold tracking-tight'>Huấn luyện viên</h2>
                        <p className='text-muted-foreground'>
                            Quản lý huấn luyện viên đã được duyệt và tài khoản của họ.
                        </p>
                    </div>
                </div>
                <CoachesTable
                    data={data?.data || []}
                    search={search}
                    navigate={navigate}
                    isLoading={isLoading}
                />
            </Main>

            <CoachesDialogs />
        </CoachesProvider>
    )
}
