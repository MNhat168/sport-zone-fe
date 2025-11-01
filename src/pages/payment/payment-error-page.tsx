import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle } from 'lucide-react';

const ERROR_CODES: Record<string, string> = {
  '07': 'Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường).',
  '09': 'Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ InternetBanking tại ngân hàng.',
  '10': 'Giao dịch không thành công do: Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần',
  '11': 'Giao dịch không thành công do: Đã hết hạn chờ thanh toán. Xin quý khách vui lòng thực hiện lại giao dịch.',
  '12': 'Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng bị khóa.',
  '13': 'Giao dịch không thành công do Quý khách nhập sai mật khẩu xác thực giao dịch (OTP). Xin quý khách vui lòng thực hiện lại giao dịch.',
  '24': 'Giao dịch không thành công do: Khách hàng hủy giao dịch',
  '51': 'Giao dịch không thành công do: Tài khoản của quý khách không đủ số dư để thực hiện giao dịch.',
  '65': 'Giao dịch không thành công do: Tài khoản của Quý khách đã vượt quá hạn mức giao dịch trong ngày.',
  '75': 'Ngân hàng thanh toán đang bảo trì.',
  '79': 'Giao dịch không thành công do: KH nhập sai mật khẩu thanh toán quá số lần quy định. Xin quý khách vui lòng thực hiện lại giao dịch',
  '99': 'Các lỗi khác (lỗi còn lại, không có trong danh sách mã lỗi đã liệt kê)',
};

export default function PaymentErrorPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const message = searchParams.get('message');
  const code = searchParams.get('code');
  const orderId = searchParams.get('orderId');

  const errorMessage = code ? ERROR_CODES[code] || message || 'Thanh toán thất bại' : message || 'Thanh toán thất bại';

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-md">
        <CardContent className="p-8">
          <div className="flex flex-col items-center text-center space-y-4">
            <XCircle className="w-16 h-16 text-red-600" />
            <h2 className="text-2xl font-semibold text-gray-900">
              Thanh toán thất bại
            </h2>
            <p className="text-gray-600">
              {errorMessage}
            </p>
            
            {orderId && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg w-full text-left">
                <p className="text-sm text-gray-600">
                  <strong>Mã đơn hàng:</strong> {orderId}
                </p>
                {code && (
                  <p className="text-sm text-gray-600 mt-1">
                    <strong>Mã lỗi:</strong> {code}
                  </p>
                )}
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <Button
                onClick={() => navigate(-1)}
                variant="default"
              >
                Thử lại
              </Button>
              <Button
                onClick={() => navigate('/')}
                variant="outline"
              >
                Về trang chủ
              </Button>
            </div>

            <p className="text-xs text-gray-500 mt-4">
              Nếu bạn đã bị trừ tiền nhưng giao dịch không thành công,<br />
              vui lòng liên hệ bộ phận hỗ trợ.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
