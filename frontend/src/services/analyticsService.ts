import api from './api';
import { KPIData, RevenueDataPoint } from '../store/metricsSlice';

export interface AnalyticsFilters {
  startDate?: string;
  endDate?: string;
  facilityId?: number;
  department?: string;
}

export interface KPIResponse {
  kpis: KPIData;
  revenueData: RevenueDataPoint[];
}

export interface TrendData {
  period: string;
  value: number;
  change: number;
}

export const analyticsService = {
  async getKPIs(filters?: AnalyticsFilters): Promise<KPIResponse> {
    const response = await api.get<KPIResponse>('/analytics/kpis', {
      params: filters,
    });
    return response.data;
  },

  async getRevenueAnalytics(filters?: AnalyticsFilters): Promise<RevenueDataPoint[]> {
    const response = await api.get<RevenueDataPoint[]>('/analytics/revenue', {
      params: filters,
    });
    return response.data;
  },

  async getClaimsAnalytics(filters?: AnalyticsFilters): Promise<any> {
    const response = await api.get('/analytics/claims', {
      params: filters,
    });
    return response.data;
  },

  async getDenialAnalytics(filters?: AnalyticsFilters): Promise<any> {
    const response = await api.get('/analytics/denials', {
      params: filters,
    });
    return response.data;
  },

  async getPayerPerformance(filters?: AnalyticsFilters): Promise<any> {
    const response = await api.get('/analytics/payers', {
      params: filters,
    });
    return response.data;
  },

  async getFacilityComparison(filters?: AnalyticsFilters): Promise<any> {
    const response = await api.get('/analytics/facilities', {
      params: filters,
    });
    return response.data;
  },

  async getTrendData(metric: string, filters?: AnalyticsFilters): Promise<TrendData[]> {
    const response = await api.get<TrendData[]>(`/analytics/trends/${metric}`, {
      params: filters,
    });
    return response.data;
  },
};
