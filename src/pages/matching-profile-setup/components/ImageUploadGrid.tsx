import React, { useState, useRef } from 'react';
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ImageUploadGridProps {
    images: string[];
    onImagesChange: (images: string[]) => void;
    onUploadImage: (file: File) => Promise<string>;
    maxImages?: number;
    maxSizeMB?: number;
}

export const ImageUploadGrid: React.FC<ImageUploadGridProps> = ({
    images,
    onImagesChange,
    onUploadImage,
    maxImages = 6,
    maxSizeMB = 5,
}) => {
    const [uploading, setUploading] = useState(false);
    const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        // Validate number of images
        if (images.length + files.length > maxImages) {
            toast.error(`Bạn chỉ có thể tải lên tối đa ${maxImages} ảnh`);
            return;
        }

        setUploading(true);

        const newUrls = [...images];
        for (let i = 0; i < files.length; i++) {
            const file = files[i];

            // Validate file type
            if (!file.type.startsWith('image/')) {
                toast.error(`File ${file.name} không phải là ảnh hợp lệ`);
                continue;
            }

            // Validate file size
            const sizeMB = file.size / (1024 * 1024);
            if (sizeMB > maxSizeMB) {
                toast.error(`File ${file.name} vượt quá ${maxSizeMB}MB`);
                continue;
            }

            try {
                setUploadingIndex(newUrls.length);
                const url = await onUploadImage(file);
                newUrls.push(url);
                toast.success(`Đã tải lên ${file.name}`);
            } catch (error: any) {
                toast.error(`Lỗi khi tải ${file.name}: ${error.message || 'Vui lòng thử lại'}`);
            }
        }

        onImagesChange(newUrls);
        setUploading(false);
        setUploadingIndex(null);

        // Reset input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleRemoveImage = (index: number) => {
        const newImages = images.filter((_, i) => i !== index);
        onImagesChange(newImages);
        toast.success('Đã xóa ảnh');
    };

    const canAddMore = images.length < maxImages;

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {images.map((url, index) => (
                    <div
                        key={index}
                        className="relative aspect-square rounded-lg overflow-hidden bg-slate-100 group"
                    >
                        <img
                            src={url}
                            alt={`Upload ${index + 1}`}
                            className="w-full h-full object-cover"
                        />
                        <button
                            onClick={() => handleRemoveImage(index)}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                        >
                            <X size={16} />
                        </button>
                        {index === 0 && (
                            <div className="absolute bottom-2 left-2 bg-primary text-white text-xs px-2 py-1 rounded">
                                Ảnh chính
                            </div>
                        )}
                    </div>
                ))}

                {uploading && uploadingIndex !== null && (
                    <div className="aspect-square rounded-lg bg-slate-100 flex items-center justify-center">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                )}

                {canAddMore && !uploading && (
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className={cn(
                            'aspect-square rounded-lg border-2 border-dashed border-slate-300',
                            'flex flex-col items-center justify-center gap-2',
                            'hover:border-primary hover:bg-primary/5 transition-all',
                            'text-slate-500 hover:text-primary'
                        )}
                    >
                        <Upload size={24} />
                        <span className="text-xs font-medium">Tải ảnh lên</span>
                    </button>
                )}
            </div>

            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
                className="hidden"
            />

            <div className="flex items-start gap-2 text-sm text-slate-500">
                <ImageIcon size={16} className="mt-0.5 flex-shrink-0" />
                <div>
                    <p>
                        Đã tải lên {images.length}/{maxImages} ảnh. Ảnh đầu tiên sẽ là ảnh đại diện chính.
                    </p>
                    <p className="text-xs mt-1">
                        Định dạng: JPG, PNG, WEBP. Kích thước tối đa: {maxSizeMB}MB mỗi ảnh.
                    </p>
                </div>
            </div>
        </div>
    );
};
