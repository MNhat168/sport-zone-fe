import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const SPORTS = [
    { value: 'football', label: 'Bóng đá', icon: '⚽' },
    { value: 'basketball', label: 'Bóng rổ', icon: '🏀' },
    { value: 'badminton', label: 'Cầu lông', icon: '🏸' },
    { value: 'tennis', label: 'Quần vợt', icon: '🎾' },
    { value: 'volleyball', label: 'Bóng chuyền', icon: '🏐' },
    { value: 'table_tennis', label: 'Bóng bàn', icon: '🏓' },
    { value: 'pickleball', label: 'Pickleball', icon: '🥒' },
];

const SKILL_LEVELS = [
    { value: 'beginner', label: 'Mới bắt đầu', description: 'Tôi mới chơi hoặc chơi không thường xuyên' },
    { value: 'intermediate', label: 'Trung bình', description: 'Tôi chơi thường xuyên và có kỹ năng cơ bản' },
    { value: 'advanced', label: 'Nâng cao', description: 'Tôi chơi rất giỏi và có kinh nghiệm' },
    { value: 'professional', label: 'Chuyên nghiệp', description: 'Tôi thi đấu chuyên nghiệp hoặc bán chuyên' },
];

const GENDERS = [
    { value: 'male', label: 'Nam' },
    { value: 'female', label: 'Nữ' },
    { value: 'other', label: 'Khác' },
];

interface Step1BasicInfoProps {
    formData: {
        sportPreferences: string[];
        skillLevel: string;
        gender: string;
        age?: number;
    };
    onChange: (data: Partial<Step1BasicInfoProps['formData']>) => void;
}

export const Step1BasicInfo: React.FC<Step1BasicInfoProps> = ({ formData, onChange }) => {
    const toggleSport = (sport: string) => {
        const current = formData.sportPreferences || [];
        if (current.includes(sport)) {
            onChange({ sportPreferences: current.filter(s => s !== sport) });
        } else {
            onChange({ sportPreferences: [...current, sport] });
        }
    };

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Thông tin cơ bản</h2>
                <p className="text-slate-600">Hãy cho chúng tôi biết về sở thích thể thao của bạn</p>
            </div>

            {/* Sport Preferences */}
            <div className="space-y-3">
                <Label className="text-base font-semibold">
                    Môn thể thao yêu thích <span className="text-red-500">*</span>
                </Label>
                <p className="text-sm text-slate-500">Chọn ít nhất 1 môn (có thể chọn nhiều)</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {SPORTS.map(sport => (
                        <button
                            key={sport.value}
                            onClick={() => toggleSport(sport.value)}
                            className={cn(
                                'p-4 rounded-lg border-2 transition-all text-left',
                                formData.sportPreferences?.includes(sport.value)
                                    ? 'border-primary bg-primary/5'
                                    : 'border-slate-200 hover:border-slate-300'
                            )}
                        >
                            <div className="text-2xl mb-1">{sport.icon}</div>
                            <div className="font-medium text-sm">{sport.label}</div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Skill Level */}
            <div className="space-y-3">
                <Label className="text-base font-semibold">
                    Trình độ kỹ năng <span className="text-red-500">*</span>
                </Label>
                <div className="space-y-2">
                    {SKILL_LEVELS.map(level => (
                        <Card
                            key={level.value}
                            onClick={() => onChange({ skillLevel: level.value })}
                            className={cn(
                                'p-4 cursor-pointer transition-all border-2',
                                formData.skillLevel === level.value
                                    ? 'border-primary bg-primary/5'
                                    : 'border-slate-200 hover:border-slate-300'
                            )}
                        >
                            <div className="flex items-start gap-3">
                                <div
                                    className={cn(
                                        'w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5',
                                        formData.skillLevel === level.value
                                            ? 'border-primary bg-primary'
                                            : 'border-slate-300'
                                    )}
                                >
                                    {formData.skillLevel === level.value && (
                                        <div className="w-full h-full rounded-full bg-white scale-50" />
                                    )}
                                </div>
                                <div>
                                    <div className="font-semibold text-slate-900">{level.label}</div>
                                    <div className="text-sm text-slate-500 mt-0.5">{level.description}</div>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Gender */}
            <div className="space-y-3">
                <Label className="text-base font-semibold">
                    Giới tính <span className="text-red-500">*</span>
                </Label>
                <div className="flex gap-3">
                    {GENDERS.map(gender => (
                        <button
                            key={gender.value}
                            onClick={() => onChange({ gender: gender.value })}
                            className={cn(
                                'flex-1 py-3 px-4 rounded-lg border-2 font-medium transition-all',
                                formData.gender === gender.value
                                    ? 'border-primary bg-primary text-white'
                                    : 'border-slate-200 hover:border-slate-300'
                            )}
                        >
                            {gender.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Age (Optional) */}
            <div className="space-y-3">
                <Label htmlFor="age" className="text-base font-semibold">
                    Tuổi (tùy chọn)
                </Label>
                <Input
                    id="age"
                    type="number"
                    min={18}
                    max={100}
                    placeholder="Nhập tuổi của bạn"
                    value={formData.age || ''}
                    onChange={e => onChange({ age: e.target.value ? parseInt(e.target.value) : undefined })}
                    className="max-w-xs"
                />
                <p className="text-sm text-slate-500">
                    Thông tin này giúp chúng tôi tìm đối tác phù hợp với độ tuổi của bạn
                </p>
            </div>
        </div>
    );
};
