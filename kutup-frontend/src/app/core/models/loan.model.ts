// TypeScript
export type LoanStatus = 'ACTIVE' | 'OVERDUE' | 'RETURNED';

export interface LoanResponse {
  id: number;              // Long
  userId: string;          // UUID as string
  username?: string | null;
  bookId: string;          // UUID as string
  bookTitle?: string | null;
  loanDate: string;        // ISO date (yyyy-MM-dd)
  dueDate: string;         // ISO date (yyyy-MM-dd)
  returnDate?: string | null;
  status: LoanStatus;
}

export interface CreateLoanRequest {
  userId: string;          // UUID
  bookId: string;          // UUID
}

export interface UpdateLoanRequest {
  userId?: string | null;
  bookId?: string | null;
  loanDate?: string | null;     // yyyy-MM-dd
  dueDate?: string | null;      // yyyy-MM-dd
  returnDate?: string | null;   // yyyy-MM-dd
  status?: LoanStatus | null;
}
