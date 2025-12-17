"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Clock, DollarSign, MoreHorizontal, Building2, Rocket as Racquet, User, Edit, ChevronDown } from "lucide-react"
import { CoachDashboardTabs } from "@/components/tabs/coach-dashboard-tabs"
import { NavbarDarkComponent } from "@/components/header/navbar-dark-component"
import { CoachDashboardHeader } from "@/components/header/coach-dashboard-header"
import { useState, useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import type { Booking } from "@/types/booking-type"
import axiosPublic from "@/utils/axios/axiosPublic";
import { PageWrapper } from '@/components/layouts/page-wrapper'
import { getCoachById, clearCurrentCoach } from "@/features/coach"
import type { RootState, AppDispatch } from "@/store/store"

export default function CoachDashboardPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { currentCoach, detailLoading, detailError } = useSelector((state: RootState) => state.coach);

  const [coachId, setCoachId] = useState<string | null>(null);
  const [bookingRequests, setBookingRequests] = useState<Booking[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 3;

  // -------------------------
  // Helpers
  // -------------------------
  const formatDate = (dateStr?: string | Date) => {
    if (!dateStr) return "N/A";
    try {
      const date = typeof dateStr === "string" ? new Date(dateStr) : dateStr;
      return date.toLocaleDateString("vi-VN", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return String(dateStr);
    }
  };

  const formatTime = (time24h?: string) => {
    if (!time24h) return "N/A";
    try {
      const [hours, minutes] = time24h.split(":");
      const h = parseInt(hours, 10);
      const period = h >= 12 ? "PM" : "AM";
      const hour12 = h % 12 || 12;
      return `${hour12.toString().padStart(2, "0")}:${minutes} ${period}`;
    } catch {
      return time24h;
    }
  };

  const formatCurrency = (amount?: number) => {
    if (!amount && amount !== 0) return "0 ₫";
    return `${amount!.toLocaleString('vi-VN')} ₫`;
  };

  // Normalize various _id formats (same as your previous normalizeId)
  const normalizeId = (id: any): string => {
    if (!id) return "";
    if (typeof id === "string") return id;
    if (id._bsontype === "ObjectID" && id.id) {
      return Buffer.from(id.id).toString("hex");
    }
    if (id.buffer) {
      return Object.values(id.buffer)
        .map((b) => Number(b).toString(16).padStart(2, "0"))
        .join("");
    }
    return "";
  };

  // -------------------------
  // Load coach & bookings
  // -------------------------
  useEffect(() => {
    const loadCoachData = async () => {
      const storedUser = sessionStorage.getItem("user");
      if (!storedUser) {
        console.warn("[useEffect] No user found in sessionStorage");
        return;
      }

      let user;
      try {
        user = JSON.parse(storedUser);
      } catch (error) {
        console.error("[useEffect] Error parsing user from sessionStorage:", error);
        return;
      }

      const userId = user?._id;
      if (!userId) {
        console.warn("[useEffect] user._id not found");
        return;
      }

      try {
        const response = await axiosPublic.get(`/profiles/coach-id/${userId}`);
        const fetchedCoachId = response.data?.data?.id;
        console.log("[DEBUG] coach id from userid:", fetchedCoachId);

        setCoachId(fetchedCoachId);

        if (fetchedCoachId) {
          // fetch coach detail in redux
          dispatch(getCoachById(fetchedCoachId));
          // fetch bookings belonging to this coach
          const bookingRes = await axiosPublic.get(`/bookings/coach/${fetchedCoachId}`);
          setBookingRequests(bookingRes.data?.data || []);
        }
      } catch (err) {
        console.error("[loadCoachData] Error fetching coachId or bookings:", err);
      }
    };

    loadCoachData();
  }, [dispatch]);

  // cleanup
  useEffect(() => {
    return () => {
      dispatch(clearCurrentCoach());
    };
  }, [dispatch]);

  // -------------------------
  // Booking management handlers
  // -------------------------
  const refreshBookings = async () => {
    if (!coachId) return;
    try {
      const bookingRes = await axiosPublic.get(`/bookings/coach/${coachId}`);
      setBookingRequests(bookingRes.data?.data || []);
    } catch (err) {
      console.error("[refreshBookings] Error fetching bookings:", err);
    }
  };

  const handleAccept = async (bookingId: any) => {
    if (!coachId) return;
    try {
      const normalizedId = normalizeId(bookingId);
      // API call
      await axiosPublic.patch(`/bookings/accept`, {
        coachId,
        bookingId: normalizedId,
      });

      // optimistic update - mark as accepted
      setBookingRequests((prev) =>
        prev.map((b) =>
          normalizeId((b as any)._id) === normalizedId ? { ...b, coachStatus: "accepted" } : b
        )
      );

      // refresh to be safe
      await refreshBookings();
    } catch (err) {
      console.error("[handleAccept]", err);
    }
  };

  const handleDecline = async (bookingId: any, reason?: string) => {
    if (!coachId) return;
    try {
      const normalizedId = normalizeId(bookingId);
      await axiosPublic.patch(`/bookings/decline`, {
        coachId,
        bookingId: normalizedId,
        reason: reason || "No reason provided",
      });

      setBookingRequests((prev) =>
        prev.map((b) =>
          normalizeId((b as any)._id) === normalizedId ? { ...b, coachStatus: "declined" } : b
        )
      );

      // refresh to be safe
      await refreshBookings();
    } catch (err) {
      console.error("[handleDecline]", err);
    }
  };

  // -------------------------
  // Derived booking lists & pagination
  // -------------------------
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const isToday = (dateStr?: string | Date) => {
    if (!dateStr) return false;
    const d = typeof dateStr === "string" ? new Date(dateStr) : dateStr;
    d.setHours(0, 0, 0, 0);
    return d.getTime() === today.getTime();
  };

  const isFuture = (dateStr?: string | Date) => {
    if (!dateStr) return false;
    const d = typeof dateStr === "string" ? new Date(dateStr) : dateStr;
    d.setHours(0, 0, 0, 0);
    return d.getTime() > today.getTime();
  };

  // bookings that require coach action (pending / declined)
  const filteredBookings = bookingRequests.filter(
    (c) => c.coachStatus === "pending" || c.coachStatus === "declined"
  );

  const totalPages = Math.max(1, Math.ceil(filteredBookings.length / ITEMS_PER_PAGE));
  const validCurrentPage = Math.min(currentPage, totalPages);

  const paginatedBookings = filteredBookings.slice(
    (validCurrentPage - 1) * ITEMS_PER_PAGE,
    validCurrentPage * ITEMS_PER_PAGE
  );

  // ongoing today for coach (accepted & transaction succeeded optional)
  const ongoingTodayBookings = bookingRequests.filter(
    (b) => b.coachStatus === "accepted" && isToday(b.date)
  );

  const upcomingFutureBookings = bookingRequests.filter(
    (b) => b.coachStatus === "accepted" && isFuture(b.date)
  );

  // -------------------------
  // Metrics: use Option A for revenue:
  // revenue = sum bookingAmount for bookings with transactionStatus==='succeeded' && coachStatus==='accepted'
  // -------------------------
  const totalBookings = bookingRequests.length;
  const acceptedBookings = bookingRequests.filter(b => b.coachStatus === "accepted").length;

  const totalRevenue = bookingRequests
    .filter(b => (b as any).transactionStatus === 'succeeded' && b.coachStatus === 'accepted')
    .reduce((sum, b) => {
      if (typeof (b as any).bookingAmount === "number") {
        return sum + (b as any).bookingAmount;
      } else {
        // fallback: try totalPrice or bookingAmount default
        const totalPrice = (b as any).totalPrice ?? 0;
        const platformFeeRate = 0.05;
        const ownerRevenue = totalPrice * (1 - platformFeeRate);
        return sum + ownerRevenue;
      }
    }, 0);

  const metrics = [
    {
      title: "Tổng lượt đặt",
      value: totalBookings.toString(),
      icon: Building2,
      color: "text-[#00775C]",
    },
    {
      title: "Đã xác nhận",
      value: acceptedBookings.toString(),
      icon: Racquet,
      color: "text-[#00775C]",
    },
    {
      title: "Buổi đã hoàn thành",
      value: currentCoach?.completedSessions?.toString() || "0",
      icon: User,
      color: "text-[#00775C]",
    },
    {
      title: "Tổng thu nhập",
      value: `${formatCurrency(totalRevenue)}`,
      icon: DollarSign,
      color: "text-[#00775C]",
    },
  ];

  // Recent activity: 5 most recent bookings by createdAt or date
  const recentActivity = [...bookingRequests]
    .sort((a, b) => {
      const aDate = (a as any).createdAt || a.date;
      const bDate = (b as any).createdAt || b.date;
      return new Date(bDate).getTime() - new Date(aDate).getTime();
    })
    .slice(0, 5)
    .map(b => {
      const user = typeof b.user === "string" ? { fullName: "Unknown" } : (b.user as any);
      return {
        bookingId: normalizeId((b as any)._id),
        userName: user?.fullName || "Người dùng không xác định",
        fieldName: b.field ? ((b.field as any)?.name || "Sân không xác định") : " - ",
        date: b.date ? new Date(b.date).toLocaleDateString("vi-VN", { day: "2-digit", month: "short", year: "numeric" }) : "N/A",
        time: `${b.startTime || "N/A"} - ${b.endTime || "N/A"}`,
        amount: (b as any).bookingAmount ? formatCurrency((b as any).bookingAmount) : ((b as any).totalPrice ? formatCurrency((b as any).totalPrice) : "0 ₫"),
        status: b.coachStatus || "N/A",
        transactionStatus: (b as any).transactionStatus || "N/A"
      };
    });

  // Debug
  useEffect(() => {
    console.log("[DEBUG] coachId, bookings:", { coachId, bookingRequests });
  }, [coachId, bookingRequests]);

  // Loading / error UI
  if (detailLoading) {
    return (
      <>
        <NavbarDarkComponent />
        <PageWrapper>
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p className="text-muted-foreground">
                Loading coach dashboard...
              </p>
            </div>
          </div>
        </PageWrapper>
      </>
    );
  }

  if (detailError) {
    return (
      <>
        <NavbarDarkComponent />
        <PageWrapper>
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <p className="text-red-600 mb-4">Error loading coach data: {detailError.message}</p>
              <Button onClick={() => coachId && dispatch(getCoachById(coachId))}>
                Retry
              </Button>
            </div>
          </div>
        </PageWrapper>
      </>
    );
  }

  // -------------------------
  // Render
  // -------------------------
  return (
    <>
      <NavbarDarkComponent />
      <PageWrapper>
        <div className="min-h-screen">
          <CoachDashboardHeader />
          <CoachDashboardTabs />

          <div className="max-w-[1320px] mx-auto py-8 space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Statistics */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl p-4 shadow-lg">
                  <div>
                    <h4 className="text-xl font-semibold mb-1 text-start">Statistics</h4>
                    <p className="text-muted-foreground mb-4 text-start">
                      Track progress and improve coaching performance
                    </p>
                  </div>
                  <div className="border-t border-gray-100 my-4" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {metrics.map((metric, index) => (
                      <Card key={index} className="bg-gray-50 border-0 shadow-none">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="text-xl font-bold text-green-600 text-start">{metric.value}</h3>
                              <p className="text-sm text-muted-foreground text-start">{metric.title}</p>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                              <metric.icon className="w-6 h-6 text-blue-600" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>

            </div>

            {/* Ongoing Appointment */}
            <Card className="bg-white rounded-xl p-6 shadow-lg border-0">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold mb-2 text-start">
                    Ongoing Appointment
                  </CardTitle>
                  <p className="text-muted-foreground text-start">
                    Manage appointments with our convenient scheduling system
                  </p>
                </div>
                <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={() => { /* implement batch complete if needed */ }}>
                  Complete
                </Button>
              </CardHeader>
              <div className="border-t border-gray-100" />
              <CardContent>
                {ongoingTodayBookings.length === 0 ? (
                  <p className="text-muted-foreground text-center">No ongoing appointments today</p>
                ) : (
                  ongoingTodayBookings.map((booking: Booking) => {
                    const userName =
                      typeof booking.user === "string"
                        ? "Unknown User"
                        : (booking.user as any)?.fullName || "Unknown User";
                    const initials = userName
                      .split(" ")
                      .map((w) => w[0])
                      .join("")
                      .toUpperCase();

                    const fieldName = booking.field ? ((booking.field as any)?.name || "Unknown Field") : "Unknown Field";

                    const bookingDate = booking.date
                      ? new Date(booking.date).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })
                      : "N/A";

                    return (
                      <div
                        key={normalizeId((booking as any)._id)}
                        className="flex items-center p-4 bg-gray-50 rounded-lg mb-2"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Building2 className="w-6 h-6 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-start">{fieldName}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 ml-4">
                          <Avatar className="h-10 w-10">
                            {typeof booking.user !== "string" && (booking.user as any)?.avatarUrl ? (
                              <AvatarImage src={(booking.user as any).avatarUrl} alt={userName} />
                            ) : (
                              <AvatarFallback className="bg-orange-100 text-orange-600">{initials}</AvatarFallback>
                            )}
                          </Avatar>
                          <span className="font-medium text-start">{userName}</span>
                        </div>

                        <div className="flex-1 grid grid-cols-4 gap-6 text-sm ml-4">
                          <div>
                            <p className="font-medium text-muted-foreground text-start">Appointment Date</p>
                            <p className="text-start">{bookingDate}</p>
                          </div>
                          <div>
                            <p className="font-medium text-muted-foreground text-start">Start Time</p>
                            <p className="text-start">{booking.startTime}</p>
                          </div>
                          <div>
                            <p className="font-medium text-muted-foreground text-start">End Time</p>
                            <p className="text-start">{booking.endTime}</p>
                          </div>
                          <div>
                            <p className="text-start">
                              {(booking.field as any)?.location?.address || "Unknown Location"}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>

            {/* Availability */}
            <Card className="bg-white rounded-xl p-6 shadow-lg border-0">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold mb-2 text-start">My Availability</CardTitle>
                  <p className="text-muted-foreground text-start">
                    Easily communicate your availability for a seamless coaching experience.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Button variant="outline" className="flex items-center gap-2 bg-transparent">
                    <span>This Week</span>
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                  <Button className="bg-gray-600 hover:bg-gray-700 text-white flex items-center gap-2">
                    <Edit className="w-4 h-4" />
                    Edit Availability
                  </Button>
                </div>
              </CardHeader>
              <div className="border-t border-gray-100" />
              <CardContent className="pt-6">
                <div className="grid grid-cols-6 gap-4">
                  {currentCoach?.availableSlots?.length ? (
                    currentCoach.availableSlots.map((slot: any, index: number) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-4 text-center">
                        <div className="mb-3">
                          <p className="text-sm font-semibold text-gray-900">{formatDate(new Date(Date.now() + index * 24 * 60 * 60 * 1000))}</p>
                          <p className="text-xs text-gray-600">{new Date(Date.now() + index * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", { weekday: "long" })}</p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-gray-700">Time</p>
                          <p className="text-xs text-green-600 font-medium">{`${slot.startTime} to ${slot.endTime}`}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    // fallback mock week if no availability present
                    ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d, idx) => (
                      <div key={idx} className="bg-gray-50 rounded-lg p-4 text-center">
                        <div className="mb-3">
                          <p className="text-sm font-semibold text-gray-900">23 Jul 2023</p>
                          <p className="text-xs text-gray-600">{d}</p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-gray-700">Time</p>
                          <p className="text-xs text-green-600 font-medium">09:00 AM to 7:00 PM</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Bookings & Right column (wallet, upcoming) */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
              <div className="lg:col-span-3 space-y-8">
                {/* Booking Requests */}
                <Card className="bg-white rounded-xl p-6 shadow-lg border-0">
                  <CardHeader className="flex flex-row items-center justify-between py-2">
                    <div className="flex flex-col space-y-1">
                      <CardTitle className="text-lg font-semibold mb-2 text-start">
                        Yêu cầu đặt lịch
                      </CardTitle>
                      <p className="text-muted-foreground text-start">
                        Quản lý yêu cầu đặt lịch từ học viên
                      </p>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4 text-start">
                    <div className="border-t border-gray-100" />

                    {paginatedBookings.map((request) => {
                      const userName = typeof request.user === "string" ? request.user : (request.user as any)?.fullName || "Unknown User";
                      const initials = userName.split(" ").map((w) => w[0]).join("").toUpperCase();
                      const bookingDate = request.date ? new Date(request.date).toLocaleDateString() : "N/A";
                      const isDeclined = request.coachStatus === "declined";

                      return (
                        <div key={normalizeId((request as any)._id)}>
                          <div className="flex items-center gap-4 p-4">
                            <Avatar className="h-12 w-12">
                              {typeof request.user === "object" &&
                                (request.user as any)?.avatarUrl ? (
                                <AvatarImage
                                  src={(request.user as any).avatarUrl}
                                  alt={userName}
                                />
                              ) : (
                                <AvatarFallback className="bg-green-500 text-white font-semibold text-xs">
                                  {initials}
                                </AvatarFallback>
                              )}
                            </Avatar>

                            <div className="flex-1 grid grid-cols-3 gap-4 text-sm text-start">
                              <div>
                                <p className="font-medium">{userName}</p>
                                <p className="text-muted-foreground capitalize">{request.type || "-"}</p>
                                <p className="text-muted-foreground">
                                  {bookingDate} — {request.startTime || "N/A"} - {request.endTime || "N/A"}
                                </p>
                              </div>

                              <div>
                                <p className="font-medium">Trạng thái</p>
                                <p className={`capitalize font-semibold ${request.coachStatus === "pending" ? "text-yellow-600" : request.coachStatus === "declined" ? "text-red-600" : "text-gray-500"}`}>
                                  {request.coachStatus || "N/A"}
                                </p>
                              </div>

                              <div className="flex items-center justify-between">
                                {!isDeclined && (
                                  <div className="flex space-x-2">
                                    <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleAccept((request as any)._id)}>
                                      Accept
                                    </Button>
                                    <Button size="sm" variant="outline" onClick={() => handleDecline((request as any)._id)}>
                                      Decline
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="border-t border-gray-100 mx-4" />
                        </div>
                      );
                    })}

                    {totalPages > 1 && (
                      <div className="flex justify-center mt-4 space-x-2">
                        <Button variant="outline" disabled={validCurrentPage === 1} onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}>
                          Previous
                        </Button>
                        <span className="self-center">Page {validCurrentPage} of {totalPages}</span>
                        <Button variant="outline" disabled={validCurrentPage === totalPages} onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}>
                          Next
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Right Column */}
              <div className="lg:col-span-2 space-y-6">

                <Card className="bg-white rounded-xl p-6 shadow-lg border-0">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div className="flex flex-col space-y-2">
                      <CardTitle className="text-start">Lịch hẹn sắp tới</CardTitle>
                      <p className="text-sm text-muted-foreground text-start">Quản lý tất cả các lịch hẹn sắp tới của bạn.</p>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="border-t border-gray-100 pt-4">
                      {upcomingFutureBookings.length === 0 ? (
                        <p className="text-muted-foreground text-center">No upcoming appointments</p>
                      ) : (
                        upcomingFutureBookings.map((booking: Booking) => {
                          const userName = typeof booking.user === "string" ? "Unknown User" : (booking.user as any)?.fullName || "Unknown User";
                          const initials = userName.split(" ").map((w) => w[0]).join("").toUpperCase();
                          const fieldName = booking.field ? ((booking.field as any).name || "Unknown Field") : "Unknown Field";
                          const bookingDate = booking.date ? new Date(booking.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }) : "N/A";

                          return (
                            <div key={normalizeId((booking as any)._id)} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg mb-3">
                              <Avatar className="h-10 w-10">
                                {typeof booking.user === "object" && (booking.user as any)?.avatarUrl ? (
                                  <AvatarImage src={(booking.user as any).avatarUrl} alt={userName} />
                                ) : (
                                  <AvatarFallback className="bg-blue-500 text-white font-semibold text-xs">{initials}</AvatarFallback>
                                )}
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-900 text-sm">{userName}</p>
                                <p className="text-sm text-gray-600 truncate">{fieldName}</p>
                                <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                                  <Clock className="w-3 h-3" />
                                  <span>{bookingDate} — {booking.startTime || "N/A"} - {booking.endTime || "N/A"}</span>
                                </div>
                              </div>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Recent Sessions */}
            <Card className="bg-white border rounded-xl p-6 shadow-sm border-gray-200">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold mb-2 text-start">Buổi học gần đây</CardTitle>
                  <p className="text-muted-foreground text-start">Truy cập các buổi học gần đây và thanh toán</p>
                </div>
              </CardHeader>
              <CardContent>
                <div className="border-t border-gray-200 pt-4">
                  <div className="space-y-4">
                    <div className="grid grid-cols-4 gap-4 text-sm font-bold bg-gray-100 text-gray-700 pb-2 px-4 py-3">
                      <div className="text-start">Học viên</div>
                      <div className="text-start">Ngày & Giờ</div>
                      <div className="text-start">Thanh toán</div>
                      <div className="text-start">Trạng thái</div>
                    </div>
                    {recentActivity.map((act) => (
                      <div key={act.bookingId}>
                        <div className="grid grid-cols-4 gap-4 items-center py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                              <span className="text-white font-semibold text-xs">{act.userName.split(" ").map((w) => w[0]).join("")}</span>
                            </div>
                            <div className="text-start">
                              <p className="font-medium text-sm">{act.userName}</p>
                            </div>
                          </div>
                          <div className="text-start">
                            <p className="text-sm">{act.date}</p>
                            <p className="text-xs text-muted-foreground">{act.time}</p>
                          </div>
                          <div className="font-semibold text-start">{act.amount}</div>
                          <div className="text-start">
                            <Badge variant="secondary" className={act.status === "accepted" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}>
                              {act.status}
                            </Badge>
                          </div>
                        </div>
                        <div className="border-t border-gray-100" />
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </PageWrapper>
    </>
  )
}
