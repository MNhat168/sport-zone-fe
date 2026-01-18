import React from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';

interface Step4BioAvailabilityProps {
    formData: {
        bio?: string;
        skillLevelRange: number;
    };
    onChange: (data: Partial<Step4BioAvailabilityProps['formData']>) => void;
}

export const Step4BioAvailability: React.FC<Step4BioAvailabilityProps> = ({ formData, onChange }) => {
    const bioLength = formData.bio?.length || 0;
    const maxBioLength = 500;

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Giới thiệu bản thân</h2>
                <p className="text-slate-600">Chia sẻ thêm về bản thân để người khác hiểu bạn hơn</p>
            </div>

            {/* Bio */}
            <div className="space-y-3">
                <Label htmlFor="bio" className="text-base font-semibold">
                    Tiểu sử (tùy chọn)
                </Label>
                <Textarea
                    id="bio"
                    placeholder="Viết vài dòng về bản thân, sở thích thể thao, mục tiêu tập luyện..."
                    value={formData.bio || ''}
                    onChange={e => onChange({ bio: e.target.value })}
                    maxLength={maxBioLength}
                    rows={6}
                    className="resize-none"
                />
                <div className="flex justify-between text-sm">
                    <p className="text-slate-500">
                        Một tiểu sử hay giúp bạn nổi bật và thu hút nhiều kết nối hơn
                    </p>
                    <p className={bioLength > maxBioLength * 0.9 ? 'text-orange-500' : 'text-slate-400'}>
                        {bioLength}/{maxBioLength}
                    </p>
                </div>
            </div>

            {/* Skill Level Range */}
            <div className="space-y-3">
                <Label className="text-base font-semibold">
                    Độ linh hoạt về trình độ
                </Label>
                <p className="text-sm text-slate-500">
                    Bạn có sẵn sàng chơi với người có trình độ khác bạn bao nhiêu cấp?
                </p>
                <div className="bg-slate-50 rounded-lg p-4 space-y-4">
                    <Slider
                        value={[formData.skillLevelRange || 1]}
                        onValueChange={value => onChange({ skillLevelRange: value[0] })}
                        min={0}
                        max={3}
                        step={1}
                        className="w-full"
                    />
                    <div className="flex justify-between text-xs text-slate-600">
                        <span>Chính xác</span>
                        <span>±1 cấp</span>
                        <span>±2 cấp</span>
                        <span>±3 cấp</span>
                    </div>
                    <div className="text-sm text-center">
                        {formData.skillLevelRange === 0 && (
                            <p className="text-slate-700">
                                <strong>Chính xác:</strong> Chỉ tìm người cùng trình độ
                            </p>
                        )}
                        {formData.skillLevelRange === 1 && (
                            <p className="text-slate-700">
                                <strong>±1 cấp:</strong> Chấp nhận người cao/thấp hơn 1 cấp
                            </p>
                        )}
                        {formData.skillLevelRange === 2 && (
                            <p className="text-slate-700">
                                <strong>±2 cấp:</strong> Chấp nhận người cao/thấp hơn 2 cấp
                            </p>
                        )}
                        {formData.skillLevelRange === 3 && (
                            <p className="text-slate-700">
                                <strong>±3 cấp:</strong> Chơi với mọi trình độ
                            </p>
                        )}
                    </div>
                </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-900 mb-2">✨ Gần hoàn thành rồi!</h3>
                <p className="text-sm text-green-800">
                    Bước tiếp theo bạn sẽ xem lại toàn bộ thông tin và hoàn tất hồ sơ.
                </p>
            </div>
        </div>
    );
};
