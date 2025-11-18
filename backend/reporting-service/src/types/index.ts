export interface ReportJob {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  fileUrl?: string;
  fileName?: string;
  createdAt: Date;
  completedAt?: Date;
  error?: string;
  type: 'pdf' | 'excel' | 'csv';
}

export interface ReportRequest {
  reportType: string;
  startDate?: string;
  endDate?: string;
  filters?: Record<string, any>;
  includeCharts?: boolean;
}

export interface AnalyticsData {
  summary: {
    totalRevenue: number;
    totalClaims: number;
    averageClaimValue: number;
    profitMargin: number;
  };
  revenue: Array<{
    date: string;
    amount: number;
    category: string;
  }>;
  claims: Array<{
    claimId: string;
    date: string;
    amount: number;
    status: string;
    type: string;
  }>;
  trends: {
    revenueGrowth: number;
    claimsGrowth: number;
  };
}

export interface Template {
  id: string;
  name: string;
  description: string;
  type: 'pdf' | 'excel' | 'csv';
  fields: string[];
}
