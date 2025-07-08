const LeaveService = require("../../db/services/LeaveService");
const { TableFields, ValidationMsgs, LeaveStatus } = require("../../utils/constants");
const ValidationError = require("../../utils/ValidationError");

exports.getAllLeaves = async (req) => {
    const { status, employeeId, startDate, endDate, department } = req.query;
    
    const filters = {};
    if (status) {
        filters[TableFields.status] = parseInt(status);
    }
    if (employeeId) {
        filters[TableFields.employee] = employeeId;
    }

    let leaves;
    if (startDate || endDate) {
        leaves = await LeaveService.getLeavesByDateRange(
            startDate ? new Date(startDate) : null,
            endDate ? new Date(endDate) : null,
            filters
        );
    } else {
        leaves = await LeaveService.getAllLeaves(filters);
    }

    if (department) {
        leaves = leaves.filter(leave => 
            leave[TableFields.employee] && 
            leave[TableFields.employee][TableFields.department] === department
        );
    }

    return leaves;
};

exports.getPendingLeaves = async (req) => {
    return await LeaveService.getPendingLeaves();
};

exports.getLeaveById = async (req) => {
    const leaveId = req.params.id;
    return await LeaveService.getLeaveById(leaveId);
};

exports.approveLeave = async (req) => {
    const leaveId = req.params.id;
    const adminId = req.user[TableFields.ID];

    return await LeaveService.approveLeave(leaveId, adminId);
};

exports.rejectLeave = async (req) => {
    const leaveId = req.params.id;
    const adminId = req.user[TableFields.ID];

    return await LeaveService.rejectLeave(leaveId, adminId);
};

exports.updateLeaveRequest = async (req) => {
    const leaveId = req.params.id;
    const adminId = req.user[TableFields.ID];
    
    const updateData = {
        startDate: req.body[TableFields.startDate],
        endDate: req.body[TableFields.endDate],
        leaveType: req.body[TableFields.leaveType],
        reason: req.body[TableFields.reason],
    };

    Object.keys(updateData).forEach(key => {
        if (updateData[key] === undefined) {
            delete updateData[key];
        }
    });

    return await LeaveService.updateLeaveRequest(leaveId, updateData, adminId, true);
};

exports.cancelLeave = async (req) => {
    const leaveId = req.params.id;
    const adminId = req.user[TableFields.ID];

    return await LeaveService.cancelLeave(leaveId, adminId, true);
};

exports.getLeaveDashboardStats = async (req) => {
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

    const allLeaves = await LeaveService.getLeavesByDateRange(startDate, endDate);
    
    const stats = {
        totalRequests: allLeaves.length,
        pendingRequests: 0,
        approvedRequests: 0,
        rejectedRequests: 0,
        totalDaysRequested: 0,
        totalDaysApproved: 0,
        departmentWise: {},
        typeWise: {},
        recentRequests: [],
    };

    allLeaves.forEach(leave => {
        const status = leave[TableFields.status];
        const days = leave[TableFields.totalDays];
        const leaveType = leave[TableFields.leaveType];
        const employee = leave[TableFields.employee];
        const department = employee ? employee[TableFields.department] : 'Unknown';

        stats.totalDaysRequested += days;

        if (status === LeaveStatus.Pending) {
            stats.pendingRequests++;
        } else if (status === LeaveStatus.Approved) {
            stats.approvedRequests++;
            stats.totalDaysApproved += days;
        } else if (status === LeaveStatus.Rejected) {
            stats.rejectedRequests++;
        }

        if (!stats.departmentWise[department]) {
            stats.departmentWise[department] = {
                total: 0,
                pending: 0,
                approved: 0,
                rejected: 0,
                totalDays: 0,
            };
        }
        
        stats.departmentWise[department].total++;
        stats.departmentWise[department].totalDays += days;
        
        if (status === LeaveStatus.Pending) {
            stats.departmentWise[department].pending++;
        } else if (status === LeaveStatus.Approved) {
            stats.departmentWise[department].approved++;
        } else if (status === LeaveStatus.Rejected) {
            stats.departmentWise[department].rejected++;
        }

        if (!stats.typeWise[leaveType]) {
            stats.typeWise[leaveType] = {
                total: 0,
                totalDays: 0,
                approved: 0,
                approvedDays: 0,
            };
        }
        
        stats.typeWise[leaveType].total++;
        stats.typeWise[leaveType].totalDays += days;
        
        if (status === LeaveStatus.Approved) {
            stats.typeWise[leaveType].approved++;
            stats.typeWise[leaveType].approvedDays += days;
        }
    });

    stats.recentRequests = allLeaves
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 10)
        .map(leave => ({
            _id: leave._id,
            employee: leave[TableFields.employee],
            startDate: leave[TableFields.startDate],
            endDate: leave[TableFields.endDate],
            totalDays: leave[TableFields.totalDays],
            leaveType: leave[TableFields.leaveType],
            status: leave[TableFields.status],
            createdAt: leave.createdAt,
        }));

    return stats;
};

exports.getEmployeeLeaveSummary = async (req) => {
    const employeeId = req.params.employeeId;
    const { year } = req.query;

    return await LeaveService.getLeaveSummary(employeeId, year ? parseInt(year) : null);
}; 