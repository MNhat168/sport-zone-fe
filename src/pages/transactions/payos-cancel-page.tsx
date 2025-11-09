import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle, AlertCircle } from 'lucide-react';

/**
 * PayOS Cancel Page
 * Handles user cancellation from PayOS payment page
 */
export default function PayOSCancelPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [orderCode, setOrderCode] = useState<string | null>(null);

  useEffect(() => {
    // Extract orderCode from query params if available
    const orderCodeParam = searchParams.get('orderCode');
    if (orderCodeParam) {
      setOrderCode(orderCodeParam);
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <XCircle className="w-16 h-16 mx-auto mb-4 text-orange-600" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Thanh toán đã bị hủy
            </h2>
            <p className="text-gray-600 mb-4">
              Bạn đã hủy thanh toán qua PayOS. Đơn đặt sân của bạn chưa được xác nhận.
            </p>
            {orderCode && (
              <p className="text-sm text-gray-500 mb-4">
                Mã đơn: {orderCode}
              </p>
            )}
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-orange-800 text-left">
                  Nếu bạn muốn tiếp tục đặt sân, vui lòng quay lại và thực hiện lại thanh toán.
                </p>
              </div>
            </div>
            <div className="flex gap-3 justify-center mt-6">
              <Button
                onClick={() => navigate('/field-booking')}
                variant="default"
              >
                Đặt sân lại
              </Button>
              <Button
                onClick={() => navigate('/my-bookings')}
                variant="outline"
              >
                Xem đơn đặt của tôi
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}



