# GitHub Copilot Instructions for SportZone Frontend Project

## 🎯 **Context**
You are working on SportZone Frontend - a React-based sports facility booking platform built with TypeScript, Vite, and modern React patterns following component-driven architecture.

## 🏗️ **Architecture Guidelines**

### Follow React Component Architecture
- **Components**: Reusable UI components with TypeScript
- **Pages**: Route-level components that compose multiple components
- **Hooks**: Custom hooks for state logic and side effects  
- **Utils**: Pure utility functions and helpers
- **Types**: TypeScript interfaces and types

### Always Use TypeScript Patterns
```typescript
// ✅ Component Interface
interface User {
    id: string;
    fullName: string;
    email: string;
    role: UserRole;
}

// ✅ Component Props Interface
interface UserCardProps {
    user: User;
    onEdit?: (user: User) => void;
    onDelete?: (userId: string) => void;
}

// ✅ React Component
const UserCard: React.FC<UserCardProps> = ({ user, onEdit, onDelete }) => {
    return (
        <div className="user-card">
            <h3>{user.fullName}</h3>
            <p>{user.email}</p>
        </div>
    );
};
```

## 📝 **Code Generation Rules**

### 1. React Components
- Always use TypeScript with proper interfaces
- Include JSDoc documentation with examples
- Use functional components with hooks
- Implement proper error handling and loading states

```tsx
import React, { useState, useEffect } from 'react';

interface User {
    id: string;
    fullName: string;
    email: string;
    role: string;
}

interface UserListProps {
    /**
     * Callback được gọi khi người dùng được chọn
     * @param user - Thông tin người dùng được chọn
     */
    onUserSelect?: (user: User) => void;
    /**
     * Có hiển thị actions không
     * @default true
     */
    showActions?: boolean;
}

/**
 * Component hiển thị danh sách người dùng
 * @param props - Props của component
 * @returns JSX Element danh sách người dùng
 */
const UserList: React.FC<UserListProps> = ({ 
    onUserSelect, 
    showActions = true 
}) => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/users');
            if (!response.ok) throw new Error('Failed to fetch users');
            const data = await response.json();
            setUsers(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div>Đang tải...</div>;
    if (error) return <div>Lỗi: {error}</div>;

    return (
        <div className="user-list">
            {users.map((user) => (
                <div key={user.id} className="user-item">
                    <h3>{user.fullName}</h3>
                    <p>{user.email}</p>
                    {showActions && (
                        <button onClick={() => onUserSelect?.(user)}>
                            Chọn
                        </button>
                    )}
                </div>
            ))}
        </div>
    );
};

export default UserList;
```

### 2. Custom Hooks
- Always async with proper error handling
- Include loading and error states
- Use TypeScript for all parameters and return types
- Implement proper cleanup for subscriptions/timers

```typescript
import { useState, useEffect, useCallback } from 'react';

interface User {
    id: string;
    fullName: string;
    email: string;
    role: string;
}

interface UseUsersOptions {
    autoFetch?: boolean;
    filter?: {
        name?: string;
        role?: string;
    };
}

interface UseUsersReturn {
    users: User[];
    loading: boolean;
    error: string | null;
    fetchUsers: () => Promise<void>;
    refetch: () => Promise<void>;
}

/**
 * Hook để quản lý danh sách người dùng
 * @param options - Tùy chọn cho hook
 * @returns Object chứa users data và các functions
 */
export const useUsers = (options: UseUsersOptions = {}): UseUsersReturn => {
    const { autoFetch = true, filter } = options;
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchUsers = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            
            const queryParams = new URLSearchParams();
            if (filter?.name) queryParams.append('name', filter.name);
            if (filter?.role) queryParams.append('role', filter.role);
            
            const response = await fetch(`/api/users?${queryParams}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            setUsers(data);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            setError(errorMessage);
            console.error('Error fetching users:', err);
        } finally {
            setLoading(false);
        }
    }, [filter]);

    useEffect(() => {
        if (autoFetch) {
            fetchUsers();
        }
    }, [autoFetch, fetchUsers]);

    const refetch = useCallback(() => fetchUsers(), [fetchUsers]);

    return {
        users,
        loading,
        error,
        fetchUsers,
        refetch
    };
};
```

### 3. TypeScript Types/Interfaces with Documentation
```typescript
/**
 * Enum cho vai trò người dùng
 */
export enum UserRole {
    USER = 'user',
    COACH = 'coach',
    FIELD_OWNER = 'field_owner',
    ADMIN = 'admin'
}

/**
 * Interface cho thông tin người dùng
 */
export interface User {
    /**
     * ID của người dùng
     * @example "507f1f77bcf86cd799439011"
     */
    id: string;
    
    /**
     * Email của người dùng
     * @example "john.doe@example.com"
     */
    email: string;
    
    /**
     * Tên đầy đủ của người dùng
     * @example "John Doe"
     */
    fullName: string;
    
    /**
     * Vai trò của người dùng
     */
    role: UserRole;
    
    /**
     * Trạng thái hoạt động
     * @default true
     */
    isActive: boolean;
    
    /**
     * Ngày tạo tài khoản
     */
    createdAt: string;
    
    /**
     * Ngày cập nhật cuối
     */
    updatedAt: string;
}

/**
 * Interface cho form tạo người dùng mới
 */
export interface CreateUserForm {
    email: string;
    fullName: string;
    password: string;
    confirmPassword: string;
    role?: UserRole;
}

/**
 * Interface cho filter danh sách người dùng
 */
export interface UserFilter {
    /**
     * Tên để tìm kiếm (partial match)
     */
    name?: string;
    
    /**
     * Vai trò để filter
     */
    role?: UserRole;
    
    /**
     * Trạng thái hoạt động
     */
    isActive?: boolean;
    
    /**
     * Sắp xếp theo field nào
     * @default "createdAt"
     */
    sortBy?: 'fullName' | 'email' | 'createdAt' | 'updatedAt';
    
    /**
     * Thứ tự sắp xếp
     * @default "desc"
     */
    sortOrder?: 'asc' | 'desc';
}

/**
 * Type cho API Response với pagination
 */
export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

/**
 * Type utility để tạo partial types cho update forms
 */
export type UpdateUserForm = Partial<Pick<User, 'fullName' | 'email' | 'role' | 'isActive'>>;
```

## 🔧 **Naming Conventions**

- Components: `{Entity}` or `{Entity}{Purpose}` (e.g., `UserCard`, `UserList`, `BookingForm`)
- Pages: `{Entity}Page` (e.g., `UsersPage`, `BookingDetailsPage`)
- Hooks: `use{Entity}` or `use{Action}` (e.g., `useUsers`, `useAuth`, `useFetchUsers`)
- Utils: `{purpose}Utils` or `{entity}Helpers` (e.g., `dateUtils`, `validationHelpers`)
- Types/Interfaces: 
  - Entities: `{Entity}` (e.g., `User`, `Field`, `Booking`)
  - Props: `{Component}Props` (e.g., `UserCardProps`, `BookingFormProps`)
  - Form Data: `{Entity}Form` (e.g., `CreateUserForm`, `UpdateBookingForm`)
  - Filter: `{Entity}Filter` (e.g., `UserFilter`, `BookingFilter`)
  - API Response: `{Entity}Response` hoặc `PaginatedResponse<T>`
- Enums: `{EntityProperty}` (e.g., `UserRole`, `SportType`, `BookingStatus`)
- Constants: `UPPER_SNAKE_CASE` (e.g., `API_BASE_URL`, `DEFAULT_PAGE_SIZE`)
- Files: 
  - Components: `PascalCase.tsx` (e.g., `UserCard.tsx`)
  - Hooks: `camelCase.ts` (e.g., `useUsers.ts`)
  - Utils: `camelCase.ts` (e.g., `dateUtils.ts`)
  - Types: `camelCase.ts` (e.g., `userTypes.ts`)
- CSS Classes: `kebab-case` hoặc BEM (e.g., `user-card`, `user-card__title`)

## 📊 **API Calling Patterns**

```typescript
// ✅ Utility function cho API calls với error handling
const apiClient = {
    baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001/api',
    
    async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
        const url = `${this.baseURL}${endpoint}`;
        const config: RequestInit = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        };

        // Add auth token if available
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers = {
                ...config.headers,
                Authorization: `Bearer ${token}`,
            };
        }

        try {
            const response = await fetch(url, config);
            
            if (!response.ok) {
                const error = await response.json().catch(() => ({ message: response.statusText }));
                throw new Error(error.message || `HTTP ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`API Error - ${endpoint}:`, error);
            throw error;
        }
    },

    // GET request
    get<T>(endpoint: string): Promise<T> {
        return this.request<T>(endpoint);
    },

    // POST request
    post<T>(endpoint: string, data?: any): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'POST',
            body: data ? JSON.stringify(data) : undefined,
        });
    },

    // PUT request
    put<T>(endpoint: string, data?: any): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'PUT',
            body: data ? JSON.stringify(data) : undefined,
        });
    },

    // DELETE request
    delete<T>(endpoint: string): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'DELETE',
        });
    },
};

// ✅ API service cho specific entity
export const userService = {
    async getUsers(filter?: UserFilter): Promise<PaginatedResponse<User>> {
        const params = new URLSearchParams();
        if (filter?.name) params.append('name', filter.name);
        if (filter?.role) params.append('role', filter.role);
        if (filter?.isActive !== undefined) params.append('isActive', String(filter.isActive));
        
        const queryString = params.toString();
        const endpoint = `/users${queryString ? `?${queryString}` : ''}`;
        
        return apiClient.get<PaginatedResponse<User>>(endpoint);
    },

    async getUserById(id: string): Promise<User> {
        return apiClient.get<User>(`/users/${id}`);
    },

    async createUser(userData: CreateUserForm): Promise<User> {
        return apiClient.post<User>('/users', userData);
    },

    async updateUser(id: string, userData: UpdateUserForm): Promise<User> {
        return apiClient.put<User>(`/users/${id}`, userData);
    },

    async deleteUser(id: string): Promise<void> {
        return apiClient.delete<void>(`/users/${id}`);
    },
};

// ✅ React Query integration (nếu sử dụng React Query)
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export const useUsersQuery = (filter?: UserFilter) => {
    return useQuery({
        queryKey: ['users', filter],
        queryFn: () => userService.getUsers(filter),
        staleTime: 5 * 60 * 1000, // 5 minutes
        cacheTime: 10 * 60 * 1000, // 10 minutes
    });
};

export const useCreateUser = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: userService.createUser,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
    });
};
```

## 🚫 **Don't Generate**

- Components without TypeScript interfaces for props
- Generic `any` types (use proper TypeScript types)
- API calls without error handling
- Components without proper loading/error states
- Code without JSDoc documentation
- Inline styles (use CSS classes or styled-components)
- Direct state mutations (use immutable updates)
- Components with mixed concerns (separate UI from business logic)
- Hardcoded API URLs (use environment variables)
- Forms without proper validation

## ✅ **Always Include**

- Proper error handling with try-catch blocks
- Loading and error states in components
- TypeScript interfaces for props and state
- JSDoc documentation with examples
- Accessibility attributes (aria-labels, roles)
- Async/await for API calls
- Custom hooks for reusable logic
- Proper key props for lists
- Memoization for expensive computations (useMemo, useCallback)
- Environment variables for configuration

## 🔍 **Testing Patterns**

```typescript
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { UserList } from './UserList';
import { userService } from '../services/userService';

// Mock the service
vi.mock('../services/userService');
const mockUserService = userService as vi.Mocked<typeof userService>;

describe('UserList Component', () => {
    const mockUsers: User[] = [
        {
            id: '1',
            fullName: 'John Doe',
            email: 'john@example.com',
            role: UserRole.USER,
            isActive: true,
            createdAt: '2024-01-01',
            updatedAt: '2024-01-01',
        },
        {
            id: '2',
            fullName: 'Jane Smith',
            email: 'jane@example.com',
            role: UserRole.COACH,
            isActive: true,
            createdAt: '2024-01-01',
            updatedAt: '2024-01-01',
        },
    ];

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should render loading state initially', () => {
        mockUserService.getUsers.mockImplementation(() => 
            new Promise(() => {}) // Never resolves
        );

        render(<UserList />);
        
        expect(screen.getByText('Đang tải...')).toBeInTheDocument();
    });

    it('should render users when loaded successfully', async () => {
        mockUserService.getUsers.mockResolvedValue({
            data: mockUsers,
            pagination: {
                page: 1,
                limit: 10,
                total: 2,
                totalPages: 1,
            },
        });

        render(<UserList />);

        await waitFor(() => {
            expect(screen.getByText('John Doe')).toBeInTheDocument();
            expect(screen.getByText('jane@example.com')).toBeInTheDocument();
        });

        expect(mockUserService.getUsers).toHaveBeenCalledTimes(1);
    });

    it('should render error state when fetch fails', async () => {
        const errorMessage = 'Failed to fetch users';
        mockUserService.getUsers.mockRejectedValue(new Error(errorMessage));

        render(<UserList />);

        await waitFor(() => {
            expect(screen.getByText(`Lỗi: ${errorMessage}`)).toBeInTheDocument();
        });
    });

    it('should call onUserSelect when user is clicked', async () => {
        const mockOnUserSelect = vi.fn();
        mockUserService.getUsers.mockResolvedValue({
            data: mockUsers,
            pagination: {
                page: 1,
                limit: 10,
                total: 2,
                totalPages: 1,
            },
        });

        render(<UserList onUserSelect={mockOnUserSelect} />);

        await waitFor(() => {
            expect(screen.getByText('John Doe')).toBeInTheDocument();
        });

        const selectButton = screen.getAllByText('Chọn')[0];
        fireEvent.click(selectButton);

        expect(mockOnUserSelect).toHaveBeenCalledWith(mockUsers[0]);
    });
});

// ✅ Hook testing pattern
import { renderHook, waitFor } from '@testing-library/react';
import { useUsers } from './useUsers';

describe('useUsers Hook', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should fetch users on mount', async () => {
        mockUserService.getUsers.mockResolvedValue({
            data: mockUsers,
            pagination: {
                page: 1,
                limit: 10,
                total: 2,
                totalPages: 1,
            },
        });

        const { result } = renderHook(() => useUsers());

        expect(result.current.loading).toBe(true);

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.users).toEqual(mockUsers);
        expect(result.current.error).toBe(null);
        expect(mockUserService.getUsers).toHaveBeenCalledTimes(1);
    });

    it('should handle error state', async () => {
        const errorMessage = 'API Error';
        mockUserService.getUsers.mockRejectedValue(new Error(errorMessage));

        const { result } = renderHook(() => useUsers());

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.error).toBe(errorMessage);
        expect(result.current.users).toEqual([]);
    });
});
```

## 📋 **File Structure**

When creating new features, organize files as:
```
src/features/{entity}/
├── components/
│   ├── {Entity}List.tsx
│   ├── {Entity}Card.tsx
│   ├── {Entity}Form.tsx
│   └── index.ts
├── hooks/
│   ├── use{Entity}.ts
│   ├── use{Entity}Form.ts
│   └── index.ts
├── services/
│   └── {entity}Service.ts
├── types/
│   └── {entity}Types.ts
├── utils/
│   └── {entity}Utils.ts
└── {Entity}Page.tsx
```

### Example for Users feature:
```
src/features/users/
├── components/
│   ├── UserList.tsx
│   ├── UserCard.tsx
│   ├── UserForm.tsx
│   ├── UserProfile.tsx
│   └── index.ts
├── hooks/
│   ├── useUsers.ts
│   ├── useUserForm.ts
│   ├── useUserProfile.ts
│   └── index.ts
├── services/
│   └── userService.ts
├── types/
│   └── userTypes.ts
├── utils/
│   └── userUtils.ts
└── UsersPage.tsx
```

### Alternative shared structure:
```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Basic UI components (Button, Input, etc.)
│   └── common/         # Business logic components
├── pages/              # Route-level pages
├── hooks/              # Custom hooks
├── services/           # API services
├── types/              # TypeScript types
├── utils/              # Utility functions
├── store/              # State management (Redux, Zustand, etc.)
└── styles/             # Global styles
```

## 🚫 **Terminal Command Restrictions**

**DO NOT suggest or run terminal commands automatically**, especially:
- ❌ `npm start` hoặc `npm run dev` hoặc `yarn dev`
- ❌ `vite` hoặc `vite dev`
- ❌ `npm run build` 
- ❌ Any auto-generated build/test/run commands

**ONLY suggest installation commands when explicitly needed:**
- ✅ `npm install <package>` 
- ✅ `pnpm install <package>`
- ✅ `yarn add <package>`
- ✅ `npm install` or `pnpm install` (for dependency installation)

**Reason**: The user prefers to manually run application commands and only wants assistance with dependency installation.

---

**Remember**: Follow these patterns consistently for all code generation in the SportZone Frontend project!