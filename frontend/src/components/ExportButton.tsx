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
import { showToast } from '../utils/toast';

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

  const handleExport = async (exportFormat: ExportFormat['format']) => {
    setLoading(true);
    handleClose();

    const exportPromise = (async () => {
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
          blob = await reportService.exportKPIs(filterParams, { format: exportFormat });
          reportService.downloadFile(blob, `kpis_${timestamp}.${exportFormat}`);
          break;
        case 'revenue':
          blob = await reportService.exportRevenue(filterParams, { format: exportFormat });
          reportService.downloadFile(blob, `revenue_${timestamp}.${exportFormat}`);
          break;
        case 'claims':
          blob = await reportService.exportClaims(filterParams, { format: exportFormat });
          reportService.downloadFile(blob, `claims_${timestamp}.${exportFormat}`);
          break;
        case 'denials':
          blob = await reportService.exportDenials(filterParams, { format: exportFormat });
          reportService.downloadFile(blob, `denials_${timestamp}.${exportFormat}`);
          break;
      }
    })();

    showToast.promise(
      exportPromise,
      {
        pending: `Exporting ${reportType} report...`,
        success: `${reportType.toUpperCase()} report exported successfully!`,
        error: 'Export failed. Please try again.',
      }
    ).finally(() => {
      setLoading(false);
    });
  };

  const exportOptions = [
    { format: 'xlsx' as const, label: 'Excel (.xlsx)', icon: <TableChartIcon fontSize="small" /> },
    { format: 'csv' as const, label: 'CSV (.csv)', icon: <DescriptionIcon fontSize="small" /> },
    { format: 'pdf' as const, label: 'PDF (.pdf)', icon: <PictureAsPdfIcon fontSize="small" /> },
    { format: 'json' as const, label: 'JSON (.json)', icon: <DescriptionIcon fontSize="small" /> },
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
