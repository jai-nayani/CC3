import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Typography,
  Chip,
} from '@mui/material';
import {
  Assessment,
  BarChart,
  PieChart,
  TrendingUp,
  CompareArrows,
  EventNote,
} from '@mui/icons-material';

interface Report {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  category: string;
  color: string;
}

const Reports: React.FC = () => {
  const reports: Report[] = [
    {
      id: 'financial-summary',
      title: 'Financial Summary',
      description: 'Comprehensive overview of revenue, expenses, and profitability metrics',
      icon: <Assessment sx={{ fontSize: 40 }} />,
      category: 'Financial',
      color: '#1976d2',
    },
    {
      id: 'revenue-analysis',
      title: 'Revenue Analysis',
      description: 'Detailed breakdown of revenue by facility, payer, and service type',
      icon: <BarChart sx={{ fontSize: 40 }} />,
      category: 'Financial',
      color: '#2e7d32',
    },
    {
      id: 'payer-mix',
      title: 'Payer Mix Analysis',
      description: 'Distribution and performance metrics across different insurance payers',
      icon: <PieChart sx={{ fontSize: 40 }} />,
      category: 'Analytics',
      color: '#9c27b0',
    },
    {
      id: 'denial-trends',
      title: 'Denial Trends',
      description: 'Track denial rates, reasons, and recovery performance over time',
      icon: <TrendingUp sx={{ fontSize: 40 }} />,
      category: 'Operations',
      color: '#d32f2f',
    },
    {
      id: 'facility-comparison',
      title: 'Facility Comparison',
      description: 'Compare performance metrics across different healthcare facilities',
      icon: <CompareArrows sx={{ fontSize: 40 }} />,
      category: 'Analytics',
      color: '#ed6c02',
    },
    {
      id: 'aging-report',
      title: 'Accounts Receivable Aging',
      description: 'Monitor outstanding claims and collection timelines',
      icon: <EventNote sx={{ fontSize: 40 }} />,
      category: 'Financial',
      color: '#0288d1',
    },
  ];

  const handleReportClick = (reportId: string) => {
    console.log('Opening report:', reportId);
    alert(`This would open the ${reportId} report in Power BI or a detailed view`);
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" fontWeight={600} gutterBottom>
          Reports
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Access comprehensive analytics and business intelligence reports
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {reports.map((report) => (
          <Grid item xs={12} sm={6} md={4} key={report.id}>
            <Card
              sx={{
                height: '100%',
                transition: 'all 0.3s',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: 6,
                },
              }}
            >
              <CardActionArea
                onClick={() => handleReportClick(report.id)}
                sx={{ height: '100%', p: 2 }}
              >
                <CardContent>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 80,
                      height: 80,
                      borderRadius: 2,
                      bgcolor: `${report.color}20`,
                      color: report.color,
                      mb: 2,
                      mx: 'auto',
                    }}
                  >
                    {report.icon}
                  </Box>
                  <Typography
                    variant="h6"
                    component="h2"
                    gutterBottom
                    textAlign="center"
                    fontWeight={600}
                  >
                    {report.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    textAlign="center"
                    sx={{ mb: 2 }}
                  >
                    {report.description}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <Chip
                      label={report.category}
                      size="small"
                      sx={{
                        bgcolor: `${report.color}20`,
                        color: report.color,
                        fontWeight: 500,
                      }}
                    />
                  </Box>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box
        sx={{
          mt: 6,
          p: 3,
          bgcolor: 'primary.main',
          color: 'white',
          borderRadius: 2,
          textAlign: 'center',
        }}
      >
        <Typography variant="h6" gutterBottom>
          Need a Custom Report?
        </Typography>
        <Typography variant="body2">
          Contact your administrator to request custom analytics and reporting solutions tailored to your needs.
        </Typography>
      </Box>
    </Box>
  );
};

export default Reports;
