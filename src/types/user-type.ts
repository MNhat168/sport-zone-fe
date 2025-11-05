export interface UserProfile {
    id: string
    fullName: string
    email: string
    phone?: string
    avatarUrl?: string
    role: string
    isVerified: boolean
}

export interface UpdateProfileData {
    fullName?: string
    email?: string
    phone?: string
    avatarUrl?: string
}

export interface User {
    _id: string
    fullName: string
    email: string
    phone?: string
    avatarUrl?: string
    role: string
    isVerified: boolean
    status: string
    isActive: boolean
    googleId?: string
    favouriteSports?: string[]
    createdAt: string
    updatedAt: string
}

// Payload types for API calls
export interface UpdateProfilePayload {
    fullName?: string
    email?: string
    phone?: string
    avatar?: File
}

export interface ForgotPasswordPayload {
    email: string
}

export interface ResetPasswordPayload {
    token: string
    newPassword: string
}

export interface ChangePasswordPayload {
    old_password: string
    new_password: string
    confirm_password: string
}

export interface ErrorResponse {
    message: string
    status: string
}