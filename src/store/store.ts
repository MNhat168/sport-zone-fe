import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/authentication/authSlice";
import userReducer from "../features/user/userSlice";
import fieldReducer from "../features/field/fieldSlice";
import bookingReducer from "../features/booking/bookingSlice";
import coachReducer from "../features/coach/coachSlice";
import { amenitiesReducer } from "../features/amenities";
import { ownerProfileReducer } from "../features/field-owner-profile";

export const store = configureStore({
    reducer: {
        auth: authReducer,
        user: userReducer,
        field: fieldReducer,
        booking: bookingReducer,
        coach: coachReducer,
        amenities: amenitiesReducer,
        ownerProfile: ownerProfileReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
