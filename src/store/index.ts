import { configureStore, combineReducers } from '@reduxjs/toolkit'
import { setupListeners } from '@reduxjs/toolkit/query'
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import { authApi } from './services/authApi'
import { dashboardApi } from './services/dashboardApi'
import { fieldOwnersApi } from './services/fieldOwnersApi'
import { usersApi } from './services/usersApi'
import { transactionsApi } from './services/transactionsApi'
import authReducer from './slices/authSlice'

// Persist config
const persistConfig = {
  key: 'root',
  version: 1,
  storage,
  whitelist: ['auth'], // Chỉ persist auth slice
}

// Combine reducers
const rootReducer = combineReducers({
  auth: authReducer,
  [authApi.reducerPath]: authApi.reducer,
  [dashboardApi.reducerPath]: dashboardApi.reducer,
  [fieldOwnersApi.reducerPath]: fieldOwnersApi.reducer,
  [usersApi.reducerPath]: usersApi.reducer,
  [transactionsApi.reducerPath]: transactionsApi.reducer,
})

// Persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer)

// Configure store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(
      authApi.middleware,
      dashboardApi.middleware,
      fieldOwnersApi.middleware,
      usersApi.middleware,
      transactionsApi.middleware,
    ),
})

// Setup listeners for RTK Query
setupListeners(store.dispatch)

// Persistor
export const persistor = persistStore(store)

// Types
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
