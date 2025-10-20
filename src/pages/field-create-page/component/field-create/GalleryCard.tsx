import { useState } from 'react';
import { ChevronDown, Upload, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

interface GalleryCardProps {
    // Avatar (single image)
    avatarPreview?: string | null;
    onAvatarUpload?: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onRemoveAvatar?: () => void;

    // Gallery (multiple images) - backward compatible with existing props
    imageFiles?: File[]; // legacy alias for galleryFiles (unused, kept for backward compatibility)
    previewImages?: string[]; // legacy alias for galleryPreviews
    onImageUpload?: (event: React.ChangeEvent<HTMLInputElement>) => void; // legacy alias for onGalleryUpload
    onRemoveImage?: (index: number) => void; // legacy alias for onRemoveGalleryImage

    // Preferred props
    galleryPreviews?: string[];
    onGalleryUpload?: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onRemoveGalleryImage?: (index: number) => void;
}

export default function GalleryCard({ 
    avatarPreview,
    onAvatarUpload,
    onRemoveAvatar,
    previewImages,
    onImageUpload,
    onRemoveImage,
    galleryPreviews,
    onGalleryUpload,
    onRemoveGalleryImage,
}: GalleryCardProps) {
    const [isExpanded, setIsExpanded] = useState(true);

    const toggleExpanded = () => {
        setIsExpanded(!isExpanded);
    };

    // Backward-compat: prefer explicit gallery props if provided
    const effectiveGalleryPreviews = galleryPreviews ?? previewImages ?? [];
    const effectiveOnGalleryUpload = onGalleryUpload ?? onImageUpload;
    const effectiveOnRemoveGalleryImage = onRemoveGalleryImage ?? onRemoveImage;

    return (
        <Card className="shadow-md border-0">
            <CardHeader 
                onClick={toggleExpanded}
                className="cursor-pointer hover:bg-gray-50 transition-colors duration-200"
            >
                <div className="flex items-center justify-between">
                    <CardTitle>Thư viện ảnh</CardTitle>
                    <ChevronDown 
                        className={`w-5 h-5 transition-transform duration-200 ${
                            isExpanded ? 'rotate-180' : 'rotate-0'
                        }`} 
                    />
                </div>
            </CardHeader>
            {isExpanded && (
                <>
                <hr className="border-t border-gray-300 my-0 mx-6" />
                <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Left column: Avatar uploader */}
                    <div className="space-y-2.5">
                        <Label>Ảnh đại diện sân</Label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center space-y-3">
                            {avatarPreview ? (
                                <div className="flex items-center justify-center">
                                    <div className="relative">
                                        <img src={avatarPreview} alt="Avatar field" className="w-32 h-32 rounded-lg object-cover" />
                                        {onRemoveAvatar && (
                                            <Button
                                                size="icon"
                                                variant="destructive"
                                                className="absolute -top-2 -right-2 h-8 w-8 rounded-full"
                                                onClick={() => onRemoveAvatar()}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <Upload className="w-8 h-8 mx-auto text-gray-400" />
                                    <p className="text-sm text-gray-600">Tải lên ảnh đại diện sân</p>
                                </>
                            )}
                            <input
                                type="file"
                                accept="image/*"
                                onChange={onAvatarUpload}
                                className="hidden"
                                id="avatar-upload"
                            />
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => document.getElementById('avatar-upload')?.click()}
                                disabled={!onAvatarUpload}
                            >
                                {avatarPreview ? 'Đổi ảnh' : 'Chọn ảnh'}
                            </Button>
                        </div>
                    </div>

                    {/* Right column: Gallery uploader + previews */}
                    <div className="space-y-4">
                        <div className="space-y-2.5">
                            <Label>Thư viện ảnh liên quan</Label>
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center space-y-2">
                                <Upload className="w-10 h-10 mx-auto text-gray-400" />
                                <p className="text-sm text-gray-600">Tải lên thư viện ảnh</p>
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={effectiveOnGalleryUpload}
                                    className="hidden"
                                    id="gallery-upload"
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => document.getElementById('gallery-upload')?.click()}
                                    disabled={!effectiveOnGalleryUpload}
                                >
                                    Chọn ảnh
                                </Button>
                            </div>
                        </div>

                        {effectiveGalleryPreviews.length > 0 && (
                            <div className="flex flex-col gap-2.5">
                                {effectiveGalleryPreviews.map((img, idx) => (
                                    <div key={idx} className="relative">
                                        <img src={img} alt={`Gallery ${idx + 1}`} className="w-24 h-24 rounded-lg object-cover" />
                                        {effectiveOnRemoveGalleryImage && (
                                            <Button
                                                size="icon"
                                                variant="destructive"
                                                className="absolute -top-2 -right-2 h-8 w-8 rounded-full"
                                                onClick={() => effectiveOnRemoveGalleryImage(idx)}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <p className="text-sm text-gray-600 mt-6">
                    Ảnh đại diện sẽ được hiển thị nổi bật trên trang sân.
                    Thư viện ảnh hỗ trợ JPG, PNG, SVG. Kích thước đề xuất tối thiểu 152 × 152.
                </p>
                </CardContent>
                </>
            )}
        </Card>
    );
}
