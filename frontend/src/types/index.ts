// Common API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  pagination?: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// User / Auth Types
export type UserRole = 'USER' | 'LIBRARIAN' | 'ADMINISTRATOR';
export type UserStatus = 'ACTIVE' | 'INACTIVE';

export interface User {
  id: string;
  registrationNumber: string;
  name: string;
  email: string;
  phoneNumber?: string | null;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
}

export interface LoginResponseData {
  user: User;
  accessToken: string;
  refreshToken?: string;
}

// Book & BookCopy Types
export interface Book {
  id: string;
  isbn: string;
  title: string;
  author: string;
  publisher?: string | null;
  year?: number | null;
  genre?: string | null;
  totalCopies: number;
  availableCopies: number;
  createdAt: string;
  updatedAt: string;
  copies?: BookCopy[];
}

export type BookCopyStatus = 'AVAILABLE' | 'ISSUED' | 'RESERVED' | 'MAINTENANCE' | 'LOST';

export interface BookCopy {
  id: string;
  bookId: string;
  barcode: string;
  status: BookCopyStatus;
  condition: string;
  location?: string | null;
  createdAt: string;
  updatedAt: string;
  book?: {
    id: string;
    title: string;
    isbn: string;
    author: string;
  };
}

// Policy Settings
export interface SystemPolicy {
  id?: string;
  borrowLimit: number;
  loanDuration: number;
  reservationPeriod: number;
  finePerDay: number;
  maxRenewals: number;
  updatedAt?: string;
}

// Audit Log Types
export interface AuditLog {
  id: string;
  userId?: string | null;
  userRole?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  details?: any;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
    registrationNumber: string;
  } | null;
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  isRead: boolean;
  type?: string;
  createdAt: string;
}

// Report Types
export interface CirculationReport {
  totalLoans: number;
  activeLoans: number;
  returnedLoans: number;
  overdueLoans: number;
  period?: {
    from: string;
    to: string;
  };
}

export interface OverdueReportItem {
  id: string;
  patron: {
    id: string;
    name: string;
    email: string;
    registrationNumber: string;
    phoneNumber?: string | null;
  };
  book: {
    title: string;
    barcode: string;
  };
  dueDate: string;
  daysOverdue: number;
  accruedFine: number;
}

export interface FinesReport {
  totalFinesAccrued: number;
  totalFinesPaid: number;
  outstandingFines: number;
  transactionsCount: number;
  period?: {
    from: string;
    to: string;
  };
}

export interface BorrowingStatisticsReport {
  mostBorrowedBooks: Array<{
    id: string;
    title: string;
    author: string;
    borrowCount: number;
  }>;
  totalUniqueBorrowers: number;
  averageLoanDurationDays: number;
}

// Debug Panel Log Item
export interface ApiDebugEntry {
  id: string;
  timestamp: string;
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  url: string;
  requestHeaders: Record<string, string>;
  requestBody?: any;
  status: number;
  statusText: string;
  responseHeaders: Record<string, string>;
  responseBody: any;
  durationMs: number;
  error?: string;
}
