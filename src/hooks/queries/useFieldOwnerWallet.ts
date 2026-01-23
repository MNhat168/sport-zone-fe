import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import axiosPrivate from "@/utils/axios/axiosPrivate";
import { GET_FIELD_OWNER_WALLET_API } from "@/features/wallet/walletAPI";
import type { FieldOwnerWalletResponse } from "@/types/wallet-type";

const fetchFieldOwnerWallet = async (userId: string): Promise<FieldOwnerWalletResponse> => {
    const response = await axiosPrivate.get(GET_FIELD_OWNER_WALLET_API(userId));
    return response.data?.data ?? response.data;
};

export function useFieldOwnerWallet(
    userId: string | undefined,
    options?: Partial<UseQueryOptions<FieldOwnerWalletResponse | null, string, FieldOwnerWalletResponse | null, any>>
) {
    return useQuery<FieldOwnerWalletResponse | null, string>({
        queryKey: ["fieldOwnerWallet", userId],
        queryFn: async () => {
            if (!userId) return null;
            return await fetchFieldOwnerWallet(userId);
        },
        enabled: !!userId,
        staleTime: 30 * 1000,
        notifyOnChangeProps: ["data", "error"],
        placeholderData: (previousData) => previousData,
        ...options,
    });
}

