import { apiClient } from './client';
import { ApiResponse, AuditLog } from '../types';

export interface GetAuditLogsParams {
  page?: number;
  limit?: number;
  userId?: string;
  action?: string;
  entityType?: string;
  from?: string;
  to?: string;
}

export const auditApi = {
  async getAuditLogs(params?: GetAuditLogsParams): Promise<ApiResponse<AuditLog[]>> {
    const res = await apiClient.get<ApiResponse<AuditLog[]>>('/audit', { params });
    return res.data;
  },
};
