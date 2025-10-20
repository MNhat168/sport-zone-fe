# Geolocation Service

Dịch vụ định vị địa lý cho ứng dụng SportZone, cung cấp khả năng lấy vị trí người dùng và gửi dữ liệu tọa độ về backend.

## Tính năng

- ✅ Lấy vị trí hiện tại của người dùng
- ✅ Theo dõi thay đổi vị trí
- ✅ Gửi tọa độ (lat, lng) về backend
- ✅ Xử lý lỗi và fallback
- ✅ Kiểm tra quyền truy cập
- ✅ React hook để sử dụng dễ dàng
- ✅ Component UI tái sử dụng

## Cấu trúc

```
src/utils/geolocation/
├── geolocation-service.ts    # Core service
├── location-api.ts          # API service để gửi dữ liệu về backend
├── index.ts                 # Export tất cả
└── README.md               # Tài liệu này

src/hooks/
└── useGeolocation.ts       # React hook

src/components/geolocation/
└── location-button.tsx     # Component UI tái sử dụng
```

## Cách sử dụng

### 1. Sử dụng React Hook

```tsx
import { useGeolocation } from '@/hooks/useGeolocation';

function MyComponent() {
  const {
    position,
    error,
    loading,
    supported,
    getCurrentPosition,
    getCoordinates
  } = useGeolocation();

  const handleGetLocation = async () => {
    const coordinates = await getCoordinates();
    if (coordinates) {
      console.log('Lat:', coordinates.lat);
      console.log('Lng:', coordinates.lng);
    }
  };

  return (
    <div>
      {supported ? (
        <button onClick={handleGetLocation} disabled={loading}>
          {loading ? 'Đang lấy vị trí...' : 'Lấy vị trí'}
        </button>
      ) : (
        <p>Trình duyệt không hỗ trợ định vị</p>
      )}
      
      {error && <p>Lỗi: {error.message}</p>}
    </div>
  );
}
```

### 2. Sử dụng Service trực tiếp

```tsx
import { geolocationService } from '@/utils/geolocation';

// Lấy vị trí hiện tại
const result = await geolocationService.getCurrentPosition();
if (result.success) {
  console.log('Latitude:', result.data.coords.latitude);
  console.log('Longitude:', result.data.coords.longitude);
}

// Lấy tọa độ đơn giản
const coordinates = await geolocationService.getCoordinates();
if (coordinates.success) {
  console.log('Lat:', coordinates.lat);
  console.log('Lng:', coordinates.lng);
}
```

### 3. Gửi dữ liệu về Backend

```tsx
import { locationAPIService } from '@/utils/geolocation';

// Gửi vị trí hiện tại
const result = await locationAPIService.sendLocation({
  latitude: 10.762622,
  longitude: 106.660172,
  accuracy: 10,
  timestamp: Date.now(),
  userId: 'user123' // optional
});

if (result.success) {
  console.log('Đã gửi vị trí thành công');
}

// Lấy sân gần đây
const nearbyFields = await locationAPIService.getNearbyFields({
  latitude: 10.762622,
  longitude: 106.660172,
  radius: 5, // km
  limit: 10
});
```

### 4. Sử dụng Component UI

```tsx
import { LocationButton } from '@/components/geolocation/location-button';

function MyPage() {
  const handleLocationObtained = (lat: number, lng: number) => {
    console.log('Vị trí:', lat, lng);
  };

  const handleLocationSent = (success: boolean) => {
    if (success) {
      console.log('Đã gửi vị trí về backend');
    }
  };

  return (
    <LocationButton
      onLocationObtained={handleLocationObtained}
      onLocationSent={handleLocationSent}
      showCoordinates={true}
      autoSendToBackend={true}
    />
  );
}
```

## API Endpoints

Backend cần implement các endpoints sau:

### 1. Gửi vị trí người dùng
```
POST /api/location/track
Content-Type: application/json

{
  "latitude": 10.762622,
  "longitude": 106.660172,
  "accuracy": 10,
  "timestamp": 1703123456789,
  "userId": "user123" // optional
}
```

### 2. Lấy sân gần đây
```
GET /api/location/nearby-fields?lat=10.762622&lng=106.660172&radius=5&limit=10
```

### 3. Cập nhật vị trí cuối
```
PUT /api/location/last-location
Content-Type: application/json

{
  "latitude": 10.762622,
  "longitude": 106.660172,
  "timestamp": 1703123456789
}
```

### 4. Lịch sử vị trí
```
GET /api/location/history?userId=user123&limit=50
```

## Cấu hình

### Geolocation Options

```tsx
const options = {
  enableHighAccuracy: true,  // Sử dụng GPS chính xác cao
  timeout: 10000,           // Timeout 10 giây
  maximumAge: 300000        // Cache 5 phút
};

const coordinates = await getCoordinates(options);
```

### Error Handling

```tsx
const { error } = useGeolocation();

if (error) {
  switch (error.code) {
    case 1: // PERMISSION_DENIED
      console.log('Người dùng từ chối cấp quyền');
      break;
    case 2: // POSITION_UNAVAILABLE
      console.log('Không thể lấy vị trí');
      break;
    case 3: // TIMEOUT
      console.log('Hết thời gian chờ');
      break;
  }
}
```

## Bảo mật và Quyền riêng tư

- ✅ Chỉ lấy vị trí khi người dùng đồng ý
- ✅ Không lưu trữ vị trí cục bộ
- ✅ Gửi dữ liệu qua HTTPS
- ✅ Có thể tắt tính năng định vị
- ✅ Hiển thị thông báo rõ ràng về việc sử dụng vị trí

## Browser Support

- ✅ Chrome 5+
- ✅ Firefox 3.5+
- ✅ Safari 5+
- ✅ Edge 12+
- ✅ Mobile browsers

## Ví dụ tích hợp

Xem file `src/pages/field-booking-page/fieldTabs/bookCourt.tsx` để xem ví dụ tích hợp đầy đủ trong trang đặt sân.
