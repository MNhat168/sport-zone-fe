# Field Create API Update - Summary

## Cập nhật ngày: 15/10/2025

### Tổng quan thay đổi

Đã cập nhật phần tạo sân (`create-field/with-images`) để phù hợp với API mới nhất của backend, bao gồm:

1. ✅ **Location format**: Từ string đơn giản → object có `address` và `geo.coordinates`
2. ✅ **Multipart form-data**: Loại bỏ header `Content-Type` để browser tự set boundary
3. ✅ **Cookie authentication**: Đã được cấu hình đúng với `withCredentials: true`
4. ✅ **Coordinates validation**: Kiểm tra tọa độ hợp lệ trước khi submit

---

## Chi tiết thay đổi

### 1. Type Definitions (`src/types/field-type.ts`)

**Thêm mới:**
```typescript
export interface FieldLocation {
    address: string;
    geo: {
        type: 'Point';
        coordinates: [number, number]; // [longitude, latitude]
    };
}
```

**Cập nhật:**
```typescript
export interface CreateFieldPayload {
    // ... other fields
    location: string | FieldLocation; // Hỗ trợ cả string (UI) và object (API)
}
```

### 2. Field Thunk (`src/features/field/fieldThunk.ts`)

#### A. `createFieldWithImages` - Multipart upload

**Thay đổi chính:**
- ❌ **Loại bỏ**: `Content-Type: multipart/form-data` header
- ✅ **Thêm**: `locationData` parameter để truyền tọa độ
- ✅ **Format location**: Convert sang JSON string với cấu trúc đúng

```typescript
// Signature mới
export const createFieldWithImages = createAsyncThunk<
    FieldResponse,
    { 
        payload: CreateFieldPayload; 
        images: File[]; 
        locationData?: FieldLocation  // Thêm parameter này
    },
    { rejectValue: ErrorResponse }
>
```

**Xử lý location:**
```typescript
// Ưu tiên locationData từ map, fallback về payload.location
let locationObject;
if (locationData && locationData.geo.coordinates[0] !== 0) {
    locationObject = locationData; // Từ map component
} else if (typeof payload.location === 'object') {
    locationObject = payload.location; // Từ payload
} else {
    locationObject = {
        address: payload.location,
        geo: { type: "Point", coordinates: [0, 0] }
    };
}
formData.append("location", JSON.stringify(locationObject));
```

**Headers:**
```typescript
// TRƯỚC (❌ SAI):
const response = await axiosPrivate.post(url, formData, {
    headers: { "Content-Type": "multipart/form-data" }
});

// SAU (✅ ĐÚNG):
const response = await axiosPrivate.post(url, formData);
// Browser tự động set: Content-Type: multipart/form-data; boundary=----WebKitFormBoundary...
```

#### B. `createField` - JSON upload

**Thay đổi:**
- ✅ Tự động convert `location` từ string → object nếu cần

```typescript
if (typeof requestPayload.location === 'string') {
    requestPayload = {
        ...requestPayload,
        location: {
            address: requestPayload.location,
            geo: { type: "Point", coordinates: [0, 0] }
        }
    };
}
```

### 3. Field Create Page (`src/pages/field-create-page/field-create-page.tsx`)

#### A. State Management

**Thêm state mới:**
```typescript
const [locationData, setLocationData] = useState<FieldLocation>({
    address: '',
    geo: { type: 'Point', coordinates: [0, 0] }
});
```

**Handler mới:**
```typescript
const handleLocationChange = useCallback((location: FieldLocation) => {
    setLocationData(location);
    setFormData(prev => ({
        ...prev,
        location: location.address
    }));
}, []);
```

#### B. Validation

**Thêm kiểm tra tọa độ:**
```typescript
// Check if coordinates are valid (not default 0,0)
if (locationData.geo.coordinates[0] === 0 && locationData.geo.coordinates[1] === 0) {
    CustomFailedToast('Vui lòng chọn vị trí sân trên bản đồ hoặc tìm kiếm địa chỉ');
    return false;
}
```

#### C. Submit Logic

**Truyền locationData vào thunk:**
```typescript
// Với images:
await dispatch(createFieldWithImages({ 
    payload: submitData, 
    images: filesToUpload,
    locationData: locationData  // ✅ Truyền tọa độ
})).unwrap();

// Không có images:
const payloadWithLocation = {
    ...submitData,
    location: locationData  // ✅ Gán object location
};
await dispatch(createField(payloadWithLocation)).unwrap();
```

#### D. Sample Data

**Cập nhật fill sample:**
```typescript
setLocationData({
    address: 'Đà Nẵng, Việt Nam',
    geo: {
        type: 'Point',
        coordinates: [108.2022, 16.0544] // Da Nang [lng, lat]
    }
});
```

#### E. LocationCard Integration

```typescript
<LocationCard 
    formData={formData}
    onInputChange={handleInputChange}
    onLocationChange={handleLocationChange}  // ✅ Thêm callback
/>
```

---

## Authentication - Cookie Setup

### Axios Configuration (`src/utils/axios/axiosPrivate.tsx`)

**Đã được cấu hình đúng:**
```typescript
const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    timeout: 60000,
    withCredentials: true,  // ✅ Gửi cookie tự động
    headers: {
        "Content-Type": "application/json",
    },
});
```

**Lưu ý:**
- Cookie được gửi tự động qua `withCredentials: true`
- Không cần set `Authorization: Bearer <token>`
- Backend sẽ đọc cookie `HttpOnly` để xác thực

---

## API Requirements Checklist

### Required Fields (Bắt buộc)
- ✅ `name` - string
- ✅ `sportType` - string (lowercase: football, tennis, ...)
- ✅ `description` - string
- ✅ `location` - object { address, geo.coordinates }
- ✅ `operatingHours` - array (ít nhất 1 ngày)
- ✅ `slotDuration` - number (string trong multipart)
- ✅ `minSlots` - number (string trong multipart)
- ✅ `maxSlots` - number (string trong multipart)
- ✅ `basePrice` - number (string trong multipart)

### Optional Fields
- ✅ `images` - file[] hoặc không gửi
- ✅ `amenities` - array hoặc không gửi
- ✅ `priceRanges` - array hoặc không gửi (auto tạo multiplier 1.0)

### Multipart Format Rules
- ✅ Tất cả số phải gửi dạng string: `"60"`, `"150000"`
- ✅ Object/Array phải stringify: `JSON.stringify(operatingHours)`
- ✅ Location phải stringify: `JSON.stringify({ address, geo })`
- ✅ KHÔNG set `Content-Type` header (browser tự set)

---

## Testing Checklist

### Before Testing
1. ✅ Đảm bảo đã login (có cookie authentication)
2. ✅ Kiểm tra role là Field Owner
3. ✅ Backend API đang chạy

### Test Cases

**Case 1: Tạo sân với ảnh**
```
1. Fill form basic info
2. Set location trên map (hoặc search)
3. Upload avatar + gallery images
4. Click "Lưu sân"
5. Verify: POST /fields/with-images
6. Check: Cookie được gửi đi
7. Check: Location có coordinates đúng
```

**Case 2: Tạo sân không có ảnh**
```
1. Fill form basic info
2. Set location trên map
3. Không upload ảnh
4. Click "Lưu sân"
5. Verify: POST /fields
6. Check: Location format đúng
```

**Case 3: Validation**
```
1. Không chọn location → Toast error
2. Coordinates = [0, 0] → Toast error
3. Không có operating hours → Toast error
```

---

## Debug Tips

### Console Logs
```typescript
// Trong fieldThunk.ts
console.log('[CreateField] Location data:', locationData);
console.log('[CreateField] FormData location:', formData.get('location'));

// Check cookie
console.log('Cookies:', document.cookie);

// Check request headers
// Xem trong Network tab: Request Headers > Cookie
```

### Common Errors & Solutions

**Error: "Invalid location format"**
- ✅ Check: `location` phải có `geo.coordinates`
- ✅ Check: coordinates phải là array `[lng, lat]`

**Error: "Authentication failed"**
- ✅ Check: Cookie có được gửi không (Network tab)
- ✅ Check: `withCredentials: true` trong axios

**Error: "Invalid multipart format"**
- ✅ Remove `Content-Type` header
- ✅ Check: All numbers are strings
- ✅ Check: Objects are JSON.stringify()

---

## Migration Notes

### Nếu đang dùng code cũ:

**1. Update imports:**
```typescript
import type { FieldLocation } from '@/types/field-type';
```

**2. Add location state:**
```typescript
const [locationData, setLocationData] = useState<FieldLocation>({
    address: '',
    geo: { type: 'Point', coordinates: [0, 0] }
});
```

**3. Update LocationCard:**
```typescript
<LocationCard 
    onLocationChange={(loc) => setLocationData(loc)}
/>
```

**4. Update submit:**
```typescript
await dispatch(createFieldWithImages({ 
    payload: data, 
    images: files,
    locationData: locationData  // Add this
}));
```

---

## References

- 📄 API Docs: `src/features/field/fieldAPI.md`
- 🔧 Backend endpoint: `POST /fields/with-images`
- 🍪 Cookie config: `src/utils/axios/axiosPrivate.tsx`
- 🗺️ Location component: `src/pages/field-create-page/component/field-create/LocationCard.tsx`

