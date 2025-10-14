
// Sport types
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

export type SportTypeValue = typeof SportType[keyof typeof SportType];

// Amenity types
export const AmenityType = {
  COACH: 'coach',
  DRINK: 'drink',
  FACILITY: 'facility',
  OTHER: 'other'
} as const;

export type AmenityTypeValue = typeof AmenityType[keyof typeof AmenityType];

export interface Amenity {
  _id: string;
  name: string;
  description?: string;
  sportType: SportTypeValue;
  isActive: boolean;
  imageUrl?: string;
  type: AmenityTypeValue;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAmenityRequest {
  name: string;
  description?: string;
  sportType: SportTypeValue;
  isActive?: boolean;
  imageUrl?: string;
  type: AmenityTypeValue;
  image?: File;
}

export interface UpdateAmenityRequest {
  name?: string;
  description?: string;
  sportType?: SportTypeValue;
  isActive?: boolean;
  imageUrl?: string;
  type?: AmenityTypeValue;
  image?: File;
}

export interface AmenitiesQueryParams {
  page?: number;
  limit?: number;
  sportType?: SportTypeValue;
  type?: AmenityTypeValue;
  search?: string;
  isActive?: boolean;
}

export interface AmenitiesResponse {
  data: Amenity[];
  total: number;
  page: number;
  limit: number;
}

export interface ErrorResponse {
  statusCode: number;
  message: string | string[];
  error: string;
}
