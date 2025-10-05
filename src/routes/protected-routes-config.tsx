import React from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { User } from "../types/user-type";
// Removed routing-utils dependency

/**
 * ===== USER ROLE DEFINITIONS =====
 * Centralized role type definitions for type safety
 */
export type UserRole = "guest" | "user" | "coach" | "manager" | "field_owner";

/**
 * UserRole enum for consistent role checking
 */
export const UserRole = {
  guest: "guest" as UserRole,
  user: "user" as UserRole,
  coach: "coach" as UserRole,
  MANAGER: "manager" as UserRole,
  FIELD_OWNER: "field_owner" as UserRole,
} as const;

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

// Import useAuth from auth-wrapper to avoid duplication
import { useAuth } from './auth-wrapper';

// Simple role checking utility
const hasUserRole = (user: User | null, role: UserRole): boolean => {
  return (user?.role as UserRole | undefined) === role;
};

const ProtectedRoute = ({
  children,
  allowedRoles,
}: ProtectedRouteProps) => {
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const hasAllowedRole = allowedRoles.some((role) => hasUserRole(user, role));
    if (!hasAllowedRole) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <>{children}</>;
};

/**
 * ===== UNAUTHORIZED ACCESS PAGE =====
 * Displayed when user tries to access routes they don't have permission for
 */
export const UnauthorizedPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6 text-center">
        <div className="text-red-500 text-6xl mb-4">🚫</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Không có quyền truy cập
        </h1>
        <p className="text-gray-600 mb-6">
          Bạn không có quyền truy cập vào trang này. Vui lòng liên hệ quản trị
          viên nếu bạn cho rằng đây là lỗi.
        </p>
        <div className="space-y-3">
          <button
            onClick={() => navigate("/")}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            Về trang chủ
          </button>
          <button
            onClick={() => navigate(-1)}
            className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
          >
            Quay lại trang trước
          </button>
        </div>
      </div>
    </div>
  );
};

// Component để render children - Cho phép tất cả roles xem landing page
export const AuthenticatedRedirect = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const loading = useSelector((state: any) => state.auth.loading) as boolean;
  
  // Đợi auth loading complete trước khi render
  if (loading) {
    console.log("⏳ Auth loading, showing spinner...");
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Giải pháp 1: Tất cả roles đều có thể xem landing page - không redirect
  console.log("✅ AuthenticatedRedirect - Rendering landing page for all roles");
  return <>{children}</>;
};

// All redirect and debug logic has been simplified and moved to AuthWrapper component

export default ProtectedRoute;