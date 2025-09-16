"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Clock, DollarSign, Users, TrendingUp } from "lucide-react";

export default function CoachDashboardPage() {
  const [activeTab, setActiveTab] = useState("dashboard");

  // Sample data
  const metrics = [
    {
      title: "Total Active Students",
      value: "158",
      icon: Users,
      color: "text-[#00775C]",
    },
    {
      title: "Upcoming Sessions",
      value: "12",
      icon: Calendar,
      color: "text-[#F2A922]",
    },
    {
      title: "Total Lifetime Sales",
      value: "89",
      icon: TrendingUp,
      color: "text-[#00775C]",
    },
    {
      title: "Earnings This Month",
      value: "$2,340",
      icon: DollarSign,
      color: "text-[#F2A922]",
    },
  ];

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
  ];

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
  ];

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
  ];

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
  ];

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
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Coach Dashboard
        </h1>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:grid-cols-5">
            <TabsTrigger
              value="dashboard"
              className="data-[state=active]:bg-[#00775C] data-[state=active]:text-white"
            >
              Dashboard
            </TabsTrigger>
            <TabsTrigger
              value="reviews"
              className="data-[state=active]:bg-[#00775C] data-[state=active]:text-white"
            >
              My Reviews
            </TabsTrigger>
            <TabsTrigger
              value="earnings"
              className="data-[state=active]:bg-[#00775C] data-[state=active]:text-white"
            >
              Earnings
            </TabsTrigger>
            <TabsTrigger
              value="messages"
              className="data-[state=active]:bg-[#00775C] data-[state=active]:text-white"
            >
              Messages
            </TabsTrigger>
            <TabsTrigger
              value="profile"
              className="data-[state=active]:bg-[#00775C] data-[state=active]:text-white"
            >
              Profile Setting
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="mt-6">
            <div className="space-y-6">
              {/* Metrics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {metrics.map((metric, index) => (
                  <Card
                    key={index}
                    className="hover:shadow-lg transition-all duration-300 hover:scale-105 animate-fade-in"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">
                            {metric.title}
                          </p>
                          <p className="text-3xl font-bold text-gray-900 mt-2">
                            {metric.value}
                          </p>
                        </div>
                        <metric.icon className={`h-8 w-8 ${metric.color}`} />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Ongoing Appointments */}
                  <Card
                    className="animate-slide-up"
                    style={{ animationDelay: "400ms" }}
                  >
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold text-gray-900">
                        Ongoing Appointments
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {ongoingAppointments.map((appointment, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <div>
                            <p className="font-medium text-gray-900">
                              {appointment.student}
                            </p>
                            <p className="text-sm text-gray-600 flex items-center mt-1">
                              <Clock className="h-4 w-4 mr-1" />
                              {appointment.time}
                            </p>
                          </div>
                          <Badge
                            variant={
                              appointment.status === "ongoing"
                                ? "default"
                                : "secondary"
                            }
                            className={
                              appointment.status === "ongoing"
                                ? "bg-[#00775C] hover:bg-[#00775C]/90"
                                : ""
                            }
                          >
                            {appointment.status}
                          </Badge>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Booking Requests */}
                  <Card
                    className="animate-slide-up"
                    style={{ animationDelay: "500ms" }}
                  >
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold text-gray-900">
                        Booking Requests
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {bookingRequests.map((request, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                        >
                          <div>
                            <p className="font-medium text-gray-900">
                              {request.student}
                            </p>
                            <p className="text-sm text-gray-600">
                              {request.sport} • {request.time}
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              className="bg-[#00775C] hover:bg-[#00775C]/90"
                            >
                              Accept
                            </Button>
                            <Button size="sm" variant="outline">
                              Decline
                            </Button>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Activities */}
                  <Card
                    className="animate-slide-up"
                    style={{ animationDelay: "600ms" }}
                  >
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold text-gray-900">
                        Activities
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-7 gap-2 mb-4">
                        {["S", "M", "T", "W", "T", "F", "S"].map(
                          (day, index) => (
                            <div
                              key={index}
                              className="text-center text-sm font-medium text-gray-600 p-2"
                            >
                              {day}
                            </div>
                          )
                        )}
                        {Array.from({ length: 35 }, (_, index) => (
                          <div
                            key={index}
                            className={`aspect-square rounded-lg flex items-center justify-center text-sm cursor-pointer hover:bg-[#00775C] hover:text-white transition-colors ${
                              index === 14
                                ? "bg-[#00775C] text-white"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {index < 31 ? index + 1 : ""}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Upcoming Bookings */}
                  <Card
                    className="animate-slide-up"
                    style={{ animationDelay: "700ms" }}
                  >
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold text-gray-900">
                        Upcoming Bookings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {upcomingBookings.map((booking, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <div>
                            <p className="font-medium text-gray-900">
                              {booking.student}
                            </p>
                            <p className="text-sm text-gray-600">
                              {booking.sport} • {booking.date}
                            </p>
                            <p className="text-sm text-gray-600">
                              {booking.time}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-[#F2A922]">
                              {booking.amount}
                            </p>
                            <Button
                              size="sm"
                              variant="outline"
                              className="mt-2 bg-transparent"
                            >
                              View Details
                            </Button>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  {/* Weekly Earnings */}
                  <Card
                    className="animate-slide-up"
                    style={{ animationDelay: "800ms" }}
                  >
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold text-gray-900">
                        Weekly Earnings
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="text-center">
                          <div className="w-32 h-32 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <div className="text-center">
                              <p className="text-2xl font-bold text-[#00775C]">
                                $485
                              </p>
                              <p className="text-sm text-gray-600">This Week</p>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Goal Progress</span>
                            <span className="font-medium">78%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-[#F2A922] h-2 rounded-full"
                              style={{ width: "78%" }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Live Activities */}
                  <Card
                    className="animate-slide-up"
                    style={{ animationDelay: "900ms" }}
                  >
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold text-gray-900">
                        Live Activities
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          <p className="text-sm text-gray-700">
                            New booking from Sarah Wilson
                          </p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <p className="text-sm text-gray-700">
                            Payment received from Mike Chen
                          </p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                          <p className="text-sm text-gray-700">
                            Review posted by Emma Davis
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Recent Chats */}
                  <Card
                    className="animate-slide-up"
                    style={{ animationDelay: "1000ms" }}
                  >
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold text-gray-900">
                        Recent Chats
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {recentChats.map((chat, index) => (
                        <div
                          key={index}
                          className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Avatar className="h-10 w-10">
                            <AvatarImage
                              src={chat.avatar || "/placeholder.svg"}
                              alt={chat.student}
                            />
                            <AvatarFallback>
                              {chat.student
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 text-sm">
                              {chat.student}
                            </p>
                            <p className="text-sm text-gray-600 truncate">
                              {chat.message}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {chat.time}
                            </p>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Recent Sessions Table */}
                  <Card
                    className="animate-slide-up"
                    style={{ animationDelay: "1100ms" }}
                  >
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold text-gray-900">
                        Recent Sessions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {recentSessions.map((session, index) => (
                          <div
                            key={index}
                            className="grid grid-cols-2 gap-2 p-3 bg-gray-50 rounded-lg text-sm"
                          >
                            <div>
                              <p className="font-medium text-gray-900">
                                {session.student}
                              </p>
                              <p className="text-gray-600">{session.date}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium text-[#F2A922]">
                                {session.payment}
                              </p>
                              <Badge
                                variant={
                                  session.status === "Paid"
                                    ? "default"
                                    : "secondary"
                                }
                                className={
                                  session.status === "Paid"
                                    ? "bg-green-500 hover:bg-green-600"
                                    : ""
                                }
                              >
                                {session.status}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Bottom Banner */}
              <Card
                className="bg-gradient-to-r from-[#00775C] to-[#00775C]/90 text-white animate-slide-up"
                style={{ animationDelay: "1200ms" }}
              >
                <CardContent className="p-8 text-center">
                  <h3 className="text-xl font-bold mb-2">
                    We Welcome Your Passion And Expertise - Join With Us
                  </h3>
                  <p className="text-white/90 mb-4">
                    Expand your coaching career and reach more students
                  </p>
                  <Button className="bg-white text-[#00775C] hover:bg-gray-100 font-semibold">
                    Join With Us
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Other tab contents would go here */}
          <TabsContent value="reviews" className="mt-6">
            <Card>
              <CardContent className="p-8 text-center">
                <h3 className="text-lg font-semibold mb-2">
                  Reviews Management
                </h3>
                <p className="text-gray-600">
                  Manage and respond to student reviews
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="earnings" className="mt-6">
            <Card>
              <CardContent className="p-8 text-center">
                <h3 className="text-lg font-semibold mb-2">
                  Earnings Overview
                </h3>
                <p className="text-gray-600">
                  Track your income and payment history
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="messages" className="mt-6">
            <Card>
              <CardContent className="p-8 text-center">
                <h3 className="text-lg font-semibold mb-2">Messages</h3>
                <p className="text-gray-600">Communicate with your students</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="mt-6">
            <Card>
              <CardContent className="p-8 text-center">
                <h3 className="text-lg font-semibold mb-2">Profile Settings</h3>
                <p className="text-gray-600">
                  Update your profile information and preferences
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <style >{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(30px);
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
          animation: slide-up 0.8s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
}
