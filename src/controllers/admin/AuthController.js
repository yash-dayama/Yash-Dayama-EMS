const AdminService = require("../../db/services/AdminService");
const { InterfaceTypes, TableFields, ValidationMsgs } = require("../../utils/constants");
const ValidationError = require("../../utils/ValidationError");

exports.addAdminUser = async (req) => {
    const adminData = {
        [TableFields.name_]: req.body[TableFields.name_],
        [TableFields.email]: req.body[TableFields.email],
        [TableFields.password]: req.body[TableFields.password],
    };

    const admin = await AdminService.insertUserRecord(adminData);
    const token = await createAndStoreAuthToken(admin);

    return {
        user: admin,
        token,
    };
};

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

    const user = await AdminService.findByEmail(email)
        .withPassword()
        .withUserType()
        .withBasicInfo()
        .execute();

    if (user && (await user.isValidAuth(password)) && user[TableFields.active]) {
        const token = user.createAuthToken(InterfaceTypes.Admin.AdminWeb);

        await AdminService.saveAuthToken(user[TableFields.ID], token);

        return {
            user,
            token,
        };
    } else {
        throw new ValidationError(ValidationMsgs.UnableToLogin);
    }
};

exports.logout = (req) => {
    const headerToken = req.header("Authorization").replace("Bearer ", "");

    AdminService.removeAuth(req.user[TableFields.ID], headerToken);
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
    const exists = await AdminService.resetPasswordCodeExists(providedEmail, providedCode);

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

    const { code, email } = await AdminService.getResetPasswordToken(providedEmail);

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

    const user = await AdminService.resetPassword(providedEmail, code, newPassword);
    const token = await createAndStoreAuthToken(user);

    return {
        user: await AdminService.getUserById(user[TableFields.ID])
            .withPassword()
            .withUserType()
            .withBasicInfo()
            .execute(),
        token: token || undefined,
    };
};

exports.changePassword = async (req) => {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
        throw new ValidationError(ValidationMsgs.ParametersError);
    }

    const user = await AdminService.getUserById(req.user[TableFields.ID])
        .withPassword()
        .withId()
        .execute();

    if (user && (await user.isValidAuth(oldPassword))) {
        if (!user.isValidPassword(newPassword)) {
            throw new ValidationError(ValidationMsgs.PasswordInvalid);
        }
        const token = user.createAuthToken();

        await AdminService.updatePasswordAndInsertLatestToken(user, newPassword, token);

        return { token };
    } else {
        throw new ValidationError(ValidationMsgs.OldPasswordIncorrect);
    }
};

async function createAndStoreAuthToken(userObj) {
    const token = userObj.createAuthToken(InterfaceTypes.Admin.AdminWeb);

    await AdminService.saveAuthToken(userObj[TableFields.ID], token);

    return token;
}
