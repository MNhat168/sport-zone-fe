import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, User, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAppSelector } from "@/store/hook";
import { useLocation } from "react-router-dom";
import type { Field } from "@/types/field-type";

/**
 * Interface for booking form data
 */
interface BookingFormData {
    date: string;
    startTime: string;
    endTime: string;
    court?: string;
    name?: string;
    email?: string;
    phone?: string;
}

/**
 * Props for PersonalInfoTab component
 */
interface PersonalInfoTabProps {
    /**
     * Venue information to display
     */
    venue?: Field;
    /**
     * Booking form data from previous step
     */
    bookingData?: BookingFormData;
    /**
     * Callback when form is submitted
     */
    onSubmit?: (formData: BookingFormData) => void;
    /**
     * Callback for back button
     */
    onBack?: () => void;
    /**
     * Available courts list
     */
    courts?: Array<{ id: string; name: string }>;
    /**
     * Callback to show authentication popup
     */
    onShowAuthPopup?: () => void;
}

/**
 * PersonalInfoTab component - Collects user personal information for booking
 */
export const PersonalInfoTab: React.FC<PersonalInfoTabProps> = ({
    venue: venueProp,
    bookingData,
    onSubmit,
    onBack,
    courts = [],
    onShowAuthPopup,
}) => {
    const location = useLocation();
    const currentField = useAppSelector((state) => state.field.currentField);
    const venue = (venueProp || currentField || (location.state as any)?.venue) as Field | undefined;
    
    // Get user info from auth state
    const auth = useAppSelector((state) => state.auth);
    const currentUser = auth.user;

    // Form state with user info pre-filled
    const [formData, setFormData] = useState<BookingFormData>({
        date: bookingData?.date || '',
        startTime: bookingData?.startTime || '',
        endTime: bookingData?.endTime || '',
        court: bookingData?.court || '',
        name: bookingData?.name || currentUser?.fullName || '',
        email: bookingData?.email || currentUser?.email || '',
        phone: bookingData?.phone || currentUser?.phone || '',
    });

    const [notes, setNotes] = useState('');
    const [errors, setErrors] = useState<{[key: string]: string}>({});

    // Check authentication when component mounts
    useEffect(() => {
        if (!currentUser && onShowAuthPopup) {
            onShowAuthPopup();
        }
    }, [currentUser, onShowAuthPopup]);

    // Update form when user info changes
    useEffect(() => {
        if (currentUser && !bookingData?.name) {
            setFormData(prev => ({
                ...prev,
                name: currentUser.fullName || '',
                email: currentUser.email || '',
                phone: currentUser.phone || '',
            }));
        }
    }, [currentUser, bookingData]);

    // Helper function to format date
    const formatDate = (dateString: string): string => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', { 
            weekday: 'long', 
            year: 'numeric',
            month: 'long', 
            day: 'numeric' 
        });
    };

    // Helper function to format time
    const formatTime = (timeString: string): string => {
        if (!timeString) return '';
        const [hours, minutes] = timeString.split(':');
        const date = new Date();
        date.setHours(parseInt(hours), parseInt(minutes));
        return date.toLocaleTimeString('vi-VN', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false 
        });
    };

    // Form validation
    const validateForm = (): boolean => {
        const newErrors: {[key: string]: string} = {};

        if (!formData.name?.trim()) {
            newErrors.name = 'Full name is required';
        }

        if (!formData.email?.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        if (!formData.phone?.trim()) {
            newErrors.phone = 'Phone number is required';
        } else if (!/^[\d\s\-+()]{10,}$/.test(formData.phone.replace(/\s/g, ''))) {
            newErrors.phone = 'Please enter a valid phone number';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (field: keyof BookingFormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const handleSubmit = () => {
        if (!validateForm()) {
            return;
        }

        if (onSubmit) {
            onSubmit(formData);
        }
    };

    if (!venue) {
        return (
            <div className="w-full max-w-[1320px] mx-auto px-3 py-10">
                <Card className="border border-gray-200">
                    <CardContent className="p-6">
                        <p className="text-base text-[#6b7280]">No field selected. Please select a field to book.</p>
                        <div className="pt-4">
                            <Button variant="outline" onClick={onBack}>Back</Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="w-full max-w-[1320px] mx-auto px-3 flex flex-col gap-10">
            {/* Header Card */}
            <Card className="border border-gray-200">
                <CardContent className="p-6">
                    <div className="pb-10">
                        <h1 className="text-2xl font-semibold font-['Outfit'] text-center text-[#1a1a1a] mb-1">
                            Thông tin cá nhân
                        </h1>
                        <p className="text-base font-normal font-['Outfit'] text-center text-[#6b7280]">
                            Vui lòng xác nhận thông tin liên hệ cho đặt sân này.
                        </p>
                    </div>

                    {/* Booking Summary */}
                    <div className="p-6 bg-gray-50 rounded-lg">
                        <div className="flex flex-wrap items-center gap-8">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                                    <User className="w-6 h-6 text-emerald-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900">Sân</p>
                                    <p className="text-sm text-gray-600">
                                        {courts.find(c => c.id === formData.court)?.name || 'Selected Court'}
                                    </p>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <Mail className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900">Ngày</p>
                                    <p className="text-sm text-gray-600">
                                        {formatDate(formData.date) || 'Selected Date'}
                                    </p>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                    <Phone className="w-6 h-6 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900">Thời gian</p>
                                    <p className="text-sm text-gray-600">
                                        {formData.startTime && formData.endTime 
                                            ? `${formatTime(formData.startTime)} - ${formatTime(formData.endTime)}`
                                            : 'Selected Time'
                                        }
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Personal Information Form */}
            <div className="flex flex-wrap gap-6">
                {/* Form Section */}
                <div className="flex-1 min-w-[600px]">
                    <Card className="border border-gray-200">
                        <CardHeader className="border-b border-gray-200">
                            <CardTitle className="text-2xl font-semibold font-['Outfit']">
                                Thông tin liên hệ
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            {/* Full Name */}
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-base font-medium font-['Outfit']">
                                    Họ và tên *
                                </Label>
                                <Input
                                    id="name"
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => handleInputChange('name', e.target.value)}
                                    className={`h-14 bg-gray-50 border-0 ${errors.name ? 'border-red-500 border' : ''}`}
                                    placeholder="Nhập họ và tên của bạn"
                                />
                                {errors.name && (
                                    <p className="text-sm text-red-500 mt-1">{errors.name}</p>
                                )}
                            </div>

                            {/* Email */}
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-base font-medium font-['Outfit']">
                                    Email *
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => handleInputChange('email', e.target.value)}
                                    className={`h-14 bg-gray-50 border-0 ${errors.email ? 'border-red-500 border' : ''}`}
                                    placeholder="Nhập email của bạn"
                                />
                                {errors.email && (
                                    <p className="text-sm text-red-500 mt-1">{errors.email}</p>
                                )}
                            </div>

                            {/* Phone */}
                            <div className="space-y-2">
                                <Label htmlFor="phone" className="text-base font-medium font-['Outfit']">
                                    Số điện thoại *
                                </Label>
                                <Input
                                    id="phone"
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => handleInputChange('phone', e.target.value)}
                                    className={`h-14 bg-gray-50 border-0 ${errors.phone ? 'border-red-500 border' : ''}`}
                                    placeholder="Nhập số điện thoại của bạn"
                                />
                                {errors.phone && (
                                    <p className="text-sm text-red-500 mt-1">{errors.phone}</p>
                                )}
                            </div>

                            {/* Special Notes */}
                            <div className="space-y-2">
                                <Label htmlFor="notes" className="text-base font-medium font-['Outfit']">
                                    Ghi chú (không bắt buộc)
                                </Label>
                                <Textarea
                                    id="notes"
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    className="min-h-[100px] bg-gray-50 border-0"
                                    placeholder="Yêu cầu/ghi chú cho đặt sân..."
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* User Info Sidebar */}
                {/* <div className="w-96">
                    <Card className="border border-gray-200">
                        <CardHeader className="border-b border-gray-200">
                            <CardTitle className="text-xl font-semibold font-['Outfit']">
                                Account Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                            {currentUser ? (
                                <>
                                    <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg">
                                        <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                                            <User className="w-5 h-5 text-emerald-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">Logged in as</p>
                                            <p className="text-sm text-emerald-600 font-medium">
                                                {currentUser.fullName || currentUser.email}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-3">
                                        <div>
                                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Email</p>
                                            <p className="text-sm text-gray-900 mt-1">{currentUser.email}</p>
                                        </div>
                                        {currentUser.phone && (
                                            <div>
                                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Phone</p>
                                                <p className="text-sm text-gray-900 mt-1">{currentUser.phone}</p>
                                            </div>
                                        )}
                                        <div>
                                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Role</p>
                                            <p className="text-sm text-gray-900 mt-1 capitalize">{currentUser.role}</p>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center py-4">
                                    <p className="text-sm text-gray-500">Not logged in</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div> */}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center items-center gap-5 py-5 bg-white/20 shadow-[0px_4px_44px_0px_rgba(211,211,211,0.25)]">
                <Button
                    variant="outline"
                    onClick={onBack}
                    className="px-5 py-3 bg-emerald-700 hover:bg-emerald-800 text-white border-emerald-700"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Quay lại
                </Button>
                <Button
                    onClick={handleSubmit}
                    className="px-5 py-3 bg-gray-800 hover:bg-gray-900 text-white"
                    disabled={!formData.name || !formData.email || !formData.phone}
                >
                    Tiếp tục đến thanh toán
                    <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
            </div>
        </div>
    );
};

export default PersonalInfoTab;