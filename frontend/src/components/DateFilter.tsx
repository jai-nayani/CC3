import React from 'react';
import { Box, Button, ButtonGroup } from '@mui/material';
import { subDays, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { useFilters } from '../hooks/useFilters';

const DateFilter: React.FC = () => {
  const { updateDateRange } = useFilters();

  const presets = [
    {
      label: 'Last 7 Days',
      getValue: () => ({
        startDate: subDays(new Date(), 7),
        endDate: new Date(),
      }),
    },
    {
      label: 'Last 30 Days',
      getValue: () => ({
        startDate: subDays(new Date(), 30),
        endDate: new Date(),
      }),
    },
    {
      label: 'Last 90 Days',
      getValue: () => ({
        startDate: subDays(new Date(), 90),
        endDate: new Date(),
      }),
    },
    {
      label: 'This Month',
      getValue: () => ({
        startDate: startOfMonth(new Date()),
        endDate: endOfMonth(new Date()),
      }),
    },
    {
      label: 'Last Month',
      getValue: () => {
        const lastMonth = subMonths(new Date(), 1);
        return {
          startDate: startOfMonth(lastMonth),
          endDate: endOfMonth(lastMonth),
        };
      },
    },
  ];

  const handlePresetClick = (preset: typeof presets[0]) => {
    const { startDate, endDate } = preset.getValue();
    updateDateRange(startDate, endDate);
  };

  return (
    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
      <ButtonGroup variant="outlined" size="small">
        {presets.map((preset) => (
          <Button
            key={preset.label}
            onClick={() => handlePresetClick(preset)}
            sx={{ textTransform: 'none' }}
          >
            {preset.label}
          </Button>
        ))}
      </ButtonGroup>
    </Box>
  );
};

export default DateFilter;
