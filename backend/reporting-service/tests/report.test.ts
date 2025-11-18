import { jobService } from '../src/services/job.service';

describe('JobService', () => {
  beforeEach(() => {
    // Clear all jobs before each test
    jobService.getAllJobs().forEach(job => {
      jobService.deleteJob(job.id);
    });
  });

  describe('createJob', () => {
    it('should create a new job with pending status', () => {
      const job = jobService.createJob('pdf');

      expect(job).toBeDefined();
      expect(job.id).toBeDefined();
      expect(job.status).toBe('pending');
      expect(job.progress).toBe(0);
      expect(job.type).toBe('pdf');
      expect(job.createdAt).toBeInstanceOf(Date);
    });

    it('should create jobs with unique IDs', () => {
      const job1 = jobService.createJob('pdf');
      const job2 = jobService.createJob('excel');

      expect(job1.id).not.toBe(job2.id);
    });
  });

  describe('getJob', () => {
    it('should retrieve an existing job', () => {
      const createdJob = jobService.createJob('csv');
      const retrievedJob = jobService.getJob(createdJob.id);

      expect(retrievedJob).toBeDefined();
      expect(retrievedJob?.id).toBe(createdJob.id);
    });

    it('should return undefined for non-existent job', () => {
      const job = jobService.getJob('non-existent-id');
      expect(job).toBeUndefined();
    });
  });

  describe('updateProgress', () => {
    it('should update job progress', () => {
      const job = jobService.createJob('pdf');
      jobService.updateProgress(job.id, 50);

      const updatedJob = jobService.getJob(job.id);
      expect(updatedJob?.progress).toBe(50);
    });

    it('should clamp progress to 0-100 range', () => {
      const job = jobService.createJob('pdf');

      jobService.updateProgress(job.id, 150);
      expect(jobService.getJob(job.id)?.progress).toBe(100);

      jobService.updateProgress(job.id, -10);
      expect(jobService.getJob(job.id)?.progress).toBe(0);
    });
  });

  describe('completeJob', () => {
    it('should mark job as completed with file info', () => {
      const job = jobService.createJob('excel');
      const fileUrl = '/api/reports/download/test';
      const fileName = 'report.xlsx';

      jobService.completeJob(job.id, fileUrl, fileName);

      const completedJob = jobService.getJob(job.id);
      expect(completedJob?.status).toBe('completed');
      expect(completedJob?.progress).toBe(100);
      expect(completedJob?.fileUrl).toBe(fileUrl);
      expect(completedJob?.fileName).toBe(fileName);
      expect(completedJob?.completedAt).toBeInstanceOf(Date);
    });
  });

  describe('failJob', () => {
    it('should mark job as failed with error message', () => {
      const job = jobService.createJob('pdf');
      const errorMessage = 'Generation failed';

      jobService.failJob(job.id, errorMessage);

      const failedJob = jobService.getJob(job.id);
      expect(failedJob?.status).toBe('failed');
      expect(failedJob?.error).toBe(errorMessage);
      expect(failedJob?.completedAt).toBeInstanceOf(Date);
    });
  });

  describe('getJobStats', () => {
    it('should return correct job statistics', () => {
      jobService.createJob('pdf');
      const job2 = jobService.createJob('excel');
      const job3 = jobService.createJob('csv');

      jobService.completeJob(job2.id, '/url', 'file.xlsx');
      jobService.failJob(job3.id, 'error');

      const stats = jobService.getJobStats();

      expect(stats.total).toBe(3);
      expect(stats.pending).toBe(1);
      expect(stats.completed).toBe(1);
      expect(stats.failed).toBe(1);
    });
  });

  describe('deleteJob', () => {
    it('should delete a job', () => {
      const job = jobService.createJob('pdf');
      const deleted = jobService.deleteJob(job.id);

      expect(deleted).toBe(true);
      expect(jobService.getJob(job.id)).toBeUndefined();
    });

    it('should return false for non-existent job', () => {
      const deleted = jobService.deleteJob('non-existent-id');
      expect(deleted).toBe(false);
    });
  });
});
