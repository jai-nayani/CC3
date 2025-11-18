import fs from 'fs';
import path from 'path';
import { AnalyticsData, ReportRequest } from '../types';
import { analyticsService } from './analytics.service';

const REPORTS_DIR = process.env.REPORTS_OUTPUT_DIR || './reports';

export class PDFService {
  constructor() {
    // Ensure reports directory exists
    if (!fs.existsSync(REPORTS_DIR)) {
      fs.mkdirSync(REPORTS_DIR, { recursive: true });
    }
  }

  async generatePDF(request: ReportRequest, jobId: string): Promise<string> {
    // Fetch data from analytics service
    const data = await analyticsService.fetchAnalyticsData(
      request.startDate,
      request.endDate,
      request.filters
    );

    // Generate HTML content
    const html = this.generateHTML(data, request);

    // Save as HTML file (simplified PDF generation without puppeteer)
    const fileName = `report-${jobId}.html`;
    const filePath = path.join(REPORTS_DIR, fileName);

    fs.writeFileSync(filePath, html, 'utf-8');

    return fileName;
  }

  private generateHTML(data: AnalyticsData, request: ReportRequest): string {
    const currentDate = new Date().toLocaleDateString();
    const dateRange = request.startDate && request.endDate
      ? `${request.startDate} to ${request.endDate}`
      : 'All Time';

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Financial Analytics Report</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      background: #fff;
      padding: 40px;
    }
    .header {
      text-align: center;
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 3px solid #2563eb;
    }
    .header h1 {
      color: #1e40af;
      font-size: 32px;
      margin-bottom: 10px;
    }
    .header .subtitle {
      color: #64748b;
      font-size: 16px;
    }
    .meta-info {
      display: flex;
      justify-content: space-between;
      margin-bottom: 30px;
      padding: 15px;
      background: #f1f5f9;
      border-radius: 8px;
    }
    .meta-info div {
      flex: 1;
    }
    .meta-info strong {
      color: #475569;
    }
    .section {
      margin-bottom: 40px;
    }
    .section h2 {
      color: #1e40af;
      font-size: 24px;
      margin-bottom: 20px;
      padding-bottom: 10px;
      border-bottom: 2px solid #e2e8f0;
    }
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
      margin-bottom: 30px;
    }
    .metric-card {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 25px;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .metric-card.revenue {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    }
    .metric-card.claims {
      background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
    }
    .metric-card.average {
      background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
    }
    .metric-card.margin {
      background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
    }
    .metric-card h3 {
      font-size: 14px;
      font-weight: 500;
      margin-bottom: 10px;
      opacity: 0.9;
    }
    .metric-card .value {
      font-size: 32px;
      font-weight: 700;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 15px;
      background: white;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
    th {
      background: #1e40af;
      color: white;
      padding: 12px;
      text-align: left;
      font-weight: 600;
    }
    td {
      padding: 12px;
      border-bottom: 1px solid #e2e8f0;
    }
    tr:nth-child(even) {
      background: #f8fafc;
    }
    tr:hover {
      background: #f1f5f9;
    }
    .status-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
    }
    .status-approved {
      background: #dcfce7;
      color: #166534;
    }
    .status-pending {
      background: #fef3c7;
      color: #92400e;
    }
    .status-rejected {
      background: #fee2e2;
      color: #991b1b;
    }
    .trends {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
      margin-top: 20px;
    }
    .trend-card {
      padding: 20px;
      background: #f8fafc;
      border-left: 4px solid #2563eb;
      border-radius: 4px;
    }
    .trend-card h4 {
      color: #475569;
      margin-bottom: 8px;
    }
    .trend-value {
      font-size: 24px;
      font-weight: 700;
      color: #16a34a;
    }
    .trend-value.negative {
      color: #dc2626;
    }
    .footer {
      margin-top: 50px;
      padding-top: 20px;
      border-top: 2px solid #e2e8f0;
      text-align: center;
      color: #64748b;
      font-size: 14px;
    }
    @media print {
      body {
        padding: 20px;
      }
      .metric-card {
        break-inside: avoid;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Financial Analytics Report</h1>
    <p class="subtitle">Comprehensive Financial Performance Analysis</p>
  </div>

  <div class="meta-info">
    <div><strong>Report Date:</strong> ${currentDate}</div>
    <div><strong>Period:</strong> ${dateRange}</div>
    <div><strong>Generated By:</strong> Reporting Service v1.0</div>
  </div>

  <div class="section">
    <h2>Executive Summary</h2>
    <div class="metrics-grid">
      <div class="metric-card revenue">
        <h3>Total Revenue</h3>
        <div class="value">$${data.summary.totalRevenue.toLocaleString()}</div>
      </div>
      <div class="metric-card claims">
        <h3>Total Claims</h3>
        <div class="value">${data.summary.totalClaims.toLocaleString()}</div>
      </div>
      <div class="metric-card average">
        <h3>Average Claim Value</h3>
        <div class="value">$${data.summary.averageClaimValue.toLocaleString()}</div>
      </div>
      <div class="metric-card margin">
        <h3>Profit Margin</h3>
        <div class="value">${data.summary.profitMargin}%</div>
      </div>
    </div>
  </div>

  <div class="section">
    <h2>Revenue Analysis</h2>
    <table>
      <thead>
        <tr>
          <th>Date</th>
          <th>Category</th>
          <th>Amount</th>
        </tr>
      </thead>
      <tbody>
        ${data.revenue.map(r => `
        <tr>
          <td>${new Date(r.date).toLocaleDateString()}</td>
          <td>${r.category}</td>
          <td>$${r.amount.toLocaleString()}</td>
        </tr>
        `).join('')}
      </tbody>
    </table>
  </div>

  <div class="section">
    <h2>Claims Overview</h2>
    <table>
      <thead>
        <tr>
          <th>Claim ID</th>
          <th>Date</th>
          <th>Type</th>
          <th>Amount</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        ${data.claims.map(c => `
        <tr>
          <td>${c.claimId}</td>
          <td>${new Date(c.date).toLocaleDateString()}</td>
          <td>${c.type}</td>
          <td>$${c.amount.toLocaleString()}</td>
          <td><span class="status-badge status-${c.status.toLowerCase()}">${c.status}</span></td>
        </tr>
        `).join('')}
      </tbody>
    </table>
  </div>

  <div class="section">
    <h2>Growth Trends</h2>
    <div class="trends">
      <div class="trend-card">
        <h4>Revenue Growth</h4>
        <div class="trend-value ${data.trends.revenueGrowth < 0 ? 'negative' : ''}">
          ${data.trends.revenueGrowth > 0 ? '+' : ''}${data.trends.revenueGrowth}%
        </div>
      </div>
      <div class="trend-card">
        <h4>Claims Growth</h4>
        <div class="trend-value ${data.trends.claimsGrowth < 0 ? 'negative' : ''}">
          ${data.trends.claimsGrowth > 0 ? '+' : ''}${data.trends.claimsGrowth}%
        </div>
      </div>
    </div>
  </div>

  <div class="footer">
    <p>This report is generated automatically by the Financial Analytics Reporting Service.</p>
    <p>For questions or concerns, please contact support.</p>
  </div>
</body>
</html>
    `.trim();
  }
}

export const pdfService = new PDFService();
