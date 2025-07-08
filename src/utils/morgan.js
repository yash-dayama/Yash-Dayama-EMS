const morgan = require("morgan");
const chalk = require("chalk");
const logger = require("./logger.js");

const isDev = process.env.NODE_ENV !== "production";

morgan.token("message", (req, res) => res.locals.errorMessage || "");
morgan.token("real-ip", (req) =>
    (req.ip || req.connection.remoteAddress || "").replace(/^::ffff:/, ""),
);

const getIpFormat = () => ":real-ip - ";

const formatWithColor = (tokens, req, res) => {
    const status = tokens.status(req, res);
    const method = tokens.method(req, res);
    const url = tokens.url(req, res);
    const responseTime = tokens["response-time"](req, res);
    const ip = tokens["real-ip"](req, res);
    const message = tokens.message(req, res);

    let statusColor = chalk.green;
    if (status >= 500) statusColor = chalk.red;
    else if (status >= 400) statusColor = chalk.yellow;
    else if (status >= 300) statusColor = chalk.cyan;

    return [
        chalk.gray(ip),
        chalk.blue(method.padEnd(6)),
        url,
        statusColor(status),
        "-",
        chalk.magenta(`${responseTime} ms`),
        message ? chalk.red(`\n⛔ ${message}`) : "",
    ].join(" ");
};

const successFormat = isDev
    ? formatWithColor
    : `${getIpFormat()}:method :url :status - :response-time ms`;
const errorFormat = isDev
    ? formatWithColor
    : `${getIpFormat()}:method :url :status - :response-time ms - message: :message`;

const successHandler = morgan(successFormat, {
    skip: (req, res) => res.statusCode >= 400,
    stream: {
        write: (message) => logger.info(message.trim()),
    },
});

const errorHandler = morgan(errorFormat, {
    skip: (req, res) => res.statusCode < 400,
    stream: {
        write: (message) => logger.error(message.trim()),
    },
});

module.exports = {
    successHandler,
    errorHandler,
};
