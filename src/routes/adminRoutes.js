const API = require("../utils/apiBuilder");
const AuthController = require("../controllers/admin/AuthController");
const DashboardController = require("../controllers/admin/DashboardController");
const EmployeeController = require("../controllers/admin/EmployeeController");
const AdminLeaveController = require("../controllers/admin/AdminLeaveController");
const AdminAttendanceController = require("../controllers/admin/AdminAttendanceController");

const router = API.configRoute("/admin")
    /**
     * -------------------------------------
     * Auth Routes
     * -------------------------------------
     */
    .addPath("/signup")
    .asPOST(AuthController.addAdminUser)
    .build()

    .addPath("/login")
    .asPOST(AuthController.login)
    .build()

    .addPath("/logout")
    .asPOST(AuthController.logout)
    .useAdminAuth()
    .build()

    .addPath("/password/forgot")
    .asPOST(AuthController.forgotPassword)
    .build()

    .addPath("/verify/otp")
    .asPOST(AuthController.forgotPasswordCodeExists)
    .build()

    .addPath("/password/reset")
    .asPOST(AuthController.resetPassword)
    .build()

    .addPath("/password/change")
    .asUPDATE(AuthController.changePassword)
    .useAdminAuth()
    .build()

    /**
     * -------------------------------------
     * Dashboard Routes
     * -------------------------------------
     */
    .addPath("/dashboard/stats")
    .asGET(DashboardController.getDashboardStats)
    .useAdminAuth()
    .build()

    .addPath("/dashboard/quick-stats")
    .asGET(DashboardController.getQuickStats)
    .useAdminAuth()
    .build()

    /**
     * -------------------------------------
     * Employee Management Routes
     * -------------------------------------
     */
    .addPath("/add-employees")
    .asPOST(EmployeeController.createEmployee)
    .useAdminAuth()
    .build()

    .addPath("/employees")
    .asGET(EmployeeController.getAllEmployees)
    .useAdminAuth()
    .build()

    .addPath("/employees/stats")
    .asGET(EmployeeController.getEmployeeDashboardStats)
    .useAdminAuth()
    .build()

    .addPath("/employees/:id")
    .asGET(EmployeeController.getEmployeeById)
    .useAdminAuth()
    .build()

    .addPath("/update-employees/:id")
    .asUPDATE(EmployeeController.updateEmployee)
    .useAdminAuth()
    .build()

    .addPath("/delete-employees/:id")
    .asDELETE(EmployeeController.deleteEmployee)
    .useAdminAuth()
    .build()

    .addPath("/employees/:id/leave-balance")
    .asUPDATE(EmployeeController.updateLeaveBalance)
    .useAdminAuth()
    .build()

    /**
     * -------------------------------------
     * Leave Management Routes
     * -------------------------------------
     */
    .addPath("/leaves")
    .asGET(AdminLeaveController.getAllLeaves)
    .useAdminAuth()
    .build()

    .addPath("/leaves/pending")
    .asGET(AdminLeaveController.getPendingLeaves)
    .useAdminAuth()
    .build()

    .addPath("/leaves/stats")
    .asGET(AdminLeaveController.getLeaveDashboardStats)
    .useAdminAuth()
    .build()

    .addPath("/leaves/:id")
    .asGET(AdminLeaveController.getLeaveById)
    .useAdminAuth()
    .build()

    .addPath("/leaves/:id")
    .asUPDATE(AdminLeaveController.updateLeaveRequest)
    .useAdminAuth()
    .build()

    .addPath("/leaves/:id/approve")
    .asPOST(AdminLeaveController.approveLeave)
    .useAdminAuth()
    .build()

    .addPath("/leaves/:id/reject")
    .asPOST(AdminLeaveController.rejectLeave)
    .useAdminAuth()
    .build()

    .addPath("/leaves/:id/cancel")
    .asPOST(AdminLeaveController.cancelLeave)
    .useAdminAuth()
    .build()

    .addPath("/employees/:employeeId/leaves/summary")
    .asGET(AdminLeaveController.getEmployeeLeaveSummary)
    .useAdminAuth()
    .build()

    /**
     * -------------------------------------
     * Attendance Management Routes
     * -------------------------------------
     */
    .addPath("/attendance")
    .asGET(AdminAttendanceController.getAllAttendance)
    .useAdminAuth()
    .build()

    .addPath("/attendance/daily")
    .asGET(AdminAttendanceController.getDailyAttendanceOverview)
    .useAdminAuth()
    .build()

    .addPath("/attendance/today")
    .asGET(AdminAttendanceController.getTodayAttendanceOverview)
    .useAdminAuth()
    .build()

    .addPath("/attendance/stats")
    .asGET(AdminAttendanceController.getAttendanceDashboardStats)
    .useAdminAuth()
    .build()

    .addPath("/attendance/summary")
    .asGET(AdminAttendanceController.getAttendanceSummary)
    .useAdminAuth()
    .build()

    .addPath("/attendance/:id")
    .asUPDATE(AdminAttendanceController.updateAttendance)
    .useAdminAuth()
    .build()

    .addPath("/attendance/:id")
    .asDELETE(AdminAttendanceController.deleteAttendance)
    .useAdminAuth()
    .build()

    .addPath("/employees/:employeeId/attendance")
    .asGET(AdminAttendanceController.getEmployeeAttendance)
    .useAdminAuth()
    .build()

    .addPath("/employees/:employeeId/attendance/monthly")
    .asGET(AdminAttendanceController.getEmployeeMonthlyAttendance)
    .useAdminAuth()
    .build()

    .addPath("/employees/:employeeId/attendance/stats")
    .asGET(AdminAttendanceController.getEmployeeAttendanceStats)
    .useAdminAuth()
    .build()

    .getRouter();

module.exports = router;
