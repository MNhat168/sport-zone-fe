'use client'

import { useEffect, useState } from 'react'
import { Loading } from '@/components/ui/loading'
import { useAppDispatch, useAppSelector } from '@/store/hook'
import { getMyBankAccounts, addBankAccount, deleteBankAccount, type BankAccountResponse } from '@/features/bank-account'
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
import { BankAccountVerificationModal } from '@/components/bank-account-verification-modal'
import {
  CheckCircle,
  XCircle,
  Clock,
  Plus,
  Trash2,
  Building2,
  CreditCard,
  User,
  AlertCircle
} from 'lucide-react'

export function BankAccountManagement() {
  const dispatch = useAppDispatch()
  const { accounts, loading, updating, deleting } = useAppSelector((state) => state.bankAccount)

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [deletingAccountId, setDeletingAccountId] = useState<string | null>(null)
  const [showVerificationModal, setShowVerificationModal] = useState(false)
  const [verificationAccount, setVerificationAccount] = useState<BankAccountResponse | null>(null)

  useEffect(() => {
    dispatch(getMyBankAccounts())
  }, [dispatch])

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'verified':
        return {
          badge: (
            <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100">
              <CheckCircle className="w-3 h-3 mr-1" />
              Đã xác minh
            </Badge>
          ),
          bgColor: 'bg-emerald-50',
          borderColor: 'border-emerald-200'
        }
      case 'rejected':
        return {
          badge: (
            <Badge className="bg-red-100 text-red-700 border-red-200 hover:bg-red-100">
              <XCircle className="w-3 h-3 mr-1" />
              Bị từ chối
            </Badge>
          ),
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200'
        }
      case 'pending':
        return {
          badge: (
            <Badge className="bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100">
              <Clock className="w-3 h-3 mr-1" />
              Đang chờ
            </Badge>
          ),
          bgColor: 'bg-amber-50',
          borderColor: 'border-amber-200'
        }
      default:
        return {
          badge: <Badge>{status}</Badge>,
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200'
        }
    }
  }

  const handleVerifyAccount = (account: BankAccountResponse) => {
    setVerificationAccount(account)
    setShowVerificationModal(true)
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
      const result = await dispatch(addBankAccount(data)).unwrap()
      CustomSuccessToast('Khai báo tài khoản thành công! Vui lòng thanh toán để xác thực.')
      setIsAddDialogOpen(false)

      if (result.verificationUrl || result.verificationQrCode || result.needsVerification) {
        setVerificationAccount(result)
        setShowVerificationModal(true)
      }

      dispatch(getMyBankAccounts())
    } catch (error: any) {
      CustomFailedToast(error.message || 'Khai báo thất bại')
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

  const primaryAccount = accounts.find((account) => account.isDefault) || (accounts.length > 0 ? accounts[0] : null)

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Tài khoản ngân hàng</h2>
          <p className="text-muted-foreground mt-1">
            Quản lý thông tin tài khoản nhận tiền
          </p>
        </div>
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center space-y-3">
              <Loading size={32} />
              <p className="text-sm text-muted-foreground">Đang tải thông tin...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Tài khoản ngân hàng</h2>
          <p className="text-muted-foreground mt-1">
            Quản lý thông tin tài khoản nhận tiền
          </p>
        </div>

        {!primaryAccount && (
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="shadow-sm">
                <Plus className="w-4 h-4 mr-2" />
                Khai báo tài khoản
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Thêm tài khoản ngân hàng</DialogTitle>
              </DialogHeader>
              <BankAccountForm onSubmit={handleAdd} onCancel={() => setIsAddDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Content */}
      {!primaryAccount ? (
        <Card className="border-dashed">
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Building2 className="h-8 w-8 text-primary" />
              </div>
              <div className="space-y-2 text-center max-w-md">
                <h3 className="font-semibold text-lg">Chưa có tài khoản ngân hàng</h3>
                <p className="text-sm text-muted-foreground">
                  Vui lòng khai báo một tài khoản ngân hàng để hệ thống tự động chuyển khoản doanh thu sau khi khách hàng check-in.
                </p>
              </div>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="lg" className="shadow-sm mt-2">
                    <Plus className="w-4 h-4 mr-2" />
                    Khai báo tài khoản
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
          </CardContent>
        </Card>
      ) : (
        <Card className={`border-2 ${getStatusConfig(primaryAccount.status).borderColor} ${getStatusConfig(primaryAccount.status).bgColor}/30 shadow-sm`}>
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="text-xl">Chi tiết tài khoản</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Thông tin tài khoản nhận tiền của bạn
                </p>
              </div>
              {getStatusConfig(primaryAccount.status).badge}
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Account Info Grid */}
            <div className="grid gap-4">
              {/* Account Holder */}
              <div className="flex items-start gap-3 p-4 rounded-lg bg-background border">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 shrink-0">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Chủ tài khoản</p>
                  <p className="font-semibold text-base">{primaryAccount.accountName}</p>
                </div>
              </div>

              {/* Bank Info */}
              <div className="flex items-start gap-3 p-4 rounded-lg bg-background border">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 shrink-0">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Ngân hàng</p>
                  <p className="font-semibold text-base">{primaryAccount.bankName}</p>
                  {primaryAccount.branch && (
                    <p className="text-sm text-muted-foreground mt-1">Chi nhánh: {primaryAccount.branch}</p>
                  )}
                </div>
              </div>

              {/* Account Number */}
              <div className="flex items-start gap-3 p-4 rounded-lg bg-background border">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 shrink-0">
                  <CreditCard className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Số tài khoản</p>
                  <p className="font-mono font-semibold text-lg tracking-wider">{primaryAccount.accountNumber}</p>
                </div>
              </div>
            </div>

            {/* Verification Warning */}
            {primaryAccount.status === 'pending' && primaryAccount.needsVerification && (
              <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-50 border border-amber-200">
                <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-amber-900 text-sm">Cần xác thực tài khoản</p>
                  <p className="text-amber-700 text-sm mt-1">
                    Vui lòng thực hiện thanh toán 10,000 VND để hoàn tất xác thực tài khoản.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleVerifyAccount(primaryAccount)}
                    disabled={updating}
                    className="mt-3 bg-white hover:bg-amber-50 border-amber-300 text-amber-700"
                  >
                    Xác thực ngay
                  </Button>
                </div>
              </div>
            )}

            {/* Rejection Reason */}
            {primaryAccount.rejectionReason && (
              <div className="flex items-start gap-3 p-4 rounded-lg bg-red-50 border border-red-200">
                <XCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-red-900 text-sm">Lý do từ chối</p>
                  <p className="text-red-700 text-sm mt-1">{primaryAccount.rejectionReason}</p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-4 border-t">
              <p className="text-xs text-muted-foreground">
                Hệ thống chỉ cho phép một tài khoản ngân hàng
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeletingAccountId(primaryAccount.id)}
                disabled={updating || deleting}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Xóa tài khoản
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deletingAccountId}
        onOpenChange={(open) => !open && setDeletingAccountId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa tài khoản</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa tài khoản này? Hành động này không thể hoàn tác.
              Bạn có thể khai báo lại tài khoản mới sau khi xóa.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleting}
            >
              {deleting ? 'Đang xóa...' : 'Xóa tài khoản'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Verification Modal */}
      {verificationAccount && (
        <BankAccountVerificationModal
          open={showVerificationModal}
          onOpenChange={(open) => {
            setShowVerificationModal(open)
            if (!open) {
              setVerificationAccount(null)
              dispatch(getMyBankAccounts())
            }
          }}
          accountId={verificationAccount.id}
          verificationUrl={verificationAccount.verificationUrl}
          qrCodeUrl={verificationAccount.verificationQrCode}
        />
      )}
    </div>
  )
}