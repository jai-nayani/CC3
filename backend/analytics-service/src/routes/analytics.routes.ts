import { Router } from 'express';
import { analyticsController } from '../controllers/analytics.controller';
import { asyncHandler } from '../middleware/error.middleware';

/**
 * Analytics Routes
 * Defines all analytics and KPI endpoints
 */
const router = Router();

/**
 * GET /kpis
 * Get all KPIs with optional filters
 *
 * Query parameters:
 * - startDate: Start date for filtering (ISO 8601)
 * - endDate: End date for filtering (ISO 8601)
 * - facilityId: Filter by facility ID
 * - departmentId: Filter by department ID
 * - payerId: Filter by payer ID
 * - status: Filter by claim status
 *
 * Example: /kpis?startDate=2024-01-01&endDate=2024-01-31&facilityId=abc123
 */
router.get('/kpis', asyncHandler(analyticsController.getAllKPIs.bind(analyticsController)));

/**
 * GET /kpis/:name
 * Get a specific KPI by name
 *
 * Parameters:
 * - name: KPI name in kebab-case (e.g., gross-revenue, net-revenue)
 *
 * Accepts same query parameters as /kpis
 *
 * Example: /kpis/gross-revenue?startDate=2024-01-01
 */
router.get('/kpis/:name', asyncHandler(analyticsController.getKPIByName.bind(analyticsController)));

/**
 * GET /revenue
 * Get revenue-specific metrics
 *
 * Returns:
 * - grossRevenue: Total charges before adjustments
 * - netRevenue: Revenue after contractual adjustments
 * - revenueGrowth: Period-over-period growth rate
 * - revenueByFacility: Average revenue per facility
 * - revenuePerPatient: Average revenue per patient
 *
 * Accepts same query parameters as /kpis
 *
 * Example: /revenue?facilityId=abc123
 */
router.get('/revenue', asyncHandler(analyticsController.getRevenueMetrics.bind(analyticsController)));

/**
 * GET /collections
 * Get A/R and collection metrics
 *
 * Returns:
 * - collectionRate: Percentage of net revenue collected
 * - daysInAR: Average days for claims to be paid
 * - arAging: Breakdown of outstanding balances by age
 * - outstandingBalance: Total A/R balance
 * - cashCollections: Total payments received
 *
 * Accepts same query parameters as /kpis
 *
 * Example: /collections?startDate=2024-01-01&endDate=2024-01-31
 */
router.get(
  '/collections',
  asyncHandler(analyticsController.getCollectionsMetrics.bind(analyticsController))
);

/**
 * GET /claims
 * Get claims-specific metrics
 *
 * Returns:
 * - cleanClaimRate: Percentage of claims accepted on first submission
 * - denialRate: Percentage of claims denied
 * - claimVolume: Total number of claims
 * - denialRecoveryRate: Percentage of denied claims recovered
 *
 * Accepts same query parameters as /kpis
 *
 * Example: /claims?payerId=xyz789
 */
router.get('/claims', asyncHandler(analyticsController.getClaimsMetrics.bind(analyticsController)));

/**
 * GET /trends
 * Get trend analysis across all metrics
 *
 * Query parameters:
 * - metric: The metric to analyze (default: netRevenue)
 * - periods: Number of periods to analyze (default: 7)
 * - startDate, endDate, etc.: Standard filters
 *
 * Returns:
 * - trends: Array of data points over time
 * - summary: Average, min, max, and overall trend direction
 *
 * Example: /trends?metric=denialRate&periods=12
 */
router.get('/trends', asyncHandler(analyticsController.getTrendAnalysis.bind(analyticsController)));

/**
 * GET /compare
 * Compare metrics across different dimensions
 *
 * Query parameters:
 * - dimension: What to compare (facility, payer, department)
 * - metric: The metric to compare (default: netRevenue)
 * - startDate, endDate, etc.: Standard filters
 *
 * Returns:
 * - comparisons: Array of comparison data sorted by value
 * - summary: Total, average, top, and bottom performers
 *
 * Example: /compare?dimension=facility&metric=collectionRate
 */
router.get(
  '/compare',
  asyncHandler(analyticsController.getComparativeAnalysis.bind(analyticsController))
);

/**
 * Health check endpoint
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'healthy',
      service: 'analytics-service',
      timestamp: new Date().toISOString(),
    },
  });
});

export default router;
