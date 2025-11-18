import React, { useState } from 'react';
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  Tabs,
  Tab,
  Paper,
} from '@mui/material';
import Chart from '../components/Chart';
import DateFilter from '../components/DateFilter';
import ExportButton from '../components/ExportButton';
import { useMetrics } from '../hooks/useMetrics';
import { formatDate } from '../utils/formatters';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`analytics-tabpanel-${index}`}
      aria-labelledby={`analytics-tab-${index}`}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
};

const Analytics: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const { revenueData } = useMetrics(true);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Mock data for additional analytics
  const payerData = [
    { name: 'Medicare', revenue: 450000, claims: 320 },
    { name: 'Medicaid', revenue: 280000, claims: 245 },
    { name: 'Blue Cross', revenue: 520000, claims: 180 },
    { name: 'Aetna', revenue: 380000, claims: 165 },
    { name: 'United Health', revenue: 420000, claims: 195 },
  ];

  const denialData = [
    { month: 'Jan', rate: 8.2 },
    { month: 'Feb', rate: 7.5 },
    { month: 'Mar', rate: 6.8 },
    { month: 'Apr', rate: 7.2 },
    { month: 'May', rate: 6.5 },
    { month: 'Jun', rate: 5.9 },
  ];

  const facilityData = [
    { facility: 'Main Hospital', revenue: 1200000, claims: 850 },
    { facility: 'East Clinic', revenue: 650000, claims: 420 },
    { facility: 'West Clinic', revenue: 580000, claims: 380 },
    { facility: 'North Center', revenue: 720000, claims: 495 },
  ];

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" component="h1" fontWeight={600}>
          Advanced Analytics
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <DateFilter />
          <ExportButton reportType="revenue" label="Export Data" />
        </Box>
      </Box>

      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="analytics tabs"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Revenue Trends" />
          <Tab label="Payer Analysis" />
          <Tab label="Denial Rates" />
          <Tab label="Facility Performance" />
        </Tabs>
      </Paper>

      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Chart
              title="Revenue Over Time"
              data={revenueData.map((item) => ({
                ...item,
                date: formatDate(item.date),
              }))}
              type="line"
              dataKeys={[
                { key: 'revenue', name: 'Revenue', color: '#1976d2' },
              ]}
              xAxisKey="date"
              height={400}
              formatValue="currency"
            />
          </Grid>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Key Insights
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  • Revenue showing steady growth trend over the selected period
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  • Peak performance observed in recent months
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • Collections remain consistent with historical averages
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Chart
              title="Revenue by Payer"
              data={payerData}
              type="bar"
              dataKeys={[
                { key: 'revenue', name: 'Revenue', color: '#2e7d32' },
              ]}
              xAxisKey="name"
              height={350}
              formatValue="currency"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Chart
              title="Claims Volume by Payer"
              data={payerData}
              type="bar"
              dataKeys={[
                { key: 'claims', name: 'Claims', color: '#1976d2' },
              ]}
              xAxisKey="name"
              height={350}
              formatValue="number"
            />
          </Grid>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Payer Analysis Summary
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Blue Cross generates highest revenue, while Medicare has the highest claim volume.
                  Consider optimizing processes for top-performing payers.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Chart
              title="Denial Rate Trend"
              data={denialData}
              type="line"
              dataKeys={[
                { key: 'rate', name: 'Denial Rate (%)', color: '#d32f2f' },
              ]}
              xAxisKey="month"
              height={400}
              formatValue="number"
            />
          </Grid>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Denial Rate Insights
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  • Denial rates showing positive downward trend
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  • Current rate of 5.9% is below industry average
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • Continue monitoring and implementing best practices
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={3}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Chart
              title="Revenue by Facility"
              data={facilityData}
              type="bar"
              dataKeys={[
                { key: 'revenue', name: 'Revenue', color: '#9c27b0' },
              ]}
              xAxisKey="facility"
              height={350}
              formatValue="currency"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Chart
              title="Claims by Facility"
              data={facilityData}
              type="bar"
              dataKeys={[
                { key: 'claims', name: 'Claims', color: '#ed6c02' },
              ]}
              xAxisKey="facility"
              height={350}
              formatValue="number"
            />
          </Grid>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Facility Performance Summary
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Main Hospital leads in both revenue and claims volume. Clinics showing consistent
                  performance with opportunities for growth in service offerings.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>
    </Box>
  );
};

export default Analytics;
