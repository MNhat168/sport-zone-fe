export interface Booking {
    id: string;
    name: string;
    court: string;
    guests: number;
    hours: string;
    date: string;
    time: string;
    price: string;
    color: string;
    type: 'court' | 'coaching';
}

export interface Coach {
    id: string;
    name: string;
    sport: string;
    rating: number;
    experience: string;
    price: string;
    date: string;
    time: string;
    duration: string;
    color: string;
    avatar: string;
    status: 'upcoming' | 'completed' | 'cancelled';
}

export const mockBookings: Booking[] = [
    {
        id: "1",
        name: "Leap Sports Academy",
        court: "Court 1",
        guests: 4,
        hours: "2 Hrs",
        date: "Mon, Jul 11",
        time: "06:00 PM - 08:00 PM",
        price: "$400",
        color: "from-gray-700 to-gray-800",
        type: "court"
    },
    {
        id: "2",
        name: "Wing Sports Academy",
        court: "Court 2",
        guests: 3,
        hours: "1 Hr",
        date: "Tue, Jul 12",
        time: "07:00 PM - 08:00 PM",
        price: "$240",
        color: "from-red-500 to-red-600",
        type: "court"
    },
    {
        id: "3",
        name: "Feather Badminton",
        court: "Court 1",
        guests: 1,
        hours: "4 Hrs",
        date: "Wed, Jul 13",
        time: "10:00 PM - 11:00 PM",
        price: "$320",
        color: "from-teal-500 to-teal-600",
        type: "court"
    },
    {
        id: "4",
        name: "Bwing Sports Academy",
        court: "Court 3",
        guests: 5,
        hours: "6 Hrs",
        date: "Thu, Jul 14",
        time: "09:00 AM - 10:00 AM",
        price: "$710",
        color: "from-green-500 to-green-600",
        type: "court"
    },
    {
        id: "5",
        name: "Marsh Academy",
        court: "Court 2",
        guests: 3,
        hours: "2 Hrs",
        date: "Fri, Jul 15",
        time: "11:00 AM - 12:00 PM",
        price: "$820",
        color: "from-emerald-500 to-emerald-600",
        type: "court"
    }
];

export const mockCoachingSessions: Coach[] = [
    {
        id: "c1",
        name: "Kevin Anderson",
        sport: "Badminton",
        rating: 4.9,
        experience: "5 years",
        price: "$400",
        date: "Mon, Jul 11",
        time: "06:00 PM - 08:00 PM",
        duration: "2 Hours",
        color: "from-blue-500 to-blue-600",
        avatar: "KA",
        status: "upcoming"
    },
    {
        id: "c2",
        name: "Sarah Johnson",
        sport: "Tennis",
        rating: 4.8,
        experience: "7 years",
        price: "$350",
        date: "Tue, Jul 12",
        time: "10:00 AM - 12:00 PM",
        duration: "2 Hours",
        color: "from-purple-500 to-purple-600",
        avatar: "SJ",
        status: "upcoming"
    },
    {
        id: "c3",
        name: "David Park",
        sport: "Badminton",
        rating: 4.7,
        experience: "3 years",
        price: "$280",
        date: "Wed, Jul 13",
        time: "04:00 PM - 06:00 PM",
        duration: "2 Hours",
        color: "from-orange-500 to-orange-600",
        avatar: "DP",
        status: "completed"
    }
];

export const mockFavorites = [
    { name: "Wing Sports Academy", bookings: "10 Bookings", color: "from-red-500 to-red-600" },
    { name: "Feather Badminton", bookings: "20 Bookings", color: "from-teal-500 to-teal-600" },
    { name: "Bwing Sports Academy", bookings: "30 Bookings", color: "from-green-500 to-green-600" },
];

export const mockInvoices = [
    {
        id: "inv1",
        name: "Leap Sports Academy",
        court: "Court 1",
        date: "Mon, Jul 11",
        time: "06:00 PM - 08:00 PM",
        payment: "$800",
        paidOn: "Jul 11, 2023",
        color: "from-gray-700 to-gray-800",
    },
    {
        id: "inv2",
        name: "Wing Sports Academy",
        court: "Court 2",
        date: "Tue, Jul 12",
        time: "05:00 PM - 06:00 PM",
        payment: "$120",
        paidOn: "Jul 12, 2023",
        color: "from-red-500 to-red-600",
    },
    {
        id: "inv3",
        name: "Feather Badminton",
        court: "Court 3",
        date: "Wed, Jul 13",
        time: "10:00 AM - 11:00 AM",
        payment: "$470",
        paidOn: "Jul 13, 2023",
        color: "from-teal-500 to-teal-600",
    },
    {
        id: "inv4",
        name: "Bwing Sports Academy",
        court: "Court 4",
        date: "Thu, Jul 14",
        time: "12:00 PM - 01:00 PM",
        payment: "$200",
        paidOn: "Jul 14, 2023",
        color: "from-green-500 to-green-600",
    },
    {
        id: "inv5",
        name: "Marsh Academy",
        court: "Court 5",
        date: "Fri, Jul 15",
        time: "08:00 AM - 09:00 AM",
        payment: "$150",
        paidOn: "Jul 15, 2023",
        color: "from-emerald-500 to-emerald-600",
    },
];
