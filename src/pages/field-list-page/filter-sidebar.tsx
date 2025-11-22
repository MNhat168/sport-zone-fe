import React from "react";
import { Filter } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface FilterSidebarProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    timeFilter: string;
    onTimeFilterChange: (value: string) => void;
    priceSort: string;
    onPriceSortChange: (value: string) => void;
    hasActiveFilters: boolean;
    onResetFilters: () => void;
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
    isOpen,
    onOpenChange,
    timeFilter,
    onTimeFilterChange,
    priceSort,
    onPriceSortChange,
    hasActiveFilters,
    onResetFilters,
}) => {
    return (
        <Sheet open={isOpen} onOpenChange={onOpenChange}>
            <SheetContent side="right" className="w-[320px] sm:w-[400px]">
                <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                        <Filter className="w-5 h-5" />
                        Bộ lọc nâng cao
                    </SheetTitle>
                </SheetHeader>
                <div className="mt-6 space-y-6">
                    <div className="space-y-3">
                        <label className="text-sm font-medium text-gray-700">Ngày trong tuần</label>
                        <Select value={timeFilter} onValueChange={onTimeFilterChange}>
                            <SelectTrigger>
                                <SelectValue placeholder="Chọn ngày" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="any">Bất kỳ</SelectItem>
                                <SelectItem value="mon">Thứ 2</SelectItem>
                                <SelectItem value="tue">Thứ 3</SelectItem>
                                <SelectItem value="wed">Thứ 4</SelectItem>
                                <SelectItem value="thu">Thứ 5</SelectItem>
                                <SelectItem value="fri">Thứ 6</SelectItem>
                                <SelectItem value="sat">Thứ 7</SelectItem>
                                <SelectItem value="sun">Chủ nhật</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-3">
                        <label className="text-sm font-medium text-gray-700">Sắp xếp theo giá</label>
                        <Select value={priceSort || undefined} onValueChange={(value) => onPriceSortChange(value === 'none' ? '' : value)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Chọn cách sắp xếp" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">Không sắp xếp</SelectItem>
                                <SelectItem value="asc">Giá: thấp → cao</SelectItem>
                                <SelectItem value="desc">Giá: cao → thấp</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {hasActiveFilters && (
                        <div className="pt-4 border-t">
                            <Button
                                onClick={onResetFilters}
                                variant="outline"
                                className="w-full"
                            >
                                Đặt lại tất cả
                            </Button>
                        </div>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
};

