const mongoose = require("mongoose");
const validator = require("validator");
const { ValidationMsgs, TableNames, TableFields, UserTypes } = require("../../utils/constants");
const ValidationError = require("../../utils/ValidationError");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const employeeSchema = new mongoose.Schema(
    {
        [TableFields.name_]: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
        },
        [TableFields.employeeId]: {
            type: String,
            required: [true, "Employee ID is required"],
            unique: true,
            trim: true,
        },
        [TableFields.email]: {
            type: String,
            required: [true, ValidationMsgs.EmailEmpty],
            trim: true,
            unique: true,
            lowercase: true,
            validate(value) {
                if (!validator.isEmail(value)) {
                    throw new ValidationError(ValidationMsgs.EmailInvalid);
                }
            },
        },
        [TableFields.password]: {
            type: String,
            minlength: 8,
            trim: true,
            required: [true, ValidationMsgs.PasswordEmpty],
        },
        [TableFields.phone]: {
            type: String,
            trim: true,
        },
        [TableFields.department]: {
            type: String,
            required: [true, "Department is required"],
            trim: true,
        },
        [TableFields.position]: {
            type: String,
            required: [true, "Position is required"],
            trim: true,
        },
        [TableFields.joinDate]: {
            type: Date,
            required: [true, "Join date is required"],
            default: Date.now,
        },
        [TableFields.leaveBalance]: {
            type: Number,
            default: 20,
            min: 0,
        },
        [TableFields.image]: {
            type: String,
            trim: true,
        },
        [TableFields.tokens]: [
            {
                [TableFields.ID]: false,
                [TableFields.token]: { type: String },
            },
        ],
        [TableFields.userType]: {
            type: Number,
            default: UserTypes.Employee,
            enum: Object.values(UserTypes),
        },
        [TableFields.active]: {
            type: Boolean,
            default: true,
        },
        [TableFields.passwordResetToken]: {
            type: String,
            trim: true,
        },
    },
    {
        timestamps: true,
        toJSON: {
            transform: function (doc, ret) {
                delete ret[TableFields.tokens];
                delete ret[TableFields.passwordResetToken];
                delete ret[TableFields.password];
                delete ret.createdAt;
                delete ret.updatedAt;
                delete ret.__v;
            },
        },
    },
);

employeeSchema.methods.isValidAuth = async function (password) {
    return await bcrypt.compare(password, this.password);
};

employeeSchema.methods.isValidPassword = function (password) {
    const regEx = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regEx.test(password);
};

employeeSchema.methods.createAuthToken = function () {
    const token = jwt.sign(
        { [TableFields.ID]: this[TableFields.ID].toString() },
        process.env.JWT_USER_PK || process.env.JWT_ADMIN_PK,
    );
    return token;
};

employeeSchema.pre("save", async function (next) {
    if (this.isModified(TableFields.password)) {
        this[TableFields.password] = await bcrypt.hash(this[TableFields.password], 8);
    }
    next();
});

employeeSchema.index({ [TableFields.email]: 1 }, { unique: true });
employeeSchema.index({ [TableFields.employeeId]: 1 }, { unique: true });

const Employee = mongoose.model(TableNames.Employee, employeeSchema);

module.exports = Employee; 