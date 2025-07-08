const AttendanceService = require("../../db/services/AttendanceService");
const { TableFields, ValidationMsgs } = require("../../utils/constants");
const ValidationError = require("../../utils/ValidationError");

// Check in
exports.checkIn = async (req) => {
    const employeeId = req.user[TableFields.ID];
    return await AttendanceService.checkIn(employeeId);
};

// Check out
exports.checkOut = async (req) => {
    const employeeId = req.user[TableFields.ID];
    return await AttendanceService.checkOut(employeeId);
};

// Get today's attendance
exports.getTodayAttendance = async (req) => {
    const employeeId = req.user[TableFields.ID];
    return await AttendanceService.getTodayAttendance(employeeId);
};

// Get attendance records for the employee
exports.getMyAttendance = async (req) => {
    const employeeId = req.user[TableFields.ID];
    const { startDate, endDate } = req.query;

    return await AttendanceService.getAttendanceByEmployee(employeeId, startDate, endDate);
};

// Get monthly attendance
exports.getMonthlyAttendance = async (req) => {
    const employeeId = req.user[TableFields.ID];
    const { year, month } = req.query;

    const currentYear = year ? parseInt(year) : new Date().getFullYear();
    const currentMonth = month ? parseInt(month) : new Date().getMonth() + 1;

    return await AttendanceService.getMonthlyAttendance(employeeId, currentYear, currentMonth);
};

// Get monthly working hours
exports.getMonthlyWorkingHours = async (req) => {
    const employeeId = req.user[TableFields.ID];
    const { year, month } = req.query;

    const currentYear = year ? parseInt(year) : new Date().getFullYear();
    const currentMonth = month ? parseInt(month) : new Date().getMonth() + 1;

    const totalHours = await AttendanceService.getMonthlyWorkingHours(employeeId, currentYear, currentMonth);
    
    return {
        year: currentYear,
        month: currentMonth,
        totalHours,
    };
};

// Get attendance statistics for the employee
exports.getAttendanceStats = async (req) => {
    const employeeId = req.user[TableFields.ID];
    const { year, month } = req.query;

    return await AttendanceService.getEmployeeAttendanceStats(
        employeeId, 
        year ? parseInt(year) : null, 
        month ? parseInt(month) : null
    );
};

// Get current check-in status
exports.getCheckInStatus = async (req) => {
    const employeeId = req.user[TableFields.ID];
    return await AttendanceService.getCheckInStatus(employeeId);
}; 