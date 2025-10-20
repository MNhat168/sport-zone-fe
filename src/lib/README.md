# User Authentication Utilities

This directory contains utility functions and hooks for handling user authentication and data retrieval.

## Files

### `user-utils.ts`
Core utility functions for user authentication:

- `getUserFromStorage()` - Get user data from cookie (primary) or localStorage/sessionStorage (fallback)
- `extractUserId(user)` - Extract user ID from user object, handling different ID formats
- `getUserIdFromStorage()` - Get user ID directly from storage
- `isUserAuthenticated()` - Check if user is authenticated

### `useAuth.ts` (in hooks directory)
Custom React hook for authentication state:

```typescript
const { user, userId, isAuthenticated, isLoading, refreshUserData } = useAuth();
```

## Usage Examples

### Basic User Data Retrieval
```typescript
import { getUserFromStorage, extractUserId } from '@/lib/user-utils';

// Get user object
const user = getUserFromStorage();
if (user) {
  const userId = extractUserId(user);
  console.log('User ID:', userId);
}
```

### Using the useAuth Hook
```typescript
import { useAuth } from '@/hooks/useAuth';

function MyComponent() {
  const { user, userId, isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated) return <div>Please login</div>;

  return <div>Welcome, {user?.fullName}!</div>;
}
```

### Authentication Check
```typescript
import { isUserAuthenticated } from '@/lib/user-utils';

if (isUserAuthenticated()) {
  // User is logged in
  console.log('User is authenticated');
} else {
  // Redirect to login
  window.location.href = '/login';
}
```

## Cookie vs Storage Priority

The system uses the following priority order:

1. **Cookie** (Primary) - `document.cookie` with pattern `/user=([^;]+)/`
2. **localStorage** (Fallback) - `localStorage.getItem("user")`
3. **sessionStorage** (Fallback) - `sessionStorage.getItem("user")`

## User Object Format

The system expects user objects in the following format:

```typescript
interface User {
  _id?: string;           // MongoDB ObjectId (string or buffer format)
  id?: string | number;   // Alternative ID field
  fullName?: string;
  email?: string;
  avatarUrl?: string;
  [key: string]: any;     // Additional user properties
}
```

## ID Extraction Logic

The `extractUserId` function handles multiple ID formats:

1. **String ID**: `user._id = "64a1b2c3d4e5f6789012345"`
2. **MongoDB ObjectId Buffer**: `user._id.buffer` (converted to hex string)
3. **Alternative ID**: `user.id` (converted to string)

## Error Handling

All functions include comprehensive error handling:

- Invalid JSON parsing
- Missing user data
- Invalid ID formats
- Console logging for debugging

## Integration with Coach Pages

The coach dashboard page uses these utilities to:

1. Get user data from cookie
2. Extract user ID
3. Fetch coach ID from API
4. Load coach details and bookings
5. Handle authentication states

## Best Practices

1. **Always check authentication state** before making API calls
2. **Use the useAuth hook** in React components for reactive updates
3. **Handle loading states** when using async authentication
4. **Provide fallback UI** for unauthenticated users
5. **Log errors** for debugging authentication issues
