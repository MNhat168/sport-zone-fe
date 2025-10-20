Create Field - Postman Guide

1) JSON only (no images)
- Method: POST
- URL: {{VITE_API_URL}}/fields
- Headers: Content-Type: application/json
- Body (raw JSON): use create-field.raw.json
- Auth: Cookie-based (access_token, refresh_token) + Anti-forgery header if backend requires

2) Multipart (with images)
- Method: POST
- URL: {{VITE_API_URL}}/fields/with-images
- Body (form-data):
  - name: string
  - sportType: string
  - description: string
  - location: string
  - operatingHours: JSON string (copy from create-field.raw.json)
  - slotDuration: number
  - minSlots: number
  - maxSlots: number
  - priceRanges: JSON string (copy from create-field.raw.json)
  - basePrice: number
  - amenities: JSON string (optional)
  - images: one or multiple files (avatar named with suffix __avatar, gallery with suffix __gallery if you want to distinguish)

Notes
- {{VITE_API_URL}} should match your FE env and where cookies are valid.
- If backend uses ASP.NET Core Antiforgery, add header X-XSRF-TOKEN with the token from cookie .AspNetCore.Antiforgery.*.

