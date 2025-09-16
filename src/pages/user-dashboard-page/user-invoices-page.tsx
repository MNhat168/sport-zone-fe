"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Download, ChevronLeft, ChevronRight } from "lucide-react"
import { UserDashboardTabs } from "@/components/ui/user-dashboard-tabs"
import { NavbarDarkComponent } from "@/components/header/navbar-dark-component"
import { UserDashboardHeader } from "@/components/header/user-dashboard-header"

const invoiceData = [
  {
    id: "#C014",
    coachName: "Kevin Anderson",
    bookedOn: "25 May 2023",
    invoice: "Onetime",
    date: "Mon, Jul 11",
    time: "04:00 PM - 06:00 PM",
    payment: 150,
    paidOn: "Mon, Jul 12",
    status: "Paid",
    avatar: "/coach-avatar.png",
  },
  {
    id: "#C015",
    coachName: "Angela Roudriguez",
    bookedOn: "26 May 2023",
    invoice: "Single Lesson",
    date: "Mon, Jul 11",
    time: "01:00 PM - 04:00 PM",
    payment: 200,
    paidOn: "Mon, Jul 12",
    status: "Pending",
    avatar: "/coach-avatar.png",
  },
  {
    id: "#C016",
    coachName: "Evon Raddick",
    bookedOn: "27 May 2023",
    invoice: "Onetime",
    date: "Mon, Jul 11",
    time: "05:00 PM - 08:00 PM",
    payment: 150,
    paidOn: "Mon, Jul 12",
    status: "Failed",
    avatar: "/coach-avatar.png",
  },
  {
    id: "#C017",
    coachName: "Harry Richardson",
    bookedOn: "28 May 2023",
    invoice: "Onetime",
    date: "Mon, Jul 11",
    time: "01:00 PM - 04:00 PM",
    payment: 90,
    paidOn: "Mon, Jul 20",
    status: "Paid",
    avatar: "/coach-avatar.png",
  },
  {
    id: "#C018",
    coachName: "Pete Hill",
    bookedOn: "29 May 2023",
    invoice: "Onetime",
    date: "Mon, Jul 11",
    time: "03:00 PM - 08:00 PM",
    payment: 180,
    paidOn: "Mon, Jul 12",
    status: "Paid",
    avatar: "/coach-avatar.png",
  },
]

export default function UserInvoicesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedFilter, setSelectedFilter] = useState("Courts")
  const [timeFilter, setTimeFilter] = useState("This Week")
  const [sortBy, setSortBy] = useState("Relevance")
  const [invoiceFilter, setInvoiceFilter] = useState("All Invoices")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Paid":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">✓ Paid</Badge>
      case "Pending":
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">⏳ Pending</Badge>
      case "Failed":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">❌ Failed</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const filteredInvoices = invoiceData.filter(
    (invoice) =>
      invoice.coachName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.id.toLowerCase().includes(searchTerm.toLowerCase()),
  )

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
              {/* Filter Section */}
              <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                <div className="flex items-center space-x-4">
                  <div className="flex bg-gray-100 rounded-lg p-1">
                    <Button
                      variant={selectedFilter === "Courts" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setSelectedFilter("Courts")}
                      className={`${selectedFilter === "Courts" ? "bg-black text-white hover:bg-black" : "hover:bg-gray-200"
                        } transition-all duration-200`}
                    >
                      Sân
                    </Button>
                    <Button
                      variant={selectedFilter === "Coaches" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setSelectedFilter("Coaches")}
                      className={`${selectedFilter === "Coaches" ? "bg-black text-white hover:bg-black" : "hover:bg-gray-200"
                        } transition-all duration-200`}
                    >
                      Huấn luyện viên
                    </Button>
                  </div>

                  <Select value={timeFilter} onValueChange={setTimeFilter}>
                    <SelectTrigger className="w-32 hover:border-[#00775C] transition-colors">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="This Week">Tuần này</SelectItem>
                      <SelectItem value="This Month">Tháng này</SelectItem>
                      <SelectItem value="Last Month">Tháng trước</SelectItem>
                      <SelectItem value="This Year">Năm nay</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-40 hover:border-[#00775C] transition-colors">
                      <SelectValue placeholder="Sắp xếp: Liên quan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Relevance">Sắp xếp: Liên quan</SelectItem>
                      <SelectItem value="Date">Sắp xếp: Ngày</SelectItem>
                      <SelectItem value="Amount">Sắp xếp: Số tiền</SelectItem>
                      <SelectItem value="Status">Sắp xếp: Trạng thái</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Invoices Section */}
              <Card className="bg-white border rounded-xl p-6 shadow-sm border-gray-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl font-bold text-gray-900">Hóa đơn</CardTitle>
                      <p className="text-gray-600 mt-1">Truy cập dễ dàng vào lịch sử thanh toán của bạn</p>
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
                      <Select value={invoiceFilter} onValueChange={setInvoiceFilter}>
                        <SelectTrigger className="w-32 hover:border-[#00775C] transition-colors">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="All Invoices">Tất cả hóa đơn</SelectItem>
                          <SelectItem value="Paid">Đã thanh toán</SelectItem>
                          <SelectItem value="Pending">Chờ thanh toán</SelectItem>
                          <SelectItem value="Failed">Thanh toán thất bại</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="font-semibold">ID</TableHead>
                          <TableHead className="font-semibold">Tên huấn luyện viên</TableHead>
                          <TableHead className="font-semibold">Hóa đơn</TableHead>
                          <TableHead className="font-semibold">Ngày & Giờ</TableHead>
                          <TableHead className="font-semibold">Thanh toán</TableHead>
                          <TableHead className="font-semibold">Đã thanh toán</TableHead>
                          <TableHead className="font-semibold">Trạng thái</TableHead>
                          <TableHead className="font-semibold">Tải xuống</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredInvoices.map((invoice) => (
                          <TableRow key={invoice.id} className="hover:bg-gray-50 transition-colors">
                            <TableCell className="font-medium text-green-600">{invoice.id}</TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                                  <img
                                    src={invoice.avatar || "/placeholder.svg"}
                                    alt={invoice.coachName}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div>
                                  <div className="font-medium">{invoice.coachName}</div>
                                  <div className="text-sm text-gray-500">Đặt vào: {invoice.bookedOn}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="font-medium">{invoice.invoice}</TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium">{invoice.date}</div>
                                <div className="text-sm text-gray-500">{invoice.time}</div>
                              </div>
                            </TableCell>
                            <TableCell className="font-medium">${invoice.payment}</TableCell>
                            <TableCell>{invoice.paidOn}</TableCell>
                            <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                            <TableCell>
                              <Button
                                size="sm"
                                variant={invoice.status === "Paid" ? "default" : "secondary"}
                                className={`${invoice.status === "Paid"
                                    ? "bg-red-500 hover:bg-red-600 text-white"
                                    : "bg-gray-200 hover:bg-gray-300 text-gray-600"
                                  } transition-all duration-200 hover:scale-105`}
                                disabled={invoice.status !== "Paid"}
                              >
                                <Download className="w-4 h-4 mr-1" />
                                Tải xuống
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Pagination */}
                  <div className="flex items-center justify-between mt-6 pt-6 border-t">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">Hiển thị</span>
                      <Select value={itemsPerPage.toString()} onValueChange={(value) => setItemsPerPage(Number(value))}>
                        <SelectTrigger className="w-20 hover:border-[#00775C] transition-colors">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="5">5</SelectItem>
                          <SelectItem value="10">10</SelectItem>
                          <SelectItem value="20">20</SelectItem>
                          <SelectItem value="50">50</SelectItem>
                        </SelectContent>
                      </Select>
                      <span className="text-sm text-gray-600">mỗi trang</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="hover:bg-[#00775C] hover:text-white transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        Trước
                      </Button>

                      <div className="flex items-center space-x-1">
                        <Button variant="default" size="sm" className="w-8 h-8 p-0 bg-green-600 hover:bg-green-700">
                          1
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-8 h-8 p-0 hover:bg-[#00775C] hover:text-white transition-colors bg-transparent"
                        >
                          2
                        </Button>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(currentPage + 1)}
                        className="hover:bg-[#00775C] hover:text-white transition-colors"
                      >
                        Tiếp
                        <ChevronRight className="w-4 h-4 ml-1" />
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
