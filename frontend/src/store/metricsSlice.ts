import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface KPIData {
  totalRevenue: number;
  revenueTrend: number;
  claimsProcessed: number;
  claimsTrend: number;
  averageReimbursement: number;
  reimbursementTrend: number;
  denialRate: number;
  denialTrend: number;
  collectionRate: number;
  collectionTrend: number;
  daysInAR: number;
  arTrend: number;
}

export interface RevenueDataPoint {
  date: string;
  revenue: number;
  claims: number;
}

interface MetricsState {
  kpis: KPIData | null;
  revenueData: RevenueDataPoint[];
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
}

const initialState: MetricsState = {
  kpis: null,
  revenueData: [],
  loading: false,
  error: null,
  lastUpdated: null,
};

const metricsSlice = createSlice({
  name: 'metrics',
  initialState,
  reducers: {
    fetchMetricsStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchMetricsSuccess: (state, action: PayloadAction<{ kpis: KPIData; revenueData: RevenueDataPoint[] }>) => {
      state.loading = false;
      state.kpis = action.payload.kpis;
      state.revenueData = action.payload.revenueData;
      state.lastUpdated = new Date().toISOString();
      state.error = null;
    },
    fetchMetricsFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    clearMetrics: (state) => {
      state.kpis = null;
      state.revenueData = [];
      state.error = null;
      state.lastUpdated = null;
    },
  },
});

export const {
  fetchMetricsStart,
  fetchMetricsSuccess,
  fetchMetricsFailure,
  clearMetrics,
} = metricsSlice.actions;

export default metricsSlice.reducer;
