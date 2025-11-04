import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface AuthUser {
  _id: string
  email: string
  fullName: string
  role: string
  avatarUrl?: string
  isActive: boolean
  isVerified: boolean
}

interface AuthState {
  user: AuthUser | null
  isAuthenticated: boolean
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<AuthUser>) => {
      state.user = action.payload
      state.isAuthenticated = true
    },
    clearAuth: (state) => {
      state.user = null
      state.isAuthenticated = false
    },
  },
})

export const { setUser, clearAuth } = authSlice.actions
export default authSlice.reducer
