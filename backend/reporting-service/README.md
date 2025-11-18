# Reporting Service

Financial Analytics Reporting Service for generating PDF, Excel, and CSV reports.

## Features

- **PDF Reports**: Generate professional HTML-based PDF reports with comprehensive analytics
- **Excel Reports**: Create multi-sheet Excel workbooks with formatted data (Summary, Revenue, Claims)
- **CSV Reports**: Export data in CSV format for various report types
- **Asynchronous Processing**: Jobs run asynchronously with status tracking
- **Job Management**: Track job progress, status, and download completed reports
- **Data Integration**: Fetches data from Analytics Service (port 4002)

## Installation

```bash
npm install
```

## Configuration

Create a `.env` file based on `.env.example`:

```env
PORT=4004
NODE_ENV=development
ANALYTICS_SERVICE_URL=http://localhost:4002
REPORTS_OUTPUT_DIR=./reports
MAX_REPORT_AGE_MS=3600000
```

## Running the Service

### Development
```bash
npm run dev
```

### Production
```bash
npm run build
npm start
```

## API Endpoints

### Report Generation

#### Generate PDF Report
```http
POST /api/reports/pdf
Content-Type: application/json

{
  "reportType": "summary",
  "startDate": "2025-01-01",
  "endDate": "2025-01-31",
  "filters": {},
  "includeCharts": true
}
```

#### Generate Excel Report
```http
POST /api/reports/excel
Content-Type: application/json

{
  "reportType": "summary",
  "startDate": "2025-01-01",
  "endDate": "2025-01-31"
}
```

#### Generate CSV Report
```http
POST /api/reports/csv
Content-Type: application/json

{
  "reportType": "revenue",
  "startDate": "2025-01-01",
  "endDate": "2025-01-31"
}
```

### Job Management

#### Check Job Status
```http
GET /api/reports/status/:jobId
```

#### Download Report
```http
GET /api/reports/download/:jobId
```

#### Get Available Templates
```http
GET /api/reports/templates
```

#### Get All Jobs
```http
GET /api/reports/jobs
```

#### Get Job Statistics
```http
GET /api/reports/stats
```

### Health Check
```http
GET /health
```

### Service Info
```http
GET /info
```

## Report Types

### PDF Reports
- Comprehensive financial summary
- Professional HTML styling
- Includes all metrics, trends, and data tables
- File format: `.html` (viewable as PDF in browsers)

### Excel Reports
Multi-sheet workbook with:
- **Summary Sheet**: Key metrics and trends with color-coded cells
- **Revenue Sheet**: Detailed revenue analysis with totals
- **Claims Sheet**: Claims data with status color-coding

### CSV Reports
Available types:
- `summary`: Summary metrics and trends
- `revenue`: Detailed revenue data
- `claims`: Detailed claims data with statistics

## Job Lifecycle

1. **Pending**: Job created, waiting to start
2. **Processing**: Report generation in progress
3. **Completed**: Report ready for download
4. **Failed**: Error occurred during generation

Jobs are automatically cleaned up after 1 hour (configurable via `MAX_REPORT_AGE_MS`).

## Integration with Analytics Service

The Reporting Service fetches data from the Analytics Service:
- Summary metrics: `GET /analytics/summary`
- Revenue data: `GET /analytics/revenue`
- Claims data: `GET /analytics/claims`
- Trends data: `GET /analytics/trends`

If the Analytics Service is unavailable, mock data is used for demonstration.

## Architecture

```
src/
├── main.ts                    # Express server setup
├── types/                     # TypeScript type definitions
├── routes/
│   └── report.routes.ts       # API routes
├── controllers/
│   └── report.controller.ts   # Request handlers
├── services/
│   ├── pdf.service.ts         # PDF generation
│   ├── excel.service.ts       # Excel generation
│   ├── csv.service.ts         # CSV generation
│   ├── job.service.ts         # Job tracking
│   └── analytics.service.ts   # Data fetching
└── middleware/
    └── error.middleware.ts    # Error handling
```

## Dependencies

- **express**: Web framework
- **cors**: Cross-origin resource sharing
- **helmet**: Security headers
- **dotenv**: Environment configuration
- **exceljs**: Excel file generation
- **json2csv**: CSV file generation
- **puppeteer**: PDF generation (dependency only, not used in HTML generation)
- **axios**: HTTP client for API calls
- **uuid**: Unique ID generation

## Development

### Build
```bash
npm run build
```

### Lint
```bash
npm run lint
```

### Test
```bash
npm test
```

## Production Considerations

1. **File Storage**: Reports are stored in-memory and cleaned up automatically. For production, consider using cloud storage (S3, Azure Blob, etc.)
2. **Job Persistence**: Current implementation uses in-memory job tracking. For production, use Redis or a database
3. **Rate Limiting**: Add rate limiting to prevent abuse
4. **Authentication**: Add authentication/authorization middleware
5. **File Size Limits**: Configure appropriate limits based on your needs
6. **Monitoring**: Add application monitoring and logging
7. **Scalability**: Consider using a message queue for job processing

## License

ISC
