"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Clock, DollarSign, MoreHorizontal, Building2, Rocket as Racquet, User, Edit, ChevronDown } from "lucide-react"
import { useState, useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import type { Booking } from "@/types/booking-type"
import axiosPublic from "@/utils/axios/axiosPublic";
import { CoachDashboardLayout } from '@/components/layouts/coach-dashboard-layout'
import { getCoachById, clearCurrentCoach } from "@/features/coach"
import type { RootState, AppDispatch } from "@/store/store"

export default function CoachDashboardPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { currentCoach, detailLoading, detailError } = useSelector((state: RootState) => state.coach);

  const [selectedTab, setSelectedTab] = useState<"court" | "coaching">("court")
  const [coachId, setCoachId] = useState<string | null>(null);
  const [bookingRequests, setBookingRequests] = useState<Booking[]>([]);
  //for Yêu cầu đặt lịch
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 3;

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

      console.log("[useEffect] Loading coach data for userId:", userId);

      try {
        const response = await axiosPublic.get(`/profiles/coach-id/${userId}`);
        const coachId = response.data?.data?.coachId;
        console.log("[loadCoachData] Fetched coachId:", coachId);
        setCoachId(coachId);

        if (coachId) {
          // Fetch coach details via Redux
          dispatch(getCoachById(coachId));

          // Fetch related bookings
          const bookingRes = await axiosPublic.get(`/bookings/coach/${coachId}`);
          console.log("[loadCoachData] Fetched bookings:", bookingRes.data);
          setBookingRequests(bookingRes.data.data);
        }
      } catch (err) {
        console.error("[loadCoachData] Error fetching coachId or bookings:", err);
      }
    };

    loadCoachData();
  }, [dispatch]);


  // Cleanup coach data when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearCurrentCoach());
    };
  }, [dispatch]);

  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset time to midnight

  const isToday = (dateStr: string | undefined) => {
    if (!dateStr) return false;
    const date = new Date(dateStr);
    date.setHours(0, 0, 0, 0);
    return date.getTime() === today.getTime();
  };

  const isFuture = (dateStr: string | undefined) => {
    if (!dateStr) return false;
    const date = new Date(dateStr);
    date.setHours(0, 0, 0, 0);
    return date.getTime() > today.getTime();
  };

  const filteredBookings = bookingRequests.filter(
    (c) => c.coachStatus === "pending" || c.coachStatus === "declined"
  );

  const totalPages = Math.ceil(filteredBookings.length / ITEMS_PER_PAGE);

  const paginatedBookings = filteredBookings.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );


  // --- Handle More Dropdown ---
  // const handleMoreClick = (itemId: string) => {
  //     setOpenDropdown(openDropdown === itemId ? null : itemId);
  // };

  // --- Accept / Decline Handlers ---
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

  const handleAccept = async (bookingId: any) => {
    if (!coachId) return;
    try {
      const normalizedId = normalizeId(bookingId);
      await axiosPublic.patch(`/bookings/accept`, {
        coachId,
        bookingId: normalizedId,
      });

      setBookingRequests((prev) =>
        prev.map((b) =>
          normalizeId(b._id) === normalizedId ? { ...b, coachStatus: "accepted" } : b
        )
      );
    } catch (error) {
      console.error("[handleAccept]", error);
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
          normalizeId(b._id) === normalizedId ? { ...b, coachStatus: "declined" } : b
        )
      );
    } catch (error) {
      console.error("[handleDecline]", error);
    }
  };

  // --- Close dropdown when clicking outside ---
  // useEffect(() => {
  //   const handleClickOutside = (event: MouseEvent) => {
  //     if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
  //       setOpenDropdown(null)
  //     }
  //   }
  //   document.addEventListener("mousedown", handleClickOutside)
  //   return () => document.removeEventListener("mousedown", handleClickOutside)
  // }, [])

  // --- For debugging: log bookingRequests whenever it changes ---
  useEffect(() => {
    console.log("[bookingRequests] Updated:", bookingRequests);
  }, [bookingRequests]);

  const ongoingTodayBookings = bookingRequests.filter(
    (b) => b.coachStatus === "accepted" && isToday(b.date)
  );

  const upcomingFutureBookings = bookingRequests.filter(
    (b) => b.coachStatus === "accepted" && isFuture(b.date)
  );

  // Use real coach data where available, fallback to mock data
  const metrics = [
    {
      title: "Total Courts Booked",
      value: "78", // Mock data - API doesn't support this yet
      icon: Building2,
      color: "text-[#00775C]",
    },
    {
      title: "Upcoming Bookings",
      value: upcomingFutureBookings.length.toString().padStart(2, '0'),
      icon: Racquet,
      color: "text-[#00775C]",
    },
    {
      title: "Total Lessons Taken",
      value: currentCoach?.completedSessions?.toString() || "45", // Use real data if available
      icon: User,
      color: "text-[#00775C]",
    },
    {
      title: "Payments",
      value: "$45,056", // Mock data - API doesn't support this yet
      icon: DollarSign,
      color: "text-[#00775C]",
    },
  ]
  // Use real coach availability data if available, fallback to mock data
  const weeklyAvailability = currentCoach?.availableSlots?.length ?
    currentCoach.availableSlots.map((slot, index) => ({
      date: new Date(Date.now() + index * 24 * 60 * 60 * 1000).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      }),
      day: new Date(Date.now() + index * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", { weekday: "long" }),
      timeSlot: `${slot.startTime} to ${slot.endTime}`
    })) : [
      { date: "23 Jul 2023", day: "Monday", timeSlot: "09:00 AM to 7:00 PM" },
      { date: "24 Jul 2023", day: "Tuesday", timeSlot: "09:00 AM to 7:00 PM" },
      { date: "25 Jul 2023", day: "Wednesday", timeSlot: "09:00 AM to 7:00 PM" },
      { date: "26 Jul 2023", day: "Thursday", timeSlot: "09:00 AM to 7:00 PM" },
      { date: "27 Jul 2023", day: "Friday", timeSlot: "09:00 AM to 7:00 PM" },
      { date: "28 Jul 2023", day: "Saturday", timeSlot: "09:00 AM to 7:00 PM" },
    ]

  // Mock data for upcoming bookings - API doesn't support this yet
  // const upcomingBookings = [
  //   {
  //     student: "Lisa Rodriguez",
  //     sport: "Tennis",
  //     date: "Jan 15, 2025",
  //     time: "2:00 PM - 3:00 PM",
  //     amount: "$75",
  //   },
  //   {
  //     student: "Tom Wilson",
  //     sport: "Badminton",
  //     date: "Jan 16, 2025",
  //     time: "4:00 PM - 5:00 PM",
  //     amount: "$65",
  //   },
  //   {
  //     student: "Anna Smith",
  //     sport: "Tennis",
  //     date: "Jan 17, 2025",
  //     time: "10:00 AM - 11:00 AM",
  //     amount: "$75",
  //   },
  // ]

  const recentSessions = [
    {
      date: "Jan 14, 2025",
      time: "2:00 PM",
      student: "Mike Chen",
      payment: "$75.00",
      status: "Paid",
    },
    {
      date: "Jan 13, 2025",
      time: "4:00 PM",
      student: "Sarah Davis",
      payment: "$65.00",
      status: "Paid",
    },
    {
      date: "Jan 12, 2025",
      time: "10:00 AM",
      student: "John Wilson",
      payment: "$75.00",
      status: "Pending",
    },
  ]

  // Mock data for recent chats - API doesn't support this yet
  // const recentChats = [
  //   {
  //     student: "Mike Chen",
  //     message: "Thanks for the great lesson!",
  //     time: "2 hours ago",
  //     avatar: "/male-tennis-coach.png",
  //   },
  //   {
  //     student: "Sarah Davis",
  //     message: "Can we reschedule tomorrow?",
  //     time: "4 hours ago",
  //     avatar: "/female-tennis-coach.png",
  //   },
  //   {
  //     student: "John Wilson",
  //     message: "Looking forward to next session",
  //     time: "1 day ago",
  //     avatar: "/male-badminton-coach.jpg",
  //   },
  // ]

  // Show loading state while fetching coach data
  if (detailLoading) {
    return (
      <CoachDashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-muted-foreground">
              Loading coach dashboard...
            </p>
          </div>
        </div>
      </CoachDashboardLayout>
    );
  }

  // Show error state if coach data failed to load
  if (detailError) {
    return (
      <CoachDashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 mb-4">Error loading coach data: {detailError.message}</p>
            <Button onClick={() => coachId && dispatch(getCoachById(coachId))}>
              Retry
            </Button>
          </div>
        </div>
      </CoachDashboardLayout>
    );
  }

  return (
    <CoachDashboardLayout>
      <div className="min-h-screen">
        {/* <CoachDashboardTabs /> */}

        <div className="max-w-[1320px] mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Statistics Section - Left side, takes 1/2 width */}
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

            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl p-4 shadow-lg h-full">
                <div>
                  <h4 className="text-xl font-semibold mb-1 text-start">Profile</h4>
                  <p className="text-muted-foreground mb-4 text-start">
                    Impress potential students with an interesting profile
                  </p>
                </div>
                <div className="border-t border-gray-100 my-4" />

                {/* Today Progress */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-start">Today</span>
                    <span className="text-sm font-medium text-start">100%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full w-full"></div>
                  </div>
                </div>

                {/* Completed Section */}
                <div className="mb-4">
                  <h3 className="text-sm font-semibold mb-2 text-start">Completed</h3>
                  <ul className="flex flex-wrap gap-2">
                    <li className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                        <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <span className="text-sm text-start">Basic Details</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                        <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <span className="text-sm text-start">Payment Setup</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                        <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <span className="text-sm text-start">Availability</span>
                    </li>
                  </ul>
                </div>

                {/* Need to Complete Section */}
                <div>
                  <h3 className="text-sm font-semibold mb-2 text-start">Need to Complete</h3>
                  <ul className="flex flex-wrap gap-2">
                    <li className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                        <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <span className="text-sm text-start">Setup level for your Profile</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                        <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <span className="text-sm text-start">Add Lesson type</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Ongoing Appointment Section */}
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
              <Button className="bg-green-600 hover:bg-green-700 text-white">Complete</Button>
            </CardHeader>
            <div className="border-t border-gray-100" />
            <CardContent>
              {ongoingTodayBookings.length === 0 ? (
                <p className="text-muted-foreground text-center">No ongoing appointments today</p>
              ) : (
                ongoingTodayBookings.map((booking: Booking) => {
                  // User name & initials
                  const userName =
                    typeof booking.user === "string"
                      ? "Unknown User"
                      : booking.user.fullName || "Unknown User";
                  const initials = userName
                    .split(" ")
                    .map((w) => w[0])
                    .join("")
                    .toUpperCase();

                  // Field info
                  const fieldName = booking.field?.name || "Unknown Field";

                  // Booking date
                  const bookingDate = booking.date
                    ? new Date(booking.date).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })
                    : "N/A";

                  return (
                    <div
                      key={booking._id}
                      className="flex items-center p-4 bg-gray-50 rounded-lg mb-2"
                    >
                      {/* Left - Field info */}
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Building2 className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-start">{fieldName}</p>
                        </div>
                      </div>

                      {/* Center - Avatar */}
                      <div className="flex items-center gap-3 ml-4">
                        <Avatar className="h-10 w-10">
                          {typeof booking.user !== "string" && booking.user.avatarUrl ? (
                            <AvatarImage src={booking.user.avatarUrl} alt={userName} />
                          ) : (
                            <AvatarFallback className="bg-orange-100 text-orange-600">{initials}</AvatarFallback>
                          )}
                        </Avatar>
                        <span className="font-medium text-start">{userName}</span>
                      </div>
                      {/* Right - Appointment details */}
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
                          <p className="font-medium text-muted-foreground text-start">Location</p>
                          <p className="text-start">{booking.field?.location || "Unknown Location"}</p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>

          </Card>
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
                {weeklyAvailability.map((day, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4 text-center">
                    <div className="mb-3">
                      <p className="text-sm font-semibold text-gray-900">{day.date}</p>
                      <p className="text-xs text-gray-600">{day.day}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-gray-700">Time</p>
                      <p className="text-xs text-green-600 font-medium">{day.timeSlot}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          {/* My Bookings, wallet, upcoming, favourites */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Left Column */}
            <div className="lg:col-span-3 space-y-8">
              {/* My Bookings */}
              <Card className="bg-white rounded-xl p-6 shadow-lg border-0">
                <CardHeader className="flex flex-row items-center justify-between py-2">
                  <div className="flex flex-col space-y-1">
                    <CardTitle className="text-lg font-semibold mb-2 text-start">Yêu cầu đặt lịch</CardTitle>
                    <p className="text-muted-foreground text-start">Quản lý yêu cầu đặt lịch từ học viên</p>
                  </div>
                  <div className="flex gap-2 bg-gray-100 rounded-lg p-2">
                    <Badge
                      variant={selectedTab === "court" ? "default" : "outline"}
                      className={`px-4 py-2 text-sm font-medium ${selectedTab === "court" ? "bg-green-600" : "border-0 bg-transparent hover:bg-black hover:text-white transition-colors duration-200 cursor-pointer"}`}
                      onClick={() => setSelectedTab("court")}
                    >
                      Court
                    </Badge>
                    <Badge
                      variant={selectedTab === "coaching" ? "default" : "outline"}
                      className={`px-4 py-2 text-sm font-medium ${selectedTab === "coaching" ? "bg-green-600" : "border-0 bg-transparent hover:bg-black hover:text-white transition-colors duration-200 cursor-pointer"}`}
                      onClick={() => setSelectedTab("coaching")}
                    >
                      Coaching
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4 text-start">
                  <div className="border-t border-gray-100" />

                  {selectedTab === "court" &&
                    paginatedBookings.map((request) => {
                      const userName =
                        typeof request.user === "string"
                          ? request.user
                          : request.user?.fullName || "Unknown User";

                      const initials = userName
                        .split(" ")
                        .map((w) => w[0])
                        .join("")
                        .toUpperCase();

                      const bookingDate = request.date
                        ? new Date(request.date).toLocaleDateString()
                        : "N/A";

                      const isDeclined = request.coachStatus === "declined";

                      return (
                        <div key={normalizeId(request._id)}>
                          <div className="flex items-center gap-4 p-4">
                            <Avatar className="h-12 w-12">
                              {typeof request.user === "object" && request.user.avatarUrl ? (
                                <AvatarImage src={request.user.avatarUrl} alt={userName} />
                              ) : (
                                <AvatarFallback className="bg-green-500 text-white font-semibold text-xs">{initials}</AvatarFallback>
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
                                <p
                                  className={`capitalize font-semibold ${request.coachStatus === "pending"
                                    ? "text-yellow-600"
                                    : request.coachStatus === "declined"
                                      ? "text-red-600"
                                      : "text-gray-500"
                                    }`}
                                >
                                  {request.coachStatus}
                                </p>
                              </div>

                              <div className="flex items-center justify-between">
                                {/* Only show buttons if status is pending */}
                                {!isDeclined && (
                                  <div className="flex space-x-2">
                                    <Button
                                      size="sm"
                                      className="bg-green-600 hover:bg-green-700"
                                      onClick={() => handleAccept(request._id)}
                                    >
                                      Accept
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleDecline(request._id)}
                                    >
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
                      <Button
                        variant="outline"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      >
                        Previous
                      </Button>
                      <span className="self-center">
                        Page {currentPage} of {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                      >
                        Next
                      </Button>
                    </div>
                  )}
                </CardContent>

              </Card>
            </div>

            {/* Right Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Wallet Balance */}
              <Card className="bg-emerald-700 text-white">
                <CardContent>
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-sm opacity-90">Thu nhập tuần này</p>
                      <p className="text-xl font-bold">$485</p>
                    </div>
                    <Button
                      variant="secondary"
                      className="bg-white/20 hover:bg-white/30 text-white flex items-center justify-center gap-2"
                    >
                      <DollarSign className="w-4 h-4" />
                      Xem chi tiết
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Upcoming Appointment */}
              <Card className="bg-white rounded-xl p-6 shadow-lg border-0">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div className="flex flex-col space-y-2">
                    <CardTitle className="text-start">Lịch hẹn sắp tới</CardTitle>
                    <p className="text-sm text-muted-foreground text-start">
                      Quản lý tất cả các lịch hẹn sắp tới của bạn.
                    </p>
                  </div>
                  <div className="flex gap-2 bg-gray-100 rounded-lg p-2">
                    <Badge variant="default" className="px-4 py-2 text-sm font-medium bg-green-600">
                      Court
                    </Badge>
                    <Badge
                      variant="outline"
                      className="px-4 py-2 text-sm font-medium border-0 bg-transparent hover:bg-black hover:text-white transition-colors duration-200"
                    >
                      Coaching
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="border-t border-gray-100 pt-4">
                    {upcomingFutureBookings.length === 0 ? (
                      <p className="text-muted-foreground text-center">No upcoming appointments</p>
                    ) : (
                      upcomingFutureBookings.map((booking: Booking) => {
                        const userName =
                          typeof booking.user === "string"
                            ? "Unknown User"
                            : booking.user.fullName || "Unknown User";
                        const initials = userName
                          .split(" ")
                          .map((w) => w[0])
                          .join("")
                          .toUpperCase();

                        const fieldName = booking.field?.name || "Unknown Field";

                        const bookingDate = booking.date
                          ? new Date(booking.date).toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          })
                          : "N/A";

                        return (
                          <div key={booking._id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg mb-3">
                            <Avatar className="h-10 w-10">
                              {typeof booking.user === "object" && booking.user.avatarUrl ? (
                                <AvatarImage src={booking.user.avatarUrl} alt={userName} />
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

              {/* Recent Chats */}
              {/* <Card className="bg-white rounded-xl p-6 shadow-lg border-0">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div className="flex flex-col space-y-2">
                    <CardTitle className="text-start">Tin nhắn gần đây</CardTitle>
                    <p className="text-sm text-muted-foreground text-start">Danh sách tin nhắn từ học viên</p>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="border-t border-gray-100 pt-4">
                    {recentChats.map((chat, index) => (
                      <div
                        key={index}
                        className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer mb-2"
                      >
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={chat.avatar || "/placeholder.svg"} alt={chat.student} />
                          <AvatarFallback>
                            {chat.student
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 text-sm">{chat.student}</p>
                          <p className="text-sm text-gray-600 truncate">{chat.message}</p>
                          <p className="text-xs text-gray-500 mt-1">{chat.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card> */}
            </div>
          </div>

          {/* Recent Sessions Section */}
          <Card className="bg-white border rounded-xl p-6 shadow-sm border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold mb-2 text-start">Buổi học gần đây</CardTitle>
                <p className="text-muted-foreground text-start">Truy cập các buổi học gần đây và thanh toán</p>
              </div>
              <div className="flex gap-2 bg-gray-100 rounded-lg p-2">
                <Badge variant="default" className="px-4 py-2 text-sm font-medium bg-green-600">
                  Court
                </Badge>
                <Badge
                  variant="outline"
                  className="px-4 py-2 text-sm font-medium border-0 bg-transparent hover:bg-black hover:text-white transition-colors duration-200"
                >
                  Coaching
                </Badge>
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
                  {recentSessions.map((session, index) => (
                    <div key={session.student}>
                      <div className="grid grid-cols-4 gap-4 items-center py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-semibold text-xs">
                              {session.student
                                .split(" ")
                                .map((w) => w[0])
                                .join("")}
                            </span>
                          </div>
                          <div className="text-start">
                            <p className="font-medium text-sm">{session.student}</p>
                          </div>
                        </div>
                        <div className="text-start">
                          <p className="text-sm">{session.date}</p>
                          <p className="text-xs text-muted-foreground">{session.time}</p>
                        </div>
                        <div className="font-semibold text-start">{session.payment}</div>
                        <div className="text-start">
                          <Badge
                            variant="secondary"
                            className={
                              session.status === "Paid"
                                ? "bg-green-100 text-green-700"
                                : "bg-yellow-100 text-yellow-700"
                            }
                          >
                            {session.status}
                          </Badge>
                        </div>
                      </div>
                      {index < recentSessions.length - 1 && <div className="border-t border-gray-100" />}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </CoachDashboardLayout>
  )
}
