"use client";

import { useState } from "react";
import { NavbarDarkComponent } from "@/components/header/navbar-dark-component";
import { FieldOwnerDashboardHeader } from "@/components/header/field-owner-dashboard-header";
import { FieldOwnerDashboardTabs } from "@/components/tabs/field-owner-dashboard-tabs";
import { PageWrapper } from "@/components/layouts/page-wrapper";
import { BookingHistoryTabs } from "@/components/tabs/field-history-booking-tab";
import { BookingFilters } from "./components/booking-filter";
import { BookingTable } from "./components/booking-table";
import { BookingPagination } from "./components/field-history-booking-page";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CourtBookingDetails from "@/components/pop-up/court-booking-detail";

// Mock data
const mockBookings = [
    {
        id: "1",
        academyName: "Bwing Sports Academy",
        courtName: "Sân 1",
        academyImage: "/images/academies/bwing.jpg",
        date: "Thứ Hai, 15 Tháng 7",
        time: "03:00 PM - 05:00 PM",
        payment: "$130",
        status: "awaiting" as const,
        statusText: "Chờ Xác Nhận",
    },
    {
        id: "2",
        academyName: "Feather Badminton",
        courtName: "Sân 1",
        academyImage: "/images/academies/feather.jpg",
        date: "Thứ Hai, 12 Tháng 7",
        time: "02:00 PM - 05:00 PM",
        payment: "$90",
        status: "awaiting" as const,
        statusText: "Chờ Xác Nhận",
    },
    {
        id: "3",
        academyName: "Leap Sports Academy",
        courtName: "Sân 1",
        academyImage: "/images/academies/leap.jpg",
        date: "Thứ Hai, 11 Tháng 7",
        time: "06:00 PM - 08:00 PM",
        payment: "$120",
        status: "accepted" as const,
        statusText: "Đã Chấp Nhận",
    },
    {
        id: "4",
        academyName: "Marsh Academy",
        courtName: "Sân 1",
        academyImage: "/images/academies/marsh.jpg",
        date: "Thứ Hai, 16 Tháng 7",
        time: "05:00 PM - 07:00 PM",
        payment: "$100",
        status: "awaiting" as const,
        statusText: "Chờ Xác Nhận",
    },
    {
        id: "5",
        academyName: "Wing Sports Academy",
        courtName: "Sân 1",
        academyImage: "/images/academies/wing.jpg",
        date: "Thứ Hai, 16 Tháng 7",
        time: "05:00 PM - 08:00 PM",
        payment: "$140",
        status: "awaiting" as const,
        statusText: "Chờ Xác Nhận",
    },
];

const sampleBookingData = {
    academy: "Wing Sports Academy",
    court: "Sân 1",
    bookedOn: "Thứ Hai, 14 Tháng 7",
    pricePerGuest: "$15",
    maxGuests: "2",
    bookingDate: "Thứ Hai, 14 Tháng 7",
    bookingTime: "05:00 PM - 08:00 PM",
    totalHours: "2",
    courtBookingAmount: "$150",
    additionalGuests: "2",
    additionalGuestsAmount: "$30",
    serviceCharge: "$20",
    totalAmountPaid: "$180",
    paidOn: "Thứ Hai, 14 Tháng 7",
    transactionId: "#5464164445676781641",
    paymentType: "Ví điện tử",
};

export default function FieldHistoryBookingPage() {
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState<typeof sampleBookingData | undefined>();

    const handleViewDetails = (bookingId: string) => {
        // In real app, fetch booking details by ID
        setSelectedBooking(sampleBookingData);
        setIsDetailsOpen(true);
    };

    const handleChat = (bookingId: string) => {
        // Handle chat functionality
        console.log("Open chat for booking:", bookingId);
    };

    const handleSearch = (value: string) => {
        console.log("Search:", value);
    };

    const handleTimeFilterChange = (value: string) => {
        console.log("Time filter:", value);
    };

    const handleSortChange = (value: string) => {
        console.log("Sort:", value);
    };

    const handleTabChange = (value: string) => {
        console.log("Tab:", value);
    };

    return (
        <>
            <NavbarDarkComponent />
            <PageWrapper>
                {/* Header Section */}
                <FieldOwnerDashboardHeader />

                {/* Navigation Tabs */}
                <FieldOwnerDashboardTabs />

                <div className="w-full max-w-[1320px] mx-auto px-3 py-8">
                    {/* Booking History Tabs */}
                    <BookingHistoryTabs initialTab="upcoming" />

                    <div className="mt-8 space-y-6">
                        {/* Main Content Card */}
                        <Card className="shadow-md">
                            <CardHeader className="border-b">
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <div className="flex-1 max-w-[530px]">
                                        <CardTitle className="text-xl font-semibold">
                                            Đặt Chỗ Của Tôi
                                        </CardTitle>
                                        <p className="text-gray-600 text-base mt-1.5">
                                            Quản lý và theo dõi tất cả các đặt chỗ sân sắp tới của bạn.
                                        </p>
                                    </div>
                                    <div className="flex-1 max-w-[742px]">
                                        <BookingFilters
                                            onSearch={handleSearch}
                                            onTimeFilterChange={handleTimeFilterChange}
                                            onSortChange={handleSortChange}
                                            onTabChange={handleTabChange}
                                        />
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent className="p-6">
                                <BookingTable
                                    bookings={mockBookings}
                                    onViewDetails={handleViewDetails}
                                    onChat={handleChat}
                                />
                            </CardContent>
                        </Card>

                        {/* Pagination */}
                        <BookingPagination
                            currentPage={currentPage}
                            totalPages={1}
                            itemsPerPage={itemsPerPage}
                            onPageChange={setCurrentPage}
                            onItemsPerPageChange={setItemsPerPage}
                        />
                    </div>
                </div>

                {/* Booking Details Modal */}
                <CourtBookingDetails
                    isOpen={isDetailsOpen}
                    onClose={() => setIsDetailsOpen(false)}
                    bookingData={selectedBooking}
                />
            </PageWrapper>
        </>
    );
}