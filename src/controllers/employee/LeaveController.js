const LeaveService = require("../../db/services/LeaveService");
const { TableFields, ValidationMsgs, UserTypes } = require("../../utils/constants");
const ValidationError = require("../../utils/ValidationError");

// Create a new leave request
exports.createLeaveRequest = async (req) => {
    const employeeId = req.user[TableFields.ID];
    const leaveData = {
        startDate: req.body[TableFields.startDate],
        endDate: req.body[TableFields.endDate],
        leaveType: req.body[TableFields.leaveType],
        reason: req.body[TableFields.reason],
    };

    return await LeaveService.createLeaveRequest(employeeId, leaveData);
};

// Get all leave requests for the logged-in employee
exports.getMyLeaves = async (req) => {
    const employeeId = req.user[TableFields.ID];
    const { status, year } = req.query;
    
    const filters = {};
    if (status) {
        filters[TableFields.status] = parseInt(status);
    }
    
    if (year) {
        const startDate = new Date(year, 0, 1);
        const endDate = new Date(year, 11, 31, 23, 59, 59);
        filters[TableFields.startDate] = { $gte: startDate, $lte: endDate };
    }

    return await LeaveService.getLeavesByEmployee(employeeId, filters);
};

// Get leave request by ID (employee can only view their own)
exports.getLeaveById = async (req) => {
    const leaveId = req.params.id;
    const employeeId = req.user[TableFields.ID];

    const leave = await LeaveService.getLeaveById(leaveId);
    
    // Check if the leave belongs to the logged-in employee
    if (leave[TableFields.employee]._id.toString() !== employeeId) {
        throw new ValidationError(ValidationMsgs.UnauthorizedAccess);
    }

    return leave;
};

// Update leave request (only pending requests)
exports.updateLeaveRequest = async (req) => {
    const leaveId = req.params.id;
    const employeeId = req.user[TableFields.ID];
    
    const updateData = {
        startDate: req.body[TableFields.startDate],
        endDate: req.body[TableFields.endDate],
        leaveType: req.body[TableFields.leaveType],
        reason: req.body[TableFields.reason],
    };

    // Remove undefined values
    Object.keys(updateData).forEach(key => {
        if (updateData[key] === undefined) {
            delete updateData[key];
        }
    });

    return await LeaveService.updateLeaveRequest(leaveId, updateData, employeeId, false);
};

exports.cancelLeave = async (req) => {
    const leaveId = req.params.id;
    const employeeId = req.user[TableFields.ID];

    return await LeaveService.cancelLeave(leaveId, employeeId, false);
};

exports.getLeaveSummary = async (req) => {
    const employeeId = req.user[TableFields.ID];
    const { year } = req.query;

    return await LeaveService.getLeaveSummary(employeeId, year ? parseInt(year) : null);
};

exports.getLeaveBalance = async (req) => {
    const employee = req.user;
    
    return {
        currentBalance: employee[TableFields.leaveBalance],
        employeeId: employee[TableFields.employeeId],
        joinDate: employee[TableFields.joinDate],
    };
}; 