import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, Clock, DollarSign } from "lucide-react";

interface CombinedConfirmationProps {
    fieldData: {
        fieldName: string;
        courtName: string;
        fieldLocation: string;
        date: string;
        startTime: string;
        endTime: string;
        courtPrice: number;
        amenities: Array<{ id: string; name: string; price: number }>;
        amenityIds: string[];
    };
    coachData: {
        coachName: string;
        date: string;
        startTime: string;
        endTime: string;
        pricePerHour: number;
    };
    onContinue: () => void;
    onBack: () => void;
}

export const CombinedConfirmation = ({ fieldData, coachData, onContinue, onBack }: CombinedConfirmationProps) => {
    const formatVND = (value: number): string => {
        try {
            return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
        } catch {
            return `${value.toLocaleString('vi-VN')} ₫`;
        }
    };

    // Calculate field total
    const calculateFieldHours = () => {
        const start = parseInt(fieldData.startTime.split(':')[0]);
        const end = parseInt(fieldData.endTime.split(':')[0]);
        return end - start;
    };

    const fieldHours = calculateFieldHours();
    const fieldCourtTotal = fieldData.courtPrice * fieldHours;

    const selectedAmenities = fieldData.amenities.filter(a => fieldData.amenityIds.includes(a.id));
    const amenitiesTotal = selectedAmenities.reduce((sum, a) => sum + a.price, 0);
    const fieldTotal = fieldCourtTotal + amenitiesTotal;

    // Calculate coach total
    const calculateCoachHours = () => {
        const start = parseInt(coachData.startTime.split(':')[0]);
        const end = parseInt(coachData.endTime.split(':')[0]);
        return end - start;
    };

    const coachHours = calculateCoachHours();
    const coachTotal = coachData.pricePerHour * coachHours;

    // Grand total
    const grandTotal = fieldTotal + coachTotal;

    return (
        <div className="w-full max-w-[1320px] mx-auto px-3 py-10">
            {/* Header */}
            <div className="text-center mb-10">
                <h1 className="text-3xl font-semibold font-['Outfit'] text-[#1a1a1a] mb-2">
                    Xác nhận đặt sân và huấn luyện viên
                </h1>
                <p className="text-base text-gray-600 font-['Outfit']">
                    Vui lòng kiểm tra thông tin trước khi tiếp tục
                </p>
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
                {/* Field Booking Summary */}
                <Card className="border border-gray-200">
                    <CardHeader className="border-b border-gray-200 bg-emerald-50">
                        <CardTitle className="text-xl font-semibold font-['Outfit'] text-emerald-700">
                            Đặt sân
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                        {/* Field Name */}
                        <div>
                            <p className="text-sm text-gray-500 font-['Outfit'] mb-1">Tên sân</p>
                            <p className="text-lg font-semibold font-['Outfit'] text-[#1a1a1a]">
                                {fieldData.fieldName} - {fieldData.courtName}
                            </p>
                        </div>

                        {/* Location */}
                        <div className="flex items-start gap-2">
                            <MapPin className="w-5 h-5 text-gray-500 mt-0.5" />
                            <div>
                                <p className="text-sm text-gray-500 font-['Outfit'] mb-1">Địa điểm</p>
                                <p className="text-base font-['Outfit'] text-gray-700">{fieldData.fieldLocation}</p>
                            </div>
                        </div>

                        {/* Date */}
                        <div className="flex items-start gap-2">
                            <Calendar className="w-5 h-5 text-gray-500 mt-0.5" />
                            <div>
                                <p className="text-sm text-gray-500 font-['Outfit'] mb-1">Ngày</p>
                                <p className="text-base font-['Outfit'] text-gray-700">
                                    {new Date(fieldData.date).toLocaleDateString('vi-VN', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </p>
                            </div>
                        </div>

                        {/* Time */}
                        <div className="flex items-start gap-2">
                            <Clock className="w-5 h-5 text-gray-500 mt-0.5" />
                            <div>
                                <p className="text-sm text-gray-500 font-['Outfit'] mb-1">Thời gian</p>
                                <p className="text-base font-['Outfit'] text-gray-700">
                                    {fieldData.startTime} - {fieldData.endTime} ({fieldHours} giờ)
                                </p>
                            </div>
                        </div>

                        {/* Amenities */}
                        {selectedAmenities.length > 0 && (
                            <div>
                                <p className="text-sm text-gray-500 font-['Outfit'] mb-2">Tiện ích đã chọn</p>
                                <div className="space-y-1">
                                    {selectedAmenities.map(amenity => (
                                        <div key={amenity.id} className="flex justify-between items-center">
                                            <span className="text-sm font-['Outfit'] text-gray-700">{amenity.name}</span>
                                            <span className="text-sm font-semibold font-['Outfit'] text-emerald-600">
                                                {formatVND(amenity.price)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Field Total */}
                        <div className="pt-4 border-t border-gray-200">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-['Outfit'] text-gray-600">Giá sân ({fieldHours} giờ)</span>
                                <span className="text-sm font-semibold font-['Outfit']">{formatVND(fieldCourtTotal)}</span>
                            </div>
                            {amenitiesTotal > 0 && (
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-['Outfit'] text-gray-600">Tiện ích</span>
                                    <span className="text-sm font-semibold font-['Outfit']">{formatVND(amenitiesTotal)}</span>
                                </div>
                            )}
                            <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                                <span className="text-base font-semibold font-['Outfit'] text-gray-700">Tổng phụ sân</span>
                                <span className="text-xl font-bold font-['Outfit'] text-emerald-600">{formatVND(fieldTotal)}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Coach Booking Summary */}
                <Card className="border border-gray-200">
                    <CardHeader className="border-b border-gray-200 bg-blue-50">
                        <CardTitle className="text-xl font-semibold font-['Outfit'] text-blue-700">
                            Đặt huấn luyện viên
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                        {/* Coach Name */}
                        <div>
                            <p className="text-sm text-gray-500 font-['Outfit'] mb-1">Tên HLV</p>
                            <p className="text-lg font-semibold font-['Outfit'] text-[#1a1a1a]">
                                {coachData.coachName}
                            </p>
                        </div>

                        {/* Date */}
                        <div className="flex items-start gap-2">
                            <Calendar className="w-5 h-5 text-gray-500 mt-0.5" />
                            <div>
                                <p className="text-sm text-gray-500 font-['Outfit'] mb-1">Ngày</p>
                                <p className="text-base font-['Outfit'] text-gray-700">
                                    {new Date(coachData.date).toLocaleDateString('vi-VN', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </p>
                            </div>
                        </div>

                        {/* Time */}
                        <div className="flex items-start gap-2">
                            <Clock className="w-5 h-5 text-gray-500 mt-0.5" />
                            <div>
                                <p className="text-sm text-gray-500 font-['Outfit'] mb-1">Thời gian</p>
                                <p className="text-base font-['Outfit'] text-gray-700">
                                    {coachData.startTime} - {coachData.endTime} ({coachHours} giờ)
                                </p>
                            </div>
                        </div>

                        {/* Hourly Rate */}
                        <div className="flex items-start gap-2">
                            <DollarSign className="w-5 h-5 text-gray-500 mt-0.5" />
                            <div>
                                <p className="text-sm text-gray-500 font-['Outfit'] mb-1">Giá theo giờ</p>
                                <p className="text-base font-semibold font-['Outfit'] text-gray-700">
                                    {formatVND(coachData.pricePerHour)}/giờ
                                </p>
                            </div>
                        </div>

                        {/* Coach Total */}
                        <div className="pt-4 border-t border-gray-200">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-['Outfit'] text-gray-600">Giá HLV ({coachHours} giờ)</span>
                                <span className="text-sm font-semibold font-['Outfit']">{formatVND(coachTotal)}</span>
                            </div>
                            <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                                <span className="text-base font-semibold font-['Outfit'] text-gray-700">Tổng phụ HLV</span>
                                <span className="text-xl font-bold font-['Outfit'] text-blue-600">{formatVND(coachTotal)}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Grand Total */}
            <Card className="border-2 border-emerald-600 mb-10">
                <CardContent className="p-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-sm text-gray-600 font-['Outfit'] mb-1">Tổng cộng</p>
                            <p className="text-3xl font-bold font-['Outfit'] text-emerald-600">
                                {formatVND(grandTotal)}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-600 font-['Outfit']">Sân: {formatVND(fieldTotal)}</p>
                            <p className="text-sm text-gray-600 font-['Outfit']">HLV: {formatVND(coachTotal)}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex justify-center gap-5">
                <Button
                    variant="outline"
                    onClick={onBack}
                    className="px-8 py-3 font-['Outfit']"
                >
                    Quay lại
                </Button>
                <Button
                    onClick={onContinue}
                    className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-['Outfit']"
                >
                    Tiếp tục
                </Button>
            </div>
        </div>
    );
};
