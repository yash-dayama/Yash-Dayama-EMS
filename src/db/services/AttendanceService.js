const { TableFields, ValidationMsgs, AttendanceStatus } = require("../../utils/constants");
const ValidationError = require("../../utils/ValidationError");
const Attendance = require("../models/attendance");
const moment = require("moment");

class AttendanceService {
    static checkIn = async (employeeId) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const existingAttendance = await Attendance.findOne({
            [TableFields.employee]: employeeId,
            [TableFields.date]: today,
        });

        if (existingAttendance && existingAttendance[TableFields.checkInTime]) {
            throw new ValidationError(ValidationMsgs.AlreadyCheckedIn);
        }

        const checkInTime = new Date();

        if (existingAttendance) {
            existingAttendance[TableFields.checkInTime] = checkInTime;
            existingAttendance[TableFields.attendanceStatus] = AttendanceStatus.CheckedIn;
            return await existingAttendance.save();
        } else {
            const attendance = new Attendance({
                [TableFields.employee]: employeeId,
                [TableFields.date]: today,
                [TableFields.checkInTime]: checkInTime,
                [TableFields.attendanceStatus]: AttendanceStatus.CheckedIn,
            });

            return await attendance.save();
        }
    };

    static checkOut = async (employeeId) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const attendance = await Attendance.findOne({
            [TableFields.employee]: employeeId,
            [TableFields.date]: today,
        });

        if (!attendance || !attendance[TableFields.checkInTime]) {
            throw new ValidationError(ValidationMsgs.NotCheckedIn);
        }

        if (attendance[TableFields.checkOutTime]) {
            throw new ValidationError(ValidationMsgs.AlreadyCheckedOut);
        }

        const checkOutTime = new Date();
        attendance[TableFields.checkOutTime] = checkOutTime;
        attendance[TableFields.attendanceStatus] = AttendanceStatus.CheckedOut;

        return await attendance.save();
    };

    static getTodayAttendance = async (employeeId) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return await Attendance.findOne({
            [TableFields.employee]: employeeId,
            [TableFields.date]: today,
        });
    };

    static getAttendanceByEmployee = async (employeeId, startDate, endDate) => {
        const query = {
            [TableFields.employee]: employeeId,
        };

        if (startDate || endDate) {
            query[TableFields.date] = {};
            if (startDate) {
                query[TableFields.date].$gte = new Date(startDate);
            }
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                query[TableFields.date].$lte = end;
            }
        }

        return await Attendance.find(query)
            .populate(TableFields.employee, 'name email employeeId')
            .sort({ [TableFields.date]: -1 });
    };

    static getMonthlyAttendance = async (employeeId, year, month) => {
        return await Attendance.getMonthlyAttendance(employeeId, year, month);
    };

    static getMonthlyWorkingHours = async (employeeId, year, month) => {
        return await Attendance.getMonthlyWorkingHours(employeeId, year, month);
    };

    static getAllAttendance = async (filters = {}, startDate = null, endDate = null) => {
        const query = { ...filters };

        if (startDate || endDate) {
            query[TableFields.date] = {};
            if (startDate) {
                query[TableFields.date].$gte = new Date(startDate);
            }
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                query[TableFields.date].$lte = end;
            }
        }

        return await Attendance.find(query)
            .populate(TableFields.employee, 'name email employeeId department')
            .sort({ [TableFields.date]: -1 });
    };

    static getDailyAttendanceOverview = async (date = null) => {
        const targetDate = date ? new Date(date) : new Date();
        targetDate.setHours(0, 0, 0, 0);

        const attendanceRecords = await Attendance.find({
            [TableFields.date]: targetDate,
        }).populate(TableFields.employee, 'name email employeeId department');

        const overview = {
            date: targetDate,
            totalEmployees: attendanceRecords.length,
            checkedIn: 0,
            checkedOut: 0,
            presentEmployees: [],
            absentEmployees: [],
        };

        attendanceRecords.forEach(record => {
            if (record[TableFields.checkInTime]) {
                overview.checkedIn++;
                overview.presentEmployees.push({
                    employee: record[TableFields.employee],
                    checkInTime: record[TableFields.checkInTime],
                    checkOutTime: record[TableFields.checkOutTime],
                    hoursWorked: record[TableFields.hoursWorked],
                    status: record.getStatusName(),
                });
            }

            if (record[TableFields.checkOutTime]) {
                overview.checkedOut++;
            }
        });

        return overview;
    };

    static getEmployeeAttendanceStats = async (employeeId, year = null, month = null) => {
        const currentYear = year || new Date().getFullYear();
        const currentMonth = month || new Date().getMonth() + 1;

        const startDate = new Date(currentYear, currentMonth - 1, 1);
        const endDate = new Date(currentYear, currentMonth, 0);
        endDate.setHours(23, 59, 59, 999);

        const attendanceRecords = await Attendance.find({
            [TableFields.employee]: employeeId,
            [TableFields.date]: { $gte: startDate, $lte: endDate },
        }).populate(TableFields.employee, 'name email employeeId');

        const stats = {
            month: currentMonth,
            year: currentYear,
            totalWorkingDays: attendanceRecords.length,
            totalHoursWorked: 0,
            averageHoursPerDay: 0,
            daysPresent: 0,
            daysWithFullCheckInOut: 0,
            attendance: [],
        };

        attendanceRecords.forEach(record => {
            stats.totalHoursWorked += record[TableFields.hoursWorked] || 0;
            
            if (record[TableFields.checkInTime]) {
                stats.daysPresent++;
            }

            if (record[TableFields.checkInTime] && record[TableFields.checkOutTime]) {
                stats.daysWithFullCheckInOut++;
            }

            stats.attendance.push({
                date: record[TableFields.date],
                checkInTime: record[TableFields.checkInTime],
                checkOutTime: record[TableFields.checkOutTime],
                hoursWorked: record[TableFields.hoursWorked],
                status: record.getStatusName(),
            });
        });

        if (stats.daysPresent > 0) {
            stats.averageHoursPerDay = Math.round((stats.totalHoursWorked / stats.daysPresent) * 100) / 100;
        }

        return stats;
    };

    static updateAttendance = async (attendanceId, updateData) => {
        const attendance = await Attendance.findById(attendanceId);
        if (!attendance) {
            throw new ValidationError(ValidationMsgs.AttendanceNotFound);
        }

        const allowedFields = [TableFields.checkInTime, TableFields.checkOutTime, TableFields.date];
        const updates = {};

        allowedFields.forEach(field => {
            if (updateData[field] !== undefined) {
                updates[field] = updateData[field];
            }
        });

        Object.assign(attendance, updates);
        return await attendance.save();
    };

    static deleteAttendance = async (attendanceId) => {
        const attendance = await Attendance.findById(attendanceId);
        if (!attendance) {
            throw new ValidationError(ValidationMsgs.AttendanceNotFound);
        }

        return await Attendance.findByIdAndDelete(attendanceId);
    };

    static getAttendanceSummary = async (startDate, endDate) => {
        const query = {};
        
        if (startDate || endDate) {
            query[TableFields.date] = {};
            if (startDate) {
                query[TableFields.date].$gte = new Date(startDate);
            }
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                query[TableFields.date].$lte = end;
            }
        }

        const attendanceRecords = await Attendance.find(query)
            .populate(TableFields.employee, 'name email employeeId department');

        const summary = {};

        attendanceRecords.forEach(record => {
            const employeeId = record[TableFields.employee]._id.toString();
            
            if (!summary[employeeId]) {
                summary[employeeId] = {
                    employee: record[TableFields.employee],
                    totalDays: 0,
                    totalHours: 0,
                    averageHours: 0,
                };
            }

            summary[employeeId].totalDays++;
            summary[employeeId].totalHours += record[TableFields.hoursWorked] || 0;
        });

        Object.keys(summary).forEach(employeeId => {
            const emp = summary[employeeId];
            emp.averageHours = emp.totalDays > 0 ? 
                Math.round((emp.totalHours / emp.totalDays) * 100) / 100 : 0;
        });

        return Object.values(summary);
    };

    static isEmployeeCheckedIn = async (employeeId) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const attendance = await Attendance.findOne({
            [TableFields.employee]: employeeId,
            [TableFields.date]: today,
        });

        return attendance && 
               attendance[TableFields.checkInTime] && 
               !attendance[TableFields.checkOutTime];
    };

    static getCheckInStatus = async (employeeId) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const attendance = await Attendance.findOne({
            [TableFields.employee]: employeeId,
            [TableFields.date]: today,
        });

        const isCheckedIn = attendance && attendance[TableFields.checkInTime] ? true : false;
        const canCheckOut = attendance && attendance[TableFields.checkInTime] && !attendance[TableFields.checkOutTime];

        return {
            isCheckedIn,
            canCheckOut,
            checkInTime: attendance ? attendance[TableFields.checkInTime] : null,
            checkOutTime: attendance ? attendance[TableFields.checkOutTime] : null,
            hoursWorked: attendance ? attendance[TableFields.hoursWorked] : 0,
        };
    };
}

module.exports = AttendanceService; 