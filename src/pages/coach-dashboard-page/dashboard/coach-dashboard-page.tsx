"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Clock,
  DollarSign,
  MoreHorizontal,
  Building2,
  Rocket as Racquet,
  User,
  TrendingUp,
} from "lucide-react"
import { CoachDashboardLayout } from "@/components/layouts/coach-dashboard-layout"
import { useState, useEffect } from "react"
import { Loading } from "@/components/ui/loading"
import { useSelector, useDispatch } from "react-redux"
import type { Booking } from "@/types/booking-type"
import axiosPublic from "@/utils/axios/axiosPublic"
import { getCoachById, clearCurrentCoach } from "@/features/coach"
import type { RootState, AppDispatch } from "@/store/store"

export default function CoachDashboardPage() {
  const dispatch = useDispatch<AppDispatch>()
  const { detailLoading, detailError } = useSelector((state: RootState) => state.coach)

  const [coachId, setCoachId] = useState<string | null>(null)
  const [bookingRequests, setBookingRequests] = useState<Booking[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 3

  const formatCurrency = (amount?: number) =>
    `${(amount ?? 0).toLocaleString("vi-VN")} ₫`

  const normalizeId = (id: any): string => {
    if (!id) return ""
    if (typeof id === "string") return id
    if (id._bsontype === "ObjectID" && id.id) {
      return Buffer.from(id.id).toString("hex")
    }
    if (id.buffer) {
      return Object.values(id.buffer)
        .map((b) => Number(b).toString(16).padStart(2, "0"))
        .join("")
    }
    return ""
  }

  useEffect(() => {
    const loadCoachData = async () => {
      const storedUser = sessionStorage.getItem("user")
      if (!storedUser) return
      const user = JSON.parse(storedUser)
      if (!user?._id) return

      const res = await axiosPublic.get(`/profiles/coach-id/${user._id}`)
      const fetchedCoachId = res.data?.data?.id
      setCoachId(fetchedCoachId)

      if (fetchedCoachId) {
        dispatch(getCoachById(fetchedCoachId))
        const bookingRes = await axiosPublic.get(`/bookings/coach/${fetchedCoachId}`)
        setBookingRequests(bookingRes.data?.data || [])
      }
    }

    loadCoachData()
  }, [dispatch])
  const handleCompleteBooking = async (bookingId: string) => {
    if (!coachId) return

    await axiosPublic.patch(
      `/bookings/coach/${coachId}/${bookingId}/complete`
    )

    setBookingRequests((prev) =>
      prev.map((b) =>
        normalizeId(b._id) === bookingId
          ? { ...b, status: "completed" }
          : b
      )
    )
  }

  const handleCancelBooking = async (bookingId: string) => {
    if (!coachId) return

    await axiosPublic.patch(
      `/bookings/coach/${coachId}/${bookingId}/cancel`
    )

    setBookingRequests((prev) =>
      prev.map((b) =>
        normalizeId(b._id) === bookingId
          ? { ...b, coachStatus: "declined" }
          : b
      )
    )
  }
  useEffect(() => {
    return () => {
      dispatch(clearCurrentCoach())
    }
  }, [dispatch])

  const getDisplayStatus = (b: any) => {
    if (b.status === "completed") return "completed"
    if (b.coachStatus === "declined") return "cancelled"
    return "ongoing"
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const isToday = (d?: string | Date) => {
    if (!d) return false
    const date = new Date(d)
    date.setHours(0, 0, 0, 0)
    return date.getTime() === today.getTime()
  }

  const isFuture = (d?: string | Date) => {
    if (!d) return false
    const date = new Date(d)
    date.setHours(0, 0, 0, 0)
    return date.getTime() > today.getTime()
  }

  const filteredBookings = bookingRequests.filter(
    (b) => b.coachStatus === "pending" || b.coachStatus === "declined"
  )

  const totalPages = Math.max(1, Math.ceil(filteredBookings.length / ITEMS_PER_PAGE))
  const paginatedBookings = filteredBookings.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  const todayBookings = bookingRequests.filter(
    (b) => isToday(b.date)
  )

  const upcomingFutureBookings = bookingRequests.filter(
    (b) => b.coachStatus === "accepted" && isFuture(b.date)
  )

  const metrics = [
    {
      title: "Tổng lượt đặt",
      value: bookingRequests.length,
      icon: Building2,
      gradient: "from-blue-500 to-blue-600",
    },
    {
      title: "Đã xác nhận",
      value: bookingRequests.filter((b) => b.coachStatus === "accepted").length,
      icon: Racquet,
      gradient: "from-emerald-500 to-emerald-600",
    },
    {
      title: "Hoàn thành",
      value: bookingRequests.filter((b) => b.status === "completed").length,
      icon: User,
      gradient: "from-violet-500 to-violet-600",
    },
    {
      title: "Thu nhập",
      value: formatCurrency(
        bookingRequests
          .filter((b) => b.status === "completed")
          .reduce((s, b: any) => s + (b.bookingAmount ?? 0), 0)
      ),
      icon: DollarSign,
      gradient: "from-orange-500 to-orange-600",
    },
  ]

  const recentActivity = [...bookingRequests]
    .sort(
      (a: any, b: any) =>
        new Date(b.createdAt || b.date).getTime() -
        new Date(a.createdAt || a.date).getTime()
    )
    .slice(0, 5)

  if (detailLoading) {
    return (
      <CoachDashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="flex-1 flex items-center justify-center p-12">
            <Loading size={48} className="text-green-600" />
          </div>
        </div>
      </CoachDashboardLayout>
    )
  }

  if (detailError) {
    return (
      <CoachDashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-red-600">{detailError.message}</p>
        </div>
      </CoachDashboardLayout>
    )
  }

  return (
    <CoachDashboardLayout>
      <div className="px-6 py-8 space-y-12">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Tổng quan hoạt động huấn luyện
            </p>
          </div>
          <Badge className="bg-green-100 text-green-700 flex items-center gap-1">
            <TrendingUp className="w-4 h-4" />
            Đang hoạt động
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((m, i) => (
            <Card
              key={i}
              className="relative overflow-hidden rounded-2xl border-0 shadow-md"
            >
              <div
                className={`absolute inset-0 opacity-10 bg-gradient-to-br ${m.gradient}`}
              />
              <CardContent className="relative p-5 flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{m.title}</p>
                  <p className="text-2xl font-bold mt-1">{m.value}</p>
                </div>
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${m.gradient} flex items-center justify-center text-white`}
                >
                  <m.icon className="w-6 h-6" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="rounded-2xl border-0 shadow-md">
          <CardHeader>
            <CardTitle>Buổi học hôm nay</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            {todayBookings.map((b: any) => {
              const user = b.user ?? {}
              const name = user.fullName ?? "Unknown"
              const initials = name
                .split(" ")
                .map((w: string) => w[0])
                .join("")
              const bookingId = normalizeId(b._id)

              const displayStatus = getDisplayStatus(b)

              return (
                <div
                  key={bookingId}
                  className={`flex items-center gap-4 p-4 rounded-xl
        ${displayStatus === "completed"
                      ? "bg-green-50"
                      : displayStatus === "cancelled"
                        ? "bg-red-50"
                        : "bg-gradient-to-r from-gray-50 to-gray-100"
                    }
      `}
                >
                  <Avatar className="h-11 w-11">
                    {user.avatarUrl ? (
                      <AvatarImage src={user.avatarUrl} />
                    ) : (
                      <AvatarFallback className="bg-green-600 text-white font-semibold">
                        {initials}
                      </AvatarFallback>
                    )}
                  </Avatar>

                  <div className="flex-1">
                    <p className="font-semibold">{name}</p>
                    <p className="text-sm text-muted-foreground">
                      {b.startTime} - {b.endTime}
                    </p>
                  </div>

                  <div className="text-lg font-bold text-green-600">
                    {formatCurrency(b.bookingAmount)}
                  </div>

                  {/* STATUS / ACTION */}
                  {displayStatus === "ongoing" && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => handleCompleteBooking(bookingId)}
                      >
                        Hoàn thành
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        className="border-red-500 text-red-600 hover:bg-red-50"
                        onClick={() => handleCancelBooking(bookingId)}
                      >
                        Hủy
                      </Button>
                    </div>
                  )}

                  {displayStatus === "completed" && (
                    <Badge className="bg-green-100 text-green-700">
                      Đã hoàn thành
                    </Badge>
                  )}

                  {displayStatus === "cancelled" && (
                    <Badge className="bg-red-100 text-red-700">
                      Đã hủy
                    </Badge>
                  )}
                </div>
              )
            })}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3">
            <Card className="rounded-2xl border-0 shadow-md">
              <CardHeader>
                <CardTitle>Yêu cầu đặt lịch</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {paginatedBookings.map((b: any) => {
                  const user = b.user ?? {}
                  const name = user.fullName ?? "Unknown"
                  const initials = name.split(" ").map((w: string) => w[0]).join("")
                  return (
                    <div
                      key={normalizeId(b._id)}
                      className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 transition"
                    >
                      <Avatar className="h-11 w-11">
                        {user.avatarUrl ? (
                          <AvatarImage src={user.avatarUrl} />
                        ) : (
                          <AvatarFallback className="bg-green-600 text-white font-semibold">{initials}</AvatarFallback>
                        )}
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-semibold">{name}</p>
                        <p className="text-sm text-muted-foreground">
                          {b.startTime} - {b.endTime}
                        </p>
                      </div>
                      <div className="font-semibold text-green-700">
                        {formatCurrency((b as any).bookingAmount)}
                      </div>
                      <Badge
                        className={
                          b.coachStatus === "pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                        }
                      >
                        {b.coachStatus}
                      </Badge>
                    </div>
                  )
                })}
                {totalPages > 1 && (
                  <div className="flex justify-center gap-2 pt-2">
                    <Button
                      variant="outline"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((p) => p - 1)}
                    >
                      Prev
                    </Button>
                    <Button
                      variant="outline"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage((p) => p + 1)}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card className="rounded-2xl border-0 shadow-md">
              <CardHeader>
                <CardTitle>Lịch sắp tới</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {upcomingFutureBookings.length === 0 && (
                  <p className="text-muted-foreground text-center">
                    Không có lịch sắp tới
                  </p>
                )}
                {upcomingFutureBookings.map((b: any) => {
                  const user = b.user ?? {}
                  const name = user.fullName ?? "Unknown"
                  const initials = name.split(" ").map((w: string) => w[0]).join("")
                  return (
                    <div
                      key={normalizeId(b._id)}
                      className="flex items-center gap-3 p-4 rounded-xl bg-gray-50"
                    >
                      <Avatar>
                        {user.avatarUrl ? (
                          <AvatarImage src={user.avatarUrl} />
                        ) : (
                          <AvatarFallback className="bg-green-600 text-white font-semibold">{initials}</AvatarFallback>
                        )}
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-semibold text-sm">{name}</p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {b.startTime} - {b.endTime}
                        </div>
                      </div>
                      <div className="text-sm font-semibold text-green-700">
                        {formatCurrency((b as any).bookingAmount)}
                      </div>
                      <Button size="icon" variant="ghost">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          </div>
        </div>

        <Card className="rounded-2xl border-0 shadow-md">
          <CardHeader>
            <CardTitle>Hoạt động gần đây</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivity.map((b: any) => {
              const user = b.user ?? {}
              const name = user.fullName ?? "Unknown"
              const initials = name.split(" ").map((w: string) => w[0]).join("")
              return (
                <div
                  key={normalizeId(b._id)}
                  className="flex items-center gap-4 p-4 rounded-xl bg-gray-50"
                >
                  <Avatar className="h-10 w-10">
                    {user.avatarUrl ? (
                      <AvatarImage src={user.avatarUrl} alt={name} />
                    ) : (
                      <AvatarFallback className="bg-green-600 text-white font-semibold">{initials}</AvatarFallback>
                    )}
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{name}</p>
                    <p className="text-xs text-muted-foreground">
                      {b.startTime} - {b.endTime}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-green-700">
                    {formatCurrency((b as any).bookingAmount)}
                  </span>
                </div>
              )
            })}
          </CardContent>
        </Card>
      </div>
    </CoachDashboardLayout>
  )
}
