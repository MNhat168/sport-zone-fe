// Booking types based on API documentation

export interface CreateFieldBookingPayload {
    scheduleId: string;
    slot: string;
    totalPrice: number;
}

export interface CreateSessionBookingPayload {
    fieldScheduleId: string;
    coachScheduleId: string;
    fieldSlot: string;
    coachSlot: string;
    fieldPrice: number;
    coachPrice: number;
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

export interface Booking {
    _id: string;
    user: string;
    schedule: string;
    slot: string;
    type: 'FIELD' | 'COACH';
    status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
    totalPrice: number;
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

export interface BookingState {
    bookings: Booking[];
    currentBooking: Booking | null;
    sessionBooking: SessionBookingResponse | null;
    coachSchedules: CoachSchedule[];
    loading: boolean;
    error: ErrorResponse | null;
}

export interface ErrorResponse {
    message: string;
    status: string;
}