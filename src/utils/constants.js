const UserTypes = (function () {
    function UserTypes() {}
    UserTypes.Admin = 1;
    UserTypes.Employee = 2;

    return UserTypes;
})();

const CmsTypes = (function () {
    function CmsTypes() {}
    CmsTypes.Aboutus = 1;
    CmsTypes.PrivacyPolicy = 2;
    CmsTypes.TermsConditions = 3;

    return CmsTypes;
})();

const OtpStatus = (function () {
    function OtpStatus() {}
    OtpStatus.PENDING = 0;
    OtpStatus.VERIFIED = 1;
    OtpStatus.EXPIRED = 2;

    return OtpStatus;
})();

const Platforms = (function () {
    function Platforms() {}
    Platforms.Admin = 1;
    Platforms.Android = 2;
    Platforms.iOS = 3;

    return Platforms;
})();

const FCMPlatformType = (function () {
    function type() {}
    type.Android = 1;
    type.iOS = 2;

    return type;
})();

const InterfaceTypes = (function () {
    function InterfaceType() {}
    InterfaceType.Admin = { AdminWeb: "i1" };

    return InterfaceType;
})();

const LeaveTypes = (function () {
    function LeaveTypes() {}
    LeaveTypes.Sick = 1;
    LeaveTypes.Vacation = 2;
    LeaveTypes.WorkFromHome = 3;

    return LeaveTypes;
})();

const LeaveStatus = (function () {
    function LeaveStatus() {}
    LeaveStatus.Pending = 1;
    LeaveStatus.Approved = 2;
    LeaveStatus.Rejected = 3;

    return LeaveStatus;
})();

const AttendanceStatus = (function () {
    function AttendanceStatus() {}
    AttendanceStatus.CheckedIn = 1;
    AttendanceStatus.CheckedOut = 2;

    return AttendanceStatus;
})();

const ValidationMsgs = (function () {
    function ValidationMsgs() {}
    ValidationMsgs.InvalidAuthToken = "The authentication token is invalid.";
    ValidationMsgs.ParametersError = "Invalid parameters.";
    ValidationMsgs.RecordNotFound = "No matching record was found.";
    ValidationMsgs.AccountAlreadyExists = "This account has already been registered.";
    ValidationMsgs.AccountNotRegistered = "This account is not registered.";
    ValidationMsgs.PasswordEmpty = "Password cannot be blanked.";
    ValidationMsgs.EmailEmpty = "Email cannot be blank.";
    ValidationMsgs.EmailInvalid = "Provided email address is invalid. ";
    ValidationMsgs.PhoneInvalid = "Provided phone number is invalid.";
    ValidationMsgs.PasswordInvalid = "Password is invalid.";
    ValidationMsgs.AuthFail = "Authentication failed. Please log in. ";
    ValidationMsgs.UnableToLogin = "Unable to login with provided credentials.";
    ValidationMsgs.DuplicateEmail = "Email already exists.";
    ValidationMsgs.LeaveStartDateRequired = "Leave start date is required.";
    ValidationMsgs.LeaveEndDateRequired = "Leave end date is required.";
    ValidationMsgs.LeaveTypeRequired = "Leave type is required.";
    ValidationMsgs.LeaveReasonRequired = "Leave reason is required.";
    ValidationMsgs.InvalidLeaveDate = "Cannot apply for leave in the past.";
    ValidationMsgs.InvalidDateRange = "End date must be after start date.";
    ValidationMsgs.InsufficientLeaveBalance = "Insufficient leave balance.";
    ValidationMsgs.AlreadyCheckedIn = "Already checked in today.";
    ValidationMsgs.AlreadyCheckedOut = "Already checked out today.";
    ValidationMsgs.NotCheckedIn = "You need to check in first.";
    ValidationMsgs.UnauthorizedAccess = "You don't have permission to access this resource.";
    ValidationMsgs.LeaveNotFound = "Leave request not found.";
    ValidationMsgs.AttendanceNotFound = "Attendance record not found.";
    ValidationMsgs.EmployeeIdRequired = "Employee ID is required.";
    ValidationMsgs.OldPasswordIncorrect = "Old password is incorrect.";
    ValidationMsgs.NewPasswordEmpty = "New password cannot be blank.";
    ValidationMsgs.PassResetCodeEmpty = "Password reset code cannot be blank.";
    ValidationMsgs.InvalidPassResetCode = "Invalid password reset code.";
    ValidationMsgs.UnableToForgotPassword = "Unable to process forgot password request.";
  
    return ValidationMsgs;
})();

const ResponseMessages = (function () {
    function ResponseMessages() {}
    ResponseMessages.Ok = "Ok";
    ResponseMessages.NotFound = "Data not found!";
    ResponseMessages.signInSuccess = "Sign In successfully!";
    ResponseMessages.signOutSuccess = "Sign Out successfully!";

    return ResponseMessages;
})();

const TableNames = (function () {
    function TableNames() {}
    TableNames.Admin = "admins";
    TableNames.Employee = "employees";
    TableNames.Leave = "leaves";
    TableNames.Attendance = "attendances";
    return TableNames;
})();

const AuthTypes = (function () {
    function types() {}
    types.Admin = 1;
    types.Employee = 2;

    return types;
})();

const TableFields = (function () {
    function TableFields() {}
    TableFields.ID = "_id";
    TableFields.name_ = "name";
    TableFields.userType = "userType";
    TableFields.phoneCountry = "phoneCountry";
    TableFields.phone = "phone";
    TableFields.passwordResetToken = "passwordResetToken";
    TableFields.token = "token";
    TableFields._createdAt = "_createdAt";
    TableFields._updatedAt = "_updatedAt";
    TableFields.email = "email";
    TableFields.password = "password";
    TableFields.tokens = "tokens";
    TableFields.approved = "approved";
    TableFields.emailVerified = "emailVerified";
    TableFields.isRegCompleted = "isRegCompleted";
    TableFields.emailOTP = "emailOTP";
    TableFields.authType = "authType";
    TableFields.reference = "reference";
    TableFields.active = "active";
    TableFields.image = "image";
    TableFields.interface = "interface";
    
    // Employee specific fields
    TableFields.employeeId = "employeeId";
    TableFields.department = "department";
    TableFields.position = "position";
    TableFields.joinDate = "joinDate";
    TableFields.leaveBalance = "leaveBalance";
    
    // Leave specific fields
    TableFields.employee = "employee";
    TableFields.startDate = "startDate";
    TableFields.endDate = "endDate";
    TableFields.leaveType = "leaveType";
    TableFields.reason = "reason";
    TableFields.status = "status";
    TableFields.approvedBy = "approvedBy";
    TableFields.approvedAt = "approvedAt";
    TableFields.rejectedAt = "rejectedAt";
    TableFields.totalDays = "totalDays";
    
    // Attendance specific fields
    TableFields.date = "date";
    TableFields.checkInTime = "checkInTime";
    TableFields.checkOutTime = "checkOutTime";
    TableFields.hoursWorked = "hoursWorked";
    TableFields.attendanceStatus = "attendanceStatus";

    return TableFields;
})();

const ResponseStatus = (function () {
    function ResponseStatus() {}
    ResponseStatus.Failed = 0;
    ResponseStatus.Success = 200;
    ResponseStatus.BadRequest = 400;
    ResponseStatus.Unauthorized = 401;
    ResponseStatus.NotFound = 404;
    ResponseStatus.UpgradeRequired = 426;
    ResponseStatus.AccountDeactivated = 3001;
    ResponseStatus.InternalServerError = 500;
    ResponseStatus.ServiceUnavailable = 503;

    return ResponseStatus;
})();

const DefaultConfigTypes = (function () {
    function types() {}
    types.UserAppSettings = "appSettings"; // default configuration type

    return types;
})();

const AppSettingsKeys = (function () {
    function AppSettingsKeys() {}
    AppSettingsKeys.maintenance = 1;
    AppSettingsKeys.forceUpdate = 2;

    return AppSettingsKeys;
})();

const ApiResponseCode = (function () {
    function ApiResponseCode() {}
    ApiResponseCode.ClientOrServerError = 400;
    ApiResponseCode.ResponseSuccess = 200;
    ApiResponseCode.AuthError = 401;
    ApiResponseCode.UnderMaintenance = 503; // Service Unavailable
    ApiResponseCode.ForceUpdate = 409; // Version Control

    return ApiResponseCode;
})();

const ResponseFields = (function () {
    function ResponseFields() {}
    ResponseFields.status = "status";
    ResponseFields.message = "message";
    ResponseFields.result = "result";

    return ResponseFields;
})();

module.exports = {
    ValidationMsgs,
    TableNames,
    TableFields,
    ResponseStatus,
    ResponseFields,
    ResponseMessages,
    UserTypes,
    InterfaceTypes,
    AuthTypes,
    ApiResponseCode,
    LeaveTypes,
    LeaveStatus,
    AttendanceStatus,
};
