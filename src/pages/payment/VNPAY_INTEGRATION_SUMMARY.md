# VNPay Integration Summary

## Overview
VNPay payment integration has been successfully implemented for the field booking system. Users can now pay for their field bookings using VNPay online payment gateway.

## What Was Implemented

### 1. Payment Types and API (`src/types/payment-type.ts` & `src/features/payment/paymentAPI.ts`)
- Created comprehensive payment type definitions
- Defined `PaymentMethod` enum (1-9) matching backend API
- Added `Payment` interface with status tracking
- Created API endpoints for:
  - Creating VNPay payment URL
  - Getting payment by booking ID
  - Updating payment status

### 2. Payment Redux Integration
**Files Created:**
- `src/features/payment/paymentThunk.ts` - Async thunks for payment operations
- `src/features/payment/paymentSlice.ts` - Redux slice for payment state management

**Store Updated:**
- `src/store/store.ts` - Added `paymentReducer` to the Redux store

### 3. Booking Types Updated (`src/types/booking-type.ts`)
- Added `paymentMethod?: number` to `CreateFieldBookingPayload`
- Added `paymentNote?: string` to `CreateFieldBookingPayload`
- Added `payment?: string | Payment` to `Booking` interface for payment reference

### 4. VNPay Return Page (`src/pages/payment/vnpay-return-page.tsx`)
Created a comprehensive return page that:
- Handles VNPay redirect after payment
- Polls backend every 2.5 seconds for up to 60 seconds
- Checks payment status (pending → succeeded/failed)
- Displays appropriate UI for:
  - Processing state (loading spinner)
  - Success state (green checkmark + booking details)
  - Failed state (red X + retry option)
  - Timeout state (yellow warning + instructions)
- Provides navigation options (view bookings, go home, retry payment)

### 5. Route Configuration (`src/routes/routes-config.tsx`)
- Added VNPay return page route: `/payments/vnpay/return`
- Made it publicly accessible (no authentication required)

### 6. Payment Tab Enhancement (`src/pages/field-booking-page/fieldTabs/payment.tsx`)
**Major Updates:**
- Added VNPay as a payment method option (set as default with "Recommended" badge)
- Implemented VNPay payment flow:
  1. Create booking with `paymentMethod: 7` (VNPay)
  2. Get `paymentId` from created booking
  3. Call `/payments/create-vnpay-url` with amount and paymentId
  4. Redirect user to VNPay payment URL
- Added `getPaymentMethodEnum()` helper to map UI selections to API enums
- Updated `createBookingCore()` to include `paymentMethod` and `paymentNote` in payload
- Enhanced UI with VNPay option featuring Wallet icon and badge

## User Flow

### VNPay Payment Flow
1. **User selects VNPay** on payment tab (recommended option)
2. **Click "Hoàn tất thanh toán"** button
3. **System creates booking** with status "pending" and payment record
4. **System generates VNPay URL** using booking's payment ID and total amount
5. **User redirected to VNPay** payment gateway
6. **User completes payment** on VNPay website
7. **VNPay calls IPN endpoint** (server-to-server) to update payment status
8. **VNPay redirects user back** to `/payments/vnpay/return`
9. **Return page polls backend** to check if payment status changed to "succeeded"
10. **Success message displayed** with booking confirmation details

### Backend IPN Flow (Automatic)
- VNPay → Backend IPN endpoint
- Backend validates signature
- Backend updates Payment status to "succeeded" or "failed"
- Backend emits notification events
- Frontend polling detects status change

## Payment Methods Supported

The UI now offers these payment options:
1. **VNPay** (PaymentMethod.VNPAY = 7) - Recommended, online payment
2. **Credit/Debit Card** (PaymentMethod.CREDIT_CARD = 3)
3. **Bank Transfer** (PaymentMethod.BANK_TRANSFER = 8)
4. **Cash at Venue** (PaymentMethod.CASH = 1)

## Important Configuration

### Backend Requirements
Ensure your backend `.env` has:
```env
VNPAY_TMN_CODE=your_merchant_code
VNPAY_HASH_SECRET=your_hash_secret
VNPAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNPAY_RETURN_URL=http://localhost:5173/payments/vnpay/return
```

**Note:** `VNPAY_RETURN_URL` must match your frontend VNPay return page URL.

### Frontend Environment
Your `VITE_API_URL` should point to the backend API:
```env
VITE_API_URL=http://localhost:3000
```

## API Endpoints Used

### Create VNPay URL
```
GET /payments/create-vnpay-url?amount={VND}&orderId={paymentId}
```
**Response:**
```json
{
  "paymentUrl": "https://sandbox.vnpayment.vn/..."
}
```

### Get My Bookings (with Payment)
```
GET /bookings/my-bookings?limit=10
```
**Response:**
```json
{
  "bookings": [
    {
      "_id": "booking_id",
      "payment": {
        "_id": "payment_id",
        "status": "succeeded",
        "amount": 200000,
        "method": 7,
        "transactionId": "TXN123"
      },
      ...
    }
  ]
}
```

## Testing Checklist

1. ✅ Select VNPay payment method
2. ✅ Complete booking and verify redirect to VNPay
3. ✅ Complete payment on VNPay sandbox
4. ✅ Verify return to `/payments/vnpay/return`
5. ✅ Verify polling detects payment success
6. ✅ Verify success message displays booking details
7. ✅ Test failure scenario (cancel on VNPay)
8. ✅ Verify timeout handling (if IPN is delayed)
9. ✅ Test navigation buttons (view bookings, go home)

## VNPay Sandbox Testing

For testing, use VNPay sandbox credentials:
- **Card Number:** 9704198526191432198
- **Card Holder:** NGUYEN VAN A
- **Expiry Date:** 07/15
- **OTP:** 123456 (or any 6 digits)

## Notes

1. **Idempotency:** Backend handles duplicate IPN calls automatically
2. **Security:** VNPay signature verification done on backend
3. **Polling:** Frontend polls for 60 seconds to catch payment status updates
4. **LocalStorage:** Stores `vnpayBookingId` to help return page identify booking
5. **URL Parameters:** Return page can accept `bookingId`, `orderId`, or `vnp_TxnRef` in URL
6. **Fallback:** If polling times out, user is instructed to check booking history

## Troubleshooting

### Payment URL not generated
- Check backend `VNPAY_TMN_CODE` and `VNPAY_HASH_SECRET`
- Verify booking was created successfully
- Check browser console for errors

### Polling timeout
- Verify IPN endpoint is accessible to VNPay
- Check backend logs for IPN calls
- Ensure `VNPAY_RETURN_URL` matches frontend URL

### Payment status not updating
- Check backend IPN handler logs
- Verify VNPay signature validation passes
- Check payment record in database

## Future Enhancements

Potential improvements:
1. Add WebSocket for real-time payment status updates (eliminate polling)
2. Add payment retry mechanism for failed payments
3. Add payment history page showing all transactions
4. Support partial refunds
5. Add payment receipt download functionality
6. Implement payment reminders for pending bookings

## Files Modified/Created

### Created Files:
- `src/types/payment-type.ts`
- `src/features/payment/paymentAPI.ts`
- `src/features/payment/paymentThunk.ts`
- `src/features/payment/paymentSlice.ts`
- `src/pages/payment/vnpay-return-page.tsx`

### Modified Files:
- `src/types/booking-type.ts`
- `src/routes/routes-config.tsx`
- `src/pages/field-booking-page/fieldTabs/payment.tsx`
- `src/store/store.ts`

## Documentation References
- Original VNPay integration guide: `src/pages/field-booking-page/Hướng dẫn tích hợp VNPay cho FE.txt`
- Booking API documentation: `src/pages/field-booking-page/BookingFieldAPI.md`

