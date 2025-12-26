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


    // Note: Redirect logic chính được xử lý trong authentication-page.tsx với window.location.href
    // Không cần redirect ở đây nữa để tránh double redirect
    // Chỉ giữ logic này cho các trường hợp edge case (nếu user đã authenticated nhưng vẫn ở /auth)
    // Nhưng không redirect tự động để tránh conflict với login redirect

    // KHÔNG redirect nếu đang ở public routes
    // Sử dụng utility function từ routes-config.tsx để tránh duplicate code
    if (isPublicRoute(location.pathname)) {

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