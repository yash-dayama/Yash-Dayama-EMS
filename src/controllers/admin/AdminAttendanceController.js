const AttendanceService = require("../../db/services/AttendanceService");
const { TableFields, ValidationMsgs } = require("../../utils/constants");
const ValidationError = require("../../utils/ValidationError");

exports.getAllAttendance = async (req) => {
    const { employeeId, startDate, endDate, department } = req.query;
    
    const filters = {};
    if (employeeId) {
        filters[TableFields.employee] = employeeId;
    }

    let attendance = await AttendanceService.getAllAttendance(filters, startDate, endDate);

    if (department) {
        attendance = attendance.filter(record => 
            record[TableFields.employee] && 
            record[TableFields.employee][TableFields.department] === department
        );
    }

    return attendance;
};

exports.getDailyAttendanceOverview = async (req) => {
    const { date } = req.query;
    return await AttendanceService.getDailyAttendanceOverview(date);
};

exports.getEmployeeAttendance = async (req) => {
    const employeeId = req.params.employeeId;
    const { startDate, endDate } = req.query;

    return await AttendanceService.getAttendanceByEmployee(employeeId, startDate, endDate);
};

exports.getEmployeeMonthlyAttendance = async (req) => {
    const employeeId = req.params.employeeId;
    const { year, month } = req.query;

    const currentYear = year ? parseInt(year) : new Date().getFullYear();
    const currentMonth = month ? parseInt(month) : new Date().getMonth() + 1;

    return await AttendanceService.getMonthlyAttendance(employeeId, currentYear, currentMonth);
};

exports.getEmployeeAttendanceStats = async (req) => {
    const employeeId = req.params.employeeId;
    const { year, month } = req.query;

    return await AttendanceService.getEmployeeAttendanceStats(
        employeeId, 
        year ? parseInt(year) : null, 
        month ? parseInt(month) : null
    );
};

exports.updateAttendance = async (req) => {
    const attendanceId = req.params.id;
    
    const updateData = {
        [TableFields.checkInTime]: req.body[TableFields.checkInTime],
        [TableFields.checkOutTime]: req.body[TableFields.checkOutTime],
        [TableFields.date]: req.body[TableFields.date],
    };

    Object.keys(updateData).forEach(key => {
        if (updateData[key] === undefined) {
            delete updateData[key];
        }
    });

    return await AttendanceService.updateAttendance(attendanceId, updateData);
};

exports.deleteAttendance = async (req) => {
    const attendanceId = req.params.id;
    return await AttendanceService.deleteAttendance(attendanceId);
};

exports.getAttendanceSummary = async (req) => {
    const { startDate, endDate } = req.query;
    return await AttendanceService.getAttendanceSummary(startDate, endDate);
};

exports.getAttendanceDashboardStats = async (req) => {
    const { year, month } = req.query;
    
    let startDate, endDate;
    if (year && month) {
        startDate = new Date(year, month - 1, 1);
        endDate = new Date(year, month, 0, 23, 59, 59);
    } else if (year) {
        startDate = new Date(year, 0, 1);
        endDate = new Date(year, 11, 31, 23, 59, 59);
    } else {
        const now = new Date();
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    }

    const attendanceRecords = await AttendanceService.getAllAttendance({}, 
        startDate.toISOString().split('T')[0], 
        endDate.toISOString().split('T')[0]
    );
    
    const stats = {
        totalRecords: attendanceRecords.length,
        totalEmployeesWithAttendance: new Set(attendanceRecords.map(r => r[TableFields.employee]._id.toString())).size,
        totalHoursWorked: 0,
        averageHoursPerDay: 0,
        departmentWise: {},
        dailyStats: {},
        topPerformers: [],
    };

    attendanceRecords.forEach(record => {
        const hoursWorked = record[TableFields.hoursWorked] || 0;
        const employee = record[TableFields.employee];
        const department = employee ? employee[TableFields.department] : 'Unknown';
        const date = record[TableFields.date].toISOString().split('T')[0];

        stats.totalHoursWorked += hoursWorked;

        if (!stats.departmentWise[department]) {
            stats.departmentWise[department] = {
                totalRecords: 0,
                totalHours: 0,
                averageHours: 0,
                employees: new Set(),
            };
        }
        
        stats.departmentWise[department].totalRecords++;
        stats.departmentWise[department].totalHours += hoursWorked;
        stats.departmentWise[department].employees.add(employee._id.toString());

        if (!stats.dailyStats[date]) {
            stats.dailyStats[date] = {
                totalEmployees: 0,
                totalHours: 0,
                averageHours: 0,
            };
        }
        
        stats.dailyStats[date].totalEmployees++;
        stats.dailyStats[date].totalHours += hoursWorked;
    });

    if (stats.totalRecords > 0) {
        stats.averageHoursPerDay = Math.round((stats.totalHoursWorked / stats.totalRecords) * 100) / 100;
    }

    Object.keys(stats.departmentWise).forEach(dept => {
        const deptStats = stats.departmentWise[dept];
        deptStats.averageHours = deptStats.totalRecords > 0 ? 
            Math.round((deptStats.totalHours / deptStats.totalRecords) * 100) / 100 : 0;
        deptStats.employees = deptStats.employees.size;
    });

    Object.keys(stats.dailyStats).forEach(date => {
        const dayStats = stats.dailyStats[date];
        dayStats.averageHours = dayStats.totalEmployees > 0 ? 
            Math.round((dayStats.totalHours / dayStats.totalEmployees) * 100) / 100 : 0;
    });

    const employeeHours = {};
    attendanceRecords.forEach(record => {
        const employeeId = record[TableFields.employee]._id.toString();
        const employee = record[TableFields.employee];
        const hoursWorked = record[TableFields.hoursWorked] || 0;

        if (!employeeHours[employeeId]) {
            employeeHours[employeeId] = {
                employee: employee,
                totalHours: 0,
                totalDays: 0,
                averageHours: 0,
            };
        }

        employeeHours[employeeId].totalHours += hoursWorked;
        employeeHours[employeeId].totalDays++;
    });

    stats.topPerformers = Object.values(employeeHours)
        .map(emp => {
            emp.averageHours = emp.totalDays > 0 ? 
                Math.round((emp.totalHours / emp.totalDays) * 100) / 100 : 0;
            return emp;
        })
        .sort((a, b) => b.averageHours - a.averageHours)
        .slice(0, 10);

    return stats;
};

exports.getTodayAttendanceOverview = async (req) => {
    return await AttendanceService.getDailyAttendanceOverview();
}; 