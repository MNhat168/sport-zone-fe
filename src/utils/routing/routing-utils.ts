// Helper function để get default route theo role
export const getDefaultRouteByRole = (role: string): string => {
    switch (role) {
        case "user":
            return "/user";
        case "coach":
            return "/coach";
        case "manager":
            return "/center";
        case "field_owner":
            return "/field_owner";
        default:
            return "/";
    }
};

// Helper function để check if route is allowed for role
export const isRouteAllowedForRole = (path: string, role: string): boolean => {
    // Public routes (guest)
    const publicPaths = [
        "/",
        "/unauthorized",
    ];
    if (
        publicPaths.some(
            (publicPath) => path === publicPath || path.startsWith(publicPath)
        )
    ) {
        return true;
    }

    // Role-based paths
    switch (role) {
        case "user":
            return path.startsWith("/user") || publicPaths.includes(path);
        case "coach":
            return path.startsWith("/coach") || publicPaths.includes(path);
        case "manager":
            return (
                path.startsWith("/center") ||
                path.startsWith("/coach") ||
                path.startsWith("/user") ||
                publicPaths.includes(path)
            );
        case "field_owner":
            return path.startsWith("/field_owner") || publicPaths.includes(path);
        default:
            return publicPaths.includes(path);
    }
};