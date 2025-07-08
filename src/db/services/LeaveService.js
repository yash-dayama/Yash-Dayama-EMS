const { TableFields, ValidationMsgs, LeaveStatus, LeaveTypes } = require("../../utils/constants");
const ValidationError = require("../../utils/ValidationError");
const Leave = require("../models/leave");
const EmployeeService = require("./EmployeeService");
const moment = require("moment");

class LeaveService {
    static createLeaveRequest = async (employeeId, leaveData) => {
        const { startDate, endDate, leaveType, reason } = leaveData;

        if (!startDate) {
            throw new ValidationError(ValidationMsgs.LeaveStartDateRequired);
        }
        if (!endDate) {
            throw new ValidationError(ValidationMsgs.LeaveEndDateRequired);
        }
        if (!leaveType) {
            throw new ValidationError(ValidationMsgs.LeaveTypeRequired);
        }
        if (!reason) {
            throw new ValidationError(ValidationMsgs.LeaveReasonRequired);
        }

        const start = new Date(startDate);
        const end = new Date(endDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (start < today) {
            throw new ValidationError(ValidationMsgs.InvalidLeaveDate);
        }
        if (end < start) {
            throw new ValidationError(ValidationMsgs.InvalidDateRange);
        }

        const totalDays = Leave.calculateWorkingDays(start, end);

        if (leaveType === LeaveTypes.Vacation || leaveType === LeaveTypes.Sick) {
            const employee = await EmployeeService.getUserById(employeeId)
                .withLeaveInfo()
                .execute();

            if (!employee) {
                throw new ValidationError(ValidationMsgs.RecordNotFound);
            }

            if (employee[TableFields.leaveBalance] < totalDays) {
                throw new ValidationError(ValidationMsgs.InsufficientLeaveBalance);
            }
        }

        const leave = new Leave({
            [TableFields.employee]: employeeId,
            [TableFields.startDate]: start,
            [TableFields.endDate]: end,
            [TableFields.leaveType]: leaveType,
            [TableFields.reason]: reason,
            [TableFields.totalDays]: totalDays,
            [TableFields.status]: LeaveStatus.Pending,
        });

        return await leave.save();
    };

    static getLeavesByEmployee = async (employeeId, filters = {}) => {
        const query = { [TableFields.employee]: employeeId, ...filters };
        return await Leave.find(query)
            .populate(TableFields.employee, 'name email employeeId')
            .populate(TableFields.approvedBy, 'name email')
            .sort({ createdAt: -1 });
    };

    static getAllLeaves = async (filters = {}) => {
        return await Leave.find(filters)
            .populate(TableFields.employee, 'name email employeeId department')
            .populate(TableFields.approvedBy, 'name email')
            .sort({ createdAt: -1 });
    };

    static getPendingLeaves = async () => {
        return await Leave.find({ [TableFields.status]: LeaveStatus.Pending })
            .populate(TableFields.employee, 'name email employeeId department')
            .sort({ createdAt: 1 });
    };

    static getLeaveById = async (leaveId) => {
        const leave = await Leave.findById(leaveId)
            .populate(TableFields.employee, 'name email employeeId department')
            .populate(TableFields.approvedBy, 'name email');

        if (!leave) {
            throw new ValidationError(ValidationMsgs.LeaveNotFound);
        }

        return leave;
    };

    static approveLeave = async (leaveId, adminId) => {
        const leave = await Leave.findById(leaveId);
        if (!leave) {
            throw new ValidationError(ValidationMsgs.LeaveNotFound);
        }

        if (leave[TableFields.status] !== LeaveStatus.Pending) {
            throw new ValidationError("Leave request is already processed");
        }

        if (leave[TableFields.leaveType] === LeaveTypes.Vacation || 
            leave[TableFields.leaveType] === LeaveTypes.Sick) {
            await EmployeeService.deductLeaveBalance(
                leave[TableFields.employee],
                leave[TableFields.totalDays]
            );
        }

        leave[TableFields.status] = LeaveStatus.Approved;
        leave[TableFields.approvedBy] = adminId;
        leave[TableFields.approvedAt] = new Date();

        return await leave.save();
    };

    static rejectLeave = async (leaveId, adminId) => {
        const leave = await Leave.findById(leaveId);
        if (!leave) {
            throw new ValidationError(ValidationMsgs.LeaveNotFound);
        }

        if (leave[TableFields.status] !== LeaveStatus.Pending) {
            throw new ValidationError("Leave request is already processed");
        }

        leave[TableFields.status] = LeaveStatus.Rejected;
        leave[TableFields.approvedBy] = adminId;
        leave[TableFields.rejectedAt] = new Date();

        return await leave.save();
    };

    static cancelLeave = async (leaveId, userId, isAdmin = false) => {
        const leave = await Leave.findById(leaveId);
        if (!leave) {
            throw new ValidationError(ValidationMsgs.LeaveNotFound);
        }

        if (!isAdmin && leave[TableFields.employee].toString() !== userId) {
            throw new ValidationError(ValidationMsgs.UnauthorizedAccess);
        }

        if (leave[TableFields.status] !== LeaveStatus.Approved) {
            throw new ValidationError("Only approved leaves can be cancelled");
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (leave[TableFields.startDate] <= today) {
            throw new ValidationError("Cannot cancel leave that has already started");
        }

        if (leave[TableFields.leaveType] === LeaveTypes.Vacation || 
            leave[TableFields.leaveType] === LeaveTypes.Sick) {
            await EmployeeService.restoreLeaveBalance(
                leave[TableFields.employee],
                leave[TableFields.totalDays]
            );
        }

        leave[TableFields.status] = LeaveStatus.Pending;
        leave[TableFields.approvedBy] = undefined;
        leave[TableFields.approvedAt] = undefined;

        return await leave.save();
    };

    static getLeaveSummary = async (employeeId, year = null) => {
        const currentYear = year || new Date().getFullYear();
        const startDate = new Date(currentYear, 0, 1);
        const endDate = new Date(currentYear, 11, 31, 23, 59, 59);

        const leaves = await Leave.find({
            [TableFields.employee]: employeeId,
            [TableFields.startDate]: { $gte: startDate, $lte: endDate },
        });

        const summary = {
            totalRequested: 0,
            totalApproved: 0,
            totalRejected: 0,
            totalPending: 0,
            byType: {
                [LeaveTypes.Sick]: { requested: 0, approved: 0 },
                [LeaveTypes.Vacation]: { requested: 0, approved: 0 },
                [LeaveTypes.WorkFromHome]: { requested: 0, approved: 0 },
            },
        };

        leaves.forEach(leave => {
            const days = leave[TableFields.totalDays];
            const leaveType = leave[TableFields.leaveType];
            const status = leave[TableFields.status];

            summary.totalRequested += days;
            summary.byType[leaveType].requested += days;

            if (status === LeaveStatus.Approved) {
                summary.totalApproved += days;
                summary.byType[leaveType].approved += days;
            } else if (status === LeaveStatus.Rejected) {
                summary.totalRejected += days;
            } else if (status === LeaveStatus.Pending) {
                summary.totalPending += days;
            }
        });

        return summary;
    };

    static getLeavesByDateRange = async (startDate, endDate, filters = {}) => {
        const query = {
            $or: [
                {
                    [TableFields.startDate]: { $gte: startDate, $lte: endDate }
                },
                {
                    [TableFields.endDate]: { $gte: startDate, $lte: endDate }
                },
                {
                    [TableFields.startDate]: { $lte: startDate },
                    [TableFields.endDate]: { $gte: endDate }
                }
            ],
            ...filters
        };

        return await Leave.find(query)
            .populate(TableFields.employee, 'name email employeeId department')
            .populate(TableFields.approvedBy, 'name email')
            .sort({ [TableFields.startDate]: 1 });
    };

    static updateLeaveRequest = async (leaveId, updateData, userId, isAdmin = false) => {
        const leave = await Leave.findById(leaveId);
        if (!leave) {
            throw new ValidationError(ValidationMsgs.LeaveNotFound);
        }

        if (!isAdmin && leave[TableFields.employee].toString() !== userId) {
            throw new ValidationError(ValidationMsgs.UnauthorizedAccess);
        }

        if (leave[TableFields.status] !== LeaveStatus.Pending) {
            throw new ValidationError("Only pending leave requests can be updated");
        }

        const allowedFields = [TableFields.startDate, TableFields.endDate, TableFields.leaveType, TableFields.reason];
        const updates = {};
        
        allowedFields.forEach(field => {
            if (updateData[field] !== undefined) {
                updates[field] = updateData[field];
            }
        });

        if (updates[TableFields.startDate] || updates[TableFields.endDate]) {
            const startDate = updates[TableFields.startDate] || leave[TableFields.startDate];
            const endDate = updates[TableFields.endDate] || leave[TableFields.endDate];
            
            updates[TableFields.totalDays] = Leave.calculateWorkingDays(startDate, endDate);
        }

        Object.assign(leave, updates);
        return await leave.save();
    };
}

module.exports = LeaveService; 