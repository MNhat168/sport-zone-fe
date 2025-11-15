'use client'

import { useEffect, useMemo } from "react"
import { formatDistanceToNow } from "date-fns"
import { vi } from "date-fns/locale"
import { Building2, RefreshCcw } from "lucide-react"
import { toast } from "sonner"

import { FieldOwnerDashboardHeader } from "@/components/header/field-owner-dashboard-header"
import { FieldOwnerDashboardTabs } from "@/components/tabs/field-owner-dashboard-tabs"
import { NavbarDarkComponent } from "@/components/header/navbar-dark-component"
import { PageWrapper } from "@/components/layouts/page-wrapper"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  WalletSummaryCard,
  WalletInfoCard,
} from "@/components/wallet"
import { useAppSelector, useAppDispatch } from "@/store/hook"
import { getFieldOwnerWallet } from "@/features/wallet"
import { formatCurrency } from "@/utils/format-currency"

const formatRelativeTime = (value?: string) => {
  if (!value) return null

  try {
    return formatDistanceToNow(new Date(value), {
      addSuffix: true,
      locale: vi,
    })
  } catch {
    return null
  }
}

export default function FieldOwnerWalletPage() {
  const dispatch = useAppDispatch()
  const authUser = useAppSelector((state) => state.auth.user)
  const userId = authUser?._id ?? null

  const {
    fieldOwnerWallet: wallet,
    fieldOwnerWalletLoading: loading,
    fieldOwnerWalletError: error,
  } = useAppSelector((state) => state.wallet)

  // Fetch wallet on mount
  useEffect(() => {
    if (userId) {
      dispatch(getFieldOwnerWallet(userId))
    }
  }, [userId, dispatch])

  // Show error toast
  useEffect(() => {
    if (error) {
      toast.error(error)
    }
  }, [error])

  const lastUpdatedLabel = useMemo(() => {
    if (!wallet?.lastTransactionAt) return null
    const relative = formatRelativeTime(wallet.lastTransactionAt)
    if (!relative) return null
    return `Lần cập nhật gần nhất ${relative}`
  }, [wallet?.lastTransactionAt])

  const handleRefetch = () => {
    if (userId) {
      dispatch(getFieldOwnerWallet(userId))
    }
  }

  return (
    <>
      <NavbarDarkComponent />
      <PageWrapper className="bg-gray-50">
        <FieldOwnerDashboardHeader />
        <FieldOwnerDashboardTabs />

        <div className="container mx-auto px-6 pb-16">
          <div className="grid gap-6 lg:grid-cols-3">
            <WalletSummaryCard
              title="Doanh thu đang chờ chuyển khoản"
              amount={wallet?.pendingBalance ?? 0}
              currency={wallet?.currency ?? "VND"}
              message={
                loading ? undefined : wallet?.message ?? "Chưa có doanh thu chờ xử lý."
              }
              icon={<Building2 className="h-5 w-5 text-emerald-500" />}
              loading={loading}
              className="lg:col-span-2"
            />

            <Card className="border border-emerald-100 bg-white/80 shadow-sm">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Trạng thái ví
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {loading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                ) : (
                  <>
                    <p className="text-emerald-700">
                      Số dư đang chờ chuyển khoản sẽ tự động về tài khoản ngân hàng
                      đã cấu hình sau khi khách hàng check-in thành công.
                    </p>
                    {lastUpdatedLabel && (
                      <p className="text-xs text-muted-foreground">
                        {lastUpdatedLabel}
                      </p>
                    )}
                    {error && (
                      <p className="text-xs text-red-500">
                        {error}
                      </p>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/40">
                <div>
                  <CardTitle className="text-base font-semibold">
                    Quy trình tự động chuyển khoản
                  </CardTitle>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Khi khách hàng check-in, hệ thống sẽ thực hiện bank transfer tự động.
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="gap-2 border-emerald-500 text-emerald-700 hover:bg-emerald-500 hover:text-white"
                  onClick={handleRefetch}
                >
                  <RefreshCcw className="h-4 w-4" />
                  Làm mới
                </Button>
              </CardHeader>
              <CardContent className="space-y-5 py-6 text-sm leading-relaxed">
                <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-4 text-emerald-900">
                  <p className="font-medium">
                    1. Thanh toán PayOS thành công
                  </p>
                  <p className="mt-1 text-sm text-emerald-900/80">
                    Toàn bộ số tiền booking được ghi nhận vào `systemBalance` của admin.
                    Doanh thu của bạn xuất hiện trong ví với trạng thái{" "}
                    <span className="font-semibold">pendingBalance</span>.
                  </p>
                </div>
                <div className="rounded-lg border border-emerald-100 bg-white p-4">
                  <p className="font-medium text-emerald-800">2. Khách hàng check-in</p>
                  <p className="mt-1 text-muted-foreground">
                    Ngay khi khách hoàn tất check-in, số tiền pending sẽ được chuyển vào bank
                    account đã cấu hình trong hồ sơ của bạn. Bạn không cần thao tác thủ công.
                  </p>
                </div>
                <div className="rounded-lg border border-emerald-100 bg-white p-4">
                  <p className="font-medium text-emerald-800">3. Ví tự động về 0</p>
                  <p className="mt-1 text-muted-foreground">
                    Sau khi chuyển khoản thành công, pendingBalance sẽ về 0 để phản ánh rằng
                    không còn khoản nào chờ xử lý.
                  </p>
                </div>
                <div className="rounded-lg border border-emerald-100 bg-white p-4">
                  <p className="font-medium text-emerald-800">4. Phí nền tảng</p>
                  <p className="mt-1 text-muted-foreground">
                    Hệ thống tự động trừ 5% phí nền tảng trước khi chuyển tiền. Phần còn lại sẽ
                    được chuyển tới ngân hàng của bạn.
                  </p>
                </div>
              </CardContent>
            </Card>

            <WalletInfoCard
              title="Mẹo quản lý doanh thu"
              icon={
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <Building2 className="h-5 w-5" />
                </div>
              }
              items={[
                {
                  label: "Theo dõi pendingBalance",
                  description:
                    "Nếu pendingBalance không về 0 sau khi khách check-in, hãy kiểm tra lại thông tin ngân hàng hoặc liên hệ admin.",
                },
                {
                  label: "Cập nhật thông tin ngân hàng",
                  description:
                    "Đảm bảo thông tin ngân hàng của bạn luôn chính xác để việc chuyển khoản diễn ra suôn sẻ.",
                },
                {
                  label: "Thông báo tự động",
                  description:
                    "Bạn sẽ nhận được thông báo khi tiền được chuyển thành công hoặc khi có lỗi phát sinh.",
                },
              ]}
              footer={
                wallet && (
                  <p className="text-xs text-muted-foreground">
                    Doanh thu hiện tại:{" "}
                    <span className="font-semibold text-emerald-600">
                      {formatCurrency(wallet.pendingBalance, wallet.currency)}
                    </span>
                  </p>
                )
              }
            />
          </div>
        </div>
      </PageWrapper>
    </>
  )
}

