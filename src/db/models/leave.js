const mongoose = require("mongoose");
const { TableNames, TableFields, LeaveTypes, LeaveStatus } = require("../../utils/constants");

const leaveSchema = new mongoose.Schema(
    {
        [TableFields.employee]: {
            type: mongoose.Schema.Types.ObjectId,
            ref: TableNames.Employee,
            required: [true, "Employee is required"],
        },
        [TableFields.startDate]: {
            type: Date,
            required: [true, "Start date is required"],
        },
        [TableFields.endDate]: {
            type: Date,
            required: [true, "End date is required"],
        },
        [TableFields.leaveType]: {
            type: Number,
            required: [true, "Leave type is required"],
            enum: Object.values(LeaveTypes),
        },
        [TableFields.reason]: {
            type: String,
            required: [true, "Reason is required"],
            trim: true,
            maxlength: 500,
        },
        [TableFields.status]: {
            type: Number,
            default: LeaveStatus.Pending,
            enum: Object.values(LeaveStatus),
        },
        [TableFields.totalDays]: {
            type: Number,
            required: true,
            min: 1,
        },
        [TableFields.approvedBy]: {
            type: mongoose.Schema.Types.ObjectId,
            ref: TableNames.Admin,
        },
        [TableFields.approvedAt]: {
            type: Date,
        },
        [TableFields.rejectedAt]: {
            type: Date,
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

leaveSchema.methods.getLeaveTypeName = function () {
    const leaveTypeNames = {
        [LeaveTypes.Sick]: "Sick Leave",
        [LeaveTypes.Vacation]: "Vacation",
        [LeaveTypes.WorkFromHome]: "Work From Home",
    };
    return leaveTypeNames[this[TableFields.leaveType]] || "Unknown";
};

leaveSchema.methods.getStatusName = function () {
    const statusNames = {
        [LeaveStatus.Pending]: "Pending",
        [LeaveStatus.Approved]: "Approved",
        [LeaveStatus.Rejected]: "Rejected",
    };
    return statusNames[this[TableFields.status]] || "Unknown";
};

leaveSchema.statics.calculateWorkingDays = function (startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    let workingDays = 0;
    
    const currentDate = new Date(start);
    while (currentDate <= end) {
        const dayOfWeek = currentDate.getDay();
        // 0 = Sunday, 6 = Saturday
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
            workingDays++;
        }
        currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return workingDays;
};

leaveSchema.pre("save", function (next) {
    if (this.isModified(TableFields.startDate) || this.isModified(TableFields.endDate)) {
        this[TableFields.totalDays] = this.constructor.calculateWorkingDays(
            this[TableFields.startDate],
            this[TableFields.endDate]
        );
    }
    next();
});

leaveSchema.index({ [TableFields.employee]: 1 });
leaveSchema.index({ [TableFields.status]: 1 });
leaveSchema.index({ [TableFields.startDate]: 1, [TableFields.endDate]: 1 });

const Leave = mongoose.model(TableNames.Leave, leaveSchema);

module.exports = Leave; 