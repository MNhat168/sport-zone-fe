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
    // KHÔNG redirect nếu đang ở public routes
    if (isPublicRoute(location.pathname)) {
      return; // Không redirect
    }

    // CHECK POLICY STATUS
    if (user && (user.role === 'coach' || user.role === 'field_owner')) {
      // Need to read policy but haven't
      if (user.hasReadPolicy === false) {
        if (location.pathname !== '/auth/policy-confirmation') {
          navigate('/auth/policy-confirmation');
        }
        return;
      }

      // If already read policy but trying to access confirmation page
      if (user.hasReadPolicy === true && location.pathname === '/auth/policy-confirmation') {
        // Redirect back to dashboard
        navigate(user.role === 'coach' ? '/coach/dashboard' : '/field-owner/dashboard');
        return;
      }
    }

    // Private routes are handled by ProtectedRoute component
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