import { apiClient } from './client';
import { ApiResponse, Loan } from '../types';

export const loansApi = {
  // Issue book to patron
  async issueBook(userId: string, barcode: string): Promise<ApiResponse<Loan>> {
    const res = await apiClient.post<ApiResponse<Loan>>('/loans/issue', {
      userId,
      barcode,
    });
    return res.data;
  },

  // Return book from patron (returns loan and calculated fines if any)
  async returnBook(barcode: string): Promise<ApiResponse<{ loan: Loan; fine?: any; message: string }>> {
    const res = await apiClient.post<ApiResponse<{ loan: Loan; fine?: any; message: string }>>(
      '/loans/return',
      { barcode }
    );
    return res.data;
  },

  // Renew loan
  async renewLoan(loanId: string): Promise<ApiResponse<Loan>> {
    const res = await apiClient.post<ApiResponse<Loan>>(`/loans/${loanId}/renew`);
    return res.data;
  },

  // Get active loans across the library
  async getOverdueLoans(): Promise<ApiResponse<Loan[]>> {
    const res = await apiClient.get<ApiResponse<Loan[]>>('/loans/overdue');
    return res.data;
  },

  // Sync overdue statuses
  async syncOverdue(): Promise<ApiResponse<{ updatedCount: number }>> {
    const res = await apiClient.post<ApiResponse<{ updatedCount: number }>>('/loans/sync-overdue');
    return res.data;
  },

  // Get loan details
  async getLoanById(id: string): Promise<ApiResponse<Loan>> {
    const res = await apiClient.get<ApiResponse<Loan>>(`/loans/${id}`);
    return res.data;
  },
};
