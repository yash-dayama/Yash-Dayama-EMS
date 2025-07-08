import axios from 'axios'
import { toast } from 'react-toastify'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response
      
      switch (status) {
        case 401:
          localStorage.removeItem('token')
          localStorage.removeItem('userType')
          localStorage.removeItem('user')
          window.location.href = '/'
          break
          
        case 403:
          toast.error('Access denied. You don\'t have permission to perform this action.')
          break
          
        case 404:
          toast.error('Resource not found.')
          break
          
        case 500:
          toast.error('Internal server error. Please try again later.')
          break
          
        default:
          break
      }
    } else if (error.request) {
      toast.error('Network error. Please check your connection.')
    } else {
      toast.error('An unexpected error occurred.')
    }
    
    return Promise.reject(error)
  }
)

export const adminAPI = {
  // Auth
  login: (credentials) => api.post('/admin/login', credentials),
  logout: () => api.post('/admin/logout'),
  changePassword: (data) => api.patch('/admin/password/change', data),
  forgotPassword: (email) => api.post('/admin/password/forgot', { email }),
  verifyOTP: (data) => api.post('/admin/verify/otp', data),
  resetPassword: (data) => api.post('/admin/password/reset', data),

  // Dashboard
  getDashboardStats: () => api.get('/admin/dashboard/stats'),
  getQuickStats: () => api.get('/admin/dashboard/quick-stats'),

  // Employee Management
  createEmployee: (data) => api.post('/admin/add-employees', data),
  getAllEmployees: (params) => api.get('/admin/employees', { params }),
  getEmployeeStats: () => api.get('/admin/employees/stats'),
  getEmployeeById: (id) => api.get(`/admin/employees/${id}`),
  updateEmployee: (id, data) => api.patch(`/admin/update-employees/${id}`, data),
  deleteEmployee: (id) => api.delete(`/admin/delete-employees/${id}`),
  updateLeaveBalance: (id, data) => api.patch(`/admin/employees/${id}/leave-balance`, data),

  // Leave Management
  getAllLeaves: (params) => api.get('/admin/leaves', { params }),
  getPendingLeaves: () => api.get('/admin/leaves/pending'),
  getLeaveStats: (params) => api.get('/admin/leaves/stats', { params }),
  getLeaveById: (id) => api.get(`/admin/leaves/${id}`),
  updateLeave: (id, data) => api.patch(`/admin/leaves/${id}`, data),
  approveLeave: (id) => api.post(`/admin/leaves/${id}/approve`),
  rejectLeave: (id) => api.post(`/admin/leaves/${id}/reject`),
  cancelLeave: (id) => api.post(`/admin/leaves/${id}/cancel`),
  getEmployeeLeaveSummary: (employeeId, params) => 
    api.get(`/admin/employees/${employeeId}/leaves/summary`, { params }),

  // Attendance Management
  getAllAttendance: (params) => api.get('/admin/attendance', { params }),
  getDailyAttendance: (params) => api.get('/admin/attendance/daily', { params }),
  getTodayAttendance: () => api.get('/admin/attendance/today'),
  getAttendanceStats: (params) => api.get('/admin/attendance/stats', { params }),
  getAttendanceSummary: (params) => api.get('/admin/attendance/summary', { params }),
  updateAttendance: (id, data) => api.patch(`/admin/attendance/${id}`, data),
  deleteAttendance: (id) => api.delete(`/admin/attendance/${id}`),
  getEmployeeAttendance: (employeeId, params) => 
    api.get(`/admin/employees/${employeeId}/attendance`, { params }),
  getEmployeeMonthlyAttendance: (employeeId, params) => 
    api.get(`/admin/employees/${employeeId}/attendance/monthly`, { params }),
  getEmployeeAttendanceStats: (employeeId, params) => 
    api.get(`/admin/employees/${employeeId}/attendance/stats`, { params }),
}

// Employee APIs
export const employeeAPI = {
  // Auth
  login: (credentials) => api.post('/employee/auth/login', credentials),
  logout: () => api.post('/employee/auth/logout'),
  changePassword: (data) => api.patch('/employee/auth/change-password', data),
  forgotPassword: (email) => api.post('/employee/auth/forgot-password', { email }),
  verifyResetCode: (data) => api.post('/employee/auth/verify-reset-code', data),
  resetPassword: (data) => api.post('/employee/auth/reset-password', data),

  // Leave Management
  createLeave: (data) => api.post('/employee/leaves', data),
  getMyLeaves: (params) => api.get('/employee/leaves', { params }),
  getLeaveSummary: (params) => api.get('/employee/leaves/summary', { params }),
  getLeaveBalance: () => api.get('/employee/leaves/balance'),
  getLeaveById: (id) => api.get(`/employee/leaves/${id}`),
  updateLeave: (id, data) => api.patch(`/employee/leaves/${id}`, data),
  cancelLeave: (id) => api.post(`/employee/leaves/${id}/cancel`),

  // Attendance Management
  checkIn: () => api.post('/employee/attendance/check-in'),
  checkOut: () => api.post('/employee/attendance/check-out'),
  getTodayAttendance: () => api.get('/employee/attendance/today'),
  getCheckInStatus: () => api.get('/employee/attendance/status'),
  getMyAttendance: (params) => api.get('/employee/attendance', { params }),
  getMonthlyAttendance: (params) => api.get('/employee/attendance/monthly', { params }),
  getMonthlyHours: (params) => api.get('/employee/attendance/monthly/hours', { params }),
  getAttendanceStats: (params) => api.get('/employee/attendance/stats', { params }),
}

// Utility functions
export const formatApiError = (error) => {
  if (error.response?.data?.error) {
    return error.response.data.error
  }
  if (error.message) {
    return error.message
  }
  return 'An unexpected error occurred'
}

export const isNetworkError = (error) => {
  return !error.response && error.request
}

export default api 