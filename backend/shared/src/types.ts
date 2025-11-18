/**
 * Shared TypeScript types and interfaces
 */

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: ResponseMeta;
}

export interface ApiError {
  code: string;
  message: string;
  details?: any[];
}

export interface ResponseMeta {
  timestamp: string;
  version?: string;
  requestId?: string;
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
  hasNext?: boolean;
  hasPrevious?: boolean;
}

// Filter types
export interface DateFilter {
  startDate?: Date | string;
  endDate?: Date | string;
}

export interface PaginationFilter {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface FilterParams extends DateFilter, PaginationFilter {
  facilityId?: string;
  departmentId?: string;
  payerId?: string;
  status?: string;
}

// KPI types
export interface KPI {
  name: string;
  key: string;
  value: number;
  unit: 'currency' | 'percentage' | 'number' | 'days';
  trend: 'up' | 'down' | 'stable';
  percentChange: number;
  sparkline: number[];
  previousValue?: number;
  target?: number;
  isGood?: boolean;
}

export interface KPIResponse {
  kpis: KPI[];
  dateRange: {
    start: string;
    end: string;
  };
  lastUpdated: string;
}

// Auth types
export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  facilityIds?: string[];
  iat?: number;
  exp?: number;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  user: UserInfo;
}

export interface UserInfo {
  id: string;
  email: string;
  name: string;
  role: string;
  facilityAccess?: string[];
}

// Alert types
export interface AlertThreshold {
  metric: string;
  condition: '>' | '<' | '>=' | '<=' | '==' | '!=';
  value: number;
  level: 'INFO' | 'WARNING' | 'CRITICAL';
}

// Export types
export interface ExportOptions {
  format: 'pdf' | 'excel' | 'csv';
  template?: string;
  filters?: FilterParams;
  includeCharts?: boolean;
  includeRawData?: boolean;
}

export interface ExportJob {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  fileUrl?: string;
  error?: string;
  createdAt: string;
  completedAt?: string;
}
