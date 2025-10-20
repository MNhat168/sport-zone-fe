// Export all coach-related functionality
export { default as coachReducer } from './coachSlice';
export {
    clearCurrentCoach,
    clearErrors,
    resetCoachState,
} from './coachSlice';

export {
    getCoaches,
    getCoachById,
    getAllCoaches,
} from './coachThunk';

export {
    COACHES_API,
    COACH_BY_ID_API,
    ALL_COACHES_API,
} from './coachAPI';

// Export types
export type {
    Coach,
    LegacyCoach,
    CoachDetail,
    CoachFilters,
    CoachesResponse,
    LegacyCoachesResponse,
    CoachDetailResponse,
    ErrorResponse,
    TimeSlot,
    LessonType,
    SportType,
} from '../../types/coach-type';
