const EmployeeService = require("../../db/services/EmployeeService");
const { TableFields, ValidationMsgs } = require("../../utils/constants");
const ValidationError = require("../../utils/ValidationError");

// Create a new employee
exports.createEmployee = async (req) => {
    const employeeData = {
        [TableFields.name_]: req.body[TableFields.name_],
        [TableFields.email]: req.body[TableFields.email],
        [TableFields.password]: req.body[TableFields.password],
        [TableFields.employeeId]: req.body[TableFields.employeeId],
        [TableFields.department]: req.body[TableFields.department],
        [TableFields.position]: req.body[TableFields.position],
        [TableFields.phone]: req.body[TableFields.phone],
        [TableFields.joinDate]: req.body[TableFields.joinDate],
        [TableFields.leaveBalance]: req.body[TableFields.leaveBalance] || 20,
    };

    return await EmployeeService.insertEmployeeRecord(employeeData);
};

exports.getAllEmployees = async (req) => {
    const { department, active } = req.query;
    
    const filters = {};
    if (department) {
        filters[TableFields.department] = department;
    }
    if (active !== undefined) {
        filters[TableFields.active] = active === 'true';
    }

    return await EmployeeService.getAllEmployees(filters);
};

exports.getEmployeeById = async (req) => {
    const employeeId = req.params.id;
    
    const employee = await EmployeeService.getUserById(employeeId)
        .withBasicInfo()
        .withLeaveInfo()
        .execute();

    if (!employee) {
        throw new ValidationError(ValidationMsgs.RecordNotFound);
    }

    return employee;
};

exports.updateEmployee = async (req) => {
    const employeeId = req.params.id;
    
    const updateData = {
        [TableFields.name_]: req.body[TableFields.name_],
        [TableFields.email]: req.body[TableFields.email],
        [TableFields.department]: req.body[TableFields.department],
        [TableFields.position]: req.body[TableFields.position],
        [TableFields.phone]: req.body[TableFields.phone],
        [TableFields.leaveBalance]: req.body[TableFields.leaveBalance],
        [TableFields.active]: req.body[TableFields.active],
    };

    Object.keys(updateData).forEach(key => {
        if (updateData[key] === undefined) {
            delete updateData[key];
        }
    });

    return await EmployeeService.updateEmployee(employeeId, updateData);
};

exports.deleteEmployee = async (req) => {
    const employeeId = req.params.id;
    
    return await EmployeeService.updateEmployee(employeeId, {
        [TableFields.active]: false
    });
};

exports.updateLeaveBalance = async (req) => {
    const employeeId = req.params.id;
    const { leaveBalance } = req.body;

    if (leaveBalance === undefined || leaveBalance < 0) {
        throw new ValidationError("Valid leave balance is required");
    }

    return await EmployeeService.updateLeaveBalance(employeeId, leaveBalance);
};

exports.getEmployeeDashboardStats = async (req) => {
    const employees = await EmployeeService.getAllEmployees();
    
    const stats = {
        totalEmployees: employees.length,
        activeEmployees: employees.filter(emp => emp[TableFields.active]).length,
        inactiveEmployees: employees.filter(emp => !emp[TableFields.active]).length,
        departmentWise: {},
    };

    employees.forEach(employee => {
        const dept = employee[TableFields.department];
        if (!stats.departmentWise[dept]) {
            stats.departmentWise[dept] = {
                total: 0,
                active: 0,
                inactive: 0,
            };
        }
        
        stats.departmentWise[dept].total++;
        if (employee[TableFields.active]) {
            stats.departmentWise[dept].active++;
        } else {
            stats.departmentWise[dept].inactive++;
        }
    });

    return stats;
}; 