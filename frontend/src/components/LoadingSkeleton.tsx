import React from 'react';
import { Card, CardContent, Box, Skeleton, Grid } from '@mui/material';

// KPI Card Skeleton
export const KPICardSkeleton: React.FC = () => {
  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Skeleton variant="text" width="60%" height={24} />
          <Skeleton variant="rectangular" width={40} height={40} sx={{ borderRadius: 1 }} />
        </Box>
        <Skeleton variant="text" width="80%" height={48} sx={{ mb: 1 }} />
        <Skeleton variant="rectangular" width="40%" height={28} sx={{ borderRadius: 2 }} />
      </CardContent>
    </Card>
  );
};

// Chart Skeleton
export const ChartSkeleton: React.FC = () => {
  return (
    <Card>
      <CardContent>
        <Skeleton variant="text" width="30%" height={32} sx={{ mb: 2 }} />
        <Skeleton variant="rectangular" width="100%" height={300} sx={{ borderRadius: 2 }} />
      </CardContent>
    </Card>
  );
};

// Table Row Skeleton
export const TableRowSkeleton: React.FC<{ columns: number }> = ({ columns }) => {
  return (
    <>
      {[...Array(5)].map((_, rowIndex) => (
        <tr key={rowIndex}>
          {[...Array(columns)].map((_, colIndex) => (
            <td key={colIndex} style={{ padding: '16px' }}>
              <Skeleton variant="text" width="90%" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
};

// Dashboard Grid Skeleton
export const DashboardSkeleton: React.FC = () => {
  return (
    <Box>
      <Skeleton variant="text" width="30%" height={48} sx={{ mb: 3 }} />
      <Grid container spacing={3}>
        {[...Array(6)].map((_, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <KPICardSkeleton />
          </Grid>
        ))}
      </Grid>
      <Box sx={{ mt: 4 }}>
        <Grid container spacing={3}>
          {[...Array(2)].map((_, index) => (
            <Grid item xs={12} md={6} key={index}>
              <ChartSkeleton />
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
};

// Page Loading Skeleton
export const PageLoadingSkeleton: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Skeleton variant="text" width="40%" height={40} sx={{ mb: 3 }} />
      <Grid container spacing={3}>
        {[...Array(3)].map((_, index) => (
          <Grid item xs={12} key={index}>
            <Card>
              <CardContent>
                <Skeleton variant="text" width="30%" height={32} sx={{ mb: 2 }} />
                <Skeleton variant="rectangular" width="100%" height={200} sx={{ borderRadius: 2 }} />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

