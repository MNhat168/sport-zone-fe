import { useState } from "react";
import PageHeader from "@/components/header-banner/page-header";
import { NavbarDarkComponent } from "@/components/header/navbar-dark-component";
import { BookingFieldTabs } from "./component/booking-field-tabs";
import { BookingStep } from "@/components/enums/ENUMS";
import { BookCourtTab } from "./fieldTabs/bookCourt";
import { PersonalInfoTab } from "./fieldTabs/personalInfo";
import { ConfirmCourtTab } from "./fieldTabs/confirmCourt";
import { PaymentTab } from "./fieldTabs/payment";

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

    // Mock courts data - thay thế bằng data thật từ API
    const mockCourts = [
        { id: 'court-1', name: 'Standard Synthetic Court 1' },
        { id: 'court-2', name: 'Standard Synthetic Court 2' },
        { id: 'court-3', name: 'Premium Court A' },
        { id: 'court-4', name: 'Premium Court B' },
    ];

    const handleBookCourtSubmit = (formData: BookingFormData) => {
        console.log('BookCourt submitted:', formData);
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

    const handleBackToPersonalInfo = () => {
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
        </>
    )
}

export default FieldBookingPage;