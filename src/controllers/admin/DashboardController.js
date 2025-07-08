const Employee = require("../../db/models/employee");
const Leave = require("../../db/models/leave");
const Attendance = require("../../db/models/attendance");
const { TableFields, LeaveStatus, AttendanceStatus } = require("../../utils/constants");
const moment = require("moment");

class DashboardController {
    /**
     * Get aggregated dashboard statistics
     * Combines employee stats, leave stats, attendance stats, and recent data
     */
    static async getDashboardStats(req) {
        try {
            const today = moment().startOf('day').toDate();
            const thisMonth = moment().startOf('month').toDate();
            const thisYear = moment().startOf('year').toDate();

            // Run all aggregations in parallel for better performance
            const [
                employeeStats,
                leaveStats,
                attendanceStats,
                pendingLeaves,
                todayAttendance,
                recentEmployees
            ] = await Promise.all([
                // Employee Statistics
                Employee.aggregate([
                    {
                        $group: {
                            _id: null,
                            total: { $sum: 1 },
                            active: {
                                $sum: {
                                    $cond: [{ $eq: [`$${TableFields.active}`, true] }, 1, 0]
                                }
                            },
                            thisMonth: {
                                $sum: {
                                    $cond: [
                                        { $gte: [`$${TableFields.joinDate}`, thisMonth] },
                                        1,
                                        0
                                    ]
                                }
                            }
                        }
                    },
                    {
                        $project: {
                            _id: 0,
                            total: 1,
                            active: 1,
                            inactive: { $subtract: ["$total", "$active"] },
                            newThisMonth: "$thisMonth"
                        }
                    }
                ]),

                // Leave Statistics
                Leave.aggregate([
                    {
                        $group: {
                                                    _id: `$${TableFields.status}`,
                        count: { $sum: 1 },
                        totalDays: { $sum: `$${TableFields.totalDays}` }
                        }
                    },
                    {
                        $group: {
                            _id: null,
                                                    total: { $sum: "$count" },
                        totalDays: { $sum: `$${TableFields.totalDays}` },
                            statusBreakdown: {
                                $push: {
                                    status: "$_id",
                                    count: "$count",
                                    days: "$totalDays"
                                }
                            }
                        }
                    },
                    {
                        $project: {
                            _id: 0,
                            total: 1,
                            totalDays: 1,
                            pending: {
                                $arrayElemAt: [
                                    {
                                        $map: {
                                            input: {
                                                $filter: {
                                                    input: "$statusBreakdown",
                                                    cond: { $eq: ["$$this.status", LeaveStatus.Pending] }
                                                }
                                            },
                                            in: "$$this.count"
                                        }
                                    },
                                    0
                                ]
                            },
                            approved: {
                                $arrayElemAt: [
                                    {
                                        $map: {
                                            input: {
                                                $filter: {
                                                    input: "$statusBreakdown",
                                                    cond: { $eq: ["$$this.status", LeaveStatus.Approved] }
                                                }
                                            },
                                            in: "$$this.count"
                                        }
                                    },
                                    0
                                ]
                            },
                            rejected: {
                                $arrayElemAt: [
                                    {
                                        $map: {
                                            input: {
                                                $filter: {
                                                    input: "$statusBreakdown",
                                                    cond: { $eq: ["$$this.status", LeaveStatus.Rejected] }
                                                }
                                            },
                                            in: "$$this.count"
                                        }
                                    },
                                    0
                                ]
                            }
                        }
                    }
                ]),

                Attendance.aggregate([
                    {
                        $match: {
                            [TableFields.date]: { $gte: today }
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            totalToday: { $sum: 1 },
                            checkedIn: {
                                $sum: {
                                                                    $cond: [
                                    { $ne: [`$${TableFields.checkInTime}`, null] },
                                    1,
                                    0
                                ]
                                }
                            },
                            checkedOut: {
                                $sum: {
                                                                    $cond: [
                                    { $ne: [`$${TableFields.checkOutTime}`, null] },
                                    1,
                                    0
                                ]
                                }
                            },
                            avgHours: {
                                $avg: {
                                    $cond: [
                                        {
                                                                                $and: [
                                        { $ne: [`$${TableFields.checkInTime}`, null] },
                                        { $ne: [`$${TableFields.checkOutTime}`, null] }
                                    ]
                                        },
                                        {
                                                                            $divide: [
                                    { $subtract: [`$${TableFields.checkOutTime}`, `$${TableFields.checkInTime}`] },
                                    3600000 // Convert milliseconds to hours
                                ]
                                        },
                                        0
                                    ]
                                }
                            }
                        }
                    },
                    {
                        $project: {
                            _id: 0,
                            totalToday: 1,
                            checkedIn: 1,
                            checkedOut: 1,
                            stillWorking: { $subtract: ["$checkedIn", "$checkedOut"] },
                            avgHours: { $round: ["$avgHours", 2] }
                        }
                    }
                ]),

                // Pending Leaves (last 5)
                Leave.find({ [TableFields.status]: LeaveStatus.Pending })
                    .populate(TableFields.employee, `${TableFields.name_} ${TableFields.employeeId} ${TableFields.email}`)
                    .sort({ _createdAt: -1 })
                    .limit(5)
                    .lean(),

                // Today's Attendance (last 10 check-ins)
                Attendance.find({ 
                    [TableFields.date]: { $gte: today },
                    [TableFields.checkInTime]: { $ne: null }
                })
                    .populate(TableFields.employee, `${TableFields.name_} ${TableFields.employeeId}`)
                    .sort({ [TableFields.checkInTime]: -1 })
                    .limit(10)
                    .lean(),

                // Recent Employees (last 5)
                Employee.find({ [TableFields.active]: true })
                    .sort({ [TableFields.joinDate]: -1 })
                    .limit(5)
                    .select(`${TableFields.name_} ${TableFields.employeeId} ${TableFields.email} ${TableFields.department} ${TableFields.joinDate}`)
                    .lean()
            ]);

            // Process and format the aggregated data
            const dashboardData = {
                employees: {
                    total: employeeStats[0]?.total || 0,
                    active: employeeStats[0]?.active || 0,
                    inactive: employeeStats[0]?.inactive || 0,
                    newThisMonth: employeeStats[0]?.newThisMonth || 0
                },
                leaves: {
                    total: leaveStats[0]?.total || 0,
                    totalDays: leaveStats[0]?.totalDays || 0,
                    pending: leaveStats[0]?.pending || 0,
                    approved: leaveStats[0]?.approved || 0,
                    rejected: leaveStats[0]?.rejected || 0
                },
                attendance: {
                    todayTotal: attendanceStats[0]?.totalToday || 0,
                    checkedIn: attendanceStats[0]?.checkedIn || 0,
                    checkedOut: attendanceStats[0]?.checkedOut || 0,
                    stillWorking: attendanceStats[0]?.stillWorking || 0,
                    avgHoursToday: attendanceStats[0]?.avgHours || 0
                },
                recent: {
                    pendingLeaves: pendingLeaves || [],
                    todayAttendance: todayAttendance || [],
                    newEmployees: recentEmployees || []
                },
                summary: {
                    attendanceRate: employeeStats[0]?.total > 0 
                        ? Math.round((attendanceStats[0]?.checkedIn || 0) / employeeStats[0].total * 100)
                        : 0,
                    leaveUtilization: employeeStats[0]?.total > 0
                        ? Math.round((leaveStats[0]?.totalDays || 0) / (employeeStats[0].total * 20) * 100) // Assuming 20 days annual leave
                        : 0
                }
            };

            return dashboardData;
        } catch (error) {
            console.error("Error fetching dashboard stats:", error);
            throw error;
        }
    }

    /**
     * Get quick stats for mobile or simplified dashboard
     */
    static async getQuickStats(req) {
        try {
            const today = moment().startOf('day').toDate();

            const [employeeCount, pendingLeaves, todayAttendance] = await Promise.all([
                Employee.countDocuments({ [TableFields.active]: true }),
                Leave.countDocuments({ [TableFields.status]: LeaveStatus.Pending }),
                Attendance.countDocuments({ 
                    [TableFields.date]: { $gte: today },
                    [TableFields.checkInTime]: { $ne: null }
                })
            ]);

            const quickStats = {
                activeEmployees: employeeCount,
                pendingLeaves,
                todayAttendance,
                lastUpdated: new Date()
            };

            return quickStats;
        } catch (error) {
            console.error("Error fetching quick stats:", error);
            throw error;
        }
    }
}

module.exports = DashboardController; 