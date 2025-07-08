const EmployeeService = require("../../db/services/EmployeeService");
const { InterfaceTypes, TableFields, ValidationMsgs } = require("../../utils/constants");
const ValidationError = require("../../utils/ValidationError");

exports.login = async (req) => {
    let email = req.body[TableFields.email];

    if (!email) {
        throw new ValidationError(ValidationMsgs.EmailEmpty);
    }
    email = `${email}`.trim().toLowerCase();

    const password = req.body[TableFields.password];

    if (!password) {
        throw new ValidationError(ValidationMsgs.PasswordEmpty);
    }

    const employee = await EmployeeService.findByEmail(email)
        .withPassword()
        .withUserType()
        .withBasicInfo()
        .withLeaveInfo()
        .execute();

    if (employee && (await employee.isValidAuth(password)) && employee[TableFields.active]) {
        const token = employee.createAuthToken();

        await EmployeeService.saveAuthToken(employee[TableFields.ID], token);

        return {
            user: employee,
            token,
        };
    } else {
        throw new ValidationError(ValidationMsgs.UnableToLogin);
    }
};

exports.logout = (req) => {
    const headerToken = req.header("Authorization").replace("Bearer ", "");

    EmployeeService.removeAuth(req.user[TableFields.ID], headerToken);
};

exports.forgotPasswordCodeExists = async (req) => {
    let providedEmail = req.body[TableFields.email];
    const providedCode = req.body.code;

    if (providedEmail) {
        providedEmail = `${providedEmail}`.trim().toLowerCase();
    }
    if (!providedEmail || !providedCode) {
        throw new ValidationError(ValidationMsgs.ParametersError);
    }
    const exists = await EmployeeService.resetPasswordCodeExists(providedEmail, providedCode);

    if (!exists) {
        throw new ValidationError(ValidationMsgs.InvalidPassResetCode);
    }
};

exports.forgotPassword = async (req) => {
    let providedEmail = req.body[TableFields.email];

    providedEmail = `${providedEmail}`.trim().toLowerCase();

    if (!providedEmail) {
        throw new ValidationError(ValidationMsgs.EmailEmpty);
    }

    const { code, email } = await EmployeeService.getResetPasswordToken(providedEmail);

    // In a real application, you would send this code via email
    return { code, email };
};

exports.resetPassword = async (req) => {
    let providedEmail = req.body[TableFields.email];

    providedEmail = `${providedEmail}`.trim().toLowerCase();

    const { code, newPassword } = req.body;

    if (!providedEmail) {
        throw new ValidationError(ValidationMsgs.EmailEmpty);
    }
    if (!code) {
        throw new ValidationError(ValidationMsgs.PassResetCodeEmpty);
    }
    if (!newPassword) {
        throw new ValidationError(ValidationMsgs.NewPasswordEmpty);
    }

    const employee = await EmployeeService.resetPassword(providedEmail, code, newPassword);
    const token = await createAndStoreAuthToken(employee);

    return {
        user: await EmployeeService.getUserById(employee[TableFields.ID])
            .withBasicInfo()
            .withLeaveInfo()
            .withUserType()
            .execute(),
        token: token || undefined,
    };
};

exports.changePassword = async (req) => {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
        throw new ValidationError(ValidationMsgs.ParametersError);
    }

    const employee = await EmployeeService.getUserById(req.user[TableFields.ID])
        .withPassword()
        .withId()
        .execute();

    if (employee && (await employee.isValidAuth(oldPassword))) {
        if (!employee.isValidPassword(newPassword)) {
            throw new ValidationError(ValidationMsgs.PasswordInvalid);
        }
        const token = employee.createAuthToken();

        await EmployeeService.updatePasswordAndInsertLatestToken(employee, newPassword, token);

        return { token };
    } else {
        throw new ValidationError(ValidationMsgs.OldPasswordIncorrect);
    }
};

async function createAndStoreAuthToken(employeeObj) {
    const token = employeeObj.createAuthToken();

    await EmployeeService.saveAuthToken(employeeObj[TableFields.ID], token);

    return token;
} 