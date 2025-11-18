import { Parser } from 'json2csv';
import fs from 'fs';
import path from 'path';
import { AnalyticsData, ReportRequest } from '../types';
import { analyticsService } from './analytics.service';

const REPORTS_DIR = process.env.REPORTS_OUTPUT_DIR || './reports';

export class CSVService {
  constructor() {
    // Ensure reports directory exists
    if (!fs.existsSync(REPORTS_DIR)) {
      fs.mkdirSync(REPORTS_DIR, { recursive: true });
    }
  }

  async generateCSV(request: ReportRequest, jobId: string): Promise<string> {
    // Fetch data from analytics service
    const data = await analyticsService.fetchAnalyticsData(
      request.startDate,
      request.endDate,
      request.filters
    );

    // Determine which type of CSV to generate based on reportType
    const reportType = request.reportType || 'summary';

    let csvContent: string;
    let fileName: string;

    switch (reportType.toLowerCase()) {
      case 'revenue':
        csvContent = this.generateRevenueCSV(data);
        fileName = `revenue-report-${jobId}.csv`;
        break;
      case 'claims':
        csvContent = this.generateClaimsCSV(data);
        fileName = `claims-report-${jobId}.csv`;
        break;
      case 'summary':
      default:
        csvContent = this.generateSummaryCSV(data, request);
        fileName = `summary-report-${jobId}.csv`;
        break;
    }

    // Save file
    const filePath = path.join(REPORTS_DIR, fileName);
    fs.writeFileSync(filePath, csvContent, 'utf-8');

    return fileName;
  }

  private generateSummaryCSV(data: AnalyticsData, request: ReportRequest): string {
    const dateRange = request.startDate && request.endDate
      ? `${request.startDate} to ${request.endDate}`
      : 'All Time';

    const reportDate = new Date().toLocaleDateString();

    // Create summary data
    const summaryRows = [
      { Section: 'Report Information', Metric: 'Report Date', Value: reportDate },
      { Section: 'Report Information', Metric: 'Period', Value: dateRange },
      { Section: '', Metric: '', Value: '' },
      { Section: 'Financial Summary', Metric: 'Total Revenue', Value: `$${data.summary.totalRevenue.toLocaleString()}` },
      { Section: 'Financial Summary', Metric: 'Total Claims', Value: data.summary.totalClaims.toString() },
      { Section: 'Financial Summary', Metric: 'Average Claim Value', Value: `$${data.summary.averageClaimValue.toLocaleString()}` },
      { Section: 'Financial Summary', Metric: 'Profit Margin', Value: `${data.summary.profitMargin}%` },
      { Section: '', Metric: '', Value: '' },
      { Section: 'Growth Trends', Metric: 'Revenue Growth', Value: `${data.trends.revenueGrowth > 0 ? '+' : ''}${data.trends.revenueGrowth}%` },
      { Section: 'Growth Trends', Metric: 'Claims Growth', Value: `${data.trends.claimsGrowth > 0 ? '+' : ''}${data.trends.claimsGrowth}%` },
    ];

    const parser = new Parser({
      fields: ['Section', 'Metric', 'Value'],
    });

    return parser.parse(summaryRows);
  }

  private generateRevenueCSV(data: AnalyticsData): string {
    const revenueData = data.revenue.map(item => ({
      Date: new Date(item.date).toLocaleDateString(),
      Category: item.category,
      Amount: item.amount,
      'Formatted Amount': `$${item.amount.toLocaleString()}`,
    }));

    // Add total row
    const totalRevenue = data.revenue.reduce((sum, item) => sum + item.amount, 0);
    revenueData.push({
      Date: '',
      Category: 'TOTAL',
      Amount: totalRevenue,
      'Formatted Amount': `$${totalRevenue.toLocaleString()}`,
    });

    const parser = new Parser({
      fields: [
        { label: 'Date', value: 'Date' },
        { label: 'Category', value: 'Category' },
        { label: 'Amount', value: 'Amount' },
        { label: 'Formatted Amount', value: 'Formatted Amount' },
      ],
    });

    return parser.parse(revenueData);
  }

  private generateClaimsCSV(data: AnalyticsData): string {
    const claimsData = data.claims.map(claim => ({
      'Claim ID': claim.claimId,
      Date: new Date(claim.date).toLocaleDateString(),
      Type: claim.type,
      Amount: claim.amount,
      'Formatted Amount': `$${claim.amount.toLocaleString()}`,
      Status: claim.status,
    }));

    // Add statistics rows
    const totalAmount = data.claims.reduce((sum, claim) => sum + claim.amount, 0);
    const approvedClaims = data.claims.filter(c => c.status.toLowerCase() === 'approved').length;
    const pendingClaims = data.claims.filter(c => c.status.toLowerCase() === 'pending').length;
    const rejectedClaims = data.claims.filter(c => c.status.toLowerCase() === 'rejected').length;

    claimsData.push({
      'Claim ID': '',
      Date: '',
      Type: '',
      Amount: 0,
      'Formatted Amount': '',
      Status: '',
    });

    claimsData.push({
      'Claim ID': 'STATISTICS',
      Date: 'Total Amount',
      Type: '',
      Amount: totalAmount,
      'Formatted Amount': `$${totalAmount.toLocaleString()}`,
      Status: '',
    });

    claimsData.push({
      'Claim ID': 'STATISTICS',
      Date: 'Approved Claims',
      Type: '',
      Amount: approvedClaims,
      'Formatted Amount': approvedClaims.toString(),
      Status: '',
    });

    claimsData.push({
      'Claim ID': 'STATISTICS',
      Date: 'Pending Claims',
      Type: '',
      Amount: pendingClaims,
      'Formatted Amount': pendingClaims.toString(),
      Status: '',
    });

    claimsData.push({
      'Claim ID': 'STATISTICS',
      Date: 'Rejected Claims',
      Type: '',
      Amount: rejectedClaims,
      'Formatted Amount': rejectedClaims.toString(),
      Status: '',
    });

    const parser = new Parser({
      fields: [
        { label: 'Claim ID', value: 'Claim ID' },
        { label: 'Date', value: 'Date' },
        { label: 'Type', value: 'Type' },
        { label: 'Amount', value: 'Amount' },
        { label: 'Formatted Amount', value: 'Formatted Amount' },
        { label: 'Status', value: 'Status' },
      ],
    });

    return parser.parse(claimsData);
  }
}

export const csvService = new CSVService();
