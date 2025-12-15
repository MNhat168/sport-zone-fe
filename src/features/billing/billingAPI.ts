const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export const GET_OVERDUE_ACCOUNTS_API = (page?: number, limit?: number) => 
  `${API_BASE_URL}/billing/admin/overdue?page=${page || 1}&limit=${limit || 10}`;

export const SUSPEND_USER_API = (userId: string) => 
  `${API_BASE_URL}/billing/admin/suspend/${userId}`;

export const UNSUSPEND_USER_API = (userId: string) => 
  `${API_BASE_URL}/billing/admin/unsuspend/${userId}`;

