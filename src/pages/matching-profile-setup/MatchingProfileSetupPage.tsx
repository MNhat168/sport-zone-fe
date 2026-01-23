import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hook';
import { fetchMatchProfile, createOrUpdateProfile } from '@/features/matching/matchingThunk';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { StepIndicator } from './components/StepIndicator';
import { Step1BasicInfo } from './Step1BasicInfo';
import { Step2Location } from './Step2Location';
import { Step3Photos } from './Step3Photos';
import { Step4BioAvailability } from './Step4BioAvailability';
import { Step5Review } from './Step5Review';
import axiosPrivate from '@/utils/axios/axiosPrivate';

interface ProfileFormData {
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
}

const STEPS = [
    { label: 'Cơ bản', description: 'Thông tin cơ bản' },
    { label: 'Vị trí', description: 'Khu vực tìm kiếm' },
    { label: 'Ảnh', description: 'Ảnh hồ sơ' },
    { label: 'Giới thiệu', description: 'Về bản thân' },
    { label: 'Xem lại', description: 'Hoàn tất' },
];

const MatchingProfileSetupPage: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { profile, loading } = useAppSelector(state => state.matching);

    const [currentStep, setCurrentStep] = useState(1);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState<ProfileFormData>({
        sportPreferences: [],
        skillLevel: '',
        gender: '',
        location: {
            address: '',
            coordinates: [106.6297, 10.8231], // Default coordinates
            searchRadius: 10,
        },
        preferredGender: 'any',
        photos: [],
        skillLevelRange: 1,
    });

    // Load existing profile if available
    useEffect(() => {
        const loadProfile = async () => {
            try {
                const result = await dispatch(fetchMatchProfile()).unwrap();
                if (result) {
                    setFormData({
                        sportPreferences: result.sportPreferences || [],
                        skillLevel: result.skillLevel || '',
                        gender: result.gender || '',
                        age: result.age,
                        location: {
                            address: result.location?.address || '',
                            coordinates: result.location?.coordinates?.coordinates || [0, 0],
                            searchRadius: result.location?.searchRadius || 10,
                        },
                        preferredGender: result.preferredGender || 'any',
                        minAge: result.minAge,
                        maxAge: result.maxAge,
                        photos: result.photos || [],
                        bio: result.bio,
                        skillLevelRange: result.skillLevelRange || 1,
                    });
                }
            } catch (error) {
                // Profile doesn't exist yet, that's fine
            }
        };
        loadProfile();
    }, [dispatch]);

    const updateFormData = (data: Partial<ProfileFormData>) => {
        setFormData(prev => ({ ...prev, ...data }));
    };

    const handleUploadImage = async (file: File): Promise<string> => {
        const formDataUpload = new FormData();
        formDataUpload.append('file', file);

        try {
            const response = await axiosPrivate.post('/field-owner/registration-request/upload-document', formDataUpload, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data.data?.url || response.data.url;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Upload failed');
        }
    };

    const validateStep = (step: number): boolean => {
        switch (step) {
            case 1:
                if (!formData.sportPreferences || formData.sportPreferences.length === 0) {
                    toast.error('Vui lòng chọn ít nhất 1 môn thể thao');
                    return false;
                }
                if (!formData.skillLevel || formData.skillLevel === '') {
                    toast.error('Vui lòng chọn trình độ kỹ năng');
                    return false;
                }
                if (!formData.gender || formData.gender === '') {
                    toast.error('Vui lòng chọn giới tính');
                    return false;
                }
                return true;

            case 2:
                if (!formData.location?.address || formData.location.address.trim() === '') {
                    toast.error('Vui lòng nhập địa chỉ');
                    return false;
                }
                if (!formData.preferredGender || formData.preferredGender === '') {
                    toast.error('Vui lòng chọn giới tính ưu tiên');
                    return false;
                }
                // Validate coordinates if provided
                const hasCoords = formData.location.coordinates &&
                    (formData.location.coordinates[0] !== 0 || formData.location.coordinates[1] !== 0);

                if (!hasCoords) {
                    // Set default coordinates (can be updated later with geocoding)
                    updateFormData({
                        location: {
                            ...formData.location,
                            coordinates: [106.6297, 10.8231], // Default to Ho Chi Minh City
                        }
                    });
                }
                return true;

            case 3:
                // Photos are optional
                return true;

            case 4:
                // Bio is optional
                return true;

            case 5:
                return true;

            default:
                return true;
        }
    };

    const handleNext = () => {
        if (validateStep(currentStep)) {
            setCurrentStep(prev => Math.min(prev + 1, STEPS.length));
        }
    };

    const handleBack = () => {
        setCurrentStep(prev => Math.max(prev - 1, 1));
    };

    const handleStepClick = (step: number) => {
        setCurrentStep(step);
    };

    const handleSubmit = async () => {
        // Final validation before submit
        if (!formData.sportPreferences || formData.sportPreferences.length === 0) {
            toast.error('Vui lòng chọn ít nhất 1 môn thể thao');
            setCurrentStep(1);
            return;
        }
        if (!formData.skillLevel || formData.skillLevel === '') {
            toast.error('Vui lòng chọn trình độ kỹ năng');
            setCurrentStep(1);
            return;
        }
        if (!formData.gender || formData.gender === '') {
            toast.error('Vui lòng chọn giới tính');
            setCurrentStep(1);
            return;
        }
        if (!formData.location?.address || formData.location.address.trim() === '') {
            toast.error('Vui lòng nhập địa chỉ');
            setCurrentStep(2);
            return;
        }
        if (!formData.preferredGender || formData.preferredGender === '') {
            toast.error('Vui lòng chọn giới tính ưu tiên');
            setCurrentStep(2);
            return;
        }

        setSubmitting(true);
        try {
            // Ensure coordinates are valid
            const coordinates = formData.location.coordinates &&
                (formData.location.coordinates[0] !== 0 || formData.location.coordinates[1] !== 0)
                ? formData.location.coordinates
                : [106.6297, 10.8231]; // Default to Ho Chi Minh City

            const payload = {
                sportPreferences: formData.sportPreferences,
                skillLevel: formData.skillLevel,
                gender: formData.gender,
                ...(formData.age && { age: formData.age }),
                location: {
                    address: formData.location.address,
                    coordinates: {
                        type: 'Point',
                        coordinates: coordinates,
                    },
                    searchRadius: formData.location.searchRadius,
                },
                preferredGender: formData.preferredGender,
                ...(formData.minAge && { minAge: formData.minAge }),
                ...(formData.maxAge && { maxAge: formData.maxAge }),
                photos: formData.photos || [],
                ...(formData.bio && formData.bio.trim() !== '' && { bio: formData.bio }),
                skillLevelRange: formData.skillLevelRange || 1,
                isActive: true,
            };

            await dispatch(createOrUpdateProfile(payload)).unwrap();
            toast.success('Hồ sơ đã được lưu thành công!');
            navigate('/matching/swipe');
        } catch (error: any) {
            toast.error(error || 'Có lỗi xảy ra khi lưu hồ sơ');
        } finally {
            setSubmitting(false);
        }
    };

    const isInitialSetup = !profile;

    if (loading && !profile) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 py-8">
            <div className="max-w-3xl mx-auto px-4">
                <Card className="shadow-lg">
                    <CardContent className="p-6 sm:p-8">
                        {isInitialSetup ? (
                            // Wizard Mode for new users
                            <>
                                <StepIndicator
                                    currentStep={currentStep}
                                    totalSteps={STEPS.length}
                                    steps={STEPS}
                                    onStepClick={handleStepClick}
                                />

                                <div className="mt-8">
                                    {currentStep === 1 && (
                                        <Step1BasicInfo formData={formData} onChange={updateFormData} />
                                    )}
                                    {currentStep === 2 && (
                                        <Step2Location formData={formData} onChange={updateFormData} />
                                    )}
                                    {currentStep === 3 && (
                                        <Step3Photos
                                            formData={formData}
                                            onChange={updateFormData}
                                            onUploadImage={handleUploadImage}
                                        />
                                    )}
                                    {currentStep === 4 && (
                                        <Step4BioAvailability formData={formData} onChange={updateFormData} />
                                    )}
                                    {currentStep === 5 && (
                                        <Step5Review formData={formData} onEdit={handleStepClick} />
                                    )}
                                </div>

                                <div className="flex items-center justify-between mt-8 pt-6 border-t">
                                    <Button
                                        variant="outline"
                                        onClick={handleBack}
                                        disabled={currentStep === 1 || submitting}
                                    >
                                        <ArrowLeft size={16} className="mr-2" />
                                        Quay lại
                                    </Button>

                                    {currentStep < STEPS.length ? (
                                        <Button onClick={handleNext} disabled={submitting}>
                                            Tiếp theo
                                            <ArrowRight size={16} className="ml-2" />
                                        </Button>
                                    ) : (
                                        <Button onClick={handleSubmit} disabled={submitting}>
                                            {submitting ? (
                                                <>
                                                    <Loader2 size={16} className="mr-2 animate-spin" />
                                                    Đang lưu...
                                                </>
                                            ) : (
                                                'Hoàn tất'
                                            )}
                                        </Button>
                                    )}
                                </div>
                            </>
                        ) : (
                            // Linear Form Mode for existing users
                            <div className="space-y-12">
                                <div className="border-b pb-4">
                                    <h1 className="text-3xl font-bold text-slate-900">Chỉnh sửa hồ sơ</h1>
                                    <p className="text-slate-600">Cập nhật thông tin tìm kiếm đối tác của bạn</p>
                                </div>

                                <section id="basic-info" className="space-y-6">
                                    <Step1BasicInfo formData={formData} onChange={updateFormData} />
                                </section>

                                <hr className="border-slate-200" />

                                <section id="location" className="space-y-6">
                                    <Step2Location formData={formData} onChange={updateFormData} />
                                </section>

                                <hr className="border-slate-200" />

                                <section id="photos" className="space-y-6">
                                    <Step3Photos
                                        formData={formData}
                                        onChange={updateFormData}
                                        onUploadImage={handleUploadImage}
                                    />
                                </section>

                                <hr className="border-slate-200" />

                                <section id="bio" className="space-y-6">
                                    <Step4BioAvailability formData={formData} onChange={updateFormData} />
                                </section>

                                <div className="pt-6 border-t flex justify-end gap-3">
                                    <Button variant="outline" onClick={() => navigate('/matching/swipe')} disabled={submitting}>
                                        Hủy
                                    </Button>
                                    <Button onClick={handleSubmit} disabled={submitting} className="min-w-[150px]">
                                        {submitting ? (
                                            <>
                                                <Loader2 size={16} className="mr-2 animate-spin" />
                                                Đang lưu...
                                            </>
                                        ) : (
                                            'Lưu thay đổi'
                                        )}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default MatchingProfileSetupPage;
