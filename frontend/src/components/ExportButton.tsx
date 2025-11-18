import React, { useState } from 'react';
import {
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
} from '@mui/material';
import {
  FileDownload as FileDownloadIcon,
  Description as DescriptionIcon,
  TableChart as TableChartIcon,
  PictureAsPdf as PictureAsPdfIcon,
} from '@mui/icons-material';
import { reportService, ExportFormat } from '../services/reportService';
import { useFilters } from '../hooks/useFilters';
import { format } from 'date-fns';

interface ExportButtonProps {
  reportType: 'kpis' | 'revenue' | 'claims' | 'denials';
  label?: string;
}

const ExportButton: React.FC<ExportButtonProps> = ({
  reportType,
  label = 'Export',
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [loading, setLoading] = useState(false);
  const { filters } = useFilters();

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleExport = async (format: ExportFormat['format']) => {
    setLoading(true);
    handleClose();

    try {
      const filterParams = {
        startDate: filters.startDate ? format(filters.startDate, 'yyyy-MM-dd') : undefined,
        endDate: filters.endDate ? format(filters.endDate, 'yyyy-MM-dd') : undefined,
        facilityId: filters.facilityId || undefined,
        department: filters.department || undefined,
      };

      let blob: Blob;
      const timestamp = format(new Date(), 'yyyyMMdd_HHmmss');

      switch (reportType) {
        case 'kpis':
          blob = await reportService.exportKPIs(filterParams, { format });
          reportService.downloadFile(blob, `kpis_${timestamp}.${format}`);
          break;
        case 'revenue':
          blob = await reportService.exportRevenue(filterParams, { format });
          reportService.downloadFile(blob, `revenue_${timestamp}.${format}`);
          break;
        case 'claims':
          blob = await reportService.exportClaims(filterParams, { format });
          reportService.downloadFile(blob, `claims_${timestamp}.${format}`);
          break;
        case 'denials':
          blob = await reportService.exportDenials(filterParams, { format });
          reportService.downloadFile(blob, `denials_${timestamp}.${format}`);
          break;
      }
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const exportOptions = [
    { format: 'xlsx' as const, label: 'Excel (.xlsx)', icon: <TableChartIcon fontSize="small" /> },
    { format: 'csv' as const, label: 'CSV (.csv)', icon: <DescriptionIcon fontSize="small" /> },
    { format: 'pdf' as const, label: 'PDF (.pdf)', icon: <PictureAsPdfIcon fontSize="small" /> },
  ];

  return (
    <>
      <Button
        variant="outlined"
        startIcon={loading ? <CircularProgress size={20} /> : <FileDownloadIcon />}
        onClick={handleClick}
        disabled={loading}
      >
        {label}
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        {exportOptions.map((option) => (
          <MenuItem key={option.format} onClick={() => handleExport(option.format)}>
            <ListItemIcon>{option.icon}</ListItemIcon>
            <ListItemText>{option.label}</ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default ExportButton;
