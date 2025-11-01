# VNPay Payment Flow Diagram

## Complete Flow Visualization

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         USER BOOKING FLOW                                │
└─────────────────────────────────────────────────────────────────────────┘

1. User Journey Through Booking Steps
┌──────────────┐   ┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│  Book Court  │ → │  Amenities   │ → │ Confirmation │ → │   Payment    │
│   (Step 1)   │   │   (Step 2)   │   │   (Step 3)   │   │   (Step 4)   │
└──────────────┘   └──────────────┘   └──────────────┘   └──────────────┘
     │                   │                   │                   │
     │ Select:           │ Select:           │ Review:           │ Select:
     │ - Field           │ - Amenities       │ - Date/Time       │ ✓ VNPay (New!)
     │ - Date            │ - Add note        │ - Amenities       │ - Credit Card
     │ - Time            │                   │ - Total Price     │ - Bank Transfer
     │                   │                   │                   │ - Cash
     └───────────────────┴───────────────────┴───────────────────┘


2. VNPay Payment Flow (When User Selects VNPay)
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                          │
│  Frontend                        Backend                    VNPay       │
│  ════════                        ═══════                    ═════       │
│                                                                          │
│  ┌────────────┐                                                         │
│  │   Click    │                                                         │
│  │  "Hoàn tất │                                                         │
│  │ thanh toán"│                                                         │
│  └─────┬──────┘                                                         │
│        │                                                                 │
│        │ 1. Create Booking                                              │
│        ├──────────────────────►┌──────────────────┐                    │
│        │                        │  POST /bookings  │                    │
│        │                        │  /field          │                    │
│        │                        │                  │                    │
│        │                        │ - fieldId        │                    │
│        │                        │ - date/time      │                    │
│        │                        │ - amenities      │                    │
│        │                        │ - paymentMethod:7│                    │
│        │                        │   (VNPAY)        │                    │
│        │                        └────────┬─────────┘                    │
│        │                                 │                              │
│        │                                 │ Creates:                     │
│        │                                 │ • Booking (pending)          │
│        │                                 │ • Payment (pending)          │
│        │ 2. Booking Created              │                              │
│        │◄────────────────────────────────┤                              │
│        │ { _id, payment: {...}, ...}     │                              │
│        │                                 │                              │
│        │ 3. Request VNPay URL            │                              │
│        ├──────────────────────►┌─────────┴────────┐                    │
│        │ GET /payments/         │ Create VNPay URL │                    │
│        │ create-vnpay-url?      │                  │                    │
│        │ amount=200000&         │ • Build params   │                    │
│        │ orderId=payment_id     │ • Sign with      │                    │
│        │                        │   HASH_SECRET    │                    │
│        │                        └─────────┬────────┘                    │
│        │                                  │                              │
│        │ 4. VNPay URL                     │                              │
│        │◄─────────────────────────────────┤                              │
│        │ { paymentUrl: "https://..." }    │                              │
│        │                                  │                              │
│  ┌─────┴──────┐                           │                              │
│  │  Redirect  │                           │                              │
│  │  to VNPay  │───────────────────────────┼──────────────►              │
│  │   URL      │                           │               ┌────────────┐│
│  └────────────┘                           │               │  VNPay     ││
│                                            │               │  Payment   ││
│                                            │               │  Gateway   ││
│                                            │               └─────┬──────┘│
│                                            │                     │       │
│                                            │      5. User pays   │       │
│                                            │         on VNPay    │       │
│                                            │                     │       │
│                                            │   6. IPN Callback   │       │
│                                            │  (Server-to-Server) │       │
│                       ┌────────────────────┤◄────────────────────┘       │
│                       │  GET /payments/    │                             │
│                       │  vnpay-ipn         │                             │
│                       │                    │                             │
│                       │  • Validate sig    │                             │
│                       │  • Update Payment  │                             │
│                       │    to "succeeded"  │                             │
│                       │  • Emit events     │                             │
│                       └────────────────────┘                             │
│                                   │                                      │
│                                   │   7. User Redirect                   │
│  ┌──────────────┐                 │   (to VNPAY_RETURN_URL)             │
│  │   /payments  │◄────────────────┼──────────────────────────           │
│  │ /vnpay/return│                 │                                      │
│  └──────┬───────┘                 │                                      │
│         │                         │                                      │
│         │ 8. Poll Payment Status  │                                      │
│         │  (every 2.5s for 60s)   │                                      │
│         ├─────────────────────────►┌──────────────────┐                 │
│         │ GET /bookings/my-bookings│ Get Bookings    │                 │
│         │                          │ with Payment    │                 │
│         │                          │ populated       │                 │
│         │                          └────────┬─────────┘                 │
│         │ 9. Check Payment Status          │                            │
│         │◄─────────────────────────────────┤                            │
│         │ { bookings: [{                   │                            │
│         │   payment: {                     │                            │
│         │     status: "succeeded"          │                            │
│         │   }                              │                            │
│         │ }]}                              │                            │
│         │                                  │                            │
│  ┌──────┴────────┐                        │                            │
│  │  Display      │                        │                            │
│  │  Success      │                        │                            │
│  │  Message      │                        │                            │
│  └───────────────┘                        │                            │
│                                            │                            │
└────────────────────────────────────────────┴────────────────────────────┘
```

## Payment Status States

```
┌──────────────────────────────────────────────────────────────┐
│              Payment Status Lifecycle                         │
└──────────────────────────────────────────────────────────────┘

  Booking Created
       │
       v
  ┌─────────┐
  │ PENDING │ ◄──── Initial state after booking creation
  └────┬────┘
       │
       ├──────► User completes payment on VNPay
       │        IPN updates status
       │
       v
  ┌───────────┐
  │ SUCCEEDED │ ◄──── Payment successful
  └───────────┘       • Booking confirmed
                      • User notified
                      • Email sent

       │
       │  (Alternative: Payment fails)
       │
       v
  ┌─────────┐
  │ FAILED  │ ◄──── Payment unsuccessful
  └─────────┘       • Booking remains pending
                    • User can retry payment
```

## Return Page States

```
┌──────────────────────────────────────────────────────────────┐
│         VNPay Return Page (/payments/vnpay/return)           │
└──────────────────────────────────────────────────────────────┘

  Landing on Return Page
       │
       v
  ┌──────────────┐
  │ PROCESSING   │ ◄──── Polling backend for payment status
  │ (Loading)    │       Shows spinner and "Đang xử lý..."
  └──────┬───────┘
         │
         ├─────► Poll every 2.5s (max 60s)
         │
         ├─────────────┬─────────────┬────────────┐
         │             │             │            │
         v             v             v            v
  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
  │ SUCCESS  │  │  FAILED  │  │ TIMEOUT  │  │  ERROR   │
  │          │  │          │  │          │  │          │
  │ Green ✓  │  │  Red ✗   │  │ Yellow ⚠ │  │  Red ⚠   │
  │          │  │          │  │          │  │          │
  │ Booking  │  │ Payment  │  │ Verify   │  │ Try      │
  │ confirmed│  │ failed   │  │ later    │  │ again    │
  └──────────┘  └──────────┘  └──────────┘  └──────────┘
       │             │             │            │
       │             │             │            │
       v             v             v            v
  [View        [Retry      [Check       [Go to
   Bookings]    Payment]    Bookings]    Home]
```

## Code Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                 Frontend Architecture                         │
└──────────────────────────────────────────────────────────────┘

src/
├── types/
│   ├── payment-type.ts ◄───── Payment interfaces & enums
│   └── booking-type.ts ◄───── Updated with payment field
│
├── features/
│   ├── payment/
│   │   ├── paymentAPI.ts ◄─── API endpoint constants
│   │   ├── paymentThunk.ts ◄─ Redux async actions
│   │   ├── paymentSlice.ts ◄─ Redux state management
│   │   └── index.ts
│   └── booking/
│       └── bookingThunk.ts ◄─ Updated to support paymentMethod
│
├── pages/
│   ├── payment/
│   │   └── vnpay-return-page.tsx ◄─ Return page with polling
│   └── field-booking-page/
│       └── fieldTabs/
│           └── payment.tsx ◄──────── VNPay integration
│
├── routes/
│   └── routes-config.tsx ◄────────── Added /payments/vnpay/return
│
└── store/
    └── store.ts ◄─────────────────── Added paymentReducer
```

## Key Functions Flow

### Payment Tab (payment.tsx)
```javascript
handlePayment()
    │
    ├─► if (paymentMethod === 'vnpay')
    │       └─► handleVNPayPayment()
    │               │
    │               ├─► createBookingCore()  // Step 1
    │               │       └─► dispatch(createFieldBooking({
    │               │             paymentMethod: 7,
    │               │             ...
    │               │           }))
    │               │
    │               ├─► dispatch(createVNPayUrl({  // Step 2
    │               │     amount,
    │               │     orderId: paymentId
    │               │   }))
    │               │
    │               └─► window.location.href = vnpayUrl  // Step 3
    │
    └─► else (other payment methods)
            └─► createBookingCore()
                └─► setPaymentStatus('success')
```

### VNPay Return Page (vnpay-return-page.tsx)
```javascript
useEffect()
    │
    └─► pollPaymentStatus()
            │
            ├─► dispatch(getMyBookings())
            │       └─► Find booking by ID/orderId/txnRef
            │
            ├─► Check payment.status
            │       │
            │       ├─► if 'succeeded' → setStatus('success')
            │       ├─► if 'failed' → setStatus('failed')
            │       └─► else → continue polling
            │
            └─► if (pollCount >= maxPolls)
                    └─► setStatus('timeout')
```

## Environment Configuration

### Backend (.env)
```env
VNPAY_TMN_CODE=your_merchant_code
VNPAY_HASH_SECRET=your_secret
VNPAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNPAY_RETURN_URL=http://localhost:5173/payments/vnpay/return
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3000
```

## Success Criteria Checklist

- [x] User can select VNPay payment method
- [x] Booking created with payment record
- [x] VNPay URL generated successfully
- [x] User redirected to VNPay gateway
- [x] IPN handler updates payment status
- [x] Return page polls for payment status
- [x] Success/failure states displayed correctly
- [x] User can navigate after payment
- [x] Error handling implemented
- [x] No linter errors
- [x] All TODO items completed

