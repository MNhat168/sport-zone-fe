// Booking types based on API documentation
import type { UserProfile } from "@/types/user-type"
import type { Field } from "@/types/field-type"
import type { Payment } from "@/types/payment-type"

export interface CreateFieldBookingPayload {
    fieldId: string;
    date: string; // YYYY-MM-DD
    startTime: string; // HH:mm
    endTime: string; // HH:mm
    selectedAmenities?: string[];
    paymentMethod?: number; // PaymentMethod enum (1-9)
    paymentNote?: string;
}

export interface CreateSessionBookingPayload {
    fieldId: string;
    coachId: string;
    date: string; // YYYY-MM-DD
    fieldStartTime: string; // HH:mm
    fieldEndTime: string; // HH:mm
    coachStartTime: string; // HH:mm
    coachEndTime: string; // HH:mm
    selectedAmenities?: string[];
}

export interface CancelBookingPayload {
    cancellationReason?: string;
}

export interface CancelSessionBookingPayload {
    fieldBookingId: string;
    coachBookingId: string;
    cancellationReason?: string;
}

export interface SetCoachHolidayPayload {
    coachId: string;
    startDate: string; // YYYY-MM-DD
    endDate: string; // YYYY-MM-DD
}

export type CoachStatus = "pending" | "declined" | "accepted" | "cancelled";

export interface Booking {
    _id: string;
    user: string | UserProfile;
    field?: Field; // field id for FIELD bookings
    requestedCoach?: string; // coach id for COACH bookings
    date: string; // YYYY-MM-DD
    startTime: string; // HH:mm
    endTime: string; // HH:mm
    numSlots?: number;
    type: 'field' | 'coach';
    coachStatus?: CoachStatus;
    status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
    totalPrice: number;
    selectedAmenities?: string[];
    amenitiesFee?: number;
    payment?: string | Payment; // Payment ObjectId reference or populated Payment
    pricingSnapshot?: {
        basePrice: number;
        appliedMultiplier?: number;
        priceBreakdown?: string;
    };
    cancellationReason?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface SessionBookingResponse {
    fieldBooking: Booking;
    coachBooking: Booking;
}

export interface CoachScheduleSlot {
    time: string; // "09:00"
    available: boolean;
}

export interface CoachSchedule {
    date: string; // "2025-09-29T00:00:00.000Z"
    isHoliday: boolean;
    slots: CoachScheduleSlot[];
}

export interface GetCoachScheduleParams {
    coachId: string;
    startDate: string; // YYYY-MM-DD
    endDate: string; // YYYY-MM-DD
}

export interface GetMyBookingsParams {
    status?: 'pending' | 'confirmed' | 'cancelled' | 'completed';
    type?: 'field' | 'coach';
    page?: number;
    limit?: number;
}

export interface PaginationInfo {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}

export interface MyBookingsResponse {
    bookings: Booking[];
    pagination: PaginationInfo;
}

export interface BookingState {
    bookings: Booking[];
    currentBooking: Booking | null;
    sessionBooking: SessionBookingResponse | null;
    coachSchedules: CoachSchedule[];
    pagination: PaginationInfo | null;
    loading: boolean;
    error: ErrorResponse | null;
}

export interface ErrorResponse {
    message: string;
    status: string;
}