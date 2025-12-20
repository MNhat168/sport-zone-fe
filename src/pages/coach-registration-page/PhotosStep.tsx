import React, { useState } from 'react';
import type { CreateCoachRegistrationPayload } from '@/features/coach-registration';

interface PhotosStepProps {
    formData: CreateCoachRegistrationPayload;
    updateFormData: (data: Partial<CreateCoachRegistrationPayload>) => void;
    onUploadDocument: (file: File) => Promise<string>;
}

const PhotosStep: React.FC<PhotosStepProps> = ({ formData, updateFormData, onUploadDocument }) => {
    const [uploading, setUploading] = useState(false);

    const handleProfilePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const url = await onUploadDocument(file);
            updateFormData({ profilePhoto: url });
        } catch (error) {
            alert('Upload failed. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const handleCertificationPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        setUploading(true);
        try {
            const urls = await Promise.all(files.map(file => onUploadDocument(file)));
            updateFormData({
                certificationPhotos: [...(formData.certificationPhotos || []), ...urls]
            });
        } catch (error) {
            alert('Upload failed. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Hình ảnh & Chứng chỉ</h2>

            {/* Profile Photo */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ảnh đại diện
                </label>
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePhotoUpload}
                    disabled={uploading}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                />
                {formData.profilePhoto && (
                    <img src={formData.profilePhoto} alt="Profile" className="mt-2 w-32 h-32 object-cover rounded-md" />
                )}
            </div>

            {/* Certification Photos */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ảnh chứng chỉ / Bằng cấp
                </label>
                <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleCertificationPhotoUpload}
                    disabled={uploading}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                />
                {formData.certificationPhotos && formData.certificationPhotos.length > 0 && (
                    <div className="mt-2 grid grid-cols-3 gap-2">
                        {formData.certificationPhotos.map((url, idx) => (
                            <img key={idx} src={url} alt={`Cert ${idx + 1}`} className="w-full h-24 object-cover rounded-md" />
                        ))}
                    </div>
                )}
            </div>

            {uploading && <p className="text-sm text-gray-500">Đang tải lên...</p>}
        </div>
    );
};

export default PhotosStep;
