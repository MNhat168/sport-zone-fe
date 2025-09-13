/* eslint-disable react-refresh/only-export-components */
import { type RouteObject } from "react-router-dom";
import ProtectedRoute, { UnauthorizedPage, UserRole, AuthenticatedRedirect } from "./protected-routes-config";

import AuthenticationPage from "../pages/auth/authentication-page";
import LandingPage from "../pages/landing/landing-page";
// Minimal placeholder component
const Placeholder = ({ title }: { title: string }) => <div style={{ padding: 24 }}>{title}</div>;

export const guestRoutes: RouteObject[] = [
  {
    path: "/",
    element: (
      <AuthenticatedRedirect>
        <Placeholder title="Guest Home" />
      </AuthenticatedRedirect>
    ),
  },
  { path: "/unauthorized", element: <UnauthorizedPage /> },
  { path: "/auth", element: <AuthenticationPage /> },
  { path: "/landing-page", element: <LandingPage /> },
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
