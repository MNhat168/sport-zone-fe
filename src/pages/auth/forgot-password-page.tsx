import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/hook";
import { forgotPassword } from "../../features/authentication/authThunk";
import { Mail, ArrowRight, ArrowLeft } from "lucide-react";
import { toast } from "react-toastify";
import { CustomFailedToast, CustomSuccessToast } from "../../components/toast/notificiation-toast";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    const { forgotPasswordLoading, forgotPasswordSuccess } = useAppSelector(
        (state) => state.auth
    );

    // Login banner images - reusing from AuthenticationPage
    const loginBanners = [
        "/login.banner.img/login_banner.jpeg",
        "/login.banner.img/login_banner_1.jpg",
        "/login.banner.img/login_banner_2.jpg",
    ];

    // Auto-rotate carousel every 5 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImageIndex((prevIndex) =>
                (prevIndex + 1) % loginBanners.length
            );
        }, 5000);

        return () => clearInterval(interval);
    }, [loginBanners.length]);

    // Handle success navigation
    useEffect(() => {
        if (forgotPasswordSuccess) {
            const timer = setTimeout(() => {
                navigate("/auth");
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [forgotPasswordSuccess, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email) {
            toast.error("Vui lòng nhập email");
            return;
        }

        try {
            await dispatch(forgotPassword({ email })).unwrap();
            CustomSuccessToast("Vui lòng kiểm tra email để đặt lại mật khẩu!");
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
            {/* Full Screen Background Carousel */}
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

            {/* Overlay */}
            <div className="absolute inset-0 bg-black/40" />

            {/* Content Container - Centered */}
            <div className="relative z-10 h-full flex items-center justify-center p-4">
                {/* White Card Container */}
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
                            Quên Mật Khẩu
                        </h2>
                        <p className="text-gray-600">
                            Nhập email của bạn để nhận liên kết đặt lại mật khẩu
                        </p>
                    </div>

                    {!forgotPasswordSuccess ? (
                        /* Form */
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2 text-left">
                                <label className="block text-sm font-medium text-gray-700 text-left">
                                    Email
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm"
                                        placeholder="example@email.com"
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={forgotPasswordLoading}
                                className="w-full bg-green-700 hover:bg-green-600 text-white py-4 px-6 rounded-xl text-base font-medium focus:ring-4 focus:ring-green-200 transition-all duration-200 flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {forgotPasswordLoading ? (
                                    <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-white"></div>
                                ) : (
                                    <>
                                        <span>Gửi yêu cầu</span>
                                        <ArrowRight className="w-5 h-5" />
                                    </>
                                )}
                            </button>
                        </form>
                    ) : (
                        /* Success State */
                        <div className="text-center space-y-6">
                            <div className="bg-green-50 text-green-700 p-4 rounded-xl border border-green-100">
                                <p className="font-medium">Đã gửi email thành công!</p>
                                <p className="text-sm mt-2">Vui lòng kiểm tra hộp thư đến của bạn để xem hướng dẫn đặt lại mật khẩu.</p>
                            </div>
                            <p className="text-gray-500 text-sm">
                                Bạn sẽ được chuyển hướng về trang đăng nhập trong vài giây...
                            </p>
                        </div>
                    )}

                    {/* Back to Login */}
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
