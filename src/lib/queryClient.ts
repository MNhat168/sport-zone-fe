import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 30 * 1000, // Data is fresh for 30 seconds
            gcTime: 5 * 60 * 1000, // 5 minutes garbage collection time
            refetchOnWindowFocus: false, // Don't refetch when window regains focus
            refetchOnMount: 'always', // Always refetch when component mounts
            retry: 1, // Retry failed requests once
            refetchOnReconnect: true, // Refetch when reconnecting to internet
        },
        mutations: {
            retry: 1, // Retry failed mutations once
        },
    },
});
