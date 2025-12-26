import { BASE_URL } from "../../utils/constant-value/constant";

// Base endpoints - All use /coaches (plural) as specified in coachesAPI.md
export const COACHES_API = `${BASE_URL}/coaches`;
export const COACH_BY_ID_API = (id: string) => `${BASE_URL}/coaches/${id}`;
export const ALL_COACHES_API = `${BASE_URL}/coaches/all`;
export const COACHES_PUBLIC_API = `${BASE_URL}/coaches/public`;
// Resolve coach profile by user id
export const COACH_ID_BY_USER_ID_API = (userId: string) => `${BASE_URL}/profiles/coach-id/${userId}`;
// Get coach bank account
export const COACH_BANK_ACCOUNT_API = (id: string) => `${BASE_URL}/coaches/${id}/bank-account`;
// Get coach available slots
export const COACH_AVAILABLE_SLOTS_API = (id: string, date: string) => `${BASE_URL}/coaches/${id}/slots?date=${date}`;
// Upload gallery images
export const UPLOAD_COACH_GALLERY_API = (id: string) => `${BASE_URL}/coaches/${id}/upload-gallery`;
// Delete gallery image by index
export const DELETE_COACH_GALLERY_IMAGE_API = (id: string, index: number) => `${BASE_URL}/coaches/${id}/gallery/${index}`;
