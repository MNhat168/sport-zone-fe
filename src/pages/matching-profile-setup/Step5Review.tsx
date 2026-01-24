import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Trophy, Users, Calendar, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const SPORTS_LABELS: Record<string, string> = {
    football: 'Bóng đá',
    basketball: 'Bóng rổ',
    badminton: 'Cầu lông',
    tennis: 'Quần vợt',
    volleyball: 'Bóng chuyền',
    pickleball: 'Pickleball',
};

const SKILL_LABELS: Record<string, string> = {
    beginner: 'Mới bắt đầu',
    intermediate: 'Trung bình',
    advanced: 'Nâng cao',
    professional: 'Chuyên nghiệp',
};

const GENDER_LABELS: Record<string, string> = {
    male: 'Nam',
    female: 'Nữ',
    other: 'Khác',
    any: 'Bất kỳ',
};

interface Step5ReviewProps {
    formData: {
        sportPreferences: string[];
        skillLevel: string;
        gender: string;
        age?: number;
        location: {
            address: string;
            coordinates: [number, number];
            searchRadius: number;
        };
        preferredGender: string;
        minAge?: number;
        maxAge?: number;
        photos: string[];
        bio?: string;
        skillLevelRange: number;
    };
    onEdit: (step: number) => void;
}

export const Step5Review: React.FC<Step5ReviewProps> = ({ formData, onEdit }) => {
    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Xem lại hồ sơ</h2>
                <p className="text-slate-600">Kiểm tra lại thông tin trước khi hoàn tất</p>
            </div>

            {/* Photos Preview */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-lg">Ảnh hồ sơ</h3>
                        <Button variant="ghost" size="sm" onClick={() => onEdit(3)}>
                            <Edit2 size={16} className="mr-1" /> Chỉnh sửa
                        </Button>
                    </div>
                    {formData.photos.length > 0 ? (
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                            {formData.photos.map((photo, index) => (
                                <div key={index} className="relative aspect-square rounded-lg overflow-hidden">
                                    <img src={photo} alt={`Photo ${index + 1}`} className="w-full h-full object-cover" />
                                    {index === 0 && (
                                        <div className="absolute bottom-1 left-1 bg-primary text-white text-xs px-2 py-0.5 rounded">
                                            Chính
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-slate-500 text-sm">Chưa có ảnh nào</p>
                    )}
                </CardContent>
            </Card>

            {/* Basic Info */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-lg">Thông tin cơ bản</h3>
                        <Button variant="ghost" size="sm" onClick={() => onEdit(1)}>
                            <Edit2 size={16} className="mr-1" /> Chỉnh sửa
                        </Button>
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-start gap-3">
                            <Trophy className="text-primary mt-1" size={20} />
                            <div>
                                <p className="text-sm text-slate-500">Môn thể thao</p>
                                <div className="flex flex-wrap gap-2 mt-1">
                                    {formData.sportPreferences.map(sport => (
                                        <Badge key={sport} variant="secondary">
                                            {SPORTS_LABELS[sport] || sport}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <Trophy className="text-primary mt-1" size={20} />
                            <div>
                                <p className="text-sm text-slate-500">Trình độ</p>
                                <p className="font-medium">{SKILL_LABELS[formData.skillLevel]}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <Users className="text-primary mt-1" size={20} />
                            <div>
                                <p className="text-sm text-slate-500">Giới tính</p>
                                <p className="font-medium">{GENDER_LABELS[formData.gender]}</p>
                            </div>
                        </div>
                        {formData.age && (
                            <div className="flex items-start gap-3">
                                <Calendar className="text-primary mt-1" size={20} />
                                <div>
                                    <p className="text-sm text-slate-500">Tuổi</p>
                                    <p className="font-medium">{formData.age} tuổi</p>
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Location & Preferences */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-lg">Vị trí & Tìm kiếm</h3>
                        <Button variant="ghost" size="sm" onClick={() => onEdit(2)}>
                            <Edit2 size={16} className="mr-1" /> Chỉnh sửa
                        </Button>
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-start gap-3">
                            <MapPin className="text-primary mt-1" size={20} />
                            <div>
                                <p className="text-sm text-slate-500">Địa chỉ</p>
                                <p className="font-medium">{formData.location.address}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <MapPin className="text-primary mt-1" size={20} />
                            <div>
                                <p className="text-sm text-slate-500">Bán kính tìm kiếm</p>
                                <p className="font-medium">{formData.location.searchRadius} km</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <Users className="text-primary mt-1" size={20} />
                            <div>
                                <p className="text-sm text-slate-500">Giới tính ưu tiên</p>
                                <p className="font-medium">{GENDER_LABELS[formData.preferredGender]}</p>
                            </div>
                        </div>
                        {(formData.minAge || formData.maxAge) && (
                            <div className="flex items-start gap-3">
                                <Calendar className="text-primary mt-1" size={20} />
                                <div>
                                    <p className="text-sm text-slate-500">Độ tuổi ưu tiên</p>
                                    <p className="font-medium">
                                        {formData.minAge || 18} - {formData.maxAge || 100} tuổi
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Bio */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-lg">Giới thiệu</h3>
                        <Button variant="ghost" size="sm" onClick={() => onEdit(4)}>
                            <Edit2 size={16} className="mr-1" /> Chỉnh sửa
                        </Button>
                    </div>
                    <div className="space-y-3">
                        {formData.bio ? (
                            <p className="text-slate-700 whitespace-pre-wrap">{formData.bio}</p>
                        ) : (
                            <p className="text-slate-500 text-sm italic">Chưa có tiểu sử</p>
                        )}
                        <div className="pt-3 border-t">
                            <p className="text-sm text-slate-500">Độ linh hoạt trình độ</p>
                            <p className="font-medium">
                                {formData.skillLevelRange === 0 && 'Chính xác (cùng trình độ)'}
                                {formData.skillLevelRange === 1 && '±1 cấp'}
                                {formData.skillLevelRange === 2 && '±2 cấp'}
                                {formData.skillLevelRange === 3 && '±3 cấp (mọi trình độ)'}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                <p className="text-sm text-primary-foreground">
                    ✅ Hồ sơ của bạn đã sẵn sàng! Nhấn "Hoàn tất" để bắt đầu tìm kiếm đối tác chơi thể thao.
                </p>
            </div>
        </div>
    );
};
