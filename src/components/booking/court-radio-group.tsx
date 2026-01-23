import React from 'react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';

interface CourtOption {
    _id?: string;
    id?: string;
    name: string;
    courtNumber?: number;
}

interface CourtRadioGroupProps {
    courts: CourtOption[];
    selectedCourtId: string;
    onSelectCourt: (courtId: string) => void;
    disabled?: boolean;
    label?: string;
}

export const CourtRadioGroup: React.FC<CourtRadioGroupProps> = ({
    courts,
    selectedCourtId,
    onSelectCourt,
    disabled = false,
    label = "Chọn sân con *"
}) => {
    console.log('[COURT RADIO DEBUG] Rendering with:', {
        courtsCount: courts.length,
        selectedCourtId,
        courts: courts.map(c => ({ _id: c._id, id: c.id, name: c.name })),
    });

    if (courts.length === 0) {
        return (
            <div className="space-y-2">
                <Label className="text-base font-semibold">{label}</Label>
                <p className="text-sm text-gray-500">
                    Chưa có sân con khả dụng.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <Label className="text-base font-semibold">{label}</Label>

            <RadioGroup
                value={selectedCourtId}
                onValueChange={onSelectCourt}
                disabled={disabled}
                className="flex flex-wrap gap-3"
            >
                {courts.map((court) => {
                    const courtId = court._id || court.id || '';
                    const courtName = court.name || (court.courtNumber ? `Sân ${court.courtNumber}` : 'Sân');
                    const isSelected = selectedCourtId === courtId;

                    return (
                        <div
                            key={courtId}
                            className={cn(
                                "flex items-center space-x-2 px-4 py-3 rounded-lg border-2 transition-all cursor-pointer",
                                isSelected
                                    ? "border-emerald-600 bg-emerald-50"
                                    : "border-gray-200 hover:border-emerald-300 bg-white",
                                disabled && "opacity-50 cursor-not-allowed"
                            )}
                            onClick={() => {
                                if (!disabled) {
                                    console.log('[COURT RADIO DEBUG] Selecting court:', courtId);
                                    onSelectCourt(courtId);
                                }
                            }}
                        >
                            <RadioGroupItem
                                value={courtId}
                                id={courtId}
                                disabled={disabled}
                                className={cn(
                                    isSelected && "border-emerald-600 text-emerald-600"
                                )}
                            />
                            <Label
                                htmlFor={courtId}
                                className={cn(
                                    "cursor-pointer font-medium",
                                    isSelected ? "text-emerald-900" : "text-gray-700",
                                    disabled && "cursor-not-allowed"
                                )}
                            >
                                {courtName}
                            </Label>
                        </div>
                    );
                })}
            </RadioGroup>
        </div>
    );
};
