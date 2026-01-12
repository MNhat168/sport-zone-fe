'use client'

import { useState } from 'react'
import { Lock, Unlock } from 'lucide-react'
import { toast } from 'sonner'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { type User } from '../data/schema'
import axiosInstance from '@/lib/axios'
import { useQueryClient } from '@tanstack/react-query'

type UserDeleteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: User
}

export function UsersDeleteDialog({
  open,
  onOpenChange,
  currentRow,
}: UserDeleteDialogProps) {
  const [value, setValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const queryClient = useQueryClient()

  const isActive = currentRow.status === 'active'
  const actionText = isActive ? 'Khóa' : 'Mở khóa'
  const ActionIcon = isActive ? Lock : Unlock
  const confirmKey = 'toi_chap_nhan'

  const handleStatusChange = async () => {
    if (isActive && value.trim() !== confirmKey) return

    try {
      setIsLoading(true)
      await axiosInstance.patch(`/admin/manage/user/${currentRow._id}/is-active`, {
        isActive: !isActive,
      })

      toast.success(`Đã ${actionText.toLowerCase()} tài khoản thành công.`)

      // Invalidate queries to refresh the list
      queryClient.invalidateQueries({ queryKey: ['users'] })
      onOpenChange(false)
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật trạng thái.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      handleConfirm={handleStatusChange}
      disabled={isActive && value.trim() !== confirmKey}
      isLoading={isLoading}
      title={
        <span className={isActive ? 'text-destructive' : 'text-emerald-600'}>
          <ActionIcon
            className={`me-1 inline-block ${isActive ? 'stroke-destructive' : 'stroke-emerald-600'}`}
            size={18}
          />{' '}
          {actionText} tài khoản
        </span>
      }
      desc={
        <div className='space-y-4'>
          <p className='mb-2'>
            Bạn có chắc muốn <span className='font-bold lowercase'>{actionText}</span> tài khoản{' '}
            <span className='font-bold'>{currentRow.fullName}</span>?
            <br />
            {isActive ? (
              <>
                Tài khoản này sẽ không thể đăng nhập vào hệ thống nữa.
              </>
            ) : (
              <>
                Tài khoản này sẽ được phép đăng nhập lại vào hệ thống.
              </>
            )}
          </p>

          {isActive && (
            <Label className='my-2'>
              Nhập <span className='font-bold text-destructive'>{confirmKey}</span> để xác nhận:
              <Input
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={`Nhập '${confirmKey}' để xác nhận.`}
              />
            </Label>
          )}

          {isActive && (
            <Alert variant='destructive'>
              <AlertTitle>Cảnh báo!</AlertTitle>
              <AlertDescription>
                Hành động này sẽ ngăn người dùng truy cập ngay lập tức.
              </AlertDescription>
            </Alert>
          )}
        </div>
      }
      confirmText={actionText}
      destructive={isActive}
    />
  )
}
