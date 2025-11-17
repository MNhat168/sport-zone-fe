import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch } from '@/store/hook';
import { verifyVNPayPayment } from '@/features/transactions/transactionsThunk';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2, AlertCircle } from 'lucide-react';

/**
 * Payment verification result from backend
 */
interface PaymentVerificationResult {
  success: boolean;
  paymentStatus: 'succeeded' | 'failed' | 'pending' | string;
  bookingId: string;
  message: string;
  reason?: string;
}

/**
 * VNPay Return Page
 * Handles payment verification and booking confirmation after VNPay redirect
 */
export default function VNPayReturnPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [error, setError] = useState<string | null>(null);

  /**
   * Step 1: Verify payment with backend immediately
   * This triggers payment status update and booking confirmation
   * 
   * Note: VNPay redirects to backend endpoint which then redirects to /transactions/vnpay/return
   * Backend redirects to frontend with all query params from VNPay
   */
  useEffect(() => {
    const verifyPayment = async () => {
      try {
        console.log('[VNPay Return] Starting payment verification...');
        console.log('[VNPay Return] Full URL:', window.location.href);
        console.log('[VNPay Return] Location search:', location.search);
        console.log('[VNPay Return] Current pathname:', location.pathname);
        
        // VNPay redirects flow:
        // 1. VNPay -> Backend endpoint (verifies signature)
        // 2. Backend redirects -> /transactions/vnpay/return (with all VNPay query params)
        // 3. Frontend page verifies payment via API call
        
        // CRITICAL: Get the COMPLETE query string from VNPay redirect
        // VNPay redirects with params like: ?vnp_TxnRef=xxx&vnp_ResponseCode=00&vnp_SecureHash=yyy&...
        // We MUST pass ALL these params to verify endpoint, NOT create new ones
        const rawQueryString = location.search || window.location.search || '';
        
        console.log('[VNPay Return] Raw query string from URL:', rawQueryString);
        console.log('[VNPay Return] Query string length:', rawQueryString.length);
        
        // Parse to check what params we have
        const queryParams = new URLSearchParams(rawQueryString);
        
        // Log all query params to verify we're receiving them from VNPay
        const allParams: Record<string, string> = {};
        const paramKeys: string[] = [];
        queryParams.forEach((value, key) => {
          allParams[key] = value;
          paramKeys.push(key);
        });
        
        console.log('[VNPay Return] All param keys received:', paramKeys);
        
        // Extract important params for logging
        const orderId = queryParams.get('vnp_TxnRef');
        const responseCode = queryParams.get('vnp_ResponseCode');
        const secureHash = queryParams.get('vnp_SecureHash');
        const amountParam = queryParams.get('amount'); // This shouldn't be here if from VNPay
        const orderIdParam = queryParams.get('orderId'); // This shouldn't be here if from VNPay
        
        console.log('[VNPay Return] VNPay params:', {
          vnp_TxnRef: orderId,
          vnp_ResponseCode: responseCode,
          vnp_SecureHash: secureHash ? `${secureHash.substring(0, 20)}...` : 'MISSING',
          paramCount: paramKeys.length,
          hasAmount: !!amountParam,
          hasOrderId: !!orderIdParam,
          fullParams: allParams
        });

        // CRITICAL CHECK: If we have amount/orderId but NOT vnp_SecureHash, backend redirected incorrectly
        if ((amountParam || orderIdParam) && !secureHash) {
          console.error('[VNPay Return] ❌ ERROR: Backend redirected with amount/orderId instead of VNPay params!');
          console.error('[VNPay Return] Backend should redirect with VNPay query params from original redirect');
          console.error('[VNPay Return] Expected: ?vnp_TxnRef=...&vnp_ResponseCode=...&vnp_SecureHash=...');
          console.error('[VNPay Return] Got: ?amount=...&orderId=...');
          console.error('[VNPay Return] Backend must preserve VNPay params when redirecting!');
          setError('Backend không truyền đúng tham số từ VNPay. Vui lòng liên hệ admin.');
          setStatus('error');
          return;
        }

        // Verify we have the essential VNPay params
        if (!secureHash) {
          console.warn('[VNPay Return] ⚠️ vnp_SecureHash is missing from URL!');
          console.warn('[VNPay Return] This means VNPay did not redirect correctly.');
          console.warn('[VNPay Return] Please check:');
          console.warn('  1. Backend must preserve VNPay query params when redirecting');
          console.warn('  2. Backend should redirect to /transactions/vnpay/return with SAME query string from VNPay');
          console.warn('  3. VNPAY_RETURN_URL in backend .env should point to backend endpoint (which redirects to frontend)');
        }

        // Call verify endpoint via Redux thunk with COMPLETE query string from VNPay
        // IMPORTANT: Pass the raw query string EXACTLY as received, including leading '?'
        const queryString = rawQueryString || '';
        console.log('[VNPay Return] ✅ Sending COMPLETE query string to verify endpoint');
        console.log('[VNPay Return] Query string preview:', queryString.substring(0, 300) + (queryString.length > 300 ? '...' : ''));
        console.log('[VNPay Return] Query string contains vnp_SecureHash:', queryString.includes('vnp_SecureHash'));
        
        const result: PaymentVerificationResult = await dispatch(
          verifyVNPayPayment(queryString)
        ).unwrap();
        console.log('[VNPay Return] ✅ Verification result:', result);
        console.log('[VNPay Return] Result details:', {
          success: result.success,
          successType: typeof result.success,
          paymentStatus: result.paymentStatus,
          paymentStatusType: typeof result.paymentStatus,
          bookingId: result.bookingId,
          message: result.message,
          fullResult: JSON.stringify(result, null, 2)
        });


        // Đơn giản hóa: Chỉ dựa vào VNPay response code từ URL params
        // VNPay response code '00' = thanh toán thành công
        const vnpayResponseCode = queryParams.get('vnp_ResponseCode');
        const isSucceeded = vnpayResponseCode === '00';

        console.log('[VNPay Return] Payment status check:', {
          isSucceeded,
          vnpayResponseCode,
          message: isSucceeded ? 'VNPay báo thanh toán thành công' : `VNPay báo thanh toán thất bại (code: ${vnpayResponseCode})`
        });

        if (isSucceeded) {
          // Payment successful - lấy bookingId và redirect trực tiếp
          // Không cần polling, VNPay đã xác nhận thanh toán thành công
          console.log('[VNPay Return] ✅ VNPay báo thanh toán thành công!');
          
          // Lấy bookingId từ vnp_TxnRef (đây là booking ID từ VNPay)
          const bookingIdFromVNPay = queryParams.get('vnp_TxnRef') || result.bookingId;
          const bookingIdStr = bookingIdFromVNPay ? String(bookingIdFromVNPay).trim() : '';
          
          console.log('[VNPay Return] Booking ID:', bookingIdStr);
          
          // Hiển thị màn hình thành công và redirect sau 2 giây
          setStatus('success');
          setTimeout(() => {
            navigate('/user-booking-history', {
              state: { 
                message: 'Thanh toán thành công!',
                bookingId: bookingIdStr 
              }
            });
          }, 2000);
        } else {
          // Payment failed - VNPay response code không phải '00'
          const errorCode = queryParams.get('vnp_ResponseCode');
          
          console.log('[VNPay Return] ❌ VNPay báo thanh toán thất bại với code:', errorCode);
          
          // Lấy thông báo lỗi từ VNPay hoặc từ backend
          let errorMessage = 'Thanh toán thất bại';
          
          // VNPay error codes mapping
          const vnpayErrors: Record<string, string> = {
            '07': 'Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường).',
            '09': 'Thẻ/Tài khoản chưa đăng ký dịch vụ InternetBanking',
            '10': 'Xác thực thông tin thẻ/tài khoản không đúng. Quá 3 lần',
            '11': 'Đã hết hạn chờ thanh toán. Xin vui lòng thực hiện lại giao dịch.',
            '12': 'Thẻ/Tài khoản bị khóa.',
            '13': 'Nhập sai mật khẩu xác thực giao dịch (OTP). Quá 3 lần',
            '51': 'Tài khoản không đủ số dư để thực hiện giao dịch.',
            '65': 'Tài khoản đã vượt quá hạn mức giao dịch trong ngày.',
            '75': 'Ngân hàng thanh toán đang bảo trì.',
            '79': 'Nhập sai mật khẩu thanh toán quá số lần quy định.',
            '99': 'Lỗi không xác định'
          };
          
          if (errorCode && vnpayErrors[errorCode]) {
            errorMessage = vnpayErrors[errorCode];
          } else if (result.reason || result.message) {
            errorMessage = result.reason || result.message || errorMessage;
          }
          
          setError(errorMessage);
          setStatus('error');
        }
        
      } catch (err) {
        console.error('[VNPay Return] ❌ Verification error:', err);
        setError(err instanceof Error ? err.message : 'Failed to verify payment');
        setStatus('error');
      }
    };

    verifyPayment();
  }, [location.search, location.pathname, dispatch, navigate]);

  /**
   * Render: Verifying payment state
   */
  if (status === 'verifying') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="p-8">
            <div className="flex flex-col items-center text-center space-y-4">
              <Loader2 className="w-16 h-16 text-blue-600 animate-spin" />
              <h2 className="text-2xl font-semibold text-gray-900">
                Đang xác minh thanh toán
              </h2>
              <p className="text-gray-600">
                Vui lòng chờ trong giây lát...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  /**
   * Render: Success state (payment successful from VNPay)
   */
  if (status === 'success') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="p-8">
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                  Đặt sân thành công!
                </h2>
                <p className="text-gray-600">
                  Booking của bạn đã được xác nhận
                </p>
              </div>
              <Button
                onClick={() => navigate('/user-booking-history', {
                  state: { message: 'Thanh toán thành công!' }
                })}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                Xem danh sách đặt sân
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  /**
   * Render: Error state (payment failed)
   */
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-md">
        <CardContent className="p-8">
          <div className="flex flex-col items-center text-center space-y-6">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
              <XCircle className="w-12 h-12 text-red-600" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Thanh toán thất bại
              </h2>
              <div className="flex items-center justify-center gap-2 text-red-600 mb-4">
                <AlertCircle className="w-5 h-5" />
                <p>{error || 'Đã xảy ra lỗi khi xử lý thanh toán'}</p>
              </div>
              <p className="text-gray-600 text-sm">
                Đặt sân của bạn đã được hủy. Vui lòng thử lại.
              </p>
            </div>
            <div className="w-full space-y-2">
              <Button
                onClick={() => navigate('/fields')}
                className="w-full bg-red-600 hover:bg-red-700 text-white"
              >
                Quay lại danh sách sân
              </Button>
              <Button
                onClick={() => navigate('/user-booking-history', {
                  state: { message: 'Thanh toán thất bại' }
                })}
                variant="outline"
                className="w-full"
              >
                Xem danh sách đặt sân
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
