import { CalendarIcon, Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface BookingFiltersProps {
    onSearch: (value: string) => void;
    onTimeFilterChange: (value: string) => void;
    onSortChange: (value: string) => void;
    onTabChange?: (value: string) => void;
}

export function BookingFilters({
    onSearch,
    onTimeFilterChange,
    onSortChange,
    onTabChange
}: BookingFiltersProps) {
    return (
        <div className="w-full bg-gray-50 rounded-md p-3 md:p-5">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                {/* Left side - Time filter and Sort */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 md:gap-5">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-2.5">
                        <span className="text-gray-600 text-sm md:text-base hidden sm:inline">Sắp Xếp</span>
                        <Select defaultValue="date-desc" onValueChange={onSortChange}>
                            <SelectTrigger className="w-full sm:w-40 bg-white border-gray-200 rounded-md h-10">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="date-desc">Mới Nhất</SelectItem>
                                <SelectItem value="date-asc">Cũ Nhất</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex items-center gap-1">
                        <Select defaultValue="all" onValueChange={onTimeFilterChange}>
                            <SelectTrigger className="w-full sm:w-auto bg-white border-gray-200 rounded-md h-10">
                                <div className="flex items-center gap-2 md:gap-3.5">
                                    <CalendarIcon className="h-[14px] w-[14px] text-gray-600 flex-shrink-0" />
                                    <SelectValue />
                                </div>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="this-week">Tuần Này</SelectItem>
                                <SelectItem value="this-month">Tháng Này</SelectItem>
                                <SelectItem value="last-month">Tháng Trước</SelectItem>
                                <SelectItem value="all">Tất Cả</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Right side - Search */}
                <div className="flex items-center gap-3.5">
                    <div className="relative w-full md:w-64">
                        <Input
                            placeholder="Tìm Kiếm"
                            className="bg-gray-100 border-0 pr-10 h-10"
                            onChange={(e) => onSearch?.(e.target.value)}
                        />
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-900" />
                    </div>
                </div>
            </div>
        </div>
    );
}
