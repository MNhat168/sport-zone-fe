import { z } from 'zod'

export const transactionStatusSchema = z.enum([
  'pending',
  'processing',
  'succeeded',
  'failed',
  'cancelled',
  'refunded',
])
export type TransactionStatus = z.infer<typeof transactionStatusSchema>

export const transactionTypeSchema = z.enum([
  'payment',
  'refund_full',
  'refund_partial',
  'reversal',
  'adjustment',
  'payout',
  'fee',
])
export type TransactionType = z.infer<typeof transactionTypeSchema>

// method phía BE lưu dạng number enum, FE sẽ hiển thị bằng name/label
export const transactionSchema = z.object({
  _id: z.string(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  amount: z.number(),
  method: z.number().optional(),
  type: transactionTypeSchema,
  status: transactionStatusSchema,
  externalTransactionId: z.string().optional().nullable(),
  vnpayTransactionNo: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  booking: z.union([
    z.string(),
    z.object({
      _id: z.string(),
      date: z.string().optional(),
      startTime: z.string().optional(),
      endTime: z.string().optional(),
      field: z.union([
        z.string(),
        z.object({ _id: z.string(), name: z.string() }).passthrough(),
      ]).optional(),
    }).passthrough(),
  ]).optional(),
  user: z.union([
    z.string(),
    z
      .object({ _id: z.string(), fullName: z.string().optional(), email: z.string().optional() })
      .passthrough(),
  ]).optional(),
})
export type Transaction = z.infer<typeof transactionSchema>

export const transactionListPayloadSchema = z.object({
  data: z.array(transactionSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
  hasNextPage: z.boolean(),
  hasPrevPage: z.boolean(),
})
export type TransactionList = z.infer<typeof transactionListPayloadSchema>

export const transactionListResponseSchema = z.object({
  success: z.boolean().optional(),
  // BE trả trực tiếp payload (không bọc success) → vẫn chấp nhận trực tiếp
}).or(transactionListPayloadSchema)
