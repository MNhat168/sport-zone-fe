import React from 'react';
import { ImageUploadGrid } from './components/ImageUploadGrid';

interface Step3PhotosProps {
    formData: {
        photos: string[];
    };
    onChange: (data: Partial<Step3PhotosProps['formData']>) => void;
    onUploadImage: (file: File) => Promise<string>;
}

export const Step3Photos: React.FC<Step3PhotosProps> = ({ formData, onChange, onUploadImage }) => {
    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Ảnh hồ sơ</h2>
                <p className="text-slate-600">
                    Thêm ảnh để tăng cơ hội kết nối. Ảnh đầu tiên sẽ là ảnh đại diện chính của bạn.
                </p>
            </div>

            <ImageUploadGrid
                images={formData.photos || []}
                onImagesChange={photos => onChange({ photos })}
                onUploadImage={onUploadImage}
                maxImages={6}
                maxSizeMB={5}
            />

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">💡 Mẹo để có ảnh hồ sơ tốt:</h3>
                <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                    <li>Sử dụng ảnh rõ mặt, tươi cười</li>
                    <li>Thêm ảnh bạn đang chơi thể thao</li>
                    <li>Tránh ảnh mờ, tối hoặc quá xa</li>
                    <li>Ảnh đầu tiên nên là ảnh chân dung</li>
                </ul>
            </div>
        </div>
    );
};
