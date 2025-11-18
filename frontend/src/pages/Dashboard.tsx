import React from 'react';
import {
  Box,
  Grid,
  Typography,
  CircularProgress,
  Alert,
  Paper,
} from '@mui/material';
import {
  AttachMoney,
  Assignment,
  TrendingUp,
  Cancel,
  AccountBalance,
  AccessTime,
} from '@mui/icons-material';
import KPICard from '../components/KPICard';
import Chart from '../components/Chart';
import DateFilter from '../components/DateFilter';
import ExportButton from '../components/ExportButton';
import { useMetrics } from '../hooks/useMetrics';
import { formatDate } from '../utils/formatters';

const Dashboard: React.FC = () => {
  const { kpis, revenueData, loading, error } = useMetrics(true);

  if (loading && !kpis) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" component="h1" fontWeight={600}>
          Dashboard Overview
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <DateFilter />
          <ExportButton reportType="kpis" label="Export KPIs" />
        </Box>
      </Box>

      {kpis && (
        <>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={4}>
              <KPICard
                title="Total Revenue"
                value={kpis.totalRevenue}
                trend={kpis.revenueTrend}
                format="currency"
                icon={<AttachMoney />}
                color="primary"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <KPICard
                title="Claims Processed"
                value={kpis.claimsProcessed}
                trend={kpis.claimsTrend}
                format="number"
                icon={<Assignment />}
                color="info"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <KPICard
                title="Avg Reimbursement"
                value={kpis.averageReimbursement}
                trend={kpis.reimbursementTrend}
                format="currency"
                icon={<TrendingUp />}
                color="success"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <KPICard
                title="Denial Rate"
                value={kpis.denialRate}
                trend={kpis.denialTrend}
                format="percentage"
                icon={<Cancel />}
                color="error"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <KPICard
                title="Collection Rate"
                value={kpis.collectionRate}
                trend={kpis.collectionTrend}
                format="percentage"
                icon={<AccountBalance />}
                color="success"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <KPICard
                title="Days in A/R"
                value={kpis.daysInAR}
                trend={kpis.arTrend}
                format="number"
                icon={<AccessTime />}
                color="warning"
              />
            </Grid>
          </Grid>

          {revenueData && revenueData.length > 0 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Chart
                  title="Revenue Trend"
                  data={revenueData.map((item) => ({
                    ...item,
                    date: formatDate(item.date),
                  }))}
                  type="area"
                  dataKeys={[
                    { key: 'revenue', name: 'Revenue', color: '#1976d2' },
                  ]}
                  xAxisKey="date"
                  height={400}
                  formatValue="currency"
                />
              </Grid>
              <Grid item xs={12}>
                <Chart
                  title="Claims Volume"
                  data={revenueData.map((item) => ({
                    ...item,
                    date: formatDate(item.date),
                  }))}
                  type="bar"
                  dataKeys={[
                    { key: 'claims', name: 'Claims', color: '#2e7d32' },
                  ]}
                  xAxisKey="date"
                  height={350}
                  formatValue="number"
                />
              </Grid>
            </Grid>
          )}

          {(!revenueData || revenueData.length === 0) && (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="body1" color="text.secondary">
                No revenue data available for the selected period
              </Typography>
            </Paper>
          )}
        </>
      )}
    </Box>
  );
};

export default Dashboard;
