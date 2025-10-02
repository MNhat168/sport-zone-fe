# 📋 Checklist Coding Principles cho Team SportZone Frontend

## 🔄 **1. DRY (Don't Repeat Yourself)**
- [ ] ✅ Tạo custom hooks chung cho UI/business logic dùng > 2 lần (không cho Redux store access)
- [ ] ✅ Tách constants vào file enum hoặc constants
- [ ] ✅ Tạo utility functions cho các thao tác chung
- [ ] ✅ Tạo base components/interfaces cho các component tương tự
- [ ] ✅ Sử dụng Higher-Order Components (HOC) hoặc custom hooks
- [ ] ❌ Copy-paste component logic giống nhau ở nhiều nơi
- [ ] ❌ Viết lại logic đã có sẵn trong hệ thống

```tsx
// ✅ TỐT - Tạo utility function chung
export const stringUtils = {
    toSlug: (text: string): string => {
        return text?.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
    },
    capitalize: (text: string): string => {
        return text.charAt(0).toUpperCase() + text.slice(1);
    }
};

// ✅ TỐT - Sử dụng custom hook chung
const useApiData = <T>(url: string) => {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // ... logic
    return { data, loading, error };
};

// ❌ KHÔNG TỐT - Copy paste logic
const createUserSlug = (name: string) => name?.toLowerCase().replace(" ", "-");
const createFieldSlug = (title: string) => title?.toLowerCase().replace(" ", "-");
```

## 🚫 **2. Không Hard-code và Magic Number**
- [ ] ✅ Tạo constants cho tất cả giá trị cố định
- [ ] ✅ Sử dụng enum cho các giá trị có nghĩa cụ thể  
- [ ] ✅ Config values vào `.env` và environment variables
- [ ] ✅ Sử dụng constants file cho error messages
- [ ] ✅ Sử dụng theme config cho design tokens (colors, spacing, etc.)
- [ ] ❌ Để số và chuỗi trực tiếp trong code

```tsx
// ✅ TỐT - Sử dụng constants
export const APP_CONFIG = {
    FILE_UPLOAD: {
        MAX_SIZE: 10 * 1024 * 1024, // 10MB
        ALLOWED_TYPES: ['image/jpeg', 'image/png', 'application/pdf'],
        MAX_FILES: 5
    },
    PAGINATION: {
        DEFAULT_PAGE_SIZE: 20,
        MAX_PAGE_SIZE: 100
    },
    API: {
        BASE_URL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001',
        TIMEOUT: 10000
    }
} as const;

// ✅ TỐT - Sử dụng enum
export enum UserRole {
    USER = 'user',
    COACH = 'coach', 
    FIELD_OWNER = 'field_owner',
    ADMIN = 'admin'
}

export enum SportType {
    FOOTBALL = 'football',
    BASKETBALL = 'basketball',
    TENNIS = 'tennis'
}

// ✅ TỐT - Design tokens
export const THEME = {
    colors: {
        primary: '#1976d2',
        secondary: '#dc004e',
        success: '#4caf50',
        error: '#f44336',
        warning: '#ff9800'
    },
    spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px'
    }
} as const;

// ❌ KHÔNG TỐT  
if (file.size > 10485760) // Magic number
if (role === "ADMIN") // Hard-code string
<div style={{ marginTop: '16px' }}> // Hard-code style
```

## 🎯 **3. Thay Đổi Ít - Hiệu Quả Nhiều**
- [ ] ✅ Thiết kế components có thể tái sử dụng với props
- [ ] ✅ Sử dụng Generic types cho TypeScript
- [ ] ✅ Tạo base hooks interfaces chung
- [ ] ✅ Sử dụng Context cho shared state
- [ ] ✅ Tạo base component patterns cho CRUD operations
- [ ] ❌ Tạo nhiều components/hooks tương tự nhau

```tsx
// ✅ TỐT - Generic data table component
interface DataTableProps<T> {
    data: T[];
    columns: ColumnDef<T>[];
    loading?: boolean;
    onRowClick?: (item: T) => void;
    onEdit?: (item: T) => void;
    onDelete?: (item: T) => void;
}

const DataTable = <T,>({ data, columns, loading, onRowClick, onEdit, onDelete }: DataTableProps<T>) => {
    if (loading) return <TableSkeleton />;
    
    return (
        <table className="data-table">
            {/* Generic table implementation */}
        </table>
    );
};

// ✅ TỐT - Generic API hook
const useApiData = <T>(endpoint: string, options?: RequestOptions) => {
    const [data, setData] = useState<T[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const response = await apiClient.get<T[]>(endpoint, options);
            setData(response);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    }, [endpoint]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { data, loading, error, refetch: fetchData };
};

// ❌ KHÔNG TỐT - tạo riêng hook cho từng entity
const useUsers = () => { /* specific user logic */ }
const useFields = () => { /* specific field logic */ }
const useBookings = () => { /* specific booking logic */ }
```

## ⚡ **4. Tránh Unnecessary Re-renders và Performance Issues**
- [ ] ✅ Sử dụng `React.memo()` cho components không cần re-render
- [ ] ✅ Sử dụng `useMemo()` và `useCallback()` khi cần thiết
- [ ] ✅ Batch API calls thay vì gọi từng cái riêng lẻ
- [ ] ✅ Sử dụng React Query/SWR cho caching và deduplication
- [ ] ✅ Implement virtual scrolling cho large lists
- [ ] ❌ Fetch data trong vòng lặp render
- [ ] ❌ Không optimize expensive computations

```tsx
// ✅ TỐT - Batch API calls
const useBookingsWithDetails = (userIds: string[]) => {
    const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBookingsWithDetails = async () => {
            try {
                setLoading(true);
                // Single API call with all data
                const response = await apiClient.get(`/bookings/with-details?userIds=${userIds.join(',')}`);
                setBookings(response.data);
            } catch (error) {
                console.error('Error fetching bookings:', error);
            } finally {
                setLoading(false);
            }
        };

        if (userIds.length > 0) {
            fetchBookingsWithDetails();
        }
    }, [userIds]);

    return { bookings, loading };
};

// ✅ TỐT - Memoized component
const BookingItem = React.memo<BookingItemProps>(({ booking, onEdit, onDelete }) => {
    const handleEdit = useCallback(() => {
        onEdit(booking);
    }, [booking, onEdit]);

    const handleDelete = useCallback(() => {
        onDelete(booking.id);
    }, [booking.id, onDelete]);

    return (
        <div className="booking-item">
            <h3>{booking.field.name}</h3>
            <p>{booking.startTime} - {booking.endTime}</p>
            <button onClick={handleEdit}>Edit</button>
            <button onClick={handleDelete}>Delete</button>
        </div>
    );
});

// ✅ TỐT - Memoized expensive computation
const BookingsList = ({ bookings }: { bookings: Booking[] }) => {
    const totalRevenue = useMemo(() => {
        return bookings.reduce((sum, booking) => sum + booking.totalPrice, 0);
    }, [bookings]);

    return (
        <div>
            <h2>Total Revenue: ${totalRevenue}</h2>
            {bookings.map(booking => (
                <BookingItem key={booking.id} booking={booking} />
            ))}
        </div>
    );
};

// ❌ KHÔNG TỐT - N+1 API calls
const BookingsList = ({ userIds }: { userIds: string[] }) => {
    return (
        <div>
            {userIds.map(userId => (
                <UserBookings key={userId} userId={userId} /> // Each component fetches separately!
            ))}
        </div>
    );
};
```

## 🎯 **5. Làm ĐÚNG Trước - Tối Ưu Sau**
- [ ] ✅ Component hoạt động đúng UI/UX trước
- [ ] ✅ Viết unit tests để đảm bảo đúng chức năng
- [ ] ✅ Code review và test kỹ trước khi optimize
- [ ] ✅ Đo performance thực tế với React DevTools
- [ ] ✅ Focus vào readability và maintainability trước
- [ ] ❌ Optimize performance khi chưa hiểu rõ requirements
- [ ] ❌ Premature optimization với memo/callback quá sớm

```tsx
// ✅ TỐT - Đúng trước, rõ ràng trước
interface UseActiveUsersOptions {
    roles?: UserRole[];
    autoRefresh?: boolean;
}

const useActiveUsers = (options: UseActiveUsersOptions = {}) => {
    const { roles = [UserRole.USER, UserRole.COACH], autoRefresh = false } = options;
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchActiveUsers = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Step 1: Làm đúng business logic trước
            const queryParams = new URLSearchParams();
            queryParams.append('isActive', 'true');
            roles.forEach(role => queryParams.append('role', role));
            
            const response = await fetch(`/api/users?${queryParams.toString()}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            setUsers(data.users || []);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch users';
            setError(errorMessage);
            console.error('Error fetching active users:', err);
        } finally {
            setLoading(false);
        }
    }, [roles]);

    useEffect(() => {
        fetchActiveUsers();
    }, [fetchActiveUsers]);

    // Step 2: Auto-refresh nếu cần (sau khi test đúng basic functionality)
    useEffect(() => {
        if (!autoRefresh) return;
        
        const interval = setInterval(fetchActiveUsers, 30000); // 30 seconds
        return () => clearInterval(interval);
    }, [autoRefresh, fetchActiveUsers]);

    return { users, loading, error, refetch: fetchActiveUsers };
    
    // Step 3: Sau khi test đúng, có thể optimize thêm:
    // - React Query cho caching
    // - Debounced search
    // - Virtual scrolling
    // - Pagination
};

// ✅ TỐT - Component đơn giản, rõ ràng trước
const UsersList: React.FC<{ showRoles?: boolean }> = ({ showRoles = false }) => {
    const { users, loading, error } = useActiveUsers();

    if (loading) return <div>Loading users...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="users-list">
            <h2>Active Users ({users.length})</h2>
            <ul>
                {users.map(user => (
                    <li key={user.id}>
                        <span>{user.fullName}</span>
                        <span>{user.email}</span>
                        {showRoles && <span>{user.role}</span>}
                    </li>
                ))}
            </ul>
        </div>
    );
    
    // Optimization sau: React.memo, useMemo cho filtering, v.v.
};
```

## 📝 **6. Không Dùng Anonymous Types và Any**
- [ ] ✅ Tạo interfaces riêng cho API responses
- [ ] ✅ Tạo types có thể tái sử dụng cho component props
- [ ] ✅ Include JSDoc documentation cho interfaces
- [ ] ✅ Sử dụng utility types cho data transformation
- [ ] ✅ Sử dụng form validation libraries với TypeScript
- [ ] ❌ Dùng `any` type trong component props
- [ ] ❌ Trả về `object` hoặc `unknown` mà không define type

```tsx
// ✅ TỐT - Tạo interface riêng với documentation
/**
 * Interface cho thông tin tóm tắt người dùng
 */
export interface UserSummary {
    /**
     * ID người dùng
     * @example "507f1f77bcf86cd799439011"
     */
    id: string;
    
    /**
     * Tên đầy đủ của người dùng
     * @example "Nguyễn Văn A"
     */
    fullName: string;
    
    /**
     * Email người dùng
     * @example "user@example.com"
     */
    email: string;
    
    /**
     * Số lượng booking đã thực hiện
     * @example 5
     */
    bookingCount: number;
    
    /**
     * Tổng số tiền đã chi tiêu
     * @example 1500000
     */
    totalSpent: number;
}

/**
 * Interface cho API response với pagination
 */
export interface UserSummaryResponse {
    users: UserSummary[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
    summary: {
        totalUsers: number;
        activeUsers: number;
        totalRevenue: number;
    };
}

// ✅ TỐT - Component với typed props
interface UserSummaryCardProps {
    user: UserSummary;
    showDetails?: boolean;
    onViewDetails: (userId: string) => void;
    onEdit: (user: UserSummary) => void;
}

const UserSummaryCard: React.FC<UserSummaryCardProps> = ({
    user,
    showDetails = false,
    onViewDetails,
    onEdit
}) => {
    return (
        <div className="user-summary-card">
            <h3>{user.fullName}</h3>
            <p>{user.email}</p>
            <p>Bookings: {user.bookingCount}</p>
            <p>Total Spent: {user.totalSpent.toLocaleString()}đ</p>
            
            {showDetails && (
                <button onClick={() => onViewDetails(user.id)}>
                    View Details
                </button>
            )}
            <button onClick={() => onEdit(user)}>Edit</button>
        </div>
    );
};

// ✅ TỐT - Hook với proper typing
const useUserSummaries = (filter?: UserFilter): {
    data: UserSummaryResponse | null;
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
} => {
    const [data, setData] = useState<UserSummaryResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const response = await apiClient.get<UserSummaryResponse>('/users/summary', {
                params: filter
            });
            setData(response);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    }, [filter]);

    return { data, loading, error, refetch: fetchData };
};

// ❌ KHÔNG TỐT - Anonymous types và any
const UserCard = ({ user }: { user: any }) => { // No type safety
    return <div>{user.name}</div>; // Compiler doesn't know if 'name' exists
};

const fetchUsers = async (): Promise<any> => { // Unknown return type
    const response = await fetch('/users');
    return response.json(); // Could be anything
};
```

## ⚠️ **7. Error Handling Đúng Cách**
- [ ] ✅ Sử dụng Error Boundaries cho component-level errors
- [ ] ✅ Implement user-friendly error messages
- [ ] ✅ Log errors để debug, nhưng không expose sensitive info
- [ ] ✅ Sử dụng error constants để consistent error messages
- [ ] ✅ Implement proper loading và error states
- [ ] ❌ Silent failures mà không thông báo user
- [ ] ❌ Throw technical errors trực tiếp lên UI
- [ ] ❌ Không handle network/API errors

```tsx
// ✅ TỐT - Error Boundary để catch component errors
class ErrorBoundary extends React.Component<
    { children: React.ReactNode },
    { hasError: boolean; error: Error | null }
> {
    constructor(props: { children: React.ReactNode }) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('Component Error:', error, errorInfo);
        // Log to external service (Sentry, etc.)
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="error-fallback">
                    <h2>Có lỗi xảy ra</h2>
                    <p>Vui lòng thử lại hoặc liên hệ support.</p>
                    <button onClick={() => this.setState({ hasError: false, error: null })}>
                        Thử lại
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

// ✅ TỐT - Error constants cho consistent messages
export const ERROR_MESSAGES = {
    NETWORK_ERROR: 'Không thể kết nối đến server. Vui lòng kiểm tra internet.',
    UNAUTHORIZED: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
    FORBIDDEN: 'Bạn không có quyền thực hiện hành động này.',
    NOT_FOUND: 'Không tìm thấy dữ liệu yêu cầu.',
    SERVER_ERROR: 'Server đang gặp sự cố. Vui lòng thử lại sau.',
    VALIDATION_ERROR: 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.',
} as const;

// ✅ TỐT - API error handler với user-friendly messages
const handleApiError = (error: any): string => {
    if (!navigator.onLine) {
        return ERROR_MESSAGES.NETWORK_ERROR;
    }

    if (error.response) {
        switch (error.response.status) {
            case 401:
                return ERROR_MESSAGES.UNAUTHORIZED;
            case 403:
                return ERROR_MESSAGES.FORBIDDEN;
            case 404:
                return ERROR_MESSAGES.NOT_FOUND;
            case 422:
                return error.response.data?.message || ERROR_MESSAGES.VALIDATION_ERROR;
            case 500:
            default:
                return ERROR_MESSAGES.SERVER_ERROR;
        }
    }

    return error.message || 'Có lỗi không xác định xảy ra';
};

// ✅ TỐT - Component với proper error handling
const UserProfile: React.FC<{ userId: string }> = ({ userId }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                setLoading(true);
                setError(null);
                
                const userData = await userService.getUserById(userId);
                setUser(userData);
            } catch (err) {
                const errorMessage = handleApiError(err);
                setError(errorMessage);
                console.error('Error fetching user:', err); // Log for debugging
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [userId]);

    if (loading) return <div>Đang tải thông tin người dùng...</div>;
    
    if (error) {
        return (
            <div className="error-container">
                <p>{error}</p>
                <button onClick={() => window.location.reload()}>
                    Thử lại
                </button>
            </div>
        );
    }

    if (!user) {
        return <div>Không tìm thấy thông tin người dùng</div>;
    }

    return (
        <div className="user-profile">
            <h1>{user.fullName}</h1>
            <p>{user.email}</p>
            {/* User profile content */}
        </div>
    );
};

// ❌ KHÔNG TỐT - Silent failure và technical errors
const BadUserProfile = ({ userId }: { userId: string }) => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        fetch(`/api/users/${userId}`)
            .then(res => res.json())
            .then(setUser)
            .catch(() => {
                // Silent failure - user doesn't know what happened
            });
    }, [userId]);

    return user ? (
        <div>{user.name}</div>
    ) : (
        <div>Error: Failed to fetch user data</div> // Technical error message
    );
};
```

## 🧭 **8. Redux Toolkit – Follow `authentication/` pattern**
- [ ] ✅ Mỗi feature gồm: `{entity}API.ts`, `{entity}Slice.ts`, `{entity}Thunk.ts`
- [ ] ✅ Dùng `useAppDispatch` và `useAppSelector` từ `store/hook.ts`
- [ ] ✅ Viết selectors trong `{entity}Slice.ts` và export từ đó
- [ ] ✅ Async logic dùng `createAsyncThunk` trong `{entity}Thunk.ts`
- [ ] ✅ Tên action types, file names mirror `authentication/`
- [ ] ❌ Không tạo hooks Redux riêng cho từng feature (ví dụ: `useAuthStore`, `useUserStore`)

```tsx
// Ví dụ dùng đúng trong component (không tạo hook Redux riêng)
import { useAppDispatch, useAppSelector } from '@/store/hook';
import { loginThunk } from '@/features/authentication/authThunk';

const LoginButton = () => {
  const dispatch = useAppDispatch();
  const loading = useAppSelector((s) => s.auth.loading);
  return (
    <button disabled={loading} onClick={() => dispatch(loginThunk({ email: 'a@b.com', password: 'x' }))}>
      {loading ? 'Loading...' : 'Login'}
    </button>
  );
};
```

---

## 🔍 **Code Review Checklist**
Trước khi submit PR, kiểm tra:
- [ ] ✅ Có tuân thủ 7 nguyên tắc trên không?
- [ ] ✅ Components có thể hiểu và maintain không?
- [ ] ✅ Có unit tests đầy đủ cho components và hooks không?
- [ ] ✅ Performance có OK không? (React re-renders, bundle size)
- [ ] ✅ Accessibility có đảm bảo không? (ARIA labels, keyboard navigation)
- [ ] ✅ TypeScript types đầy đủ (JSDoc comments)
- [ ] ✅ Sử dụng đúng React patterns (hooks, context, memo)
- [ ] ✅ Naming conventions đúng chuẩn React/TypeScript
- [ ] ✅ Props có TypeScript interfaces đầy đủ
- [ ] ✅ Proper error handling với Error Boundaries

---

## 🎯 **Quick Reference**

### ✅ **Frontend Patterns To Follow**
```tsx
// Custom Hook Pattern
const useUser = (userId: string) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const userData = await userService.getUserById(userId);
                setUser(userData);
            } catch (err) {
                setError(handleApiError(err));
            } finally {
                setLoading(false);
            }
        };
        
        fetchUser();
    }, [userId]);

    return { user, loading, error };
};

// Component with proper TypeScript
interface UserCardProps {
    user: User;
    onEdit?: (user: User) => void;
    onDelete?: (userId: string) => void;
    showActions?: boolean;
}

const UserCard: React.FC<UserCardProps> = React.memo(({
    user,
    onEdit,
    onDelete,
    showActions = true
}) => {
    const handleEdit = useCallback(() => {
        onEdit?.(user);
    }, [onEdit, user]);

    const handleDelete = useCallback(() => {
        onDelete?.(user.id);
    }, [onDelete, user.id]);

    return (
        <div className="user-card" role="article" aria-label={`User ${user.fullName}`}>
            <h3>{user.fullName}</h3>
            <p>{user.email}</p>
            {showActions && (
                <div className="user-actions">
                    <button onClick={handleEdit} aria-label={`Edit ${user.fullName}`}>
                        Edit
                    </button>
                    <button 
                        onClick={handleDelete} 
                        aria-label={`Delete ${user.fullName}`}
                        className="danger"
                    >
                        Delete
                    </button>
                </div>
            )}
        </div>
    );
});

// TypeScript Interface với JSDoc
interface User {
    /**
     * Unique identifier for the user
     * @example "507f1f77bcf86cd799439011"
     */
    id: string;
    
    /**
     * User's email address
     * @example "john@example.com"
     */
    email: string;
    
    /**
     * User's full display name
     * @example "John Doe"
     */
    fullName: string;
    
    /**
     * User's role in the system
     */
    role: UserRole;
}
```

### ❌ **Frontend Anti-Patterns To Avoid**
```tsx
// Avoid magic numbers and hardcoded values
if (status === 1) // ❌ Use enum instead
<div style={{ marginTop: '16px' }}> // ❌ Use CSS classes or theme

// Avoid any types
const UserCard = ({ user }: { user: any }) => { // ❌ Use proper interface

// Avoid unnecessary re-renders
const UserList = () => {
    const [users, setUsers] = useState([]);
    
    return (
        <div>
            {users.map(user => (
                <UserCard 
                    key={user.id} 
                    user={user}
                    onEdit={() => editUser(user)} // ❌ Creates new function each render
                />
            ))}
        </div>
    );
};

// Avoid silent failures
useEffect(() => {
    fetchUsers()
        .then(setUsers)
        .catch(() => {}); // ❌ Silent failure - user doesn't know about error
}, []);

// Avoid fetch trong component render
const UserProfile = ({ userId }: { userId: string }) => {
    const [user, setUser] = useState(null);
    
    fetch(`/api/users/${userId}`) // ❌ Should be in useEffect
        .then(res => res.json())
        .then(setUser);
        
    return <div>{user?.name}</div>;
};
```

---

**💡 Tip**: In checklist này ra và dán bên màn hình để nhớ check khi code SportZone Frontend!