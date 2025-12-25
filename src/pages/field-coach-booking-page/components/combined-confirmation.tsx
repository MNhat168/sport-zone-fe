import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { MapPin, Calendar, Clock, DollarSign, CheckCircle2, User } from "lucide-react";

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
        <div className="flex flex-col items-center justify-center w-full max-w-5xl mx-auto py-8 px-4">
            {/* Header */}
            <div className="text-center mb-10 space-y-2">
                <div className="inline-flex items-center justify-center p-3 rounded-full bg-primary/10 mb-4 ring-1 ring-primary/20">
                    <CheckCircle2 className="w-8 h-8 text-primary" />
                </div>
                <h1 className="text-3xl font-bold text-foreground">
                    Xác nhận đặt lịch
                </h1>
                <p className="text-muted-foreground">
                    Vui lòng kiểm tra lại thông tin trước khi thanh toán
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full mb-8">
                {/* Field Booking Summary */}
                <Card className="border shadow-sm hover:shadow-md transition-shadow duration-300">
                    <CardHeader className="pb-4 border-b">
                        <CardTitle className="text-xl font-bold flex items-center gap-2 text-primary">
                            <MapPin className="w-5 h-5" />
                            Thông tin sân
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                        {/* Field Name */}
                        <div>
                            <p className="text-lg font-bold text-foreground">
                                {fieldData.fieldName}
                            </p>
                            <p className="text-sm font-medium text-muted-foreground">
                                {fieldData.courtName}
                            </p>
                        </div>

                        <div className="space-y-4">
                            {/* Location */}
                            <div className="flex items-start gap-3">
                                <div className="p-2 rounded-md bg-primary/5 text-primary">
                                    <MapPin className="w-4 h-4" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs font-semibold text-muted-foreground uppercase mb-0.5 text-start">Địa điểm</p>
                                    <p className="text-sm font-medium text-start">{fieldData.fieldLocation}</p>
                                </div>
                            </div>

                            {/* Date */}
                            <div className="flex items-start gap-3">
                                <div className="p-2 rounded-md bg-primary/5 text-primary">
                                    <Calendar className="w-4 h-4" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs font-semibold text-muted-foreground uppercase mb-0.5 text-start">Ngày</p>
                                    <p className="text-sm font-medium text-start">
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
                            <div className="flex items-start gap-3">
                                <div className="p-2 rounded-md bg-primary/5 text-primary">
                                    <Clock className="w-4 h-4" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs font-semibold text-muted-foreground uppercase mb-0.5 text-start">Thời gian</p>
                                    <div className="flex items-center gap-2">
                                        <p className="text-sm font-medium text-start">
                                            {fieldData.startTime} - {fieldData.endTime}
                                        </p>
                                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                                            {fieldHours} giờ
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Amenities */}
                        {selectedAmenities.length > 0 && (
                            <div className="bg-muted/30 p-4 rounded-lg border border-border/50">
                                <p className="text-xs font-semibold text-muted-foreground uppercase mb-3">Tiện ích</p>
                                <div className="space-y-2">
                                    {selectedAmenities.map(amenity => (
                                        <div key={amenity.id} className="flex justify-between items-center text-sm">
                                            <span className="text-foreground/80">{amenity.name}</span>
                                            <span className="font-medium text-primary">
                                                {formatVND(amenity.price)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <Separator />

                        {/* Field Total */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">Giá sân ({fieldHours} giờ)</span>
                                <span className="font-medium">{formatVND(fieldCourtTotal)}</span>
                            </div>
                            {amenitiesTotal > 0 && (
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground">Tiện ích</span>
                                    <span className="font-medium">{formatVND(amenitiesTotal)}</span>
                                </div>
                            )}
                            <div className="flex justify-between items-center pt-2 mt-2">
                                <span className="font-bold text-foreground">Tổng phí sân</span>
                                <span className="text-xl font-bold text-primary">{formatVND(fieldTotal)}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Coach Booking Summary */}
                <Card className="border shadow-sm hover:shadow-md transition-shadow duration-300">
                    <CardHeader className="pb-4 border-b">
                        <CardTitle className="text-xl font-bold flex items-center gap-2 text-secondary">
                            <User className="w-5 h-5" />
                            Thông tin huấn luyện viên
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                        {/* Coach Name */}
                        <div>
                            <p className="text-lg font-bold text-foreground">
                                {coachData.coachName}
                            </p>
                            <p className="text-sm font-medium text-secondary">
                                Huấn luyện viên chuyên nghiệp
                            </p>
                        </div>

                        <div className="space-y-4">
                            {/* Date */}
                            <div className="flex items-start gap-3">
                                <div className="p-2 rounded-md bg-secondary/5 text-secondary">
                                    <Calendar className="w-4 h-4" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs font-semibold text-muted-foreground uppercase mb-0.5 text-start">Ngày</p>
                                    <p className="text-sm font-medium text-start">
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
                            <div className="flex items-start gap-3">
                                <div className="p-2 rounded-md bg-secondary/5 text-secondary">
                                    <Clock className="w-4 h-4" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs font-semibold text-muted-foreground uppercase mb-0.5 text-start">Thời gian</p>
                                    <div className="flex items-center gap-2">
                                        <p className="text-sm font-medium text-start">
                                            {coachData.startTime} - {coachData.endTime}
                                        </p>
                                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-secondary/10 text-secondary">
                                            {coachHours} giờ
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Hourly Rate */}
                            <div className="flex items-start gap-3">
                                <div className="p-2 rounded-md bg-secondary/5 text-secondary">
                                    <DollarSign className="w-4 h-4" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs font-semibold text-muted-foreground uppercase mb-0.5 text-start">Giá theo giờ</p>
                                    <p className="text-sm font-medium text-start">
                                        {formatVND(coachData.pricePerHour)}/giờ
                                    </p>
                                </div>
                            </div>
                        </div>

                        <Separator className="my-6 opacity-0" /> {/* Spacer to align with field card if amenities exist, or just clear space */}

                        <div className="flex-1"></div> {/* Spacer */}

                        <Separator />


                        {/* Coach Total */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">Giá thuê ({coachHours} giờ)</span>
                                <span className="font-medium">{formatVND(coachTotal)}</span>
                            </div>
                            <div className="flex justify-between items-center pt-2 mt-2">
                                <span className="font-bold text-foreground">Tổng phí HLV</span>
                                <span className="text-xl font-bold text-secondary">{formatVND(coachTotal)}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Grand Total */}
            <Card className="w-full border shadow-md bg-background mb-8">
                <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex-1">
                            <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-1">Tổng thanh toán</p>
                            <p className="text-4xl font-bold text-primary">
                                {formatVND(grandTotal)}
                            </p>
                        </div>
                        <div className="flex gap-8 text-right">
                            <div className="space-y-1">
                                <p className="text-xs font-semibold text-muted-foreground uppercase">Sân</p>
                                <p className="text-lg font-bold text-foreground">{formatVND(fieldTotal)}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs font-semibold text-muted-foreground uppercase">HLV</p>
                                <p className="text-lg font-bold text-foreground">{formatVND(coachTotal)}</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex justify-center gap-4 w-full">
                <Button
                    variant="outline"
                    onClick={onBack}
                    className="h-12 px-8 min-w-[160px] text-base"
                >
                    Quay lại
                </Button>
                <Button
                    onClick={onContinue}
                    className="h-12 px-8 min-w-[160px] text-base bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg transition-all"
                >
                    Thanh toán
                </Button>
            </div>
        </div>
    )
};