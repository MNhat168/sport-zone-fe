export interface Field {
    id: string;
    name: string;
    description: string;
    location: string;
    type: string;
    pricePerHour: number;
    availability: boolean;
    images: string[];
    facilities?: string[];
    owner: {
        id: string;
        name: string;
        contact?: string;
    };
    bookings?: Booking[];
    totalBookings?: number;
    createdAt?: string;
    updatedAt?: string;
}

export interface Booking {
    id: string;
    startTime: string;
    endTime: string;
    status: string;
}

export interface CreateFieldPayload {
    name: string;
    description: string;
    location: string;
    type: string;
    pricePerHour: number;
    facilities?: string[];
    images?: string[];
}

export interface UpdateFieldPayload extends Partial<CreateFieldPayload> {
    availability?: boolean;
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
    data: {
        available: boolean;
        conflictingBookings: Booking[];
    };
}

export interface GetFieldsParams {
    page?: number;
    limit?: number;
    location?: string;
    type?: string;
}

export interface CheckAvailabilityParams {
    id: string;
    date: string; // YYYY-MM-DD
    startTime: string; // HH:MM
    endTime: string; // HH:MM
}

export interface ErrorResponse {
    message: string;
    status: string;
    errors?: Array<{
        field: string;
        message: string;
    }>;
}