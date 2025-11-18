import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import {
  fetchMetricsStart,
  fetchMetricsSuccess,
  fetchMetricsFailure,
} from '../store/metricsSlice';
import { analyticsService, AnalyticsFilters } from '../services/analyticsService';
import { format } from 'date-fns';

export const useMetrics = (autoFetch = true) => {
  const dispatch = useDispatch();
  const { kpis, revenueData, loading, error, lastUpdated } = useSelector(
    (state: RootState) => state.metrics
  );
  const filters = useSelector((state: RootState) => state.filters);

  const fetchMetrics = useCallback(
    async (customFilters?: AnalyticsFilters) => {
      try {
        dispatch(fetchMetricsStart());

        const filterParams: AnalyticsFilters = customFilters || {
          startDate: format(filters.startDate, 'yyyy-MM-dd'),
          endDate: format(filters.endDate, 'yyyy-MM-dd'),
          facilityId: filters.facilityId || undefined,
          department: filters.department || undefined,
        };

        const data = await analyticsService.getKPIs(filterParams);
        dispatch(fetchMetricsSuccess(data));
      } catch (err: any) {
        dispatch(fetchMetricsFailure(err.message || 'Failed to fetch metrics'));
        throw err;
      }
    },
    [dispatch, filters]
  );

  useEffect(() => {
    if (autoFetch) {
      fetchMetrics();
    }
  }, [autoFetch, fetchMetrics]);

  return {
    kpis,
    revenueData,
    loading,
    error,
    lastUpdated,
    fetchMetrics,
    refetch: fetchMetrics,
  };
};
