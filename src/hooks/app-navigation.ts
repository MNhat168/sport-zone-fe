import { useNavigate } from "react-router-dom";

export const useAppNavigation = () => {
  const navigate = useNavigate();

  return {
    goToHome: () => navigate("/"),
    goToLogin: () => navigate("/login"),
    gotoSearch: () => navigate("/courses-list"),
    gotoForgotPassword: () => navigate("/forgot-password"),
  };
};
