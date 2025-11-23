import { z } from 'zod'

const userStatusSchema = z.union([z.literal('active'), z.literal('inactive')])
export type UserStatus = z.infer<typeof userStatusSchema>

const userRoleSchema = z.union([
  z.literal('admin'),
  z.literal('user'),
  z.literal('field_owner'),
  z.literal('coach'),
])
export type UserRole = z.infer<typeof userRoleSchema>

export const userSchema = z.object({
  _id: z.string(),
  fullName: z.string(),
  email: z.string().email(),
  phone: z.string().optional().nullable(),
  role: userRoleSchema,
  status: userStatusSchema,
  isVerified: z.boolean(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
})
export type User = z.infer<typeof userSchema>

export const userListPayloadSchema = z.object({
  data: z.array(userSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
  hasNextPage: z.boolean(),
  hasPrevPage: z.boolean(),
})
export type UserList = z.infer<typeof userListPayloadSchema>

export const userListResponseSchema = z.object({
  success: z.boolean().optional(),
  data: userListPayloadSchema,
})
