import React from "react";
import { Filter, Calendar, RotateCcw } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface FilterSidebarProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    timeFilter: string;
    onTimeFilterChange: (value: string) => void;
    hasActiveFilters: boolean;
    onResetFilters: () => void;
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
    isOpen,
    onOpenChange,
    timeFilter,
    onTimeFilterChange,
    hasActiveFilters,
    onResetFilters,
}) => {
    return (
        <Sheet open={isOpen} onOpenChange={onOpenChange}>
            <SheetContent side="right" className="w-[320px] sm:w-[400px] bg-background-secondary">
                <SheetHeader className="border-b border-border pb-4">
                    <SheetTitle className="flex items-center gap-2.5 text-lg">
                        <div className="p-2 rounded-lg bg-primary/10">
                            <Filter className="w-5 h-5 text-primary" />
                        </div>
                        <span className="font-semibold text-foreground">Bộ lọc nâng cao</span>
                    </SheetTitle>
                </SheetHeader>
                
                <div className="mt-6 space-y-5 overflow-y-auto flex-1">
                    {/* Ngày trong tuần Section */}
                    <div className="bg-white rounded-xl border border-border shadow-sm p-5 space-y-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-2.5">
                            <div className="p-2 rounded-lg bg-blue-50 border border-blue-100">
                                <Calendar className="w-4 h-4 text-blue-600" />
                            </div>
                            <label className="text-sm font-semibold text-foreground">Ngày trong tuần</label>
                        </div>
                        <Select value={timeFilter} onValueChange={onTimeFilterChange}>
                            <SelectTrigger className="w-full h-10 border-border hover:border-primary/50 transition-colors">
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

                    {/* Reset Button */}
                    {hasActiveFilters && (
                        <div className="pt-2">
                            <div className="bg-white rounded-xl border border-border shadow-sm p-4">
                                <Button
                                    onClick={onResetFilters}
                                    variant="outline"
                                    className="w-full h-10 border-border hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-all group"
                                >
                                    <RotateCcw className="w-4 h-4 mr-2 group-hover:rotate-180 transition-transform duration-500" />
                                    Đặt lại tất cả
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
};

