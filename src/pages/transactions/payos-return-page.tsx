import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppDispatch } from '@/store/hook';
import { verifyPayOSPayment } from '@/features/transactions/transactionsThunk';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2, AlertCircle } from 'lucide-react';

/**
 * PayOS Return Page
 * Handles payment verification and booking confirmation after PayOS redirect
 */
export default function PayOSReturnPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const dispatch = useAppDispatch();
  
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [error, setError] = useState<string | null>(null);
  const [orderCode, setOrderCode] = useState<string | null>(null);
  const [amount, setAmount] = useState<number>(0);

  /**
   * Verify payment with backend immediately
   * This triggers payment status update and booking confirmation
   */
  useEffect(() => {
    const verifyPayment = async () => {
      try {
        console.log('[PayOS Return] Starting payment verification...');
        console.log('[PayOS Return] Full URL:', window.location.href);
        console.log('[PayOS Return] Location search:', location.search);
        
        // Get complete query string from PayOS redirect
        const rawQueryString = location.search || window.location.search || '';
        
        console.log('[PayOS Return] Raw query string:', rawQueryString);
        
        // Parse query params according to guide
        // Guide endpoint: GET /transactions/payos/return?orderCode=123456789
        const queryParams = new URLSearchParams(rawQueryString.startsWith('?') ? rawQueryString.slice(1) : rawQueryString);
        
        // Extract orderCode according to guide (required parameter)
        const orderCodeParam = queryParams.get('orderCode');
        const statusParam = queryParams.get('status');
        
        console.log('[PayOS Return] PayOS params:', {
          orderCode: orderCodeParam,
          status: statusParam,
          fullQuery: rawQueryString,
        });

        // Validate orderCode according to guide
        if (!orderCodeParam) {
          console.error('[PayOS Return] ❌ No orderCode in URL');
          setError('Không tìm thấy mã đơn hàng (orderCode). Vui lòng liên hệ admin.');
          setStatus('error');
          return;
        }

        // Validate orderCode is a number (as per guide)
        const orderCodeNumber = Number(orderCodeParam);
        if (!Number.isFinite(orderCodeNumber) || orderCodeNumber <= 0) {
          console.error('[PayOS Return] ❌ Invalid orderCode format:', orderCodeParam);
          setError('Mã đơn hàng không hợp lệ.');
          setStatus('error');
          return;
        }

        setOrderCode(orderCodeParam);

        // Call verify endpoint according to guide: GET /transactions/payos/return?orderCode=...
        // The backend should handle the query string properly
        console.log('[PayOS Return] ✅ Calling verify API with orderCode:', orderCodeNumber);
        console.log('[PayOS Return] Query string:', rawQueryString);
        
        const result = await dispatch(
          verifyPayOSPayment(rawQueryString)
        ).unwrap();
        
        console.log('[PayOS Return] ✅ Verification result:', result);

        // Check if payment succeeded based on status from query params
        const derivedStatus = statusParam ? statusParam.toUpperCase() : '';
        const isSucceeded =
          derivedStatus === 'PAID' ||
          derivedStatus === 'SUCCESS' ||
          result.paymentStatus === 'succeeded';

        if (isSucceeded && result.success) {
          // Payment successful
          console.log('[PayOS Return] ✅ PayOS payment successful!');
          
          setAmount(result.amount);
          setStatus('success');
          
          // Redirect to booking details after 2 seconds
          setTimeout(() => {
            if (result.bookingId) {
              navigate(`/my-bookings/${result.bookingId}`, {
                state: { message: 'Thanh toán thành công!' }
              });
            } else {
              navigate('/my-bookings', {
                state: { message: 'Thanh toán thành công!' }
              });
            }
          }, 2000);
        } else {
          // Payment failed
          console.log('[PayOS Return] ❌ PayOS payment failed');
          
          const errorMessage =
            result.reason ||
            result.message ||
            (derivedStatus ? `Thanh toán thất bại (status: ${derivedStatus})` : 'Thanh toán thất bại');
          setError(errorMessage);
          setStatus('error');
          
          // Redirect after 3 seconds
          setTimeout(() => {
            if (result.bookingId) {
              navigate(`/bookings/${result.bookingId}?payment=failed`);
            } else {
              navigate('/my-bookings');
            }
          }, 3000);
        }
      } catch (error: any) {
        console.error('[PayOS Return] ❌ Verification error:', error);
        setError(error.message || 'Có lỗi xảy ra khi xác thực thanh toán');
        setStatus('error');
        
        // Redirect to bookings after 3 seconds
        setTimeout(() => {
          navigate('/my-bookings');
        }, 3000);
      }
    };

    verifyPayment();
  }, [searchParams, dispatch, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          {status === 'verifying' && (
            <div className="text-center py-8">
              <Loader2 className="w-16 h-16 mx-auto mb-4 text-blue-600 animate-spin" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Đang xác nhận thanh toán...
              </h2>
              <p className="text-gray-600">
                Vui lòng chờ trong giây lát
              </p>
              {orderCode && (
                <p className="text-sm text-gray-500 mt-2">
                  Mã đơn: {orderCode}
                </p>
              )}
            </div>
          )}

          {status === 'success' && (
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-600" />
              <h2 className="text-2xl font-bold text-green-600 mb-2">
                ✅ Thanh toán thành công!
              </h2>
              <div className="space-y-2 text-gray-700">
                {orderCode && (
                  <p>
                    <span className="font-semibold">Mã đơn:</span> {orderCode}
                  </p>
                )}
                {amount > 0 && (
                  <p>
                    <span className="font-semibold">Số tiền:</span>{' '}
                    {amount.toLocaleString('vi-VN')} VND
                  </p>
                )}
              </div>
              <p className="text-gray-600 mt-4">
                Đang chuyển hướng...
              </p>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center py-8">
              <XCircle className="w-16 h-16 mx-auto mb-4 text-red-600" />
              <h2 className="text-2xl font-bold text-red-600 mb-2">
                ❌ Thanh toán thất bại
              </h2>
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-red-800 text-left">{error}</p>
                  </div>
                </div>
              )}
              {orderCode && (
                <p className="text-sm text-gray-500 mb-4">
                  Mã đơn: {orderCode}
                </p>
              )}
              <p className="text-gray-600 mb-4">
                Đang chuyển hướng...
              </p>
              <Button
                onClick={() => navigate('/my-bookings')}
                variant="outline"
                className="mt-2"
              >
                Quay lại trang đặt sân
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
