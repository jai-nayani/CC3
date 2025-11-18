import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import metricsReducer from './metricsSlice';
import filterReducer from './filterSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    metrics: metricsReducer,
    filters: filterReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['filters/setDateRange'],
        // Ignore these field paths in all actions
        ignoredActionPaths: ['payload.startDate', 'payload.endDate'],
        // Ignore these paths in the state
        ignoredPaths: ['filters.startDate', 'filters.endDate'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
