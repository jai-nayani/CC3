import { Request, Response } from 'express';
import { kpiService } from '../services/kpi.service';
import { ApiResponse, FilterParams, KPIResponse, prismaClient } from '@financial-analytics/shared';
import { AppError } from '../middleware/error.middleware';

/**
 * Analytics Controller
 * Handles all analytics and KPI-related requests
 */
export class AnalyticsController {
  /**
   * GET /kpis - Get all KPIs with optional filters
   */
  async getAllKPIs(req: Request, res: Response): Promise<void> {
    const filters = this.parseFilters(req.query);

    const kpis = await kpiService.calculateAllKPIs(filters);

    const dateRange = this.getDateRange(filters);

    const response: ApiResponse<KPIResponse> = {
      success: true,
      data: {
        kpis,
        dateRange: {
          start: dateRange.startDate.toISOString(),
          end: dateRange.endDate.toISOString(),
        },
        lastUpdated: new Date().toISOString(),
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string,
      },
    };

    res.json(response);
  }

  /**
   * GET /kpis/:name - Get specific KPI by name
   */
  async getKPIByName(req: Request, res: Response): Promise<void> {
    const { name } = req.params;
    const filters = this.parseFilters(req.query);

    // Convert name to camelCase key (e.g., "gross-revenue" -> "grossRevenue")
    const key = name.replace(/-([a-z])/g, (g) => g[1].toUpperCase());

    try {
      const kpi = await kpiService.getKPIByKey(key, filters);

      const response: ApiResponse = {
        success: true,
        data: kpi,
        meta: {
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] as string,
        },
      };

      res.json(response);
    } catch (error) {
      throw new AppError(404, 'KPI_NOT_FOUND', `KPI '${name}' not found`);
    }
  }

  /**
   * GET /revenue - Get revenue-specific metrics
   */
  async getRevenueMetrics(req: Request, res: Response): Promise<void> {
    const filters = this.parseFilters(req.query);

    const [grossRevenue, netRevenue, revenueGrowth, revenueByFacility, revenuePerPatient] =
      await Promise.all([
        kpiService.calculateGrossRevenue(filters),
        kpiService.calculateNetRevenue(filters),
        kpiService.calculateRevenueGrowth(filters),
        kpiService.calculateRevenueByFacility(filters),
        kpiService.calculateRevenuePerPatient(filters),
      ]);

    const response: ApiResponse = {
      success: true,
      data: {
        summary: {
          grossRevenue,
          netRevenue,
          revenueGrowth,
          revenueByFacility,
          revenuePerPatient,
        },
        dateRange: this.getDateRange(filters),
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string,
      },
    };

    res.json(response);
  }

  /**
   * GET /collections - Get A/R and collection metrics
   */
  async getCollectionsMetrics(req: Request, res: Response): Promise<void> {
    const filters = this.parseFilters(req.query);

    const [collectionRate, daysInAR, arAging, outstandingBalance, cashCollections] =
      await Promise.all([
        kpiService.calculateCollectionRate(filters),
        kpiService.calculateDaysInAR(filters),
        kpiService.calculateARAging(filters),
        kpiService.calculateOutstandingBalance(filters),
        kpiService.calculateCashCollections(filters),
      ]);

    const response: ApiResponse = {
      success: true,
      data: {
        summary: {
          collectionRate,
          daysInAR,
          arAging,
          outstandingBalance,
          cashCollections,
        },
        dateRange: this.getDateRange(filters),
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string,
      },
    };

    res.json(response);
  }

  /**
   * GET /claims - Get claims-specific metrics
   */
  async getClaimsMetrics(req: Request, res: Response): Promise<void> {
    const filters = this.parseFilters(req.query);

    const [cleanClaimRate, denialRate, claimVolume, denialRecoveryRate] = await Promise.all([
      kpiService.calculateCleanClaimRate(filters),
      kpiService.calculateDenialRate(filters),
      kpiService.calculateClaimVolume(filters),
      kpiService.calculateDenialRecoveryRate(filters),
    ]);

    const response: ApiResponse = {
      success: true,
      data: {
        summary: {
          cleanClaimRate,
          denialRate,
          claimVolume,
          denialRecoveryRate,
        },
        dateRange: this.getDateRange(filters),
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string,
      },
    };

    res.json(response);
  }

  /**
   * GET /trends - Get trend analysis across all metrics
   */
  async getTrendAnalysis(req: Request, res: Response): Promise<void> {
    const filters = this.parseFilters(req.query);
    const { metric = 'netRevenue', periods = 7 } = req.query;

    // Get historical data for the specified metric over multiple periods
    const dateRange = this.getDateRange(filters);
    const periodLength = Math.floor(
      (dateRange.endDate.getTime() - dateRange.startDate.getTime()) /
        (Number(periods) * 24 * 60 * 60 * 1000)
    );

    const trends = [];

    for (let i = 0; i < Number(periods); i++) {
      const periodEnd = new Date(dateRange.endDate.getTime() - i * periodLength);
      const periodStart = new Date(periodEnd.getTime() - periodLength);

      const periodFilters = {
        ...filters,
        startDate: periodStart.toISOString(),
        endDate: periodEnd.toISOString(),
      };

      const kpi = await kpiService.getKPIByKey(metric as string, periodFilters);

      trends.unshift({
        period: periodStart.toISOString().split('T')[0],
        value: kpi.value,
        percentChange: kpi.percentChange,
      });
    }

    const response: ApiResponse = {
      success: true,
      data: {
        metric,
        periods: Number(periods),
        trends,
        summary: {
          average: trends.reduce((sum, t) => sum + t.value, 0) / trends.length,
          min: Math.min(...trends.map((t) => t.value)),
          max: Math.max(...trends.map((t) => t.value)),
          trend:
            trends[trends.length - 1].value > trends[0].value
              ? 'up'
              : trends[trends.length - 1].value < trends[0].value
              ? 'down'
              : 'stable',
        },
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string,
      },
    };

    res.json(response);
  }

  /**
   * GET /compare - Compare metrics across different dimensions
   */
  async getComparativeAnalysis(req: Request, res: Response): Promise<void> {
    const filters = this.parseFilters(req.query);
    const { dimension = 'facility', metric = 'netRevenue' } = req.query;

    const dateRange = this.getDateRange(filters);
    const where = this.buildWhereClause(filters, dateRange);

    let comparisons: any[] = [];

    if (dimension === 'facility') {
      // Compare by facility
      const facilities = await prismaClient.facility.findMany({
        where: { isActive: true },
        select: { id: true, name: true },
      });

      comparisons = await Promise.all(
        facilities.map(async (facility) => {
          const facilityFilters = { ...filters, facilityId: facility.id };
          const kpi = await kpiService.getKPIByKey(metric as string, facilityFilters);

          return {
            id: facility.id,
            name: facility.name,
            value: kpi.value,
            unit: kpi.unit,
            trend: kpi.trend,
            percentChange: kpi.percentChange,
          };
        })
      );
    } else if (dimension === 'payer') {
      // Compare by payer
      const payers = await prismaClient.payer.findMany({
        select: { id: true, name: true, type: true },
        take: 10,
      });

      comparisons = await Promise.all(
        payers.map(async (payer) => {
          const payerFilters = { ...filters, payerId: payer.id };
          const kpi = await kpiService.getKPIByKey(metric as string, payerFilters);

          return {
            id: payer.id,
            name: payer.name,
            type: payer.type,
            value: kpi.value,
            unit: kpi.unit,
            trend: kpi.trend,
            percentChange: kpi.percentChange,
          };
        })
      );
    } else if (dimension === 'department') {
      // Compare by department
      const departments = await prismaClient.department.findMany({
        where: filters.facilityId ? { facilityId: filters.facilityId } : undefined,
        select: { id: true, name: true, specialty: true },
        take: 10,
      });

      comparisons = await Promise.all(
        departments.map(async (department) => {
          const deptFilters = { ...filters, departmentId: department.id };
          const kpi = await kpiService.getKPIByKey(metric as string, deptFilters);

          return {
            id: department.id,
            name: department.name,
            specialty: department.specialty,
            value: kpi.value,
            unit: kpi.unit,
            trend: kpi.trend,
            percentChange: kpi.percentChange,
          };
        })
      );
    }

    // Sort by value descending
    comparisons.sort((a, b) => b.value - a.value);

    const response: ApiResponse = {
      success: true,
      data: {
        dimension,
        metric,
        comparisons,
        summary: {
          total: comparisons.length,
          totalValue: comparisons.reduce((sum, c) => sum + c.value, 0),
          average: comparisons.reduce((sum, c) => sum + c.value, 0) / comparisons.length,
          top: comparisons[0],
          bottom: comparisons[comparisons.length - 1],
        },
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string,
      },
    };

    res.json(response);
  }

  /**
   * Parse filter parameters from request query
   */
  private parseFilters(query: any): FilterParams {
    const filters: FilterParams = {};

    if (query.startDate) filters.startDate = query.startDate;
    if (query.endDate) filters.endDate = query.endDate;
    if (query.facilityId) filters.facilityId = query.facilityId;
    if (query.departmentId) filters.departmentId = query.departmentId;
    if (query.payerId) filters.payerId = query.payerId;
    if (query.status) filters.status = query.status;

    // Pagination
    if (query.page) filters.page = parseInt(query.page, 10);
    if (query.limit) filters.limit = parseInt(query.limit, 10);
    if (query.sort) filters.sort = query.sort;
    if (query.order) filters.order = query.order as 'asc' | 'desc';

    return filters;
  }

  /**
   * Get date range from filters or use defaults
   */
  private getDateRange(filters: FilterParams) {
    const endDate = filters.endDate ? new Date(filters.endDate) : new Date();
    const startDate = filters.startDate
      ? new Date(filters.startDate)
      : new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);

    return { startDate, endDate };
  }

  /**
   * Build Prisma where clause from filters
   */
  private buildWhereClause(filters: FilterParams, dateRange: { startDate: Date; endDate: Date }) {
    const where: any = {
      serviceDate: {
        gte: dateRange.startDate,
        lte: dateRange.endDate,
      },
    };

    if (filters.facilityId) where.facilityId = filters.facilityId;
    if (filters.departmentId) where.departmentId = filters.departmentId;
    if (filters.payerId) where.payerId = filters.payerId;
    if (filters.status) where.status = filters.status;

    return where;
  }
}

// Export singleton instance
export const analyticsController = new AnalyticsController();
