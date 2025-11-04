import { createFileRoute, redirect } from '@tanstack/react-router'
import { AuthenticatedLayout } from '@/components/layout/authenticated-layout'
import { store } from '@/store'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: ({ location }) => {
    const { isAuthenticated } = store.getState().auth
    if (!isAuthenticated) {
      throw redirect({
        to: '/sign-in',
        search: {
          redirect: location.href,
        },
      })
    }
  },
  component: AuthenticatedLayout,
})
