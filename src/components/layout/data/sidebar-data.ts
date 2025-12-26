import {
  LayoutDashboard,
  Monitor,
  HelpCircle,
  Bell,
  Palette,
  Settings,
  Wrench,
  UserCog,
  Users,
  MessagesSquare,
  AudioWaveform,
  Command,
  GalleryVerticalEnd,
  Building2,
  FileCheck,
  Flag,
  Calendar,
  CreditCard,
  FileSpreadsheet,
} from 'lucide-react'
import { type SidebarData } from '../types'

export const sidebarData: SidebarData = {
  user: {
    name: 'satnaing',
    avatar: '/avatars/shadcn.jpg',
  },
  teams: [
    {
      name: 'Shadcn Admin',
      logo: Command,
      plan: 'Vite + ShadcnUI',
    },
    {
      name: 'Acme Inc',
      logo: GalleryVerticalEnd,
      plan: 'Enterprise',
    },
    {
      name: 'Acme Corp.',
      logo: AudioWaveform,
      plan: 'Startup',
    },
  ],
  navGroups: [
    {
      title: 'General',
      items: [
        {
          title: 'Dashboard',
          url: '/',
          icon: LayoutDashboard,
        },
        {
          title: 'Chats',
          url: '/chats',
          badge: '3',
          icon: MessagesSquare,
        },
        {
          title: 'Users',
          url: '/users',
          icon: Users,
        },
        {
          title: 'Transactions',
          url: '/transactions',
          icon: FileCheck,
        },
        {
          title: 'Bookings',
          url: '/bookings',
          icon: Calendar,
        },
        {
          title: 'Reports',
          url: '/reports',
          icon: Flag,
        },
        {
          title: 'Billing',
          url: '/billing',
          icon: CreditCard,
        },
        {
          title: 'Refund Management',
          url: '/refund-management',
          icon: FileSpreadsheet,
        },
        {
          title: 'Field Owners',
          icon: Building2,
          items: [
            {
              title: 'All Field Owners',
              url: '/field-owners',
            },
            {
              title: 'Registration Requests',
              url: '/field-owners/requests',
              icon: FileCheck,
            },
          ],
        },
        {
          title: 'Statistics',
          url: '/admin/statistics',
          icon: AudioWaveform, // Reusing an icon or import a new one like BarChart
        },
      ],
    },
    {
      title: 'Other',
      items: [
        {
          title: 'Settings',
          icon: Settings,
          items: [
            {
              title: 'Profile',
              url: '/settings',
              icon: UserCog,
            },
            {
              title: 'Account',
              url: '/settings/account',
              icon: Wrench,
            },
            {
              title: 'Appearance',
              url: '/settings/appearance',
              icon: Palette,
            },
            {
              title: 'Notifications',
              url: '/settings/notifications',
              icon: Bell,
            },
            {
              title: 'Display',
              url: '/settings/display',
              icon: Monitor,
            },
          ],
        },
        {
          title: 'Help Center',
          url: '/help-center',
          icon: HelpCircle,
        },
      ],
    },
  ],
}
