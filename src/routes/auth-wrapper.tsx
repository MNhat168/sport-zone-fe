/* eslint-disable react-refresh/only-export-components */
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import type { RootState } from '../store/store';
//import { getDefaultRouteByRole } from './main-router';
import type { User } from '../types/user-type';
import { getDefaultRouteByRole } from '../utils/routing/routing-utils';
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
    // Auto-redirect logic sau khi login thành công
    if (isAuthenticated && location.pathname === '/login') {
      const defaultRoute = getDefaultRouteByRole(user.role);
      navigate(defaultRoute, { replace: true });
    }
    
    // Redirect nếu truy cập wrong role path
    if (isAuthenticated) {
      const currentPath = location.pathname;
      
      // Check if user is accessing wrong role path
      if (user.role === 'user' && !currentPath.startsWith('/user')) {
        navigate('/user', { replace: true });
      } else if (user.role === 'coach' && !currentPath.startsWith('/coach')) {
        navigate('/coach', { replace: true });
      } else if (user.role === 'manager' && !currentPath.startsWith('/center')) {
        navigate('/center', { replace: true });
      } else if (user.role === 'field_owner' && !currentPath.startsWith('/field_owner')) {
        navigate('/field_owner', { replace: true });
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
