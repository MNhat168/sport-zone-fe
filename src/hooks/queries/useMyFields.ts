import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import axiosPrivate from "@/utils/axios/axiosPrivate";
import { GET_MY_FIELDS_API } from "@/features/field/fieldAPI";
import type { GetMyFieldsParams, FieldsResponse } from "@/types/field-type";

const fetchMyFields = async (params: GetMyFieldsParams = {}): Promise<FieldsResponse> => {
    const queryParams = new URLSearchParams();
    if (params.name) queryParams.append("name", params.name);
    if (params.sportType) queryParams.append("sportType", params.sportType);
    if (params.isActive !== undefined) queryParams.append("isActive", params.isActive.toString());
    if (params.page) queryParams.append("page", params.page.toString());
    if (params.limit) queryParams.append("limit", params.limit.toString());

    const url = queryParams.toString() ? `${GET_MY_FIELDS_API}?${queryParams}` : GET_MY_FIELDS_API;
    const response = await axiosPrivate.get(url);

    const raw = response.data;
    const apiList = raw?.data?.fields || (Array.isArray(raw?.data) ? raw.data : Array.isArray(raw) ? raw : []);

    return {
        success: true,
        data: apiList,
        pagination: raw?.data?.pagination || raw?.pagination || null,
    } as unknown as FieldsResponse;
};

export function useMyFields(
    params: GetMyFieldsParams,
    options?: Partial<UseQueryOptions<FieldsResponse, Error, FieldsResponse, any>>
) {
    return useQuery<FieldsResponse, Error>({
        queryKey: ["myFields", params],
        queryFn: () => fetchMyFields(params),
        staleTime: 60 * 1000,
        notifyOnChangeProps: ["data", "error"],
        placeholderData: (previousData) => previousData,
        ...options,
    });
}

