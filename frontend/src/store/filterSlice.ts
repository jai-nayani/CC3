import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { subDays } from 'date-fns';

interface FilterState {
  startDate: Date;
  endDate: Date;
  facilityId: number | null;
  department: string | null;
}

const initialState: FilterState = {
  startDate: subDays(new Date(), 30),
  endDate: new Date(),
  facilityId: null,
  department: null,
};

const filterSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {
    setDateRange: (state, action: PayloadAction<{ startDate: Date; endDate: Date }>) => {
      state.startDate = action.payload.startDate;
      state.endDate = action.payload.endDate;
    },
    setFacility: (state, action: PayloadAction<number | null>) => {
      state.facilityId = action.payload;
    },
    setDepartment: (state, action: PayloadAction<string | null>) => {
      state.department = action.payload;
    },
    resetFilters: (state) => {
      state.startDate = subDays(new Date(), 30);
      state.endDate = new Date();
      state.facilityId = null;
      state.department = null;
    },
  },
});

export const {
  setDateRange,
  setFacility,
  setDepartment,
  resetFilters,
} = filterSlice.actions;

export default filterSlice.reducer;
