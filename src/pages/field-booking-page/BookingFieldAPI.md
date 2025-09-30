## Booking & Field API (for FE)

All responses are JSON. Unless marked Public, include Authorization header with Bearer access token.

- Authorization: Bearer <access_token>
- Base URL: /api (example); endpoints below are relative to server root.

### Bookings

1) Create field booking
- Method: POST
- Path: /bookings/field
- Auth: Required (Bearer)
- Body:
```json
{
  "scheduleId": "string",
  "slot": "string",
  "totalPrice": 0
}
```
- Success 201:
```json
{
  "_id": "string",
  "user": "string",
  "schedule": "string",
  "slot": "string",
  "type": "FIELD",
  "status": "PENDING",
  "totalPrice": 0
}
```

2) Cancel field booking
- Method: PATCH
- Path: /bookings/:id/cancel
- Auth: Required (Bearer)
- Params:
  - id: booking id (string)
- Body (optional):
```json
{ "cancellationReason": "string" }
```
- Success 200:
```json
{
  "_id": "string",
  "status": "CANCELLED",
  "cancellationReason": "string"
}
```

3) Create session booking (field + coach)
- Method: POST
- Path: /bookings/session
- Auth: Required (Bearer)
- Body:
```json
{
  "fieldScheduleId": "string",
  "coachScheduleId": "string",
  "fieldSlot": "string",
  "coachSlot": "string",
  "fieldPrice": 0,
  "coachPrice": 0
}
```
- Success 201:
```json
{
  "fieldBooking": {
    "_id": "string",
    "type": "FIELD",
    "status": "PENDING"
  },
  "coachBooking": {
    "_id": "string",
    "type": "COACH",
    "status": "PENDING"
  }
}
```

4) Cancel session booking (field + coach)
- Method: PATCH
- Path: /bookings/session/cancel
- Auth: Required (Bearer)
- Body:
```json
{
  "fieldBookingId": "string",
  "coachBookingId": "string",
  "cancellationReason": "string"
}
```
- Success 200:
```json
{
  "fieldBooking": { "_id": "string", "status": "CANCELLED" },
  "coachBooking": { "_id": "string", "status": "CANCELLED" }
}
```

5) Coach: get bookings by coach
- Method: GET
- Path: /bookings/coach/:coachId
- Auth: Optional (depends on gateway/policy)
- Params:
  - coachId: string
- Success 200: Array of booking objects (populated `user`, `schedule`, `requestedCoach`).

### Schedules

1) Get coach schedule by date range
- Method: GET
- Path: /schedules/coach/:coachId?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
- Auth: Public
- Params:
  - coachId: string
  - startDate, endDate: ISO date strings (YYYY-MM-DD)
- Success 200:
```json
[
  {
    "date": "2025-09-29T00:00:00.000Z",
    "isHoliday": false,
    "slots": [ { "time": "09:00", "available": true } ]
  }
]
```

2) Set coach holiday
- Method: POST
- Path: /schedules/set-holiday
- Auth: Depends on policy (likely admin/coach)
- Body:
```json
{ "coachId": "string", "startDate": "YYYY-MM-DD", "endDate": "YYYY-MM-DD" }
```
- Success 200:
```json
{ "modifiedCount": 1 }
```

Notes
- Auth user id in handlers is derived from JWT: `req.user.userId` (BE maps JWT payload to userId). Some legacy handlers fallback to `req.user._id` or `req.user.id` but FE should rely on JWT-bearing calls only.
- Price fields are numbers in smallest currency unit if specified by BE policy.
- Errors follow standard NestJS format with message and statusCode; JWT guards return structured errors for expired/invalid tokens.


