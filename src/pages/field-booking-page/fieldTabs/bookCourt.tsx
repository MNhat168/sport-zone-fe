import React, { useEffect, useState } from 'react';
import { Calendar, Clock, ArrowLeft, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Field } from '@/types/field-type';
import { useLocation } from 'react-router-dom';
import { useAppSelector } from '@/store/hook';

/**
 * Interface for booking form data
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

/**
 * Props for BookCourtTab component
 */
interface BookCourtTabProps {
    /**
     * Venue information to display
     */
    venue?: Field;
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
}

/**
 * BookCourtTab component - Displays booking form with venue details
 */
export const BookCourtTab: React.FC<BookCourtTabProps> = ({
    venue: venueProp,
    onSubmit,
    onBack,
    courts = [],
}) => {
    const location = useLocation();
    const currentField = useAppSelector((state) => state.field.currentField);
    const venue = (venueProp || currentField || (location.state as any)?.venue) as Field | undefined;
    const [formData, setFormData] = useState<BookingFormData>({
        date: '',
        startTime: '',
        endTime: '',
        court: '',
    });

    // Prefill form from localStorage if available
    useEffect(() => {
        try {
            const raw = localStorage.getItem('bookingFormData');
            if (!raw) return;
            const parsed = JSON.parse(raw);
            if (
                parsed &&
                typeof parsed === 'object' &&
                ('date' in parsed || 'startTime' in parsed || 'endTime' in parsed || 'court' in parsed)
            ) {
                setFormData(prev => ({
                    date: parsed.date ?? prev.date,
                    startTime: parsed.startTime ?? prev.startTime,
                    endTime: parsed.endTime ?? prev.endTime,
                    court: parsed.court ?? prev.court,
                    name: parsed.name ?? prev.name,
                    email: parsed.email ?? prev.email,
                    phone: parsed.phone ?? prev.phone,
                }));
            }
        } catch {
            // Ignore malformed storage
            console.warn('Failed to parse bookingFormData from localStorage');
        }
    }, []);

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

    const calculateSubtotal = (): number => {
        if (!formData.startTime || !formData.endTime) {
            return 0;
        }
        
        try {
            // Parse time strings to calculate duration
            const [startHour, startMinute] = formData.startTime.split(':').map(Number);
            const [endHour, endMinute] = formData.endTime.split(':').map(Number);
            
            // Convert to minutes for easier calculation
            const startTotalMinutes = startHour * 60 + startMinute;
            const endTotalMinutes = endHour * 60 + endMinute;
            
            // Calculate duration in hours
            const durationInMinutes = endTotalMinutes - startTotalMinutes;
            const durationInHours = durationInMinutes / 60;
            
            // Return 0 if negative duration (invalid time range)
            if (durationInHours <= 0) {
                return 0;
            }
            
            // Calculate total price: hours * price per hour
            return Math.round(durationInHours * venue.pricePerHour * 100) / 100; // Round to 2 decimal places
        } catch (error) {
            console.error('Error calculating subtotal:', error);
            return 0;
        }
    };

    const handleSubmit = () => {
        // Validate form data before submitting
        if (!formData.date || !formData.startTime || !formData.endTime || !formData.court) {
            alert('Please fill in all required fields');
            return;
        }
        
        if (calculateSubtotal() <= 0) {
            alert('Please select a valid time range');
            return;
        }
        
        if (onSubmit) {
            onSubmit(formData);
            localStorage.setItem('bookingFormData', JSON.stringify(formData));
        }
    };

    return (
        <div className="w-full max-w-[1320px] mx-auto px-3 flex flex-col gap-10">
            {/* Header Card */}
            <Card className="border border-gray-200">
                <CardContent className="p-6">
                    <div className="pb-10">
                        <h1 className="text-2xl font-semibold font-['Outfit'] text-center text-[#1a1a1a] mb-1">
                            Book A Court
                        </h1>
                        <p className="text-base font-normal font-['Outfit'] text-center text-[#6b7280]">
                            Hassle-free court bookings and state-of-the-art facilities.
                        </p>
                    </div>

                    {/* Venue Info */}
                    <div className="p-6 bg-gray-50 rounded-lg">
                        <div className="flex flex-wrap items-start gap-6">
                            {/* Venue Image and Details */}
                            <div className="flex-1 min-w-[500px]">
                                <div className="flex items-start gap-4">
                                    {venue.images?.[0] && (
                                        <img
                                            src={venue.images[0]}
                                            alt={venue.name}
                                            className="w-24 h-28 rounded-lg object-cover"
                                        />
                                    )}
                                    <div className="flex-1">
                                        <h2 className="text-2xl font-semibold font-['Outfit'] text-[#1a1a1a] mb-2">
                                            {venue.name}
                                        </h2>
                                        <p className="text-base text-[#6b7280] font-['Outfit']">
                                            {venue.description}
                                        </p>
                                        <p className="text-sm text-[#6b7280] font-['Outfit'] mt-1">
                                            {venue.location}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Pricing Info */}
                            <div className="flex-1 min-w-[400px]">
                                <div className="px-24 py-6 bg-white rounded-lg flex items-center justify-center">
                                    <div className="text-center">
                                        <div className="flex items-baseline gap-1 justify-center">
                                            <span className="text-2xl font-semibold text-emerald-600">
                                                ${venue.pricePerHour}
                                            </span>
                                            <span className="text-sm text-gray-500">/hr</span>
                                        </div>
                                        <p className="text-sm text-[#1a1a1a] mt-1">Price per hour</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Main Content */}
            <div className="flex flex-wrap gap-6">
                {/* Booking Form */}
                <div className="flex-1 min-w-[600px]">
                    <Card className="border border-gray-200">
                        <CardHeader className="border-b border-gray-200">
                            <CardTitle className="text-2xl font-semibold font-['Outfit']">
                                Booking Form
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                            {/* Date Input */}
                            <div className="space-y-2.5">
                                <Label className="text-base font-normal font-['Outfit']">From</Label>
                                <Input
                                    type="date"
                                    value={formData.date}
                                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                                    className="h-14 bg-gray-50 border-0"
                                    placeholder="Select Date"
                                />
                            </div>

                            {/* Start Time */}
                            <div className="space-y-2.5">
                                <Label className="text-base font-normal font-['Outfit']">Start Time</Label>
                                <Input
                                    type="time"
                                    value={formData.startTime}
                                    onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                                    className="h-14 bg-gray-50 border-0"
                                    placeholder="Select Start Time"
                                />
                            </div>

                            {/* End Time */}
                            <div className="space-y-2.5">
                                <Label className="text-base font-normal font-['Outfit']">End Time</Label>
                                <Input
                                    type="time"
                                    value={formData.endTime}
                                    onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                                    className="h-14 bg-gray-50 border-0"
                                    placeholder="Select End Time"
                                />
                            </div>

                            {/* Court Selection */}
                            <div className="space-y-2.5">
                                <Label className="text-base font-normal font-['Outfit']">Court</Label>
                                <Select
                                    value={formData.court}
                                    onValueChange={(value) => setFormData(prev => ({ ...prev, court: value }))}
                                >
                                    <SelectTrigger className="h-14 bg-gray-50 border-0">
                                        <SelectValue placeholder="Select Court" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {courts.map(court => (
                                            <SelectItem key={court.id} value={court.id}>
                                                {court.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Guest Selection removed */}
                        </CardContent>
                    </Card>
                </div>

                {/* Booking Details Sidebar */}
                <div className="w-96">
                    <Card className="border border-gray-200">
                        <CardHeader className="border-b border-gray-200">
                            <CardTitle className="text-2xl font-semibold font-['Outfit']">
                                Booking Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-5">
                            {/* Court */}
                            <div className="flex items-center gap-2">
                                <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Calendar className="w-5 h-5 text-emerald-600" />
                                </div>
                                <span className="text-base text-[#6b7280] font-['Outfit']">
                                    {formData.court
                                        ? courts.find(c => c.id === formData.court)?.name
                                        : 'No court selected'}
                                </span>
                            </div>

                            {/* Date */}
                            <div className="flex items-center gap-2">
                                <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Calendar className="w-5 h-5 text-emerald-600" />
                                </div>
                                <span className="text-base text-[#6b7280] font-['Outfit']">
                                    {formData.date || 'No date selected'}
                                </span>
                            </div>

                            {/* Time */}
                            <div className="flex items-center gap-2">
                                <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Clock className="w-5 h-5 text-emerald-600" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-base text-[#6b7280] font-['Outfit']">
                                        {formData.startTime && formData.endTime
                                            ? `${formData.startTime} to ${formData.endTime}`
                                            : 'No time selected'}
                                    </span>
                                    {formData.startTime && formData.endTime && (
                                        <span className="text-sm text-emerald-600 font-['Outfit']">
                                            Duration: {(() => {
                                                const [startHour, startMinute] = formData.startTime.split(':').map(Number);
                                                const [endHour, endMinute] = formData.endTime.split(':').map(Number);
                                                const startTotal = startHour * 60 + startMinute;
                                                const endTotal = endHour * 60 + endMinute;
                                                const duration = (endTotal - startTotal) / 60;
                                                return duration > 0 ? `${duration} hours` : 'Invalid time range';
                                            })()}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Guests removed */}

                            {/* Subtotal */}
                            <div className="pt-2">
                                <Button
                                    className="w-full h-auto py-3 bg-emerald-700 hover:bg-emerald-800 text-white text-lg font-semibold font-['Outfit']"
                                    disabled
                                >
                                    Subtotal : ${calculateSubtotal()}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center items-center gap-5 py-5 bg-white/20 shadow-[0px_4px_44px_0px_rgba(211,211,211,0.25)]">
                <Button
                    variant="outline"
                    onClick={onBack}
                    className="px-5 py-3 bg-emerald-700 hover:bg-emerald-800 text-white border-emerald-700"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                </Button>
                <Button
                    onClick={handleSubmit}
                    className="px-5 py-3 bg-gray-800 hover:bg-gray-900 text-white"
                >
                    Next
                    <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
            </div>
        </div>
    );
};

export default BookCourtTab;