import { apiClient } from './client';
import {
  ApiResponse,
  CirculationReport,
  OverdueReportItem,
  FinesReport,
  BorrowingStatisticsReport,
} from '../types';

export const reportsApi = {
  async getCirculationReport(from?: string, to?: string): Promise<ApiResponse<CirculationReport>> {
    const params: Record<string, string> = {};
    if (from) params.from = from;
    if (to) params.to = to;
    const res = await apiClient.get<ApiResponse<CirculationReport>>('/admin/reports/circulation', {
      params,
    });
    return res.data;
  },

  async getOverdueReport(): Promise<ApiResponse<OverdueReportItem[]>> {
    const res = await apiClient.get<ApiResponse<OverdueReportItem[]>>('/admin/reports/overdue');
    return res.data;
  },

  async getFinesReport(from?: string, to?: string): Promise<ApiResponse<FinesReport>> {
    const params: Record<string, string> = {};
    if (from) params.from = from;
    if (to) params.to = to;
    const res = await apiClient.get<ApiResponse<FinesReport>>('/admin/reports/fines', { params });
    return res.data;
  },

  async getBorrowingStatistics(): Promise<ApiResponse<BorrowingStatisticsReport>> {
    const res = await apiClient.get<ApiResponse<BorrowingStatisticsReport>>(
      '/admin/reports/borrowing-statistics'
    );
    return res.data;
  },
};
