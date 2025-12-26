import { type LucideIcon, ShieldCheck, Users, UserCog, Trophy } from 'lucide-react'
import { type UserRole, type UserStatus } from './schema'

export const statusStyles = new Map<UserStatus, string>([
  ['active', 'bg-emerald-100/40 text-emerald-900 dark:text-emerald-200 border-emerald-300'],
  ['inactive', 'bg-slate-200/50 text-slate-700 dark:text-slate-200 border-slate-300'],
])

type RoleOption = {
  label: string
  value: UserRole
  icon?: LucideIcon
}

export const roleOptions: RoleOption[] = [
  { label: 'Quản trị', value: 'admin', icon: ShieldCheck },
  { label: 'Người dùng', value: 'user', icon: Users },
  { label: 'Chủ sân', value: 'field_owner', icon: UserCog },
  { label: 'Huấn luyện viên', value: 'coach', icon: Trophy },
]
