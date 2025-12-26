import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hook";
import { getAllFieldsPaginated } from "@/features/field/fieldThunk";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Star, DollarSign, Search, ChevronLeft, ChevronRight, Trophy, Filter, X, Calendar } from "lucide-react";
import { Loading } from "@/components/ui/loading";
import { VIETNAM_CITIES, SPORT_TYPE_OPTIONS, PRICE_SORT_OPTIONS, RATING_OPTIONS, WEEKDAY_OPTIONS, AMENITY_OPTIONS } from "@/utils/constant-value/constant";

interface FieldListSelectionProps {
    onSelect: (fieldId: string, fieldName: string, fieldLocation: string, fieldPrice: number) => void;
}

const ITEMS_PER_PAGE = 10;

export const FieldListSelection = ({ onSelect }: FieldListSelectionProps) => {
    const dispatch = useAppDispatch();
    const { fields, loading, error, pagination } = useAppSelector((state) => state.field);

    // Filter states (basic)
    const [searchName, setSearchName] = useState("");
    const [locationFilter, setLocationFilter] = useState("");
    const [sportFilter, setSportFilter] = useState("all");
    const [priceSort, setPriceSort] = useState("");

    // Advanced filter states (tương tự filter-sidebar)
    const [minPrice, setMinPrice] = useState<number | null>(null);
    const [maxPrice, setMaxPrice] = useState<number | null>(null);
    const [minRating, setMinRating] = useState<number | null>(null);
    const [timeFilter, setTimeFilter] = useState<string>("any");
    const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

    const [currentPage, setCurrentPage] = useState(1);

    // Fetch fields with filters and pagination
    useEffect(() => {
        const params: any = {
            page: currentPage,
            limit: ITEMS_PER_PAGE,
        };
        if (searchName.trim()) params.name = searchName.trim();
        if (locationFilter) params.location = locationFilter;
        if (sportFilter && sportFilter !== "all") params.sportType = sportFilter;
        if (priceSort && priceSort !== "none") {
            params.sortBy = "price";
            params.sortOrder = priceSort;
        }
        // Advanced filters -> gắn vào query nếu có (backend có thể ignore nếu chưa hỗ trợ)
        if (minPrice !== null) params.minPrice = minPrice;
        if (maxPrice !== null) params.maxPrice = maxPrice;
        if (minRating !== null) params.minRating = minRating;
        if (timeFilter && timeFilter !== "any") params.timeFilter = timeFilter;
        if (selectedAmenities.length > 0) params.amenities = selectedAmenities.join(",");
        dispatch(getAllFieldsPaginated(params));
    }, [dispatch, currentPage, searchName, locationFilter, sportFilter, priceSort, minPrice, maxPrice, minRating, timeFilter, selectedAmenities]);

    const formatVND = (value: number): string => {
        try {
            return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
        } catch {
            return `${value.toLocaleString('vi-VN')} ₫`;
        }
    };

    const getLocationString = (location: any): string => {
        if (!location) return '';
        if (typeof location === 'string') return location;
        if (typeof location === 'object' && location.address) return location.address;
        return '';
    };

    const clearFilters = () => {
        setSearchName("");
        setLocationFilter("");
        setSportFilter("all");
        setPriceSort("");
        setMinPrice(null);
        setMaxPrice(null);
        setMinRating(null);
        setTimeFilter("any");
        setSelectedAmenities([]);
        setCurrentPage(1);
    };

    const totalPages = pagination?.totalPages || Math.ceil((fields?.length || 0) / ITEMS_PER_PAGE);

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    return (
        <div className="w-full max-w-[1320px] mx-auto px-3 py-10">
            {/* Header */}
            <div className="text-center mb-8">
                <h1 className="text-3xl font-semibold text-[#1a1a1a] mb-2">
                    Chọn sân thể thao
                </h1>
                <p className="text-base text-gray-600">
                    Chọn một sân để bắt đầu đặt lịch sân + HLV
                </p>
            </div>

            {/* Layout: Sidebar (bộ lọc) + Grid (danh sách sân) */}
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
                                <p className="text-xs font-medium text-gray-500 mb-1 text-start">Tìm theo tên sân</p>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <Input
                                        className="pl-10 h-10"
                                        placeholder="Nhập tên sân..."
                                        value={searchName}
                                        onChange={(e) => {
                                            setSearchName(e.target.value);
                                            setCurrentPage(1);
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Location Filter */}
                            <div>
                                <p className="text-xs font-medium text-gray-500 mb-1 text-start">Khu vực</p>
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-gray-500" />
                                    <Select
                                        value={locationFilter || "all"}
                                        onValueChange={(value) => {
                                            setLocationFilter(value === "all" ? "" : value);
                                            setCurrentPage(1);
                                        }}
                                    >
                                        <SelectTrigger className="h-10">
                                            <SelectValue placeholder="Khu vực" />
                                        </SelectTrigger>
                                        <SelectContent className="max-h-[300px] overflow-y-auto">
                                            <SelectItem value="all">Tất cả khu vực</SelectItem>
                                            {VIETNAM_CITIES.map((city) => (
                                                <SelectItem key={city} value={city}>
                                                    {city}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Sport Type Filter */}
                            <div>
                                <p className="text-xs font-medium text-gray-500 mb-1 text-start">Loại thể thao</p>
                                <div className="flex items-center gap-2">
                                    <Trophy className="w-4 h-4 text-gray-500" />
                                    <Select
                                        value={sportFilter}
                                        onValueChange={(value) => {
                                            setSportFilter(value);
                                            setCurrentPage(1);
                                        }}
                                    >
                                        <SelectTrigger className="h-10">
                                            <SelectValue placeholder="Loại thể thao" />
                                        </SelectTrigger>
                                        <SelectContent className="max-h-[300px] overflow-y-auto">
                                            {SPORT_TYPE_OPTIONS.map((option) => (
                                                <SelectItem key={option.value} value={option.value}>
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Price Sort */}
                            <div>
                                <p className="text-xs font-medium text-gray-500 mb-1 text-start">Giá theo giờ</p>
                                <div className="flex items-center gap-2">
                                    <DollarSign className="w-4 h-4 text-gray-500" />
                                    <Select
                                        value={priceSort || "none"}
                                        onValueChange={(value) => {
                                            setPriceSort(value === "none" ? "" : value);
                                            setCurrentPage(1);
                                        }}
                                    >
                                        <SelectTrigger className="h-10">
                                            <SelectValue placeholder="Sắp xếp giá" />
                                        </SelectTrigger>
                                        <SelectContent className="max-h-[300px] overflow-y-auto">
                                            {PRICE_SORT_OPTIONS.map((option) => (
                                                <SelectItem key={option.value} value={option.value}>
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Price Range (từ filter-sidebar) */}
                            <div>
                                <p className="text-xs font-medium text-gray-500 mb-1 text-start">Khoảng giá (VNĐ)</p>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <p className="text-[11px] text-gray-500 mb-1 text-start">Tối thiểu</p>
                                        <Input
                                            type="number"
                                            min={0}
                                            placeholder="0"
                                            value={minPrice ?? ""}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                setMinPrice(value ? Number(value) : null);
                                                setCurrentPage(1);
                                            }}
                                            className="h-9"
                                        />
                                    </div>
                                    <div>
                                        <p className="text-[11px] text-gray-500 mb-1 text-start">Tối đa</p>
                                        <Input
                                            type="number"
                                            min={0}
                                            placeholder="Không giới hạn"
                                            value={maxPrice ?? ""}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                setMaxPrice(value ? Number(value) : null);
                                                setCurrentPage(1);
                                            }}
                                            className="h-9"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Rating filter */}
                            <div>
                                <p className="text-xs font-medium text-gray-500 mb-1 text-start">Đánh giá</p>
                                <div className="flex items-center gap-2">
                                    <Star className="w-4 h-4 text-yellow-500" />
                                    <Select
                                        value={minRating?.toString() || "0"}
                                        onValueChange={(value) => {
                                            setMinRating(value === "0" ? null : Number(value));
                                            setCurrentPage(1);
                                        }}
                                    >
                                        <SelectTrigger className="h-10">
                                            <SelectValue placeholder="Tất cả" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {RATING_OPTIONS.map((option) => (
                                                <SelectItem key={option.value} value={option.value}>
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Availability filter */}
                            <div>
                                <p className="text-xs font-medium text-gray-500 mb-1 text-start">Tình trạng</p>
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-gray-500" />
                                    <Select
                                        value={timeFilter}
                                        onValueChange={(value) => {
                                            setTimeFilter(value);
                                            setCurrentPage(1);
                                        }}
                                    >
                                        <SelectTrigger className="h-10">
                                            <SelectValue placeholder="Bất kỳ" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {WEEKDAY_OPTIONS.map((option) => (
                                                <SelectItem key={option.value} value={option.value}>
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Amenities filter */}
                            <div>
                                <p className="text-xs font-medium text-gray-500 mb-1 text-start">Tiện ích</p>
                                <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
                                    {AMENITY_OPTIONS.map((amenity) => (
                                        <label
                                            key={amenity}
                                            className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 px-1 py-1 rounded"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selectedAmenities.includes(amenity)}
                                                onChange={() => {
                                                    setSelectedAmenities((prev) =>
                                                        prev.includes(amenity)
                                                            ? prev.filter((a) => a !== amenity)
                                                            : [...prev, amenity]
                                                    );
                                                    setCurrentPage(1);
                                                }}
                                                className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                                            />
                                            <span className="text-xs text-gray-700">{amenity}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Clear Filters */}
                            {(searchName ||
                                locationFilter ||
                                sportFilter !== "all" ||
                                priceSort ||
                                minPrice !== null ||
                                maxPrice !== null ||
                                minRating !== null ||
                                timeFilter !== "any" ||
                                selectedAmenities.length > 0) && (
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

                {/* Main content: grid + pagination */}
                <div className="flex-1">
                    {/* Error banner (không reload cả trang) */}
                    {error && (
                        <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3">
                            <p className="text-sm text-red-700">
                                Lỗi: {typeof error === "string" ? error : "Không thể tải danh sách sân"}
                            </p>
                            <Button
                                variant="outline"
                                size="sm"
                                className="mt-2 h-8 text-xs"
                                onClick={() => dispatch(getAllFieldsPaginated({ page: 1, limit: ITEMS_PER_PAGE }))}
                            >
                                Thử lại
                            </Button>
                        </div>
                    )}

                    {/* Results Count */}
                    <div className="flex justify-between items-center mb-4">
                        <p className="text-sm text-gray-600">
                            Tìm thấy <span className="font-semibold">{pagination?.total || fields?.length || 0}</span> sân
                        </p>
                    </div>

                    {/* Fields Grid: 2 sân / dòng trên màn hình rộng */}
                    <div className="min-h-[200px]">
                        {loading ? (
                            <div className="flex items-center justify-center py-20">
                                <div className="text-center">
                                    <Loading size={48} className="mx-auto mb-4" />
                                    <p className="text-muted-foreground">
                                        Đang tải danh sách sân...
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                {fields && fields.length > 0 ? (
                                    fields.map((field) => (
                                        <Card
                                            key={field.id}
                                            className="border border-gray-200 hover:shadow-lg transition-all duration-300 cursor-pointer group"
                                            onClick={() =>
                                                onSelect(
                                                    field.id,
                                                    field.name,
                                                    getLocationString(field.location),
                                                    field.basePrice || 0
                                                )
                                            }
                                        >
                                            <CardContent className="p-0">
                                                {/* Field Image */}
                                                {field.images && field.images.length > 0 && (
                                                    <div className="relative h-48 w-full overflow-hidden rounded-t-lg">
                                                        <img
                                                            src={field.images[0]}
                                                            alt={field.name}
                                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                                        />
                                                    </div>
                                                )}

                                                <div className="p-6">
                                                    {/* Field Name */}
                                                    <h3 className="text-xl font-semibold text-[#1a1a1a] mb-2 group-hover:text-emerald-600 transition-colors">
                                                        {field.name}
                                                    </h3>

                                                    {/* Location */}
                                                    {getLocationString(field.location) && (
                                                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                                                            <MapPin className="w-4 h-4" />
                                                            <span className="truncate">
                                                                {getLocationString(field.location)}
                                                            </span>
                                                        </div>
                                                    )}

                                                    {/* Description */}
                                                    {field.description && (
                                                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                                                            {field.description}
                                                        </p>
                                                    )}

                                                    {/* Rating */}
                                                    {field.rating !== undefined && (
                                                        <div className="flex items-center gap-2 mb-4">
                                                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                                            <span className="font-semibold text-sm">
                                                                {field.rating.toFixed(1)}
                                                            </span>
                                                            {field.totalReviews !== undefined && (
                                                                <span className="text-sm text-gray-500">
                                                                    ({field.totalReviews} đánh giá)
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}

                                                    {/* Price */}
                                                    {field.basePrice && (
                                                        <div className="flex items-center gap-2 mb-4">
                                                            <DollarSign className="w-5 h-5 text-emerald-600" />
                                                            <span className="text-lg font-semibold text-emerald-600">
                                                                {formatVND(field.basePrice)}
                                                            </span>
                                                            <span className="text-sm text-gray-500">
                                                                /giờ
                                                            </span>
                                                        </div>
                                                    )}

                                                    {/* Select Button */}
                                                    <Button
                                                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onSelect(
                                                                field.id,
                                                                field.name,
                                                                getLocationString(field.location),
                                                                field.basePrice || 0
                                                            );
                                                        }}
                                                    >
                                                        Chọn sân này
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))
                                ) : (
                                    <div className="col-span-full text-center py-20">
                                        <p className="text-gray-500">
                                            Không tìm thấy sân nào phù hợp
                                        </p>
                                        <Button variant="outline" className="mt-4" onClick={clearFilters}>
                                            Xóa bộ lọc
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="h-10 px-3"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </Button>

                            {/* Page Numbers */}
                            {Array.from({ length: totalPages }, (_, i) => i + 1)
                                .filter(page =>
                                    page === 1 ||
                                    page === totalPages ||
                                    (page >= currentPage - 1 && page <= currentPage + 1)
                                )
                                .map((page, index, array) => (
                                    <>
                                        {index > 0 && array[index - 1] !== page - 1 && (
                                            <span key={`ellipsis-${page}`} className="px-2 text-gray-400">...</span>
                                        )}
                                        <Button
                                            key={page}
                                            variant={currentPage === page ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => handlePageChange(page)}
                                            className={`h-10 w-10 ${currentPage === page ? 'bg-emerald-600 hover:bg-emerald-700' : ''}`}
                                        >
                                            {page}
                                        </Button>
                                    </>
                                ))
                            }

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="h-10 px-3"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
