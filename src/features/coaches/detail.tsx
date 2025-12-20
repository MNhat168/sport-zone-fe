import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { CoachDetailView } from './components/coach-detail-view.tsx'
import { CoachesProvider } from './components/coaches-provider'
import { CoachesDialogs } from './components/coaches-dialogs'

export function CoachDetail() {
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
                <CoachDetailView />
            </Main>

            <CoachesDialogs />
        </CoachesProvider>
    )
}
