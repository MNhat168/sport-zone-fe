import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

const GENDER_PREFERENCES = [
    { value: 'male', label: 'Nam' },
    { value: 'female', label: 'Nữ' },
    { value: 'any', label: 'Bất kỳ' },
];

interface Step2LocationProps {
    formData: {
        location: {
            address: string;
            coordinates: [number, number];
            searchRadius: number;
        };
        preferredGender: string;
        minAge?: number;
        maxAge?: number;
    };
    onChange: (data: Partial<Step2LocationProps['formData']>) => void;
}

export const Step2Location: React.FC<Step2LocationProps> = ({ formData, onChange }) => {
    const handleAddressChange = (address: string) => {
        onChange({
            location: {
                ...formData.location,
                address,
            },
        });
    };

    const handleRadiusChange = (value: number[]) => {
        onChange({
            location: {
                ...formData.location,
                searchRadius: value[0],
            },
        });
    };

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Vị trí & Tìm kiếm</h2>
                <p className="text-slate-600">Thiết lập khu vực và đối tượng tìm kiếm của bạn</p>
            </div>

            {/* Address */}
            <div className="space-y-3">
                <Label htmlFor="address" className="text-base font-semibold">
                    Địa chỉ của bạn <span className="text-red-500">*</span>
                </Label>
                <Input
                    id="address"
                    type="text"
                    placeholder="Nhập địa chỉ (VD: Quận 1, TP.HCM)"
                    value={formData.location?.address || ''}
                    onChange={e => handleAddressChange(e.target.value)}
                />
                <p className="text-sm text-slate-500">
                    Chúng tôi sẽ tìm đối tác chơi thể thao gần khu vực này
                </p>
            </div>

            {/* Coordinates (simplified - in real app would use map picker) */}
            <div className="space-y-3">
                <Label className="text-base font-semibold">Tọa độ (tùy chọn)</Label>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <Label htmlFor="longitude" className="text-sm">Kinh độ</Label>
                        <Input
                            id="longitude"
                            type="number"
                            step="0.000001"
                            placeholder="106.xxx"
                            value={formData.location?.coordinates?.[0] || ''}
                            onChange={e =>
                                onChange({
                                    location: {
                                        ...formData.location,
                                        coordinates: [parseFloat(e.target.value) || 0, formData.location?.coordinates?.[1] || 0],
                                    },
                                })
                            }
                        />
                    </div>
                    <div>
                        <Label htmlFor="latitude" className="text-sm">Vĩ độ</Label>
                        <Input
                            id="latitude"
                            type="number"
                            step="0.000001"
                            placeholder="10.xxx"
                            value={formData.location?.coordinates?.[1] || ''}
                            onChange={e =>
                                onChange({
                                    location: {
                                        ...formData.location,
                                        coordinates: [formData.location?.coordinates?.[0] || 0, parseFloat(e.target.value) || 0],
                                    },
                                })
                            }
                        />
                    </div>
                </div>
                <p className="text-sm text-slate-500">
                    Để trống nếu bạn không biết. Chúng tôi sẽ tự động xác định dựa trên địa chỉ.
                </p>
            </div>

            {/* Search Radius */}
            <div className="space-y-3">
                <Label className="text-base font-semibold">
                    Bán kính tìm kiếm: {formData.location?.searchRadius || 10} km
                </Label>
                <Slider
                    value={[formData.location?.searchRadius || 10]}
                    onValueChange={handleRadiusChange}
                    min={1}
                    max={50}
                    step={1}
                    className="w-full"
                />
                <div className="flex justify-between text-xs text-slate-500">
                    <span>1 km</span>
                    <span>50 km</span>
                </div>
            </div>

            {/* Preferred Gender */}
            <div className="space-y-3">
                <Label className="text-base font-semibold">
                    Giới tính ưu tiên <span className="text-red-500">*</span>
                </Label>
                <p className="text-sm text-slate-500">Bạn muốn tìm đối tác chơi là nam, nữ hay không quan trọng?</p>
                <div className="flex gap-3">
                    {GENDER_PREFERENCES.map(pref => (
                        <button
                            key={pref.value}
                            onClick={() => onChange({ preferredGender: pref.value })}
                            className={cn(
                                'flex-1 py-3 px-4 rounded-lg border-2 font-medium transition-all',
                                formData.preferredGender === pref.value
                                    ? 'border-primary bg-primary text-white'
                                    : 'border-slate-200 hover:border-slate-300'
                            )}
                        >
                            {pref.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Age Range Preference */}
            <div className="space-y-3">
                <Label className="text-base font-semibold">Độ tuổi ưu tiên (tùy chọn)</Label>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <Label htmlFor="minAge" className="text-sm">Tuổi tối thiểu</Label>
                        <Input
                            id="minAge"
                            type="number"
                            min={18}
                            max={100}
                            placeholder="18"
                            value={formData.minAge || ''}
                            onChange={e => onChange({ minAge: e.target.value ? parseInt(e.target.value) : undefined })}
                        />
                    </div>
                    <div>
                        <Label htmlFor="maxAge" className="text-sm">Tuổi tối đa</Label>
                        <Input
                            id="maxAge"
                            type="number"
                            min={18}
                            max={100}
                            placeholder="100"
                            value={formData.maxAge || ''}
                            onChange={e => onChange({ maxAge: e.target.value ? parseInt(e.target.value) : undefined })}
                        />
                    </div>
                </div>
                <p className="text-sm text-slate-500">
                    Để trống nếu bạn không có yêu cầu về độ tuổi
                </p>
            </div>
        </div>
    );
};
