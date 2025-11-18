import { prismaClient, KPI, FilterParams } from '@financial-analytics/shared';
import { cacheService } from './cache.service';

/**
 * KPI Service - Calculates all 17 KPIs for the Financial Analytics Dashboard
 */
class KPIService {
  /**
   * Calculate all 17 KPIs based on filter parameters
   */
  async calculateAllKPIs(filters: FilterParams = {}): Promise<KPI[]> {
    const cacheKey = cacheService.generateKey('all-kpis', filters);

    return cacheService.getOrSet(cacheKey, async () => {
      const kpis = await Promise.all([
        // Revenue Metrics (5 KPIs)
        this.calculateGrossRevenue(filters),
        this.calculateNetRevenue(filters),
        this.calculateRevenueGrowth(filters),
        this.calculateRevenueByFacility(filters),
        this.calculateRevenuePerPatient(filters),

        // Collection & A/R Metrics (5 KPIs)
        this.calculateCollectionRate(filters),
        this.calculateDaysInAR(filters),
        this.calculateARAging(filters),
        this.calculateOutstandingBalance(filters),
        this.calculateCashCollections(filters),

        // Claims Metrics (4 KPIs)
        this.calculateCleanClaimRate(filters),
        this.calculateDenialRate(filters),
        this.calculateClaimVolume(filters),
        this.calculateDenialRecoveryRate(filters),

        // Operational Metrics (3 KPIs)
        this.calculatePatientVolume(filters),
        this.calculatePayerMix(filters),
        this.calculateRevenueCycleDays(filters),
      ]);

      return kpis;
    });
  }

  /**
   * Get date range for filters
   */
  private getDateRange(filters: FilterParams) {
    const endDate = filters.endDate ? new Date(filters.endDate) : new Date();
    const startDate = filters.startDate
      ? new Date(filters.startDate)
      : new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000); // Default: last 30 days

    return { startDate, endDate };
  }

  /**
   * Build common where clause from filters
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

  /**
   * Calculate sparkline data (last 7 data points)
   */
  private async calculateSparkline(
    metric: string,
    filters: FilterParams
  ): Promise<number[]> {
    const { endDate } = this.getDateRange(filters);
    const sparklineData: number[] = [];

    // Get last 7 days/periods
    for (let i = 6; i >= 0; i--) {
      const periodEnd = new Date(endDate.getTime() - i * 24 * 60 * 60 * 1000);
      const periodStart = new Date(periodEnd.getTime() - 24 * 60 * 60 * 1000);

      const where = this.buildWhereClause(filters, {
        startDate: periodStart,
        endDate: periodEnd,
      });

      let value = 0;

      switch (metric) {
        case 'grossRevenue':
          const grossResult = await prismaClient.claim.aggregate({
            where,
            _sum: { grossAmount: true },
          });
          value = grossResult._sum.grossAmount || 0;
          break;

        case 'netRevenue':
          const netResult = await prismaClient.claim.aggregate({
            where,
            _sum: { netAmount: true },
          });
          value = netResult._sum.netAmount || 0;
          break;

        case 'claimVolume':
          value = await prismaClient.claim.count({ where });
          break;

        case 'collectionRate':
          const collections = await prismaClient.claim.aggregate({
            where: { ...where, paymentAmount: { gt: 0 } },
            _sum: { paymentAmount: true, netAmount: true },
          });
          value =
            collections._sum.netAmount
              ? (collections._sum.paymentAmount! / collections._sum.netAmount) * 100
              : 0;
          break;
      }

      sparklineData.push(value);
    }

    return sparklineData;
  }

  /**
   * 1. Gross Revenue - Total charges before adjustments
   */
  async calculateGrossRevenue(filters: FilterParams = {}): Promise<KPI> {
    const dateRange = this.getDateRange(filters);
    const where = this.buildWhereClause(filters, dateRange);

    const [current, previous, sparkline] = await Promise.all([
      prismaClient.claim.aggregate({
        where,
        _sum: { grossAmount: true },
      }),
      prismaClient.claim.aggregate({
        where: this.buildWhereClause(filters, {
          startDate: new Date(dateRange.startDate.getTime() - 30 * 24 * 60 * 60 * 1000),
          endDate: new Date(dateRange.endDate.getTime() - 30 * 24 * 60 * 60 * 1000),
        }),
        _sum: { grossAmount: true },
      }),
      this.calculateSparkline('grossRevenue', filters),
    ]);

    const value = current._sum.grossAmount || 0;
    const previousValue = previous._sum.grossAmount || 0;
    const percentChange = previousValue ? ((value - previousValue) / previousValue) * 100 : 0;

    return {
      name: 'Gross Revenue',
      key: 'grossRevenue',
      value,
      unit: 'currency',
      trend: percentChange > 0 ? 'up' : percentChange < 0 ? 'down' : 'stable',
      percentChange,
      sparkline,
      previousValue,
    };
  }

  /**
   * 2. Net Revenue - Revenue after contractual adjustments
   */
  async calculateNetRevenue(filters: FilterParams = {}): Promise<KPI> {
    const dateRange = this.getDateRange(filters);
    const where = this.buildWhereClause(filters, dateRange);

    const [current, previous, sparkline] = await Promise.all([
      prismaClient.claim.aggregate({
        where,
        _sum: { netAmount: true },
      }),
      prismaClient.claim.aggregate({
        where: this.buildWhereClause(filters, {
          startDate: new Date(dateRange.startDate.getTime() - 30 * 24 * 60 * 60 * 1000),
          endDate: new Date(dateRange.endDate.getTime() - 30 * 24 * 60 * 60 * 1000),
        }),
        _sum: { netAmount: true },
      }),
      this.calculateSparkline('netRevenue', filters),
    ]);

    const value = current._sum.netAmount || 0;
    const previousValue = previous._sum.netAmount || 0;
    const percentChange = previousValue ? ((value - previousValue) / previousValue) * 100 : 0;

    return {
      name: 'Net Revenue',
      key: 'netRevenue',
      value,
      unit: 'currency',
      trend: percentChange > 0 ? 'up' : percentChange < 0 ? 'down' : 'stable',
      percentChange,
      sparkline,
      previousValue,
    };
  }

  /**
   * 3. Revenue Growth - Period-over-period revenue growth rate
   */
  async calculateRevenueGrowth(filters: FilterParams = {}): Promise<KPI> {
    const dateRange = this.getDateRange(filters);
    const where = this.buildWhereClause(filters, dateRange);

    const [current, previous] = await Promise.all([
      prismaClient.claim.aggregate({
        where,
        _sum: { netAmount: true },
      }),
      prismaClient.claim.aggregate({
        where: this.buildWhereClause(filters, {
          startDate: new Date(dateRange.startDate.getTime() - 30 * 24 * 60 * 60 * 1000),
          endDate: new Date(dateRange.endDate.getTime() - 30 * 24 * 60 * 60 * 1000),
        }),
        _sum: { netAmount: true },
      }),
    ]);

    const currentRevenue = current._sum.netAmount || 0;
    const previousRevenue = previous._sum.netAmount || 0;
    const value = previousRevenue ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 0;

    // Calculate growth trend over last 7 periods
    const sparkline: number[] = [];
    for (let i = 6; i >= 0; i--) {
      const periodEnd = new Date(dateRange.endDate.getTime() - i * 24 * 60 * 60 * 1000);
      const periodStart = new Date(periodEnd.getTime() - 24 * 60 * 60 * 1000);
      const prevPeriodEnd = new Date(periodEnd.getTime() - 24 * 60 * 60 * 1000);
      const prevPeriodStart = new Date(prevPeriodEnd.getTime() - 24 * 60 * 60 * 1000);

      const [curr, prev] = await Promise.all([
        prismaClient.claim.aggregate({
          where: this.buildWhereClause(filters, { startDate: periodStart, endDate: periodEnd }),
          _sum: { netAmount: true },
        }),
        prismaClient.claim.aggregate({
          where: this.buildWhereClause(filters, { startDate: prevPeriodStart, endDate: prevPeriodEnd }),
          _sum: { netAmount: true },
        }),
      ]);

      const growth = prev._sum.netAmount
        ? ((curr._sum.netAmount! - prev._sum.netAmount) / prev._sum.netAmount) * 100
        : 0;
      sparkline.push(growth);
    }

    return {
      name: 'Revenue Growth',
      key: 'revenueGrowth',
      value,
      unit: 'percentage',
      trend: value > 0 ? 'up' : value < 0 ? 'down' : 'stable',
      percentChange: value,
      sparkline,
      previousValue: 0, // Growth rate doesn't have a previous value
    };
  }

  /**
   * 4. Revenue by Facility - Average revenue per facility
   */
  async calculateRevenueByFacility(filters: FilterParams = {}): Promise<KPI> {
    const dateRange = this.getDateRange(filters);
    const where = this.buildWhereClause(filters, dateRange);

    const facilityRevenue = await prismaClient.claim.groupBy({
      by: ['facilityId'],
      where,
      _sum: { netAmount: true },
    });

    const totalRevenue = facilityRevenue.reduce((sum, f) => sum + (f._sum.netAmount || 0), 0);
    const value = facilityRevenue.length > 0 ? totalRevenue / facilityRevenue.length : 0;

    // Get previous period data
    const previousWhere = this.buildWhereClause(filters, {
      startDate: new Date(dateRange.startDate.getTime() - 30 * 24 * 60 * 60 * 1000),
      endDate: new Date(dateRange.endDate.getTime() - 30 * 24 * 60 * 60 * 1000),
    });

    const previousFacilityRevenue = await prismaClient.claim.groupBy({
      by: ['facilityId'],
      where: previousWhere,
      _sum: { netAmount: true },
    });

    const previousTotal = previousFacilityRevenue.reduce((sum, f) => sum + (f._sum.netAmount || 0), 0);
    const previousValue = previousFacilityRevenue.length > 0 ? previousTotal / previousFacilityRevenue.length : 0;
    const percentChange = previousValue ? ((value - previousValue) / previousValue) * 100 : 0;

    return {
      name: 'Revenue by Facility',
      key: 'revenueByFacility',
      value,
      unit: 'currency',
      trend: percentChange > 0 ? 'up' : percentChange < 0 ? 'down' : 'stable',
      percentChange,
      sparkline: [value, value, value, value, value, value, value], // Simplified
      previousValue,
    };
  }

  /**
   * 5. Revenue per Patient - Average revenue per unique patient
   */
  async calculateRevenuePerPatient(filters: FilterParams = {}): Promise<KPI> {
    const dateRange = this.getDateRange(filters);
    const where = this.buildWhereClause(filters, dateRange);

    const [revenue, patients] = await Promise.all([
      prismaClient.claim.aggregate({
        where,
        _sum: { netAmount: true },
      }),
      prismaClient.claim.findMany({
        where,
        select: { patientId: true },
        distinct: ['patientId'],
      }),
    ]);

    const totalRevenue = revenue._sum.netAmount || 0;
    const patientCount = patients.length;
    const value = patientCount > 0 ? totalRevenue / patientCount : 0;

    // Previous period
    const previousWhere = this.buildWhereClause(filters, {
      startDate: new Date(dateRange.startDate.getTime() - 30 * 24 * 60 * 60 * 1000),
      endDate: new Date(dateRange.endDate.getTime() - 30 * 24 * 60 * 60 * 1000),
    });

    const [prevRevenue, prevPatients] = await Promise.all([
      prismaClient.claim.aggregate({
        where: previousWhere,
        _sum: { netAmount: true },
      }),
      prismaClient.claim.findMany({
        where: previousWhere,
        select: { patientId: true },
        distinct: ['patientId'],
      }),
    ]);

    const previousValue =
      prevPatients.length > 0 ? (prevRevenue._sum.netAmount || 0) / prevPatients.length : 0;
    const percentChange = previousValue ? ((value - previousValue) / previousValue) * 100 : 0;

    return {
      name: 'Revenue per Patient',
      key: 'revenuePerPatient',
      value,
      unit: 'currency',
      trend: percentChange > 0 ? 'up' : percentChange < 0 ? 'down' : 'stable',
      percentChange,
      sparkline: [value, value, value, value, value, value, value], // Simplified
      previousValue,
    };
  }

  /**
   * 6. Collection Rate - Percentage of net revenue collected
   */
  async calculateCollectionRate(filters: FilterParams = {}): Promise<KPI> {
    const dateRange = this.getDateRange(filters);
    const where = this.buildWhereClause(filters, dateRange);

    const [current, previous, sparkline] = await Promise.all([
      prismaClient.claim.aggregate({
        where,
        _sum: { paymentAmount: true, netAmount: true },
      }),
      prismaClient.claim.aggregate({
        where: this.buildWhereClause(filters, {
          startDate: new Date(dateRange.startDate.getTime() - 30 * 24 * 60 * 60 * 1000),
          endDate: new Date(dateRange.endDate.getTime() - 30 * 24 * 60 * 60 * 1000),
        }),
        _sum: { paymentAmount: true, netAmount: true },
      }),
      this.calculateSparkline('collectionRate', filters),
    ]);

    const value = current._sum.netAmount
      ? ((current._sum.paymentAmount || 0) / current._sum.netAmount) * 100
      : 0;

    const previousValue = previous._sum.netAmount
      ? ((previous._sum.paymentAmount || 0) / previous._sum.netAmount) * 100
      : 0;

    const percentChange = previousValue ? ((value - previousValue) / previousValue) * 100 : 0;

    return {
      name: 'Collection Rate',
      key: 'collectionRate',
      value,
      unit: 'percentage',
      trend: percentChange > 0 ? 'up' : percentChange < 0 ? 'down' : 'stable',
      percentChange,
      sparkline,
      previousValue,
    };
  }

  /**
   * 7. Days in A/R - Average days for claims to be paid
   */
  async calculateDaysInAR(filters: FilterParams = {}): Promise<KPI> {
    const dateRange = this.getDateRange(filters);
    const where = {
      ...this.buildWhereClause(filters, dateRange),
      paymentDate: { not: null },
      submissionDate: { not: null },
    };

    const claims = await prismaClient.claim.findMany({
      where,
      select: {
        submissionDate: true,
        paymentDate: true,
        netAmount: true,
      },
    });

    let totalDays = 0;
    let totalAmount = 0;

    claims.forEach((claim) => {
      if (claim.submissionDate && claim.paymentDate) {
        const days =
          (claim.paymentDate.getTime() - claim.submissionDate.getTime()) / (1000 * 60 * 60 * 24);
        totalDays += days * claim.netAmount;
        totalAmount += claim.netAmount;
      }
    });

    const value = totalAmount > 0 ? totalDays / totalAmount : 0;

    // Previous period
    const previousWhere = {
      ...this.buildWhereClause(filters, {
        startDate: new Date(dateRange.startDate.getTime() - 30 * 24 * 60 * 60 * 1000),
        endDate: new Date(dateRange.endDate.getTime() - 30 * 24 * 60 * 60 * 1000),
      }),
      paymentDate: { not: null },
      submissionDate: { not: null },
    };

    const previousClaims = await prismaClient.claim.findMany({
      where: previousWhere,
      select: {
        submissionDate: true,
        paymentDate: true,
        netAmount: true,
      },
    });

    let prevTotalDays = 0;
    let prevTotalAmount = 0;

    previousClaims.forEach((claim) => {
      if (claim.submissionDate && claim.paymentDate) {
        const days =
          (claim.paymentDate.getTime() - claim.submissionDate.getTime()) / (1000 * 60 * 60 * 24);
        prevTotalDays += days * claim.netAmount;
        prevTotalAmount += claim.netAmount;
      }
    });

    const previousValue = prevTotalAmount > 0 ? prevTotalDays / prevTotalAmount : 0;
    const percentChange = previousValue ? ((value - previousValue) / previousValue) * 100 : 0;

    return {
      name: 'Days in A/R',
      key: 'daysInAR',
      value,
      unit: 'days',
      trend: percentChange < 0 ? 'up' : percentChange > 0 ? 'down' : 'stable', // Lower is better
      percentChange: -percentChange, // Invert because lower is better
      sparkline: [value, value, value, value, value, value, value], // Simplified
      previousValue,
    };
  }

  /**
   * 8. A/R Aging - Breakdown of outstanding balances by age
   */
  async calculateARAging(filters: FilterParams = {}): Promise<KPI> {
    const dateRange = this.getDateRange(filters);
    const where = {
      ...this.buildWhereClause(filters, dateRange),
      outstandingAmount: { gt: 0 },
    };

    const claims = await prismaClient.claim.findMany({
      where,
      select: {
        serviceDate: true,
        outstandingAmount: true,
      },
    });

    const now = new Date();
    let aging_0_30 = 0;
    let aging_31_60 = 0;
    let aging_61_90 = 0;
    let aging_91_120 = 0;
    let aging_120_plus = 0;

    claims.forEach((claim) => {
      const daysOld = (now.getTime() - claim.serviceDate.getTime()) / (1000 * 60 * 60 * 24);
      const amount = claim.outstandingAmount;

      if (daysOld <= 30) aging_0_30 += amount;
      else if (daysOld <= 60) aging_31_60 += amount;
      else if (daysOld <= 90) aging_61_90 += amount;
      else if (daysOld <= 120) aging_91_120 += amount;
      else aging_120_plus += amount;
    });

    const total = aging_0_30 + aging_31_60 + aging_61_90 + aging_91_120 + aging_120_plus;

    // Return percentage of A/R > 90 days as the main metric
    const value = total > 0 ? ((aging_91_120 + aging_120_plus) / total) * 100 : 0;

    return {
      name: 'A/R Aging >90 Days',
      key: 'arAging',
      value,
      unit: 'percentage',
      trend: value < 30 ? 'up' : value > 50 ? 'down' : 'stable',
      percentChange: 0, // Simplified
      sparkline: [value, value, value, value, value, value, value],
      previousValue: value,
    };
  }

  /**
   * 9. Outstanding Balance - Total A/R balance
   */
  async calculateOutstandingBalance(filters: FilterParams = {}): Promise<KPI> {
    const dateRange = this.getDateRange(filters);
    const where = this.buildWhereClause(filters, dateRange);

    const [current, previous] = await Promise.all([
      prismaClient.claim.aggregate({
        where,
        _sum: { outstandingAmount: true },
      }),
      prismaClient.claim.aggregate({
        where: this.buildWhereClause(filters, {
          startDate: new Date(dateRange.startDate.getTime() - 30 * 24 * 60 * 60 * 1000),
          endDate: new Date(dateRange.endDate.getTime() - 30 * 24 * 60 * 60 * 1000),
        }),
        _sum: { outstandingAmount: true },
      }),
    ]);

    const value = current._sum.outstandingAmount || 0;
    const previousValue = previous._sum.outstandingAmount || 0;
    const percentChange = previousValue ? ((value - previousValue) / previousValue) * 100 : 0;

    return {
      name: 'Outstanding Balance',
      key: 'outstandingBalance',
      value,
      unit: 'currency',
      trend: percentChange < 0 ? 'up' : percentChange > 0 ? 'down' : 'stable', // Lower is better
      percentChange: -percentChange, // Invert because lower is better
      sparkline: [value, value, value, value, value, value, value],
      previousValue,
    };
  }

  /**
   * 10. Cash Collections - Total payments received
   */
  async calculateCashCollections(filters: FilterParams = {}): Promise<KPI> {
    const dateRange = this.getDateRange(filters);
    const where = {
      ...this.buildWhereClause(filters, dateRange),
      paymentDate: {
        gte: dateRange.startDate,
        lte: dateRange.endDate,
      },
    };

    const [current, previous] = await Promise.all([
      prismaClient.claim.aggregate({
        where,
        _sum: { paymentAmount: true },
      }),
      prismaClient.claim.aggregate({
        where: {
          ...this.buildWhereClause(filters, {
            startDate: new Date(dateRange.startDate.getTime() - 30 * 24 * 60 * 60 * 1000),
            endDate: new Date(dateRange.endDate.getTime() - 30 * 24 * 60 * 60 * 1000),
          }),
          paymentDate: {
            gte: new Date(dateRange.startDate.getTime() - 30 * 24 * 60 * 60 * 1000),
            lte: new Date(dateRange.endDate.getTime() - 30 * 24 * 60 * 60 * 1000),
          },
        },
        _sum: { paymentAmount: true },
      }),
    ]);

    const value = current._sum.paymentAmount || 0;
    const previousValue = previous._sum.paymentAmount || 0;
    const percentChange = previousValue ? ((value - previousValue) / previousValue) * 100 : 0;

    return {
      name: 'Cash Collections',
      key: 'cashCollections',
      value,
      unit: 'currency',
      trend: percentChange > 0 ? 'up' : percentChange < 0 ? 'down' : 'stable',
      percentChange,
      sparkline: [value, value, value, value, value, value, value],
      previousValue,
    };
  }

  /**
   * 11. Clean Claim Rate - Percentage of claims accepted on first submission
   */
  async calculateCleanClaimRate(filters: FilterParams = {}): Promise<KPI> {
    const dateRange = this.getDateRange(filters);
    const where = this.buildWhereClause(filters, dateRange);

    const [total, accepted] = await Promise.all([
      prismaClient.claim.count({ where }),
      prismaClient.claim.count({
        where: {
          ...where,
          status: { in: ['ACCEPTED', 'PAID', 'PARTIAL_PAYMENT'] },
        },
      }),
    ]);

    const value = total > 0 ? (accepted / total) * 100 : 0;

    // Previous period
    const previousWhere = this.buildWhereClause(filters, {
      startDate: new Date(dateRange.startDate.getTime() - 30 * 24 * 60 * 60 * 1000),
      endDate: new Date(dateRange.endDate.getTime() - 30 * 24 * 60 * 60 * 1000),
    });

    const [prevTotal, prevAccepted] = await Promise.all([
      prismaClient.claim.count({ where: previousWhere }),
      prismaClient.claim.count({
        where: {
          ...previousWhere,
          status: { in: ['ACCEPTED', 'PAID', 'PARTIAL_PAYMENT'] },
        },
      }),
    ]);

    const previousValue = prevTotal > 0 ? (prevAccepted / prevTotal) * 100 : 0;
    const percentChange = previousValue ? ((value - previousValue) / previousValue) * 100 : 0;

    return {
      name: 'Clean Claim Rate',
      key: 'cleanClaimRate',
      value,
      unit: 'percentage',
      trend: percentChange > 0 ? 'up' : percentChange < 0 ? 'down' : 'stable',
      percentChange,
      sparkline: [value, value, value, value, value, value, value],
      previousValue,
    };
  }

  /**
   * 12. Denial Rate - Percentage of claims denied
   */
  async calculateDenialRate(filters: FilterParams = {}): Promise<KPI> {
    const dateRange = this.getDateRange(filters);
    const where = this.buildWhereClause(filters, dateRange);

    const [total, denied] = await Promise.all([
      prismaClient.claim.count({ where }),
      prismaClient.claim.count({
        where: {
          ...where,
          status: 'DENIED',
        },
      }),
    ]);

    const value = total > 0 ? (denied / total) * 100 : 0;

    // Previous period
    const previousWhere = this.buildWhereClause(filters, {
      startDate: new Date(dateRange.startDate.getTime() - 30 * 24 * 60 * 60 * 1000),
      endDate: new Date(dateRange.endDate.getTime() - 30 * 24 * 60 * 60 * 1000),
    });

    const [prevTotal, prevDenied] = await Promise.all([
      prismaClient.claim.count({ where: previousWhere }),
      prismaClient.claim.count({
        where: {
          ...previousWhere,
          status: 'DENIED',
        },
      }),
    ]);

    const previousValue = prevTotal > 0 ? (prevDenied / prevTotal) * 100 : 0;
    const percentChange = previousValue ? ((value - previousValue) / previousValue) * 100 : 0;

    return {
      name: 'Denial Rate',
      key: 'denialRate',
      value,
      unit: 'percentage',
      trend: percentChange < 0 ? 'up' : percentChange > 0 ? 'down' : 'stable', // Lower is better
      percentChange: -percentChange, // Invert because lower is better
      sparkline: [value, value, value, value, value, value, value],
      previousValue,
    };
  }

  /**
   * 13. Claim Volume - Total number of claims
   */
  async calculateClaimVolume(filters: FilterParams = {}): Promise<KPI> {
    const dateRange = this.getDateRange(filters);
    const where = this.buildWhereClause(filters, dateRange);

    const [current, previous, sparkline] = await Promise.all([
      prismaClient.claim.count({ where }),
      prismaClient.claim.count({
        where: this.buildWhereClause(filters, {
          startDate: new Date(dateRange.startDate.getTime() - 30 * 24 * 60 * 60 * 1000),
          endDate: new Date(dateRange.endDate.getTime() - 30 * 24 * 60 * 60 * 1000),
        }),
      }),
      this.calculateSparkline('claimVolume', filters),
    ]);

    const value = current;
    const previousValue = previous;
    const percentChange = previousValue ? ((value - previousValue) / previousValue) * 100 : 0;

    return {
      name: 'Claim Volume',
      key: 'claimVolume',
      value,
      unit: 'number',
      trend: percentChange > 0 ? 'up' : percentChange < 0 ? 'down' : 'stable',
      percentChange,
      sparkline,
      previousValue,
    };
  }

  /**
   * 14. Denial Recovery Rate - Percentage of denied claims recovered
   */
  async calculateDenialRecoveryRate(filters: FilterParams = {}): Promise<KPI> {
    const dateRange = this.getDateRange(filters);
    const where = this.buildWhereClause(filters, dateRange);

    const [denied, appealed] = await Promise.all([
      prismaClient.claim.count({
        where: {
          ...where,
          status: { in: ['DENIED', 'APPEALED'] },
        },
      }),
      prismaClient.claim.count({
        where: {
          ...where,
          status: 'APPEALED',
        },
      }),
    ]);

    const value = denied > 0 ? (appealed / denied) * 100 : 0;

    // Previous period
    const previousWhere = this.buildWhereClause(filters, {
      startDate: new Date(dateRange.startDate.getTime() - 30 * 24 * 60 * 60 * 1000),
      endDate: new Date(dateRange.endDate.getTime() - 30 * 24 * 60 * 60 * 1000),
    });

    const [prevDenied, prevAppealed] = await Promise.all([
      prismaClient.claim.count({
        where: {
          ...previousWhere,
          status: { in: ['DENIED', 'APPEALED'] },
        },
      }),
      prismaClient.claim.count({
        where: {
          ...previousWhere,
          status: 'APPEALED',
        },
      }),
    ]);

    const previousValue = prevDenied > 0 ? (prevAppealed / prevDenied) * 100 : 0;
    const percentChange = previousValue ? ((value - previousValue) / previousValue) * 100 : 0;

    return {
      name: 'Denial Recovery Rate',
      key: 'denialRecoveryRate',
      value,
      unit: 'percentage',
      trend: percentChange > 0 ? 'up' : percentChange < 0 ? 'down' : 'stable',
      percentChange,
      sparkline: [value, value, value, value, value, value, value],
      previousValue,
    };
  }

  /**
   * 15. Patient Volume - Total unique patients
   */
  async calculatePatientVolume(filters: FilterParams = {}): Promise<KPI> {
    const dateRange = this.getDateRange(filters);
    const where = this.buildWhereClause(filters, dateRange);

    const [current, previous] = await Promise.all([
      prismaClient.claim.findMany({
        where,
        select: { patientId: true },
        distinct: ['patientId'],
      }),
      prismaClient.claim.findMany({
        where: this.buildWhereClause(filters, {
          startDate: new Date(dateRange.startDate.getTime() - 30 * 24 * 60 * 60 * 1000),
          endDate: new Date(dateRange.endDate.getTime() - 30 * 24 * 60 * 60 * 1000),
        }),
        select: { patientId: true },
        distinct: ['patientId'],
      }),
    ]);

    const value = current.length;
    const previousValue = previous.length;
    const percentChange = previousValue ? ((value - previousValue) / previousValue) * 100 : 0;

    return {
      name: 'Patient Volume',
      key: 'patientVolume',
      value,
      unit: 'number',
      trend: percentChange > 0 ? 'up' : percentChange < 0 ? 'down' : 'stable',
      percentChange,
      sparkline: [value, value, value, value, value, value, value],
      previousValue,
    };
  }

  /**
   * 16. Payer Mix - Distribution of revenue by payer type
   */
  async calculatePayerMix(filters: FilterParams = {}): Promise<KPI> {
    const dateRange = this.getDateRange(filters);
    const where = this.buildWhereClause(filters, dateRange);

    const payerRevenue = await prismaClient.claim.groupBy({
      by: ['payerId'],
      where,
      _sum: { netAmount: true },
    });

    // Get top payer's percentage
    const totalRevenue = payerRevenue.reduce((sum, p) => sum + (p._sum.netAmount || 0), 0);
    const topPayerRevenue = Math.max(...payerRevenue.map((p) => p._sum.netAmount || 0));
    const value = totalRevenue > 0 ? (topPayerRevenue / totalRevenue) * 100 : 0;

    return {
      name: 'Top Payer Mix',
      key: 'payerMix',
      value,
      unit: 'percentage',
      trend: 'stable',
      percentChange: 0, // Simplified
      sparkline: [value, value, value, value, value, value, value],
      previousValue: value,
    };
  }

  /**
   * 17. Revenue Cycle Days - Average days from service to payment
   */
  async calculateRevenueCycleDays(filters: FilterParams = {}): Promise<KPI> {
    const dateRange = this.getDateRange(filters);
    const where = {
      ...this.buildWhereClause(filters, dateRange),
      paymentDate: { not: null },
    };

    const claims = await prismaClient.claim.findMany({
      where,
      select: {
        serviceDate: true,
        paymentDate: true,
        netAmount: true,
      },
    });

    let totalDays = 0;
    let totalAmount = 0;

    claims.forEach((claim) => {
      if (claim.paymentDate) {
        const days =
          (claim.paymentDate.getTime() - claim.serviceDate.getTime()) / (1000 * 60 * 60 * 24);
        totalDays += days * claim.netAmount;
        totalAmount += claim.netAmount;
      }
    });

    const value = totalAmount > 0 ? totalDays / totalAmount : 0;

    // Previous period
    const previousWhere = {
      ...this.buildWhereClause(filters, {
        startDate: new Date(dateRange.startDate.getTime() - 30 * 24 * 60 * 60 * 1000),
        endDate: new Date(dateRange.endDate.getTime() - 30 * 24 * 60 * 60 * 1000),
      }),
      paymentDate: { not: null },
    };

    const previousClaims = await prismaClient.claim.findMany({
      where: previousWhere,
      select: {
        serviceDate: true,
        paymentDate: true,
        netAmount: true,
      },
    });

    let prevTotalDays = 0;
    let prevTotalAmount = 0;

    previousClaims.forEach((claim) => {
      if (claim.paymentDate) {
        const days =
          (claim.paymentDate.getTime() - claim.serviceDate.getTime()) / (1000 * 60 * 60 * 24);
        prevTotalDays += days * claim.netAmount;
        prevTotalAmount += claim.netAmount;
      }
    });

    const previousValue = prevTotalAmount > 0 ? prevTotalDays / prevTotalAmount : 0;
    const percentChange = previousValue ? ((value - previousValue) / previousValue) * 100 : 0;

    return {
      name: 'Revenue Cycle Days',
      key: 'revenueCycleDays',
      value,
      unit: 'days',
      trend: percentChange < 0 ? 'up' : percentChange > 0 ? 'down' : 'stable', // Lower is better
      percentChange: -percentChange, // Invert because lower is better
      sparkline: [value, value, value, value, value, value, value],
      previousValue,
    };
  }

  /**
   * Get specific KPI by key
   */
  async getKPIByKey(key: string, filters: FilterParams = {}): Promise<KPI> {
    const methodMap: { [key: string]: (filters: FilterParams) => Promise<KPI> } = {
      grossRevenue: this.calculateGrossRevenue.bind(this),
      netRevenue: this.calculateNetRevenue.bind(this),
      revenueGrowth: this.calculateRevenueGrowth.bind(this),
      revenueByFacility: this.calculateRevenueByFacility.bind(this),
      revenuePerPatient: this.calculateRevenuePerPatient.bind(this),
      collectionRate: this.calculateCollectionRate.bind(this),
      daysInAR: this.calculateDaysInAR.bind(this),
      arAging: this.calculateARAging.bind(this),
      outstandingBalance: this.calculateOutstandingBalance.bind(this),
      cashCollections: this.calculateCashCollections.bind(this),
      cleanClaimRate: this.calculateCleanClaimRate.bind(this),
      denialRate: this.calculateDenialRate.bind(this),
      claimVolume: this.calculateClaimVolume.bind(this),
      denialRecoveryRate: this.calculateDenialRecoveryRate.bind(this),
      patientVolume: this.calculatePatientVolume.bind(this),
      payerMix: this.calculatePayerMix.bind(this),
      revenueCycleDays: this.calculateRevenueCycleDays.bind(this),
    };

    const method = methodMap[key];
    if (!method) {
      throw new Error(`Unknown KPI key: ${key}`);
    }

    return method(filters);
  }
}

// Export singleton instance
export const kpiService = new KPIService();
