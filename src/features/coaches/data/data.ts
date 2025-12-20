// Sports options for coaches
export const sportsOptions = [
    { label: 'Football', value: 'FOOTBALL' as const },
    { label: 'Tennis', value: 'TENNIS' as const },
    { label: 'Badminton', value: 'BADMINTON' as const },
    { label: 'Basketball', value: 'BASKETBALL' as const },
    { label: 'Volleyball', value: 'VOLLEYBALL' as const },
]

export const registrationStatuses = [
    { label: 'Pending', value: 'pending' as const },
    { label: 'Approved', value: 'approved' as const },
    { label: 'Rejected', value: 'rejected' as const },
]

// Status badge colors (matching field-owners pattern)
export const statusColors = new Map([
    ['pending', 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-500 border-yellow-500/20'],
    ['approved', 'bg-green-500/10 text-green-600 dark:text-green-500 border-green-500/20'],
    ['rejected', 'bg-red-500/10 text-red-600 dark:text-red-500 border-red-500/20'],
])
