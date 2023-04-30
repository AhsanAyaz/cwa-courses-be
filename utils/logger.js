const { format, createLogger, transports } = require("winston");
const { combine, label, json, printf, prettyPrint } = format;
require("winston-daily-rotate-file");

const customFormat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp} [${label}] ${level}: ${message}`;
});

//DailyRotateFile func()
const fileRotateTransport = new transports.DailyRotateFile({
  filename: "logs/rotate-%DATE%.log",
  datePattern: "YYYY-MM-DD",
  maxFiles: "14d",
});

const createCWALogger = (logLabel) => {
  const logger = createLogger({
    level: "debug",
    format: combine(label({ label: logLabel }), customFormat, json(), prettyPrint()),
    transports: [fileRotateTransport, new transports.Console()],
  });
  return logger;
}

module.exports = createCWALogger;