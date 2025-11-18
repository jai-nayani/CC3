import api from './api';
import { AnalyticsFilters } from './analyticsService';

export interface ExportFormat {
  format: 'xlsx' | 'csv' | 'pdf';
  fileName?: string;
}

export const reportService = {
  async exportKPIs(filters?: AnalyticsFilters, options?: ExportFormat): Promise<Blob> {
    const response = await api.get('/reports/kpis/export', {
      params: { ...filters, format: options?.format || 'xlsx' },
      responseType: 'blob',
    });
    return response.data;
  },

  async exportRevenue(filters?: AnalyticsFilters, options?: ExportFormat): Promise<Blob> {
    const response = await api.get('/reports/revenue/export', {
      params: { ...filters, format: options?.format || 'xlsx' },
      responseType: 'blob',
    });
    return response.data;
  },

  async exportClaims(filters?: AnalyticsFilters, options?: ExportFormat): Promise<Blob> {
    const response = await api.get('/reports/claims/export', {
      params: { ...filters, format: options?.format || 'xlsx' },
      responseType: 'blob',
    });
    return response.data;
  },

  async exportDenials(filters?: AnalyticsFilters, options?: ExportFormat): Promise<Blob> {
    const response = await api.get('/reports/denials/export', {
      params: { ...filters, format: options?.format || 'xlsx' },
      responseType: 'blob',
    });
    return response.data;
  },

  async exportCustomReport(reportType: string, filters?: AnalyticsFilters, options?: ExportFormat): Promise<Blob> {
    const response = await api.get(`/reports/${reportType}/export`, {
      params: { ...filters, format: options?.format || 'xlsx' },
      responseType: 'blob',
    });
    return response.data;
  },

  downloadFile(blob: Blob, fileName: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },
};
