# Coach Feature Module

This module provides Redux-based state management for coach-related functionality, following the same pattern as other features in the application.

## Files Structure

```
src/features/coach/
├── coachAPI.ts      # API endpoint definitions
├── coachSlice.ts    # Redux slice with state management
├── coachThunk.ts    # Async thunks for API calls
├── index.ts         # Exports all functionality
└── README.md        # This documentation
```

## API Endpoints

Based on the coachesAPI.md documentation, this module supports:

1. **GET /coaches** - Get coaches with optional filters
2. **GET /coaches/all** - Get all coaches in legacy format
3. **GET /coaches/:id** - Get detailed coach information

## Usage Examples

### 1. Basic Setup in Component

```typescript
import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getCoaches, getCoachById, getAllCoaches } from '../features/coach';

const CoachesList: React.FC = () => {
  const dispatch = useDispatch();
  const { coaches, loading, error } = useSelector((state: any) => state.coach);

  useEffect(() => {
    // Get all coaches with filters
    dispatch(getCoaches({ 
      name: 'john', 
      sportType: 'tennis',
      minRate: 50,
      maxRate: 100 
    }));
  }, [dispatch]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {coaches.map((coach) => (
        <div key={coach.id}>
          <h3>{coach.fullName}</h3>
          <p>{coach.bio}</p>
          <p>Rating: {coach.rating} ({coach.totalReviews} reviews)</p>
          <p>Rate: ${coach.hourlyRate}/hour</p>
        </div>
      ))}
    </div>
  );
};
```

### 2. Get Coach Details

```typescript
import { getCoachById } from '../features/coach';

const CoachDetail: React.FC<{ coachId: string }> = ({ coachId }) => {
  const dispatch = useDispatch();
  const { currentCoach, detailLoading, detailError } = useSelector((state: any) => state.coach);

  useEffect(() => {
    dispatch(getCoachById(coachId));
  }, [dispatch, coachId]);

  if (detailLoading) return <div>Loading coach details...</div>;
  if (detailError) return <div>Error: {detailError.message}</div>;
  if (!currentCoach) return <div>Coach not found</div>;

  return (
    <div>
      <h1>{currentCoach.name}</h1>
      <p>{currentCoach.description}</p>
      <p>Rating: {currentCoach.rating} ({currentCoach.reviewCount} reviews)</p>
      <p>Price: ${currentCoach.price}/hour</p>
      
      <h3>Available Time Slots</h3>
      {currentCoach.availableSlots.map((slot, index) => (
        <div key={index}>
          {slot.startTime} - {slot.endTime}
        </div>
      ))}
      
      <h3>Lesson Types</h3>
      {currentCoach.lessonTypes.map((lesson) => (
        <div key={lesson._id}>
          <h4>{lesson.name}</h4>
          <p>{lesson.description}</p>
        </div>
      ))}
    </div>
  );
};
```

### 3. Get All Coaches (Legacy Format)

```typescript
import { getAllCoaches } from '../features/coach';

const LegacyCoachesList: React.FC = () => {
  const dispatch = useDispatch();
  const { allCoaches, allCoachesLoading, allCoachesError } = useSelector((state: any) => state.coach);

  useEffect(() => {
    dispatch(getAllCoaches());
  }, [dispatch]);

  if (allCoachesLoading) return <div>Loading...</div>;
  if (allCoachesError) return <div>Error: {allCoachesError.message}</div>;

  return (
    <div>
      {allCoaches.map((coach) => (
        <div key={coach.id}>
          <h3>{coach.name}</h3>
          <p>{coach.description}</p>
          <p>Location: {coach.location}</p>
          <p>Rating: {coach.rating} ({coach.totalReviews} reviews)</p>
          <p>Price: ${coach.price}/hour</p>
        </div>
      ))}
    </div>
  );
};
```

### 4. Filter Coaches

```typescript
import { getCoaches, CoachFilters } from '../features/coach';

const CoachFilters: React.FC = () => {
  const dispatch = useDispatch();

  const handleFilter = (filters: CoachFilters) => {
    dispatch(getCoaches(filters));
  };

  return (
    <div>
      <input 
        placeholder="Search by name"
        onChange={(e) => handleFilter({ name: e.target.value })}
      />
      <select onChange={(e) => handleFilter({ sportType: e.target.value })}>
        <option value="">All Sports</option>
        <option value="tennis">Tennis</option>
        <option value="football">Football</option>
        <option value="badminton">Badminton</option>
        {/* ... other sports */}
      </select>
      <input 
        type="number"
        placeholder="Min Rate"
        onChange={(e) => handleFilter({ minRate: Number(e.target.value) })}
      />
      <input 
        type="number"
        placeholder="Max Rate"
        onChange={(e) => handleFilter({ maxRate: Number(e.target.value) })}
      />
    </div>
  );
};
```

## State Structure

```typescript
interface CoachState {
  // Data
  coaches: Coach[];           // Filtered coaches from /coaches
  allCoaches: LegacyCoach[];  // All coaches from /coaches/all
  currentCoach: CoachDetail | null; // Selected coach details
  
  // Loading states
  loading: boolean;           // For getCoaches
  detailLoading: boolean;     // For getCoachById
  allCoachesLoading: boolean; // For getAllCoaches
  
  // Error states
  error: ErrorResponse | null;
  detailError: ErrorResponse | null;
  allCoachesError: ErrorResponse | null;
}
```

## Available Actions

### Redux Actions
- `clearCurrentCoach()` - Clear the current coach details
- `clearErrors()` - Clear all error states
- `resetCoachState()` - Reset the entire coach state

### Async Thunks
- `getCoaches(filters?)` - Get coaches with optional filters
- `getCoachById(id)` - Get detailed coach information
- `getAllCoaches()` - Get all coaches in legacy format

## Error Handling

All async thunks include comprehensive error handling with:
- Network errors
- API validation errors
- HTTP status code handling
- Detailed error messages

## TypeScript Support

Full TypeScript support with:
- Strongly typed interfaces
- Generic type parameters
- Error response types
- API response types

## Integration with Store

To integrate with your Redux store, add the coach reducer:

```typescript
import { coachReducer } from './features/coach';

const store = configureStore({
  reducer: {
    // ... other reducers
    coach: coachReducer,
  },
});
```
