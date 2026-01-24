'use client'

import { useEffect, useState, useMemo } from "react"
import {
  CreditCard,
  Wallet,
  ArrowDownToLine,
  Clock,
  CheckCircle,
  Loader2,
  TrendingUp,
  Calendar,
  Download,
  Filter,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  BarChart3,
  History,
  DollarSign
} from "lucide-react"
import { toast } from "sonner"

import { FieldOwnerDashboardLayout } from "@/components/layouts/field-owner-dashboard-layout"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useAppSelector, useAppDispatch } from "@/store/hook"
import { getFieldOwnerWallet, withdrawFieldOwnerBalance, getUserWithdrawalRequests } from "@/features/wallet"
import { getMyFieldsBookings } from "@/features/field/fieldThunk"
import { BankAccountManagement } from "./bank-account-management"

// Format number as VND currency
const formatVND = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount)
}

// Custom Pagination Component
const CustomPagination = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  currentStart,
  currentEnd
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems: number;
  currentStart: number;
  currentEnd: number;
}) => {
  const renderPageNumbers = () => {
    const maxPagesToShow = 5;
    const pageNumbers: number[] = [];

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      const halfMax = Math.floor(maxPagesToShow / 2);
      let startPage = Math.max(1, currentPage - halfMax);
      let endPage = Math.min(totalPages, currentPage + halfMax);

      if (currentPage <= halfMax) {
        endPage = maxPagesToShow;
      } else if (currentPage >= totalPages - halfMax) {
        startPage = totalPages - maxPagesToShow + 1;
      }

      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
    }

    return pageNumbers;
  };

  return (
    <div className="mt-6">
      <div className="flex items-center justify-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="h-8 w-8 p-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {currentPage > 3 && (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onPageChange(1)}
              className="h-8 w-8 p-0"
            >
              1
            </Button>
            {currentPage > 4 && (
              <span className="px-1">
                <MoreHorizontal className="h-4 w-4 text-gray-400" />
              </span>
            )}
          </>
        )}

        {renderPageNumbers().map((pageNum) => (
          <Button
            key={pageNum}
            variant={currentPage === pageNum ? "default" : "ghost"}
            size="sm"
            onClick={() => onPageChange(pageNum)}
            className="h-8 w-8 p-0"
          >
            {pageNum}
          </Button>
        ))}

        {currentPage < totalPages - 2 && (
          <>
            {currentPage < totalPages - 3 && (
              <span className="px-1">
                <MoreHorizontal className="h-4 w-4 text-gray-400" />
              </span>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onPageChange(totalPages)}
              className="h-8 w-8 p-0"
            >
              {totalPages}
            </Button>
          </>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="h-8 w-8 p-0"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="text-center mt-2 text-sm text-gray-500">
        Hien thi {currentStart}-{currentEnd} cua {totalItems} giao dich
      </div>
    </div>
  );
};

export default function FieldOwnerWalletPage() {
  const dispatch = useAppDispatch()
  const authUser = useAppSelector((state) => state.auth.user)
  const userId = authUser?._id ?? null

  // Wallet state
  const {
    fieldOwnerWallet,
    fieldOwnerWalletLoading,
    fieldOwnerWalletError,
    withdrawLoading,
    withdrawError,
    withdrawalRequests,
    withdrawalRequestsLoading,
    withdrawalRequestsError,
  } = useAppSelector((state) => state.wallet)

  // Bookings state for transaction history
  const {
    fieldOwnerBookings,
    fieldOwnerBookingsLoading,
    fieldOwnerBookingsError,
    fieldOwnerBookingsPagination
  } = useAppSelector((state) => state.field)

  // UI State
  const [showWithdrawModal, setShowWithdrawModal] = useState(false)
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [selectedPeriod, setSelectedPeriod] = useState<"today" | "week" | "month" | "year">("month")

  // Fetch wallet on mount
  useEffect(() => {
    if (userId) {
      dispatch(getFieldOwnerWallet(userId))
      dispatch(getUserWithdrawalRequests())
    }
  }, [userId, dispatch])

  // Debugging
  useEffect(() => {
    console.log("DEBUG: withdrawalRequests", withdrawalRequests);
    if (withdrawalRequests && withdrawalRequests.length > 0) {
      const pending = withdrawalRequests.find((req: any) => req.status === 'pending');
      console.log("DEBUG: found pending request?", pending);
    }
  }, [withdrawalRequests]);

  // Fetch bookings with pagination
  useEffect(() => {
    dispatch(getMyFieldsBookings({
      page: currentPage,
      limit: itemsPerPage,
      transactionStatus: "succeeded"
    }))
  }, [dispatch, currentPage, itemsPerPage])

  // Show error toasts
  useEffect(() => {
    if (fieldOwnerWalletError) {
      toast.error(fieldOwnerWalletError)
    }
  }, [fieldOwnerWalletError])

  useEffect(() => {
    if (withdrawError) {
      toast.error(withdrawError)
    }
  }, [withdrawError])

  // Calculate period range for analytics
  const getPeriodRange = (period: "today" | "week" | "month" | "year") => {
    const now = new Date()
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
    let start: Date

    switch (period) {
      case "today":
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        break
      case "week": {
        const day = now.getDay() || 7
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (day - 1))
        break
      }
      case "year":
        start = new Date(now.getFullYear(), 0, 1)
        break
      case "month":
      default:
        start = new Date(now.getFullYear(), now.getMonth(), 1)
        break
    }
    return { start, end }
  }

  // Calculate period revenue from bookings
  const { periodRevenue, totalTransactions, averageRevenue } = useMemo(() => {
    const bookings = fieldOwnerBookings || []
    if (!bookings.length) {
      return {
        periodRevenue: 0,
        totalTransactions: 0,
        averageRevenue: 0,
      }
    }

    const { start, end } = getPeriodRange(selectedPeriod)

    const inRange = bookings.filter((b: any) => {
      const dateStr = b.bookingDate || b.createdAt || b.date
      if (!dateStr) return false
      const d = new Date(dateStr)
      if (Number.isNaN(d.getTime())) return false
      return d >= start && d < end
    })

    const revenue = inRange.reduce(
      (sum: number, b: any) => sum + (b.bookingAmount ?? b.totalPrice ?? 0),
      0
    )
    const txCount = inRange.length
    const avg = txCount > 0 ? revenue / txCount : 0

    return {
      periodRevenue: revenue,
      totalTransactions: txCount,
      averageRevenue: avg,
    }
  }, [fieldOwnerBookings, selectedPeriod])

  const handleWithdraw = async () => {
    const amount = parseInt(withdrawAmount, 10)

    if (isNaN(amount) || amount < 10000) {
      toast.error('So tien rut toi thieu la 10.000d')
      return
    }

    if (amount > (fieldOwnerWallet?.availableBalance || 0)) {
      toast.error('So tien rut vuot qua so du kha dung')
      return
    }

    try {
      const result = await dispatch(withdrawFieldOwnerBalance({ amount })).unwrap()
      toast.success(result.message || 'Yêu cầu rút tiền đã được gửi, đang chờ admin duyệt')
      setShowWithdrawModal(false)
      setWithdrawAmount('')
      if (userId) {
        dispatch(getFieldOwnerWallet(userId))
        dispatch(getUserWithdrawalRequests())
      }
    } catch (err) {
      // Error handled by reducer
    }
  }

  // Calculate today's requests count
  const todayRequestsCount = useMemo(() => {
    if (!withdrawalRequests || withdrawalRequests.length === 0) return 0
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    return withdrawalRequests.filter((req: any) => {
      const reqDate = new Date(req.createdAt).toDateString()
      const todayStr = new Date().toDateString()
      return reqDate === todayStr &&
        (req.status === 'pending' || req.status === 'approved')
    }).length
  }, [withdrawalRequests])

  // Check if there is any pending request
  const hasPendingRequest = useMemo(() => {
    return withdrawalRequests?.some((req: any) => req.status === 'pending')
  }, [withdrawalRequests])

  // Format date for display
  const formatRequestDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      const day = date.getDate().toString().padStart(2, '0')
      const month = (date.getMonth() + 1).toString().padStart(2, '0')
      const year = date.getFullYear()
      const hours = date.getHours().toString().padStart(2, '0')
      const minutes = date.getMinutes().toString().padStart(2, '0')
      return `${day}/${month}/${year} ${hours}:${minutes}`
    } catch {
      return dateString
    }
  }

  // Get status badge color
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-700'
      case 'approved':
        return 'bg-green-100 text-green-700'
      case 'rejected':
        return 'bg-red-100 text-red-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Đang chờ duyệt'
      case 'approved':
        return 'Đã duyệt'
      case 'rejected':
        return 'Đã từ chối'
      default:
        return status
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const pendingBalance = fieldOwnerWallet?.pendingBalance || 0
  const availableBalance = fieldOwnerWallet?.availableBalance || 0

  const periods = [
    { value: "today", label: "Hôm nay" },
    { value: "week", label: "Tuần nay" },
    { value: "month", label: "Tháng nay" },
    { value: "year", label: "Năm nay" }
  ]

  const totalPages = fieldOwnerBookingsPagination?.totalPages || 1
  const totalBookings = fieldOwnerBookingsPagination?.total || 0
  const startIndex = (currentPage - 1) * itemsPerPage + 1
  const endIndex = Math.min(currentPage * itemsPerPage, totalBookings)

  return (
    <FieldOwnerDashboardLayout>
      <div className="container mx-auto px-6 pb-16">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <DollarSign className="h-8 w-8 text-green-600" />
              Trung Tâm Tài Chính
            </h1>
            <p className="text-gray-600 mt-1">
              Quản lý số dư, doanh thu và tài khoản ngân hàng
            </p>
          </div>
          {/* <Button className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Xuất báo cáo
          </Button> */}
        </div>

        {/* Top Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Available Balance Card */}
          <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-green-50">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-emerald-700">
                <CheckCircle className="w-5 h-5" />
                Số dư khả dụng
              </CardTitle>
              <CardDescription className="text-emerald-600">
                Tiền có thể rút về ngân hàng
              </CardDescription>
            </CardHeader>
            <CardContent>
              {fieldOwnerWalletLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Đang tải...</span>
                </div>
              ) : (
                <>
                  <p className="text-3xl font-bold text-emerald-700">
                    {formatVND(availableBalance)}
                  </p>
                  <Button
                    className="mt-4 bg-emerald-600 hover:bg-emerald-700"
                    disabled={availableBalance < 10000 || withdrawLoading || hasPendingRequest}
                    onClick={() => setShowWithdrawModal(true)}
                  >
                    <ArrowDownToLine className="w-4 h-4 mr-2" />
                    Rút tiền
                  </Button>
                  {hasPendingRequest && (
                    <p className="text-xs text-amber-600 mt-2">
                      Bạn đang có yêu cầu chờ duyệt
                    </p>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Pending Balance Card */}
          <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-amber-700">
                <Clock className="w-5 h-5" />
                Số dư chờ xử lý
              </CardTitle>
              <CardDescription className="text-amber-600">
                Tiền đang chờ khách check-in
              </CardDescription>
            </CardHeader>
            <CardContent>
              {fieldOwnerWalletLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Đang tải...</span>
                </div>
              ) : (
                <>
                  <p className="text-3xl font-bold text-amber-700">
                    {formatVND(pendingBalance)}
                  </p>
                  <p className="text-sm text-amber-600 mt-2">
                    Sẽ được mở khóa sau khi khách check-in
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          {/* Period Revenue Card */}
          <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-blue-700">
                <TrendingUp className="w-5 h-5" />
                Doanh thu {periods.find(p => p.value === selectedPeriod)?.label.toLowerCase()}
              </CardTitle>
              <CardDescription className="text-blue-600">
                Từ {totalTransactions} giao dịch thành công
              </CardDescription>
            </CardHeader>
            <CardContent>
              {fieldOwnerBookingsLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Đang tải...</span>
                </div>
              ) : (
                <p className="text-3xl font-bold text-blue-700">
                  {formatVND(periodRevenue)}
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="mb-6 grid w-full grid-cols-4 lg:w-auto lg:inline-flex">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Wallet className="w-4 h-4" />
              <span className="hidden sm:inline">Tổng quan</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Phân tích</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="w-4 h-4" />
              <span className="hidden sm:inline">Lịch sử</span>
            </TabsTrigger>
            <TabsTrigger value="bank-accounts" className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              <span className="hidden sm:inline">Ngân hàng</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <Card>
              <CardHeader>
                <CardTitle>Thông tin ví</CardTitle>
                <CardDescription>
                  {fieldOwnerWallet?.message || 'Tong quan so du tai khoan cua ban'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b">
                  <span className="text-muted-foreground">Tiền cho check-in (Pending)</span>
                  <span className="font-semibold text-amber-600">{formatVND(pendingBalance)}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b">
                  <span className="text-muted-foreground">Tiền có thể rút (Available)</span>
                  <span className="font-semibold text-emerald-600">{formatVND(availableBalance)}</span>
                </div>

                <div className="flex justify-between items-center py-3">
                  <span className="text-muted-foreground">Tổng cộng</span>
                  <span className="font-bold text-lg">{formatVND(pendingBalance + availableBalance)}</span>
                </div>

                {availableBalance > 0 && availableBalance < 10000 && (
                  <p className="text-sm text-amber-600 mt-2">
                    Cần tối thiểu 10.000đ để rút tiền
                  </p>
                )}

                <div className="pt-4">
                  <Button
                    className="w-full bg-emerald-600 hover:bg-emerald-700"
                    disabled={availableBalance < 10000 || withdrawLoading}
                    onClick={() => setShowWithdrawModal(true)}
                  >
                    <ArrowDownToLine className="w-4 h-4 mr-2" />
                    Rút tiền về ngân hàng
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <div className="space-y-6">
              {/* Period Filter */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Filter className="h-5 w-5" />
                    Lọc Theo Thời Gian
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2 flex-wrap">
                    {periods.map((period) => (
                      <Button
                        key={period.value}
                        variant={selectedPeriod === period.value ? "default" : "outline"}
                        onClick={() => setSelectedPeriod(period.value as any)}
                        className={selectedPeriod === period.value ? "bg-green-600 hover:bg-green-700" : ""}
                      >
                        {period.label}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Revenue Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium text-gray-600">
                      Doanh thu ({periods.find(p => p.value === selectedPeriod)?.label.toLowerCase()})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-gray-900">
                      {formatVND(periodRevenue)}
                    </div>
                    <div className="flex items-center gap-1 mt-2 text-sm text-gray-600">
                      <TrendingUp className="h-4 w-4" />
                      <span>Tu cac giao dich thanh cong</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium text-gray-600">
                      Số giao dịch
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-gray-900">
                      {totalTransactions}
                    </div>
                    <div className="flex items-center gap-1 mt-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>Giao dịch thành công</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium text-gray-600">
                      Doanh thu trung bình
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-gray-900">
                      {formatVND(Math.round(averageRevenue))}
                    </div>
                    <div className="flex items-center gap-1 mt-2 text-sm text-gray-600">
                      <span>Trên mỗi giao dịch</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Revenue Chart Placeholder */}
              <Card>
                <CardHeader>
                  <CardTitle>Biểu đồ Doanh thu</CardTitle>
                  <CardDescription>
                    Doanh thu theo thời gian
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                    <div className="text-center text-gray-500">
                      <TrendingUp className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                      <p>Biểu đồ doanh thu sẽ được hiển thị ở đây</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Lịch sử giao dịch</CardTitle>
                    <CardDescription>
                      Danh sách các giao dịch thành công ({totalBookings} giao dịch)
                    </CardDescription>
                  </div>
                  {totalBookings > itemsPerPage && (
                    <div className="text-sm text-gray-500">
                      Trang {currentPage} / {totalPages}
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {fieldOwnerBookingsLoading ? (
                  <div className="flex items-center justify-center py-12 text-green-600">
                    <Loader2 className="w-8 h-8 animate-spin mr-2" />
                    <span className="text-gray-600">Đang tải dữ liệu...</span>
                  </div>
                ) : fieldOwnerBookingsError ? (
                  <div className="text-center py-8 text-red-500">
                    <p>Lỗi tải dữ liệu</p>
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => {
                        setCurrentPage(1)
                        dispatch(getMyFieldsBookings({
                          page: 1,
                          limit: itemsPerPage,
                          transactionStatus: "succeeded"
                        }))
                      }}
                    >
                      Thử lại
                    </Button>
                  </div>
                ) : fieldOwnerBookings?.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>Chưa có giao dịch nào</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-4">
                      {fieldOwnerBookings?.map((booking: any, index: number) => (
                        <div
                          key={booking.bookingId || index}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">
                              {booking.fieldName || "sân thể thao"}
                            </p>
                            <p className="text-sm text-gray-600">
                              {booking.date ? new Date(booking.date).toLocaleDateString('vi-VN') : "N/A"}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-green-600">
                              +{formatVND(booking.totalPrice || booking.bookingAmount || 0)}
                            </p>
                            <p className="text-xs text-gray-500">
                              {booking.status || "Đã xác nhận"}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {totalBookings > itemsPerPage && (
                      <CustomPagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                        totalItems={totalBookings}
                        currentStart={startIndex}
                        currentEnd={endIndex}
                      />
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Bank Accounts Tab */}
          <TabsContent value="bank-accounts">
            <BankAccountManagement />
          </TabsContent>
        </Tabs>
      </div>

      {/* Withdrawal Modal */}
      <Dialog open={showWithdrawModal} onOpenChange={setShowWithdrawModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rút tiền về ngân hàng</DialogTitle>
            <DialogDescription>
              Số dư khả dụng: <span className="font-semibold text-emerald-600">{formatVND(availableBalance)}</span>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Số tiền muốn rút (VND)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="Nhap so tien"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                min={10000}
                max={availableBalance}
              />
              <p className="text-xs text-muted-foreground">
                Tối thiểu: 10.000đ | Tối đa: {formatVND(availableBalance)}
              </p>
            </div>

            {withdrawAmount && parseInt(withdrawAmount, 10) > 0 && (
              <div className="bg-muted p-3 rounded-lg">
                <p className="text-sm">
                  Bạn sẽ rút: <span className="font-semibold">{formatVND(parseInt(withdrawAmount, 10) || 0)}</span>
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowWithdrawModal(false)}
              disabled={withdrawLoading}
            >
              Hủy
            </Button>
            <Button
              onClick={handleWithdraw}
              disabled={withdrawLoading || !withdrawAmount || parseInt(withdrawAmount, 10) < 10000 || todayRequestsCount >= 3}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {withdrawLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  <ArrowDownToLine className="w-4 h-4 mr-2" />
                  Xác nhận rút tiền
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </FieldOwnerDashboardLayout>
  )
}
