import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertCircle } from "lucide-react";

interface CombinedPaymentProps {
    fieldData: {
        fieldName: string;
        courtPrice: number;
        amenitiesTotal: number;
    };
    coachData: {
        coachName: string;
        totalPrice: number;
    };
    totalAmount: number;
    onBack: () => void;
    onPaymentComplete: () => void;
}

export const CombinedPayment = ({ fieldData, coachData, totalAmount, onBack, onPaymentComplete }: CombinedPaymentProps) => {
    const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
    const [error, setError] = useState<string | null>(null);

    const formatVND = (value: number): string => {
        try {
            return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
        } catch {
            return `${value.toLocaleString('vi-VN')} ₫`;
        }
    };

    const handlePayment = async () => {
        setPaymentStatus('processing');
        setError(null);

        try {
            // TODO: Implement actual payment API call
            // For now, simulate successful payment after 2 seconds
            await new Promise(resolve => setTimeout(resolve, 2000));

            setPaymentStatus('success');
            setTimeout(() => {
                onPaymentComplete();
            }, 1500);
        } catch (err: any) {
            setPaymentStatus('error');
            setError(err.message || 'Có lỗi xảy ra khi thanh toán');
        }
    };

    if (paymentStatus === 'success') {
        return (
            <div className="w-full max-w-[1320px] mx-auto px-3 py-10">
                <Card className="border-2 border-emerald-600">
                    <CardContent className="p-10 text-center space-y-4">
                        <CheckCircle className="w-20 h-20 text-emerald-600 mx-auto" />
                        <h2 className="text-3xl font-bold text-emerald-700">
                            Thanh toán thành công!
                        </h2>
                        <p className="text-lg text-gray-700">
                            Đơn đặt sân và huấn luyện viên của bạn đã được xác nhận.
                        </p>
                        <p className="text-sm text-gray-600">
                            Email xác nhận sẽ được gửi đến hộp thư của bạn.
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="w-full max-w-[1320px] mx-auto px-3 py-10">
            {/* Header */}
            <div className="text-center mb-10">
                <h1 className="text-3xl font-semibold text-[#1a1a1a] mb-2">
                    Thanh toán
                </h1>
                <p className="text-base text-gray-600">
                    Hoàn tất thanh toán để xác nhận đặt sân và huấn luyện viên
                </p>
            </div>

            {/* Payment Summary */}
            <Card className="border border-gray-200 mb-6">
                <CardHeader className="border-b border-gray-200">
                    <CardTitle className="text-xl font-semibold">
                        Chi tiết thanh toán
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                    {/* Field Payment */}
                    <div className="p-4 bg-emerald-50 rounded-lg">
                        <h3 className="font-semibold text-emerald-700 mb-3">
                            Đặt sân - {fieldData.fieldName}
                        </h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Giá sân</span>
                                <span className="font-semibold">{formatVND(fieldData.courtPrice)}</span>
                            </div>
                            {fieldData.amenitiesTotal > 0 && (
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Tiện ích</span>
                                    <span className="font-semibold">{formatVND(fieldData.amenitiesTotal)}</span>
                                </div>
                            )}
                            <div className="flex justify-between pt-2 border-t border-emerald-200">
                                <span className="font-semibold">Tổng phụ sân</span>
                                <span className="font-bold text-emerald-600">
                                    {formatVND(fieldData.courtPrice + fieldData.amenitiesTotal)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Coach Payment */}
                    <div className="p-4 bg-blue-50 rounded-lg">
                        <h3 className="font-semibold text-blue-700 mb-3">
                            Đặt huấn luyện viên - {coachData.coachName}
                        </h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between pt-2 border-t border-blue-200">
                                <span className="font-semibold">Tổng phụ HLV</span>
                                <span className="font-bold text-blue-600">
                                    {formatVND(coachData.totalPrice)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Grand Total */}
                    <div className="p-6 bg-gradient-to-r from-emerald-600 to-blue-600 rounded-lg text-white">
                        <div className="flex justify-between items-center">
                            <span className="text-xl font-bold">Tổng cộng</span>
                            <span className="text-3xl font-bold">
                                {formatVND(totalAmount)}
                            </span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Payment Method Section */}
            <Card className="border border-gray-200 mb-6">
                <CardHeader className="border-b border-gray-200">
                    <CardTitle className="text-xl font-semibold">
                        Phương thức thanh toán
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    <Alert>
                        <AlertDescription>
                            <p>
                                Vui lòng chuyển khoản vào tài khoản ngân hàng và upload ảnh chứng minh thanh toán.
                            </p>
                            <p className="mt-2 text-sm text-gray-600">
                                <strong>Lưu ý:</strong> Chức năng thanh toán đầy đủ sẽ được bổ sung sau.
                                Hiện tại đây là phiên bản demo.
                            </p>
                        </AlertDescription>
                    </Alert>
                </CardContent>
            </Card>

            {/* Error Display */}
            {error && (
                <Alert variant="destructive" className="mb-6">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {/* Action Buttons */}
            <div className="flex justify-center gap-5">
                <Button
                    variant="outline"
                    onClick={onBack}
                    disabled={paymentStatus === 'processing'}
                    className="px-8 py-3"
                >
                    Quay lại
                </Button>
                <Button
                    onClick={handlePayment}
                    disabled={paymentStatus !== 'idle' && paymentStatus !== 'error'}
                    className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                    {paymentStatus === 'processing' ? 'Đang xử lý...' : 'Xác nhận thanh toán'}
                </Button>
            </div>
        </div>
    );
};
