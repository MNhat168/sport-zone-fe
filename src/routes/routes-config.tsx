/* eslint-disable react-refresh/only-export-components */
import { type RouteObject } from "react-router-dom";
import ProtectedRoute, { UnauthorizedPage, UserRole, AuthenticatedRedirect } from "./protected-routes-config";

import AuthenticationPage from "../pages/auth/authentication-page";
import LandingPage from "../pages/landing/landing-page";
import UserDashboardPage from "../pages/user-dashboard-page/user-dashboard-page";
import UserBookingHistoryPage from "../pages/user-dashboard-page/user-booking-history-page";
import UserInvoicesPage from "../pages/user-dashboard-page/user-invoices-page";
import UserChatPage from "../pages/user-dashboard-page/user-chat-page";
import UserWalletPage from "../pages/user-dashboard-page/user-wallet-page";
import UserProfileTab from "../pages/user-dashboard-page/user-profile/user-profile-tab";
import CoachDashboardPage from "../pages/coach-dashboard-page/coach-dashboard-page";
import BookingPage from "../pages/coach-booking-page/booking-page";
import CoachDetailPage from "../pages/coach-detail-page/coach-detail-page";
// Minimal placeholder component
const Placeholder = ({ title }: { title: string }) => <div style={{ padding: 24 }}>{title}</div>;

export const guestRoutes: RouteObject[] = [
  {
    path: "/",
    element: (
      <AuthenticatedRedirect>
        <LandingPage />
      </AuthenticatedRedirect>
    ),
  },
  { path: "/unauthorized", element: <UnauthorizedPage /> },
  { path: "/auth", element: <AuthenticationPage /> },
  { path: "/landing-page", element: <LandingPage /> },
  { path: "/user-dashboard", element: <UserDashboardPage /> },
  { path: "/user-booking-history", element: <UserBookingHistoryPage /> },
  { path: "/user-invoices", element: <UserInvoicesPage /> },
  { path: "/user-chat", element: <UserChatPage /> },
  { path: "/user-wallet", element: <UserWalletPage /> },
  { path: "/user-profile", element: <UserProfileTab /> },
  { path: "/coach-dashboard", element: <CoachDashboardPage /> },
  { path: "/booking", element: <BookingPage /> },
  { path: "/coach-detail", element: <CoachDetailPage /> },
];

export const chatRoutes: RouteObject[] = [];

export const userRoutes: RouteObject[] = [
  {
    path: "/user",
    element: (
      <ProtectedRoute allowedRoles={[UserRole.user]}>
        <Placeholder title="User Area" />
      </ProtectedRoute>
    ),
  },
];

export const coachRoutes: RouteObject[] = [
  {
    path: "/coach",
    element: (
      <ProtectedRoute allowedRoles={[UserRole.coach]}>
        <Placeholder title="Coach Area" />
      </ProtectedRoute>
    ),
  },
];

export const centerRoutes: RouteObject[] = [
  {
    path: "/center",
    element: (
      <ProtectedRoute allowedRoles={[UserRole.MANAGER]}>
        <Placeholder title="Manager Center" />
      </ProtectedRoute>
    ),
  },
];

export const fieldOwnerRoutes: RouteObject[] = [
  {
    path: "/field_owner",
    element: (
      <ProtectedRoute allowedRoles={[UserRole.FIELD_OWNER]}>
        <Placeholder title="Field Owner Area" />
      </ProtectedRoute>
    ),
  },
];