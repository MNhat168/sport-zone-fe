# SportZone Frontend - Cấu trúc thư mục

## 📋 Tổng quan
SportZone Frontend là một ứng dụng React TypeScript được xây dựng với Vite, sử dụng Redux Toolkit cho state management và shadcn/ui cho UI components.

## 🏗️ Cấu trúc thư mục chính

```
sport-zone-fe/
├── 📁 public/                     # Static assets
│   ├── vite.svg
│   ├── 📁 images/                 # Hình ảnh public
│   └── 📁 img/                    # Hình ảnh bổ sung
├── 📁 src/                        # Source code chính
│   ├── 📄 App.tsx                 # Root component
│   ├── 📄 main.tsx                # Entry point
│   ├── 📄 index.css               # Global styles
│   ├── 📄 App.css                 # App styles
│   ├── 📄 vite-env.d.ts          # Vite type definitions
│   │
│   ├── 📁 assets/                 # Static assets trong src
│   │   ├── 📁 brand-icons/        # Brand icons
│   │   └── 📁 custom/             # Custom assets
│   │
│   ├── 📁 components/             # React components
│   │   ├── 📄 NotificationBell.tsx
│   │   ├── 📁 animation/          # Animation components
│   │   ├── 📁 data-table/         # Data table components
│   │   ├── 📁 enums/              # Enum definitions
│   │   ├── 📁 footer/             # Footer components
│   │   ├── 📁 header/             # Header & Navigation
│   │   ├── 📁 header-banner/      # Page headers
│   │   ├── 📁 layouts/            # Layout components
│   │   ├── 📁 loading/            # Loading components
│   │   ├── 📁 mock-data/          # Mock data cho testing
│   │   ├── 📁 providers/          # React providers
│   │   ├── 📁 sidebar/            # Sidebar components
│   │   ├── 📁 toast/              # Notification toasts
│   │   └── 📁 ui/                 # shadcn/ui components
│   │
│   ├── 📁 config/                 # Configuration files
│   │
│   ├── 📁 context/                # React contexts
│   │
│   ├── 📁 features/               # Feature-based modules
│   │   ├── 📁 authentication/     # Auth logic
│   │   ├── 📁 booking/            # Booking management
│   │   ├── 📁 field/              # Field management
│   │   └── 📁 user/               # User management
│   │
│   ├── 📁 hooks/                  # Custom React hooks
│   │   ├── 📄 app-navigation.ts   # Navigation hooks
│   │   └── 📄 useSocket.ts        # Socket.io hooks
│   │
│   ├── 📁 layouts/                # Layout templates
│   │   ├── 📄 center-layout.tsx   # Centered layout
│   │   └── 📄 root-layout.tsx     # Main app layout
│   │
│   ├── 📁 lib/                    # Utility libraries
│   │   └── 📄 utils.ts            # Common utilities
│   │
│   ├── 📁 pages/                  # Route-level pages
│   │   ├── 📁 auth/               # Authentication pages
│   │   ├── 📁 coach/              # Coach-related pages
│   │   ├── 📁 coach-booking-page/ # Coach booking
│   │   ├── 📁 coach-dashboard-page/ # Coach dashboard
│   │   ├── 📁 coach-detail-page/  # Coach details
│   │   ├── 📁 coaches-list/       # Coaches listing
│   │   ├── 📁 field-booking-page/ # Field booking
│   │   ├── 📁 field-detail-page/  # Field details
│   │   ├── 📁 field-list-page/    # Fields listing
│   │   ├── 📁 landing/            # Landing page
│   │   ├── 📁 profile/            # User profile
│   │   ├── 📁 test/               # Test pages
│   │   └── 📁 user-dashboard-page/ # User dashboard
│   │
│   ├── 📁 routes/                 # Routing configuration
│   │   ├── 📄 auth-wrapper.tsx    # Auth route wrapper
│   │   ├── 📄 main-router.tsx     # Main router
│   │   ├── 📄 protected-routes-config.tsx # Protected routes
│   │   └── 📄 routes-config.tsx   # Routes config
│   │
│   ├── 📁 store/                  # Redux store
│   │   ├── 📄 hook.ts             # Typed Redux hooks
│   │   └── 📄 store.ts            # Store configuration
│   │
│   ├── 📁 types/                  # TypeScript type definitions
│   │   ├── 📄 authentication-type.ts # Auth types
│   │   ├── 📄 booking-type.ts     # Booking types
│   │   ├── 📄 field-type.ts       # Field types
│   │   ├── 📄 lesson-type.ts      # Lesson types
│   │   └── 📄 user-type.ts        # User types
│   │
│   └── 📁 utils/                  # Utility functions
│       ├── 📁 admin/              # Admin utilities
│       ├── 📁 axios/              # HTTP client config
│       ├── 📁 constant-value/     # Constants
│       └── 📁 routing/            # Routing utilities
│
├── 📄 components.json             # shadcn/ui config
├── 📄 ENV_SETUP.md               # Environment setup guide
├── 📄 eslint.config.js           # ESLint configuration
├── 📄 index.html                 # HTML entry point
├── 📄 package.json               # Dependencies & scripts
├── 📄 pnpm-lock.yaml            # Package lock file
├── 📄 README.md                  # Project documentation
├── 📄 tsconfig.app.json         # TypeScript app config
├── 📄 tsconfig.json             # TypeScript root config
├── 📄 tsconfig.node.json        # TypeScript node config
└── 📄 vite.config.ts            # Vite configuration
```

## 🧩 Chi tiết từng thư mục

### 📁 `src/components/`
Chứa tất cả React components được tổ chức theo chức năng:

#### 📁 `ui/` - shadcn/ui Components
- **accordion.tsx** - Accordion component
- **avatar.tsx** - User avatar component
- **badge.tsx** - Badge/tag component  
- **button.tsx** - Button component với variants
- **calendar.tsx** - Calendar picker
- **card.tsx** - Card layout component
- **checkbox.tsx** - Checkbox input
- **date-picker.tsx** - Date selection
- **dialog.tsx** - Modal dialogs
- **dropdown-menu.tsx** - Dropdown menus
- **input.tsx** - Text inputs
- **label.tsx** - Form labels
- **popover.tsx** - Popover tooltips
- **scroll-area.tsx** - Scrollable areas
- **select.tsx** - Select dropdowns
- **table.tsx** - Data tables
- **tabs.tsx** - Tab navigation
- **textarea.tsx** - Multi-line text input

#### 📁 `header/` - Navigation Components
- **navbar-component.tsx** - Main navigation bar
- **navbar-dark-component.tsx** - Dark theme navbar
- **coach-dashboard-header.tsx** - Coach dashboard header
- **user-dashboard-header.tsx** - User dashboard header
- **coach-dropdown-menu.tsx** - Coach user menu
- **user-dropdown-menu.tsx** - User dropdown menu
- **notification-bell.tsx** - Notification bell icon

### 📁 `src/features/` - Feature Modules
Theo pattern Redux Toolkit, mỗi feature có:

#### 📁 `authentication/`
- **authAPI.ts** - Authentication API calls
- **authSlice.ts** - Auth state slice & reducers
- **authThunk.ts** - Async auth actions

#### 📁 `booking/`
- **bookingAPI.ts** - Booking API calls
- **bookingSlice.ts** - Booking state management
- **(và các files thunk khác)*

#### 📁 `field/` - Field Management
#### 📁 `user/` - User Management

### 📁 `src/pages/` - Route Pages
Mỗi page tương ứng với một route trong application:

- **📁 auth/** - Login, Register, Forgot Password
- **📁 landing/** - Landing page cho visitors  
- **📁 coach/** - Coach-related pages
- **📁 coach-dashboard-page/** - Dashboard cho coaches
- **📁 coach-detail-page/** - Chi tiết coach
- **📁 coaches-list/** - Danh sách coaches
- **📁 field-booking-page/** - Đặt sân
- **📁 field-detail-page/** - Chi tiết sân
- **📁 field-list-page/** - Danh sách sân
- **📁 profile/** - User profile management
- **📁 user-dashboard-page/** - Dashboard cho users

### 📁 `src/types/` - TypeScript Types
- **authentication-type.ts** - Auth interfaces & types
- **booking-type.ts** - Booking data structures  
- **field-type.ts** - Field/venue types
- **lesson-type.ts** - Lesson/coaching types
- **user-type.ts** - User profile types

### 📁 `src/hooks/` - Custom Hooks
- **app-navigation.ts** - Navigation logic hooks
- **useSocket.ts** - Socket.io connection hooks

### 📁 `src/routes/` - Routing System
- **main-router.tsx** - Main application router
- **auth-wrapper.tsx** - Authentication wrapper
- **protected-routes-config.tsx** - Protected route definitions
- **routes-config.tsx** - All route configurations

### 📁 `src/store/` - Redux Store
- **store.ts** - Redux store configuration với middleware
- **hook.ts** - Typed useAppDispatch & useAppSelector hooks

## 🛠️ Tech Stack

### Core Framework
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool & dev server

### State Management  
- **Redux Toolkit** - Predictable state container
- **RTK Query** - Data fetching & caching

### UI Components
- **shadcn/ui** - Headless UI components
- **Radix UI** - Primitive components
- **Tailwind CSS** - Utility-first CSS

### Routing & Navigation
- **React Router** - Client-side routing

### HTTP Client
- **Axios** - HTTP requests với interceptors

### Form Handling
- **React Hook Form** - Form state management
- **Zod** - Schema validation

### Authentication
- **@react-oauth/google** - Google OAuth integration

### Development Tools
- **ESLint** - Code linting
- **TypeScript Compiler** - Type checking
- **pnpm** - Package manager

## 📝 Naming Conventions

### Files & Folders
- **Components**: `PascalCase.tsx` (VD: `UserCard.tsx`)
- **Hooks**: `camelCase.ts` (VD: `useUsers.ts`) 
- **Utils**: `camelCase.ts` (VD: `dateUtils.ts`)
- **Types**: `kebab-case.ts` (VD: `user-type.ts`)
- **Pages**: `kebab-case/` folders với `PascalCase.tsx` files

### Code Conventions
- **Components**: `PascalCase` (VD: `UserCard`, `BookingForm`)
- **Hooks**: `use{Entity}` (VD: `useUsers`, `useAuth`)
- **Types/Interfaces**: `PascalCase` (VD: `User`, `BookingProps`)
- **Constants**: `UPPER_SNAKE_CASE` (VD: `API_BASE_URL`)

## 🔧 Architecture Patterns

### Component Architecture
```
📁 Feature/
├── 📁 components/     # Feature-specific components
├── 📁 hooks/          # Custom hooks for the feature  
├── 📁 types/          # TypeScript definitions
├── 📁 services/       # API service layer
└── 📄 FeaturePage.tsx # Main page component
```

### Redux Pattern (theo authentication/)
```
📁 feature/
├── 📄 featureAPI.ts   # API layer only
├── 📄 featureSlice.ts # State slice & reducers  
└── 📄 featureThunk.ts # Async actions
```

### Component Pattern
- **Functional Components** với TypeScript interfaces
- **Custom Hooks** cho reusable logic
- **Props interfaces** được define rõ ràng
- **Error boundaries** và loading states

## 🚀 Scripts Available

```bash
pnpm dev          # Khởi chạy development server
pnmp build        # Build production
pnpm lint         # Chạy ESLint
pnpm preview      # Preview production build
```

---

**Ghi chú**: Cấu trúc này theo best practices của React TypeScript với Redux Toolkit và shadcn/ui, đảm bảo maintainability và scalability cho dự án SportZone.