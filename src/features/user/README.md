# User Profile Redux Integration

## 📁 Cấu trúc Files

```
src/
├── features/
│   └── user/
│       ├── userAPI.ts          # API endpoints
│       ├── userThunk.ts        # Async thunks
│       ├── userSlice.ts        # Redux slice
│       └── index.ts            # Export file
├── types/
│   └── user-type.ts            # Types được cập nhật
├── components/
│   └── providers/
│       └── UserSyncProvider.tsx    # Sync component
└── pages/user-dashboard-page/user-profile/components/
    ├── profile.tsx             # Profile component (updated)
    └── change-password.tsx     # Change password component (updated)
```

## 🚀 Cách sử dụng

### 1. Setup trong App.tsx
```tsx
import { UserSyncProvider } from "@/components/providers";

function App() {
  return (
    <Provider store={store}>
      <UserSyncProvider>
        {/* Your app content */}
      </UserSyncProvider>
    </Provider>
  );
}
```

### 2. Sử dụng trong Components

#### Get User Profile
```tsx
import { useAppSelector, useAppDispatch } from "@/store/hook";
import { getUserProfile } from "@/features/user/userThunk";

function ProfileComponent() {
  const dispatch = useAppDispatch();
  const { user, loading, error } = useAppSelector((state) => state.user);
  
  useEffect(() => {
    dispatch(getUserProfile());
  }, [dispatch]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return <div>Hello {user?.fullName}</div>;
}
```

#### Update Profile
```tsx
import { useAppSelector, useAppDispatch } from "@/store/hook";
import { updateUserProfile } from "@/features/user/userThunk";

function UpdateProfileComponent() {
  const dispatch = useAppDispatch();
  const { updateLoading, updateError } = useAppSelector((state) => state.user);
  
  const handleUpdate = async () => {
    try {
      await dispatch(updateUserProfile({
        userId: "user-id",
        fullName: "New Name",
        email: "new@email.com",
        phone: "1234567890",
        avatar: fileObject // File object
      })).unwrap();
      
      toast.success("Profile updated!");
    } catch (error) {
      toast.error("Update failed!");
    }
  };

  return (
    <button 
      onClick={handleUpdate}
      disabled={updateLoading}
    >
      {updateLoading ? "Updating..." : "Update Profile"}
    </button>
  );
}
```

#### Change Password
```tsx
import { useAppSelector, useAppDispatch } from "@/store/hook";
import { changePassword } from "@/features/user/userThunk";

function ChangePasswordComponent() {
  const dispatch = useAppDispatch();
  const { changePasswordLoading } = useAppSelector((state) => state.user);
  
  const handleChangePassword = async () => {
    try {
      await dispatch(changePassword({
        old_password: "oldpass",
        new_password: "newpass",
        confirm_password: "newpass"
      })).unwrap();
      
      toast.success("Password changed!");
    } catch (error) {
      toast.error("Change password failed!");
    }
  };

  return (
    <button 
      onClick={handleChangePassword}
      disabled={changePasswordLoading}
    >
      Change Password
    </button>
  );
}
```

#### Forgot & Reset Password
```tsx
import { useAppSelector, useAppDispatch } from "@/store/hook";
import { forgotPassword, resetPassword } from "@/features/user/userThunk";

// Forgot Password
function ForgotPasswordComponent() {
  const dispatch = useAppDispatch();
  const { forgotPasswordLoading } = useAppSelector((state) => state.user);
  
  const handleSendResetEmail = async () => {
    try {
      await dispatch(forgotPassword({ email: "user@email.com" })).unwrap();
      toast.success("Reset email sent!");
    } catch (error) {
      toast.error("Failed to send reset email!");
    }
  };

  return (
    <button onClick={handleSendResetEmail}>
      Send Reset Email
    </button>
  );
}

// Reset Password
function ResetPasswordComponent() {
  const dispatch = useAppDispatch();
  const { resetPasswordLoading } = useAppSelector((state) => state.user);
  
  const handleResetPassword = async () => {
    try {
      await dispatch(resetPassword({
        token: "reset-token-from-email",
        newPassword: "newpassword"
      })).unwrap();
      
      toast.success("Password reset successfully!");
    } catch (error) {
      toast.error("Reset password failed!");
    }
  };

  return (
    <button onClick={handleResetPassword}>
      Reset Password
    </button>
  );
}
```

## 🔧 API Endpoints

### Đã implement:
- ✅ `GET /users/get-profile` - Get user profile
- ✅ `PUT /users/:id` - Update profile + upload avatar
- ✅ `POST /users/forgot-password` - Forgot password
- ✅ `POST /users/reset-password` - Reset password
- ✅ `POST /users/change-password` - Change password

## 📋 Types

### User Interface
```typescript
interface User {
  _id: string;
  fullName: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  role: string;
  isVerified: boolean;
  status: string;
  isActive: boolean;
  googleId?: string;
  favouriteField?: string[];
  createdAt: string;
  updatedAt: string;
}
```

### Payload Types
```typescript
interface UpdateProfilePayload {
  userId: string;
  fullName?: string;
  email?: string;
  phone?: string;
  avatar?: File;
}

interface ChangePasswordPayload {
  old_password: string;
  new_password: string;
  confirm_password: string;
}

interface ForgotPasswordPayload {
  email: string;
}

interface ResetPasswordPayload {
  token: string;
  newPassword: string;
}
```

## 🎯 Features

### ✅ Đã hoàn thành:
- Redux store setup với userSlice
- Async thunks cho tất cả API calls
- Direct Redux usage với useAppSelector và useAppDispatch
- Profile component với avatar upload
- Change password component với validation
- User data sync giữa auth và user stores
- Loading states và error handling
- Form validation

### 🔄 Tự động sync:
- User data được sync giữa auth store và user store
- Khi update profile thành công, auth store cũng được update
- Avatar được cache và preview ngay lập tức

### 🛡️ Error Handling:
- API errors được handle properly
- Validation errors cho forms
- Loading states cho UX tốt hơn
- Toast notifications cho feedback

## 🚨 Lưu ý quan trọng

1. **Avatar Upload**: Sử dụng FormData để upload file
2. **JWT Token**: axiosPrivate tự động attach token
3. **User Sync**: UserSyncProvider phải wrap app ở root level
4. **Validation**: Form validation được handle ở component level
5. **Error Handling**: Errors được show qua toast notifications

## 🔮 Có thể mở rộng thêm:

- Add profile picture crop functionality
- Add more profile fields (address, bio, etc.)
- Add email verification flow
- Add two-factor authentication
- Add account deletion functionality