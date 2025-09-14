"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  CreditCard,
  MessageSquare,
  Settings,
  MoreHorizontal,
} from "lucide-react";

export default function UserDashboardPage() {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
              <span>Home</span>
              <span>{">"}</span>
              <span>User Dashboard</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">User Dashboard</h1>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-6 bg-transparent border-b-0 h-auto p-0">
              <TabsTrigger
                value="dashboard"
                className="flex items-center gap-2 py-4 px-6 border-b-2 border-transparent data-[state=active]:border-[#00775C] data-[state=active]:text-[#00775C] bg-transparent"
              >
                <Calendar className="w-4 h-4" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger
                value="bookings"
                className="flex items-center gap-2 py-4 px-6 border-b-2 border-transparent data-[state=active]:border-[#00775C] data-[state=active]:text-[#00775C] bg-transparent"
              >
                <Calendar className="w-4 h-4" />
                My Bookings
              </TabsTrigger>
              <TabsTrigger
                value="chat"
                className="flex items-center gap-2 py-4 px-6 border-b-2 border-transparent data-[state=active]:border-[#00775C] data-[state=active]:text-[#00775C] bg-transparent"
              >
                <MessageSquare className="w-4 h-4" />
                Chat
              </TabsTrigger>
              <TabsTrigger
                value="invoices"
                className="flex items-center gap-2 py-4 px-6 border-b-2 border-transparent data-[state=active]:border-[#00775C] data-[state=active]:text-[#00775C] bg-transparent"
              >
                <CreditCard className="w-4 h-4" />
                Invoices
              </TabsTrigger>
              <TabsTrigger
                value="wallet"
                className="flex items-center gap-2 py-4 px-6 border-b-2 border-transparent data-[state=active]:border-[#00775C] data-[state=active]:text-[#00775C] bg-transparent"
              >
                <CreditCard className="w-4 h-4" />
                Wallet
              </TabsTrigger>
              <TabsTrigger
                value="profile"
                className="flex items-center gap-2 py-4 px-6 border-b-2 border-transparent data-[state=active]:border-[#00775C] data-[state=active]:text-[#00775C] bg-transparent"
              >
                <Settings className="w-4 h-4" />
                Profile Setting
              </TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard" className="mt-0">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                  {/* Main Content */}
                  <div className="lg:col-span-3 space-y-8">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      <Card className="hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                        <CardContent className="p-6 text-center">
                          <div className="text-3xl font-bold text-[#00775C] mb-2">
                            24
                          </div>
                          <div className="text-sm text-gray-600">
                            Total Courts Booked
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                        <CardContent className="p-6 text-center">
                          <div className="text-3xl font-bold text-[#00775C] mb-2">
                            12
                          </div>
                          <div className="text-sm text-gray-600">
                            Total Coaches Booked
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                        <CardContent className="p-6 text-center">
                          <div className="text-3xl font-bold text-[#00775C] mb-2">
                            36
                          </div>
                          <div className="text-sm text-gray-600">
                            Total Lessons
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                        <CardContent className="p-6 text-center">
                          <div className="text-3xl font-bold text-[#00775C] mb-2">
                            $2,450
                          </div>
                          <div className="text-sm text-gray-600">
                            Total Payments
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Today's Appointment */}
                    <Card className="animate-fade-in-up">
                      <CardHeader>
                        <CardTitle className="text-xl font-semibold">
                          Today's Appointment
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b">
                                <th className="text-left py-3 px-4 font-medium text-gray-600">
                                  Court Name
                                </th>
                                <th className="text-left py-3 px-4 font-medium text-gray-600">
                                  Date
                                </th>
                                <th className="text-left py-3 px-4 font-medium text-gray-600">
                                  Start Time
                                </th>
                                <th className="text-left py-3 px-4 font-medium text-gray-600">
                                  End Time
                                </th>
                                <th className="text-left py-3 px-4 font-medium text-gray-600">
                                  Guests
                                </th>
                                <th className="text-left py-3 px-4 font-medium text-gray-600">
                                  Location
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr className="border-b hover:bg-gray-50 transition-colors">
                                <td className="py-4 px-4">Court A-1</td>
                                <td className="py-4 px-4">Jan 15, 2025</td>
                                <td className="py-4 px-4">10:00 AM</td>
                                <td className="py-4 px-4">12:00 PM</td>
                                <td className="py-4 px-4">4</td>
                                <td className="py-4 px-4">Sports Center</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </CardContent>
                    </Card>

                    {/* My Bookings */}
                    <Card className="animate-fade-in-up">
                      <CardHeader>
                        <CardTitle className="text-xl font-semibold">
                          My Bookings
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-all duration-300">
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                              <span className="text-xs text-gray-600">
                                Court Image
                              </span>
                            </div>
                            <div>
                              <h3 className="font-semibold">
                                Sports Arena - Court B-2
                              </h3>
                              <p className="text-sm text-gray-600">
                                Jan 18, 2025 • 2:00 PM - 4:00 PM
                              </p>
                              <p className="text-sm text-gray-600">
                                2 hours • 4 guests
                              </p>
                              <p className="font-semibold text-[#00775C]">
                                $120
                              </p>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </div>

                        <div className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-all duration-300">
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                              <span className="text-xs text-gray-600">
                                Court Image
                              </span>
                            </div>
                            <div>
                              <h3 className="font-semibold">
                                City Club - Court A-3
                              </h3>
                              <p className="text-sm text-gray-600">
                                Jan 20, 2025 • 6:00 PM - 8:00 PM
                              </p>
                              <p className="text-sm text-gray-600">
                                2 hours • 2 guests
                              </p>
                              <p className="font-semibold text-[#00775C]">
                                $80
                              </p>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Recent Invoices */}
                    <Card className="animate-fade-in-up">
                      <CardHeader>
                        <CardTitle className="text-xl font-semibold">
                          Recent Invoices
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b">
                                <th className="text-left py-3 px-4 font-medium text-gray-600">
                                  Court Name
                                </th>
                                <th className="text-left py-3 px-4 font-medium text-gray-600">
                                  Date & Time
                                </th>
                                <th className="text-left py-3 px-4 font-medium text-gray-600">
                                  Payment
                                </th>
                                <th className="text-left py-3 px-4 font-medium text-gray-600">
                                  Paid On
                                </th>
                                <th className="text-left py-3 px-4 font-medium text-gray-600">
                                  Status
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr className="border-b hover:bg-gray-50 transition-colors">
                                <td className="py-4 px-4">Court A-1</td>
                                <td className="py-4 px-4">
                                  Jan 12, 2025 10:00 AM
                                </td>
                                <td className="py-4 px-4">$150</td>
                                <td className="py-4 px-4">Jan 12, 2025</td>
                                <td className="py-4 px-4">
                                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                                    Paid
                                  </Badge>
                                </td>
                              </tr>
                              <tr className="border-b hover:bg-gray-50 transition-colors">
                                <td className="py-4 px-4">Court B-2</td>
                                <td className="py-4 px-4">
                                  Jan 10, 2025 2:00 PM
                                </td>
                                <td className="py-4 px-4">$120</td>
                                <td className="py-4 px-4">Jan 10, 2025</td>
                                <td className="py-4 px-4">
                                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                                    Paid
                                  </Badge>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Sidebar */}
                  <div className="space-y-6">
                    {/* Wallet Balance */}
                    <Card className="hover:shadow-lg transition-all duration-300">
                      <CardContent className="p-6">
                        <div className="text-center">
                          <div className="text-sm text-gray-600 mb-2">
                            Wallet Balance
                          </div>
                          <div className="text-3xl font-bold text-[#00775C] mb-4">
                            $845.50
                          </div>
                          <Button className="w-full bg-black hover:bg-gray-800 text-white">
                            Add Payment
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Upcoming Appointment */}
                    <Card className="animate-fade-in-up">
                      <CardHeader>
                        <CardTitle className="text-lg font-semibold">
                          Upcoming Appointment
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="text-sm font-medium">Next Court</div>
                          <div className="text-sm text-gray-600">
                            Sports Arena - Court A-1
                          </div>
                          <div className="text-sm text-gray-600">
                            Jan 15, 2025 • 10:00 AM
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* My Favourites */}
                    <Card className="animate-fade-in-up">
                      <CardHeader>
                        <CardTitle className="text-lg font-semibold">
                          My Favourites
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                          <div className="w-10 h-10 bg-gray-300 rounded flex items-center justify-center">
                            <span className="text-xs">Court</span>
                          </div>
                          <div>
                            <div className="font-medium text-sm">
                              Sports Arena A-1
                            </div>
                            <div className="text-xs text-gray-600">
                              15 bookings
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                          <div className="w-10 h-10 bg-gray-300 rounded flex items-center justify-center">
                            <span className="text-xs">Court</span>
                          </div>
                          <div>
                            <div className="font-medium text-sm">
                              City Club B-2
                            </div>
                            <div className="text-xs text-gray-600">
                              8 bookings
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                          <div className="w-10 h-10 bg-gray-300 rounded flex items-center justify-center">
                            <span className="text-xs">Court</span>
                          </div>
                          <div>
                            <div className="font-medium text-sm">
                              Tennis Center C-1
                            </div>
                            <div className="text-xs text-gray-600">
                              5 bookings
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Other tab contents would go here */}
            <TabsContent value="bookings" className="mt-0">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="text-center py-12">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    My Bookings
                  </h2>
                  <p className="text-gray-600">
                    Manage all your court bookings here.
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="chat" className="mt-0">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="text-center py-12">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    Chat
                  </h2>
                  <p className="text-gray-600">
                    Connect with coaches and other players.
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="invoices" className="mt-0">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="text-center py-12">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    Invoices
                  </h2>
                  <p className="text-gray-600">
                    View and manage your payment history.
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="wallet" className="mt-0">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="text-center py-12">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    Wallet
                  </h2>
                  <p className="text-gray-600">
                    Manage your wallet and payment methods.
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="profile" className="mt-0">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="text-center py-12">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    Profile Settings
                  </h2>
                  <p className="text-gray-600">
                    Update your profile information and preferences.
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Bottom CTA Section */}
      <div className="bg-gray-900 text-white py-16">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold mb-4 text-balance">
            We Welcome Your Passion And Expertise – Join our empowering sports
            community today and grow with us
          </h2>
          <Button className="bg-white text-gray-900 hover:bg-gray-100 px-8 py-3 text-lg font-semibold">
            Join With Us
          </Button>
        </div>
      </div>

      <style >{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
