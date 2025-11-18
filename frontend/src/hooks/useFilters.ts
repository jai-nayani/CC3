import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import {
  setDateRange,
  setFacility,
  setDepartment,
  resetFilters,
} from '../store/filterSlice';

export const useFilters = () => {
  const dispatch = useDispatch();
  const filters = useSelector((state: RootState) => state.filters);

  const updateDateRange = useCallback(
    (startDate: Date, endDate: Date) => {
      dispatch(setDateRange({ startDate, endDate }));
    },
    [dispatch]
  );

  const updateFacility = useCallback(
    (facilityId: number | null) => {
      dispatch(setFacility(facilityId));
    },
    [dispatch]
  );

  const updateDepartment = useCallback(
    (department: string | null) => {
      dispatch(setDepartment(department));
    },
    [dispatch]
  );

  const reset = useCallback(() => {
    dispatch(resetFilters());
  }, [dispatch]);

  return {
    filters,
    updateDateRange,
    updateFacility,
    updateDepartment,
    reset,
  };
};
