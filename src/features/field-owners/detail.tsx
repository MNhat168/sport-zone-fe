import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { FieldOwnerDetailView } from './components/field-owner-detail-view'
import { FieldOwnersProvider } from './components/field-owners-provider'
import { FieldOwnersDialogs } from './components/field-owners-dialogs'

export function FieldOwnerDetail() {
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
        <FieldOwnerDetailView />
      </Main>

      <FieldOwnersDialogs />
    </FieldOwnersProvider>
  )
}

