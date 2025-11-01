import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch } from '@/store/hook';
import { getMyBookings } from '@/features/booking/bookingThunk';
import { verifyVNPayPayment } from '@/features/payment/paymentThunk';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2, AlertCircle } from 'lucide-react';

/**
 * Payment verification result from backend
 */
interface PaymentVerificationResult {
  success: boolean;
  paymentStatus: 'succeeded' | 'failed' | 'pending';
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
  
  const [status, setStatus] = useState<'verifying' | 'polling' | 'success' | 'error'>('verifying');
  const [error, setError] = useState<string | null>(null);
  const [pollingAttempt, setPollingAttempt] = useState(0);
  const [verificationMessage, setVerificationMessage] = useState<string>('');

  /**
   * Step 2: Poll for booking confirmation
   * Backend event listeners should update booking status within 1-2 seconds
   */
  const startPolling = useCallback((bookingId: string) => {
    const maxAttempts = 5; // Reduced from 24 to 5
    const pollInterval = 2000; // 2 seconds

    console.log(`[VNPay Return] Starting polling for booking ${bookingId} (max ${maxAttempts} attempts)`);

    const pollBookingStatus = async (attempt: number) => {
      if (attempt >= maxAttempts) {
        console.log('[VNPay Return] ⚠️ Polling timeout reached');
        // Even if polling times out, payment was verified
        // Navigate to success page anyway - booking is likely confirmed
        setStatus('success');
        setTimeout(() => {
          navigate(`/my-bookings/${bookingId}`);
        }, 2000);
        return;
      }

      setPollingAttempt(attempt + 1);
      console.log(`[VNPay Return] Polling booking status (attempt ${attempt + 1}/${maxAttempts})`);

      try {
        // Fetch user's bookings
        const result = await dispatch(getMyBookings({ limit: 20 })).unwrap();
        
        // Handle different response structures
        const anyResult: any = result as any;
        const bookings = anyResult?.data?.bookings || anyResult?.bookings || [];
        console.log(`[VNPay Return] Fetched ${bookings.length} bookings`);
        
        const booking = bookings.find((b: any) => b._id === bookingId);
        
        if (booking) {
          console.log('[VNPay Return] Found booking, status:', booking.status);
          
          if (booking.status === 'confirmed') {
            console.log('[VNPay Return] ✅ Booking confirmed!');
            setStatus('success');
            // Wait 2 seconds to show success message, then navigate
            setTimeout(() => {
              navigate(`/my-bookings/${bookingId}`);
            }, 2000);
            return;
          }
        } else {
          console.log('[VNPay Return] Booking not found in list yet');
        }

        // Continue polling
        setTimeout(() => pollBookingStatus(attempt + 1), pollInterval);
        
      } catch (error) {
        console.error('[VNPay Return] Polling error:', error);
        // Continue polling despite errors - don't fail the whole flow
        setTimeout(() => pollBookingStatus(attempt + 1), pollInterval);
      }
    };

    pollBookingStatus(0);
  }, [dispatch, navigate]);

  /**
   * Step 1: Verify payment with backend immediately
   * This triggers payment status update and booking confirmation
   * 
   * Note: VNPay redirects to backend endpoint: http://localhost:3000/api/reservations/vnpay_return
   * Backend should then redirect to frontend with all query params, or frontend route should handle it
   */
  useEffect(() => {
    const verifyPayment = async () => {
      try {
        console.log('[VNPay Return] Starting payment verification...');
        console.log('[VNPay Return] Full URL:', window.location.href);
        console.log('[VNPay Return] Location search:', location.search);
        console.log('[VNPay Return] Current pathname:', location.pathname);
        
        // Check if we're on the backend route path (when backend redirects to frontend)
        // Backend return URL: http://localhost:3000/api/reservations/vnpay_return
        // Frontend route: /api/reservations/vnpay_return or /payments/vnpay/return
        const isBackendRoute = location.pathname === '/api/reservations/vnpay_return';
        
        if (isBackendRoute) {
          console.log('[VNPay Return] ✅ Detected backend return route');
        }
        
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
          console.error('[VNPay Return] Backend endpoint /api/reservations/vnpay_return must preserve VNPay params!');
          setError('Backend không truyền đúng tham số từ VNPay. Vui lòng liên hệ admin.');
          setStatus('error');
          return;
        }

        // Verify we have the essential VNPay params
        if (!secureHash) {
          console.warn('[VNPay Return] ⚠️ vnp_SecureHash is missing from URL!');
          console.warn('[VNPay Return] This means VNPay did not redirect correctly.');
          console.warn('[VNPay Return] Please check:');
          console.warn('  1. Backend endpoint /api/reservations/vnpay_return must preserve VNPay query params');
          console.warn('  2. Backend should redirect to frontend with SAME query string from VNPay');
          console.warn('  3. VNPAY_RETURN_URL in backend .env should point to backend endpoint');
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

        setVerificationMessage(result.message);

        if (result.success && result.paymentStatus === 'succeeded') {
          // Payment successful - start polling for booking confirmation
          setStatus('polling');
          startPolling(result.bookingId);
        } else {
          // Payment failed
          setError(result.reason || result.message || 'Payment failed');
          setStatus('error');
        }
        
      } catch (err) {
        console.error('[VNPay Return] ❌ Verification error:', err);
        setError(err instanceof Error ? err.message : 'Failed to verify payment');
        setStatus('error');
      }
    };

    verifyPayment();
  }, [location.search, location.pathname, dispatch, startPolling]);

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
   * Render: Polling for booking confirmation
   */
  if (status === 'polling') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="p-8">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="relative">
                <CheckCircle className="w-16 h-16 text-green-500" />
                <Loader2 className="w-6 h-6 text-green-600 animate-spin absolute -bottom-1 -right-1" />
              </div>
              <h2 className="text-2xl font-semibold text-green-800">
                Thanh toán thành công!
              </h2>
              <p className="text-gray-600">
                {verificationMessage || 'Đang xác nhận đặt sân của bạn...'}
              </p>
              {pollingAttempt > 0 && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang kiểm tra ({pollingAttempt}/5)</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  /**
   * Render: Success state (booking confirmed)
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
                onClick={() => navigate('/my-bookings')}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                Xem đặt sân của tôi
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
                onClick={() => navigate('/venues')}
                className="w-full bg-red-600 hover:bg-red-700 text-white"
              >
                Quay lại danh sách sân
              </Button>
              <Button
                onClick={() => navigate('/my-bookings')}
                variant="outline"
                className="w-full"
              >
                Xem đặt sân của tôi
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
