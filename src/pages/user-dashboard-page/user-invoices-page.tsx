"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  LayoutDashboard,
  Calendar,
  MessageCircle,
  Receipt,
  Wallet,
  Settings,
  Search,
  Download,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";

const invoiceData = [
  {
    id: "#C014",
    courtName: "Downtown Sports Center",
    courtNumber: "Court #1",
    date: "Jan 15, 2025",
    time: "2:00 PM",
    payment: 45.0,
    paidOn: "Jan 15, 2025",
    status: "Paid",
  },
  {
    id: "#C015",
    courtName: "Elite Tennis Club",
    courtNumber: "Court #3",
    date: "Jan 18, 2025",
    time: "4:30 PM",
    payment: 60.0,
    paidOn: "-",
    status: "Pending",
  },
  {
    id: "#C016",
    courtName: "City Sports Complex",
    courtNumber: "Court #2",
    date: "Jan 12, 2025",
    time: "10:00 AM",
    payment: 35.0,
    paidOn: "-",
    status: "Failed",
  },
  {
    id: "#C017",
    courtName: "Riverside Courts",
    courtNumber: "Court #4",
    date: "Jan 10, 2025",
    time: "6:00 PM",
    payment: 50.0,
    paidOn: "Jan 10, 2025",
    status: "Paid",
  },
];

export default function UserInvoicesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("Courts");
  const [timeFilter, setTimeFilter] = useState("This Week");
  const [sortBy, setSortBy] = useState("Relevance");
  const [invoiceFilter, setInvoiceFilter] = useState("All Invoices");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Paid":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            Paid
          </Badge>
        );
      case "Pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            Pending
          </Badge>
        );
      case "Failed":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            Failed
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const filteredInvoices = invoiceData.filter(
    (invoice) =>
      invoice.courtName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            {/* Breadcrumb */}
            <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-4 animate-fade-in">
              <Link href="/" className="hover:text-[#00775C] transition-colors">
                Home
              </Link>
              <span>{">"}</span>
              <span className="text-gray-900">Invoice</span>
            </nav>

            {/* Page Title */}
            <h1 className="text-3xl font-bold text-gray-900 animate-slide-up">
              Invoice
            </h1>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 py-4">
            <Link
              href="/user/dashboard"
              className="flex items-center space-x-2 text-gray-500 hover:text-[#00775C] transition-colors animate-fade-in"
              style={{ animationDelay: "0.1s" }}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </Link>
            <Link
              href="/user/bookings"
              className="flex items-center space-x-2 text-gray-500 hover:text-[#00775C] transition-colors animate-fade-in"
              style={{ animationDelay: "0.2s" }}
            >
              <Calendar className="w-4 h-4" />
              <span>My Bookings</span>
            </Link>
            <Link
              href="#"
              className="flex items-center space-x-2 text-gray-500 hover:text-[#00775C] transition-colors animate-fade-in"
              style={{ animationDelay: "0.3s" }}
            >
              <MessageCircle className="w-4 h-4" />
              <span>Chat</span>
            </Link>
            <Link
              href="/user/invoices"
              className="flex items-center space-x-2 text-[#00775C] border-b-2 border-[#00775C] pb-4 animate-fade-in"
              style={{ animationDelay: "0.4s" }}
            >
              <Receipt className="w-4 h-4" />
              <span className="font-medium">Invoices</span>
            </Link>
            <Link
              href="#"
              className="flex items-center space-x-2 text-gray-500 hover:text-[#00775C] transition-colors animate-fade-in"
              style={{ animationDelay: "0.5s" }}
            >
              <Wallet className="w-4 h-4" />
              <span>Wallet</span>
            </Link>
            <Link
              href="#"
              className="flex items-center space-x-2 text-gray-500 hover:text-[#00775C] transition-colors animate-fade-in"
              style={{ animationDelay: "0.6s" }}
            >
              <Settings className="w-4 h-4" />
              <span>Profile Setting</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter Section */}
        <div
          className="flex flex-wrap items-center justify-between gap-4 mb-8 animate-slide-up"
          style={{ animationDelay: "0.2s" }}
        >
          <div className="flex items-center space-x-4">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <Button
                variant={selectedFilter === "Courts" ? "default" : "ghost"}
                size="sm"
                onClick={() => setSelectedFilter("Courts")}
                className={`${
                  selectedFilter === "Courts"
                    ? "bg-black text-white hover:bg-black"
                    : "hover:bg-gray-200"
                } transition-all duration-200`}
              >
                Courts
              </Button>
              <Button
                variant={selectedFilter === "Coaches" ? "default" : "ghost"}
                size="sm"
                onClick={() => setSelectedFilter("Coaches")}
                className={`${
                  selectedFilter === "Coaches"
                    ? "bg-black text-white hover:bg-black"
                    : "hover:bg-gray-200"
                } transition-all duration-200`}
              >
                Coaches
              </Button>
            </div>

            <Select value={timeFilter} onValueChange={setTimeFilter}>
              <SelectTrigger className="w-32 hover:border-[#00775C] transition-colors">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="This Week">This Week</SelectItem>
                <SelectItem value="This Month">This Month</SelectItem>
                <SelectItem value="Last Month">Last Month</SelectItem>
                <SelectItem value="This Year">This Year</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40 hover:border-[#00775C] transition-colors">
                <SelectValue placeholder="Sort By: Relevance" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Relevance">Sort By: Relevance</SelectItem>
                <SelectItem value="Date">Sort By: Date</SelectItem>
                <SelectItem value="Amount">Sort By: Amount</SelectItem>
                <SelectItem value="Status">Sort By: Status</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Invoices Section */}
        <Card className="animate-slide-up" style={{ animationDelay: "0.3s" }}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold text-gray-900">
                  Invoices
                </CardTitle>
                <p className="text-gray-600 mt-1">
                  Access recent invoices related to court bookings.
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search invoices..."
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
                    <SelectItem value="All Invoices">All Invoices</SelectItem>
                    <SelectItem value="Paid">Paid</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Failed">Failed</SelectItem>
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
                    <TableHead className="font-semibold">Court Name</TableHead>
                    <TableHead className="font-semibold">Date & Time</TableHead>
                    <TableHead className="font-semibold">Payment</TableHead>
                    <TableHead className="font-semibold">Paid On</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Download</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvoices.map((invoice, index) => (
                    <TableRow
                      key={invoice.id}
                      className="hover:bg-gray-50 transition-colors animate-fade-in"
                      style={{ animationDelay: `${0.1 * index}s` }}
                    >
                      <TableCell className="font-medium">
                        {invoice.id}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                            <div className="w-6 h-6 bg-gray-400 rounded"></div>
                          </div>
                          <div>
                            <div className="font-medium">
                              {invoice.courtName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {invoice.courtNumber}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{invoice.date}</div>
                          <div className="text-sm text-gray-500">
                            {invoice.time}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        ${invoice.payment.toFixed(2)}
                      </TableCell>
                      <TableCell>{invoice.paidOn}</TableCell>
                      <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant={
                            invoice.status === "Paid" ? "default" : "secondary"
                          }
                          className={`${
                            invoice.status === "Paid"
                              ? "bg-black hover:bg-gray-800 text-white"
                              : "bg-gray-200 hover:bg-gray-300 text-gray-600"
                          } transition-all duration-200 hover:scale-105`}
                          disabled={invoice.status !== "Paid"}
                        >
                          <Download className="w-4 h-4 mr-1" />
                          Download
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            <div
              className="flex items-center justify-between mt-6 pt-6 border-t animate-fade-in"
              style={{ animationDelay: "0.5s" }}
            >
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Show</span>
                <Select
                  value={itemsPerPage.toString()}
                  onValueChange={(value) => setItemsPerPage(Number(value))}
                >
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
                <span className="text-sm text-gray-600">per page</span>
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
                  Previous
                </Button>

                <div className="flex items-center space-x-1">
                  {[1, 2, 3].map((page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className={`w-8 h-8 p-0 ${
                        currentPage === page
                          ? "bg-black hover:bg-gray-800"
                          : "hover:bg-[#00775C] hover:text-white"
                      } transition-colors`}
                    >
                      {page}
                    </Button>
                  ))}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  className="hover:bg-[#00775C] hover:text-white transition-colors"
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom CTA Section */}
      <div
        className="bg-black text-white py-16 mt-16 animate-fade-in"
        style={{ animationDelay: "0.6s" }}
      >
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2
            className="text-3xl font-bold mb-4 animate-slide-up"
            style={{ animationDelay: "0.7s" }}
          >
            We Welcome Your Passion And Expertise
          </h2>
          <p
            className="text-gray-300 text-lg mb-8 animate-slide-up"
            style={{ animationDelay: "0.8s" }}
          >
            Join our empowering sports community today and grow with us
          </p>
          <Button
            size="lg"
            className="bg-white text-black hover:bg-gray-100 transition-all duration-300 hover:scale-105 animate-slide-up"
            style={{ animationDelay: "0.9s" }}
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
          animation: slide-up 0.8s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
}
