"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Filter,
  MessageCircle,
  MoreHorizontal,
  Calendar,
  DollarSign,
} from "lucide-react";

const bookings = [
  {
    id: 1,
    courtName: "Sunrise Tennis Court",
    courtId: "#A1",
    date: "Jan 15, 2025",
    time: "10:00 AM - 12:00 PM",
    payment: "$45.00",
    status: "Accepted",
    image: "/tennis-court-1.jpg",
  },
  {
    id: 2,
    courtName: "Downtown Sports Center",
    courtId: "#B2",
    date: "Jan 18, 2025",
    time: "2:00 PM - 4:00 PM",
    payment: "$60.00",
    status: "Awaiting",
    image: "/sports-center-1.jpg",
  },
  {
    id: 3,
    courtName: "Elite Pickleball Club",
    courtId: "#C3",
    date: "Jan 12, 2025",
    time: "6:00 PM - 8:00 PM",
    payment: "$35.00",
    status: "Cancelled",
    image: "/pickleball-court-1.jpg",
  },
];

export default function UserBookingsPage() {
  const [activeTab, setActiveTab] = useState("upcoming");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCourt, setFilterCourt] = useState("");
  const [viewType, setViewType] = useState("courts");

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "accepted":
        return "bg-green-100 text-green-800 hover:bg-green-200";
      case "awaiting":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200";
      case "cancelled":
        return "bg-red-100 text-red-800 hover:bg-red-200";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <nav className="text-sm text-gray-500 mb-2 animate-fade-in">
              Home &gt; User Bookings
            </nav>
            <h1 className="text-3xl font-bold text-gray-900 animate-slide-up">
              User Bookings
            </h1>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className="flex space-x-8 py-4 animate-slide-up"
            style={{ animationDelay: "0.1s" }}
          >
            <button className="flex items-center space-x-2 text-gray-500 hover:text-[#00775C] transition-colors">
              <Calendar className="w-4 h-4" />
              <span>Dashboard</span>
            </button>
            <button className="flex items-center space-x-2 text-[#00775C] border-b-2 border-[#00775C] pb-4">
              <Calendar className="w-4 h-4" />
              <span className="font-medium">My Bookings</span>
            </button>
            <button className="flex items-center space-x-2 text-gray-500 hover:text-[#00775C] transition-colors">
              <MessageCircle className="w-4 h-4" />
              <span>Chat</span>
            </button>
            <button className="flex items-center space-x-2 text-gray-500 hover:text-[#00775C] transition-colors">
              <DollarSign className="w-4 h-4" />
              <span>Invoices</span>
            </button>
            <button className="flex items-center space-x-2 text-gray-500 hover:text-[#00775C] transition-colors">
              <DollarSign className="w-4 h-4" />
              <span>Wallet</span>
            </button>
            <button className="flex items-center space-x-2 text-gray-500 hover:text-[#00775C] transition-colors">
              <span>Profile Setting</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status Tabs and Filters */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 space-y-4 lg:space-y-0">
          <div
            className="flex space-x-1 animate-slide-up"
            style={{ animationDelay: "0.2s" }}
          >
            <Button
              variant={activeTab === "upcoming" ? "default" : "outline"}
              onClick={() => setActiveTab("upcoming")}
              className={`${
                activeTab === "upcoming"
                  ? "bg-black text-white hover:bg-gray-800"
                  : "hover:bg-gray-100"
              } transition-all duration-200`}
            >
              Upcoming
            </Button>
            <Button
              variant={activeTab === "completed" ? "default" : "outline"}
              onClick={() => setActiveTab("completed")}
              className={`${
                activeTab === "completed"
                  ? "bg-black text-white hover:bg-gray-800"
                  : "hover:bg-gray-100"
              } transition-all duration-200`}
            >
              Completed
            </Button>
            <Button
              variant={activeTab === "ongoing" ? "default" : "outline"}
              onClick={() => setActiveTab("ongoing")}
              className={`${
                activeTab === "ongoing"
                  ? "bg-black text-white hover:bg-gray-800"
                  : "hover:bg-gray-100"
              } transition-all duration-200`}
            >
              On Going
            </Button>
            <Button
              variant={activeTab === "cancelled" ? "default" : "outline"}
              onClick={() => setActiveTab("cancelled")}
              className={`${
                activeTab === "cancelled"
                  ? "bg-black text-white hover:bg-gray-800"
                  : "hover:bg-gray-100"
              } transition-all duration-200`}
            >
              Cancelled
            </Button>
          </div>

          <div
            className="flex space-x-4 animate-slide-up"
            style={{ animationDelay: "0.3s" }}
          >
            <Select defaultValue="this-week">
              <SelectTrigger className="w-32">
                <SelectValue placeholder="This Week" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="this-week">This Week</SelectItem>
                <SelectItem value="this-month">This Month</SelectItem>
                <SelectItem value="last-month">Last Month</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="relevance">
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Sort By: Relevance" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">Sort By: Relevance</SelectItem>
                <SelectItem value="date">Sort By: Date</SelectItem>
                <SelectItem value="price">Sort By: Price</SelectItem>
                <SelectItem value="status">Sort By: Status</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* My Bookings Section */}
        <Card className="animate-slide-up" style={{ animationDelay: "0.4s" }}>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">My Bookings</CardTitle>
            <p className="text-gray-600">
              Manage and track all your upcoming court bookings.
            </p>
          </CardHeader>
          <CardContent>
            {/* Search and Filter */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 space-y-4 lg:space-y-0">
              <div className="flex space-x-4 flex-1 max-w-md">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search bookings..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 hover:border-[#00775C] focus:border-[#00775C] transition-colors"
                  />
                </div>
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Filter by court..."
                    value={filterCourt}
                    onChange={(e) => setFilterCourt(e.target.value)}
                    className="pl-10 w-48 hover:border-[#00775C] focus:border-[#00775C] transition-colors"
                  />
                </div>
              </div>

              <div className="flex space-x-1">
                <Button
                  variant={viewType === "courts" ? "default" : "outline"}
                  onClick={() => setViewType("courts")}
                  className={`${
                    viewType === "courts"
                      ? "bg-black text-white hover:bg-gray-800"
                      : "hover:bg-gray-100"
                  } transition-all duration-200`}
                >
                  Courts
                </Button>
                <Button
                  variant={viewType === "coaches" ? "default" : "outline"}
                  onClick={() => setViewType("coaches")}
                  className={`${
                    viewType === "coaches"
                      ? "bg-black text-white hover:bg-gray-800"
                      : "hover:bg-gray-100"
                  } transition-all duration-200`}
                >
                  Coaches
                </Button>
              </div>
            </div>

            {/* Bookings Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-4 px-2 font-medium text-gray-700">
                      Court Name
                    </th>
                    <th className="text-left py-4 px-2 font-medium text-gray-700">
                      Date & Time
                    </th>
                    <th className="text-left py-4 px-2 font-medium text-gray-700">
                      Payment
                    </th>
                    <th className="text-left py-4 px-2 font-medium text-gray-700">
                      Status
                    </th>
                    <th className="text-left py-4 px-2 font-medium text-gray-700">
                      Details
                    </th>
                    <th className="text-left py-4 px-2 font-medium text-gray-700">
                      Chat
                    </th>
                    <th className="text-left py-4 px-2 font-medium text-gray-700">
                      More
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking, index) => (
                    <tr
                      key={booking.id}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors animate-fade-in"
                      style={{ animationDelay: `${0.5 + index * 0.1}s` }}
                    >
                      <td className="py-4 px-2">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                            <span className="text-xs text-gray-600 font-medium">
                              Court
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {booking.courtName}
                            </div>
                            <div className="text-sm text-gray-500">
                              Court {booking.courtId}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-2">
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">
                            {booking.date}
                          </div>
                          <div className="text-gray-500">{booking.time}</div>
                        </div>
                      </td>
                      <td className="py-4 px-2">
                        <span className="font-medium text-gray-900">
                          {booking.payment}
                        </span>
                      </td>
                      <td className="py-4 px-2">
                        <Badge
                          className={`${getStatusColor(
                            booking.status
                          )} transition-colors`}
                        >
                          {booking.status}
                        </Badge>
                      </td>
                      <td className="py-4 px-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="hover:bg-[#00775C] hover:text-white hover:border-[#00775C] transition-all duration-200 bg-transparent"
                        >
                          View Details
                        </Button>
                      </td>
                      <td className="py-4 px-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="hover:bg-[#00775C] hover:text-white transition-all duration-200"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </Button>
                      </td>
                      <td className="py-4 px-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="hover:bg-gray-100 transition-colors"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div
              className="flex items-center justify-between mt-6 animate-fade-in"
              style={{ animationDelay: "0.8s" }}
            >
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Show</span>
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
                <span className="text-sm text-gray-600">per page</span>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="hover:bg-[#00775C] hover:text-white transition-colors bg-transparent"
                >
                  1
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="hover:bg-[#00775C] hover:text-white transition-colors bg-transparent"
                >
                  2
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

      {/* Bottom CTA Section */}
      <div
        className="bg-black text-white py-16 mt-16 animate-fade-in"
        style={{ animationDelay: "0.9s" }}
      >
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold mb-4">
            We Welcome Your Passion And Expertise
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join our empowering sports community today and grow with us
          </p>
          <Button
            size="lg"
            className="bg-white text-black hover:bg-gray-100 transition-all duration-200 transform hover:scale-105"
          >
            Join With Us
          </Button>
        </div>
      </div>

      <style >{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
          opacity: 0;
        }

        .animate-slide-up {
          animation: slide-up 0.6s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
}
