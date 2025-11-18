/**
 * Shared constants
 */

// API
export const API_VERSION = 'v1';
export const API_PREFIX = `/api/${API_VERSION}`;

// Pagination
export const DEFAULT_PAGE_SIZE = 50;
export const MAX_PAGE_SIZE = 100;

// KPI Targets
export const KPI_TARGETS = {
  COLLECTION_RATE: 95,
  DAYS_IN_AR: 45,
  DENIAL_RATE: 10,
  CLEAN_CLAIM_RATE: 90,
};

// Alert Thresholds
export const ALERT_THRESHOLDS = {
  DENIAL_RATE_WARNING: 10,
  DENIAL_RATE_CRITICAL: 15,
  DAYS_IN_AR_WARNING: 45,
  DAYS_IN_AR_CRITICAL: 60,
  COLLECTION_RATE_WARNING: 95,
  COLLECTION_RATE_CRITICAL: 90,
};

// Cache TTL (in seconds)
export const CACHE_TTL = {
  KPI: 300, // 5 minutes
  DASHBOARD: 300,
  REPORT: 600, // 10 minutes
  USER: 3600, // 1 hour
};

// Date Presets
export const DATE_PRESETS = [
  'today',
  'this-week',
  'this-month',
  'this-quarter',
  'this-year',
  'ytd',
  'last-6-months',
] as const;

export type DatePreset = typeof DATE_PRESETS[number];

// User Roles
export const USER_ROLES = {
  ADMIN: 'ADMIN',
  EXECUTIVE: 'EXECUTIVE',
  ANALYST: 'ANALYST',
  FACILITY_MANAGER: 'FACILITY_MANAGER',
} as const;

// Claim Status
export const CLAIM_STATUS = {
  DRAFT: 'DRAFT',
  SUBMITTED: 'SUBMITTED',
  ACCEPTED: 'ACCEPTED',
  DENIED: 'DENIED',
  PAID: 'PAID',
  PARTIAL_PAYMENT: 'PARTIAL_PAYMENT',
  APPEALED: 'APPEALED',
  WRITTEN_OFF: 'WRITTEN_OFF',
} as const;
