import {
  LayoutDashboard,
  Users,
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
          title: 'Tài khoản',
          url: '/users',
          icon: Users,
        },
        {
          title: 'Giao dịch',
          url: '/transactions',
          icon: FileCheck,
        },
        {
          title: 'Đặt chỗ',
          url: '/bookings',
          icon: Calendar,
        },
        {
          title: 'Báo cáo',
          url: '/reports',
          icon: Flag,
        },
        {
          title: 'Billing',
          url: '/billing',
          icon: CreditCard,
        },
        {
          title: 'Quản lý hoàn tiền',
          url: '/refund-management',
          icon: FileSpreadsheet,
        },
        {
          title: 'Chủ sân',
          icon: Building2,
          items: [
            {
              title: 'Tất cả chủ sân',
              url: '/field-owners',
            },
            {
              title: 'Yêu cầu đăng ký',
              url: '/field-owners/requests',
              icon: FileCheck,
            },
          ],
        },
        {
          title: 'Thống kê',
          url: '/admin/statistics',
          icon: AudioWaveform, // Reusing an icon or import a new one like BarChart
        },
      ],
    },

  ],
}
