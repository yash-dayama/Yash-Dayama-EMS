const API = require("../utils/apiBuilder");
const employeeAuth = require("../middleware/employeeAuth");

const AuthController = require("../controllers/employee/AuthController");
const LeaveController = require("../controllers/employee/LeaveController");
const AttendanceController = require("../controllers/employee/AttendanceController");

const addEmployeeAuth = (builder) => {
    return builder.userMiddlewares(employeeAuth);
};

const router = API.configRoute("/employee")
    /**
     * -------------------------------------
     * Auth Routes
     * -------------------------------------
     */
    .addPath("/auth/login")
    .asPOST(AuthController.login)
    .build()

    .addPath("/auth/forgot-password")
    .asPOST(AuthController.forgotPassword)
    .build()

    .addPath("/auth/verify-reset-code")
    .asPOST(AuthController.forgotPasswordCodeExists)
    .build()

    .addPath("/auth/reset-password")
    .asPOST(AuthController.resetPassword)
    .build()

    .addPath("/auth/logout")
    .asPOST(AuthController.logout)
    .userMiddlewares(employeeAuth)
    .build()

    .addPath("/auth/change-password")
    .asUPDATE(AuthController.changePassword)
    .userMiddlewares(employeeAuth)
    .build()

    /**
     * -------------------------------------
     * Leave Management Routes
     * -------------------------------------
     */
    .addPath("/leaves")
    .asPOST(LeaveController.createLeaveRequest)
    .userMiddlewares(employeeAuth)
    .build()

    .addPath("/leaves")
    .asGET(LeaveController.getMyLeaves)
    .userMiddlewares(employeeAuth)
    .build()

    .addPath("/leaves/summary")
    .asGET(LeaveController.getLeaveSummary)
    .userMiddlewares(employeeAuth)
    .build()

    .addPath("/leaves/balance")
    .asGET(LeaveController.getLeaveBalance)
    .userMiddlewares(employeeAuth)
    .build()

    .addPath("/leaves/:id")
    .asGET(LeaveController.getLeaveById)
    .userMiddlewares(employeeAuth)
    .build()

    .addPath("/leaves/:id")
    .asUPDATE(LeaveController.updateLeaveRequest)
    .userMiddlewares(employeeAuth)
    .build()

    .addPath("/leaves/:id/cancel")
    .asPOST(LeaveController.cancelLeave)
    .userMiddlewares(employeeAuth)
    .build()

    /**
     * -------------------------------------
     * Attendance Routes
     * -------------------------------------
     */
    .addPath("/attendance/check-in")
    .asPOST(AttendanceController.checkIn)
    .userMiddlewares(employeeAuth)
    .build()

    .addPath("/attendance/check-out")
    .asPOST(AttendanceController.checkOut)
    .userMiddlewares(employeeAuth)
    .build()

    .addPath("/attendance/today")
    .asGET(AttendanceController.getTodayAttendance)
    .userMiddlewares(employeeAuth)
    .build()

    .addPath("/attendance/status")
    .asGET(AttendanceController.getCheckInStatus)
    .userMiddlewares(employeeAuth)
    .build()

    .addPath("/attendance")
    .asGET(AttendanceController.getMyAttendance)
    .userMiddlewares(employeeAuth)
    .build()

    .addPath("/attendance/monthly")
    .asGET(AttendanceController.getMonthlyAttendance)
    .userMiddlewares(employeeAuth)
    .build()

    .addPath("/attendance/monthly/hours")
    .asGET(AttendanceController.getMonthlyWorkingHours)
    .userMiddlewares(employeeAuth)
    .build()

    .addPath("/attendance/stats")
    .asGET(AttendanceController.getAttendanceStats)
    .userMiddlewares(employeeAuth)
    .build()

    .getRouter();

module.exports = router; 