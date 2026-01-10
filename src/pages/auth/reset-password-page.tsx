import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/hook";
import { resetPassword } from "../../features/authentication/authThunk";
import { Lock, Eye, EyeOff, ArrowRight, ArrowLeft } from "lucide-react";
import { toast } from "react-toastify";
import { CustomFailedToast, CustomSuccessToast } from "../../components/toast/notificiation-toast";
import { Loading } from "@/components/ui/loading";

export default function ResetPasswordPage() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");
    const email = searchParams.get("email");

    const [formData, setFormData] = useState({
        newPassword: "",
        confirmPassword: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    const { resetPasswordLoading, resetPasswordSuccess } = useAppSelector(
        (state) => state.auth
    );

    //Login banner images - reusing
    const loginBanners = [
        "/login.banner.img/login_banner.jpeg",
        "/login.banner.img/login_banner_1.jpg",
        "/login.banner.img/login_banner_2.jpg",
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImageIndex((prevIndex) =>
                (prevIndex + 1) % loginBanners.length
            );
        }, 5000);

        return () => clearInterval(interval);
    }, [loginBanners.length]);

    useEffect(() => {
        if (!token) {
            CustomFailedToast("Đường dẫn không hợp lệ hoặc đã hết hạn");
            navigate("/auth");
        }
    }, [token, navigate]);

    // Handle success navigation
    useEffect(() => {
        if (resetPasswordSuccess) {
            const timer = setTimeout(() => {
                navigate("/auth");
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [resetPasswordSuccess, navigate]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.newPassword.length < 6) {
            toast.error("Mật khẩu phải có ít nhất 6 ký tự");
            return;
        }

        if (formData.newPassword !== formData.confirmPassword) {
            toast.error("Mật khẩu xác nhận không khớp");
            return;
        }

        if (!token || !email) {
            toast.error("Thiếu thông tin xác thực (token hoặc email)");
            return;
        }

        try {
            await dispatch(resetPassword({
                email,
                resetPasswordToken: token,
                newPassword: formData.newPassword,
                confirmPassword: formData.confirmPassword
            })).unwrap();

            CustomSuccessToast("Đặt lại mật khẩu thành công!");
            // Navigation will be handled by useEffect when resetPasswordSuccess becomes true

        } catch (error: any) {
            let errorMessage = "Có lỗi xảy ra";

            if (error?.message) {
                errorMessage = error.message;
            } else if (error?.response?.data?.message) {
                errorMessage = error.response.data.message;
            }

            CustomFailedToast(errorMessage);
        }
    };

    return (
        <div className="h-screen w-screen fixed inset-0 overflow-hidden">
            {/* Background Carousel */}
            <div className="absolute inset-0 w-full h-full overflow-hidden">
                {loginBanners.map((banner, index) => (
                    <div
                        key={index}
                        className={`absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat transition-opacity duration-1000 ease-in-out ${index === currentImageIndex ? 'opacity-100' : 'opacity-0'
                            }`}
                        style={{
                            backgroundImage: `url('${banner}')`,
                        }}
                    />
                ))}
            </div>

            <div className="absolute inset-0 bg-black/40" />

            <div className="relative z-10 h-full flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 w-full max-w-md">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="mx-auto flex items-center justify-center mb-6">
                            <Link to="/">
                                <img
                                    src="/SportZone.png"
                                    alt="SportZone Logo"
                                    className="h-16 object-contain"
                                />
                            </Link>
                        </div>

                        <h2 className="text-2xl xl:text-3xl font-bold text-green-600 mb-3">
                            Đặt Lại Mật Khẩu
                        </h2>
                        {email && (
                            <p className="text-gray-500 text-sm mb-4">
                                Cho tài khoản: {email}
                            </p>
                        )}
                        <p className="text-gray-600">
                            Vui lòng nhập mật khẩu mới của bạn
                        </p>
                    </div>

                    {!resetPasswordSuccess ? (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* New Password */}
                            <div className="space-y-2 text-left">
                                <label className="block text-sm font-medium text-gray-700 text-left">
                                    Mật khẩu mới
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="newPassword"
                                        value={formData.newPassword}
                                        onChange={handleInputChange}
                                        className="w-full pl-12 pr-4 py-2 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm"
                                        placeholder="Nhập mật khẩu mới"
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

                            {/* Confirm Password */}
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
                                        className="w-full pl-12 pr-4 py-2 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm"
                                        placeholder="Nhập lại mật khẩu mới"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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

                            <button
                                type="submit"
                                disabled={resetPasswordLoading}
                                className="w-full bg-green-700 hover:bg-green-600 text-white py-4 px-6 rounded-xl text-base font-medium focus:ring-4 focus:ring-green-200 transition-all duration-200 flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {resetPasswordLoading ? (
                                    <Loading size={20} className="border-white" />
                                ) : (
                                    <>
                                        <span>Đổi mật khẩu</span>
                                        <ArrowRight className="w-5 h-5" />
                                    </>
                                )}
                            </button>
                        </form>
                    ) : (
                        <div className="text-center space-y-6">
                            <div className="bg-green-50 text-green-700 p-4 rounded-xl border border-green-100">
                                <p className="font-medium">Đổi mật khẩu thành công!</p>
                                <p className="text-sm mt-2">Bạn có thể đăng nhập bằng mật khẩu mới ngay bây giờ.</p>
                            </div>
                            <p className="text-gray-500 text-sm">
                                Đang chuyển hướng về trang đăng nhập...
                            </p>
                        </div>
                    )}

                    <div className="mt-8 text-center">
                        <Link
                            to="/auth"
                            className="inline-flex items-center text-gray-600 hover:text-green-700 font-medium transition-colors group"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2 transform group-hover:-translate-x-1 transition-transform" />
                            Quay lại đăng nhập
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
