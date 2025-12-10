import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/authentication/authSlice";
import userReducer from "../features/user/userSlice";
import fieldReducer from "../features/field/fieldSlice";
import bookingReducer from "../features/booking/bookingSlice";
import coachReducer from "../features/coach/coachSlice";
import transactionsReducer from "../features/transactions/transactionsSlice";
import { amenitiesReducer } from "../features/amenities";
import { ownerProfileReducer } from "../features/field-owner-profile";
import { tournamentReducer } from "@/features/tournament";
import { walletReducer } from "../features/wallet";
import { registrationReducer } from "../features/field-owner-registration";
import { bankAccountReducer } from "../features/bank-account";
import chatReducer from "@/features/chat/chatSlice";
import { reviewReducer } from "@/features/reviews";

export const store = configureStore({
    reducer: {
        auth: authReducer,
        user: userReducer,
        field: fieldReducer,
        booking: bookingReducer,
        coach: coachReducer,
        transactions: transactionsReducer,
        amenities: amenitiesReducer,
        ownerProfile: ownerProfileReducer,
        tournament : tournamentReducer,
        wallet: walletReducer,
        registration: registrationReducer,
        bankAccount: bankAccountReducer,
        chat: chatReducer,
        reviews: reviewReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
