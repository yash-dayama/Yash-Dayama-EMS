import moment from 'moment'
import {
  DATE_FORMATS,
  LEAVE_TYPE_LABELS,
  LEAVE_STATUS_LABELS,
  LEAVE_STATUS_COLORS,
  ATTENDANCE_STATUS_LABELS,
  ATTENDANCE_STATUS_COLORS,
  EMPLOYEE_STATUS_LABELS,
  EMPLOYEE_STATUS_COLORS,
  REGEX_PATTERNS,
  VALIDATION_MESSAGES
} from './constants'

// Date utilities
export const formatDate = (date, format = DATE_FORMATS.DISPLAY) => {
  if (!date) return ''
  return moment(date).format(format)
}

export const formatTime = (time) => {
  if (!time) return ''
  return moment(time, 'HH:mm:ss').format(DATE_FORMATS.TIME)
}

export const formatDateTime = (dateTime) => {
  if (!dateTime) return ''
  return moment(dateTime).format(DATE_FORMATS.DATETIME)
}

export const getToday = () => {
  return moment().format(DATE_FORMATS.API)
}

export const getCurrentTime = () => {
  return moment().format('HH:mm:ss')
}

export const getCurrentDateTime = () => {
  return moment().toISOString()
}

export const isWeekend = (date) => {
  const day = moment(date).day()
  return day === 0 || day === 6 // Sunday = 0, Saturday = 6
}

export const getWorkingDays = (startDate, endDate) => {
  const start = moment(startDate)
  const end = moment(endDate)
  let workingDays = 0
  
  const current = start.clone()
  while (current.isSameOrBefore(end, 'day')) {
    if (!isWeekend(current)) {
      workingDays++
    }
    current.add(1, 'day')
  }
  
  return workingDays
}

export const getDaysBetween = (startDate, endDate) => {
  return moment(endDate).diff(moment(startDate), 'days') + 1
}

export const isDateInRange = (date, startDate, endDate) => {
  const checkDate = moment(date)
  return checkDate.isBetween(startDate, endDate, 'day', '[]')
}

export const getMonthYearOptions = (monthsBack = 12) => {
  const options = []
  for (let i = 0; i < monthsBack; i++) {
    const date = moment().subtract(i, 'months')
    options.push({
      value: date.format('YYYY-MM'),
      label: date.format('MMMM YYYY')
    })
  }
  return options
}

export const getYearOptions = (yearsBack = 5) => {
  const currentYear = moment().year()
  const options = []
  for (let i = 0; i < yearsBack; i++) {
    const year = currentYear - i
    options.push({
      value: year,
      label: year.toString()
    })
  }
  return options
}

export const validateEmail = (email) => {
  return REGEX_PATTERNS.EMAIL.test(email)
}

export const validatePassword = (password) => {
  return REGEX_PATTERNS.PASSWORD.test(password)
}

export const validatePhone = (phone) => {
  return REGEX_PATTERNS.PHONE.test(phone)
}

export const validateEmployeeId = (employeeId) => {
  return REGEX_PATTERNS.EMPLOYEE_ID.test(employeeId)
}

export const validateRequired = (value) => {
  return value !== null && value !== undefined && value.toString().trim() !== ''
}

export const validateDateRange = (startDate, endDate) => {
  if (!startDate || !endDate) return false
  return moment(startDate).isSameOrBefore(endDate)
}

export const getValidationError = (field, value, options = {}) => {
  if (!validateRequired(value)) {
    return VALIDATION_MESSAGES.REQUIRED
  }

  switch (field) {
    case 'email':
      return validateEmail(value) ? '' : VALIDATION_MESSAGES.EMAIL_INVALID
    case 'password':
      return validatePassword(value) ? '' : VALIDATION_MESSAGES.PASSWORD_WEAK
    case 'phone':
      return validatePhone(value) ? '' : VALIDATION_MESSAGES.PHONE_INVALID
    case 'employeeId':
      return validateEmployeeId(value) ? '' : VALIDATION_MESSAGES.EMPLOYEE_ID_INVALID
    case 'confirmPassword':
      return value === options.password ? '' : VALIDATION_MESSAGES.PASSWORDS_NOT_MATCH
    case 'endDate':
      return validateDateRange(options.startDate, value) ? '' : VALIDATION_MESSAGES.END_DATE_BEFORE_START
    default:
      return ''
  }
}

// Data transformation utilities
export const getLeaveTypeLabel = (type) => {
  return LEAVE_TYPE_LABELS[type] || 'Unknown'
}

export const getLeaveStatusLabel = (status) => {
  return LEAVE_STATUS_LABELS[status] || 'Unknown'
}

export const getLeaveStatusColor = (status) => {
  return LEAVE_STATUS_COLORS[status] || 'secondary'
}

export const getAttendanceStatusLabel = (status) => {
  return ATTENDANCE_STATUS_LABELS[status] || 'Unknown'
}

export const getAttendanceStatusColor = (status) => {
  return ATTENDANCE_STATUS_COLORS[status] || 'secondary'
}

export const getEmployeeStatusLabel = (status) => {
  return EMPLOYEE_STATUS_LABELS[status] || 'Unknown'
}

export const getEmployeeStatusColor = (status) => {
  return EMPLOYEE_STATUS_COLORS[status] || 'secondary'
}

// API error handling utilities
export const formatApiError = (error) => {
  if (error.response?.data?.error) {
    return error.response.data.error
  }
  if (error.response?.data?.message) {
    return error.response.data.message
  }
  if (error.message) {
    return error.message
  }
  return 'An unexpected error occurred'
}

export const isNetworkError = (error) => {
  return !error.response && error.request
}

// Time calculation utilities
export const calculateHours = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) return 0
  
  const start = moment(checkIn)
  const end = moment(checkOut)
  const duration = moment.duration(end.diff(start))
  
  return Math.round(duration.asHours() * 100) / 100
}

export const formatHours = (hours) => {
  if (!hours || hours === 0) return '0h 0m'
  
  const h = Math.floor(hours)
  const m = Math.round((hours - h) * 60)
  
  return `${h}h ${m}m`
}

export const getWorkingStatus = (hours, fullDayHours = 8) => {
  if (hours >= fullDayHours) return 'full_day'
  if (hours >= fullDayHours / 2) return 'half_day'
  return 'absent'
}

// Array utilities
export const groupBy = (array, key) => {
  return array.reduce((result, item) => {
    const group = item[key]
    if (!result[group]) {
      result[group] = []
    }
    result[group].push(item)
    return result
  }, {})
}

export const sortBy = (array, key, direction = 'asc') => {
  return [...array].sort((a, b) => {
    const aVal = a[key]
    const bVal = b[key]
    
    if (direction === 'desc') {
      return bVal > aVal ? 1 : -1
    }
    return aVal > bVal ? 1 : -1
  })
}

export const filterBy = (array, filters) => {
  return array.filter(item => {
    return Object.keys(filters).every(key => {
      const filterValue = filters[key]
      if (!filterValue) return true
      
      const itemValue = item[key]
      if (typeof filterValue === 'string') {
        return itemValue.toString().toLowerCase().includes(filterValue.toLowerCase())
      }
      return itemValue === filterValue
    })
  })
}

// Number utilities
export const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount || 0)
}

export const formatPercentage = (value, decimals = 1) => {
  return `${(value || 0).toFixed(decimals)}%`
}

export const roundToTwo = (num) => {
  return Math.round((num + Number.EPSILON) * 100) / 100
}

// String utilities
export const capitalize = (str) => {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

export const capitalizeWords = (str) => {
  if (!str) return ''
  return str.split(' ').map(capitalize).join(' ')
}

export const truncate = (str, length = 50) => {
  if (!str || str.length <= length) return str
  return str.substring(0, length) + '...'
}

export const generateRandomId = () => {
  return Math.random().toString(36).substr(2, 9)
}

// Local storage utilities
export const getFromStorage = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch (error) {
    console.error('Error reading from localStorage:', error)
    return defaultValue
  }
}

export const setToStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch (error) {
    console.error('Error writing to localStorage:', error)
    return false
  }
}

export const removeFromStorage = (key) => {
  try {
    localStorage.removeItem(key)
    return true
  } catch (error) {
    console.error('Error removing from localStorage:', error)
    return false
  }
}

// URL utilities
export const buildQueryString = (params) => {
  const query = new URLSearchParams()
  
  Object.keys(params).forEach(key => {
    const value = params[key]
    if (value !== null && value !== undefined && value !== '') {
      query.append(key, value)
    }
  })
  
  return query.toString()
}

export const parseQueryString = (queryString) => {
  const params = new URLSearchParams(queryString)
  const result = {}
  
  for (const [key, value] of params) {
    result[key] = value
  }
  
  return result
}

// File utilities
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export const getFileExtension = (filename) => {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2)
}

// Debounce utility
export const debounce = (func, wait) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
} 