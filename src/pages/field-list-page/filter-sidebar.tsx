import React, { useState } from "react";
import { Filter, X, Search, DollarSign, Star, Calendar, CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AMENITY_OPTIONS, RATING_OPTIONS, WEEKDAY_OPTIONS } from "@/utils/constant-value/constant";

interface FilterSidebarProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    /** side to open the sheet from: 'left' | 'right' */
    side?: "left" | "right";
    // Search
    searchQuery: string;
    onSearchChange: (value: string) => void;
    // Location
    locationFilter: string;
    onLocationChange: (value: string) => void;
    // Price Range
    minPrice: number | null;
    maxPrice: number | null;
    onPriceRangeChange: (min: number | null, max: number | null) => void;
    // Reviews
    minRating: number | null;
    onRatingChange: (value: number | null) => void;
    // Availability
    timeFilter: string;
    onTimeFilterChange: (value: string) => void;
    // Amenities
    selectedAmenities: string[];
    onAmenitiesChange: (amenities: string[]) => void;
    // Actions
    hasActiveFilters: boolean;
    onResetFilters: () => void;
    onSearch: () => void;
}

const CollapsibleSection: React.FC<{
    title: string;
    icon: React.ReactNode;
    defaultOpen?: boolean;
    children: React.ReactNode;
}> = ({ title, icon, defaultOpen = false, children }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="border-b border-gray-200">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between py-4 hover:bg-gray-50 transition-colors"
            >
                <div className="flex items-center gap-3">
                    {icon}
                    <span className="text-sm font-medium text-gray-900">{title}</span>
                </div>
                {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-gray-500" />
                ) : (
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                )}
            </button>
            {isOpen && <div className="pb-4">{children}</div>}
        </div>
    );
};

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
    isOpen,
    onOpenChange,
    side = "right",
    searchQuery,
    onSearchChange,
    locationFilter,
    onLocationChange,
    minPrice,
    maxPrice,
    onPriceRangeChange,
    minRating,
    onRatingChange,
    timeFilter,
    onTimeFilterChange,
    selectedAmenities,
    onAmenitiesChange,
    hasActiveFilters,
    onResetFilters,
    onSearch,
}) => {
    // Location filters moved to main search bar; keep props for interface compatibility
    void locationFilter;
    void onLocationChange;

    const amenitiesOptions = AMENITY_OPTIONS;

    const handleAmenityToggle = (amenity: string) => {
        if (selectedAmenities.includes(amenity)) {
            onAmenitiesChange(selectedAmenities.filter((a) => a !== amenity));
        } else {
            onAmenitiesChange([...selectedAmenities, amenity]);
        }
    };

    return (
        <Sheet open={isOpen} onOpenChange={onOpenChange}>
            <SheetContent side={side} className="w-[400px] sm:w-[450px] p-0 overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 z-10 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Filter className="w-5 h-5 text-gray-700" />
                        <h2 className="text-lg font-bold text-gray-900">Bộ lọc</h2>
                    </div>
                    <button
                        onClick={() => onOpenChange(false)}
                        className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <div className="px-6 py-4">
                    {/* Advanced Search Header */}
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-base font-semibold">
                            <span className="text-green-600">Tìm kiếm</span>{" "}
                            <span className="text-gray-900">nâng cao</span>
                        </h3>
                        {hasActiveFilters && (
                            <button
                                onClick={onResetFilters}
                                className="text-sm text-red-600 hover:text-red-700 font-medium"
                            >
                                Xóa tất cả
                            </button>
                        )}
                    </div>

                    {/* Search Input */}
                    <div className="mb-6">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                                type="text"
                                placeholder="Bạn đang tìm gì?"
                                value={searchQuery}
                                onChange={(e) => onSearchChange(e.target.value)}
                                className="pl-10 h-11 border-gray-300 focus:border-green-500 focus:ring-green-500"
                            />
                        </div>
                    </div>

                    {/* Filter Sections */}
                    <div className="space-y-0">
                        {/* Price Range */}
                        <CollapsibleSection
                            title="Khoảng giá"
                            icon={<DollarSign className="w-4 h-4 text-gray-600" />}
                        >
                            <div className="space-y-3">
                                <div>
                                    <label className="text-xs text-gray-600 mb-1 block">Giá tối thiểu (VNĐ)</label>
                                    <Input
                                        type="number"
                                        placeholder="0"
                                        value={minPrice || ""}
                                        onChange={(e) =>
                                            onPriceRangeChange(
                                                e.target.value ? Number(e.target.value) : null,
                                                maxPrice
                                            )
                                        }
                                        className="w-full h-10 border-gray-300"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-600 mb-1 block">Giá tối đa (VNĐ)</label>
                                    <Input
                                        type="number"
                                        placeholder="Không giới hạn"
                                        value={maxPrice || ""}
                                        onChange={(e) =>
                                            onPriceRangeChange(
                                                minPrice,
                                                e.target.value ? Number(e.target.value) : null
                                            )
                                        }
                                        className="w-full h-10 border-gray-300"
                                    />
                                </div>
                            </div>
                        </CollapsibleSection>

                        {/* Reviews */}
                        <CollapsibleSection
                            title="Đánh giá"
                            icon={<Star className="w-4 h-4 text-gray-600" />}
                        >
                            <Select
                                value={minRating?.toString() || "0"}
                                onValueChange={(value) => onRatingChange(value === "0" ? null : Number(value))}
                            >
                                <SelectTrigger className="w-full h-10 border-gray-300">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {RATING_OPTIONS.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </CollapsibleSection>

                        {/* Availability */}
                        <CollapsibleSection
                            title="Tình trạng"
                            icon={<Calendar className="w-4 h-4 text-gray-600" />}
                            defaultOpen={true}
                        >
                            <Select value={timeFilter} onValueChange={onTimeFilterChange}>
                                <SelectTrigger className="w-full h-10 border-gray-300">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {WEEKDAY_OPTIONS.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </CollapsibleSection>

                        {/* Amenities */}
                        <CollapsibleSection
                            title="Tiện ích"
                            icon={<CheckCircle2 className="w-4 h-4 text-gray-600" />}
                        >
                            <div className="space-y-2">
                                {amenitiesOptions.map((amenity) => (
                                    <label
                                        key={amenity}
                                        className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedAmenities.includes(amenity)}
                                            onChange={() => handleAmenityToggle(amenity)}
                                            className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                                        />
                                        <span className="text-sm text-gray-700">{amenity}</span>
                                    </label>
                                ))}
                            </div>
                        </CollapsibleSection>
                    </div>

                    {/* Search Button */}
                    <div className="sticky bottom-0 bg-white pt-6 pb-4 border-t border-gray-200 mt-6">
                        <Button
                            onClick={onSearch}
                            className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-semibold text-base"
                        >
                            <Search className="w-5 h-5 mr-2" />
                            Tìm kiếm ngay
                        </Button>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
};
