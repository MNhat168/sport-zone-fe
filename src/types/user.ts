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
