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
import { AlertCircle } from "lucide-react";
import { Loading } from "@/components/ui/loading";
import CourtBookingDetails from "@/components/pop-up/court-booking-detail";
import { useAppDispatch } from "@/store/hook";
import {
    ownerAcceptBooking,
    ownerRejectBooking,
    ownerGetBookingDetail,
} from "@/features/field/fieldThunk";
import { useFieldOwnerBookings } from "@/hooks/queries/useFieldOwnerBookings";
import type { FieldOwnerBooking } from "@/types/field-type";
import logger from "@/utils/logger";
import { formatCurrency } from "@/utils/format-currency";
import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";

// Tabs from sidebar: pending, succeeded, cancelled, refunded
type FieldCoachBookingTab = 'pending' | 'succeeded' | 'cancelled' | 'refunded';

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

// Helper function to map API booking to UI format
const mapBookingToUI = (booking: FieldOwnerBooking) => {
    const startTime12h = formatTime(booking.startTime);
    const endTime12h = formatTime(booking.endTime);

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

    return {
        id: booking.bookingId,
        academyName: booking.fieldName,
        courtName: booking.courtName || (booking.courtNumber ? `Court ${booking.courtNumber}` : booking.fieldName),
        courtNumber: booking.courtNumber,
        academyImage: "/images/academies/default.jpg",
        date: formatDate(booking.date),
        time: `${startTime12h} - ${endTime12h}`,
        payment: formatCurrency(booking.totalPrice, "VND"),
        status,
        statusText,
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

export default function FieldCoachBookingsPage() {
    const dispatch = useAppDispatch();
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

    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState<any>();
    const [confirmState, setConfirmState] = useState<{
        open: boolean;
        action: 'accept' | 'cancel' | null;
        bookingId: string | null;
    }>({ open: false, action: null, bookingId: null });

    // Default to 'pending' as it's the first tab in sidebar for booking history
    const [activeTab, setActiveTab] = useState<FieldCoachBookingTab>('pending');
    const [searchQuery, setSearchQuery] = useState("");
    const [timeFilter, setTimeFilter] = useState("all");
    const [hiddenIds, setHiddenIds] = useState<string[]>([]);

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
            const stored = localStorage.getItem('ownerHiddenFieldCoachBookingIds');
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
            localStorage.setItem('ownerHiddenFieldCoachBookingIds', JSON.stringify(hiddenIds));
        } catch (error) {
            logger.error("Error persisting hidden booking IDs to localStorage", error);
        }
    }, [hiddenIds]);

    // Listen for tab changes from sidebar
    useEffect(() => {
        const handleTabChange = (event: CustomEvent<{ tab: string }>) => {
            const tab = event.detail.tab as FieldCoachBookingTab;
            if (['pending', 'succeeded', 'cancelled', 'refunded'].includes(tab)) {
                setActiveTab(tab);
                // Reset to page 1 when tab changes
                updateSearchParams({ page: undefined });
            }
        };

        window.addEventListener('field-coach-booking-tab-change', handleTabChange as EventListener);
        return () => {
            window.removeEventListener('field-coach-booking-tab-change', handleTabChange as EventListener);
        };
    }, [updateSearchParams]);

    // Calculate date range from time filter
    const { startDate, endDate } = useMemo(
        () => getDateRangeFromTimeFilter(timeFilter),
        [timeFilter]
    );

    // Map sidebar tab to booking status used by API
    const statusFilter: 'pending' | 'confirmed' | 'cancelled' | 'completed' = useMemo(() => {
        if (activeTab === 'succeeded') return 'confirmed';
        if (activeTab === 'cancelled' || activeTab === 'refunded') return 'cancelled';
        return 'pending';
    }, [activeTab]);

    // Use TanStack Query for data fetching (field + coach bookings)
    const { data: response, isLoading: fieldOwnerBookingsLoading, error: fieldOwnerBookingsError } =
        useFieldOwnerBookings({
            fieldName: searchQuery || undefined,
            status: statusFilter,
            startDate,
            endDate,
            page: currentPage,
            limit: itemsPerPage,
            type: 'field_coach',
            sortBy,
            sortOrder,
        });

    const fieldOwnerBookings = response?.data?.bookings || [];
    const fieldOwnerBookingsPagination = response?.data?.pagination;

    const handleViewDetails = async (bookingId: string) => {
        const booking = fieldOwnerBookings?.find(b => b.bookingId === bookingId);
        if (!booking) return;

        let note: string | undefined;
        let paymentProofImageUrl: string | undefined;
        let courtName: string | undefined;
        try {
            const res: any = await dispatch(ownerGetBookingDetail(bookingId)).unwrap();
            note = res?.note;
            if (res?.transaction?.paymentProofImageUrl) {
                paymentProofImageUrl = res.transaction.paymentProofImageUrl;
            }
            if (res?.court) {
                const court = typeof res.court === 'string' ? null : res.court;
                courtName = court?.name || (court?.courtNumber ? `San ${court.courtNumber}` : undefined);
            }
        } catch {
            // ignore detail fetch error
        }

        const startTime12h = formatTime(booking.startTime);
        const endTime12h = formatTime(booking.endTime);
        const bookingDate = formatDate(booking.date);
        const displayCourt = courtName || booking.courtName || (booking.courtNumber ? `San ${booking.courtNumber}` : booking.fieldName);

        setSelectedBooking({
            academy: booking.fieldName,
            court: displayCourt,
            bookedOn: bookingDate,
            bookingDate: bookingDate,
            bookingTime: `${startTime12h} - ${endTime12h}`,
            totalAmountPaid: formatCurrency(booking.totalPrice, "VND"),
            customer: booking.customer,
            amenities: booking.selectedAmenities,
            amenitiesFee: booking.amenitiesFee ? formatCurrency(booking.amenitiesFee, "VND") : "0 d",
            originalBooking: booking,
            note,
            paymentProofImageUrl,
        });
        setIsDetailsOpen(true);
    };

    const handleAccept = (bookingId: string) => {
        setConfirmState({ open: true, action: 'accept', bookingId });
    };

    const handleCancel = (bookingId: string) => {
        setConfirmState({ open: true, action: 'cancel', bookingId });
    };

    const handleConfirmAction = async () => {
        const { action, bookingId } = confirmState;
        if (!bookingId || !action) return;

        try {
            if (action === 'accept') {
                await dispatch(ownerAcceptBooking(bookingId)).unwrap();
            } else {
                await dispatch(ownerRejectBooking({ bookingId })).unwrap();
            }

            setHiddenIds((prev) => Array.from(new Set([...prev, bookingId])));
        } catch (e) {
            logger.error(`${action} booking failed`, e);
        } finally {
            setConfirmState({ open: false, action: null, bookingId: null });
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
        const rows: FieldOwnerBooking[] = fieldOwnerBookings || [];
        const mapped = rows.map(mapBookingToUI);
        return mapped.filter((b) => !hiddenIds.includes(b.id));
    }, [fieldOwnerBookings, hiddenIds]);

    const totalPages = fieldOwnerBookingsPagination?.totalPages || 1;

    return (
        <FieldOwnerDashboardLayout>
            <div className="space-y-6">
                <Card className="bg-white shadow-md rounded-none border-0 gap-0">
                    <CardHeader className="border-b">
                        <CardTitle className="text-xl font-semibold text-start">
                            Đặt Sân Kèm Huấn Luyện Viên
                        </CardTitle>
                        <p className="text-gray-600 text-base mt-1.5 text-start">
                            Quản lý các yêu cầu đặt sân kèm huấn luyện viên.
                        </p>
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
                        {fieldOwnerBookingsError && (
                            <Alert variant="destructive" className="mb-4">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>
                                    {fieldOwnerBookingsError?.message || "Co loi xay ra khi tai du lieu dat cho"}
                                </AlertDescription>
                            </Alert>
                        )}

                        {fieldOwnerBookingsLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <Loading size={32} />
                            </div>
                        ) : (
                            <>
                                {mappedBookings.length === 0 ? (
                                    <div className="text-center py-12">
                                        <p className="text-gray-500 text-lg">Khong co dat cho nao</p>
                                        <p className="text-gray-400 text-sm mt-2">
                                            {searchQuery || timeFilter !== "all" || activeTab !== 'pending'
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
                                        isLoading={fieldOwnerBookingsLoading}
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
                            {confirmState.action === 'accept' ? 'Xac nhan chap nhan' : 'Xac nhan hanh dong'}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {confirmState.action === 'accept'
                                ? 'Ban co chac chan muon chap nhan yeu cau dat cho nay khong?'
                                : 'Ban co chac chan muon thuc hien hanh dong nay khong? Hanh dong nay khong the hoan tac.'}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Huy</AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirmAction}>
                            {confirmState.action === 'accept' ? 'Chap nhan' : 'Xac nhan'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </FieldOwnerDashboardLayout>
    );
}
