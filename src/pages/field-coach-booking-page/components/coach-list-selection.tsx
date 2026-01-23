import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hook";
import { getCoaches } from "@/features/coach/coachThunk";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Star, DollarSign, Search, Filter, X, Trophy } from "lucide-react";
import { Loading } from "@/components/ui/loading";
import { SPORT_TYPE_OPTIONS, DISTRICT_OPTIONS } from "@/utils/constant-value/constant";

interface CoachListSelectionProps {
    onSelect: (coachId: string, coachName: string, coachPrice: number) => void;
    onBack: () => void;
    initialSportFilter?: string;
    // Availability filtering props
    selectedDate?: string;
    selectedStartTime?: string;
    selectedEndTime?: string;
}

export const CoachListSelection = ({ onSelect, onBack, initialSportFilter, selectedDate, selectedStartTime, selectedEndTime }: CoachListSelectionProps) => {
    const dispatch = useAppDispatch();
    const { coaches, loading, error } = useAppSelector((state) => state.coach);

    // Filter states
    const [searchName, setSearchName] = useState("");
    const [sportFilter, setSportFilter] = useState(initialSportFilter || "all");
    const [districtFilter, setDistrictFilter] = useState("all");
    const [ratingFilter, setRatingFilter] = useState<number | null>(null);

    useEffect(() => {
        const filters: any = {};
        if (searchName.trim()) filters.name = searchName.trim();
        if (sportFilter && sportFilter !== "all") filters.sportType = sportFilter;
        if (districtFilter && districtFilter !== "all") filters.district = districtFilter;

        // Add availability filtering if date/time provided
        if (selectedDate) filters.date = selectedDate;
        if (selectedStartTime) filters.startTime = selectedStartTime;
        if (selectedEndTime) filters.endTime = selectedEndTime;

        dispatch(getCoaches(Object.keys(filters).length > 0 ? filters : undefined));
    }, [dispatch, searchName, sportFilter, districtFilter, selectedDate, selectedStartTime, selectedEndTime]);

    // Client-side filtering for rating
    const filteredCoaches = coaches?.filter(coach => {
        if (ratingFilter && coach.rating < ratingFilter) return false;
        return true;
    });

    const formatVND = (value: number): string => {
        try {
            return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
        } catch {
            return `${value.toLocaleString('vi-VN')} ₫`;
        }
    };

    const clearFilters = () => {
        setSearchName("");
        setDistrictFilter("all");
        setRatingFilter(null);
    };

    if (loading && !coaches.length) {
        return (
            <div className="w-full max-w-[1320px] mx-auto px-3 py-10">
                <div className="flex items-center justify-center py-20">
                    <div className="text-center">
                        <Loading size={48} className="mx-auto mb-4" />
                        <p className="text-muted-foreground">Đang tải danh sách huấn luyện viên...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-[1320px] mx-auto px-3 py-10">
            {/* Header */}
            <div className="text-center mb-10">
                <h1 className="text-3xl font-semibold text-[#1a1a1a] mb-2">
                    Chọn huấn luyện viên
                </h1>
                <p className="text-base text-gray-600">
                    Chọn một huấn luyện viên để tiếp tục đặt lịch
                </p>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
                {/* Sidebar filters */}
                <div className="lg:w-1/3 xl:w-1/4">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sticky top-24">
                        <div className="mb-4">
                            <p className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                                <Filter className="w-4 h-4 text-emerald-600" />
                                Bộ lọc tìm kiếm
                            </p>
                        </div>

                        <div className="space-y-4">
                            {/* Search Input */}
                            <div>
                                <p className="text-xs font-medium text-gray-500 mb-1 text-start">Tìm theo tên HLV</p>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <Input
                                        className="pl-10 h-10"
                                        placeholder="Nhập tên HLV..."
                                        value={searchName}
                                        onChange={(e) => setSearchName(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Sport Type Filter */}
                            <div>
                                <p className="text-xs font-medium text-gray-500 mb-1 text-start">Loại thể thao</p>
                                <div className="flex items-center gap-2">
                                    <Trophy className="w-4 h-4 text-gray-500" />
                                    <div className="flex h-10 w-full items-center rounded-md border border-input bg-gray-100 px-3 py-2 text-sm text-gray-500 cursor-default">
                                        {SPORT_TYPE_OPTIONS.find(o => o.value === sportFilter)?.label || "Tất cả môn"}
                                    </div>
                                </div>
                            </div>

                            {/* District Filter */}
                            <div>
                                <p className="text-xs font-medium text-gray-500 mb-1 text-start">Quận huyện</p>
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-gray-500" />
                                    <Select value={districtFilter} onValueChange={setDistrictFilter}>
                                        <SelectTrigger className="h-10">
                                            <SelectValue placeholder="Tất cả quận" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Tất cả quận</SelectItem>
                                            {DISTRICT_OPTIONS.map((district) => (
                                                <SelectItem key={district} value={district}>
                                                    {district}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Rating Filter */}
                            <div>
                                <p className="text-xs font-medium text-gray-500 mb-1 text-start">Đánh giá sao</p>
                                <div className="flex items-center gap-2">
                                    <Star className="w-4 h-4 text-yellow-500" />
                                    <Select
                                        value={ratingFilter?.toString() || "all"}
                                        onValueChange={(val) => setRatingFilter(val === "all" ? null : Number(val))}
                                    >
                                        <SelectTrigger className="h-10">
                                            <SelectValue placeholder="Tất cả đánh giá" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Tất cả đánh giá</SelectItem>
                                            <SelectItem value="5">5 sao</SelectItem>
                                            <SelectItem value="4">Từ 4 sao trở lên</SelectItem>
                                            <SelectItem value="3">Từ 3 sao trở lên</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Clear Filters */}
                            {(searchName || districtFilter !== "all" || ratingFilter !== null) && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={clearFilters}
                                    className="h-9 w-full justify-center gap-2 mt-2"
                                >
                                    <X className="w-4 h-4" />
                                    Xóa tất cả bộ lọc
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Main content: Grid */}
                <div className="flex-1">
                    {error && (
                        <div className="mb-6 rounded-md border border-red-200 bg-red-50 px-4 py-3">
                            <p className="text-sm text-red-700">Lỗi: {error.message || "Không thể tải danh sách HLV"}</p>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                        {filteredCoaches && filteredCoaches.length > 0 ? (
                            filteredCoaches.map((coach) => (
                                <Card
                                    key={coach.id}
                                    className="border border-gray-200 hover:shadow-lg transition-all duration-300 cursor-pointer group"
                                    onClick={() => onSelect(coach.id, coach.fullName, coach.hourlyRate)}
                                >
                                    <CardContent className="p-6">
                                        <div className="flex gap-4">
                                            {coach.avatarUrl ? (
                                                <img
                                                    src={coach.avatarUrl}
                                                    alt={coach.fullName}
                                                    className="w-16 h-16 rounded-full object-cover border-2 border-emerald-100"
                                                    onError={(e) => {
                                                        const target = e.target as HTMLImageElement;
                                                        target.onerror = null; // Prevent infinite loop
                                                        target.src = "https://github.com/shadcn.png"; // Fallback image
                                                    }}
                                                />
                                            ) : (
                                                <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center border-2 border-emerald-100">
                                                    <span className="text-xl font-bold text-slate-500">
                                                        {coach.fullName.charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                            )}
                                            <div className="flex-1">
                                                <h3 className="text-lg font-semibold text-[#1a1a1a] mb-1 group-hover:text-emerald-600 transition-colors">
                                                    {coach.fullName}
                                                </h3>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                                    <span className="font-semibold text-sm">
                                                        {coach.rating.toFixed(1)}
                                                    </span>
                                                    <span className="text-xs text-gray-500">
                                                        ({coach.totalReviews} đánh giá)
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-4 space-y-2">
                                            {coach.sports && (
                                                <div className="flex flex-wrap gap-1">
                                                    {(Array.isArray(coach.sports)
                                                        ? coach.sports
                                                        : typeof coach.sports === 'string'
                                                            ? coach.sports.split(',').map(s => s.trim()).filter(Boolean)
                                                            : []
                                                    ).map(sport => (
                                                        <span key={sport} className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full text-[10px] uppercase font-bold">
                                                            {SPORT_TYPE_OPTIONS.find(o => o.value === sport)?.label || sport}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}

                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <DollarSign className="w-4 h-4 text-emerald-600" />
                                                <span className="font-semibold text-emerald-600">
                                                    {formatVND(coach.hourlyRate)}
                                                </span>
                                                <span className="text-xs">/giờ</span>
                                            </div>
                                        </div>

                                        <Button
                                            className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700 text-white"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onSelect(coach.id, coach.fullName, coach.hourlyRate);
                                            }}
                                        >
                                            Chọn HLV này
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))
                        ) : (
                            <div className="col-span-full text-center py-20 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                                <p className="text-gray-500">Không tìm thấy huấn luyện viên nào phù hợp</p>
                                <Button variant="outline" className="mt-4" onClick={clearFilters}>
                                    Xóa bộ lọc
                                </Button>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-center">
                        <Button
                            variant="outline"
                            onClick={onBack}
                            className="px-8 py-3"
                        >
                            Quay lại
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};
