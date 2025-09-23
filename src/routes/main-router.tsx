import { createBrowserRouter, Navigate } from "react-router-dom";
import {
  guestRoutes,
  userRoutes,
  coachRoutes,
  centerRoutes,
  fieldOwnerRoutes,
  chatRoutes,
} from "./routes-config";
import { UnauthorizedPage } from "./protected-routes-config";
import { RootLayout } from "../layouts/root-layout";
import { getDefaultRouteByRole, isRouteAllowedForRole } from "../utils/routing/routing-utils"; // Giữ nguyên

// Tạo router configuration chính
export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      // Guest routes (public)
      ...guestRoutes,

      // Protected routes
      ...userRoutes,
      ...coachRoutes,
      ...centerRoutes,
      ...fieldOwnerRoutes,
      ...chatRoutes,

      // Error routes
      {
        path: "unauthorized",
        element: <UnauthorizedPage />,
      },

      // Catch-all route để redirect về home
      {
        path: "*",
        element: <Navigate to="/" replace />,
      },
    ],
  },
]);

// Export lại các functions từ utils để maintain backward compatibility
export { getDefaultRouteByRole, isRouteAllowedForRole };

export default router;