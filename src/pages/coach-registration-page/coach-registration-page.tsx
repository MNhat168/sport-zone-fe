import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hook';
import { submitCoachRegistration, uploadCoachDocument, getMyCoachRegistration, type CreateCoachRegistrationPayload } from '@/features/coach-registration';
import { toast } from 'react-toastify';
import PersonalInfoStep from './PersonalInfoStep';
import CoachProfileStep from './CoachProfileStep';
import PhotosStep from './PhotosStep';
import ConfirmationStep from './ConfirmationStep';
import { NavbarDarkComponent } from "@/components/header/navbar-dark-component"
import { PageWrapper } from "@/components/layouts/page-wrapper"
import PageHeader from "@/components/header-banner/page-header"
import { Loading } from "@/components/ui/loading"
import { Card, CardContent } from "@/components/ui/card"

const STEPS = [
    { id: 1, name: 'Thông tin cá nhân & eKYC', component: PersonalInfoStep },
    { id: 2, name: 'Thông tin chuyên môn & Vị trí', component: CoachProfileStep },
    { id: 3, name: 'Hình ảnh & Chứng chỉ', component: PhotosStep },
    { id: 4, name: 'Xác nhận', component: ConfirmationStep },
];

const CoachRegistrationPage: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { currentRequest, loading } = useAppSelector((state) => state.coachRegistration);
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState<CreateCoachRegistrationPayload>({
        personalInfo: {
            fullName: '',
            idNumber: '',
            address: '',
        },
        sports: [],
        certification: '',
        hourlyRate: 0,
        bio: '',
        experience: '',
        locationAddress: '',
        locationCoordinates: undefined,
        profilePhoto: undefined,
        certificationPhotos: [],
    });

    // Check if user already has a pending registration request
    useEffect(() => {
        const checkExistingRegistration = async () => {
            try {
                await dispatch(getMyCoachRegistration()).unwrap();
            } catch (error) {
                // Ignore errors, just means no registration found
            }
        };
        checkExistingRegistration();
    }, [dispatch]);

    // Redirect if user has pending or approved registration
    useEffect(() => {
        if (currentRequest && (currentRequest.status === 'pending' || currentRequest.status === 'approved')) {
            toast.error("Bạn đã có đơn đăng ký đang được xử lý. Vui lòng chờ kết quả.");
            navigate("/coach-registration-status");
        }
    }, [currentRequest, navigate]);

    const updateFormData = (data: Partial<CreateCoachRegistrationPayload>) => {
        setFormData(prev => ({ ...prev, ...data }));
    };

    const handleNext = () => {
        if (currentStep < STEPS.length) {
            setCurrentStep(prev => prev + 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handlePrevious = () => {
        if (currentStep > 1) {
            setCurrentStep(prev => prev - 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            await dispatch(submitCoachRegistration(formData)).unwrap();
            toast.success('Đơn đăng ký đã được gửi thành công!');
            navigate('/coach-registration-status');
        } catch (error: any) {
            toast.error(error?.message || 'Không thể gửi đơn đăng ký. Vui lòng thử lại.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Show loading while checking registration status
    if (loading) {
        return (
            <>
                <NavbarDarkComponent />
                <PageWrapper>
                    <PageHeader
                        title="Đăng ký làm Huấn Luyện Viên"
                        breadcrumbs={[{ label: "Trang chủ", href: "/" }, { label: "Đăng ký huấn luyện viên" }]}
                    />
                    <div className="max-w-4xl mx-auto px-4 py-8">
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex flex-col items-center justify-center py-10 gap-4">
                                    <Loading size={48} className="text-green-600" />
                                    <p className="text-center text-gray-600">Đang kiểm tra trạng thái đăng ký...</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </PageWrapper>
            </>
        );
    }

    // Don't render form if user has pending/approved registration
    if (currentRequest && (currentRequest.status === 'pending' || currentRequest.status === 'approved')) {
        return null;
    }

    const CurrentStepComponent = STEPS[currentStep - 1].component;

    return (
        <>
            <NavbarDarkComponent />
            <PageWrapper>
                <PageHeader
                    title="Đăng ký làm Huấn Luyện Viên"
                    breadcrumbs={[{ label: "Trang chủ", href: "/" }, { label: "Đăng ký huấn luyện viên" }]}
                />

                <div className="max-w-4xl mx-auto px-4 py-8">
                    {/* Step Indicator */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between">
                            {STEPS.map((step, index) => (
                                <React.Fragment key={step.id}>
                                    <div className="flex flex-col items-center flex-1">
                                        <div
                                            className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${currentStep >= step.id
                                                ? 'bg-green-600 border-green-600 text-white'
                                                : 'bg-white border-gray-300 text-gray-400'
                                                }`}
                                        >
                                            {currentStep > step.id ? '✓' : step.id}
                                        </div>
                                        <p className={`text-xs mt-2 text-center ${currentStep >= step.id ? 'text-green-600 font-medium' : 'text-gray-400'
                                            }`}>
                                            {step.name}
                                        </p>
                                    </div>
                                    {index < STEPS.length - 1 && (
                                        <div
                                            className={`flex-1 h-1 mx-2 ${currentStep > step.id ? 'bg-green-600' : 'bg-gray-300'
                                                }`}
                                        />
                                    )}
                                </React.Fragment>
                            ))}
                        </div>
                    </div>

                    {/* Form Content */}
                    <div className="bg-white rounded-lg shadow-md p-8">
                        <CurrentStepComponent
                            formData={formData}
                            updateFormData={updateFormData}
                            onUploadDocument={async (file) => {
                                const result = await dispatch(uploadCoachDocument(file)).unwrap();
                                return result;
                            }}
                        />

                        {/* Navigation Buttons */}
                        <div className="flex justify-between mt-8 pt-6 border-t">
                            <button
                                type="button"
                                onClick={handlePrevious}
                                disabled={currentStep === 1}
                                className={`px-6 py-2 rounded-md ${currentStep === 1
                                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                    : 'bg-gray-600 text-white hover:bg-gray-700'
                                    }`}
                            >
                                Quay lại
                            </button>

                            {currentStep < STEPS.length ? (
                                <button
                                    type="button"
                                    onClick={handleNext}
                                    className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                                >
                                    Tiếp theo
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={handleSubmit}
                                    disabled={isSubmitting}
                                    className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400"
                                >
                                    {isSubmitting ? 'Đang gửi...' : 'Gửi đơn đăng ký'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </PageWrapper>
        </>
    );
};

export default CoachRegistrationPage;
