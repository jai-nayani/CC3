import { Router } from 'express';
import { reportController } from '../controllers/report.controller';
import { asyncHandler } from '../middleware/error.middleware';

const router = Router();

// Generate reports
router.post('/pdf', asyncHandler((req, res) => reportController.generatePDF(req, res)));
router.post('/excel', asyncHandler((req, res) => reportController.generateExcel(req, res)));
router.post('/csv', asyncHandler((req, res) => reportController.generateCSV(req, res)));

// Job management
router.get('/status/:jobId', asyncHandler((req, res) => reportController.getJobStatus(req, res)));
router.get('/download/:jobId', asyncHandler((req, res) => reportController.downloadFile(req, res)));

// Templates and utilities
router.get('/templates', asyncHandler((req, res) => reportController.getTemplates(req, res)));
router.get('/jobs', asyncHandler((req, res) => reportController.getAllJobs(req, res)));
router.get('/stats', asyncHandler((req, res) => reportController.getJobStats(req, res)));

export default router;
