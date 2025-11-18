import React from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  TooltipProps,
} from 'recharts';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { formatCurrency, formatNumber } from '../utils/formatters';

interface ChartProps {
  title: string;
  data: any[];
  type?: 'line' | 'bar' | 'area';
  dataKeys: {
    key: string;
    name: string;
    color?: string;
  }[];
  xAxisKey: string;
  height?: number;
  formatValue?: 'currency' | 'number';
}

const CustomTooltip: React.FC<TooltipProps<any, any> & { formatValue?: 'currency' | 'number' }> = ({
  active,
  payload,
  label,
  formatValue = 'number',
}) => {
  if (active && payload && payload.length) {
    return (
      <Box
        sx={{
          bgcolor: 'background.paper',
          p: 2,
          border: 1,
          borderColor: 'divider',
          borderRadius: 1,
          boxShadow: 2,
        }}
      >
        <Typography variant="body2" fontWeight={600} gutterBottom>
          {label}
        </Typography>
        {payload.map((entry: any, index: number) => (
          <Typography
            key={`item-${index}`}
            variant="body2"
            sx={{ color: entry.color }}
          >
            {entry.name}:{' '}
            {formatValue === 'currency'
              ? formatCurrency(entry.value)
              : formatNumber(entry.value)}
          </Typography>
        ))}
      </Box>
    );
  }
  return null;
};

const Chart: React.FC<ChartProps> = ({
  title,
  data,
  type = 'line',
  dataKeys,
  xAxisKey,
  height = 300,
  formatValue = 'number',
}) => {
  const renderChart = () => {
    const commonProps = {
      data,
      margin: { top: 5, right: 30, left: 20, bottom: 5 },
    };

    const xAxis = <XAxis dataKey={xAxisKey} />;
    const yAxis = (
      <YAxis
        tickFormatter={(value) =>
          formatValue === 'currency'
            ? formatCurrency(value)
            : formatNumber(value)
        }
      />
    );
    const cartesianGrid = <CartesianGrid strokeDasharray="3 3" />;
    const tooltip = <Tooltip content={<CustomTooltip formatValue={formatValue} />} />;
    const legend = <Legend />;

    switch (type) {
      case 'bar':
        return (
          <BarChart {...commonProps}>
            {cartesianGrid}
            {xAxis}
            {yAxis}
            {tooltip}
            {legend}
            {dataKeys.map((dk) => (
              <Bar
                key={dk.key}
                dataKey={dk.key}
                name={dk.name}
                fill={dk.color || '#1976d2'}
              />
            ))}
          </BarChart>
        );

      case 'area':
        return (
          <AreaChart {...commonProps}>
            {cartesianGrid}
            {xAxis}
            {yAxis}
            {tooltip}
            {legend}
            {dataKeys.map((dk) => (
              <Area
                key={dk.key}
                type="monotone"
                dataKey={dk.key}
                name={dk.name}
                stroke={dk.color || '#1976d2'}
                fill={dk.color || '#1976d2'}
                fillOpacity={0.6}
              />
            ))}
          </AreaChart>
        );

      case 'line':
      default:
        return (
          <LineChart {...commonProps}>
            {cartesianGrid}
            {xAxis}
            {yAxis}
            {tooltip}
            {legend}
            {dataKeys.map((dk) => (
              <Line
                key={dk.key}
                type="monotone"
                dataKey={dk.key}
                name={dk.name}
                stroke={dk.color || '#1976d2'}
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            ))}
          </LineChart>
        );
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        <ResponsiveContainer width="100%" height={height}>
          {renderChart()}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default Chart;
