# Authentication Integration Guide

## 📝 Tổng quan

Đã tích hợp thành công API authentication từ backend NestJS vào shadcn-admin. Hệ thống sử dụng **HTTP-only cookies** để lưu trữ JWT tokens, đảm bảo bảo mật cao.

## 🔧 Các file đã tạo/cập nhật

### Files mới:
1. **`.env`** - Environment variables
2. **`src/lib/axios.ts`** - Axios instance với interceptors
3. **`src/services/auth.service.ts`** - Auth API service

### Files đã cập nhật:
1. **`src/stores/auth-store.ts`** - Cập nhật auth store với zustand persist
2. **`src/features/auth/sign-in/components/user-auth-form.tsx`** - Tích hợp API login thật
3. **`src/components/profile-dropdown.tsx`** - Hiển thị thông tin user từ API
4. **`src/components/sign-out-dialog.tsx`** - Gọi API logout
5. **`src/routes/_authenticated/route.tsx`** - Authentication guard với redirect

## 🚀 Cách hoạt động

### 1. Login Flow
```
User nhập email/password 
  → Call API POST /auth/login
  → Backend set HTTP-only cookies (access_token, refresh_token)
  → Frontend lưu user info vào Zustand store
  → Redirect đến dashboard (/)
```

### 2. Authentication Check
```
User truy cập route protected (/_authenticated/*)
  → Check accessToken flag trong store
  → Nếu không có → Redirect /sign-in
  → Nếu có → Allow access
```

### 3. API Requests
```
Mọi request tự động:
  → Gửi cookies (withCredentials: true)
  → Nếu 401 → Auto refresh token
  → Nếu refresh fail → Redirect /sign-in
```

### 4. Logout Flow
```
User click sign out
  → Call API POST /auth/logout
  → Backend clear cookies
  → Frontend clear Zustand store
  → Redirect /sign-in
```

## 🔐 Bảo mật

1. **HTTP-only Cookies**: Tokens được lưu ở cookies, không thể truy cập từ JavaScript
2. **Auto Refresh Token**: Tự động làm mới access token khi hết hạn
3. **CORS**: Backend đã cấu hình CORS cho frontend
4. **Credentials**: Mọi request đều gửi cookies với `withCredentials: true`

## ⚙️ Configuration

### Environment Variables
```bash
# .env
VITE_API_BASE_URL=http://localhost:3000
```

### Backend CORS (đã cấu hình)
```typescript
app.enableCors({
  origin: ['http://localhost:5173', ...],
  credentials: true,
});
```

## 📋 API Endpoints sử dụng

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/auth/login` | POST | Đăng nhập |
| `/auth/logout` | POST | Đăng xuất |
| `/auth/refresh` | POST | Làm mới token |
| `/auth/validate` | GET | Kiểm tra session |
| `/auth/register` | POST | Đăng ký |
| `/auth/forgot-password` | POST | Quên mật khẩu |
| `/auth/reset-password` | POST | Đặt lại mật khẩu |

## 🧪 Testing

### 1. Khởi động Backend
```bash
cd BE
pnpm dev
# Backend chạy ở http://localhost:3000
```

### 2. Khởi động Frontend
```bash
cd shadcn-admin
pnpm dev
# Frontend chạy ở http://localhost:5173
```

### 3. Test Login
1. Mở browser: `http://localhost:5173`
2. Tự động redirect đến `/sign-in`
3. Nhập email/password của user đã đăng ký
4. Click "Sign in"
5. Kiểm tra:
   - ✅ Redirect đến dashboard
   - ✅ Avatar hiển thị đúng
   - ✅ Profile dropdown có thông tin user

### 4. Test Logout
1. Click vào avatar
2. Click "Sign out"
3. Confirm dialog
4. Kiểm tra:
   - ✅ Redirect về `/sign-in`
   - ✅ Cookies đã bị xóa
   - ✅ Không thể truy cập protected routes

## 🐛 Troubleshooting

### Lỗi CORS
- Kiểm tra backend đã cấu hình CORS đúng
- Kiểm tra `credentials: true` ở cả backend và frontend

### Cookies không được set
- Kiểm tra backend response có `Set-Cookie` header
- Kiểm tra `withCredentials: true` trong axios config
- Kiểm tra domain/path của cookies

### 401 Unauthorized liên tục
- Xóa cookies cũ
- Kiểm tra refresh token endpoint
- Kiểm tra thời gian hết hạn của tokens

## 📦 Dependencies

Các package đã có sẵn:
- `axios` - HTTP client
- `zustand` - State management
- `@tanstack/react-router` - Routing
- `sonner` - Toast notifications

## 🎯 Next Steps

1. ✅ Tích hợp API register
2. ✅ Tích hợp forgot password
3. ✅ Tích hợp reset password
4. ⬜ Tích hợp Google OAuth
5. ⬜ Thêm session validation khi app load
6. ⬜ Handle token expiry gracefully

## 💡 Tips

- Mọi request tự động gửi cookies, không cần thêm headers
- Refresh token tự động xử lý bởi axios interceptor
- User info được lưu trong Zustand store với persist
- Protected routes tự động check auth và redirect

---

✨ **Tích hợp hoàn tất! Ready for testing!**
