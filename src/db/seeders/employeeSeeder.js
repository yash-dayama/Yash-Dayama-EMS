const mongoose = require("mongoose");
const Admin = require("../models/admin");
const Employee = require("../models/employee");
const Leave = require("../models/leave");
const Attendance = require("../models/attendance");
const { UserTypes, AttendanceStatus } = require("../../utils/constants");

const calculateWorkingDays = (startDate, endDate) => {
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

const seedEmployeeData = async () => {
    try {
        console.log("🌱 Starting employee data seeding...");

        await Admin.deleteMany({});
        await Employee.deleteMany({});
        await Leave.deleteMany({});
        await Attendance.deleteMany({});
        
        console.log("🗑️ Cleared existing data");

        const admin1 = new Admin({
            name: "Yash Admin",
            email: "admin@company.com",
            password: "Admin@123",
            userType: UserTypes.Admin,
            approved: true,
            active: true,
        });

        const admin2 = new Admin({
            name: "Sarah Manager",
            email: "manager@company.com",
            password: "Manager@123",
            userType: UserTypes.Admin,
            approved: true,
            active: true,
        });

        await admin1.save();
        await admin2.save();
        console.log("👨‍💼 Created admin users");

        const employees = [
            {
                name: "Alice Johnson",
                employeeId: "EMP001",
                email: "alice@company.com",
                password: "Employee@123",
                department: "Engineering",
                position: "Senior Developer",
                phone: "+1234567890",
                joinDate: new Date("2023-01-15"),
                leaveBalance: 18,
            },
            {
                name: "Bob Smith",
                employeeId: "EMP002",
                email: "bob@company.com",
                password: "Employee@123",
                department: "Marketing",
                position: "Marketing Specialist",
                phone: "+1234567891",
                joinDate: new Date("2023-03-20"),
                leaveBalance: 20,
            },
            {
                name: "Carol Davis",
                employeeId: "EMP003",
                email: "carol@company.com",
                password: "Employee@123",
                department: "HR",
                position: "HR Coordinator",
                phone: "+1234567892",
                joinDate: new Date("2022-11-10"),
                leaveBalance: 15,
            },
            {
                name: "David Wilson",
                employeeId: "EMP004",
                email: "david@company.com",
                password: "Employee@123",
                department: "Engineering",
                position: "Frontend Developer",
                phone: "+1234567893",
                joinDate: new Date("2023-05-01"),
                leaveBalance: 22,
            },
            {
                name: "Eva Brown",
                employeeId: "EMP005",
                email: "eva@company.com",
                password: "Employee@123",
                department: "Sales",
                position: "Sales Representative",
                phone: "+1234567894",
                joinDate: new Date("2023-02-14"),
                leaveBalance: 19,
            },
        ];

        const createdEmployees = [];
        for (const empData of employees) {
            const employee = new Employee(empData);
            await employee.save();
            createdEmployees.push(employee);
        }
        console.log("👥 Created employee users");

        const today = new Date();
        const thirtyDaysAgo = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000));

        for (const employee of createdEmployees) {
            for (let d = new Date(thirtyDaysAgo); d <= today; d.setDate(d.getDate() + 1)) {
                const currentDate = new Date(d);
                currentDate.setHours(0, 0, 0, 0);

                if (currentDate.getDay() === 0 || currentDate.getDay() === 6) {
                    continue;
                }

                if (Math.random() > 0.9) {
                    continue;
                }

                // Generate random check-in time (8 AM to 10 AM)
                const checkInHour = 8 + Math.floor(Math.random() * 2);
                const checkInMinute = Math.floor(Math.random() * 60);
                const checkInTime = new Date(currentDate);
                checkInTime.setHours(checkInHour, checkInMinute, 0, 0);

                // Generate random check-out time (5 PM to 8 PM)
                const checkOutHour = 17 + Math.floor(Math.random() * 3);
                const checkOutMinute = Math.floor(Math.random() * 60);
                const checkOutTime = new Date(currentDate);
                checkOutTime.setHours(checkOutHour, checkOutMinute, 0, 0);

                const attendance = new Attendance({
                    employee: employee._id,
                    date: currentDate,
                    checkInTime: checkInTime,
                    checkOutTime: checkOutTime,
                    attendanceStatus: AttendanceStatus.CheckedOut,
                });

                await attendance.save();
            }
        }
        console.log("⏰ Created attendance records");

        console.log("\n✅ Employee data seeding completed successfully!");
        console.log("\n📊 Summary:");
        console.log(`👨‍💼 Admins created: 2`);
        console.log(`👥 Employees created: ${createdEmployees.length}`);
        console.log(`⏰ Attendance records created: ~${createdEmployees.length * 20} (last 30 days)`);

        console.log("\n🔐 Login Credentials:");
        console.log("Admin:");
        console.log("  Email: admin@company.com | Password: Admin@123");
        console.log("  Email: manager@company.com | Password: Manager@123");
        console.log("\nEmployees:");
        employees.forEach(emp => {
            console.log(`  ${emp.name} (${emp.employeeId}): ${emp.email} | Password: Employee@123`);
        });

        return {
            admins: [admin1, admin2],
            employees: createdEmployees,
            message: "Seeding completed successfully"
        };

    } catch (error) {
        console.error("❌ Error seeding employee data:", error);
        throw error;
    }
};

if (require.main === module) {
    const DBController = require("../mongoose");
    
    DBController.initConnection(async () => {
        try {
            await seedEmployeeData();
            console.log("🎉 Seeding process completed!");
            process.exit(0);
        } catch (error) {
            console.error("💥 Seeding failed:", error);
            process.exit(1);
        }
    });
}

module.exports = { seedEmployeeData }; 