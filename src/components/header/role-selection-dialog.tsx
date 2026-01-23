
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Users, Trophy, Lock } from "lucide-react";
import { Link } from "react-router-dom";
import { useAppSelector } from "@/store/hook";

interface RoleSelectionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export const RoleSelectionDialog = ({
    open,
    onOpenChange,
}: RoleSelectionDialogProps) => {
    const auth = useAppSelector((state) => state.auth);
    // Temporary: In a real scenario, checks might be more complex (e.g., checking specific registration status)
    // For now, relies on 'role' or simple checks. Since this dialog is only accessible to 'user' role
    // via the button, these checks are for future-proofing or if the button logic changes.

    // However, users who are ALREADY 'coach' or 'field_owner' usually don't see the button.
    // This logic handles potential edge cases or if we allow button for everyone later.

    const isCoach = auth.user?.role === "coach";
    const isFieldOwner = auth.user?.role === "field_owner";

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                showCloseButton={false}
                className="max-w-[90vw] w-full md:max-w-4xl p-0 overflow-hidden bg-transparent border-none shadow-none"
            >
                <DialogHeader className="sr-only">
                    <DialogTitle>Chọn vai trò đối tác</DialogTitle>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 h-[80vh] md:h-[500px] gap-4 md:gap-0 relative">
                    {/* Custom Close Button */}
                    <div className="absolute top-4 right-4 z-50">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="bg-black/20 hover:bg-black/40 text-white rounded-full p-1 h-8 w-8 backdrop-blur-sm transition-all"
                            onClick={() => onOpenChange(false)}
                        >
                            <span className="sr-only">Close</span>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="h-4 w-4"
                            >
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </Button>
                    </div>

                    {/* Become a Coach Section */}
                    <div className="relative group overflow-hidden cursor-pointer h-full rounded-xl md:rounded-none md:rounded-l-xl">
                        <div
                            className={`absolute inset-0 bg-cover bg-center transition-all duration-700 ${!isFieldOwner ? 'group-hover:scale-105' : ''} ${isFieldOwner ? 'grayscale' : ''}`}
                            style={{ backgroundImage: "url('/Coach.png')" }}
                        >
                            <div className={`absolute inset-0 transition-all duration-700 ${isFieldOwner ? 'bg-black/70' : 'bg-black/40 group-hover:bg-black/20'}`}></div>

                            {/* Glow effect - only if valid */}
                            {!isFieldOwner && (
                                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                                    <div className="absolute inset-0 bg-blue-400/30 blur-3xl"></div>
                                </div>
                            )}
                        </div>

                        <div className="relative z-10 h-full flex flex-col items-center justify-center p-6 md:p-8 text-white">
                            {isFieldOwner ? (
                                <Lock className="h-12 w-12 md:h-16 md:w-16 mb-4 md:mb-6 mx-auto text-gray-400" />
                            ) : (
                                <div className="transform group-hover:scale-110 transition-transform duration-700">
                                    <Users className="h-12 w-12 md:h-16 md:w-16 mb-4 md:mb-6 mx-auto animate-float" />
                                </div>
                            )}

                            <h2 className={`text-2xl md:text-3xl font-bold mb-3 md:mb-4 text-center transition-colors duration-500 ${isFieldOwner ? 'text-gray-400' : 'group-hover:text-blue-200'}`}>
                                Trở Thành Huấn Luyện Viên
                            </h2>

                            <p className="text-sm md:text-base text-center mb-6 max-w-xs opacity-90 transition-opacity">
                                {isFieldOwner
                                    ? "Bạn đã là chủ sở hữu sân. Không thể đăng ký thêm vai trò này."
                                    : "Chia sẻ kinh nghiệm và đam mê thể thao của bạn."}
                            </p>

                            {isFieldOwner ? (
                                <Button disabled className="bg-gray-600 text-gray-300 px-6 py-2 md:px-8 md:py-3 text-sm md:text-base font-semibold cursor-not-allowed">
                                    Không Khả Dụng
                                </Button>
                            ) : (
                                <Link to="/become-coach" onClick={() => onOpenChange(false)}>
                                    <Button className="bg-white text-blue-700 hover:bg-blue-50 px-6 py-2 md:px-8 md:py-3 text-sm md:text-base font-semibold transform group-hover:scale-110 transition-all duration-500 shadow-2xl">
                                        Đăng Ký Ngay
                                    </Button>
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* Become a Field Owner Section */}
                    <div className="relative group overflow-hidden cursor-pointer h-full rounded-xl md:rounded-none md:rounded-r-xl">
                        <div
                            className={`absolute inset-0 bg-cover bg-center transition-all duration-700 ${!isCoach ? 'group-hover:scale-105' : ''} ${isCoach ? 'grayscale' : ''}`}
                            style={{ backgroundImage: "url('/FieldOwner.png')" }}
                        >
                            <div className={`absolute inset-0 transition-all duration-700 ${isCoach ? 'bg-black/70' : 'bg-black/40 group-hover:bg-black/20'}`}></div>

                            {/* Glow effect - only if valid */}
                            {!isCoach && (
                                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                                    <div className="absolute inset-0 bg-green-400/30 blur-3xl"></div>
                                </div>
                            )}
                        </div>

                        <div className="relative z-10 h-full flex flex-col items-center justify-center p-6 md:p-8 text-white">
                            {isCoach ? (
                                <Lock className="h-12 w-12 md:h-16 md:w-16 mb-4 md:mb-6 mx-auto text-gray-400" />
                            ) : (
                                <div className="transform group-hover:scale-110 transition-transform duration-700">
                                    <Trophy className="h-12 w-12 md:h-16 md:w-16 mb-4 md:mb-6 mx-auto animate-float animation-delay-200" />
                                </div>
                            )}

                            <h2 className={`text-2xl md:text-3xl font-bold mb-3 md:mb-4 text-center transition-colors duration-500 ${isCoach ? 'text-gray-400' : 'group-hover:text-green-200'}`}>
                                Trở Thành Chủ Sở Hữu Sân
                            </h2>

                            <p className="text-sm md:text-base text-center mb-6 max-w-xs opacity-90 transition-opacity">
                                {isCoach
                                    ? "Bạn đã là huấn luyện viên. Không thể đăng ký thêm vai trò này."
                                    : "Đưa sân thể thao của bạn lên nền tảng SportZone."}
                            </p>

                            {isCoach ? (
                                <Button disabled className="bg-gray-600 text-gray-300 px-6 py-2 md:px-8 md:py-3 text-sm md:text-base font-semibold cursor-not-allowed">
                                    Không Khả Dụng
                                </Button>
                            ) : (
                                <Link to="/become-field-owner" onClick={() => onOpenChange(false)}>
                                    <Button className="bg-white text-green-700 hover:bg-green-50 px-6 py-2 md:px-8 md:py-3 text-sm md:text-base font-semibold transform group-hover:scale-110 transition-all duration-500 shadow-2xl">
                                        Đăng Ký Ngay
                                    </Button>
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog >
    );
};
