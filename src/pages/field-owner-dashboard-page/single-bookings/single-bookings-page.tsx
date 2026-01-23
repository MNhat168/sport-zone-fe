"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import type { SortingState } from "@tanstack/react-table";
import { FieldOwnerDashboardLayout } from "@/components/layouts/field-owner-dashboard-layout";
import { BookingFilters } from "@/components/booking/booking-shared/booking-filter";
import { BookingTable } from "@/components/booking/booking-shared/booking-table";
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
import { AlertCircle, Lock } from "lucide-react";
import { Loading } from "@/components/ui/loading";
import CourtBookingDetails from "@/components/pop-up/court-booking-detail";
import { OwnerReservedBookingModal } from "@/components/booking/OwnerReservedBookingModal";
import { Button } from "@/components/ui/button";
import { useFieldOwnerBookings } from "@/hooks/queries/useFieldOwnerBookings";
import { useAcceptBooking, useRejectBooking } from "@/hooks/mutations/useBookingMutations";
import { fieldOwnerBookingAPI } from "@/features/field/fieldOwnerBookingAPI";
import { getCancellationInfo } from "@/features/booking/bookingThunk";
import { useAppDispatch } from "@/store/hook";
import type { FieldOwnerBooking } from "@/types/field-type";
import logger from "@/utils/logger";
import { formatCurrency } from "@/utils/format-currency";
import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";

// Booking Status type for single bookings (no pending)
type BookingStatusType = 'confirmed' | 'cancelled' | 'completed';

// Helper function to format date from YYYY-MM-DD to Vietnamese format
const formatDate = (dateStr: string): string => {
    try {
        const date = parseISO(dateStr);
        return format(date, "EEEE, d 'Thang' M", { locale: vi });
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

// Helper function to map API booking to UI format - using booking status
const mapBookingToUI = (booking: FieldOwnerBooking) => {
    const startTime12h = formatTime(booking.startTime);
    const endTime12h = formatTime(booking.endTime);

    // Map by booking status (not transaction status)
    const bookingStatus = booking.status;
    let status: "awaiting" | "accepted" | "rejected" | "completed" = "awaiting";
    let statusText = "Cho Xac Nhan";

    switch (bookingStatus) {
        case 'pending':
            status = "awaiting";
            statusText = "Dang Cho";
            break;
        case 'confirmed':
            status = "accepted";
            statusText = "Da Xac Nhan";
            break;
        case 'cancelled':
            status = "rejected";
            statusText = "Da Huy";
            break;
        case 'completed':
            status = "completed";
            statusText = "Hoan Thanh";
            break;
        default:
            status = "awaiting";
            statusText = "Cho Xac Nhan";
    }

    // Check if this is an owner-reserved booking
    const isOwnerReserved = (booking as any).metadata?.isOwnerReserved === true;

    return {
        id: booking.bookingId,
        academyName: booking.fieldName,
        courtName: booking.courtName || (booking.courtNumber ? `Court ${booking.courtNumber}` : booking.fieldName),
        courtNumber: booking.courtNumber,
        academyImage: "/images/academies/default.jpg",
        date: formatDate(booking.date),
        time: `${startTime12h} - ${endTime12h}`,
        payment: isOwnerReserved ? "Miễn phí (Chủ sân)" : formatCurrency(booking.totalPrice, "VND"),
        status,
        statusText: isOwnerReserved ? "Đã khóa bởi chủ sân" : statusText,
        isOwnerReserved,
        originalBooking: booking,
        transactionStatus: booking.transactionStatus,
        approvalStatus: booking.approvalStatus,
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
            startOfWeek.setDate(today.getDate() - today.getDay());
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

export default function SingleBookingsPage() {
    const [searchParams, setSearchParams] = useSearchParams();

    // Read pagination from URL (with defaults)
    const currentPage = getNumberParam(searchParams, 'page', 1);
    const itemsPerPage = getNumberParam(searchParams, 'limit', 10);

    // Read sorting from URL (with defaults)
    const sortBy = (searchParams.get('sortBy') || 'createdAt') as 'createdAt' | 'date' | 'totalPrice';
    const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc';

    // Convert to TanStack Table SortingState
    const sorting: SortingState = useMemo(() => {
        return sortBy ? [{ id: sortBy, desc: sortOrder === 'desc' }] : [];
    }, [sortBy, sortOrder]);

    // UI state
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState<any>();
    const [confirmState, setConfirmState] = useState<{
        open: boolean;
        action: 'accept' | 'cancel' | null;
        bookingId: string | null;
        cancellationInfo?: any;
    }>({ open: false, action: null, bookingId: null });
    const [activeTab, setActiveTab] = useState<BookingStatusType>('confirmed');
    const [searchQuery, setSearchQuery] = useState("");
    const [timeFilter, setTimeFilter] = useState("all");
    const [hiddenIds, setHiddenIds] = useState<string[]>([]);
    const [showOwnerReservedModal, setShowOwnerReservedModal] = useState(false);

    // Calculate date range from time filter
    const { startDate, endDate } = useMemo(() => getDateRangeFromTimeFilter(timeFilter), [timeFilter]);

    // Use TanStack Query for data fetching (no recurringType for single bookings)
    const { data: response, isLoading, error } = useFieldOwnerBookings({
        fieldName: searchQuery || undefined,
        status: activeTab,
        startDate,
        endDate,
        page: currentPage,
        limit: itemsPerPage,
        type: 'field',
        recurringFilter: 'none',
        sortBy,
        sortOrder,
    });

    const bookings = response?.data?.bookings || [];
    const pagination = response?.data?.pagination;

    // Mutation hooks
    const acceptMutation = useAcceptBooking();
    const rejectMutation = useRejectBooking();

    // Update URL params helper
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

    // Load hidden IDs from localStorage
    useEffect(() => {
        try {
            const stored = localStorage.getItem('ownerHiddenSingleBookingIds');
            if (stored) {
                const parsed = JSON.parse(stored);
                if (Array.isArray(parsed)) setHiddenIds(parsed);
            }
        } catch (error) {
            logger.error("Error loading hidden booking IDs from localStorage", error);
        }
    }, []);

    // Persist hidden IDs
    useEffect(() => {
        try {
            localStorage.setItem('ownerHiddenSingleBookingIds', JSON.stringify(hiddenIds));
        } catch (error) {
            logger.error("Error persisting hidden booking IDs to localStorage", error);
        }
    }, [hiddenIds]);

    // Listen for tab changes from sidebar - using new event name
    useEffect(() => {
        const handleTabChange = (event: CustomEvent<{ tab: string }>) => {
            const tab = event.detail.tab as BookingStatusType;
            if (['confirmed', 'cancelled', 'completed'].includes(tab)) {
                setActiveTab(tab);
                // Reset to page 1 when tab changes
                updateSearchParams({ page: undefined });
            }
        };

        window.addEventListener('single-booking-tab-change', handleTabChange as EventListener);
        return () => {
            window.removeEventListener('single-booking-tab-change', handleTabChange as EventListener);
        };
    }, [updateSearchParams]);





    const handleViewDetails = async (bookingId: string) => {
        const booking = bookings?.find(b => b.bookingId === bookingId);
        if (!booking) return;

        const startTime12h = formatTime(booking.startTime);
        const endTime12h = formatTime(booking.endTime);
        const bookingDate = formatDate(booking.date);

        // Initial display using available data
        const initialDisplayCourt = booking.courtName || (booking.courtNumber ? `San ${booking.courtNumber}` : booking.fieldName);

        // 1. Open popup immediately
        setSelectedBooking({
            academy: booking.fieldName,
            court: initialDisplayCourt,
            bookedOn: bookingDate,
            bookingDate: bookingDate,
            bookingTime: `${startTime12h} - ${endTime12h}`,
            totalAmountPaid: formatCurrency(booking.totalPrice, "VND"),
            customer: booking.customer,
            amenities: booking.selectedAmenities,
            amenitiesFee: booking.amenitiesFee ? formatCurrency(booking.amenitiesFee, "VND") : "0 d",
            originalBooking: booking,
            note: undefined, // Loading state or hidden initially
            fieldAddress: undefined, // Loading state or hidden initially
            bookingAmount: booking.bookingAmount ? formatCurrency(booking.bookingAmount, "VND") : undefined,
            platformFee: booking.metadata?.systemFeeAmount ? formatCurrency(booking.metadata.systemFeeAmount, "VND") : undefined,
        });
        setIsDetailsOpen(true);

        // 2. Fetch details in background
        try {
            const res: any = await fieldOwnerBookingAPI.ownerGetBookingDetail(bookingId);

            let updatedCourtName = initialDisplayCourt;
            if (res?.court) {
                const court = typeof res.court === 'string' ? null : res.court;
                const fetchedName = court?.name || (court?.courtNumber ? `San ${court.courtNumber}` : undefined);
                if (fetchedName) updatedCourtName = fetchedName;
            }

            let fieldAddress: string | undefined;
            if (res?.field?.location) {
                const location = res.field.location;
                fieldAddress = typeof location === 'string' ? location : location.address;
            }

            // 3. Update state with fetched details
            setSelectedBooking((prev: any) => ({
                ...prev,
                note: res?.note,
                court: updatedCourtName,
                fieldAddress: fieldAddress
            }));
        } catch {
            // ignore detail fetch error
        }
    };

    const handleAccept = (bookingId: string) => {
        setConfirmState({ open: true, action: 'accept', bookingId });
    };

    const handleCancel = async (bookingId: string) => {
        try {
            // Fetch cancellation info before showing confirmation
            const cancellationInfo = await dispatch(getCancellationInfo({ bookingId, role: 'owner' })).unwrap();
            setConfirmState({ open: true, action: 'cancel', bookingId, cancellationInfo });
        } catch (error: any) {
            logger.error('Failed to get cancellation info:', error);
            // Still show dialog but without cancellation info
            setConfirmState({ open: true, action: 'cancel', bookingId });
        }
    };

    const handleConfirmAction = async () => {
        const { action, bookingId } = confirmState;
        if (!bookingId || !action) return;

        try {
            if (action === 'accept') {
                await acceptMutation.mutateAsync(bookingId);
            } else {
                await rejectMutation.mutateAsync({ bookingId });
            }

            setHiddenIds((prev) => Array.from(new Set([...prev, bookingId])));
        } catch (e) {
            logger.error(`${action} booking failed`, e);
        } finally {
            setConfirmState({ open: false, action: null, bookingId: null, cancellationInfo: undefined });
        }
    };

    const handleSearch = (value: string) => {
        setSearchQuery(value);
        // Reset to page 1 when search changes
        updateSearchParams({ page: undefined });
    };

    const handleTimeFilterChange = (value: string) => {
        setTimeFilter(value);
        // Reset to page 1 when filter changes
        updateSearchParams({ page: undefined });
    };

    const handleSortChange = (value: string) => {
        // This is for the BookingFilters dropdown - keeping for backward compatibility
        if (value === 'date-desc') {
            updateSearchParams({ sortBy: 'createdAt', sortOrder: 'desc', page: undefined });
        } else if (value === 'date-asc') {
            updateSearchParams({ sortBy: 'createdAt', sortOrder: 'asc', page: undefined });
        }
    };

    const handleTabChangeFromFilter = (value: string) => {
        // This is for courts/coaches tab in filter - not used for single bookings
        logger.debug("Tab from filter:", value);
    };

    // TanStack Table pagination handlers
    const handlePageChange = (page: number) => {
        updateSearchParams({ page: page === 1 ? undefined : String(page) });
    };

    const handlePageSizeChange = (size: number) => {
        updateSearchParams({
            limit: size === 10 ? undefined : String(size),
            page: undefined, // Reset to page 1
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
                sortOrder: firstSort.desc ? undefined : 'asc', // 'desc' is default
                page: undefined,
            });
        }
    };

    // Map bookings from API to UI format
    const mappedBookings = useMemo(() => {
        const rows: FieldOwnerBooking[] = bookings || [];
        const mapped = rows.map(mapBookingToUI);
        return mapped.filter((b) => !hiddenIds.includes(b.id));
    }, [bookings, hiddenIds]);

    const totalPages = pagination?.totalPages || 1;

    return (
        <FieldOwnerDashboardLayout>
            <div className="space-y-6">
                <Card className="bg-white shadow-md rounded-none border-0 gap-0">
                    <CardHeader className="border-b">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <CardTitle className="text-xl font-semibold text-start">
                                    Đặt Sân Đơn Lẻ
                                </CardTitle>
                                <p className="text-gray-600 text-base mt-1.5 text-start">
                                    Quản lý các đơn đặt sân đơn lẻ.
                                </p>
                            </div>
                            <Button
                                onClick={() => setShowOwnerReservedModal(true)}
                                className="bg-amber-600 hover:bg-amber-700 text-white"
                            >
                                <Lock className="w-4 h-4 mr-2" />
                                Khóa sân nhanh
                            </Button>
                        </div>
                        <div className="mt-4">
                            <BookingFilters
                                onSearch={handleSearch}
                                onTimeFilterChange={handleTimeFilterChange}
                                onSortChange={handleSortChange}
                                onTabChange={handleTabChangeFromFilter}
                            />
                        </div>
                    </CardHeader>
                    <CardContent>
                        {error && (
                            <Alert variant="destructive" className="mb-4">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>
                                    {error?.message || "Có lỗi xảy ra khi tải dữ liệu đặt chỗ"}
                                </AlertDescription>
                            </Alert>
                        )}

                        {/* Only show full loading on initial load */}
                        {isLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <Loading size={32} />
                            </div>
                        ) : (
                            <>
                                {mappedBookings.length === 0 ? (
                                    <div className="text-center py-12">
                                        <p className="text-gray-500 text-lg">Khong co dat cho nao</p>
                                        <p className="text-gray-400 text-sm mt-2">
                                            {searchQuery || timeFilter !== "all" || activeTab !== 'confirmed'
                                                ? "Thu thay doi bo loc de xem them ket qua"
                                                : "Ban chua co dat cho nao"}
                                        </p>
                                    </div>
                                ) : (
                                    <BookingTable
                                        bookings={mappedBookings}
                                        onViewDetails={handleViewDetails}
                                        onAccept={handleAccept}
                                        onDeny={handleCancel}
                                        onCancel={handleCancel}
                                        // Pagination props
                                        totalPages={totalPages}
                                        currentPage={currentPage}
                                        pageSize={itemsPerPage}
                                        onPageChange={handlePageChange}
                                        onPageSizeChange={handlePageSizeChange}
                                        // Sorting props
                                        sorting={sorting}
                                        onSortingChange={handleSortingChange}
                                        // Loading state
                                        isLoading={isLoading}
                                    />
                                )}
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>

            <CourtBookingDetails
                isOpen={isDetailsOpen}
                onClose={() => setIsDetailsOpen(false)}
                bookingData={selectedBooking}
            />

            <AlertDialog open={confirmState.open} onOpenChange={(open) => !open && setConfirmState(prev => ({ ...prev, open: false }))}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {confirmState.action === 'accept' ? 'Xác nhận chấp nhận' : 'Xác nhận hủy booking'}
                        </AlertDialogTitle>
                        <AlertDialogDescription className="space-y-3" asChild>
                            <div>
                                {confirmState.action === 'accept' ? (
                                    <p>Bạn có chắc chắn muốn chấp nhận yêu cầu đặt chỗ này không?</p>
                                ) : (
                                    <>
                                        {confirmState.cancellationInfo && !confirmState.cancellationInfo.eligibility?.allowed ? (
                                            <Alert variant="destructive">
                                                <AlertCircle className="h-4 w-4" />
                                                <AlertDescription>
                                                    {confirmState.cancellationInfo.eligibility?.errorMessage || 'Booking này không thể được hủy.'}
                                                </AlertDescription>
                                            </Alert>
                                        ) : (
                                            <>
                                                <p>Bạn có chắc chắn muốn hủy booking này không? Khách hàng sẽ nhận 100% refund.</p>
                                                {confirmState.cancellationInfo && (
                                                    <div className="space-y-2">
                                                        {confirmState.cancellationInfo.warningMessage && (
                                                            <Alert variant={confirmState.cancellationInfo.penaltyPercentage === 100 ? "destructive" : "default"}>
                                                                <AlertCircle className="h-4 w-4" />
                                                                <AlertDescription>
                                                                    {confirmState.cancellationInfo.warningMessage}
                                                                </AlertDescription>
                                                            </Alert>
                                                        )}
                                                        {confirmState.cancellationInfo.penaltyAmount !== undefined && confirmState.cancellationInfo.penaltyAmount > 0 && (
                                                            <div className="text-sm bg-red-50 p-3 rounded-md border border-red-200">
                                                                <p className="font-medium text-red-900">
                                                                    Phí phạt: {confirmState.cancellationInfo.penaltyAmount.toLocaleString('vi-VN')} đ
                                                                    {confirmState.cancellationInfo.penaltyPercentage !== undefined && (
                                                                        <span> ({confirmState.cancellationInfo.penaltyPercentage}%)</span>
                                                                    )}
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </>
                                )}
                            </div>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                        {confirmState.action === 'accept' || confirmState.cancellationInfo?.eligibility?.allowed !== false ? (
                            <AlertDialogAction onClick={handleConfirmAction}>
                                {confirmState.action === 'accept' ? 'Chấp nhận' : 'Xác nhận hủy'}
                            </AlertDialogAction>
                        ) : null}
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <OwnerReservedBookingModal
                isOpen={showOwnerReservedModal}
                onClose={() => setShowOwnerReservedModal(false)}
                onSuccess={() => {
                    // TanStack Query auto-refreshes via refetchInterval
                }}
            />
        </FieldOwnerDashboardLayout>
    );
}
