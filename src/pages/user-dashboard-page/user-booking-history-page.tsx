"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, MoreHorizontal } from "lucide-react"
import { UserDashboardTabs } from "@/components/ui/user-dashboard-tabs"
import { NavbarDarkComponent } from "@/components/header/navbar-dark-component"
import { UserDashboardHeader } from "@/components/header/user-dashboard-header"

const bookings = [
  {
    id: 1,
    courtName: "Bwing Sports Academy",
    courtId: "Court 1",
    date: "Mon, Jul 15",
    time: "03:00 PM - 05:00 PM",
    payment: "$130",
    status: "Awaiting",
    image: "/sports-court.jpg",
  },
  {
    id: 2,
    courtName: "Feather Badminton",
    courtId: "Court 1",
    date: "Mon, Jul 12",
    time: "02:00 PM - 05:00 PM",
    payment: "$90",
    status: "Awaiting",
    image: "/badminton-court.png",
  },
  {
    id: 3,
    courtName: "Leap Sports Academy",
    courtId: "Court 1",
    date: "Mon, Jul 11",
    time: "06:00 PM - 08:00 PM",
    payment: "$120",
    status: "Accepted",
    image: "/sports-academy.jpg",
  },
  {
    id: 4,
    courtName: "Marsh Academy",
    courtId: "Court 1",
    date: "Mon, Jul 16",
    time: "05:00 PM - 07:00 PM",
    payment: "$100",
    status: "Awaiting",
    image: "/outdoor-tennis-court.png",
  },
  {
    id: 5,
    courtName: "Wing Sports Academy",
    courtId: "Court 1",
    date: "Mon, Jul 16",
    time: "05:00 PM - 08:00 PM",
    payment: "$140",
    status: "Awaiting",
    image: "/modern-sports-facility.png",
  },
]

export default function UserBookingsPage() {
  const [activeTab, setActiveTab] = useState("upcoming")
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCourt, setFilterCourt] = useState("")
  const [viewType, setViewType] = useState("courts")
  const [timeFilter, setTimeFilter] = useState("This Week")
  const [sortBy, setSortBy] = useState("Relevance")

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "accepted":
        return "bg-green-100 text-green-800 hover:bg-green-200"
      case "awaiting":
        return "bg-purple-100 text-purple-800 hover:bg-purple-200"
      case "cancelled":
        return "bg-red-100 text-red-800 hover:bg-red-200"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "accepted":
        return "✓"
      case "awaiting":
        return "⏳"
      case "cancelled":
        return "❌"
      default:
        return ""
    }
  }

  return (
    <>
      <NavbarDarkComponent />
      <div className="min-h-screen">
        {/* Header Section */}
        <UserDashboardHeader />

        {/* Navigation Tabs */}
        <UserDashboardTabs />
        <div className="container mx-auto px-12 py-8">
          <div className="space-y-8">
              {/* Status Tabs and Filters */}
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 space-y-4 lg:space-y-0">
                <div className="flex space-x-1">
                  <Button
                    variant={activeTab === "upcoming" ? "default" : "outline"}
                    onClick={() => setActiveTab("upcoming")}
                    className={`${activeTab === "upcoming" ? "bg-black text-white hover:bg-gray-800" : "hover:bg-gray-100"
                      } transition-all duration-200`}
                  >
                    Sắp tới
                  </Button>
                  <Button
                    variant={activeTab === "completed" ? "default" : "outline"}
                    onClick={() => setActiveTab("completed")}
                    className={`${activeTab === "completed" ? "bg-black text-white hover:bg-gray-800" : "hover:bg-gray-100"
                      } transition-all duration-200`}
                  >
                    Hoàn thành
                  </Button>
                  <Button
                    variant={activeTab === "ongoing" ? "default" : "outline"}
                    onClick={() => setActiveTab("ongoing")}
                    className={`${activeTab === "ongoing" ? "bg-black text-white hover:bg-gray-800" : "hover:bg-gray-100"
                      } transition-all duration-200`}
                  >
                    Đang diễn ra
                  </Button>
                  <Button
                    variant={activeTab === "cancelled" ? "default" : "outline"}
                    onClick={() => setActiveTab("cancelled")}
                    className={`${activeTab === "cancelled" ? "bg-black text-white hover:bg-gray-800" : "hover:bg-gray-100"
                      } transition-all duration-200`}
                  >
                    Đã hủy
                  </Button>
                </div>

                <div className="flex space-x-4">
                  <Select value={timeFilter} onValueChange={setTimeFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="This Week">Tuần này</SelectItem>
                      <SelectItem value="This Month">Tháng này</SelectItem>
                      <SelectItem value="Last Month">Tháng trước</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Relevance">Sắp xếp: Liên quan</SelectItem>
                      <SelectItem value="Date">Sắp xếp: Ngày</SelectItem>
                      <SelectItem value="Price">Sắp xếp: Giá</SelectItem>
                      <SelectItem value="Status">Sắp xếp: Trạng thái</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* My Bookings Section */}
              <Card className="bg-white border rounded-xl p-6 shadow-sm border-gray-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl font-bold">Đặt sân của tôi</CardTitle>
                      <p className="text-gray-600">Quản lý và theo dõi tất cả các đặt sân sắp tới của bạn.</p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          placeholder="Tìm kiếm"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 w-64 hover:border-[#00775C] focus:border-[#00775C] transition-colors"
                        />
                      </div>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          placeholder="Tìm kiếm"
                          value={filterCourt}
                          onChange={(e) => setFilterCourt(e.target.value)}
                          className="pl-10 w-48 hover:border-[#00775C] focus:border-[#00775C] transition-colors"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-1 mt-4">
                    <Button
                      variant={viewType === "courts" ? "default" : "outline"}
                      onClick={() => setViewType("courts")}
                      className={`${viewType === "courts" ? "bg-green-600 text-white hover:bg-green-700" : "hover:bg-gray-100"
                        } transition-all duration-200`}
                    >
                      Sân
                    </Button>
                    <Button
                      variant={viewType === "coaches" ? "default" : "outline"}
                      onClick={() => setViewType("coaches")}
                      className={`${viewType === "coaches" ? "bg-green-600 text-white hover:bg-green-700" : "hover:bg-gray-100"
                        } transition-all duration-200`}
                    >
                      Huấn luyện viên
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Bookings Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-4 px-2 font-medium text-gray-700">Tên sân</th>
                          <th className="text-left py-4 px-2 font-medium text-gray-700">Ngày & Giờ</th>
                          <th className="text-left py-4 px-2 font-medium text-gray-700">Thanh toán</th>
                          <th className="text-left py-4 px-2 font-medium text-gray-700">Trạng thái</th>
                          <th className="text-left py-4 px-2 font-medium text-gray-700">Chi tiết</th>
                          <th className="text-left py-4 px-2 font-medium text-gray-700">Chat</th>
                          <th className="text-left py-4 px-2 font-medium text-gray-700">Thêm</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bookings.map((booking) => (
                          <tr key={booking.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                            <td className="py-4 px-2">
                              <div className="flex items-center space-x-3">
                                <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                                  <img
                                    src={booking.image || "/placeholder.svg"}
                                    alt={booking.courtName}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div>
                                  <div className="font-medium text-gray-900">{booking.courtName}</div>
                                  <div className="text-sm text-gray-500">{booking.courtId}</div>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-2">
                              <div className="text-sm">
                                <div className="font-medium text-gray-900">{booking.date}</div>
                                <div className="text-gray-500">{booking.time}</div>
                              </div>
                            </td>
                            <td className="py-4 px-2">
                              <span className="font-medium text-gray-900">{booking.payment}</span>
                            </td>
                            <td className="py-4 px-2">
                              <Badge className={`${getStatusColor(booking.status)} transition-colors`}>
                                {getStatusIcon(booking.status)} {booking.status}
                              </Badge>
                            </td>
                            <td className="py-4 px-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="hover:bg-red-500 hover:text-white hover:border-red-500 transition-all duration-200 bg-transparent text-red-500 border-red-500"
                              >
                                👁 Xem chi tiết
                              </Button>
                            </td>
                            <td className="py-4 px-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="hover:bg-blue-500 hover:text-white transition-all duration-200 text-blue-500"
                              >
                                💬 Trò chuyện
                              </Button>
                            </td>
                            <td className="py-4 px-2">
                              <Button variant="ghost" size="sm" className="hover:bg-gray-100 transition-colors">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  <div className="flex items-center justify-between mt-6">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">Hiển thị</span>
                      <Select defaultValue="10">
                        <SelectTrigger className="w-16">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="10">10</SelectItem>
                          <SelectItem value="25">25</SelectItem>
                          <SelectItem value="50">50</SelectItem>
                        </SelectContent>
                      </Select>
                      <span className="text-sm text-gray-600">mỗi trang</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="hover:bg-[#00775C] hover:text-white transition-colors bg-transparent"
                      >
                        &lt;
                      </Button>
                      <Button variant="default" size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                        1
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="hover:bg-[#00775C] hover:text-white transition-colors bg-transparent"
                      >
                        &gt;
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
          </div>
        </div>
      </div>
    </>
  )
}
