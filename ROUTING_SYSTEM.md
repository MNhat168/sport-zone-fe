# SportZone Frontend - Hệ thống Routing

## 📋 **Tổng quan**
Hệ thống routing của SportZone Frontend được thiết kế theo nguyên tắc **role-based access control (RBAC)** với cấu trúc đơn giản, nhất quán và dễ bảo trì.

## 🏗️ **Cấu trúc Routing**

### 📁 **File Organization**
```
src/routes/
├── 📄 main-router.tsx           # Router chính (React Router configuration)  
├── 📄 routes-config.tsx         # Định nghĩa tất cả routes theo role
├── 📄 protected-routes-config.tsx # Component bảo vệ routes + role definitions
└── 📄 auth-wrapper.tsx          # Wrapper xử lý authentication logic
```

**Simplified Architecture**: Không còn routing-utils.ts - tất cả logic được handle trực tiếp bởi React Router và ProtectedRoute component.

### 🔐 **Route Categories**

#### 1. **Public Routes** (Không cần authentication)
- **Landing Page**: `/`
- **Authentication**: `/auth`  
- **Field Discovery**: `/fields`, `/field-booking`
- **Coach Discovery**: `/coaches`, `/coach-detail`, `/coach/:id`
- **General**: `/about`, `/contact`, `/services`, `/booking`

#### 2. **User Routes** (Role: `user`)
```
/user/dashboard          # User dashboard
/user/profile           # User profile management
/user/bookings          # Booking history
/user/invoices          # Invoice management  
/user/wallet            # Wallet & payments
/user/chat              # Chat functionality
```

#### 3. **Coach Routes** (Role: `coach`)
```  
/coach/dashboard        # Coach dashboard
/coach/profile          # Coach profile
/coach/classes          # Class management
/coach/bookings         # Booking management
/coach/schedule         # Schedule management
/coach/students         # Student management
/coach/earnings         # Earnings tracking
/coach/analytics        # Performance analytics
```

#### 4. **Field Owner Routes** (Role: `field_owner`)
```
/field-owner/dashboard       # Field owner dashboard
/field-owner/profile/:userId # Profile management
/field/create               # Create new field
/field-owner/fields         # Field management
/field-owner/fields/:fieldId # Field details
/field-owner/bookings       # Booking management
/field-owner/schedule       # Schedule management
/field-owner/customers      # Customer management
/field-owner/analytics      # Business analytics
/field-owner/revenue        # Revenue tracking
/field-owner/financial-reports # Financial reports
/field-owner/locations      # Location management
/field-owner/settings       # Settings
```

#### 5. **Admin/Manager Routes** (Role: `manager`)
```
/admin/dashboard        # Admin dashboard
/admin/users           # User management
/admin/coaches         # Coach management
/admin/field-owners    # Field owner management  
/admin/fields          # Field management
/admin/bookings        # Booking management
/admin/analytics       # System analytics
/admin/settings        # System settings
/center                # Legacy manager center
```

## 🔧 **Core Components**

### **Protected Route Component**
Route protection được handle bởi `ProtectedRoute` component với role-based access control:

```tsx
<ProtectedRoute allowedRoles={[UserRole.FIELD_OWNER]}>
  <FieldCreatePage />
</ProtectedRoute>
```

### **Simple Post-Login Flow**
- All roles redirect to landing page (`/`) after login for better UX
- Users navigate to their specific dashboards via dropdown/navigation menus
- No complex routing utilities needed - React Router handles everything

## 🔄 **Navigation Flow**

### **Login Flow**
1. User login thành công → Redirect về `/` (landing page)
2. Từ landing page, user có thể navigate tới dashboard của role:
   - User: Click vào user dropdown → Navigate to `/user/dashboard`
   - Field Owner: Click vào field owner dropdown → Navigate to `/field-owner/dashboard`

### **Route Protection**
1. User truy cập protected route
2. `ProtectedRoute` kiểm tra authentication
3. Nếu chưa login → Redirect to `/auth`
4. Nếu đã login nhưng không có quyền → Redirect to `/unauthorized`
5. Nếu có quyền → Render component

### **Route Debugging**
Route debugging được thực hiện bằng cách:
- Check console logs từ `ProtectedRoute` component
- Inspect React Router DevTools
- Use browser's developer tools để monitor navigation

## 📝 **Best Practices**

### **1. Route Naming Convention**
- **Public routes**: `/` + `resource` (VD: `/fields`, `/coaches`)
- **Role routes**: `/role/` + `feature` (VD: `/user/dashboard`, `/coach/classes`)
- **Resource management**: `/role/resource` (VD: `/field-owner/fields`)
- **Resource details**: `/role/resource/:id` (VD: `/field-owner/fields/:fieldId`)

### **2. Component Organization**
```tsx
// ✅ Good - Specific role-based route
{
  path: "/field-owner/fields",
  element: (
    <ProtectedRoute allowedRoles={[UserRole.FIELD_OWNER]}>
      <FieldManagementPage />
    </ProtectedRoute>
  ),
}

// ❌ Avoid - Generic unprotected route  
{
  path: "/fields/manage",
  element: <FieldManagementPage />
}
```

### **3. Navigation Links**
```tsx
// ✅ Good - Use role-specific paths
<Link to="/field-owner/fields">Quản lý sân</Link>

// ❌ Avoid - Generic paths that might conflict
<Link to="/manage-fields">Quản lý sân</Link>
```

### **4. Role Checking**
```tsx
// ✅ Good - Use ProtectedRoute component for role checking
<ProtectedRoute allowedRoles={[UserRole.FIELD_OWNER]}>
  <FieldManagementPage />
</ProtectedRoute>

// ✅ Good - Simple role checking in components
const canManageFields = user.role === "field_owner";

// ❌ Avoid - Complex permission logic in components
```

## 🚀 **Simplified Usage Examples**

### **Dropdown Menu Navigation** (Field Owner)
```tsx
const FieldOwnerDropdown = ({ user }) => {
  // Define navigation items directly in component
  const navigationItems = [
    { label: "Dashboard", path: "/field-owner/dashboard" },
    { label: "Quản lý sân", path: "/field-owner/fields" },
    { label: "Tạo sân mới", path: "/field/create" },
    { label: "Đặt sân", path: "/field-owner/bookings" },
    // ... more items
  ];
  
  return (
    <DropdownMenu>
      {navigationItems.map(item => (
        <DropdownMenuItem asChild key={item.path}>
          <Link to={item.path}>{item.label}</Link>
        </DropdownMenuItem>
      ))}
    </DropdownMenu>
  );
};
```

### **Direct Dashboard Navigation**
```tsx
const DashboardButton = ({ user }) => {
  // Direct route mapping - simple and clear
  const getDashboardPath = (role: string) => {
    switch (role) {
      case "user": return "/user/dashboard";
      case "coach": return "/coach/dashboard";
      case "field_owner": return "/field-owner/dashboard";
      case "manager": return "/admin/dashboard";
      default: return "/";
    }
  };
  
  return (
    <Link to={getDashboardPath(user.role)}>
      Go to Dashboard
    </Link>
  );
};
```

### **Conditional Feature Access**
```tsx
const FieldManagementButton = ({ user }) => {
  // Simple role checking
  if (user.role !== "field_owner") return null;
  
  return (
    <Link to="/field-owner/fields">
      Quản lý sân
    </Link>
  );
};
```

## 🛠️ **Development & Debugging**

### **Route Debugging**
```tsx
// Check route protection in browser console
console.log("Current user role:", user.role);
console.log("Current path:", location.pathname);

// Protected routes will show access denied message if unauthorized
```

### **Manual Route Testing**
- Navigate to protected routes manually in browser
- Check console for protection messages
- Verify redirects work correctly for each role

## ⚠️ **Important Notes**

1. **Tất cả roles đều redirect về landing page** sau login để tránh confusion
2. **Route patterns phải consistent**: `/role/feature` format
3. **Protected routes luôn wrap với `ProtectedRoute`** component
4. **Public routes accessible cho tất cả users** (authenticated và non-authenticated)
5. **Manager role có full access** tới tất cả routes khác
6. **Legacy routes được maintain** để backward compatibility

---

**Lưu ý**: Hệ thống này thiết kế để scalable và maintainable. Khi thêm routes mới, hãy follow conventions đã được thiết lập.