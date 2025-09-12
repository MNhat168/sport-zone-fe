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
}