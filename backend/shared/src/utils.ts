/**
 * Shared utility functions
 */

import { format, parseISO, subMonths, subDays, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';
import * as bcrypt from 'bcrypt';
import type { ApiResponse, FilterParams } from './types';

// ============================================================================
// Date Utilities
// ============================================================================

export const formatDate = (date: Date | string, formatStr: string = 'yyyy-MM-dd'): string => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, formatStr);
};

export const getDateRange = (preset: string): { startDate: Date; endDate: Date } => {
  const now = new Date();

  switch (preset) {
    case 'today':
      return { startDate: new Date(now.setHours(0, 0, 0, 0)), endDate: new Date(now.setHours(23, 59, 59, 999)) };

    case 'this-week':
      return { startDate: subDays(now, 7), endDate: now };

    case 'this-month':
      return { startDate: startOfMonth(now), endDate: endOfMonth(now) };

    case 'this-quarter':
      const quarter = Math.floor(now.getMonth() / 3);
      const quarterStart = new Date(now.getFullYear(), quarter * 3, 1);
      const quarterEnd = new Date(now.getFullYear(), (quarter + 1) * 3, 0);
      return { startDate: quarterStart, endDate: quarterEnd };

    case 'this-year':
      return { startDate: startOfYear(now), endDate: endOfYear(now) };

    case 'ytd':
      return { startDate: startOfYear(now), endDate: now };

    case 'last-6-months':
      return { startDate: subMonths(now, 6), endDate: now };

    default:
      return { startDate: subMonths(now, 1), endDate: now };
  }
};

// ============================================================================
// Number Formatting
// ============================================================================

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

export const formatPercentage = (value: number, decimals: number = 1): string => {
  return `${value.toFixed(decimals)}%`;
};

export const formatNumber = (value: number, decimals: number = 0): string => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
};

// ============================================================================
// Calculation Utilities
// ============================================================================

export const calculatePercentage = (numerator: number, denominator: number): number => {
  if (denominator === 0) return 0;
  return (numerator / denominator) * 100;
};

export const calculateChange = (current: number, previous: number): number => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
};

export const calculateAverage = (values: number[]): number => {
  if (values.length === 0) return 0;
  return values.reduce((sum, val) => sum + val, 0) / values.length;
};

export const calculateMedian = (values: number[]): number => {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
};

// ============================================================================
// Password Hashing
// ============================================================================

export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
};

export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

// ============================================================================
// API Response Builders
// ============================================================================

export const successResponse = <T>(data: T, meta?: any): ApiResponse<T> => {
  return {
    success: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      ...meta,
    },
  };
};

export const errorResponse = (code: string, message: string, details?: any[]): ApiResponse => {
  return {
    success: false,
    error: {
      code,
      message,
      details,
    },
    meta: {
      timestamp: new Date().toISOString(),
    },
  };
};

export const paginatedResponse = <T>(
  data: T[],
  total: number,
  page: number,
  limit: number
): ApiResponse<T[]> => {
  const totalPages = Math.ceil(total / limit);

  return {
    success: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrevious: page > 1,
    },
  };
};

// ============================================================================
// Validation Utilities
// ============================================================================

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPassword = (password: string): boolean => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special char
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

export const isValidUUID = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

// ============================================================================
// Filter Utilities
// ============================================================================

export const buildDateFilter = (filters: FilterParams) => {
  const dateFilter: any = {};

  if (filters.startDate) {
    dateFilter.gte = new Date(filters.startDate);
  }

  if (filters.endDate) {
    dateFilter.lte = new Date(filters.endDate);
  }

  return Object.keys(dateFilter).length > 0 ? dateFilter : undefined;
};

export const buildPaginationParams = (filters: FilterParams) => {
  const page = filters.page || 1;
  const limit = Math.min(filters.limit || 50, 100); // Max 100 items

  return {
    skip: (page - 1) * limit,
    take: limit,
  };
};

// ============================================================================
// Error Classes
// ============================================================================

export class ValidationError extends Error {
  constructor(message: string, public details?: any[]) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends Error {
  constructor(message: string = 'Authentication failed') {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends Error {
  constructor(message: string = 'Insufficient permissions') {
    super(message);
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends Error {
  constructor(resource: string) {
    super(`${resource} not found`);
    this.name = 'NotFoundError';
  }
}
