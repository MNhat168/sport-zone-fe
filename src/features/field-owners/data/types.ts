// Re-export types from schema for convenience
export type {
  OwnerType,
  RegistrationStatus,
  BankAccountStatus,
  FieldOwnerRequest,
  FieldOwnerProfile,
  FieldOwnerProfileApi,
  FieldOwnerProfileListResponse,
  Pagination,
  ApproveRequest,
  RejectRequest,
  VerifyBankAccountRequest,
} from './schema'

// Additional utility types
export interface FieldOwnerTableRow {
  id: string
  ownerName: string
  facilityName: string
  email: string
  phone: string
  ownerType: OwnerType
  status: RegistrationStatus
  isVerified: boolean
  bankAccountVerified: boolean
  submittedAt: Date
}

export interface FieldOwnerRequestTableRow {
  id: string
  ownerName: string
  email: string
  phone: string
  ownerType: OwnerType
  status: RegistrationStatus
  submittedAt: Date
  facilityName: string
}

