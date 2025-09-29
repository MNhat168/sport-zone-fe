/* eslint-disable react-refresh/only-export-components */
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import type { RootState } from '../store/store';
import type { User } from '../types/user-type';
import {  isRouteAllowedForRole, getRoleBasedRedirectPath } from '../utils/routing/routing-utils';

interface AuthWrapperProps {
  children: React.ReactNode;
}

// Component wrapper để handle authentication logic
export const AuthWrapper = ({ children }: AuthWrapperProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const user = useSelector((state: RootState) => state.auth.user) as User | null;
  const isAuthenticated = !!user;

  useEffect(() => {
    console.log('AuthWrapper - Current path:', location.pathname);
    console.log('AuthWrapper - User:', user);
    console.log('AuthWrapper - isAuthenticated:', isAuthenticated);

    // Auto-redirect logic sau khi login thành công (chỉ từ trang auth/login)
    if (isAuthenticated && (location.pathname === '/auth')) {
      const defaultRoute = getRoleBasedRedirectPath(user.role); // Sử dụng hàm chung
      console.log('AuthWrapper - Redirecting from auth page to:', defaultRoute);
      navigate(defaultRoute, { replace: true });
      return; // Ngừng thực hiện logic khác
    }

    // Danh sách các public routes mà không bao giờ được redirect
    const publicRoutes = [
      '/',
      '/landing',
      '/about',
      '/contact',
      '/services',
      '/coaches',
      '/unauthorized'
    ];

    // KHÔNG redirect nếu đang ở public routes
    const isPublicRoute = publicRoutes.some(route =>
      location.pathname === route ||
      (route !== '/' && location.pathname.startsWith(route))
    );

    if (isPublicRoute) {
      console.log('AuthWrapper - On public route, no redirect needed');
      return; // Không redirect
    }

    // Chỉ check và redirect cho private routes
    if (isAuthenticated) {
      const currentPath = location.pathname;
      const allowed = isRouteAllowedForRole(currentPath, user.role);

      console.log('AuthWrapper - Checking private route access:', { currentPath, allowed });

      if (!allowed) {
        const defaultRoute = getRoleBasedRedirectPath(user.role); // Sử dụng hàm chung
        console.log('AuthWrapper - Redirecting to default route:', defaultRoute);
        navigate(defaultRoute, { replace: true });
      }
    }
  }, [isAuthenticated, user, location.pathname, navigate]);

  return <>{children}</>;
};

// Hook để get current user context
export const useAuth = () => {
  const user = useSelector((state: RootState) => state.auth.user) as User | null;

  return {
    user,
    isAuthenticated: !!user,
    role: user?.role || null,
    permissions: user ? getRolePermissions(user.role) : []
  };
};

// Helper function để get permissions by role
const getRolePermissions = (role: string): string[] => {
  switch (role) {
    case 'user':
      return ['view_courses', 'enroll_course', 'view_progress', 'submit_feedback'];
    case 'coach':
      return ['view_courses', 'manage_classes', 'view_user_progress', 'create_assignments'];
    case 'manager':
      return ['manage_courses', 'manage_coachs', 'manage_users', 'view_analytics', 'manage_center', 'full_access', 'system_config'];
    default:
      return [];
  }
};

export default AuthWrapper;