/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useCallback } from "react";
import { Loading } from "@/components/ui/loading";
import { useNavigate, useLocation } from "react-router-dom";
import { CheckCircle, XCircle } from "lucide-react";
import { BASE_URL } from "../../utils/constant-value/constant";
import { CustomSuccessToast } from "../../components/toast/notificiation-toast";
import axios from "axios";

export default function VerifyTokenPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isVerify, setIsVerify] = useState<null | boolean>(null); // null: loading, true: success, false: fail
  const [verifyMessage, setVerifyMessage] = useState("");
  const searchParams = new URLSearchParams(location.search);
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const verifyEmailToken = useCallback(async (token: string, email?: string | null) => {
    setIsVerify(null);
    try {
      // Backend endpoint is /auth/verify-email
      // Support both with email and without email
      let url = `${BASE_URL}/auth/verify-email?token=${encodeURIComponent(token)}`;
      if (email) {
        url += `&email=${encodeURIComponent(email)}`;
      }
      const response = await axios.get(url);
      // Nếu backend trả về message thành công
      setIsVerify(true);
      setVerifyMessage(response.data.message || "Xác thực email thành công!");
      CustomSuccessToast("Xác thực email thành công!");
    } catch (error: any) {
      setIsVerify(false);
      const errorMessage = error?.response?.data?.message ||
        (error?.message?.includes('expired') || error?.message?.includes('hết hạn')
          ? "Token đã hết hạn. Vui lòng đăng ký lại."
          : "Token không hợp lệ hoặc đã hết hạn");
      setVerifyMessage(errorMessage);
    }
  }, []);

  useEffect(() => {
    const path = location.pathname;

    // Handle redirect from backend (success/failed pages)
    if (path === '/verify-email/success') {
      setIsVerify(true);
      setVerifyMessage("Tài khoản của bạn đã được xác thực thành công!");
      CustomSuccessToast("Xác thực email thành công!");
      return;
    } else if (path === '/verify-email/failed') {
      setIsVerify(false);
      setVerifyMessage("Xác thực thất bại. Token không hợp lệ hoặc đã hết hạn. Vui lòng đăng ký lại.");
      return;
    }

    // Handle direct token verification (from email link)
    if (token && path === '/verify-email') {
      verifyEmailToken(token, email);
    }
  }, [token, email, location.pathname, verifyEmailToken]);

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-primary-700">
      <div className="bg-white rounded-2xl shadow-xl px-10 py-12 flex flex-col items-center max-w-md">
        {isVerify === null && (
          <Loading size={48} className="text-green-400 mb-4" />
        )}
        {isVerify === true && (
          <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
        )}
        {isVerify === false && (
          <XCircle className="w-16 h-16 text-red-500 mb-4" />
        )}
        <h2
          className={`text-3xl font-bold mb-2 ${isVerify === true
              ? "text-green-700"
              : isVerify === false
                ? "text-red-700"
                : "text-gray-700"
            }`}
        >
          {isVerify === true
            ? "Xác thực thành công!"
            : isVerify === false
              ? "Xác thực thất bại"
              : "Đang xác thực..."}
        </h2>
        <p
          className={`${isVerify === true
              ? "text-green-800"
              : isVerify === false
                ? "text-red-800"
                : "text-gray-800"
            } text-lg mb-6 text-center`}
        >
          {isVerify === null
            ? "Vui lòng chờ trong giây lát..."
            : verifyMessage}
        </p>
        <button
          onClick={() => navigate("/login")}
          className={`${isVerify === true
              ? "bg-green-600 hover:bg-green-500"
              : "bg-primary-900 hover:bg-primary-800"
            } text-white px-6 py-3 rounded-xl font-semibold shadow transition`}
        >
          Đăng nhập ngay
        </button>
      </div>
    </div>
  );
}