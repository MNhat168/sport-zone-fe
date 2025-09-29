// Helper function để get default route theo role (an toàn với undefined)
export const getDefaultRouteByRole = (role: string | undefined): string => {
    switch (role) {
        case "user":
            return "/";
        case "coach":
            return "/";
        case "manager":
            return "/center";
        case "field_owner":
            return "/field_owner";
        default:
            return "/";
    }
};

// Helper function để get redirect path theo role (nhất quán, an toàn undefined)
export const getRoleBasedRedirectPath = (role: string | undefined): string => {
    return getDefaultRouteByRole(role); // Sử dụng chung để tránh duplicate
};

// Helper function để check if route is allowed for role
export const isRouteAllowedForRole = (path: string, role: string | undefined): boolean => {
    // Public routes (guest) - tất cả role đều có thể truy cập
    const publicPaths = [
        "/",
        "/landing",
        "/about",
        "/contact",
        "/services",
        "/coaches",
        "/auth",
        "/register",
        "/unauthorized",
        "/booking",
    ];

    // Kiểm tra nếu path thuộc public routes
    if (publicPaths.some(publicPath =>
        path === publicPath ||
        (publicPath !== "/" && path.startsWith(publicPath))
    )) {
        return true;
    }

    // Role-based paths - chỉ check cho private routes
    switch (role) {
        case "user":
            return path.startsWith("/user");
        case "coach":
            return path.startsWith("/coach");
        case "manager":
            return (
                path.startsWith("/center") ||
                path.startsWith("/coach") ||
                path.startsWith("/user")
            );
        case "field_owner":
            return path.startsWith("/field_owner");
        default:
            return false; // Nếu không có role thì chỉ được truy cập public routes
    }
};