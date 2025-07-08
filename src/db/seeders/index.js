const chalk = require("chalk");
const { seedEmployeeData } = require("./employeeSeeder");

const runSeeders = async () => {
    let hasErrors = false;

    try {
        await seedEmployeeData();
        console.log(chalk.green("✅ Seeded employee and admin data with sample records."));
    } catch (error) {
        console.error(chalk.red("❌ Error in Employee Data Seeder:"), error);
        hasErrors = true;
    }

    if (hasErrors) {
        console.log(chalk.bgRed.white("⚠️ Seeders completed with some errors."));
        process.exit(1);
    } else {
        console.log(chalk.bgGreen.white("🎉 All seeders completed successfully!"));
    }
};

module.exports = runSeeders;
