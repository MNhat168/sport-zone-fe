"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Clock, DollarSign, MoreHorizontal, Building2, Rocket as Racquet, User, Edit, ChevronDown } from "lucide-react"
import { CoachDashboardTabs } from "@/components/ui/coach-dashboard-tabs"
import { NavbarDarkComponent } from "@/components/header/navbar-dark-component"
import { CoachDashboardHeader } from "@/components/header/coach-dashboard-header"
import { useState, useEffect, useRef } from "react"

export default function CoachDashboardPage() {
  const [selectedTab, setSelectedTab] = useState<"court" | "coaching">("court")
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const handleMoreClick = (itemId: string) => {
    setOpenDropdown(openDropdown === itemId ? null : itemId)
  }

  const handleCancel = (itemId: string) => {
    console.log("Cancel booking:", itemId)
    setOpenDropdown(null)
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdown(null)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const metrics = [
    {
      title: "Total Courts Booked",
      value: "78",
      icon: Building2,
      color: "text-[#00775C]",
    },
    {
      title: "Upcoming Bookings",
      value: "06",
      icon: Racquet,
      color: "text-[#00775C]",
    },
    {
      title: "Total Lessons Taken",
      value: "45",
      icon: User,
      color: "text-[#00775C]",
    },
    {
      title: "Payments",
      value: "$45,056",
      icon: DollarSign,
      color: "text-[#00775C]",
    },
  ]
  const weeklyAvailability = [
    { date: "23 Jul 2023", day: "Monday", timeSlot: "09:00 AM to 7:00 PM" },
    { date: "24 Jul 2023", day: "Tuesday", timeSlot: "09:00 AM to 7:00 PM" },
    { date: "25 Jul 2023", day: "Wednesday", timeSlot: "09:00 AM to 7:00 PM" },
    { date: "26 Jul 2023", day: "Thursday", timeSlot: "09:00 AM to 7:00 PM" },
    { date: "27 Jul 2023", day: "Friday", timeSlot: "09:00 AM to 7:00 PM" },
    { date: "28 Jul 2023", day: "Saturday", timeSlot: "09:00 AM to 7:00 PM" },
  ]
  const ongoingAppointments = [
    {
      student: "John Smith - Tennis Lesson",
      time: "2:00 PM - 3:00 PM",
      status: "ongoing",
    },
    {
      student: "Sarah Wilson - Badminton",
      time: "3:30 PM - 4:30 PM",
      status: "upcoming",
    },
    {
      student: "Mike Johnson - Tennis",
      time: "5:00 PM - 6:00 PM",
      status: "upcoming",
    },
  ]

  const bookingRequests = [
    {
      student: "Alex Rodriguez",
      sport: "Tennis",
      time: "Tomorrow 2:00 PM",
      status: "pending",
    },
    {
      student: "Emma Davis",
      sport: "Badminton",
      time: "Friday 4:00 PM",
      status: "pending",
    },
    {
      student: "David Chen",
      sport: "Tennis",
      time: "Saturday 10:00 AM",
      status: "pending",
    },
  ]

  const upcomingBookings = [
    {
      student: "Lisa Rodriguez",
      sport: "Tennis",
      date: "Jan 15, 2025",
      time: "2:00 PM - 3:00 PM",
      amount: "$75",
    },
    {
      student: "Tom Wilson",
      sport: "Badminton",
      date: "Jan 16, 2025",
      time: "4:00 PM - 5:00 PM",
      amount: "$65",
    },
    {
      student: "Anna Smith",
      sport: "Tennis",
      date: "Jan 17, 2025",
      time: "10:00 AM - 11:00 AM",
      amount: "$75",
    },
  ]

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

  const recentChats = [
    {
      student: "Mike Chen",
      message: "Thanks for the great lesson!",
      time: "2 hours ago",
      avatar: "/male-tennis-coach.png",
    },
    {
      student: "Sarah Davis",
      message: "Can we reschedule tomorrow?",
      time: "4 hours ago",
      avatar: "/female-tennis-coach.png",
    },
    {
      student: "John Wilson",
      message: "Looking forward to next session",
      time: "1 day ago",
      avatar: "/male-badminton-coach.jpg",
    },
  ]

  return (
    <>
      <NavbarDarkComponent />
      <div className="min-h-screen">
        <CoachDashboardHeader />
        <CoachDashboardTabs />

        <div className="max-w-[1320px] mx-auto py-8 space-y-8">
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
                <CardTitle className="text-lg font-semibold mb-2 text-start">Ongoing Appointment</CardTitle>
                <p className="text-muted-foreground text-start">
                  Manage appointments with our convenient scheduling system
                </p>
              </div>
              <Button className="bg-green-600 hover:bg-green-700 text-white">Complete</Button>
            </CardHeader>
            <div className="border-t border-gray-100" />
            <CardContent className="">
              <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                {/* Left side - Court info */}
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-start">Leap Sports Academy</p>
                    <p className="text-sm text-muted-foreground text-start">Standard Synthetic Court 1</p>
                  </div>
                </div>

                {/* Center - Avatar */}
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src="/male-coach.png" alt="Harry" />
                    <AvatarFallback className="bg-orange-100 text-orange-600">H</AvatarFallback>
                  </Avatar>
                  <span className="font-medium text-start">Harry</span>
                </div>

                {/* Right side - Appointment details */}
                <div className="flex-1 grid grid-cols-4 gap-6 text-sm">
                  <div>
                    <p className="font-medium text-muted-foreground text-start">Appointment Date</p>
                    <p className="text-start">Mon, Jul 11</p>
                  </div>
                  <div>
                    <p className="font-medium text-muted-foreground text-start">Start Time</p>
                    <p className="text-start">05:25 AM</p>
                  </div>
                  <div>
                    <p className="font-medium text-muted-foreground text-start">End Time</p>
                    <p className="text-start">06:25 AM</p>
                  </div>
                  <div>
                    <p className="font-medium text-muted-foreground text-start">Additional Guests</p>
                    <p className="text-start">4</p>
                  </div>
                </div>
              </div>
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
                  {selectedTab === "court"
                    ? bookingRequests.map((request, index) => (
                      <div key={request.student}>
                        <div className="flex items-center gap-4 p-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-semibold text-xs">
                              {request.student
                                .split(" ")
                                .map((w) => w[0])
                                .join("")}
                            </span>
                          </div>
                          <div className="flex-1 grid grid-cols-3 gap-4 text-sm text-start">
                            <div>
                              <p className="font-medium">{request.student}</p>
                              <p className="text-muted-foreground">{request.sport}</p>
                              <p className="text-muted-foreground">{request.time}</p>
                            </div>
                            <div>
                              <p className="font-medium">Trạng thái</p>
                              <p className="text-muted-foreground">{request.status}</p>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex space-x-2">
                                <Button size="sm" className="bg-green-600 hover:bg-green-700">
                                  Accept
                                </Button>
                                <Button size="sm" variant="outline">
                                  Decline
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                        {index < bookingRequests.length - 1 && <div className="border-t border-gray-100 mx-4" />}
                      </div>
                    ))
                    : upcomingBookings.map((booking, index) => (
                      <div key={booking.student}>
                        <div className="flex items-center gap-4 p-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-semibold text-xs">
                              {booking.student
                                .split(" ")
                                .map((w) => w[0])
                                .join("")}
                            </span>
                          </div>
                          <div className="flex-1 grid grid-cols-3 gap-4 text-sm text-start">
                            <div>
                              <p className="font-medium">{booking.student}</p>
                              <p className="text-muted-foreground">{booking.sport}</p>
                              <p className="text-muted-foreground">{booking.date}</p>
                            </div>
                            <div>
                              <p className="font-medium">Thời gian</p>
                              <p className="text-muted-foreground">{booking.time}</p>
                            </div>
                            <div className="flex items-center justify-between">
                              <p className="text-lg font-bold text-green-600">{booking.amount}</p>
                              <Button size="sm" variant="outline">
                                View Details
                              </Button>
                            </div>
                          </div>
                        </div>
                        {index < upcomingBookings.length - 1 && <div className="border-t border-gray-100 mx-4" />}
                      </div>
                    ))}
                </CardContent>
              </Card>
            </div>

            {/* Right Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Wallet Balance */}
              <Card className="bg-gradient-to-br from-green-600 to-green-700 text-white">
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
                    {upcomingBookings.slice(0, 2).map((booking, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg mb-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                          <span className="text-white font-semibold text-xs">
                            {booking.student
                              .split(" ")
                              .map((w) => w[0])
                              .join("")}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 text-sm">{booking.student}</p>
                          <p className="text-sm text-gray-600 truncate">{booking.sport}</p>
                          <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                            <Clock className="w-3 h-3" />
                            <span>{booking.time}</span>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
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
    </>
  )
}
