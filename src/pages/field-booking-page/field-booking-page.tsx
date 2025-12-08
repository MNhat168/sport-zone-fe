import { useEffect, useState } from "react";
import PageHeader from "@/components/header-banner/page-header";
import { NavbarDarkComponent } from "@/components/header/navbar-dark-component";
import { BookingFieldTabs } from "./component/booking-field-tabs";
import { BookingStep } from "@/components/enums/ENUMS";
import { BookCourtTab } from "./fieldTabs/bookCourt";
import { AmenitiesTab } from "./fieldTabs/amenities";
import { PersonalInfoTab } from "./fieldTabs/personalInfo";
import type { BookingFormData } from "./fieldTabs/personalInfo";
import { ConfirmCourtTab } from "./fieldTabs/confirmCourt";
import { PaymentV2 } from "./fieldTabs/payment-v2";
import { useLocation } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/store/hook";
import { getFieldById } from "@/features/field/fieldThunk";
import { LoginBenefitsBanner } from "@/components/auth/login-benefits-banner";
import { PageWrapper } from "@/components/layouts/page-wrapper";
import { useAuth } from "@/routes/auth-wrapper";
import axiosPublic from "@/utils/axios/axiosPublic";
import { FIELD_COURTS_API } from "@/features/field/fieldAPI";
 

const FieldBookingPage = () => {
    const breadcrumbs = [{ label: "Trang chủ", href: "/" }, { label: "Đặt sân" }];
    const location = useLocation();
    const dispatch = useAppDispatch();
    const currentField = useAppSelector((state) => state.field.currentField);
    const authUser = useAppSelector((state) => state.auth.user);
    const { isAuthenticated } = useAuth();

    // State để quản lý step hiện tại và booking data
    const [currentStep, setCurrentStep] = useState<BookingStep>(BookingStep.BOOK_COURT);
    const [bookingData, setBookingData] = useState<BookingFormData>({
        date: '',
        startTime: '',
        endTime: '',
        courtId: '',
        courtName: '',
        name: '',
        email: '',
        phone: '',
    });
    const [courts, setCourts] = useState<Array<{ id: string; name: string; courtNumber?: number }>>([]);
    const [courtsError, setCourtsError] = useState<string | null>(null);
    

    // State để quản lý banner khuyến khích đăng nhập
    const [showBenefitsBanner, setShowBenefitsBanner] = useState(true);

    // Amenities selection data
    const [selectedAmenityIds, setSelectedAmenityIds] = useState<string[]>([]);

    

    // Restore selected field on refresh: from URL ?fieldId= or localStorage
    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const urlFieldId = searchParams.get('fieldId');
        const stateFieldId = (location.state as any)?.fieldId;
        const storedFieldId = localStorage.getItem('selectedFieldId');
        const fieldId = urlFieldId || stateFieldId || storedFieldId;

        console.log('🔍 [FIELD BOOKING] Checking for field ID:', {
            urlFieldId,
            stateFieldId,
            storedFieldId,
            finalFieldId: fieldId,
            hasCurrentField: !!currentField,
            currentFieldId: currentField?.id
        });

        if (!currentField && fieldId) {
            console.log('📡 [FIELD BOOKING] Dispatching getFieldById for field:', fieldId);
            dispatch(getFieldById(fieldId));
        } else if (currentField) {
            console.log('✅ [FIELD BOOKING] Field already loaded:', {
                fieldId: currentField.id,
                fieldName: currentField.name,
                fieldLocation: currentField.location
            });
        }
    }, [location.search, location.state, currentField, dispatch]);

    

    // Persist currently selected field id for refresh
    useEffect(() => {
        if (currentField?.id) {
            console.log('💾 [FIELD BOOKING] Persisting field ID to localStorage:', {
                fieldId: currentField.id,
                fieldName: currentField.name
            });
            try { localStorage.setItem('selectedFieldId', currentField.id); } catch {
                // Ignore localStorage errors (e.g., in private browsing mode)
                console.warn('⚠️ [FIELD BOOKING] Failed to save field ID to localStorage');
            }
        }
    }, [currentField?.id, currentField?.name]);

    // Restore booking data from localStorage on mount (if user just logged in)
    useEffect(() => {
        if (authUser) {
            try {
                const raw = localStorage.getItem('bookingFormData');
                if (raw) {
                    const parsed = JSON.parse(raw);
                    if (parsed && typeof parsed === 'object') {
                        setBookingData(prev => ({
                            ...prev,
                            date: parsed.date ?? prev.date,
                            startTime: parsed.startTime ?? prev.startTime,
                            endTime: parsed.endTime ?? prev.endTime,
                            courtId: parsed.courtId ?? prev.courtId,
                            courtName: parsed.courtName ?? prev.courtName,
                            name: parsed.name ?? prev.name,
                            email: parsed.email ?? prev.email,
                            phone: parsed.phone ?? prev.phone,
                        }));
                        
                        // If we have complete booking data, move to amenities step
                        if (parsed.date && parsed.startTime && parsed.endTime) {
                            setCurrentStep(BookingStep.AMENITIES);
                        }
                    }
                }
            } catch (error) {
                console.warn('Failed to restore booking data from localStorage:', error);
            }
        }
    }, [authUser]);

    // Ẩn banner khi user đăng nhập
    useEffect(() => {
        if (isAuthenticated) {
            setShowBenefitsBanner(false);
        }
    }, [isAuthenticated]);

    // Fetch courts for the field
    useEffect(() => {
        const fetchCourts = async () => {
            if (!currentField?.id) return;
            try {
                setCourtsError(null);
                const response = await axiosPublic.get(FIELD_COURTS_API(currentField.id));
                const raw = response.data?.data || response.data || [];
                const mapped = Array.isArray(raw)
                    ? raw.map((c: any) => ({
                        id: c?._id || c?.id || '',
                        name: c?.name || c?.courtName || `Court ${c?.courtNumber ?? ''}`,
                        courtNumber: c?.courtNumber,
                    }))
                    : [];
                setCourts(mapped);
                // Auto-pick first court if none selected
                if (!bookingData.courtId && mapped.length > 0) {
                    setBookingData(prev => ({
                        ...prev,
                        courtId: mapped[0].id,
                        courtName: mapped[0].name,
                    }));
                }
            } catch (error: any) {
                console.error('Failed to fetch courts:', error);
                setCourtsError('Không thể tải danh sách sân con. Vui lòng thử lại.');
            }
        };
        fetchCourts();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentField?.id]);

    const handleBookCourtSubmit = (formData: BookingFormData) => {
        console.log('BookCourt submitted:', formData);

        // Cho phép tiếp tục đặt sân mà không cần đăng nhập
        setBookingData(formData);
        // Move to amenities selection before confirmation
        setCurrentStep(BookingStep.AMENITIES);
    };
    // Amenities navigation
    const handleAmenitiesBack = () => {
        setCurrentStep(BookingStep.BOOK_COURT);
    };

    const handleAmenitiesSubmit = (ids: string[]) => {
        setSelectedAmenityIds(ids);
        setCurrentStep(BookingStep.ORDER_CONFIRMATION);
    };


    const handlePersonalInfoSubmit = (formData: BookingFormData) => {
        console.log('PersonalInfo submitted:', formData);

        setBookingData(formData);
        setCurrentStep(BookingStep.PAYMENT);
    };

    const handleBackToConfirm = () => {
        // From Payment -> back to Personal Info
        setCurrentStep(BookingStep.PERSONAL_INFO);
    };

    // From Personal Info -> back to Confirm
    const handleBackToConfirmStep = () => {
        setCurrentStep(BookingStep.ORDER_CONFIRMATION);
    };

    const handlePaymentComplete = (formData: BookingFormData) => {
        console.log('Payment completed:', formData);

        // TODO: Implement API call to create booking
        alert('Booking and payment completed successfully!');
    };


    return (
        <>
            <NavbarDarkComponent />
            <PageWrapper>
                <PageHeader title="Đặt sân" breadcrumbs={breadcrumbs} />
                
                {/* Banner khuyến khích đăng nhập - chỉ hiển thị khi chưa đăng nhập */}
                {!isAuthenticated && showBenefitsBanner && (
                    <div className="w-full max-w-[1320px] mx-auto px-3 mt-4">
                        <LoginBenefitsBanner 
                            onClose={() => setShowBenefitsBanner(false)}
                            showCloseButton={true}
                        />
                    </div>
                )}
                
                <BookingFieldTabs
                    currentStep={currentStep}
                />

                {/* Conditional rendering based on current step */}
                {currentStep === BookingStep.AMENITIES && (
                    <AmenitiesTab
                        venue={currentField || undefined}
                        selectedAmenityIds={selectedAmenityIds}
                        onChangeSelected={setSelectedAmenityIds}
                        onBack={handleAmenitiesBack}
                        onSubmit={handleAmenitiesSubmit}
                    />
                )}
                {currentStep === BookingStep.BOOK_COURT && (
                    <BookCourtTab
                        onSubmit={handleBookCourtSubmit}
                        courts={courts}
                        courtsError={courtsError}
                    />
                )}

                {currentStep === BookingStep.PERSONAL_INFO && (
                    <PersonalInfoTab
                        bookingData={bookingData}
                        onSubmit={handlePersonalInfoSubmit}
                        onBack={handleBackToConfirmStep}
                        courts={courts}
                    />
                )}

                {currentStep === BookingStep.ORDER_CONFIRMATION && (
                    <ConfirmCourtTab
                        bookingData={bookingData}
                        selectedAmenityIds={selectedAmenityIds}
                        amenities={(currentField as any)?.amenities?.map((a: any) => ({
                            id: a?.amenityId,
                            name: a?.name,
                            price: Number(a?.price) || 0,
                        })) || []}
                        onSubmit={(data) => { setBookingData(data); setCurrentStep(BookingStep.PERSONAL_INFO); }}
                        onBack={() => { setCurrentStep(BookingStep.AMENITIES); }}
                        courts={courts}
                    />
                )}


                {currentStep === BookingStep.PAYMENT && (
                    <PaymentV2
                        bookingData={bookingData}
                        selectedAmenityIds={selectedAmenityIds}
                        amenities={(currentField as any)?.amenities?.map((a: any) => ({
                            id: a?.amenityId,
                            name: a?.name,
                            price: Number(a?.price) || 0,
                        })) || []}
                        onPaymentComplete={handlePaymentComplete}
                        onBack={handleBackToConfirm}
                        onCountdownExpired={() => {
                            // Reset to step 1 when countdown expires
                            setCurrentStep(BookingStep.BOOK_COURT);
                            setBookingData({
                                date: '',
                                startTime: '',
                                endTime: '',
                                courtId: '',
                                courtName: '',
                                name: '',
                                email: '',
                                phone: '',
                            });
                            setSelectedAmenityIds([]);
                        }}
                    />
                )}

            </PageWrapper>
        </>
    )
}

export default FieldBookingPage;