import { createBrowserRouter, Navigate } from "react-router-dom";
import {
  guestRoutes, // Includes publicRoutes + legacy routes
  userRoutes,
  coachRoutes,
  adminRoutes,
  fieldOwnerRoutes,
  chatRoutes,
} from "./routes-config";
import { UnauthorizedPage } from "./protected-routes-config";
import { RootLayout } from "../layouts/root-layout";

/**
 * ===== MAIN ROUTER CONFIGURATION =====
 * Central router configuration using React Router v6
 * Combines all role-based routes in a structured manner
 */
export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      // Public & Guest routes (accessible to all)
      ...guestRoutes,

      // Role-specific protected routes
      ...userRoutes,
      ...coachRoutes,
      ...adminRoutes,
      ...fieldOwnerRoutes,
      ...chatRoutes,

      // Error handling routes
      {
        path: "unauthorized",
        element: <UnauthorizedPage />,
      },

      // Catch-all route - redirect to home
      {
        path: "*",
        element: <Navigate to="/" replace />,
      },
    ],
  },
]);

export default router;