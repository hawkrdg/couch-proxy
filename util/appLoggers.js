const appRoot = require('app-root-path');
const winston = require('winston');
require('winston-daily-rotate-file');
require('winston-mail');
const mailer = require('winston-mail-lite');
const loggersConf = require('./conf/loggers-conf');

//-- define the custom settings for each transport (file, console)
const appFileTransportOptions = {
  level: loggersConf.fileTranportOpts.appLevel,
  filename: `${appRoot}/logs/appLogs/%DATE%-app.log`,
  frequency: loggersConf.fileTranportOpts.frequency,
  datePattern: loggersConf.fileTranportOpts.datePattern,
  handleExceptions: true,
  maxSize: loggersConf.fileTranportOpts.maxSize,
  maxFiles: loggersConf.fileTranportOpts.maxFiles
};

const couchFileTransportOptions = {
  level: loggersConf.fileTranportOpts.appLevel,
  filename: `${appRoot}/logs/couchDBLogs/%DATE%-couch.log`,
  frequency: loggersConf.fileTranportOpts.frequency,
  datePattern: loggersConf.fileTranportOpts.datePattern,
  handleExceptions: true,
  maxSize: loggersConf.fileTranportOpts.maxSize,
  maxFiles: loggersConf.fileTranportOpts.maxFiles
};

const consoleTransportOptions = {
  level: 'info',
  handleExceptions: true,
  colorize: true,
};

const mailTransportOptions = {
  host: loggersConf.mailTransportOpts.host,
  port: loggersConf.mailTransportOpts.port,
  secure: loggersConf.mailTransportOpts.secure,
  auth: loggersConf.mailTransportOpts.auth
};

const messageOptions = {
  to: loggersConf.mailMessageOpts.to,
  from: loggersConf.mailMessageOpts.from,
  subject: loggersConf.mailMessageOpts.subject
}

const mailOptions = {
  host: loggersConf.mailOpts.host,
  port: loggersConf.mailOpts.port,
  ssl: loggersConf.mailOpts.ssl,
  username: loggersConf.mailOpts.username,
  password: loggersConf.mailOpts.password,
  to: loggersConf.mailOpts.to,
  from: loggersConf.mailOpts.from,
  subject: loggersConf.mailOpts.subject,
}

//-- create various loggers...
//
const appLogger = new winston.createLogger({
  format: winston.format.simple(),
  transports: [
    new winston.transports.DailyRotateFile(appFileTransportOptions),
  ],
  exitOnError: false, //-- do not exit on handled exceptions
});

const couchLogger = new winston.createLogger({
  format: winston.format.simple(),
  transports: [
    new winston.transports.DailyRotateFile(couchFileTransportOptions),
  ],
  exitOnError: false, //-- do not exit on handled exceptions
});

const consoleLogger = winston.createLogger({
  format: winston.format.combine(
    winston.format.colorize({all: true}),
    winston.format.simple()
  ),
  transports: [
    new winston.transports.Console(consoleTransportOptions)
  ],
  exitOnError: false, //-- do not exit on handled exceptions
});

const winstonMailLiteLogger = winston.createLogger({
  format: winston.format.simple(),
  transports: [
    new mailer({transportOptions: mailTransportOptions, messageOptions: messageOptions})
  ],
  exitOnError: false, //-- do not exit on handled exceptions
});

const winstonMailLogger = winston.createLogger({
  format: winston.format.simple(),
  transports: [
    new winston.transports.Mail(mailOptions)
  ],
  exitOnError: false, //-- do not exit on handled exceptions
});

//-- create a stream object with a 'write' function that will be used by `morgan`
// logger.stream = {
//   write: function(message, encoding) {
//     logger.info(message);
//   },
// };

//-- loggers for export...
//
const loggers = {
  appFileLogger: appLogger,
  couchFileLogger: couchLogger,
  appConsoleLogger: consoleLogger,
  // mailLogger: winstonMailLogger
  mailLogger: winstonMailLiteLogger
}

module.exports = loggers;
