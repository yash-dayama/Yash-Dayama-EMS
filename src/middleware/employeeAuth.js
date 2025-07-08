const jwt = require("jsonwebtoken");
const {
    ValidationMsgs,
    TableFields,
    UserTypes,
    ResponseStatus,
    AuthTypes,
} = require("../utils/constants");
const ValidationError = require("../utils/ValidationError");
const EmployeeService = require("../db/services/EmployeeService");

const employeeAuth = async (req, res, next) => {
    try {
        const headerToken = req.header("Authorization").replace("Bearer ", "");
        const decoded = jwt.verify(headerToken, process.env.JWT_USER_PK || process.env.JWT_ADMIN_PK);
        const employee = await EmployeeService.getUserByIdAndToken(decoded[TableFields.ID], headerToken)
            .withBasicInfo()
            .withLeaveInfo()
            .execute();

        if (!employee) {
            throw new ValidationError();
        }

        if (employee[TableFields.active] === true) {
            req.user = employee;
            req.user[TableFields.userType] = UserTypes.Employee;
            req.user[TableFields.authType] = AuthTypes.Employee;
            next();
        } else {
            res.status(ResponseStatus.Unauthorized).send({ error: ValidationMsgs.AuthFail });
        }
    } catch (e) {
        if (!(e instanceof ValidationError)) {
            console.log(e);
        }
        res.status(ResponseStatus.Unauthorized).send({ error: ValidationMsgs.AuthFail });
    }
};

module.exports = employeeAuth; 