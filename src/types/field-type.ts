export interface Field {
    id: string;
    name: string;
    sportType: string; // FOOTBALL, BASKETBALL, TENNIS, BADMINTON, VOLLEYBALL, FUTSAL
    description: string;
    location: string;
    images: string[];
    operatingHours: {
        start: string; // HH:mm format
        end: string; // HH:mm format
    };
    slotDuration: number; // in minutes (minimum 30)
    minSlots: number; // minimum slots per booking
    maxSlots: number; // maximum slots per booking
    priceRanges: PriceRange[];
    basePrice: number; // in VND
    isActive: boolean;
    maintenanceNote?: string;
    maintenanceUntil?: string; // ISO date string
    rating: number;
    totalReviews: number;
    owner: {
        id: string;
        businessName?: string;
        name?: string;
        contactInfo?: {
            phone?: string;
            email?: string;
        };
    };
    totalBookings?: number;
    createdAt?: string;
    updatedAt?: string;
}

export interface PriceRange {
    start: string; // HH:mm format
    end: string; // HH:mm format
    multiplier: number; // price multiplier for this time range
}

export interface Booking {
    id: string;
    startTime: string;
    endTime: string;
    status: string;
}

export interface CreateFieldPayload {
    name: string;
    sportType: string;
    description: string;
    location: string;
    images?: string[];
    operatingHours: {
        start: string;
        end: string;
    };
    slotDuration: number;
    minSlots: number;
    maxSlots: number;
    priceRanges: PriceRange[];
    basePrice: number;
}

export interface UpdateFieldPayload extends Partial<CreateFieldPayload> {
    isActive?: boolean;
    maintenanceNote?: string;
    maintenanceUntil?: string;
}

export interface FieldsResponse {
    success: boolean;
    data: Field[];
    pagination?: {
        page: number;
        limit: number;
        total: number;
    };
}

export interface FieldResponse {
    success: boolean;
    data: Field;
    message?: string;
}

export interface FieldAvailabilityResponse {
    success: boolean;
    data: FieldAvailabilityData[];
}

export interface FieldAvailabilityData {
    date: string; // YYYY-MM-DD
    isHoliday: boolean;
    slots: AvailabilitySlot[];
}

export interface AvailabilitySlot {
    startTime: string; // HH:mm
    endTime: string; // HH:mm
    available: boolean;
    price: number;
    priceBreakdown: string;
}

export interface GetFieldsParams {
    name?: string;
    location?: string;
    sportType?: string;
}

export interface CheckAvailabilityParams {
    id: string;
    startDate: string; // YYYY-MM-DD
    endDate: string; // YYYY-MM-DD
}

// Price Scheduling Interfaces
export interface SchedulePriceUpdatePayload {
    newPriceRanges: PriceRange[];
    newBasePrice: number;
    effectiveDate: string; // YYYY-MM-DD
    ownerId: string;
}

export interface ScheduledPriceUpdate {
    newPriceRanges: PriceRange[];
    newBasePrice: number;
    effectiveDate: string; // ISO date string
    applied: boolean;
    createdBy: string;
    createdAt: string; // ISO date string
}

export interface CancelScheduledPriceUpdatePayload {
    effectiveDate: string; // YYYY-MM-DD
}

export interface ErrorResponse {
    message: string;
    status: string;
    errors?: Array<{
        field: string;
        message: string;
    }>;
}