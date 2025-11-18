import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { ReportRequest, Template } from '../types';
import { pdfService } from '../services/pdf.service';
import { excelService } from '../services/excel.service';
import { csvService } from '../services/csv.service';
import { jobService } from '../services/job.service';
import { AppError } from '../middleware/error.middleware';

const REPORTS_DIR = process.env.REPORTS_OUTPUT_DIR || './reports';

export class ReportController {
  async generatePDF(req: Request, res: Response): Promise<void> {
    const reportRequest: ReportRequest = req.body;

    // Create job
    const job = jobService.createJob('pdf');

    // Send immediate response with job ID
    res.status(202).json({
      jobId: job.id,
      status: job.status,
      message: 'PDF generation started',
    });

    // Generate PDF asynchronously
    try {
      jobService.updateProgress(job.id, 10);

      const fileName = await pdfService.generatePDF(reportRequest, job.id);

      jobService.updateProgress(job.id, 90);

      const fileUrl = `/api/reports/download/${job.id}`;
      jobService.completeJob(job.id, fileUrl, fileName);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'PDF generation failed';
      jobService.failJob(job.id, errorMessage);
      console.error('PDF generation error:', error);
    }
  }

  async generateExcel(req: Request, res: Response): Promise<void> {
    const reportRequest: ReportRequest = req.body;

    // Create job
    const job = jobService.createJob('excel');

    // Send immediate response with job ID
    res.status(202).json({
      jobId: job.id,
      status: job.status,
      message: 'Excel generation started',
    });

    // Generate Excel asynchronously
    try {
      jobService.updateProgress(job.id, 10);

      const fileName = await excelService.generateExcel(reportRequest, job.id);

      jobService.updateProgress(job.id, 90);

      const fileUrl = `/api/reports/download/${job.id}`;
      jobService.completeJob(job.id, fileUrl, fileName);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Excel generation failed';
      jobService.failJob(job.id, errorMessage);
      console.error('Excel generation error:', error);
    }
  }

  async generateCSV(req: Request, res: Response): Promise<void> {
    const reportRequest: ReportRequest = req.body;

    // Create job
    const job = jobService.createJob('csv');

    // Send immediate response with job ID
    res.status(202).json({
      jobId: job.id,
      status: job.status,
      message: 'CSV generation started',
    });

    // Generate CSV asynchronously
    try {
      jobService.updateProgress(job.id, 10);

      const fileName = await csvService.generateCSV(reportRequest, job.id);

      jobService.updateProgress(job.id, 90);

      const fileUrl = `/api/reports/download/${job.id}`;
      jobService.completeJob(job.id, fileUrl, fileName);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'CSV generation failed';
      jobService.failJob(job.id, errorMessage);
      console.error('CSV generation error:', error);
    }
  }

  async getJobStatus(req: Request, res: Response): Promise<void> {
    const { jobId } = req.params;

    const job = jobService.getJob(jobId);

    if (!job) {
      throw new AppError('Job not found', 404);
    }

    res.json({
      jobId: job.id,
      status: job.status,
      progress: job.progress,
      type: job.type,
      fileUrl: job.fileUrl,
      fileName: job.fileName,
      createdAt: job.createdAt,
      completedAt: job.completedAt,
      error: job.error,
    });
  }

  async downloadFile(req: Request, res: Response): Promise<void> {
    const { jobId } = req.params;

    const job = jobService.getJob(jobId);

    if (!job) {
      throw new AppError('Job not found', 404);
    }

    if (job.status !== 'completed') {
      throw new AppError('Report not ready yet', 400);
    }

    if (!job.fileName) {
      throw new AppError('File not available', 404);
    }

    const filePath = path.join(REPORTS_DIR, job.fileName);

    if (!fs.existsSync(filePath)) {
      throw new AppError('File not found', 404);
    }

    // Determine content type based on file extension
    const ext = path.extname(job.fileName).toLowerCase();
    let contentType = 'application/octet-stream';

    switch (ext) {
      case '.html':
        contentType = 'text/html';
        break;
      case '.xlsx':
        contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        break;
      case '.csv':
        contentType = 'text/csv';
        break;
    }

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${job.fileName}"`);

    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  }

  async getTemplates(req: Request, res: Response): Promise<void> {
    const templates: Template[] = [
      {
        id: 'summary-pdf',
        name: 'Summary Report (PDF)',
        description: 'Comprehensive financial summary with all metrics',
        type: 'pdf',
        fields: ['totalRevenue', 'totalClaims', 'averageClaimValue', 'profitMargin', 'trends'],
      },
      {
        id: 'summary-excel',
        name: 'Summary Report (Excel)',
        description: 'Multi-sheet Excel workbook with summary, revenue, and claims data',
        type: 'excel',
        fields: ['summary', 'revenue', 'claims'],
      },
      {
        id: 'summary-csv',
        name: 'Summary Report (CSV)',
        description: 'CSV export of summary metrics and trends',
        type: 'csv',
        fields: ['summary', 'trends'],
      },
      {
        id: 'revenue-csv',
        name: 'Revenue Report (CSV)',
        description: 'Detailed revenue data in CSV format',
        type: 'csv',
        fields: ['date', 'category', 'amount'],
      },
      {
        id: 'claims-csv',
        name: 'Claims Report (CSV)',
        description: 'Detailed claims data with statistics in CSV format',
        type: 'csv',
        fields: ['claimId', 'date', 'type', 'amount', 'status'],
      },
    ];

    res.json({
      templates,
      count: templates.length,
    });
  }

  async getJobStats(req: Request, res: Response): Promise<void> {
    const stats = jobService.getJobStats();
    res.json(stats);
  }

  async getAllJobs(req: Request, res: Response): Promise<void> {
    const jobs = jobService.getAllJobs();
    res.json({
      jobs,
      count: jobs.length,
    });
  }
}

export const reportController = new ReportController();
