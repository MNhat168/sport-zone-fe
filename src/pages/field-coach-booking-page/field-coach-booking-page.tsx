import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { NavbarDarkComponent } from "@/components/header/navbar-dark-component";
import PageHeader from "@/components/header-banner/page-header";
import { PageWrapper } from "@/components/layouts/page-wrapper";
import { CombinedBookingStep } from "@/components/enums/ENUMS";
import { FieldCoachBookingStepper } from "./field-coach-booking-stepper";
import { useAppDispatch, useAppSelector } from "@/store/hook";
import { getFieldById } from "@/features/field/fieldThunk";

// Import field booking components
import { BookCourtTab } from "../field-booking-page/fieldTabs/bookCourt";
import { AmenitiesTab } from "../field-booking-page/fieldTabs/amenities";
import { ConfirmCourtTab } from "../field-booking-page/fieldTabs/confirmCourt";
import { PersonalInfoTab } from "../field-booking-page/fieldTabs/personalInfo";
import type { BookingFormData } from "../field-booking-page/fieldTabs/personalInfo";

// Import new combined components
import { FieldListSelection } from "./components/field-list-selection";
import { CoachListSelection } from "./components/coach-list-selection";
import { CoachTimeSelection } from "./components/coach-time-selection";
import { CombinedConfirmation } from "./components/combined-confirmation";
import { CombinedPayment } from "./components/combined-payment";

import axiosPublic from "@/utils/axios/axiosPublic";
import { FIELD_COURTS_API } from "@/features/field/fieldAPI";

interface CombinedBookingData {
    field: {
        fieldId: string;
        fieldName: string;
        fieldLocation: string;
        date: string;
        startTime: string;
        endTime: string;
        courtId: string;
        courtName: string;
        courtPrice: number;
        amenityIds: string[];
    };
    coach: {
        coachId: string;
        coachName: string;
        coachPrice: number;
        date: string;
        startTime: string;
        endTime: string;
        note?: string;
    };
    user: {
        name: string;
        email: string;
        phone: string;
    };
}

const FieldCoachBookingPage = () => {
    const breadcrumbs = [
        { label: "Trang chủ", href: "/" },
        { label: "Đặt sân + HLV" }
    ];

    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const currentField = useAppSelector((state) => state.field.currentField);

    const [currentStep, setCurrentStep] = useState<CombinedBookingStep>(CombinedBookingStep.FIELD_LIST);
    const [courts, setCourts] = useState<Array<{ id: string; name: string; courtNumber?: number }>>([]);
    const [courtsError, setCourtsError] = useState<string | null>(null);
    const [selectedAmenityIds, setSelectedAmenityIds] = useState<string[]>([]);

    // Combined booking data state
    const [bookingData, setBookingData] = useState<CombinedBookingData>({
        field: {
            fieldId: '',
            fieldName: '',
            fieldLocation: '',
            date: '',
            startTime: '',
            endTime: '',
            courtId: '',
            courtName: '',
            courtPrice: 0,
            amenityIds: [],
        },
        coach: {
            coachId: '',
            coachName: '',
            coachPrice: 0,
            date: '',
            startTime: '',
            endTime: '',
            note: '',
        },
        user: {
            name: '',
            email: '',
            phone: '',
        },
    });

    // Only restore field if not on field list step
    useEffect(() => {
        if (currentStep === CombinedBookingStep.FIELD_LIST) return;

        const searchParams = new URLSearchParams(location.search);
        const urlFieldId = searchParams.get('fieldId');
        const stateFieldId = (location.state as any)?.fieldId;
        const storedFieldId = localStorage.getItem('selectedFieldId');
        const fieldId = urlFieldId || stateFieldId || storedFieldId;

        if (!currentField && fieldId) {
            dispatch(getFieldById(fieldId));
        }
    }, [location.search, location.state, currentField, dispatch, currentStep]);

    // Persist field ID
    useEffect(() => {
        if (currentField?.id) {
            localStorage.setItem('selectedFieldId', currentField.id);
            setBookingData(prev => ({
                ...prev,
                field: {
                    ...prev.field,
                    fieldId: currentField.id,
                    fieldName: currentField.name,
                    fieldLocation: currentField.location || '',
                    courtPrice: currentField.basePrice || 0,
                }
            }));
        }
    }, [currentField?.id, currentField?.name, currentField?.location, currentField?.basePrice]);

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
                if (!bookingData.field.courtId && mapped.length > 0) {
                    setBookingData(prev => ({
                        ...prev,
                        field: {
                            ...prev.field,
                            courtId: mapped[0].id,
                            courtName: mapped[0].name,
                        }
                    }));
                }
            } catch (error: any) {
                console.error('Failed to fetch courts:', error);
                setCourtsError('Không thể tải danh sách sân con. Vui lòng thử lại.');
            }
        };
        fetchCourts();
    }, [currentField?.id]);

    // ===== Field List Selection Handler =====
    const handleFieldSelect = (fieldId: string, fieldName: string, fieldLocation: string, fieldPrice: number) => {
        localStorage.setItem('selectedFieldId', fieldId);
        dispatch(getFieldById(fieldId));
        setBookingData(prev => ({
            ...prev,
            field: {
                ...prev.field,
                fieldId,
                fieldName,
                fieldLocation,
                courtPrice: fieldPrice,
            }
        }));
        setCurrentStep(CombinedBookingStep.FIELD_BOOK_COURT);
    };

    // ===== Field Booking Handlers =====
    const handleBookCourtSubmit = (formData: BookingFormData) => {
        setBookingData(prev => ({
            ...prev,
            field: {
                ...prev.field,
                date: formData.date,
                startTime: formData.startTime,
                endTime: formData.endTime,
                courtId: formData.courtId || '',
                courtName: formData.courtName || '',
            }
        }));
        setCurrentStep(CombinedBookingStep.FIELD_AMENITIES);
    };

    const handleAmenitiesBack = () => {
        setCurrentStep(CombinedBookingStep.FIELD_BOOK_COURT);
    };

    const handleAmenitiesSubmit = (ids: string[]) => {
        setSelectedAmenityIds(ids);
        setBookingData(prev => ({
            ...prev,
            field: {
                ...prev.field,
                amenityIds: ids,
            }
        }));
        setCurrentStep(CombinedBookingStep.FIELD_CONFIRM);
    };

    const handleFieldConfirmSubmit = (formData: BookingFormData) => {
        setBookingData(prev => ({
            ...prev,
            field: {
                ...prev.field,
                date: formData.date,
                startTime: formData.startTime,
                endTime: formData.endTime,
                courtId: formData.courtId || '',
                courtName: formData.courtName || '',
            }
        }));
        setCurrentStep(CombinedBookingStep.COACH_SELECT);
    };

    const handleFieldConfirmBack = () => {
        setCurrentStep(CombinedBookingStep.FIELD_AMENITIES);
    };

    // ===== Coach Selection Handlers =====
    const handleCoachSelect = (coachId: string, coachName: string, coachPrice: number) => {
        setBookingData(prev => ({
            ...prev,
            coach: {
                ...prev.coach,
                coachId,
                coachName,
                coachPrice,
            }
        }));
        setCurrentStep(CombinedBookingStep.COACH_TIME);
    };

    const handleCoachSelectBack = () => {
        setCurrentStep(CombinedBookingStep.FIELD_CONFIRM);
    };

    const handleCoachTimeSubmit = (data: { date: string; startTime: string; endTime: string; note?: string }) => {
        setBookingData(prev => ({
            ...prev,
            coach: {
                ...prev.coach,
                date: data.date,
                startTime: data.startTime,
                endTime: data.endTime,
                note: data.note,
            }
        }));
        setCurrentStep(CombinedBookingStep.COMBINED_CONFIRM);
    };

    const handleCoachTimeBack = () => {
        setCurrentStep(CombinedBookingStep.COACH_SELECT);
    };

    // ===== Combined Confirmation Handlers =====
    const handleCombinedConfirmContinue = () => {
        setCurrentStep(CombinedBookingStep.PERSONAL_INFO);
    };

    const handleCombinedConfirmBack = () => {
        setCurrentStep(CombinedBookingStep.COACH_TIME);
    };

    // ===== Personal Info Handlers =====
    const handlePersonalInfoSubmit = (formData: BookingFormData) => {
        setBookingData(prev => ({
            ...prev,
            user: {
                name: formData.name || '',
                email: formData.email || '',
                phone: formData.phone || '',
            }
        }));
        setCurrentStep(CombinedBookingStep.PAYMENT);
    };

    const handlePersonalInfoBack = () => {
        setCurrentStep(CombinedBookingStep.COMBINED_CONFIRM);
    };

    // ===== Payment Handlers =====
    const handlePaymentComplete = () => {
        // Clear all localStorage
        localStorage.removeItem('bookingFormData');
        localStorage.removeItem('selectedFieldId');
        localStorage.removeItem('amenitiesNote');

        // Navigate to success page or home
        navigate('/');
    };

    const handlePaymentBack = () => {
        setCurrentStep(CombinedBookingStep.PERSONAL_INFO);
    };

    // Calculate totals for payment
    const calculateFieldTotal = () => {
        const hours = bookingData.field.endTime && bookingData.field.startTime
            ? parseInt(bookingData.field.endTime.split(':')[0]) - parseInt(bookingData.field.startTime.split(':')[0])
            : 0;
        const courtTotal = bookingData.field.courtPrice * hours;

        const amenitiesTotal = (currentField as any)?.amenities
            ?.filter((a: any) => bookingData.field.amenityIds.includes(a.amenityId))
            .reduce((sum: number, a: any) => sum + (Number(a.price) || 0), 0) || 0;

        return courtTotal + amenitiesTotal;
    };

    const calculateCoachTotal = () => {
        const hours = bookingData.coach.endTime && bookingData.coach.startTime
            ? parseInt(bookingData.coach.endTime.split(':')[0]) - parseInt(bookingData.coach.startTime.split(':')[0])
            : 0;
        return bookingData.coach.coachPrice * hours;
    };

    const calculateGrandTotal = () => {
        return calculateFieldTotal() + calculateCoachTotal();
    };

    return (
        <>
            <NavbarDarkComponent />
            <PageWrapper>
                <PageHeader title="Đặt sân + HLV" breadcrumbs={breadcrumbs} />

                {/* Stepper */}
                <FieldCoachBookingStepper currentStep={currentStep} />

                {/* Step Content */}
                {currentStep === CombinedBookingStep.FIELD_LIST && (
                    <FieldListSelection onSelect={handleFieldSelect} />
                )}

                {currentStep === CombinedBookingStep.FIELD_BOOK_COURT && (
                    <BookCourtTab
                        onSubmit={handleBookCourtSubmit}
                        courts={courts}
                        courtsError={courtsError}
                    />
                )}

                {currentStep === CombinedBookingStep.FIELD_AMENITIES && (
                    <AmenitiesTab
                        venue={currentField || undefined}
                        selectedAmenityIds={selectedAmenityIds}
                        onChangeSelected={setSelectedAmenityIds}
                        onBack={handleAmenitiesBack}
                        onSubmit={handleAmenitiesSubmit}
                    />
                )}

                {currentStep === CombinedBookingStep.FIELD_CONFIRM && (
                    <ConfirmCourtTab
                        bookingData={{
                            date: bookingData.field.date,
                            startTime: bookingData.field.startTime,
                            endTime: bookingData.field.endTime,
                            courtId: bookingData.field.courtId,
                            courtName: bookingData.field.courtName,
                            name: '',
                            email: '',
                            phone: '',
                        }}
                        selectedAmenityIds={selectedAmenityIds}
                        amenities={(currentField as any)?.amenities?.map((a: any) => ({
                            id: a?.amenityId,
                            name: a?.name,
                            price: Number(a?.price) || 0,
                        })) || []}
                        onSubmit={handleFieldConfirmSubmit}
                        onBack={handleFieldConfirmBack}
                        courts={courts}
                    />
                )}

                {currentStep === CombinedBookingStep.COACH_SELECT && (
                    <CoachListSelection
                        onSelect={handleCoachSelect}
                        onBack={handleCoachSelectBack}
                    />
                )}

                {currentStep === CombinedBookingStep.COACH_TIME && (
                    <CoachTimeSelection
                        coachId={bookingData.coach.coachId}
                        coachName={bookingData.coach.coachName}
                        coachPrice={bookingData.coach.coachPrice}
                        onSubmit={handleCoachTimeSubmit}
                        onBack={handleCoachTimeBack}
                    />
                )}

                {currentStep === CombinedBookingStep.COMBINED_CONFIRM && (
                    <CombinedConfirmation
                        fieldData={{
                            fieldName: bookingData.field.fieldName,
                            courtName: bookingData.field.courtName,
                            fieldLocation: bookingData.field.fieldLocation,
                            date: bookingData.field.date,
                            startTime: bookingData.field.startTime,
                            endTime: bookingData.field.endTime,
                            courtPrice: bookingData.field.courtPrice,
                            amenities: (currentField as any)?.amenities?.map((a: any) => ({
                                id: a?.amenityId,
                                name: a?.name,
                                price: Number(a?.price) || 0,
                            })) || [],
                            amenityIds: bookingData.field.amenityIds,
                        }}
                        coachData={{
                            coachName: bookingData.coach.coachName,
                            date: bookingData.coach.date,
                            startTime: bookingData.coach.startTime,
                            endTime: bookingData.coach.endTime,
                            pricePerHour: bookingData.coach.coachPrice,
                        }}
                        onContinue={handleCombinedConfirmContinue}
                        onBack={handleCombinedConfirmBack}
                    />
                )}

                {currentStep === CombinedBookingStep.PERSONAL_INFO && (
                    <PersonalInfoTab
                        bookingData={{
                            date: bookingData.field.date,
                            startTime: bookingData.field.startTime,
                            endTime: bookingData.field.endTime,
                            courtId: bookingData.field.courtId,
                            courtName: bookingData.field.courtName,
                            name: bookingData.user.name,
                            email: bookingData.user.email,
                            phone: bookingData.user.phone,
                        }}
                        onSubmit={handlePersonalInfoSubmit}
                        onBack={handlePersonalInfoBack}
                        courts={courts}
                    />
                )}

                {currentStep === CombinedBookingStep.PAYMENT && (
                    <CombinedPayment
                        fieldData={{
                            fieldName: bookingData.field.fieldName,
                            courtPrice: bookingData.field.courtPrice * (bookingData.field.endTime && bookingData.field.startTime
                                ? parseInt(bookingData.field.endTime.split(':')[0]) - parseInt(bookingData.field.startTime.split(':')[0])
                                : 0),
                            amenitiesTotal: (currentField as any)?.amenities
                                ?.filter((a: any) => bookingData.field.amenityIds.includes(a.amenityId))
                                .reduce((sum: number, a: any) => sum + (Number(a.price) || 0), 0) || 0,
                        }}
                        coachData={{
                            coachName: bookingData.coach.coachName,
                            totalPrice: calculateCoachTotal(),
                        }}
                        totalAmount={calculateGrandTotal()}
                        onBack={handlePaymentBack}
                        onPaymentComplete={handlePaymentComplete}
                    />
                )}
            </PageWrapper>
        </>
    );
};

export default FieldCoachBookingPage;
