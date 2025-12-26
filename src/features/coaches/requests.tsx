import { getRouteApi } from '@tanstack/react-router'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { CoachRegistrationRequestsTable } from './components/coach-registration-requests-table'
import { CoachesProvider } from './components/coaches-provider'
import { CoachesDialogs } from './components/coaches-dialogs'
import { useGetCoachRegistrationRequestsQuery } from '@/store/services/coachesApi'

const route = getRouteApi('/_authenticated/coaches/requests')

export function CoachRequests() {
    const search = route.useSearch()
    const navigate = route.useNavigate()

    const { data, isLoading, isFetching } = useGetCoachRegistrationRequestsQuery({
        page: search.page || 1,
        limit: search.pageSize || 10,
    })
    const requests = data?.data?.data ?? []

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
                        <h2 className='text-2xl font-bold tracking-tight'>
                            Yêu cầu đăng ký huấn luyện viên
                        </h2>
                        <p className='text-muted-foreground'>
                            Xem xét và duyệt các yêu cầu đăng ký huấn luyện viên đang chờ.
                        </p>
                    </div>
                </div>
                <CoachRegistrationRequestsTable
                    data={requests}
                    search={search}
                    navigate={navigate}
                    isLoading={isLoading || isFetching}
                />
            </Main>

            <CoachesDialogs />
        </CoachesProvider>
    )
}
