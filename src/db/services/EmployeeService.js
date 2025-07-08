const { TableFields, ValidationMsgs, UserTypes, TableNames } = require("../../utils/constants");
const ValidationError = require("../../utils/ValidationError");
const Employee = require("../models/employee");

class ProjectionBuilder {
    constructor(fn) {
        this.fn = fn;
        this.projection = {};
    }

    withId() {
        this.projection[TableFields.ID] = 1;
        return this;
    }

    withBasicInfo() {
        this.projection[TableFields.name_] = 1;
        this.projection[TableFields.email] = 1;
        this.projection[TableFields.employeeId] = 1;
        this.projection[TableFields.department] = 1;
        this.projection[TableFields.position] = 1;
        this.projection[TableFields.phone] = 1;
        this.projection[TableFields.image] = 1;
        this.projection[TableFields.active] = 1;
        return this;
    }

    withPassword() {
        this.projection[TableFields.password] = 1;
        return this;
    }

    withUserType() {
        this.projection[TableFields.userType] = 1;
        return this;
    }

    withTokens() {
        this.projection[TableFields.tokens] = 1;
        return this;
    }

    withPasswordResetToken() {
        this.projection[TableFields.passwordResetToken] = 1;
        return this;
    }

    withLeaveInfo() {
        this.projection[TableFields.joinDate] = 1;
        this.projection[TableFields.leaveBalance] = 1;
        return this;
    }

    async execute() {
        return await this.fn.call(this);
    }
}

class EmployeeService {
    static findByEmail = (email) =>
        new ProjectionBuilder(async function () {
            return await Employee.findOne({ email }, this.projection);
        });

    static findByEmployeeId = (employeeId) =>
        new ProjectionBuilder(async function () {
            return await Employee.findOne({ [TableFields.employeeId]: employeeId }, this.projection);
        });

    static saveAuthToken = async (userId, token) => {
        await Employee.updateOne(
            { [TableFields.ID]: userId },
            { $push: { [TableFields.tokens]: { [TableFields.token]: token } } },
        );
    };

    static getUserById = (userId) =>
        new ProjectionBuilder(async function () {
            return await Employee.findOne({ [TableFields.ID]: userId }, this.projection);
        });

    static getUserByIdAndToken = (userId, token, lean = false) =>
        new ProjectionBuilder(async function () {
            return await Employee.findOne(
                {
                    [TableFields.ID]: userId,
                    [`${TableFields.tokens}.${TableFields.token}`]: token,
                },
                this.projection,
            ).lean(lean);
        });

    static existsWithEmail = async (email, exceptionId) =>
        await Employee.exists({
            [TableFields.email]: email,
            ...(exceptionId ? { [TableFields.ID]: { $ne: exceptionId } } : {}),
        });

    static existsWithEmployeeId = async (employeeId, exceptionId) =>
        await Employee.exists({
            [TableFields.employeeId]: employeeId,
            ...(exceptionId ? { [TableFields.ID]: { $ne: exceptionId } } : {}),
        });

    static insertEmployeeRecord = async (reqBody) => {
        let email = reqBody[TableFields.email];
        email = `${email}`.trim().toLowerCase();
        const password = reqBody[TableFields.password];
        const employeeId = reqBody[TableFields.employeeId];

        if (!email) {
            throw new ValidationError(ValidationMsgs.EmailEmpty);
        }
        if (!password) {
            throw new ValidationError(ValidationMsgs.PasswordEmpty);
        }
        if (!employeeId) {
            throw new ValidationError(ValidationMsgs.EmployeeIdRequired);
        }
        if (email === password) {
            throw new ValidationError(ValidationMsgs.PasswordInvalid);
        }

        if (await EmployeeService.existsWithEmail(email)) {
            throw new ValidationError(ValidationMsgs.DuplicateEmail);
        }

        if (await EmployeeService.existsWithEmployeeId(employeeId)) {
            throw new ValidationError("Employee ID already exists");
        }

        const employee = new Employee(reqBody);
        employee[TableFields.userType] = UserTypes.Employee;

        if (!employee.isValidPassword(password)) {
            throw new ValidationError(ValidationMsgs.PasswordInvalid);
        }

        try {
            await employee.save();
            return employee;
        } catch (error) {
            if (error.code === 11000) {
                if (error.keyPattern[TableFields.email]) {
                    throw new ValidationError(ValidationMsgs.DuplicateEmail);
                }
                if (error.keyPattern[TableFields.employeeId]) {
                    throw new ValidationError("Employee ID already exists");
                }
            }
            throw error;
        }
    };

    static removeAuth = async (employeeId, authToken) => {
        await Employee.updateOne(
            { [TableFields.ID]: employeeId },
            { $pull: { [TableFields.tokens]: { [TableFields.token]: authToken } } },
        );
    };

    static getResetPasswordToken = async (email) => {
        const employee = await EmployeeService.findByEmail(email)
            .withId()
            .withBasicInfo()
            .withPasswordResetToken()
            .execute();

        if (!employee) {
            throw new ValidationError(ValidationMsgs.AccountNotRegistered);
        }
        if (!employee[TableFields.active]) {
            throw new ValidationError(ValidationMsgs.UnableToForgotPassword);
        }

        let code;
        if (!employee[TableFields.passwordResetToken]) {
            code = "123456"; 
            employee[TableFields.passwordResetToken] = code;
            await employee.save();
        } else {
            code = employee[TableFields.passwordResetToken];
        }

        return {
            code,
            email: employee[TableFields.email],
            name: employee[TableFields.name_],
        };
    };

    static resetPasswordCodeExists = async (providedEmail, otp) => {
        if (!otp) {
            return false;
        }
        if (providedEmail) {
            return (await Employee.exists({
                [TableFields.email]: providedEmail,
                [TableFields.passwordResetToken]: otp,
            }))
                ? true
                : false;
        } else {
            return (await Employee.exists({ [TableFields.passwordResetToken]: otp })) ? true : false;
        }
    };

    static resetPassword = async (email, code, newPassword) => {
        const employee = await EmployeeService.findByEmail(email)
            .withId()
            .withBasicInfo()
            .withPasswordResetToken()
            .execute();

        if (!employee) {
            throw new ValidationError(ValidationMsgs.AccountNotRegistered);
        }

        if (!employee[TableFields.active]) {
            throw new ValidationError(ValidationMsgs.UnableToForgotPassword);
        }

        if (!employee.isValidPassword(newPassword)) {
            throw new ValidationError(ValidationMsgs.PasswordInvalid);
        }

        if (employee[TableFields.passwordResetToken] === code) {
            employee[TableFields.password] = newPassword;
            employee[TableFields.passwordResetToken] = "";
            employee[TableFields.tokens] = [];

            return await employee.save();
        } else {
            throw new ValidationError(ValidationMsgs.InvalidPassResetCode);
        }
    };

    static updatePasswordAndInsertLatestToken = async (employeeObj, newPassword, token) => {
        employeeObj[TableFields.tokens] = [{ [TableFields.token]: token }];
        employeeObj[TableFields.password] = newPassword;
        await employeeObj.save();
    };

    static getAllEmployees = async (filter = {}) => {
        return await Employee.find(filter).select('-password -tokens -passwordResetToken');
    };

    static updateEmployee = async (employeeId, updateData) => {
        const employee = await Employee.findById(employeeId);
        if (!employee) {
            throw new ValidationError(ValidationMsgs.RecordNotFound);
        }

        Object.keys(updateData).forEach(key => {
            if (updateData[key] !== undefined) {
                employee[key] = updateData[key];
            }
        });

        return await employee.save();
    };

    static updateLeaveBalance = async (employeeId, newBalance) => {
        return await Employee.findByIdAndUpdate(
            employeeId,
            { [TableFields.leaveBalance]: newBalance },
            { new: true }
        );
    };

    static deductLeaveBalance = async (employeeId, daysToDeduct) => {
        const employee = await Employee.findById(employeeId);
        if (!employee) {
            throw new ValidationError(ValidationMsgs.RecordNotFound);
        }

        const newBalance = employee[TableFields.leaveBalance] - daysToDeduct;
        if (newBalance < 0) {
            throw new ValidationError(ValidationMsgs.InsufficientLeaveBalance);
        }

        employee[TableFields.leaveBalance] = newBalance;
        return await employee.save();
    };

    static restoreLeaveBalance = async (employeeId, daysToRestore) => {
        const employee = await Employee.findById(employeeId);
        if (!employee) {
            throw new ValidationError(ValidationMsgs.RecordNotFound);
        }

        employee[TableFields.leaveBalance] += daysToRestore;
        return await employee.save();
    };
}

module.exports = EmployeeService; 