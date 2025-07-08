// User Types
export const USER_TYPES = {
  ADMIN: 'admin',
  EMPLOYEE: 'employee'
}

// Leave Types
export const LEAVE_TYPES = {
  SICK: 1,
  VACATION: 2,
  WORK_FROM_HOME: 3
}

export const LEAVE_TYPE_LABELS = {
  [LEAVE_TYPES.SICK]: 'Sick Leave',
  [LEAVE_TYPES.VACATION]: 'Vacation',
  [LEAVE_TYPES.WORK_FROM_HOME]: 'Work From Home'
}

export const LEAVE_TYPE_OPTIONS = [
  { value: LEAVE_TYPES.SICK, label: 'Sick Leave' },
  { value: LEAVE_TYPES.VACATION, label: 'Vacation' },
  { value: LEAVE_TYPES.WORK_FROM_HOME, label: 'Work From Home' }
]

// Leave Status
export const LEAVE_STATUS = {
  PENDING: 1,
  APPROVED: 2,
  REJECTED: 3,
  CANCELLED: 4
}

export const LEAVE_STATUS_LABELS = {
  [LEAVE_STATUS.PENDING]: 'Pending',
  [LEAVE_STATUS.APPROVED]: 'Approved',
  [LEAVE_STATUS.REJECTED]: 'Rejected',
  [LEAVE_STATUS.CANCELLED]: 'Cancelled'
}

export const LEAVE_STATUS_COLORS = {
  [LEAVE_STATUS.PENDING]: 'warning',
  [LEAVE_STATUS.APPROVED]: 'success',
  [LEAVE_STATUS.REJECTED]: 'danger',
  [LEAVE_STATUS.CANCELLED]: 'secondary'
}

// Attendance Status
export const ATTENDANCE_STATUS = {
  PRESENT: 'present',
  ABSENT: 'absent',
  LATE: 'late',
  HALF_DAY: 'half_day'
}

export const ATTENDANCE_STATUS_LABELS = {
  [ATTENDANCE_STATUS.PRESENT]: 'Present',
  [ATTENDANCE_STATUS.ABSENT]: 'Absent',
  [ATTENDANCE_STATUS.LATE]: 'Late',
  [ATTENDANCE_STATUS.HALF_DAY]: 'Half Day'
}

export const ATTENDANCE_STATUS_COLORS = {
  [ATTENDANCE_STATUS.PRESENT]: 'success',
  [ATTENDANCE_STATUS.ABSENT]: 'danger',
  [ATTENDANCE_STATUS.LATE]: 'warning',
  [ATTENDANCE_STATUS.HALF_DAY]: 'info'
}

// Employee Status
export const EMPLOYEE_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended'
}

export const EMPLOYEE_STATUS_LABELS = {
  [EMPLOYEE_STATUS.ACTIVE]: 'Active',
  [EMPLOYEE_STATUS.INACTIVE]: 'Inactive',
  [EMPLOYEE_STATUS.SUSPENDED]: 'Suspended'
}

export const EMPLOYEE_STATUS_COLORS = {
  [EMPLOYEE_STATUS.ACTIVE]: 'success',
  [EMPLOYEE_STATUS.INACTIVE]: 'secondary',
  [EMPLOYEE_STATUS.SUSPENDED]: 'danger'
}

// Departments
export const DEPARTMENTS = [
  'IT',
  'HR',
  'Finance',
  'Marketing',
  'Sales',
  'Operations',
  'Customer Service',
  'Admin'
]

// Positions
export const POSITIONS = [
  'Junior Developer',
  'Senior Developer',
  'Team Lead',
  'Project Manager',
  'HR Manager',
  'Finance Manager',
  'Marketing Manager',
  'Sales Manager',
  'Operations Manager',
  'Admin Manager',
  'CEO',
  'CTO',
  'Other'
]

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: 'MMM DD, YYYY',
  API: 'YYYY-MM-DD',
  DATETIME: 'MMM DD, YYYY HH:mm A',
  TIME: 'HH:mm A',
  MONTH_YEAR: 'MMMM YYYY'
}

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 25, 50, 100]
}

// Working Hours
export const WORKING_HOURS = {
  FULL_DAY: 8,
  HALF_DAY: 4,
  DEFAULT_START_TIME: '09:00',
  DEFAULT_END_TIME: '18:00'
}

// Regex Patterns
export const REGEX_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^[\+]?[1-9][\d]{0,15}$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  EMPLOYEE_ID: /^[A-Z]{2,3}\d{3,6}$/
}

// Validation Messages
export const VALIDATION_MESSAGES = {
  REQUIRED: 'This field is required',
  EMAIL_INVALID: 'Please enter a valid email address',
  PASSWORD_WEAK: 'Password must be at least 8 characters with uppercase, lowercase, number and special character',
  PHONE_INVALID: 'Please enter a valid phone number',
  EMPLOYEE_ID_INVALID: 'Employee ID format should be like EMP001 or DEV001',
  PASSWORDS_NOT_MATCH: 'Passwords do not match',
  DATE_INVALID: 'Please select a valid date',
  END_DATE_BEFORE_START: 'End date cannot be before start date',
  LEAVE_BALANCE_INSUFFICIENT: 'Insufficient leave balance'
}

export const DEFAULT_LEAVE_BALANCE = 20

// API Response Messages
export const API_MESSAGES = {
  SUCCESS: {
    CREATE: 'Created successfully!',
    UPDATE: 'Updated successfully!',
    DELETE: 'Deleted successfully!',
    LOGIN: 'Login successful!',
    LOGOUT: 'Logged out successfully!',
    PASSWORD_CHANGE: 'Password changed successfully!',
    PASSWORD_RESET: 'Password reset successfully!'
  },
  ERROR: {
    GENERIC: 'Something went wrong. Please try again.',
    NETWORK: 'Network error. Please check your connection.',
    UNAUTHORIZED: 'You are not authorized to perform this action.',
    FORBIDDEN: 'Access denied.',
    NOT_FOUND: 'Resource not found.',
    VALIDATION: 'Please check your input and try again.',
    LOGIN_FAILED: 'Invalid credentials. Please try again.'
  }
}

// Chart Colors
export const CHART_COLORS = {
  PRIMARY: '#0d6efd',
  SUCCESS: '#198754',
  WARNING: '#ffc107',
  DANGER: '#dc3545',
  INFO: '#0dcaf0',
  SECONDARY: '#6c757d'
}

// Theme Configuration
export const THEME = {
  SIDEBAR_WIDTH: 250,
  SIDEBAR_COLLAPSED_WIDTH: 60,
  NAVBAR_HEIGHT: 60,
  BORDER_RADIUS: 8,
  BOX_SHADOW: '0 2px 10px rgba(0, 0, 0, 0.1)'
} 