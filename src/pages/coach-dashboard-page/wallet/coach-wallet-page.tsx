'use client'

import { useEffect, useMemo } from "react"
import { formatDistanceToNow } from "date-fns"
import { vi } from "date-fns/locale"
import { Dumbbell, RefreshCcw } from "lucide-react"
import { toast } from "sonner"

import { CoachDashboardLayout } from "@/components/layouts/coach-dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loading } from "@/components/ui/loading"
import {
  WalletSummaryCard,
  WalletInfoCard,
} from "@/components/wallet"
import { useAppSelector, useAppDispatch } from "@/store/hook"
import { getFieldOwnerWallet } from "@/features/wallet"
import { formatCurrency } from "@/utils/format-currency"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { BankAccountManagement } from "./bank-account-management"

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

export default function CoachWalletPage() {
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
    <CoachDashboardLayout>
      <div className="container mx-auto px-6 pb-16">
        <Tabs defaultValue="wallet-info" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="wallet-info">
              <Dumbbell className="w-4 h-4 mr-2" />
              Thông tin ví
            </TabsTrigger>
            <TabsTrigger value="bank-accounts">
              <RefreshCcw className="w-4 h-4 mr-2" />
              Tài khoản ngân hàng
            </TabsTrigger>
          </TabsList>

          <TabsContent value="wallet-info" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-3">
              <WalletSummaryCard
                title="Thu nhập đang chờ chuyển khoản"
                amount={wallet?.pendingBalance ?? 0}
                currency={wallet?.currency ?? "VND"}
                message={
                  loading
                    ? undefined
                    : wallet?.message ??
                    "Chưa có khoản thu nhập nào đang chờ chuyển khoản."
                }
                icon={<Dumbbell className="h-5 w-5 text-emerald-500" />}
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
                    <div className="flex items-center justify-center py-4">
                      <Loading size={24} className="text-green-600" />
                    </div>
                  ) : (
                    <>
                      <p className="text-emerald-700">
                        Số dư này phản ánh thu nhập coaching đang chờ chuyển tới ngân hàng
                        của bạn sau mỗi buổi huấn luyện được xác nhận hoàn thành.
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

            <div className="grid gap-6 lg:grid-cols-3">
              <Card className="lg:col-span-2 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/40">
                  <div>
                    <CardTitle className="text-base font-semibold">
                      Cách hệ thống chi trả cho huấn luyện viên
                    </CardTitle>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Không cần rút tiền thủ công – hệ thống tự động gửi tới ngân hàng của bạn.
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
                      1. Khách hàng thanh toán qua PayOS
                    </p>
                    <p className="mt-1 text-sm text-emerald-900/80">
                      Doanh thu coaching của bạn được ghi nhận dưới dạng{" "}
                      <span className="font-semibold">pendingBalance</span> (đã trừ 10% phí nền tảng).
                    </p>
                  </div>
                  <div className="rounded-lg border border-emerald-100 bg-white p-4">
                    <p className="font-medium text-emerald-800">2. Buổi huấn luyện được xác nhận</p>
                    <p className="mt-1 text-muted-foreground">
                      Khi học viên check-in hoặc hoàn tất buổi học, hệ thống thực hiện chuyển khoản
                      tới ngân hàng bạn đã cung cấp trong hồ sơ.
                    </p>
                  </div>
                  <div className="rounded-lg border border-emerald-100 bg-white p-4">
                    <p className="font-medium text-emerald-800">3. Theo dõi lịch sử</p>
                    <p className="mt-1 text-muted-foreground">
                      Bạn có thể kiểm tra lịch sử thu nhập và tình trạng chuyển khoản trong phần báo cáo.
                      Nếu số dư không giảm sau 1 ngày làm việc, hãy liên hệ admin.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <WalletInfoCard
                title="Ghi nhớ quan trọng"
                icon={
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                    <Dumbbell className="h-5 w-5" />
                  </div>
                }
                items={[
                  {
                    label: "Không cần yêu cầu rút",
                    description:
                      "Hệ thống tự động chuyển khoản. Bạn chỉ cần đảm bảo buổi coaching được xác nhận hoàn thành.",
                  },
                  {
                    label: "Cập nhật ngân hàng",
                    description:
                      "Thông tin ngân hàng được lấy từ hồ sơ huấn luyện viên. Hãy cập nhật nếu có thay đổi.",
                  },
                  {
                    label: "Thông báo realtime",
                    description:
                      "Bạn sẽ nhận được thông báo khi tiền được chuyển hoặc nếu có sự cố cần xử lý.",
                  },
                ]}
                footer={
                  wallet && (
                    <p className="text-xs text-muted-foreground">
                      Thu nhập đang chờ:{" "}
                      <span className="font-semibold text-emerald-600">
                        {formatCurrency(wallet.pendingBalance, wallet.currency)}
                      </span>
                    </p>
                  )
                }
              />
            </div>
          </TabsContent>

          <TabsContent value="bank-accounts">
            <BankAccountManagement />
          </TabsContent>
        </Tabs>
      </div>
    </CoachDashboardLayout>
  )
}

