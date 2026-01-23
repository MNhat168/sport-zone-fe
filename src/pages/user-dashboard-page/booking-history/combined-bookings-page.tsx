"use client";

import { useState, useMemo, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import type { SortingState } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertCircle, Users } from "lucide-react";
import { Loading } from "@/components/ui/loading";
import { UserDashboardTabs } from "@/components/tabs/user-dashboard-tabs";
import { NavbarDarkComponent } from "@/components/header/navbar-dark-component";
import { UserDashboardHeader } from "@/components/header/user-dashboard-header";
import { PageWrapper } from "@/components/layouts/page-wrapper";
import { BookingFilters } from "@/components/booking/booking-shared/booking-filter";
import { BookingTable, type BookingRow } from "@/components/booking/booking-shared/booking-table";
import BookingDetailModal from "@/components/pop-up/booking-detail-modal";
import { useUserBookings } from "@/hooks/queries/useUserBookings";
import { useCancelBooking } from "@/hooks/mutations/useUserBookingMutations";
import type { Booking } from "@/types/booking-type";
import logger from "@/utils/logger";
import { formatCurrency } from "@/utils/format-currency";
import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";

// Booking Status type for combined bookings
type BookingStatusType = 'confirmed' | 'pending' | 'cancelled' | 'completed';

// Helper function to format date from YYYY-MM-DD to Vietnamese format
const formatDate = (dateStr: string): string => {
    try {
        const date = parseISO(dateStr);
        return format(date, "EEEE, d 'Tháng' M", { locale: vi });
    } catch {
        return dateStr;
    }
};

// Helper function to format time from HH:mm to 12-hour format
const formatTime = (time24h: string): string => {
    try {
        const [hours, minutes] = time24h.split(":");
        const hour = parseInt(hours, 10);
        const period = hour >= 12 ? "PM" : "AM";
        const hour12 = hour % 12 || 12;
        return `${hour12.toString().padStart(2, "0")}:${minutes} ${period}`;
    } catch {
        return time24h;
    }
};

// Helper function to map API booking to UI format
const mapBookingToUI = (booking: Booking): BookingRow => {
    const startTime12h = formatTime(booking.startTime);
    const endTime12h = formatTime(booking.endTime);

    // Map by booking status
    const bookingStatus = booking.status;
    let status: "awaiting" | "accepted" | "rejected" | "completed" = "awaiting";
    let statusText = "Chờ Xác Nhận";

    switch (bookingStatus) {
        case 'pending':
            status = "awaiting";
            statusText = "Đang Chờ";
            break;
        case 'confirmed':
            status = "accepted";
            statusText = "Đã Xác Nhận";
            break;
        case 'cancelled':
            status = "rejected";
            statusText = "Đã Hủy";
            break;
        case 'completed':
            status = "completed";
            statusText = "Hoàn Thành";
            break;
        default:
            status = "awaiting";
            statusText = "Chờ Xác Nhận";
    }

    const field = typeof booking.field === 'object' ? booking.field : null;
    const court = typeof booking.court === 'object' ? booking.court : null;

    return {
        id: booking._id,
        academyName: field?.name || 'Unknown Field',
        courtName: court?.name || (court?.courtNumber ? `Sân ${court.courtNumber}` : undefined),
        courtNumber: court?.courtNumber,
        academyImage: field?.images?.[0] || "/placeholder.svg",
        date: formatDate(booking.date),
        time: `${startTime12h} - ${endTime12h}`,
        payment: formatCurrency(booking.totalPrice || 0, "VND"),
        status,
        statusText,
        originalBooking: booking,
        createdAt: booking.createdAt,
    };
};

// Helper function to get date range from time filter
const getDateRangeFromTimeFilter = (timeFilter: string): { startDate?: string; endDate?: string } => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    switch (timeFilter) {
        case "this-week": {
            const startOfWeek = new Date(today);
            const day = today.getDay();
            const diff = today.getDate() - day + (day === 0 ? -6 : 1);
            startOfWeek.setDate(diff);
            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 6);
            return {
                startDate: format(startOfWeek, "yyyy-MM-dd"),
                endDate: format(endOfWeek, "yyyy-MM-dd"),
            };
        }
        case "this-month": {
            const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
            const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
            return {
                startDate: format(startOfMonth, "yyyy-MM-dd"),
                endDate: format(endOfMonth, "yyyy-MM-dd"),
            };
        }
        case "last-month": {
            const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
            const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
            return {
                startDate: format(startOfLastMonth, "yyyy-MM-dd"),
                endDate: format(endOfLastMonth, "yyyy-MM-dd"),
            };
        }
        case "all":
        default:
            return {};
    }
};

// Helper to get number from URL params
const getNumberParam = (params: URLSearchParams, key: string, defaultValue: number): number => {
    const value = params.get(key);
    if (!value) return defaultValue;
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? defaultValue : parsed;
};

export default function CombinedBookingsPage() {
    const [searchParams, setSearchParams] = useSearchParams();

    const currentPage = getNumberParam(searchParams, 'page', 1);
    const itemsPerPage = getNumberParam(searchParams, 'limit', 10);
    const sortBy = (searchParams.get('sortBy') || 'createdAt') as 'createdAt' | 'date' | 'totalPrice';
    const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc';

    const sorting: SortingState = useMemo(() => {
        return sortBy ? [{ id: sortBy, desc: sortOrder === 'desc' }] : [];
    }, [sortBy, sortOrder]);

    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
    const [confirmState, setConfirmState] = useState<{
        open: boolean;
        action: 'cancel' | null;
        bookingId: string | null;
    }>({ open: false, action: null, bookingId: null });

    const [activeTab, setActiveTab] = useState<BookingStatusType>('confirmed');
    const [searchQuery, setSearchQuery] = useState("");
    const [timeFilter, setTimeFilter] = useState("all");

    const { startDate, endDate } = useMemo(() => getDateRangeFromTimeFilter(timeFilter), [timeFilter]);

    const { data: response, isLoading, error } = useUserBookings({
        status: activeTab,
        type: 'field_coach',
        startDate,
        endDate,
        page: currentPage,
        limit: itemsPerPage,
        search: searchQuery || undefined,
    });

    const bookings = response?.bookings || [];
    const pagination = response?.pagination;
    const cancelMutation = useCancelBooking();

    const updateSearchParams = useCallback(
        (updates: Record<string, string | undefined>) => {
            setSearchParams((prev) => {
                const newParams = new URLSearchParams(prev);
                for (const [key, value] of Object.entries(updates)) {
                    if (value === undefined || value === '') {
                        newParams.delete(key);
                    } else {
                        newParams.set(key, value);
                    }
                }
                return newParams;
            });
        },
        [setSearchParams]
    );

    const handleViewDetails = (bookingId: string) => {
        const booking = bookings.find((b) => b._id === bookingId);
        if (booking) {
            setSelectedBooking(booking);
            setIsDetailsOpen(true);
        }
    };

    const handleCancel = (bookingId: string) => {
        setConfirmState({ open: true, action: 'cancel', bookingId });
    };

    const getCourtIdFromBooking = (booking?: Booking) => {
        const court = booking?.court;
        if (!court) return undefined;
        return typeof court === 'string' ? court : court?._id;
    };

    const handleConfirmAction = async () => {
        const { action, bookingId } = confirmState;
        if (!bookingId || !action) return;

        try {
            if (action === 'cancel') {
                const booking = bookings.find((b) => b._id === bookingId);
                const courtId = getCourtIdFromBooking(booking);
                await cancelMutation.mutateAsync({ bookingId, courtId });
            }
        } catch (e) {
            logger.error(`${action} booking failed`, e);
        } finally {
            setConfirmState({ open: false, action: null, bookingId: null });
        }
    };

    const handleSearch = (value: string) => {
        setSearchQuery(value);
        updateSearchParams({ page: undefined });
    };

    const handleTimeFilterChange = (value: string) => {
        setTimeFilter(value);
        updateSearchParams({ page: undefined });
    };

    const handleSortChange = (value: string) => {
        if (value === 'date-desc') {
            updateSearchParams({ sortBy: 'createdAt', sortOrder: 'desc', page: undefined });
        } else if (value === 'date-asc') {
            updateSearchParams({ sortBy: 'createdAt', sortOrder: 'asc', page: undefined });
        }
    };

    // TanStack Table pagination handlers
    const handlePageChange = (page: number) => {
        updateSearchParams({ page: page === 1 ? undefined : String(page) });
    };

    const handlePageSizeChange = (size: number) => {
        updateSearchParams({
            limit: size === 10 ? undefined : String(size),
            page: undefined,
        });
    };

    // TanStack Table sorting handler
    const handleSortingChange = (newSorting: SortingState) => {
        const firstSort = newSorting[0];
        if (!firstSort) {
            updateSearchParams({
                sortBy: undefined,
                sortOrder: undefined,
                page: undefined,
            });
        } else {
            updateSearchParams({
                sortBy: firstSort.id === 'createdAt' ? undefined : firstSort.id,
                sortOrder: firstSort.desc ? undefined : 'asc',
                page: undefined,
            });
        }
    };

    // Map bookings from API to UI format
    const mappedBookings = useMemo(() => {
        return bookings.map(mapBookingToUI);
    }, [bookings]);

    const totalPages = pagination?.totalPages || 1;

    return (
        <>
            <NavbarDarkComponent />
            <PageWrapper className="min-h-screen">
                <UserDashboardHeader />
                <UserDashboardTabs />
                <div className="container mx-auto px-4 md:px-6 lg:px-12 py-4 md:py-6 lg:py-8">
                    <div className="space-y-4 md:space-y-6">
                        <Card className="bg-white shadow-md rounded-none border-0 gap-0">
                            <CardHeader className="border-b p-4 md:p-6">
                                <CardTitle className="text-lg md:text-xl font-semibold text-start flex items-center gap-2">
                                    <Users className="w-4 h-4 md:w-5 md:h-5 text-emerald-600 flex-shrink-0" />
                                    <span className="break-words">Combo Sân + HLV</span>
                                </CardTitle>
                                <p className="text-gray-600 text-sm md:text-base mt-1.5 text-start">
                                    Quản lý và theo dõi tất cả các đặt sân kèm huấn luyện viên của bạn.
                                </p>

                                {/* Status Tabs */}
                                <div className="flex flex-wrap gap-1 md:gap-1 mt-4">
                                    <Button
                                        variant={activeTab === "confirmed" ? "default" : "outline"}
                                        onClick={() => {
                                            setActiveTab("confirmed");
                                            updateSearchParams({ page: undefined });
                                        }}
                                        className={`text-xs md:text-sm px-2 sm:px-3 md:px-4 py-2 ${activeTab === "confirmed" ? "bg-black text-white hover:bg-gray-800" : "hover:bg-gray-100"
                                            } transition-all duration-200`}
                                    >
                                        Đã xác nhận
                                    </Button>
                                    <Button
                                        variant={activeTab === "pending" ? "default" : "outline"}
                                        onClick={() => {
                                            setActiveTab("pending");
                                            updateSearchParams({ page: undefined });
                                        }}
                                        className={`text-xs md:text-sm px-2 sm:px-3 md:px-4 py-2 ${activeTab === "pending" ? "bg-black text-white hover:bg-gray-800" : "hover:bg-gray-100"
                                            } transition-all duration-200`}
                                    >
                                        Đang chờ
                                    </Button>
                                    <Button
                                        variant={activeTab === "cancelled" ? "default" : "outline"}
                                        onClick={() => {
                                            setActiveTab("cancelled");
                                            updateSearchParams({ page: undefined });
                                        }}
                                        className={`text-xs md:text-sm px-2 sm:px-3 md:px-4 py-2 ${activeTab === "cancelled" ? "bg-black text-white hover:bg-gray-800" : "hover:bg-gray-100"
                                            } transition-all duration-200`}
                                    >
                                        Đã hủy
                                    </Button>
                                    <Button
                                        variant={activeTab === "completed" ? "default" : "outline"}
                                        onClick={() => {
                                            setActiveTab("completed");
                                            updateSearchParams({ page: undefined });
                                        }}
                                        className={`text-xs md:text-sm px-2 sm:px-3 md:px-4 py-2 ${activeTab === "completed" ? "bg-black text-white hover:bg-gray-800" : "hover:bg-gray-100"
                                            } transition-all duration-200`}
                                    >
                                        Hoàn thành
                                    </Button>
                                </div>

                                <div className="mt-4">
                                    <BookingFilters
                                        onSearch={handleSearch}
                                        onTimeFilterChange={handleTimeFilterChange}
                                        onSortChange={handleSortChange}
                                    />
                                </div>
                            </CardHeader>
                            <CardContent className="p-4 md:p-6">
                                {error && (
                                    <Alert variant="destructive" className="mb-4">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertDescription>
                                            {error?.message || "Có lỗi xảy ra khi tải dữ liệu đặt chỗ"}
                                        </AlertDescription>
                                    </Alert>
                                )}

                                {isLoading ? (
                                    <div className="flex items-center justify-center py-12">
                                        <Loading size={32} />
                                    </div>
                                ) : (
                                    <>
                                        {mappedBookings.length === 0 ? (
                                            <div className="text-center py-12">
                                                <p className="text-gray-500 text-lg">Không có đặt chỗ nào</p>
                                                <p className="text-gray-400 text-sm mt-2">
                                                    {searchQuery || timeFilter !== "all" || activeTab !== 'confirmed'
                                                        ? "Thử thay đổi bộ lọc để xem thêm kết quả"
                                                        : "Bạn chưa có đặt sân kèm HLV nào"}
                                                </p>
                                            </div>
                                        ) : (
                                            <BookingTable
                                                bookings={mappedBookings}
                                                onViewDetails={handleViewDetails}
                                                onCancel={handleCancel}
                                                totalPages={totalPages}
                                                currentPage={currentPage}
                                                pageSize={itemsPerPage}
                                                onPageChange={handlePageChange}
                                                onPageSizeChange={handlePageSizeChange}
                                                sorting={sorting}
                                                onSortingChange={handleSortingChange}
                                                isLoading={isLoading}
                                            />
                                        )}
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </PageWrapper>

            <BookingDetailModal
                isOpen={isDetailsOpen}
                onClose={() => setIsDetailsOpen(false)}
                booking={selectedBooking}
            />

            <AlertDialog open={confirmState.open} onOpenChange={(open) => !open && setConfirmState(prev => ({ ...prev, open: false }))}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xác nhận hủy đặt sân</AlertDialogTitle>
                        <AlertDialogDescription className="space-y-2">
                            <p>Bạn có chắc chắn muốn hủy đặt sân này không? Hành động này không thể hoàn tác.</p>
                            <p className="text-sm text-yellow-600 font-medium bg-yellow-50 p-3 rounded-md border border-yellow-200">
                                Lưu ý: Bạn chỉ được hoàn tiền từ chủ sân / huấn luyện viên khi hủy đặt trước 12h tính từ thời điểm bắt đầu slot bạn đặt.
                            </p>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Đóng</AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirmAction} className="bg-red-600 hover:bg-red-700 text-white">
                            Xác nhận hủy
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
