// Filter options for field owners
export const ownerTypes = [
  { label: 'Individual', value: 'individual' as const },
  { label: 'Business', value: 'business' as const },
  { label: 'Household', value: 'household' as const },
]

export const registrationStatuses = [
  { label: 'Pending', value: 'pending' as const },
  { label: 'Approved', value: 'approved' as const },
  { label: 'Rejected', value: 'rejected' as const },
  { label: 'Clarification Requested', value: 'clarification_requested' as const },
]


export const bankAccountStatuses = [
  { label: 'Pending', value: 'pending' as const },
  { label: 'Verified', value: 'verified' as const },
  { label: 'Rejected', value: 'rejected' as const },
]

// Status badge colors (similar to callTypes in users)
export const statusColors = new Map([
  ['pending', 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-500 border-yellow-500/20'],
  ['approved', 'bg-green-500/10 text-green-600 dark:text-green-500 border-green-500/20'],
  ['rejected', 'bg-red-500/10 text-red-600 dark:text-red-500 border-red-500/20'],
])

export const bankAccountStatusColors = new Map([
  ['pending', 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-500 border-yellow-500/20'],
  ['verified', 'bg-green-500/10 text-green-600 dark:text-green-500 border-green-500/20'],
  ['rejected', 'bg-red-500/10 text-red-600 dark:text-red-500 border-red-500/20'],
])

