// Common API types
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

// User types
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
  registrationDate?: string;
}

export interface LoginResponseData {
  user: User;
  accessToken: string;
  refreshToken?: string;
}

// Book & Book Copy types
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

export type BookCopyStatus = 'AVAILABLE' | 'BORROWED' | 'RESERVED' | 'MAINTENANCE' | 'LOST';

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

// Loan types
export type LoanStatus = 'ACTIVE' | 'RETURNED' | 'OVERDUE';

export interface Loan {
  id: string;
  userId: string;
  copyId: string;
  issueDate: string;
  dueDate: string;
  returnDate?: string | null;
  renewCount: number;
  status: LoanStatus;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
    registrationNumber: string;
    phoneNumber?: string | null;
  };
  copy?: {
    id: string;
    barcode: string;
    condition: string;
    location?: string | null;
    book?: {
      id: string;
      title: string;
      author: string;
      isbn: string;
    };
  };
  fine?: Fine | null;
}

// Fine types
export interface Fine {
  id: string;
  loanId: string;
  amount: number;
  paidAmount: number;
  isPaid: boolean;
  paidAt?: string | null;
  createdAt: string;
  loan?: {
    id: string;
    userId: string;
    issueDate: string;
    dueDate: string;
    returnDate?: string | null;
    user?: {
      name: string;
      email: string;
      registrationNumber: string;
    };
    copy?: {
      barcode: string;
      book?: {
        title: string;
      };
    };
  };
}

// Reservation types
export type ReservationStatus = 'PENDING' | 'ACTIVE' | 'COLLECTED' | 'CANCELLED' | 'EXPIRED';

export interface Reservation {
  id: string;
  userId: string;
  bookId: string;
  copyId?: string | null;
  status: ReservationStatus;
  holdExpiresAt?: string | null;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
    registrationNumber: string;
  };
  book?: {
    id: string;
    title: string;
    author: string;
    isbn: string;
  };
  copy?: {
    barcode: string;
  } | null;
}

// Notification types
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}
