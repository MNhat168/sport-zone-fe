import { z } from 'zod'

export const bookingStatusSchema = z.enum([
  'pending',
  'confirmed',
  'cancelled',
  'completed',
])
export type BookingStatus = z.infer<typeof bookingStatusSchema>

export const bookingTypeSchema = z.enum(['field', 'coach'])
export type BookingType = z.infer<typeof bookingTypeSchema>

export const paymentStatusSchema = z.enum(['unpaid', 'paid', 'refunded'])
export type PaymentStatus = z.infer<typeof paymentStatusSchema>

export const approvalStatusSchema = z.enum(['pending', 'approved', 'rejected'])
export type ApprovalStatus = z.infer<typeof approvalStatusSchema>

export const bookingSchema = z.object({
  _id: z.string(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  date: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  numSlots: z.number(),
  status: bookingStatusSchema,
  type: bookingTypeSchema,
  paymentStatus: paymentStatusSchema.optional(),
  approvalStatus: approvalStatusSchema.optional(),
  bookingAmount: z.number(),
  platformFee: z.number(),
  totalPrice: z.number().optional(),
  amenitiesFee: z.number().optional(),
  note: z.string().optional().nullable(),
  noteStatus: z.enum(['pending', 'accepted', 'denied']).optional(),
  cancellationReason: z.string().optional().nullable(),
  user: z.union([
    z.string(),
    z.object({
      _id: z.string(),
      fullName: z.string().optional(),
      email: z.string().optional(),
    }).passthrough(),
  ]),
  field: z.union([
    z.string(),
    z.object({
      _id: z.string(),
      name: z.string(),
      sportType: z.string().optional(),
      address: z.string().optional(),
    }).passthrough(),
  ]),
  court: z.union([
    z.string(),
    z.object({
      _id: z.string(),
      name: z.string().optional(),
      courtNumber: z.number().optional(),
    }).passthrough(),
  ]).optional(),
  requestedCoach: z.union([
    z.string(),
    z.object({
      _id: z.string(),
      fullName: z.string().optional(),
    }).passthrough(),
  ]).optional(),
  transaction: z.union([
    z.string(),
    z.object({
      _id: z.string(),
      amount: z.number().optional(),
      status: z.string().optional(),
      method: z.number().optional(),
    }).passthrough(),
  ]).optional(),
})
export type Booking = z.infer<typeof bookingSchema>

export const bookingListPayloadSchema = z.object({
  data: z.array(bookingSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
  hasNextPage: z.boolean(),
  hasPrevPage: z.boolean(),
})
export type BookingList = z.infer<typeof bookingListPayloadSchema>

export const bookingListResponseSchema = z.object({
  success: z.boolean().optional(),
}).or(bookingListPayloadSchema)

