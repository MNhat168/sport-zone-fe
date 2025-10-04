import { useEffect, useState } from "react";
import PageHeader from "@/components/header-banner/page-header";
import { NavbarDarkComponent } from "@/components/header/navbar-dark-component";
import { BookingFieldTabs } from "./component/booking-field-tabs";
import { BookingStep } from "@/components/enums/ENUMS";
import { BookCourtTab } from "./fieldTabs/bookCourt";
import { PersonalInfoTab } from "./fieldTabs/personalInfo";
import { ConfirmCourtTab } from "./fieldTabs/confirmCourt";
import { PaymentTab } from "./fieldTabs/payment";
import { useLocation } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/store/hook";
import { getFieldById } from "@/features/field/fieldThunk";
import { AuthRequiredPopup } from "@/components/auth/auth-required-popup";

/**
 * Interface for booking form data shared between steps
 */
interface BookingFormData {
    date: string;
    startTime: string;
    endTime: string;
    court: string;
    name?: string;
    email?: string;
    phone?: string;
}

const FieldBookingPage = () => {
    const breadcrumbs = [{ label: "Trang chủ", href: "/" }, { label: "Đặt sân" }];
    const location = useLocation();
    const dispatch = useAppDispatch();
    const currentField = useAppSelector((state) => state.field.currentField);
    const authUser = useAppSelector((state) => state.auth.user);
    
    // State để quản lý step hiện tại và booking data
    const [currentStep, setCurrentStep] = useState<BookingStep>(BookingStep.BOOK_COURT);
    const [bookingData, setBookingData] = useState<BookingFormData>({
        date: '',
        startTime: '',
        endTime: '',
        court: '',
        name: '',
        email: '',
        phone: '',
    });
    
    // State để quản lý popup yêu cầu đăng nhập
    const [showAuthPopup, setShowAuthPopup] = useState(false);

    // Restore selected field on refresh: from URL ?fieldId= or localStorage
    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const urlFieldId = searchParams.get('fieldId');
        const stateFieldId = (location.state as any)?.fieldId;
        const storedFieldId = localStorage.getItem('selectedFieldId');
        const fieldId = urlFieldId || stateFieldId || storedFieldId;
        if (!currentField && fieldId) {
            dispatch(getFieldById(fieldId));
        }
    }, [location.search, location.state, currentField, dispatch]);

    // Persist currently selected field id for refresh
    useEffect(() => {
        if (currentField?.id) {
            try { localStorage.setItem('selectedFieldId', currentField.id); } catch {
                // Ignore localStorage errors (e.g., in private browsing mode)
            }
        }
    }, [currentField?.id]);

    // Handle user login - if user logs in and we have pending booking data, continue the flow
    useEffect(() => {
        if (authUser && showAuthPopup) {
            setShowAuthPopup(false);
            // If we have booking data, continue to the next step
            if (bookingData.date && bookingData.startTime && bookingData.endTime && bookingData.court) {
                setCurrentStep(BookingStep.ORDER_CONFIRMATION);
            }
        }
    }, [authUser, showAuthPopup, bookingData]);

    // Mock courts data - thay thế bằng data thật từ API
    const mockCourts = [
        { id: 'court-1', name: 'Standard Synthetic Court 1' },
        { id: 'court-2', name: 'Standard Synthetic Court 2' },
        { id: 'court-3', name: 'Premium Court A' },
        { id: 'court-4', name: 'Premium Court B' },
    ];

    const handleBookCourtSubmit = (formData: BookingFormData) => {
        console.log('BookCourt submitted:', formData);
        
        // Kiểm tra xem người dùng đã đăng nhập chưa
        if (!authUser) {
            setShowAuthPopup(true);
            return;
        }
        
        setBookingData(formData);
        setCurrentStep(BookingStep.ORDER_CONFIRMATION);
    };

    const handlePersonalInfoSubmit = (formData: BookingFormData) => {
        console.log('PersonalInfo submitted:', formData);
        
        setBookingData(formData);
        setCurrentStep(BookingStep.PAYMENT);
    };

    const handleBackToBookCourt = () => {
        setCurrentStep(BookingStep.BOOK_COURT);
    };


    const handleConfirmSubmit = (formData: BookingFormData) => {
        console.log('Booking confirmed:', formData);
        
        setBookingData(formData);
        setCurrentStep(BookingStep.PERSONAL_INFO);
    };

    const handleBackToConfirm = () => {
        setCurrentStep(BookingStep.PERSONAL_INFO);
    };

    const handleBackToConfirmStep = () => {
        setCurrentStep(BookingStep.ORDER_CONFIRMATION);
    };

    const handlePaymentComplete = (formData: BookingFormData) => {
        console.log('Payment completed:', formData);
        
        // TODO: Implement API call to create booking
        alert('Booking and payment completed successfully!');
    };

    const handleShowAuthPopup = () => {
        setShowAuthPopup(true);
    };

    return (
        <>
            <NavbarDarkComponent />
            <PageHeader title="Đặt sân" breadcrumbs={breadcrumbs} />
            <BookingFieldTabs currentStep={currentStep} />
            
            {/* Conditional rendering based on current step */}
            {currentStep === BookingStep.BOOK_COURT && (
                <BookCourtTab 
                    onSubmit={handleBookCourtSubmit}
                    courts={mockCourts}
                />
            )}
            
            {currentStep === BookingStep.PERSONAL_INFO && (
                <PersonalInfoTab 
                    bookingData={bookingData}
                    onSubmit={handlePersonalInfoSubmit}
                    onBack={handleBackToConfirmStep}
                    courts={mockCourts}
                    onShowAuthPopup={handleShowAuthPopup}
                />
            )}
            
            {currentStep === BookingStep.ORDER_CONFIRMATION && (
                <ConfirmCourtTab 
                    bookingData={bookingData}
                    onSubmit={handleConfirmSubmit}
                    onBack={handleBackToBookCourt}
                    courts={mockCourts}
                />
            )}
            
            {currentStep === BookingStep.PAYMENT && (
                <PaymentTab 
                    bookingData={bookingData}
                    onPaymentComplete={handlePaymentComplete}
                    onBack={handleBackToConfirm}
                    courts={mockCourts}
                />
            )}
            
            {/* Authentication Required Popup */}
            <AuthRequiredPopup
                isOpen={showAuthPopup}
                onClose={() => setShowAuthPopup(false)}
                title="Yêu cầu đăng nhập"
                description="Bạn cần đăng nhập để tiếp tục đặt sân. Vui lòng đăng nhập hoặc đăng ký tài khoản mới."
            />
        </>
    )
}

export default FieldBookingPage;