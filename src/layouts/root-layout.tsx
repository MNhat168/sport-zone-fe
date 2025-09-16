// src/layouts/root-layout.tsx
import { useEffect } from 'react';
import { useLocation, Outlet } from 'react-router-dom';
import { AuthWrapper } from '../routes/auth-wrapper';
import { useAutoRedirect } from '../routes/protected-routes-config';

export const RootLayout = () => {
  const { pathname } = useLocation();

  useAutoRedirect();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname]);

  return (
    <AuthWrapper>
      <Outlet />
    </AuthWrapper>
  );
};

export default RootLayout;