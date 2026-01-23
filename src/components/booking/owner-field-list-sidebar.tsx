import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Building2, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Field } from '@/types/field-type';

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
            <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Sân của bạn</h3>
                {[1, 2, 3].map((i) => (
                    <Card key={i} className="animate-pulse">
                        <CardContent className="p-4">
                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    if (fields.length === 0) {
        return (
            <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Sân của bạn</h3>
                <Card>
                    <CardContent className="p-6 text-center">
                        <Building2 className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                        <p className="text-sm text-gray-600">
                            Chưa có sân nào. Vui lòng tạo sân mới.
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Sân của bạn
                <span className="text-sm font-normal text-gray-500 ml-2">
                    ({fields.length} sân)
                </span>
            </h3>

            <div className="space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
                {fields.map((field) => {
                    const isSelected = selectedFieldId === field.id;

                    return (
                        <Card
                            key={field.id}
                            className={cn(
                                "cursor-pointer transition-all duration-200 hover:shadow-md",
                                isSelected
                                    ? "border-2 border-emerald-600 bg-emerald-50"
                                    : "border border-gray-200 hover:border-emerald-300"
                            )}
                            onClick={() => onSelectField(field.id)}
                        >
                            <CardContent className="p-4">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1 min-w-0">
                                        {/* Field thumbnail */}
                                        {field.images && field.images.length > 0 && (
                                            <img
                                                src={field.images[0]}
                                                alt={field.name}
                                                className="w-full h-24 object-cover rounded-md mb-3"
                                            />
                                        )}

                                        {/* Field name */}
                                        <h4 className={cn(
                                            "font-semibold text-base mb-1 truncate",
                                            isSelected ? "text-emerald-900" : "text-gray-900"
                                        )}>
                                            {field.name}
                                        </h4>

                                        {/* Court count */}
                                        <p className={cn(
                                            "text-sm mb-2",
                                            isSelected ? "text-emerald-700" : "text-gray-600"
                                        )}>
                                            {field.courts?.length || 0} sân con
                                        </p>

                                        {/* Location */}
                                        {field.location && (
                                            <p className={cn(
                                                "text-xs truncate",
                                                isSelected ? "text-emerald-600" : "text-gray-500"
                                            )}>
                                                {typeof field.location === 'string'
                                                    ? field.location
                                                    : (field.location as any)?.address || ''}
                                            </p>
                                        )}
                                    </div>

                                    {/* Chevron icon when selected */}
                                    {isSelected && (
                                        <ChevronRight className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
};
