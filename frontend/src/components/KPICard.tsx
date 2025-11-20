import React from 'react';
import { Card, CardContent, Typography, Box, Chip } from '@mui/material';
import { TrendingUp, TrendingDown } from '@mui/icons-material';
import { formatCurrency, formatPercentage, formatNumber, formatTrend } from '../utils/formatters';
import { KPICardSkeleton } from './LoadingSkeleton';

interface KPICardProps {
  title: string;
  value: number;
  trend?: number;
  format?: 'currency' | 'percentage' | 'number';
  icon?: React.ReactNode;
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info';
  loading?: boolean;
}

const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  trend,
  format = 'number',
  icon,
  color = 'primary',
  loading = false,
}) => {
  const formatValue = (val: number) => {
    switch (format) {
      case 'currency':
        return formatCurrency(val);
      case 'percentage':
        return formatPercentage(val);
      case 'number':
      default:
        return formatNumber(val);
    }
  };

  const trendData = trend !== undefined ? formatTrend(trend) : null;

  if (loading) {
    return <KPICardSkeleton />;
  }

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4,
        },
      }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {title}
          </Typography>
          {icon && (
            <Box
              sx={{
                bgcolor: `${color}.main`,
                color: 'white',
                borderRadius: 1,
                p: 0.75,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {icon}
            </Box>
          )}
        </Box>
        <Typography variant="h4" component="div" gutterBottom fontWeight={600}>
          {formatValue(value)}
        </Typography>
        {trendData && (
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
            <Chip
              icon={
                trendData.color === 'success' ? (
                  <TrendingUp fontSize="small" />
                ) : trendData.color === 'error' ? (
                  <TrendingDown fontSize="small" />
                ) : undefined
              }
              label={`${trendData.sign}${trendData.text}`}
              color={trendData.color === 'default' ? undefined : trendData.color}
              size="small"
              variant="outlined"
            />
            <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
              vs last period
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default KPICard;
