'use client'

import { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hook'
import {
  getMyBankAccounts,
  addBankAccount,
  updateBankAccount,
  deleteBankAccount,
  setDefaultBankAccount,
  type BankAccountResponse,
} from '@/features/bank-account'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { CustomSuccessToast, CustomFailedToast } from '@/components/toast/notificiation-toast'
import { BankAccountForm } from './bank-account-form'
import { CheckCircle, XCircle, Clock, Edit, Trash2, Star, Plus } from 'lucide-react'

export function BankAccountManagement() {
  const dispatch = useAppDispatch()
  const { accounts, loading, adding, updating, deleting } = useAppSelector((state) => state.bankAccount)

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingAccount, setEditingAccount] = useState<BankAccountResponse | null>(null)
  const [deletingAccountId, setDeletingAccountId] = useState<string | null>(null)

  useEffect(() => {
    dispatch(getMyBankAccounts())
  }, [dispatch])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return (
          <Badge className="bg-green-500">
            <CheckCircle className="w-3 h-3 mr-1" />
            Đã xác minh
          </Badge>
        )
      case 'rejected':
        return (
          <Badge variant="destructive">
            <XCircle className="w-3 h-3 mr-1" />
            Bị từ chối
          </Badge>
        )
      case 'pending':
        return (
          <Badge className="bg-yellow-500">
            <Clock className="w-3 h-3 mr-1" />
            Đang chờ
          </Badge>
        )
      default:
        return <Badge>{status}</Badge>
    }
  }

  const handleAdd = async (data: {
    accountName: string
    accountNumber: string
    bankCode: string
    bankName: string
    branch?: string
    verificationDocument?: string
    isDefault?: boolean
  }) => {
    try {
      await dispatch(addBankAccount(data)).unwrap()
      CustomSuccessToast('Khai báo tài khoản thành công! Đang chờ xét duyệt.')
      setIsAddDialogOpen(false)
      dispatch(getMyBankAccounts())
    } catch (error: any) {
      CustomFailedToast(error.message || 'Khai báo thất bại')
    }
  }

  const handleUpdate = async (data: {
    accountName: string
    accountNumber: string
    bankCode: string
    bankName: string
    branch?: string
    verificationDocument?: string
    isDefault?: boolean
  }) => {
    if (!editingAccount) return

    try {
      await dispatch(
        updateBankAccount({
          id: editingAccount.id,
          ...data,
        })
      ).unwrap()
      CustomSuccessToast('Cập nhật tài khoản thành công! Đang chờ xét duyệt lại.')
      setEditingAccount(null)
      dispatch(getMyBankAccounts())
    } catch (error: any) {
      CustomFailedToast(error.message || 'Cập nhật thất bại')
    }
  }

  const handleDelete = async () => {
    if (!deletingAccountId) return

    try {
      await dispatch(deleteBankAccount(deletingAccountId)).unwrap()
      CustomSuccessToast('Xóa tài khoản thành công')
      setDeletingAccountId(null)
      dispatch(getMyBankAccounts())
    } catch (error: any) {
      CustomFailedToast(error.message || 'Xóa thất bại')
    }
  }

  const handleSetDefault = async (accountId: string) => {
    try {
      await dispatch(setDefaultBankAccount(accountId)).unwrap()
      CustomSuccessToast('Đã đặt làm tài khoản mặc định')
      dispatch(getMyBankAccounts())
    } catch (error: any) {
      CustomFailedToast(error.message || 'Thất bại khi đặt tài khoản mặc định')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Tài khoản ngân hàng</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Thêm tài khoản
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Thêm tài khoản ngân hàng</DialogTitle>
            </DialogHeader>
            <BankAccountForm onSubmit={handleAdd} onCancel={() => setIsAddDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-muted-foreground">Đang tải...</p>
          </CardContent>
        </Card>
      ) : accounts.length === 0 ? (
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-muted-foreground">Chưa có tài khoản nào</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {accounts.map((account) => (
            <Card key={account.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-lg">{account.accountName}</CardTitle>
                      {account.isDefault && (
                        <Badge variant="outline" className="border-yellow-500 text-yellow-700">
                          <Star className="w-3 h-3 mr-1 fill-yellow-500" />
                          Mặc định
                        </Badge>
                      )}
                      {getStatusBadge(account.status)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {account.bankName} - {account.accountNumber}
                    </p>
                    {account.branch && (
                      <p className="text-sm text-muted-foreground">Chi nhánh: {account.branch}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {!account.isDefault && account.status === 'verified' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSetDefault(account.id)}
                        disabled={updating}
                      >
                        <Star className="w-4 h-4 mr-1" />
                        Đặt mặc định
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingAccount(account)}
                      disabled={updating || deleting}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Sửa
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDeletingAccountId(account.id)}
                      disabled={updating || deleting}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Xóa
                    </Button>
                  </div>
                </div>
              </CardHeader>
              {account.rejectionReason && (
                <CardContent>
                  <p className="text-sm text-red-600">Lý do từ chối: {account.rejectionReason}</p>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingAccount} onOpenChange={(open) => !open && setEditingAccount(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa tài khoản ngân hàng</DialogTitle>
          </DialogHeader>
          {editingAccount && (
            <BankAccountForm
              initialData={editingAccount}
              onSubmit={handleUpdate}
              onCancel={() => setEditingAccount(null)}
              submitLabel="Cập nhật"
              requireValidation={false}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingAccountId} onOpenChange={(open) => !open && setDeletingAccountId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa tài khoản</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa tài khoản này? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

