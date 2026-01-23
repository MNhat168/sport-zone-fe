import { useQuery, type UseQueryOptions } from "@tanstack/react-query";

interface PendingPaymentProofBooking {
    _id: string;
    id?: string;
    user: {
        fullName: string;
        email: string;
        phone?: string;
    };
    field: {
        name: string;
    };
    date: string;
    startTime: string;
    endTime: string;
    bookingAmount: number;
    platformFee: number;
    totalPrice?: number;
    transaction?: {
        _id: string;
        paymentProofImageUrl: string;
        paymentProofStatus: "pending" | "approved" | "rejected";
        amount: number;
    };
    paymentStatus: string;
    status: string;
    createdAt: string;
}

const fetchPendingPaymentProofs = async (): Promise<PendingPaymentProofBooking[]> => {
    const token = localStorage.getItem("token");
    if (!token) {
        throw new Error("Chưa đăng nhập");
    }

    const response = await fetch(`${import.meta.env.VITE_API_URL}/bookings/pending-payment-proofs`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error("Không thể tải danh sách bookings");
    }

    const data = await response.json();
    return data || [];
};

export function usePendingPaymentProofs(
    options?: Partial<
        UseQueryOptions<PendingPaymentProofBooking[], Error, PendingPaymentProofBooking[], any>
    >
) {
    return useQuery<PendingPaymentProofBooking[], Error>({
        queryKey: ["pendingPaymentProofs"],
        queryFn: fetchPendingPaymentProofs,
        refetchInterval: 30000,
        refetchIntervalInBackground: false,
        notifyOnChangeProps: ["data", "error"],
        placeholderData: (previousData) => previousData,
        ...options,
    });
}

