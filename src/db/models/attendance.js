const mongoose = require("mongoose");
const { TableNames, TableFields, AttendanceStatus } = require("../../utils/constants");

const attendanceSchema = new mongoose.Schema(
    {
        [TableFields.employee]: {
            type: mongoose.Schema.Types.ObjectId,
            ref: TableNames.Employee,
            required: [true, "Employee is required"],
        },
        [TableFields.date]: {
            type: Date,
            required: [true, "Date is required"],
            default: () => {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                return today;
            },
        },
        [TableFields.checkInTime]: {
            type: Date,
        },
        [TableFields.checkOutTime]: {
            type: Date,
        },
        [TableFields.hoursWorked]: {
            type: Number,
            default: 0,
            min: 0,
        },
        [TableFields.attendanceStatus]: {
            type: Number,
            enum: Object.values(AttendanceStatus),
        },
    },
    {
        timestamps: true,
        toJSON: {
            transform: function (doc, ret) {
                delete ret.createdAt;
                delete ret.updatedAt;
                delete ret.__v;
            },
        },
    },
);

attendanceSchema.methods.calculateHoursWorked = function () {
    if (this[TableFields.checkInTime] && this[TableFields.checkOutTime]) {
        const checkIn = new Date(this[TableFields.checkInTime]);
        const checkOut = new Date(this[TableFields.checkOutTime]);
        const diffInMs = checkOut - checkIn;
        const diffInHours = diffInMs / (1000 * 60 * 60);
        return Math.round(diffInHours * 100) / 100;
    }
    return 0;
};

attendanceSchema.methods.getStatusName = function () {
    const statusNames = {
        [AttendanceStatus.CheckedIn]: "Checked In",
        [AttendanceStatus.CheckedOut]: "Checked Out",
    };
    return statusNames[this[TableFields.attendanceStatus]] || "Unknown";
};

attendanceSchema.pre("save", function (next) {
    if (this.isModified(TableFields.checkInTime) || this.isModified(TableFields.checkOutTime)) {
        this[TableFields.hoursWorked] = this.calculateHoursWorked();
    }
    next();
});

attendanceSchema.statics.getMonthlyAttendance = function (employeeId, year, month) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    endDate.setHours(23, 59, 59, 999);
    
    return this.find({
        [TableFields.employee]: employeeId,
        [TableFields.date]: {
            $gte: startDate,
            $lte: endDate,
        },
    }).sort({ [TableFields.date]: 1 });
};

attendanceSchema.statics.getMonthlyWorkingHours = async function (employeeId, year, month) {
    const attendanceRecords = await this.getMonthlyAttendance(employeeId, year, month);
    return attendanceRecords.reduce((total, record) => total + (record[TableFields.hoursWorked] || 0), 0);
};

attendanceSchema.index(
    { [TableFields.employee]: 1, [TableFields.date]: 1 },
    { unique: true }
);

attendanceSchema.index({ [TableFields.employee]: 1 });
attendanceSchema.index({ [TableFields.date]: 1 });
attendanceSchema.index({ [TableFields.attendanceStatus]: 1 });

const Attendance = mongoose.model(TableNames.Attendance, attendanceSchema);

module.exports = Attendance; 