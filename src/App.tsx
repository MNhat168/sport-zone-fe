// import { BrowserRouter as Router, Routes, Route, Navigate, createBrowserRouter, RouterProvider } from "react-router-dom";
//import type { useEffect } from "react";
// import Login from "./pages/auth/login";
// import Register from "./pages/auth/register";
// import ForgotPassword from "./pages/auth/forgot-password";
// import ResetPassword from "./pages/auth/reset-password";
// import VerifyRegister from "./pages/auth/verify-register";
// import LandingPage from "./pages/landing/landing-page";
// import GoogleCallback from "./pages/auth/GoogleCallback";
// import ProfilePage from "./pages/profile/profile-page";
// import FieldOwnerDashboard from "./pages/landing/field_owner_main";
// import BookingsPage from "./pages/coach/booking-page";
// import CoachSchedulePage from "./pages/coach/schedule-page";
// import SetHolidayPage from "./pages/coach/set-holiday-page";

import { RootLayout } from "./layouts/root-layout";
import { centerRoutes, coachRoutes, fieldOwnerRoutes, guestRoutes, userRoutes } from "./routes/routes-config";
import { Provider } from "react-redux";
import { store } from "./store/store";
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { UserSyncProvider } from "./components/providers";
import './App.css';
// const RequireAuth = ({ children }: { children: ReactElement }) => {
//   const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
//   if (!token) {
//     return <Navigate to="/login" replace />;
//   }
//   return children;
// };

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      ...guestRoutes,
      ...userRoutes,
      ...coachRoutes,
      ...centerRoutes,
      ...fieldOwnerRoutes,
      //...chatRoutes,
    ],
  },
]);

// function App() {
//   return (
//     <Router>
//       <Routes>
//         <Route path="/login" element={<Login />} />
//         <Route path="/register" element={<Register />} />
//         <Route path="/forgot-password" element={<ForgotPassword />} />
//         <Route path="/reset-password" element={<ResetPassword />} />
//         <Route path="/verify-register" element={<VerifyRegister />} />
//         <Route path="/auth/reset-password" element={<ResetPassword />} />
//         <Route path="/auth/login" element={<Login />} />
//         <Route path="/auth/google/callback" element={<GoogleCallback />} />
//         <Route path="/" element={<LandingPage />} />
//         <Route
//           path="/profile"
//           element={
//             <RequireAuth>
//               <ProfilePage />
//             </RequireAuth>
//           }
//         />
//         <Route path="/field-owner" element={<FieldOwnerDashboard />} />
//         <Route path="/coach/booking" element={<BookingsPage />} />
//         <Route path="/coach/schedule" element={<CoachSchedulePage />} />
//         <Route path="/coach/holiday" element={<SetHolidayPage />} />
//       </Routes>   
//     </Router>
//   );
// }
function App() {
  // Preload courses khi app khởi động
  // useEffect(() => {
  //   // courseCacheService.preloadCourses();
  // }, []);

  return (
    <Provider store={store}>
      <UserSyncProvider>
        <RouterProvider router={router} />
        {/* <ChatbotWidget /> */}
      </UserSyncProvider>
    </Provider>
  );
}
export default App;
