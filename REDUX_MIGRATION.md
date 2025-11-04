# Redux Toolkit Migration Guide

## 📝 Tổng quan

Đã chuyển đổi thành công từ **Zustand** sang **Redux Toolkit** với **RTK Query** để quản lý state và API calls. Hệ thống sử dụng **HTTP-only cookies** để lưu trữ JWT tokens.

## 🏗️ Cấu trúc Redux Store

```
src/store/
├── index.ts              # Redux store configuration với persist
├── hooks.ts              # Typed hooks (useAppDispatch, useAppSelector)
├── slices/
│   └── authSlice.ts     # Auth state slice
└── services/
    └── authApi.ts       # RTK Query API endpoints
```

## 📦 Files đã tạo mới

### 1. **store/index.ts** - Redux Store Configuration
```typescript
- configureStore với redux-persist
- Combine reducers (auth + authApi)
- Setup RTK Query middleware
- Export store, persistor, types
```

### 2. **store/slices/authSlice.ts** - Auth Slice
```typescript
- State: { user, isAuthenticated }
- Actions: setUser, clearAuth
- Thay thế auth-store.ts (Zustand)
```

### 3. **store/services/authApi.ts** - RTK Query API
```typescript
- createApi với fetchBaseQuery
- Endpoints: login, logout, validateSession, refresh, etc.
- Auto-generated hooks: useLoginMutation, useLogoutMutation, etc.
- Thay thế auth.service.ts
```

### 4. **store/hooks.ts** - Typed Redux Hooks
```typescript
- useAppDispatch: Typed dispatch
- useAppSelector: Typed selector
```

## 🔄 Files đã cập nhật

### 1. **main.tsx**
```diff
- import { useAuthStore } from '@/stores/auth-store'
+ import { Provider } from 'react-redux'
+ import { PersistGate } from 'redux-persist/integration/react'
+ import { store, persistor } from '@/store'
+ import { clearAuth } from '@/store/slices/authSlice'

  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      {/* App content */}
    </PersistGate>
  </Provider>
```

### 2. **features/auth/sign-in/components/user-auth-form.tsx**
```diff
- import { useAuthStore } from '@/stores/auth-store'
- import { authService } from '@/services/auth.service'
+ import { useAppDispatch } from '@/store/hooks'
+ import { setUser } from '@/store/slices/authSlice'
+ import { useLoginMutation } from '@/store/services/authApi'

- const { auth } = useAuthStore()
- const response = await authService.login(...)
- auth.setUser(response.user)
+ const dispatch = useAppDispatch()
+ const [login, { isLoading }] = useLoginMutation()
+ const response = await login(...).unwrap()
+ dispatch(setUser(response.user))
```

### 3. **routes/_authenticated/route.tsx**
```diff
- import { useAuthStore } from '@/stores/auth-store'
+ import { store } from '@/store'

- const { accessToken } = useAuthStore.getState().auth
- if (!accessToken) {
+ const { isAuthenticated } = store.getState().auth
+ if (!isAuthenticated) {
    throw redirect({ to: '/sign-in' })
  }
```

### 4. **components/profile-dropdown.tsx**
```diff
- import { useAuthStore } from '@/stores/auth-store'
+ import { useAppSelector } from '@/store/hooks'

- const { auth } = useAuthStore()
- const user = auth.user
+ const user = useAppSelector((state) => state.auth.user)
```

### 5. **components/sign-out-dialog.tsx**
```diff
- import { useAuthStore } from '@/stores/auth-store'
- import { authService } from '@/services/auth.service'
+ import { useAppDispatch } from '@/store/hooks'
+ import { clearAuth } from '@/store/slices/authSlice'
+ import { useLogoutMutation } from '@/store/services/authApi'

- const { auth } = useAuthStore()
- await authService.logout()
- auth.reset()
+ const dispatch = useAppDispatch()
+ const [logout] = useLogoutMutation()
+ await logout().unwrap()
+ dispatch(clearAuth())
```

### 6. **components/layout/authenticated-layout.tsx**
```diff
- import { useValidateSession } from '@/hooks/use-validate-session'
+ import { useAppDispatch, useAppSelector } from '@/store/hooks'
+ import { setUser, clearAuth } from '@/store/slices/authSlice'
+ import { useLazyValidateSessionQuery } from '@/store/services/authApi'

- useValidateSession()
+ const dispatch = useAppDispatch()
+ const [validateSession] = useLazyValidateSessionQuery()
+ const result = await validateSession().unwrap()
+ dispatch(setUser(result.user))
```

## 🗑️ Files đã xóa

- ❌ `stores/auth-store.ts` (Zustand store)
- ❌ `hooks/use-validate-session.ts` (Custom hook)
- ❌ `services/auth.service.ts` (API service wrapper)
- ❌ `lib/axios.ts` (Không cần nữa, RTK Query tự handle)

## 🎯 Ưu điểm của Redux Toolkit

### 1. **RTK Query - Tự động quản lý API**
- Auto caching và invalidation
- Loading/error states tự động
- Request deduplication
- Polling và refetching
- Optimistic updates

### 2. **Redux DevTools**
- Time-travel debugging
- State inspection
- Action replay
- Performance monitoring

### 3. **Type Safety**
- Full TypeScript support
- Typed hooks (useAppDispatch, useAppSelector)
- Infer types từ store

### 4. **Code Organization**
- Clear separation: slices vs services
- Scalable structure
- Easy to test

## 📚 Cách sử dụng

### Login Flow
```typescript
import { useLoginMutation } from '@/store/services/authApi'
import { useAppDispatch } from '@/store/hooks'
import { setUser } from '@/store/slices/authSlice'

const [login, { isLoading, error }] = useLoginMutation()
const dispatch = useAppDispatch()

const handleLogin = async (credentials) => {
  try {
    const response = await login(credentials).unwrap()
    dispatch(setUser(response.user))
  } catch (err) {
    // Handle error
  }
}
```

### Access User State
```typescript
import { useAppSelector } from '@/store/hooks'

const user = useAppSelector((state) => state.auth.user)
const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated)
```

### Logout
```typescript
import { useLogoutMutation } from '@/store/services/authApi'
import { useAppDispatch } from '@/store/hooks'
import { clearAuth } from '@/store/slices/authSlice'

const [logout] = useLogoutMutation()
const dispatch = useAppDispatch()

const handleLogout = async () => {
  await logout().unwrap()
  dispatch(clearAuth())
}
```

## 🔐 Bảo mật

1. **HTTP-only Cookies**: Backend set cookies, RTK Query tự động gửi
2. **credentials: 'include'**: Trong fetchBaseQuery config
3. **Auto Refresh**: Có thể thêm baseQuery wrapper để handle 401
4. **Redux Persist**: Chỉ persist auth state (whitelist)

## 🚀 Next Steps

1. ✅ Implement auto refresh token trong baseQuery
2. ✅ Add loading states cho toàn bộ app
3. ✅ Setup Redux DevTools extension
4. ⬜ Add error boundary
5. ⬜ Add retry logic cho failed requests
6. ⬜ Implement optimistic updates

## 🧪 Testing

### Test Redux Store
```bash
cd shadcn-admin
pnpm dev
```

1. Mở Redux DevTools
2. Test login → Xem action `authApi/executeMutation/fulfilled`
3. Test logout → Xem action `auth/clearAuth`
4. Kiểm tra state persistence (reload page)

## 📖 Resources

- [Redux Toolkit Docs](https://redux-toolkit.js.org/)
- [RTK Query Tutorial](https://redux-toolkit.js.org/tutorials/rtk-query)
- [Redux DevTools](https://github.com/reduxjs/redux-devtools)

---

✨ **Migration hoàn tất! Redux Toolkit đã sẵn sàng!**
