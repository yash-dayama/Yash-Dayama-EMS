const express = require("express");
const DBController = require("./db/mongoose");
// const S3 = require("./storage/cms"); //use storage if not S3
const path = require("path"); // to show upload folder
const cors = require("cors");
const app = express();
// const cron = require("node-cron");
const morgan = require("./utils/morgan");
// const { SeedersService } = require("./db/services/DefaultConfigService");
// const CronController = require("./schedulers/CronController");
const fs = require("fs");
// const EmailUtil = require("./utils/EmailUtil");
const chalk = require("chalk");

app.use(cors());
app.use(morgan.successHandler);
app.use(morgan.errorHandler);

app.use(
    express.urlencoded({
        extended: false,
        limit: "5gb",
        parameterLimit: 50000,
    }),
); // To parse application/json
app.use(express.json({ limit: "5gb" })); // To parse application/x-www-form-urlencoded
const routesPath = path.join(__dirname, "routes");
fs.readdirSync(routesPath).forEach((file) => {
    if (path.extname(file) === ".js") {
        app.use(require(path.join(routesPath, file)));
    }
});

app.use("/uploads", express.static(path.join(__dirname, "../uploads"))); // to show image
app.use("/static_files", express.static(path.join(__dirname, "../static_files"))); // to show csv files

app.get("/", (req, res) => {
    // Require for Load Balancer - AWS
    res.sendStatus(200);
});
app.get("/robots.txt", function (req, res) {
    res.type("text/plain");
    res.send("User-agent: *\nDisallow: /");
});

// eslint-disable-next-line require-await
DBController.initConnection(async () => {
    const httpServer = require("http").createServer(app);

    httpServer.listen(process.env.PORT, async function () {
        console.log(`Server is running on ${chalk.cyan.italic.underline(process.env.HOST + ":" + process.env.PORT)}`);
    });
});
