// src/layouts/root-layout.tsx
import { useEffect } from 'react';
import { useLocation, Outlet } from 'react-router-dom';
import { AuthWrapper } from '../routes/auth-wrapper';
import { useAutoRedirect } from '../routes/protected-routes-config';

export const RootLayout = () => {
  const { pathname } = useLocation();

  useAutoRedirect();

  useEffect(() => {
    // Only scroll to top for specific routes, not booking page
    if (!pathname.includes('/booking')) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [pathname]);

  return (
    <div className="min-h-screen sticky-container">
      <AuthWrapper>
        <Outlet />
      </AuthWrapper>
    </div>
  );
};

export default RootLayout;