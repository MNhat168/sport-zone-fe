import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import type { ReactElement } from "react";
import Login from "./pages/auth/login";
import Register from "./pages/auth/register";
import ForgotPassword from "./pages/auth/forgot-password";
import ResetPassword from "./pages/auth/reset-password";
import VerifyRegister from "./pages/auth/verify-register";
import LandingPage from "./pages/landing/landing-page";
import GoogleCallback from "./pages/auth/GoogleCallback";
import ProfilePage from "./pages/profile/profile-page";

const RequireAuth = ({ children }: { children: ReactElement }) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/verify-register" element={<VerifyRegister />} />
        <Route path="/auth/reset-password" element={<ResetPassword />} />
        <Route path="/auth/login" element={<Login />} />
        <Route path="/auth/google/callback" element={<GoogleCallback />} />
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/profile"
          element={
            <RequireAuth>
              <ProfilePage />
            </RequireAuth>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
