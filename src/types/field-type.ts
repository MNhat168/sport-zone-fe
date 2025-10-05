// Sport Type constants matching API documentation
export const SportType = {
    FOOTBALL: 'football',
    TENNIS: 'tennis',
    BADMINTON: 'badminton',
    PICKLEBALL: 'pickleball',
    BASKETBALL: 'basketball',
    VOLLEYBALL: 'volleyball',
    SWIMMING: 'swimming',
    GYM: 'gym'
} as const;


export type SportType = typeof SportType[keyof typeof SportType];

// Owner interface matching API response structure
export interface FieldOwner {
    id: string;
    businessName?: string;
    name?: string;
    contact?: string; // For backward compatibility
    contactInfo?: {
        phone?: string;
        email?: string;
    };
}

// Main Field interface
export interface Field {
    id: string;
    name: string;
    sportType: SportType | string; // Support both enum and string for flexibility
    description: string;
    location: string;
    images: string[];
    operatingHours: OperatingHours[];
    slotDuration: number; // in minutes (minimum 30, maximum 180)
    minSlots: number; // minimum slots per booking
    maxSlots: number; // maximum slots per booking
    priceRanges: PriceRange[];
    basePrice: number; // in VND
    isActive: boolean;
    maintenanceNote?: string;
    maintenanceUntil?: string; // ISO date string
    rating: number;
    totalReviews: number;
    owner: FieldOwner;
    totalBookings?: number;
    createdAt?: string;
    updatedAt?: string;
}

// Operating Hours interface - now supports day-specific schedules
export interface OperatingHours {
    day: string; // monday, tuesday, wednesday, etc.
    start: string; // HH:mm format (24-hour)
    end: string; // HH:mm format (24-hour)
    duration: number; // slot duration in minutes
}

// Price Range interface for time-based pricing with day support
export interface PriceRange {
    day: string; // monday, tuesday, wednesday, etc.
    start: string; // HH:mm format (24-hour)
    end: string; // HH:mm format (24-hour)
    multiplier: number; // price multiplier for this time range (e.g., 1.0, 1.5, 2.0)
}

export interface Booking {
    id: string;
    startTime: string;
    endTime: string;
    status: string;
}

// Create Field Payload interface
export interface CreateFieldPayload {
    name: string;
    sportType: SportType | string;
    description: string;
    location: string;
    images?: string[];
    operatingHours: OperatingHours[];
    slotDuration: number; // 30-180 minutes
    minSlots: number; // minimum 1
    maxSlots: number; // maximum 10
    priceRanges: PriceRange[];
    basePrice: number | string; // in VND, can be string for form input
}

// Update Field Payload interface
export interface UpdateFieldPayload extends Partial<CreateFieldPayload> {
    isActive?: boolean;
    maintenanceNote?: string;
    maintenanceUntil?: string; // ISO date string
}

// API Response interfaces
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

// Pagination interface
export interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages?: number;
}

// Field Availability interfaces (Pure Lazy Creation)
export interface FieldAvailabilityResponse {
    success: boolean;
    data: FieldAvailabilityData[];
}

export interface FieldAvailabilityData {
    date: string; // YYYY-MM-DD format
    isHoliday: boolean;
    slots: AvailabilitySlot[];
}

export interface AvailabilitySlot {
    startTime: string; // HH:mm format (24-hour)
    endTime: string; // HH:mm format (24-hour)
    available: boolean;
    price: number; // in VND
    priceBreakdown: string; // e.g., "09:00-10:00: 1.0x base price"
}

// Query parameter interfaces
export interface GetFieldsParams {
    name?: string;
    location?: string;
    sportType?: SportType | string;
    page?: number;
    limit?: number;
    sortBy?: 'name' | 'rating' | 'price' | 'createdAt';
    sortOrder?: 'asc' | 'desc';
}

export interface CheckAvailabilityParams {
    id: string;
    startDate: string; // YYYY-MM-DD format
    endDate: string; // YYYY-MM-DD format
}

// Price Scheduling Interfaces
export interface SchedulePriceUpdatePayload {
    newPriceRanges: PriceRange[];
    newBasePrice: number; // in VND
    effectiveDate: string; // ISO date string (YYYY-MM-DDTHH:mm:ss.sssZ)
}

export interface ScheduledPriceUpdate {
    newPriceRanges: PriceRange[];
    newBasePrice: number; // in VND
    effectiveDate: string; // ISO date string
    applied: boolean;
    createdBy: string;
    createdAt: string; // ISO date string
}

export interface CancelScheduledPriceUpdatePayload {
    effectiveDate: string; // YYYY-MM-DD format
}

// Price scheduling response interfaces
export interface SchedulePriceUpdateResponse {
    success: boolean;
    message: string;
    effectiveDate: string;
    updateId?: string;
}

export interface CancelScheduledPriceUpdateResponse {
    success: boolean;
    message: string;
}

export interface GetScheduledPriceUpdatesResponse {
    success: boolean;
    data: ScheduledPriceUpdate[];
}

// Error handling interfaces
export interface ErrorResponse {
    message: string;
    status: string;
    errors?: ValidationError[];
}

export interface ValidationError {
    field: string;
    message: string;
    value?: any;
}

// HTTP Status codes for better error handling
export const HttpStatus = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500
} as const;

export type HttpStatus = typeof HttpStatus[keyof typeof HttpStatus];

// Field status constants
export const FieldStatus = {
    ACTIVE: "ACTIVE",
    INACTIVE: "INACTIVE",
    MAINTENANCE: "MAINTENANCE"
} as const;

export type FieldStatus = typeof FieldStatus[keyof typeof FieldStatus];

// Booking status constants
export const BookingStatus = {
    PENDING: "PENDING",
    CONFIRMED: "CONFIRMED",
    CANCELLED: "CANCELLED",
    COMPLETED: "COMPLETED"
} as const;

export type BookingStatus = typeof BookingStatus[keyof typeof BookingStatus];

// Utility types
export type FieldId = string;
export type OwnerId = string;
export type UserId = string;

// Form data interfaces for image uploads
export interface CreateFieldWithImagesPayload extends Omit<CreateFieldPayload, 'images'> {
    images: File[];
}

// Field statistics interface
export interface FieldStatistics {
    totalBookings: number;
    totalRevenue: number;
    averageRating: number;
    totalReviews: number;
    occupancyRate: number; // percentage
}