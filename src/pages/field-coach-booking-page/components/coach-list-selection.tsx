import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hook";
import { getAllCoaches } from "@/features/coach/coachThunk";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Star, DollarSign } from "lucide-react";

interface CoachListSelectionProps {
    onSelect: (coachId: string, coachName: string, coachPrice: number) => void;
    onBack: () => void;
}

export const CoachListSelection = ({ onSelect, onBack }: CoachListSelectionProps) => {
    const dispatch = useAppDispatch();
    const { coaches, loading, error } = useAppSelector((state) => state.coach);

    useEffect(() => {
        dispatch(getAllCoaches());
    }, [dispatch]);

    const formatVND = (value: number): string => {
        try {
            return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
        } catch {
            return `${value.toLocaleString('vi-VN')} ₫`;
        }
    };

    if (loading) {
        return (
            <div className="w-full max-w-[1320px] mx-auto px-3 py-10">
                <div className="flex items-center justify-center py-20">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
                        <p className="text-muted-foreground font-['Outfit']">Đang tải danh sách huấn luyện viên...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full max-w-[1320px] mx-auto px-3 py-10">
                <div className="text-center py-20">
                    <p className="text-red-600 font-['Outfit']">Lỗi</p>
                    <Button onClick={() => dispatch(getAllCoaches())} className="mt-4">
                        Thử lại
                    </Button>
                </div>  
            </div>
        );
    }

    return (
        <div className="w-full max-w-[1320px] mx-auto px-3 py-10">
            {/* Header */}
            <div className="text-center mb-10">
                <h1 className="text-3xl font-semibold font-['Outfit'] text-[#1a1a1a] mb-2">
                    Chọn huấn luyện viên
                </h1>
                <p className="text-base text-gray-600 font-['Outfit']">
                    Chọn một huấn luyện viên để tiếp tục đặt lịch
                </p>
            </div>

            {/* Coaches Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                {coaches && coaches.length > 0 ? (
                    coaches.map((coach) => (
                        <Card
                            key={coach.id}
                            className="border border-gray-200 hover:shadow-lg transition-all duration-300 cursor-pointer group"
                            onClick={() => onSelect(coach.id, coach.fullName, coach.price)}
                        >
                            <CardContent className="p-6">
                                {/* Coach Name */}
                                <h3 className="text-xl font-semibold font-['Outfit'] text-[#1a1a1a] mb-2 group-hover:text-emerald-600 transition-colors">
                                    {coach.fullName}
                                </h3>

                                {/* Location */}
                                {coach.location && (
                                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                                        <MapPin className="w-4 h-4" />
                                        <span className="font-['Outfit']">{coach.location}</span>
                                    </div>
                                )}

                                {/* Description */}
                                {coach.location && (
                                    <p className="text-sm text-gray-600 font-['Outfit'] mb-4 line-clamp-2">
                                        {coach.location}
                                    </p>
                                )}

                                {/* Rating */}
                                <div className="flex items-center gap-2 mb-4">
                                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                    <span className="font-semibold font-['Outfit'] text-sm">
                                        {coach.rating.toFixed(1)}
                                    </span>
                                    <span className="text-sm text-gray-500 font-['Outfit']">
                                        ({coach.totalReviews} đánh giá)
                                    </span>
                                </div>

                                {/* Price */}
                                <div className="flex items-center gap-2 mb-4">
                                    <DollarSign className="w-5 h-5 text-emerald-600" />
                                    <span className="text-lg font-semibold text-emerald-600 font-['Outfit']">
                                        {formatVND(coach.price)}
                                    </span>
                                    <span className="text-sm text-gray-500 font-['Outfit']">/giờ</span>
                                </div>

                                {/* Next Availability */}
                                {coach.nextAvailability && (
                                    <p className="text-xs text-gray-500 font-['Outfit'] mb-4">
                                        Khả dụng: {new Date(coach.nextAvailability).toLocaleDateString('vi-VN')}
                                    </p>
                                )}

                                {/* Select Button */}
                                <Button
                                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-['Outfit']"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onSelect(coach.id, coach.fullName, coach.price);
                                    }}
                                >
                                    Chọn HLV này
                                </Button>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <div className="col-span-full text-center py-20">
                        <p className="text-gray-500 font-['Outfit']">Không có huấn luyện viên nào</p>
                    </div>
                )}
            </div>

            {/* Back Button */}
            <div className="flex justify-center">
                <Button
                    variant="outline"
                    onClick={onBack}
                    className="px-8 py-3 font-['Outfit']"
                >
                    Quay lại
                </Button>
            </div>
        </div>
    );
};
