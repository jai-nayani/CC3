import { v4 as uuidv4 } from 'uuid';
import { ReportJob } from '../types';

class JobService {
  private jobs: Map<string, ReportJob> = new Map();
  private readonly MAX_AGE_MS = parseInt(process.env.MAX_REPORT_AGE_MS || '3600000'); // 1 hour default

  constructor() {
    // Clean up old jobs every 5 minutes
    setInterval(() => this.cleanupOldJobs(), 5 * 60 * 1000);
  }

  createJob(type: 'pdf' | 'excel' | 'csv'): ReportJob {
    const job: ReportJob = {
      id: uuidv4(),
      status: 'pending',
      progress: 0,
      createdAt: new Date(),
      type,
    };

    this.jobs.set(job.id, job);
    return job;
  }

  getJob(jobId: string): ReportJob | undefined {
    return this.jobs.get(jobId);
  }

  updateJob(jobId: string, updates: Partial<ReportJob>): ReportJob | undefined {
    const job = this.jobs.get(jobId);
    if (!job) return undefined;

    const updatedJob = { ...job, ...updates };
    this.jobs.set(jobId, updatedJob);
    return updatedJob;
  }

  updateProgress(jobId: string, progress: number): void {
    const job = this.jobs.get(jobId);
    if (job) {
      job.progress = Math.min(100, Math.max(0, progress));
      this.jobs.set(jobId, job);
    }
  }

  completeJob(jobId: string, fileUrl: string, fileName: string): void {
    const job = this.jobs.get(jobId);
    if (job) {
      job.status = 'completed';
      job.progress = 100;
      job.fileUrl = fileUrl;
      job.fileName = fileName;
      job.completedAt = new Date();
      this.jobs.set(jobId, job);
    }
  }

  failJob(jobId: string, error: string): void {
    const job = this.jobs.get(jobId);
    if (job) {
      job.status = 'failed';
      job.error = error;
      job.completedAt = new Date();
      this.jobs.set(jobId, job);
    }
  }

  getAllJobs(): ReportJob[] {
    return Array.from(this.jobs.values());
  }

  deleteJob(jobId: string): boolean {
    return this.jobs.delete(jobId);
  }

  private cleanupOldJobs(): void {
    const now = Date.now();
    const jobsToDelete: string[] = [];

    this.jobs.forEach((job, jobId) => {
      const age = now - job.createdAt.getTime();
      if (age > this.MAX_AGE_MS) {
        jobsToDelete.push(jobId);
      }
    });

    jobsToDelete.forEach(jobId => {
      console.log(`Cleaning up old job: ${jobId}`);
      this.jobs.delete(jobId);
    });

    if (jobsToDelete.length > 0) {
      console.log(`Cleaned up ${jobsToDelete.length} old jobs`);
    }
  }

  getJobStats(): { total: number; pending: number; processing: number; completed: number; failed: number } {
    const stats = {
      total: this.jobs.size,
      pending: 0,
      processing: 0,
      completed: 0,
      failed: 0,
    };

    this.jobs.forEach(job => {
      stats[job.status]++;
    });

    return stats;
  }
}

export const jobService = new JobService();
