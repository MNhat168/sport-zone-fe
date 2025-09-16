import {useState} from "react";
//redux + navigation
import { useAppDispatch } from "../../store/hook";
import { useAppNavigation } from "../../hooks/app-navigation";
import { useNavigate } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";

//UI
import { toast } from "react-toastify";
import {
  CustomFailedToast,
  CustomSuccessToast,
  CustomToast,
} from "../../components/toast/notificiation-toast";
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Phone } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { AnimatedButton } from "@/components/animation/motion.config";
import { Button } from "@/components/ui/button";

//axios
//import axiosPublic from "../../utils/axios/axiosPublic";
import axios from "axios";
import { 
  signInWithEmailAndPassword, 
  signUpWithEmailAndPassword, 
  signInWithGoogle 
} from "../../features/authentication/authThunk";

export default function AuthenticationPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    phone_number: "",
    date_of_birth: "",
    confirmPassword: "",
  });
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { gotoForgotPassword } = useAppNavigation();

  console.log("Dữ liệu trong LOGIN PAGE -----------------------------------");
  console.log("Dữ liệu trong Form Data: ", JSON.stringify(formData, null, 2));
  console.log("Trạng thái đăng nhập: ", isLogin);

  const handleInputChange = (e: {
    target: { name: string; value: string };
  }) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validatePhoneNumber = (phone: string) => {
    const phoneRegex = /^[0-9]{10}$/;
    return phoneRegex.test(phone);
  };

  const validatedate_of_birth = (date: string) => {
    const birthDate = new Date(date);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    return age >= 12; // Minimum age requirement
  };

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      toast.error("Vui lòng điền email và mật khẩu");
      return false;
    }

    if (!isLogin) {
      if (!formData.fullName) {
        toast.error("Vui lòng điền họ và tên");
        return false;
      }

      if (formData.password !== formData.confirmPassword) {
        toast.error("Mật khẩu không khớp");
        return false;
      }

      if (
        !formData.date_of_birth ||
        !validatedate_of_birth(formData.date_of_birth)
      ) {
        toast.error("Ngày sinh không hợp lệ hoặc tuổi phải lớn hơn 12");
        return false;
      }

      if (
        !formData.phone_number ||
        !validatePhoneNumber(formData.phone_number)
      ) {
        toast.error("Số điện thoại không hợp lệ");
        return false;
      }
    }
    return true;
  };
  
  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        // Lấy thông tin user từ Google API
        const googleUserInfo = await axios.get(
          "https://www.googleapis.com/oauth2/v3/userinfo",
          {
            headers: {
              Authorization: `Bearer ${tokenResponse.access_token}`,
            },
          }
        );

        const { picture } = googleUserInfo.data;

        const result = await dispatch(
          signInWithGoogle({
            token: tokenResponse.access_token,
            avatar: picture,
          })
        ).unwrap();

        localStorage.setItem("user", JSON.stringify(result.data.user));
        localStorage.setItem("token", JSON.stringify(result.data.access_token));

        console.log("Dữ liệu đăng nhập Google:", result);
        console.log("Dữ liệu user từ Google:", googleUserInfo.data);

        // CustomSuccessToast("Đăng nhập Google thành công!");

        setTimeout(() => {
          navigate("/");
        });
      } catch (error) {
        // Kiểm tra error có phải AxiosError không
        if (axios.isAxiosError(error)) {
          CustomFailedToast(error.response?.data?.message || error.message);
        } else if (error instanceof Error) {
          CustomFailedToast(error.message);
        } else {
          CustomFailedToast("Đăng nhập Google thất bại");
        }
      }
    },
    onError: (error: any) => {
      CustomFailedToast("Đăng nhập Google thất bại");
      console.error(error);
    },
  });

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormData({
      email: "",
      password: "",
      fullName: "",
      phone_number: "",
      date_of_birth: "",
      confirmPassword: "",
    });
  };
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      if (isLogin) {
        const result = await dispatch(
          signInWithEmailAndPassword({
            email: formData.email,
            password: formData.password,
          })
        ).unwrap();

        if (result) {
          const { access_token, user } = result;

          if (user.isActive === false) {
            CustomFailedToast("Tài khoản của bạn đã bị khóa.");
            navigate("/lock-account");
            setIsLoading(false);
            return;
          }

          if (rememberMe) {
            // Nếu người dùng chọn "Ghi nhớ", lưu vào cookies với thời hạn 30 ngày
            const d = new Date();
            d.setTime(d.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days
            document.cookie = `token=${access_token}; expires=${d.toUTCString()}; path=/`;
            document.cookie = `user=${JSON.stringify(
              user
            )}; expires=${d.toUTCString()}; path=/`;
          } else {
            // Nếu không, lưu vào sessionStorage
            sessionStorage.setItem("token", access_token);
            sessionStorage.setItem("user", JSON.stringify(user));
          }

          CustomSuccessToast("Đăng nhập thành công!");
          navigate("/");
        }
      } else {
        const result = await dispatch(
          signUpWithEmailAndPassword({
            email: formData.email,
            password: formData.password,
            fullName: formData.fullName,
            date_of_birth: formData.date_of_birth,
            phone_number: formData.phone_number,
          })
        ).unwrap();

        if (result) {
          CustomSuccessToast("Đăng ký thành công! Vui lòng đăng nhập.");
          setIsLogin(true);
        }
      }
    } catch (error: any) {
      CustomFailedToast(error.message || "Có lỗi xảy ra");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="h-screen w-screen fixed inset-0 overflow-hidden">
      <CustomToast />

      {/* Full Screen Background Image */}
      <div
        className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://res.cloudinary.com/dvcpy4kmm/image/upload/v1757701984/SportZone_amub7p.png')`,
        }}
      />

      {/* Overlay gradients */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/60" />
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 via-transparent to-purple-900/20" />

      {/* Content Container */}
      <div className="relative z-10 h-full flex">
        {/* Left Side - Background Content (Hidden on mobile) */}
        <div className="hidden lg:flex lg:flex-1 items-center justify-center p-12">
          <div className="max-w-lg text-center text-white">
            {/* You can add background content here if needed */}
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full lg:w-[480px] xl:w-[520px] bg-transparent p-6 lg:p-8">
          {" "}
          {/* Increased padding */}
          <div className="h-full flex items-center justify-center p-8 xl:p-12 overflow-y-auto">
            <div className="w-full max-w-md">
              {" "}
              {/* Increased max-width */}
              {/* Header */}
              <div className="text-center mb-8">
                <div className="mx-auto w-16 h-16 bg-gradient-to-r from-green-800 to-green-400 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                  <User className="w-8 h-8 text-white" />
                </div>

                <h2 className="text-3xl xl:text-4xl font-bold text-gray-900 mb-3">
                  {isLogin ? "Đăng Nhập" : "Đăng Ký"}
                </h2>
                <p className="text-black text-lg">
                  {isLogin
                    ? "Chào mừng bạn quay trở lại SportZone"
                    : "Tạo tài khoản mới của bạn"}
                </p>
              </div>
              {/* Form */}
              <div className="space-y-6">
                {/* Full Name Field (only for register) */}
                {!isLogin && (
                  <div className="space-y-2 text-left">
                    {" "}
                    <label className="block text-sm font-medium text-gray-700 text-left">
                      Họ và tên
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        className="w-full pl-12 pr-4 py-2 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm"
                        placeholder="Nhập họ và tên của bạn"
                        required={!isLogin}
                      />
                    </div>
                  </div>
                )}
                {/* Date of Birth Field (only for register) */}
                {!isLogin && (
                  <div className="space-y-2 text-left">
                    <label className="block text-sm font-medium text-gray-700 text-left">
                      Ngày sinh
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        name="date_of_birth"
                        value={formData.date_of_birth}
                        onChange={handleInputChange}
                        className="w-full pl-4 pr-4 py-2 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm"
                        required={!isLogin}
                      />
                    </div>
                  </div>
                )}
                {!isLogin && (
                  <div className="space-y-2 text-left">
                    <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <label className="block text-sm font-medium text-gray-700 text-left">
                      Số điện thoại
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        name="phone_number"
                        value={formData.phone_number}
                        onChange={handleInputChange}
                        className="w-full pl-5 pr-4 py-2 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm"
                        placeholder="Nhập số điện thoại của bạn"
                        required={!isLogin}
                      />
                    </div>
                  </div>
                )}
                <div className="space-y-2 text-left">
                  <label className="block text-sm font-medium text-gray-700 text-left">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full pl-12 pr-4 py-2  text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm"
                      placeholder="example@email.com"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2 text-left">
                  <label className="block text-sm font-medium text-gray-700 text-left">
                    Mật khẩu
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full pl-12 pr-4 py-2  text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm"
                      placeholder="Nhập mật khẩu"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
                {/* Confirm Password Field (only for register) */}
                {!isLogin && (
                  <div className="space-y-2 text-left">
                    <label className="block text-sm font-medium text-gray-700 text-left">
                      Xác nhận mật khẩu
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className="w-full pl-12 pr-4 py-2 text-base border-gray-300 rounded-xl focus:ring-2 focus:border-transparent transition-all duration-200 bg-white shadow-sm"
                        placeholder="Nhập lại mật khẩu"
                        required={!isLogin}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>
                )}
                {/* Remember Me / Forgot Password (only for login) */}{" "}
                {isLogin && (
                  <div className="flex items-center justify-between">
                    <div>
                      <Checkbox
                        id="terms"
                        checked={rememberMe}
                        onCheckedChange={(checked) =>
                          setRememberMe(checked === true)
                        }
                      />
                      <label
                        htmlFor="terms"
                        className="px-2 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Ghi nhớ tài khoản
                      </label>
                    </div>
                    <button
                      onClick={() => gotoForgotPassword()}
                      type="button"
                      className="text-sm text-black hover:text-green-800 font-medium transition-colors"
                    >
                      Quên mật khẩu?
                    </button>
                  </div>
                )}
                {/* Submit Button */}
                <button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-green-800 to-green-400 text-white py-4 px-6 rounded-xl text-base font-mediu focus:ring-4 focus:ring-blue-200 transition-all duration-200 flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-white"></div>
                  ) : (
                    <>
                      <span>{isLogin ? "Đăng Nhập" : "Đăng Ký"}</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
                <AnimatedButton >
                  <Button
                    onClick={() => navigate("/")}
                    className="w-full bg-gradient-to-r from-green-800 to-green-400 text-white py-4 px-6 rounded-xl text-base font-mediu focus:ring-4 focus:ring-blue-200 transition-all duration-200 flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Xem trước
                  </Button>
                </AnimatedButton>
              </div>
              {/* Toggle Mode */}
              <div className="mt-8 text-center">
                <p className="text-black">
                  {isLogin ? "Chưa có tài khoản?" : "Đã có tài khoản?"}
                  <button
                    onClick={toggleMode}
                    className="ml-2 text-green-400 hover:text-green-800 font-medium transition-colors"
                  >
                    {isLogin ? "Đăng ký ngay" : "Đăng nhập ngay"}
                  </button>
                </p>
              </div>
              {/* Social Login */}
              <div className="mt-8">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center"></div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-transparent text-black z-10">
                      Hoặc tiếp tục với
                    </span>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-4">
                  {" "}
                  <button
                    onClick={() => handleGoogleLogin()}
                    className="w-full transform duration-300 hover:scale-105 inline-flex justify-center py-3 px-4 border border-gray-300 rounded-xl shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    <span className="ml-2">Google</span>
                  </button>
                  <button className="transform transition-transform duration-300 hover:scale-105 w-full inline-flex justify-center py-3 px-4 border border-gray-300 rounded-xl shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                    <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                    <span className="ml-2">Facebook</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}