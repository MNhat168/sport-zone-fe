import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';

export default function PaymentSuccessPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const orderId = searchParams.get('orderId');
  const amount = searchParams.get('amount');
  const transactionId = searchParams.get('transactionId');

  useEffect(() => {
    // Auto redirect after 5 seconds
    const timer = setTimeout(() => {
      if (orderId) {
        navigate(`/my-bookings/${orderId}`);
      } else {
        navigate('/my-bookings');
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate, orderId]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-md">
        <CardContent className="p-8">
          <div className="flex flex-col items-center text-center space-y-4">
            <CheckCircle className="w-16 h-16 text-green-600" />
            <h2 className="text-2xl font-semibold text-gray-900">
              Thanh toán thành công!
            </h2>
            <p className="text-gray-600">
              Đơn hàng của bạn đã được xác nhận
            </p>
            
            {orderId && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg w-full text-left">
                <p className="text-sm text-gray-600">
                  <strong>Mã đơn hàng:</strong> {orderId}
                </p>
                {amount && (
                  <p className="text-sm text-gray-600 mt-1">
                    <strong>Số tiền:</strong> {(parseInt(amount) / 100).toLocaleString()} VND
                  </p>
                )}
                {transactionId && (
                  <p className="text-sm text-gray-600 mt-1">
                    <strong>Mã giao dịch:</strong> {transactionId}
                  </p>
                )}
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <Button
                onClick={() => navigate('/my-bookings')}
                variant="default"
              >
                Xem đơn hàng
              </Button>
              <Button
                onClick={() => navigate('/')}
                variant="outline"
              >
                Về trang chủ
              </Button>
            </div>

            <p className="text-sm text-gray-500 mt-4">
              Tự động chuyển hướng sau 5 giây...
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
