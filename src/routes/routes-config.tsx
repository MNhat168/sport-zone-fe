/* eslint-disable react-refresh/only-export-components */
import { type RouteObject} from "react-router-dom";
import ProtectedRoute, { UnauthorizedPage, UserRole } from "./protected-routes-config";

// ===== PAGE IMPORTS =====
// Auth & Landing Pages
import AuthenticationPage from "../pages/auth/authentication-page";
import LandingPage from "../pages/landing/landing-page";

// User Pages
import UserDashboardPage from "../pages/user-dashboard-page/user-dashboard-page";
import UserBookingHistoryPage from "../pages/user-dashboard-page/user-booking-history-page";
import UserInvoicesPage from "../pages/user-dashboard-page/user-invoices-page";
import UserChatPage from "../pages/user-dashboard-page/user-chat-page";
import UserWalletPage from "../pages/user-dashboard-page/user-wallet-page";
import UserProfileTab from "../pages/user-dashboard-page/user-profile/user-profile-tab";

// Coach Pages
import CoachDashboardPage from "../pages/coach-dashboard-page/coach-dashboard-page";
import BookingPage from "../pages/coach-booking-page/booking-page";
import CoachDetailPage from "../pages/coach-detail-page/coach-detail-page";

// Field Pages
import FieldBookingPage from "../pages/field-list-page/list-page";
import FieldBookingFlowPage from "../pages/field-booking-page/field-booking-page";
import FieldCreatePage from "../pages/field-create-page/field-create-page";

/**
 * Placeholder component for pages under development
 */
const Placeholder = ({ title }: { title: string }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center p-8 bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">{title}</h1>
      <p className="text-gray-600">Trang này đang được phát triển</p>
    </div>
  </div>
);

/**
 * ===== PUBLIC ROUTES =====
 * Routes accessible to all users (authenticated and non-authenticated)
 * These routes do not require any specific role or authentication
 */
export const publicRoutes: RouteObject[] = [
  // Core Public Pages
  { path: "/", element: <LandingPage /> },
  { path: "/auth", element: <AuthenticationPage /> },
  { path: "/unauthorized", element: <UnauthorizedPage /> },
  
  // Field Discovery & Booking (Public)
  { path: "/fields", element: <FieldBookingPage /> },
  { path: "/field-booking", element: <FieldBookingFlowPage /> },
  
  // Coach Discovery (Public)
  { path: "/coaches", element: <Placeholder title="Danh sách HLV" /> },
  { path: "/coach-detail", element: <CoachDetailPage /> },
  { path: "/coach/:id", element: <CoachDetailPage /> },
  
  // General Booking (Public)
  { path: "/booking", element: <BookingPage /> },
  
  // About & Contact (Public)
  { path: "/about", element: <Placeholder title="Về chúng tôi" /> },
  { path: "/contact", element: <Placeholder title="Liên hệ" /> },
  { path: "/services", element: <Placeholder title="Dịch vụ" /> },
];

/**
 * ===== GUEST ROUTES =====
 * Public routes accessible to all users + legacy redirects
 * Keeping separate export for backward compatibility with main-router.tsx
 */
export const guestRoutes: RouteObject[] = [
  ...publicRoutes,
];

/**
 * ===== USER ROUTES =====
 * Routes accessible only to authenticated users with "user" role
 */
export const userRoutes: RouteObject[] = [
  // User Dashboard & Profile
  {
    path: "/user/dashboard",
    element: (
      <ProtectedRoute allowedRoles={[UserRole.user]}>
        <UserDashboardPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/user/profile",
    element: (
      <ProtectedRoute allowedRoles={[UserRole.user]}>
        <UserProfileTab />
      </ProtectedRoute>
    ),
  },
  
  // User Booking Management
  {
    path: "/user/bookings",
    element: (
      <ProtectedRoute allowedRoles={[UserRole.user]}>
        <UserBookingHistoryPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/user/invoices",
    element: (
      <ProtectedRoute allowedRoles={[UserRole.user]}>
        <UserInvoicesPage />
      </ProtectedRoute>
    ),
  },
  
  // User Communication & Finance
  {
    path: "/user/chat",
    element: (
      <ProtectedRoute allowedRoles={[UserRole.user]}>
        <UserChatPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/user/wallet",
    element: (
      <ProtectedRoute allowedRoles={[UserRole.user]}>
        <UserWalletPage />
      </ProtectedRoute>
    ),
  },
  
  // Fallback User Area
  {
    path: "/user",
    element: (
      <ProtectedRoute allowedRoles={[UserRole.user]}>
        <Placeholder title="User Dashboard" />
      </ProtectedRoute>
    ),
  },
];

/**
 * ===== COACH ROUTES =====
 * Routes accessible only to authenticated users with "coach" role
 */
export const coachRoutes: RouteObject[] = [
  // Coach Dashboard & Management
  {
    path: "/coach/dashboard",
    element: (
      <ProtectedRoute allowedRoles={[UserRole.coach]}>
        <CoachDashboardPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/coach/profile",
    element: (
      <ProtectedRoute allowedRoles={[UserRole.coach]}>
        <Placeholder title="Coach Profile" />
      </ProtectedRoute>
    ),
  },
  
  // Coach Class & Booking Management
  {
    path: "/coach/classes",
    element: (
      <ProtectedRoute allowedRoles={[UserRole.coach]}>
        <Placeholder title="Quản lý lớp học" />
      </ProtectedRoute>
    ),
  },
  {
    path: "/coach/bookings",
    element: (
      <ProtectedRoute allowedRoles={[UserRole.coach]}>
        <BookingPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/coach/schedule",
    element: (
      <ProtectedRoute allowedRoles={[UserRole.coach]}>
        <Placeholder title="Lịch dạy" />
      </ProtectedRoute>
    ),
  },
  
  // Coach Students & Performance
  {
    path: "/coach/students",
    element: (
      <ProtectedRoute allowedRoles={[UserRole.coach]}>
        <Placeholder title="Học viên" />
      </ProtectedRoute>
    ),
  },
  {
    path: "/coach/earnings",
    element: (
      <ProtectedRoute allowedRoles={[UserRole.coach]}>
        <Placeholder title="Thu nhập" />
      </ProtectedRoute>
    ),
  },
  {
    path: "/coach/analytics",
    element: (
      <ProtectedRoute allowedRoles={[UserRole.coach]}>
        <Placeholder title="Thống kê hiệu suất" />
      </ProtectedRoute>
    ),
  },
  
  // Fallback Coach Area
  {
    path: "/coach",
    element: (
      <ProtectedRoute allowedRoles={[UserRole.coach]}>
        <Placeholder title="Coach Dashboard" />
      </ProtectedRoute>
    ),
  },
];

/**
 * ===== ADMIN/MANAGER ROUTES =====
 * Routes accessible only to authenticated users with "manager" role
 */
export const adminRoutes: RouteObject[] = [
  // Admin Dashboard & Management
  {
    path: "/admin/dashboard",
    element: (
      <ProtectedRoute allowedRoles={[UserRole.MANAGER]}>
        <Placeholder title="Admin Dashboard" />
      </ProtectedRoute>
    ),
  },
  
  // User Management
  {
    path: "/admin/users",
    element: (
      <ProtectedRoute allowedRoles={[UserRole.MANAGER]}>
        <Placeholder title="Quản lý người dùng" />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/coaches",
    element: (
      <ProtectedRoute allowedRoles={[UserRole.MANAGER]}>
        <Placeholder title="Quản lý HLV" />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/field-owners",
    element: (
      <ProtectedRoute allowedRoles={[UserRole.MANAGER]}>
        <Placeholder title="Quản lý chủ sân" />
      </ProtectedRoute>
    ),
  },
  
  // Content & System Management
  {
    path: "/admin/fields",
    element: (
      <ProtectedRoute allowedRoles={[UserRole.MANAGER]}>
        <Placeholder title="Quản lý sân bóng" />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/bookings",
    element: (
      <ProtectedRoute allowedRoles={[UserRole.MANAGER]}>
        <Placeholder title="Quản lý đặt sân" />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/analytics",
    element: (
      <ProtectedRoute allowedRoles={[UserRole.MANAGER]}>
        <Placeholder title="Thống kê hệ thống" />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/settings",
    element: (
      <ProtectedRoute allowedRoles={[UserRole.MANAGER]}>
        <Placeholder title="Cài đặt hệ thống" />
      </ProtectedRoute>
    ),
  },
  
  // Legacy Support
  {
    path: "/center",
    element: (
      <ProtectedRoute allowedRoles={[UserRole.MANAGER]}>
        <Placeholder title="Manager Center" />
      </ProtectedRoute>
    ),
  },
  
  // Fallback Admin Area
  {
    path: "/admin",
    element: (
      <ProtectedRoute allowedRoles={[UserRole.MANAGER]}>
        <Placeholder title="Admin Dashboard" />
      </ProtectedRoute>
    ),
  },
];

/**
 * ===== FIELD OWNER ROUTES =====
 * Routes accessible only to authenticated users with "field_owner" role
 */
export const fieldOwnerRoutes: RouteObject[] = [
  // Field Owner Dashboard & Profile
  {
    path: "/field-owner/dashboard",
    element: (
      <ProtectedRoute allowedRoles={[UserRole.FIELD_OWNER]}>
        <Placeholder title="Field Owner Dashboard" />
      </ProtectedRoute>
    ),
  },
  {
    path: "/field-owner/profile/:userId",
    element: (
      <ProtectedRoute allowedRoles={[UserRole.FIELD_OWNER]}>
        <Placeholder title="Field Owner Profile" />
      </ProtectedRoute>
    ),
  },
  
  // Field Management
  {
    path: "/field/create",
    element: (
      <ProtectedRoute allowedRoles={[UserRole.FIELD_OWNER]}>
        <FieldCreatePage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/field-owner/fields",
    element: (
      <ProtectedRoute allowedRoles={[UserRole.FIELD_OWNER]}>
        <Placeholder title="Quản lý sân" />
      </ProtectedRoute>
    ),
  },
  {
    path: "/field-owner/fields/:fieldId",
    element: (
      <ProtectedRoute allowedRoles={[UserRole.FIELD_OWNER]}>
        <Placeholder title="Chi tiết sân" />
      </ProtectedRoute>
    ),
  },
  {
    path: "/field-owner/locations",
    element: (
      <ProtectedRoute allowedRoles={[UserRole.FIELD_OWNER]}>
        <Placeholder title="Quản lý địa điểm" />
      </ProtectedRoute>
    ),
  },
  
  // Booking & Schedule Management
  {
    path: "/field-owner/bookings",
    element: (
      <ProtectedRoute allowedRoles={[UserRole.FIELD_OWNER]}>
        <Placeholder title="Quản lý đặt sân" />
      </ProtectedRoute>
    ),
  },
  {
    path: "/field-owner/schedule",
    element: (
      <ProtectedRoute allowedRoles={[UserRole.FIELD_OWNER]}>
        <Placeholder title="Lịch đặt sân" />
      </ProtectedRoute>
    ),
  },
  
  // Customer Management
  {
    path: "/field-owner/customers",
    element: (
      <ProtectedRoute allowedRoles={[UserRole.FIELD_OWNER]}>
        <Placeholder title="Quản lý khách hàng" />
      </ProtectedRoute>
    ),
  },
  
  // Analytics & Financial Management
  {
    path: "/field-owner/analytics",
    element: (
      <ProtectedRoute allowedRoles={[UserRole.FIELD_OWNER]}>
        <Placeholder title="Thống kê & Báo cáo" />
      </ProtectedRoute>
    ),
  },
  {
    path: "/field-owner/revenue",
    element: (
      <ProtectedRoute allowedRoles={[UserRole.FIELD_OWNER]}>
        <Placeholder title="Quản lý doanh thu" />
      </ProtectedRoute>
    ),
  },
  {
    path: "/field-owner/financial-reports",
    element: (
      <ProtectedRoute allowedRoles={[UserRole.FIELD_OWNER]}>
        <Placeholder title="Báo cáo tài chính" />
      </ProtectedRoute>
    ),
  },
  
  // Settings & Configuration
  {
    path: "/field-owner/settings",
    element: (
      <ProtectedRoute allowedRoles={[UserRole.FIELD_OWNER]}>
        <Placeholder title="Cài đặt" />
      </ProtectedRoute>
    ),
  },
  
  // Fallback Field Owner Area
  {
    path: "/field-owner",
    element: (
      <ProtectedRoute allowedRoles={[UserRole.FIELD_OWNER]}>
        <Placeholder title="Field Owner Dashboard" />
      </ProtectedRoute>
    ),
  },
];

/**
 * ===== CHAT ROUTES =====
 * Routes for chat functionality (available to all authenticated users)
 */
export const chatRoutes: RouteObject[] = [
  // TODO: Implement chat routes when chat feature is ready
];

/**
 * ===== LEGACY SUPPORT =====
 * Keep centerRoutes for backward compatibility with existing code
 */
export const centerRoutes: RouteObject[] = adminRoutes;

/**
 * ===== UTILITY FUNCTIONS =====
 * Helper functions to extract route information
 */

/**
 * Extract public route paths from publicRoutes array
 * Used by AuthWrapper to determine which routes don't need authentication
 */
export const getPublicRoutePaths = (): string[] => {
  return publicRoutes.map(route => route.path).filter((path): path is string => path !== undefined);
};

/**
 * Check if a given path is a public route
 * @param pathname - The current pathname to check
 * @returns boolean indicating if the path is public
 */
export const isPublicRoute = (pathname: string): boolean => {
  const publicPaths = getPublicRoutePaths();
  
  return publicPaths.some(route =>
    pathname === route ||
    (route !== '/' && pathname.startsWith(route))
  );
};

/**
 * ===== ROUTE SUMMARY =====
 * 
 * 📋 ROUTE STRUCTURE:
 * 
 * PUBLIC ROUTES (No Auth Required):
 * • / - Landing page
 * • /auth - Authentication  
 * • /fields, /field-booking - Field discovery & booking
 * • /coaches, /coach-detail, /coach/:id - Coach discovery
 * • /about, /contact, /services - Static pages
 * 
 * PROTECTED ROUTES (Auth + Role Required):
 * • /user/* - User role routes (dashboard, profile, bookings, etc.)
 * • /coach/* - Coach role routes (classes, schedule, earnings, etc.)  
 * • /field-owner/* - Field owner routes (fields, revenue, analytics, etc.)
 * • /admin/* - Manager/Admin routes (user mgmt, system settings, etc.)
 * 
 * LEGACY REDIRECTS (Backward Compatibility):
 * • /user-dashboard → /user/dashboard
 * • /coach-dashboard → /coach/dashboard
 * • /user-* → /user/*
 * 
 * 🔐 PROTECTION LEVELS:
 * 1. Public: Accessible to everyone
 * 2. Protected: Requires authentication + specific role
 * 3. Legacy: Auto-redirects to new protected routes
 * 
 * 🎯 NAVIGATION FLOW:
 * 1. Login → Redirect to "/" (landing page)
 * 2. From landing → Navigate to role-specific dashboard via dropdown/navbar
 * 3. Role-based permissions enforce access control
 */