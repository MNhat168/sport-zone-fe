import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { SportType } from '@/components/enums/ENUMS';

interface BasicInfoCardProps {
    formData: {
        name: string;
        sportType: string;
        numberOfCourts?: number;
    };
    onInputChange: (field: string, value: any) => void;
}

// Mapping từ tiếng Anh sang tiếng Việt cho UI
const sportTypeLabels: Record<string, string> = {
    [SportType.FOOTBALL]: 'Bóng đá',
    [SportType.TENNIS]: 'Tennis',
    [SportType.BADMINTON]: 'Cầu lông',
    [SportType.PICKLEBALL]: 'Pickleball',
    [SportType.BASKETBALL]: 'Bóng rổ',
    [SportType.VOLLEYBALL]: 'Bóng chuyền',
    [SportType.SWIMMING]: 'Bơi lội',
    [SportType.GYM]: 'Phòng gym'
};

export default function BasicInfoCard({ formData, onInputChange }: BasicInfoCardProps) {
    const [isExpanded, setIsExpanded] = useState(true);

    const toggleExpanded = () => {
        setIsExpanded(!isExpanded);
    };

    return (
        <Card className="bg-white shadow-md border-0">
            <CardHeader
                onClick={toggleExpanded}
                className="cursor-pointer hover:bg-gray-50 transition-colors duration-200"
            >
                <div className="flex items-center justify-between">
                    <CardTitle>Thông tin cơ bản</CardTitle>
                    <ChevronDown
                        className={`w-5 h-5 transition-transform duration-200 ${isExpanded ? 'rotate-180' : 'rotate-0'
                            }`}
                    />
                </div>
            </CardHeader>

            {isExpanded && (
                <>
                    <hr className="border-t border-gray-300 my-0 mx-6" />
                    <CardContent className="pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2.5">
                                <Label>
                                    Tên sân <span className="text-red-600">*</span>
                                </Label>
                                <Input
                                    placeholder="Nhập tên sân"
                                    value={formData.name}
                                    onChange={(e) => onInputChange('name', e.target.value)}
                                />
                            </div>
                            <div className="space-y-2.5">
                                <Label>
                                    Loại sân <span className="text-red-600">*</span>
                                </Label>
                                <Select
                                    value={formData.sportType}
                                    onValueChange={(value) => onInputChange('sportType', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Chọn loại sân" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white">
                                        {Object.values(SportType).map((sport) => (
                                            <SelectItem key={sport} value={sport}>
                                                {sportTypeLabels[sport]}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2.5">
                                <Label>
                                    Số lượng court
                                </Label>
                                <Input
                                    type="number"
                                    min="0"
                                    max="10"
                                    placeholder="1"
                                    value={formData.numberOfCourts ?? 1}
                                    onChange={(e) => {
                                        const value = e.target.value === '' ? 1 : parseInt(e.target.value, 10);
                                        const clampedValue = Math.max(0, Math.min(10, isNaN(value) ? 1 : value));
                                        onInputChange('numberOfCourts', clampedValue);
                                    }}
                                />
                                <p className="text-sm text-gray-500">
                                    Số lượng court sẽ được tạo tự động (0-10, mặc định: 1)
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </>
            )}
        </Card>
    );
}
