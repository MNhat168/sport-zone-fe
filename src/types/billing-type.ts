export interface OverdueAccount {
  invoiceId: string;
  userId: string;
  email: string;
  fullName: string;
  phone?: string;
  subscriptionStatus: 'active' | 'grace_period' | 'suspended';
  amount: number;
  month: number;
  year: number;
  dueDate: string; // ISO date string
  status: 'pending' | 'overdue';
  daysOverdue: number;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface OverdueAccountsResponse {
  data: OverdueAccount[];
  pagination: PaginationInfo;
}

export interface BillingState {
  overdueAccounts: OverdueAccount[];
  pagination: PaginationInfo | null;
  loading: boolean;
  error: ErrorResponse | null;
  suspendLoading: boolean;
  suspendError: ErrorResponse | null;
  unsuspendLoading: boolean;
  unsuspendError: ErrorResponse | null;
}

export interface ErrorResponse {
  message: string;
  status: string;
}

export interface SuspendUserPayload {
  userId: string;
  reason?: string;
}

