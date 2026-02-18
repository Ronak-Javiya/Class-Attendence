/**
 * Application Constants
 */

// User Roles
export const USER_ROLES = {
  STUDENT: 'STUDENT',
  FACULTY: 'FACULTY',
  ADMIN: 'ADMIN',
  HOD: 'HOD',
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

// Attendance Status
export const ATTENDANCE_STATUS = {
  PRESENT: 'PRESENT',
  ABSENT: 'ABSENT',
  EXCUSED: 'EXCUSED',
} as const;

export type AttendanceStatus = (typeof ATTENDANCE_STATUS)[keyof typeof ATTENDANCE_STATUS];

// Enrollment Status
export const ENROLLMENT_STATUS = {
  REQUESTED: 'REQUESTED',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
} as const;

export type EnrollmentStatus = (typeof ENROLLMENT_STATUS)[keyof typeof ENROLLMENT_STATUS];

// Class Status
export const CLASS_STATUS = {
  DRAFT: 'DRAFT',
  PENDING_HOD_APPROVAL: 'PENDING_HOD_APPROVAL',
  ACTIVE: 'ACTIVE',
  REJECTED: 'REJECTED',
  LOCKED: 'LOCKED',
} as const;

export type ClassStatus = (typeof CLASS_STATUS)[keyof typeof CLASS_STATUS];

// Dispute Status
export const DISPUTE_STATUS = {
  OPEN: 'OPEN',
  UNDER_REVIEW: 'UNDER_REVIEW',
  FACULTY_APPROVED: 'FACULTY_APPROVED',
  FACULTY_REJECTED: 'FACULTY_REJECTED',
  ADMIN_OVERRIDDEN: 'ADMIN_OVERRIDDEN',
} as const;

export type DisputeStatus = (typeof DISPUTE_STATUS)[keyof typeof DISPUTE_STATUS];

// Lecture Status
export const LECTURE_STATUS = {
  CREATED: 'CREATED',
  PHOTO_UPLOADED: 'PHOTO_UPLOADED',
  PROCESSING: 'PROCESSING',
  LOCKED: 'LOCKED',
} as const;

export type LectureStatus = (typeof LECTURE_STATUS)[keyof typeof LECTURE_STATUS];

// Days of week
export const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
] as const;

// Breakpoints
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_DATA: 'user_data',
  THEME: 'theme',
  SIDEBAR_COLLAPSED: 'sidebar_collapsed',
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REFRESH: '/api/auth/refresh',
    LOGOUT: '/api/auth/logout',
  },
  CLASSES: '/api/classes',
  ENROLLMENTS: '/api/enrollments',
  LECTURES: '/api/lectures',
  ATTENDANCE: '/api/attendance',
  DISPUTES: '/api/disputes',
  FACE: '/api/face',
  AUDIT: '/api/audit',
} as const;

// App Routes
export const ROUTES = {
  LOGIN: '/login',
  UNAUTHORIZED: '/unauthorized',
  STUDENT: {
    DASHBOARD: '/student',
    CLASSES: '/student/classes',
    ATTENDANCE: '/student/attendance',
    FACE_ENROLL: '/student/face-enroll',
    DISPUTES: '/student/disputes',
  },
  FACULTY: {
    DASHBOARD: '/faculty',
    CLASSES: '/faculty/classes',
    ATTENDANCE: '/faculty/attendance',
    DISPUTES: '/faculty/disputes',
  },
  ADMIN: {
    DASHBOARD: '/admin',
    ENROLLMENTS: '/admin/enrollments',
    OVERRIDES: '/admin/overrides',
    REPORTS: '/admin/reports',
  },
  HOD: {
    DASHBOARD: '/hod',
    APPROVALS: '/hod/approvals',
    AUDIT: '/hod/audit',
    OVERRIDES: '/hod/overrides',
  },
} as const;

// Toast Durations (ms)
export const TOAST_DURATION = {
  SHORT: 3000,
  NORMAL: 5000,
  LONG: 8000,
} as const;

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 25, 50, 100],
} as const;

// File Upload Limits
export const UPLOAD_LIMITS = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  MAX_IMAGES_PER_LECTURE: 10,
  MIN_FACE_PHOTOS: 5,
} as const;
