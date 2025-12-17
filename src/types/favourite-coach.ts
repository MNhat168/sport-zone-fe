export interface FavouriteCoach {
    id: string;
    name: string;
    avatar?: string | null;
    totalBookings: number;
}

export interface FavouriteCoachesResponse {
    success?: boolean;
    data: FavouriteCoach[];
}
