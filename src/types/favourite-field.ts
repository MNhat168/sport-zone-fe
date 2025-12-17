export interface FavouriteField {
    id: string;
    name: string;
    avatar?: string | null;
    totalBookings: number;
}

export interface FavouriteFieldsResponse {
    success?: boolean;
    data: FavouriteField[];
}
