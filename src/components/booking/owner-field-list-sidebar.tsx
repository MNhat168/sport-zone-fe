import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Building2, ChevronRight, Star, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Field } from '@/types/field-type';
import { getFieldPinIcon } from '@/utils/fieldPinIcon';
import { formatCurrency } from '@/utils/format-currency';

interface OwnerFieldListSidebarProps {
    fields: Field[];
    selectedFieldId: string | null;
    onSelectField: (fieldId: string) => void;
    loading?: boolean;
}

export const OwnerFieldListSidebar: React.FC<OwnerFieldListSidebarProps> = ({
    fields,
    selectedFieldId,
    onSelectField,
    loading = false,
}) => {
    if (loading) {
        return (
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 px-1">Sân của bạn</h3>
                {[1, 2, 3].map((i) => (
                    <Card key={i} className="animate-pulse border-gray-100 shadow-sm">
                        <CardContent className="p-3">
                            <div className="flex gap-3">
                                <div className="w-24 h-24 bg-gray-200 rounded-md flex-shrink-0"></div>
                                <div className="flex-1 space-y-2 py-1">
                                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                    <div className="h-3 bg-gray-200 rounded w-full"></div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    if (fields.length === 0) {
        return (
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 px-1">Sân của bạn</h3>
                <Card className="border-dashed border-gray-300 shadow-none">
                    <CardContent className="p-8 text-center">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Building2 className="w-6 h-6 text-gray-400" />
                        </div>
                        <p className="text-sm text-gray-600 font-medium">
                            Chưa có sân nào
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                            Vui lòng tạo sân mới để bắt đầu
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-4 h-full flex flex-col">
            <h3 className="text-lg font-semibold text-gray-900 px-1 flex items-center justify-between">
                <span>Sân của bạn</span>
                <span className="text-xs font-medium bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full">
                    {fields.length}
                </span>
            </h3>

            <div className="flex-1 overflow-y-auto pr-2 space-y-3 pb-4">
                {fields.map((field) => {
                    const isSelected = selectedFieldId === field.id;
                    const imageUrl = field.images?.[0] || '/placeholder-field.jpg';
                    const locationText = typeof field.location === 'string'
                        ? field.location
                        : (field.location as any)?.address || 'Địa chỉ không xác định';

                    return (
                        <div
                            key={field.id}
                            onClick={() => onSelectField(field._id || field.id)}
                            className={cn(
                                "group relative flex items-start gap-3 p-3 rounded-xl border transition-all duration-200 cursor-pointer overflow-hidden",
                                isSelected
                                    ? "bg-emerald-50/50 border-emerald-500 shadow-md shadow-emerald-100/50 ring-1 ring-emerald-500"
                                    : "bg-white border-gray-200 hover:border-emerald-300 hover:shadow-md"
                            )}
                        >
                            {/* Selection Indicator */}
                            {isSelected && (
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 rounded-l-xl" />
                            )}

                            {/* Image */}
                            <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100 bg-gray-50">
                                <img
                                    src={imageUrl}
                                    alt={field.name}
                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                />
                                <div className="absolute top-1 right-1 bg-black/60 backdrop-blur-sm text-white text-[10px] px-1.5 py-0.5 rounded-full font-medium">
                                    {(field as any).rating || 5.0} <Star className="w-2.5 h-2.5 inline -mt-0.5 fill-current" />
                                </div>
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0 py-1">
                                <div className="flex justify-between items-start gap-2">
                                    <h4 className={cn(
                                        "font-semibold text-sm line-clamp-1",
                                        isSelected ? "text-emerald-900" : "text-gray-900"
                                    )}>
                                        {field.name}
                                    </h4>
                                </div>

                                <div className="flex items-start gap-1 mt-1 text-xs text-gray-500">
                                    <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                    <span className="line-clamp-2 leading-tight">{locationText}</span>
                                </div>

                                <div className="flex items-end justify-between mt-2">
                                    <div>
                                        <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Giá từ</p>
                                        <p className="text-sm font-bold text-emerald-600">
                                            {formatCurrency(field.basePrice || 0)}
                                            <span className="text-[10px] font-normal text-gray-500 ml-0.5">/giờ</span>
                                        </p>
                                    </div>

                                    <div className={cn(
                                        "w-6 h-6 rounded-full flex items-center justify-center transition-colors",
                                        isSelected ? "bg-emerald-500 text-white shadow-emerald-200" : "bg-gray-100 text-gray-400 group-hover:bg-emerald-100 group-hover:text-emerald-600"
                                    )}>
                                        <ChevronRight className="w-4 h-4" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
