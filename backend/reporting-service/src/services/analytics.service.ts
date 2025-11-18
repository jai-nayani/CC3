import axios from 'axios';
import { AnalyticsData } from '../types';

const ANALYTICS_SERVICE_URL = process.env.ANALYTICS_SERVICE_URL || 'http://localhost:4002';

export class AnalyticsService {
  async fetchAnalyticsData(
    startDate?: string,
    endDate?: string,
    filters?: Record<string, any>
  ): Promise<AnalyticsData> {
    try {
      const params: any = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (filters) {
        Object.keys(filters).forEach(key => {
          params[key] = filters[key];
        });
      }

      // Fetch summary data
      const summaryResponse = await axios.get(`${ANALYTICS_SERVICE_URL}/analytics/summary`, {
        params,
        timeout: 10000,
      });

      // Fetch revenue data
      const revenueResponse = await axios.get(`${ANALYTICS_SERVICE_URL}/analytics/revenue`, {
        params,
        timeout: 10000,
      });

      // Fetch claims data
      const claimsResponse = await axios.get(`${ANALYTICS_SERVICE_URL}/analytics/claims`, {
        params,
        timeout: 10000,
      });

      // Fetch trends data
      const trendsResponse = await axios.get(`${ANALYTICS_SERVICE_URL}/analytics/trends`, {
        params,
        timeout: 10000,
      });

      return {
        summary: summaryResponse.data,
        revenue: revenueResponse.data,
        claims: claimsResponse.data,
        trends: trendsResponse.data,
      };
    } catch (error) {
      console.error('Error fetching analytics data:', error);

      // Return mock data if service is unavailable
      return this.getMockData();
    }
  }

  private getMockData(): AnalyticsData {
    return {
      summary: {
        totalRevenue: 1250000,
        totalClaims: 342,
        averageClaimValue: 3654.97,
        profitMargin: 23.5,
      },
      revenue: [
        { date: '2025-01-01', amount: 125000, category: 'Premium' },
        { date: '2025-01-02', amount: 132000, category: 'Premium' },
        { date: '2025-01-03', amount: 128500, category: 'Premium' },
        { date: '2025-01-04', amount: 145000, category: 'Premium' },
        { date: '2025-01-05', amount: 139000, category: 'Premium' },
      ],
      claims: [
        { claimId: 'CLM-001', date: '2025-01-01', amount: 5000, status: 'Approved', type: 'Medical' },
        { claimId: 'CLM-002', date: '2025-01-02', amount: 3200, status: 'Pending', type: 'Dental' },
        { claimId: 'CLM-003', date: '2025-01-03', amount: 8500, status: 'Approved', type: 'Medical' },
        { claimId: 'CLM-004', date: '2025-01-04', amount: 2100, status: 'Rejected', type: 'Vision' },
        { claimId: 'CLM-005', date: '2025-01-05', amount: 6200, status: 'Approved', type: 'Medical' },
      ],
      trends: {
        revenueGrowth: 12.5,
        claimsGrowth: 8.3,
      },
    };
  }
}

export const analyticsService = new AnalyticsService();
