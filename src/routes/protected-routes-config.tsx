/* eslint-disable react-refresh/only-export-components */
import React, { useEffect } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { User } from "../types/user-type";

// Định nghĩa role mới
export type UserRole = "guest" | "user" | "coach" | "manager" | "field_owner";

export const UserRole = {
  guest: "guest" as UserRole,
  user: "user" as UserRole,
  coach: "coach" as UserRole,
  MANAGER: "manager" as UserRole,
  FIELD_OWNER: "field_owner" as UserRole,
};

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

// Hook để lấy thông tin xác thực đơn giản theo role
export const usePermissions = () => {
  const user = useSelector((state: any) => state.auth.user) as User | null;

  console.log("🔍 Debug usePermissions:");
  console.log("- User from Redux:", user);
  console.log("- User role:", user?.role);
  console.log("- Is authenticated:", !!user);
  
  const hasRole = (role: UserRole): boolean => {
    return (user?.role as UserRole | undefined) === role;
  };

  return {
    user,
    hasRole,
    isAuthenticated: !!user,
  };
};

const ProtectedRoute = ({
  children,
  allowedRoles,
}: ProtectedRouteProps) => {
  const location = useLocation();
  const { hasRole, isAuthenticated } = usePermissions();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const hasAllowedRole = allowedRoles.some((role) => hasRole(role));
    if (!hasAllowedRole) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // Không kiểm tra permissions ở phiên bản rút gọn

  return <>{children}</>;
};

export const UnauthorizedPage = () => {
  const navigate = useNavigate();
  const { user } = usePermissions();
  const getRedirectPath = () => {
    switch (user?.role) {
      case UserRole.coach:
        return "/coach";
      case UserRole.user:
        return "/user";
      case UserRole.MANAGER:
        return "/center";
      case UserRole.FIELD_OWNER:
        return "/field_owner";
      default:
        return "/";
    }
  };

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
            onClick={() => navigate(getRedirectPath())}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            Về trang chủ của bạn
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

// Component để redirect authenticated users từ trang root
export const AuthenticatedRedirect = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const user = useSelector((state: any) => state.auth.user) as User | null;
  const location = useLocation();
  if (user && location.pathname === "/") {
    const redirectPath = getRoleBasedRedirectPath(user.role);
    console.log(
      `🏠 ${user.role} on root page, redirecting to: ${redirectPath}`
    );
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
};

// Utility functions for role-based redirect
export const getRoleBasedRedirectPath = (role: string | undefined): string => {
  switch (role) {
    case "coach":
      return "/coach";
    case "user":
      return "/user";
    case "manager":
      return "/center";
    case "field_owner":
      return "/field_owner";
    default:
      return "/";
  }
};

export const redirectUserByRole = (
  role: string | undefined,
  navigate: (path: string) => void
) => {
  const redirectPath = getRoleBasedRedirectPath(role);
  console.log(`🔄 Redirecting ${role} to: ${redirectPath}`);
  navigate(redirectPath);
};

// Hook để xử lý auto redirect sau khi login
export const useAutoRedirect = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector((state: any) => state.auth.user) as User | null;
  useEffect(() => {
    // Chỉ redirect center và manager sau khi login, user ở lại trang root
    if (
      user &&
      location.pathname === "/login" &&
      (user.role === "coach" || user.role === "manager")
    ) {
      const redirectPath = getRoleBasedRedirectPath(user.role);
      console.log(`🚀 Auto redirecting ${user.role} to: ${redirectPath}`);
      navigate(redirectPath, { replace: true });
    }
    // Nếu user login thành công, redirect về trang root
    else if (
      user &&
      location.pathname === "/login" &&
      user.role === "user"
    ) {
      console.log(`🚀 user login successful, redirecting to home`);
      navigate("/", { replace: true });
    }
  }, [user, location.pathname, navigate]);
};

// Debug component để hiển thị thông tin user và role (chỉ trong development)
export const RoleDebug = () => {
  // const user = useSelector((state: RootState) => state.auth.user) as User | null;
  // const location = useLocation();
  // const { hasPermission } = usePermissions();
  // if (process.env.NODE_ENV !== 'development') return null;
  // const getExpectedPath = () => {
  //   if (!user) return 'Login required';
  //   return user.role === 'user' ? '/ (Home)' : getRoleBasedRedirectPath(user.role);
  // };
  // const userPermissions = user ? ROLE_PERMISSIONS[user.role as UserRole] || [] : [];
  // return (
  //   <div className="fixed bottom-4 right-4 bg-black text-white p-3 rounded text-xs z-50 max-w-md">
  //     <div className="font-bold mb-2">🔍 Debug Info</div>
  //     <div>Current Path: {location.pathname}</div>
  //     <div>User Role: {user?.role || 'Not authenticated'}</div>
  //     <div>Expected Path: {getExpectedPath()}</div>
  //     <div>User Name: {user?.fullName || 'None'}</div>
  //     <div>Has VIEW_PROFILE: {hasPermission(Permission.VIEW_PROFILE) ? '✅' : '❌'}</div>
  //     <div>User Permissions: {userPermissions.length}</div>
  //     <div className="text-xs mt-1 max-h-20 overflow-y-auto">
  //       {userPermissions.map(p => <div key={p}>• {p}</div>)}
  //     </div>
  //   </div>
  // );
};

export default ProtectedRoute;
