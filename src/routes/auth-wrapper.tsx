/* eslint-disable react-refresh/only-export-components */
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import type { RootState } from '../store/store';
import type { User } from '../types/user-type';
import { isPublicRoute } from './routes-config';

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
      console.log('AuthWrapper - Redirecting from auth page to landing page for role:', user.role);
      navigate('/', { replace: true });
      return; // Ngừng thực hiện logic khác
    }

    // KHÔNG redirect nếu đang ở public routes
    // Sử dụng utility function từ routes-config.tsx để tránh duplicate code
    if (isPublicRoute(location.pathname)) {
      console.log('AuthWrapper - On public route, no redirect needed');
      return; // Không redirect
    }

    // Private routes are handled by ProtectedRoute component
    // No need for additional permission checking here
  }, [isAuthenticated, user, location.pathname, navigate]);

  return <>{children}</>;
};

// Simple hook to get current user - no complex permissions
export const useAuth = () => {
  const user = useSelector((state: RootState) => state.auth.user) as User | null;

  return {
    user,
    isAuthenticated: !!user,
    role: user?.role || null,
  };
};

export default AuthWrapper;