import { z } from 'zod'

// Owner type schema
export const ownerTypeSchema = z.enum(['individual', 'business', 'household'])
export type OwnerType = z.infer<typeof ownerTypeSchema>

// Status schemas
export const registrationStatusSchema = z.enum(['pending', 'approved', 'rejected'])
export type RegistrationStatus = z.infer<typeof registrationStatusSchema>

export const bankAccountStatusSchema = z.enum(['pending', 'verified', 'rejected'])
export type BankAccountStatus = z.infer<typeof bankAccountStatusSchema>

// User info schema
const userInfoSchema = z.object({
  fullName: z.string(),
  phone: z.string(),
  email: z.string(),
})

// Personal info schema
const personalInfoSchema = z.object({
  fullName: z.string(),
  idNumber: z.string(),
  address: z.string(),
})

// Documents schema
const documentsSchema = z.object({
  idFront: z.string().url(),
  idBack: z.string().url(),
  businessLicense: z.string().url().optional(),
})

// GPS coordinates schema
const gpsSchema = z.object({
  lat: z.number(),
  lng: z.number(),
})

// Field info schema
const fieldInfoSchema = z.object({
  name: z.string(),
  address: z.string(),
  gps: gpsSchema,
  pitchCount: z.number(),
  pitchTypes: z.array(z.string()),
  pricePerHour: z.object({
    peak: z.number(),
    offpeak: z.number(),
  }),
  images: z.array(z.string().url()),
})

// Bank account schema
const bankAccountSchema = z.object({
  id: z.string().optional(),
  accountName: z.string(),
  accountNumber: z.string(),
  bankName: z.string(),
  branch: z.string().optional(),
  verificationDocument: z.string().url().optional(),
  status: bankAccountStatusSchema,
  verifiedAt: z.coerce.date().optional(),
  verifiedBy: z.string().optional(),
})

// Field Owner Registration Request schema
export const fieldOwnerRequestSchema = z.object({
  id: z.string(),
  userId: z.string(),
  userInfo: userInfoSchema,
  ownerType: ownerTypeSchema,
  personalInfo: personalInfoSchema,
  documents: documentsSchema,
  fieldInfo: fieldInfoSchema,
  bankAccount: bankAccountSchema.optional(),
  status: registrationStatusSchema,
  rejectionReason: z.string().optional(),
  submittedAt: z.coerce.date(),
  reviewedAt: z.coerce.date().optional(),
  reviewedBy: z.string().optional(),
})

export type FieldOwnerRequest = z.infer<typeof fieldOwnerRequestSchema>

// Field Owner Profile schema (approved field owners)
export const fieldOwnerProfileSchema = z.object({
  id: z.string(),
  userId: z.string(),
  userInfo: userInfoSchema,
  ownerType: ownerTypeSchema,
  personalInfo: personalInfoSchema,
  facilityName: z.string(),
  facilityLocation: z.string(),
  isVerified: z.boolean(),
  verificationDocument: z.string().url().optional(),
  bankAccounts: z.array(bankAccountSchema),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type FieldOwnerProfile = z.infer<typeof fieldOwnerProfileSchema>

// Approval/Rejection request schemas
export const approveRequestSchema = z.object({
  notes: z.string().optional(),
})

export const rejectRequestSchema = z.object({
  reason: z.string().min(1, 'Rejection reason is required'),
})

export type ApproveRequest = z.infer<typeof approveRequestSchema>
export type RejectRequest = z.infer<typeof rejectRequestSchema>

// Bank account verification request
export const verifyBankAccountSchema = z.object({
  notes: z.string().optional(),
})

export type VerifyBankAccountRequest = z.infer<typeof verifyBankAccountSchema>

// List response schemas
export const fieldOwnerRequestListSchema = z.array(fieldOwnerRequestSchema)
export const fieldOwnerProfileListSchema = z.array(fieldOwnerProfileSchema)

// Field Owner Profile API schema (from GET /fields/admin/owner-profiles)
export const fieldOwnerProfileApiSchema = z.object({
  id: z.string(),
  user: z.string(),
  userFullName: z.string(),
  userEmail: z.string(),
  facilityName: z.string(),
  facilityLocation: z.string(),
  supportedSports: z.array(z.string()),
  description: z.string().optional(),
  amenities: z.array(z.string()),
  rating: z.number(),
  totalReviews: z.number(),
  isVerified: z.boolean(),
  contactPhone: z.string().optional(),
  website: z.string().optional(),
})

export type FieldOwnerProfileApi = z.infer<typeof fieldOwnerProfileApiSchema>

// Pagination schema
export const paginationSchema = z.object({
  total: z.number().optional(),
  page: z.number().optional(),
  limit: z.number().optional(),
  totalPages: z.number().optional(),
  hasNextPage: z.boolean().optional(),
  hasPrevPage: z.boolean().optional(),
})

export type Pagination = z.infer<typeof paginationSchema>

// Field Owner Profile List Response schema
export const fieldOwnerProfileListResponseSchema = z.object({
  data: z.array(fieldOwnerProfileApiSchema),
  pagination: paginationSchema.optional(),
})

export type FieldOwnerProfileListResponse = z.infer<
  typeof fieldOwnerProfileListResponseSchema
>

