import ExcelJS from 'exceljs';
import fs from 'fs';
import path from 'path';
import { AnalyticsData, ReportRequest } from '../types';
import { analyticsService } from './analytics.service';

const REPORTS_DIR = process.env.REPORTS_OUTPUT_DIR || './reports';

export class ExcelService {
  constructor() {
    // Ensure reports directory exists
    if (!fs.existsSync(REPORTS_DIR)) {
      fs.mkdirSync(REPORTS_DIR, { recursive: true });
    }
  }

  async generateExcel(request: ReportRequest, jobId: string): Promise<string> {
    // Fetch data from analytics service
    const data = await analyticsService.fetchAnalyticsData(
      request.startDate,
      request.endDate,
      request.filters
    );

    // Create workbook
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Financial Analytics Reporting Service';
    workbook.created = new Date();
    workbook.modified = new Date();

    // Add worksheets
    this.addSummarySheet(workbook, data, request);
    this.addRevenueSheet(workbook, data);
    this.addClaimsSheet(workbook, data);

    // Save file
    const fileName = `report-${jobId}.xlsx`;
    const filePath = path.join(REPORTS_DIR, fileName);

    await workbook.xlsx.writeFile(filePath);

    return fileName;
  }

  private addSummarySheet(
    workbook: ExcelJS.Workbook,
    data: AnalyticsData,
    request: ReportRequest
  ): void {
    const sheet = workbook.addWorksheet('Summary', {
      properties: { tabColor: { argb: 'FF2563EB' } },
    });

    // Set column widths
    sheet.columns = [
      { width: 30 },
      { width: 20 },
    ];

    // Title
    sheet.mergeCells('A1:B1');
    const titleCell = sheet.getCell('A1');
    titleCell.value = 'Financial Analytics Report - Summary';
    titleCell.font = { size: 16, bold: true, color: { argb: 'FF1E40AF' } };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    sheet.getRow(1).height = 30;

    // Report metadata
    sheet.addRow([]);
    sheet.addRow(['Report Date:', new Date().toLocaleDateString()]);
    sheet.addRow([
      'Period:',
      request.startDate && request.endDate
        ? `${request.startDate} to ${request.endDate}`
        : 'All Time',
    ]);
    sheet.addRow([]);

    // Summary metrics header
    const metricsHeaderRow = sheet.addRow(['Key Metrics', '']);
    metricsHeaderRow.font = { bold: true, size: 14, color: { argb: 'FF1E40AF' } };
    metricsHeaderRow.height = 25;
    sheet.addRow([]);

    // Summary data
    const summaryData = [
      ['Total Revenue', `$${data.summary.totalRevenue.toLocaleString()}`],
      ['Total Claims', data.summary.totalClaims.toLocaleString()],
      ['Average Claim Value', `$${data.summary.averageClaimValue.toLocaleString()}`],
      ['Profit Margin', `${data.summary.profitMargin}%`],
    ];

    summaryData.forEach(([label, value]) => {
      const row = sheet.addRow([label, value]);
      row.getCell(1).font = { bold: true };
      row.getCell(2).font = { size: 12 };

      // Color code based on metric
      if (label.includes('Revenue')) {
        row.getCell(2).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFDCFCE7' },
        };
        row.getCell(2).font = { ...row.getCell(2).font, color: { argb: 'FF166534' } };
      }
    });

    sheet.addRow([]);
    sheet.addRow([]);

    // Trends header
    const trendsHeaderRow = sheet.addRow(['Growth Trends', '']);
    trendsHeaderRow.font = { bold: true, size: 14, color: { argb: 'FF1E40AF' } };
    trendsHeaderRow.height = 25;
    sheet.addRow([]);

    // Trends data
    const trendsData = [
      ['Revenue Growth', `${data.trends.revenueGrowth > 0 ? '+' : ''}${data.trends.revenueGrowth}%`],
      ['Claims Growth', `${data.trends.claimsGrowth > 0 ? '+' : ''}${data.trends.claimsGrowth}%`],
    ];

    trendsData.forEach(([label, value]) => {
      const row = sheet.addRow([label, value]);
      row.getCell(1).font = { bold: true };
      row.getCell(2).font = { size: 12 };

      const isPositive = !value.includes('-');
      row.getCell(2).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: isPositive ? 'FFDCFCE7' : 'FFFEE2E2' },
      };
      row.getCell(2).font = {
        ...row.getCell(2).font,
        color: { argb: isPositive ? 'FF166534' : 'FF991B1B' },
      };
    });
  }

  private addRevenueSheet(workbook: ExcelJS.Workbook, data: AnalyticsData): void {
    const sheet = workbook.addWorksheet('Revenue', {
      properties: { tabColor: { argb: 'FF10B981' } },
    });

    // Set column widths
    sheet.columns = [
      { width: 15 },
      { width: 20 },
      { width: 20 },
    ];

    // Title
    sheet.mergeCells('A1:C1');
    const titleCell = sheet.getCell('A1');
    titleCell.value = 'Revenue Analysis';
    titleCell.font = { size: 14, bold: true, color: { argb: 'FF1E40AF' } };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    sheet.getRow(1).height = 25;

    sheet.addRow([]);

    // Headers
    const headerRow = sheet.addRow(['Date', 'Category', 'Amount']);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.eachCell(cell => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF1E40AF' },
      };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
    });
    headerRow.height = 20;

    // Data rows
    let totalRevenue = 0;
    data.revenue.forEach(item => {
      const row = sheet.addRow([
        new Date(item.date).toLocaleDateString(),
        item.category,
        item.amount,
      ]);

      // Format amount as currency
      row.getCell(3).numFmt = '$#,##0.00';
      totalRevenue += item.amount;

      // Alternating row colors
      if (sheet.rowCount % 2 === 0) {
        row.eachCell(cell => {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF8FAFC' },
          };
        });
      }
    });

    // Total row
    sheet.addRow([]);
    const totalRow = sheet.addRow(['', 'Total', totalRevenue]);
    totalRow.font = { bold: true, size: 12 };
    totalRow.getCell(3).numFmt = '$#,##0.00';
    totalRow.getCell(2).alignment = { horizontal: 'right' };
    totalRow.eachCell(cell => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE2E8F0' },
      };
    });
  }

  private addClaimsSheet(workbook: ExcelJS.Workbook, data: AnalyticsData): void {
    const sheet = workbook.addWorksheet('Claims', {
      properties: { tabColor: { argb: 'FFEF4444' } },
    });

    // Set column widths
    sheet.columns = [
      { width: 15 },
      { width: 15 },
      { width: 15 },
      { width: 15 },
      { width: 15 },
    ];

    // Title
    sheet.mergeCells('A1:E1');
    const titleCell = sheet.getCell('A1');
    titleCell.value = 'Claims Overview';
    titleCell.font = { size: 14, bold: true, color: { argb: 'FF1E40AF' } };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    sheet.getRow(1).height = 25;

    sheet.addRow([]);

    // Headers
    const headerRow = sheet.addRow(['Claim ID', 'Date', 'Type', 'Amount', 'Status']);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.eachCell(cell => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF1E40AF' },
      };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
    });
    headerRow.height = 20;

    // Data rows
    let totalClaims = 0;
    data.claims.forEach(claim => {
      const row = sheet.addRow([
        claim.claimId,
        new Date(claim.date).toLocaleDateString(),
        claim.type,
        claim.amount,
        claim.status,
      ]);

      // Format amount as currency
      row.getCell(4).numFmt = '$#,##0.00';
      totalClaims += claim.amount;

      // Status color coding
      const statusCell = row.getCell(5);
      statusCell.font = { bold: true };

      switch (claim.status.toLowerCase()) {
        case 'approved':
          statusCell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFDCFCE7' },
          };
          statusCell.font = { ...statusCell.font, color: { argb: 'FF166534' } };
          break;
        case 'pending':
          statusCell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFEF3C7' },
          };
          statusCell.font = { ...statusCell.font, color: { argb: 'FF92400E' } };
          break;
        case 'rejected':
          statusCell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFEE2E2' },
          };
          statusCell.font = { ...statusCell.font, color: { argb: 'FF991B1B' } };
          break;
      }

      // Alternating row colors for other cells
      if (sheet.rowCount % 2 === 0) {
        [1, 2, 3, 4].forEach(colNum => {
          row.getCell(colNum).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF8FAFC' },
          };
        });
      }
    });

    // Total row
    sheet.addRow([]);
    const totalRow = sheet.addRow(['', '', '', totalClaims, '']);
    totalRow.font = { bold: true, size: 12 };
    totalRow.getCell(4).numFmt = '$#,##0.00';
    totalRow.getCell(3).value = 'Total';
    totalRow.getCell(3).alignment = { horizontal: 'right' };
    [3, 4].forEach(colNum => {
      totalRow.getCell(colNum).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE2E8F0' },
      };
    });
  }
}

export const excelService = new ExcelService();
