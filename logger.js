var winston = require('winston');
var _ = require('lodash');

// Set up logger
var customColors = {
  trace: 'white',
  debug: 'green',
  info: 'green',
  warn: 'yellow',
  crit: 'red',
  error: 'red',
  fatal: 'red'
};

var logger = new(winston.Logger)({
  colors: customColors,
  levels: {
    trace: 0,
    debug: 1,
    info: 2,
    error: 3,
    warn: 4,
    crit: 5,
    fatal: 6
  },
  transports: [
    new(winston.transports.Console)({
      name: 'console-log',
      level: 'info',
      colorize: true,
      timestamp: true,
      humanReadableUnhandledException: true,
  handleExceptions: true,
      json: false
    }),
    new (winston.transports.File)({
      name: 'info-file',
      level: 'info',
      colorize: true,
      timestamp: true,
      handleExceptions: true,
      maxsize: 5242880, //5MB
      maxFiles: 5,
      colorize: false,
      humanReadableUnhandledException: true,
      filename: './logs/app.log'
    }),
    new (winston.transports.File)({
      name: 'error-file',
      level: 'error',
      colorize: true,
      timestamp: true,
      handleExceptions: true,
      maxsize: 5242880, //5MB
      maxFiles: 5,
      colorize: false,
      humanReadableUnhandledException: true,
      filename: './logs/error.log'
    })
  ],
  exitOnError: false
});

winston.addColors(customColors);

// Extend logger object to properly log 'Error' types
var origLog = logger.log;

logger.log = function (level, msg) {
  if (msg instanceof Error) {
    var args = Array.prototype.slice.call(arguments);
    args[1] = msg.stack;
    origLog.apply(logger, args);
  } else {
    origLog.apply(logger, arguments);
  }
};
/* LOGGER EXAMPLES
    app.logger.trace('testing');
    app.logger.debug('testing');
    app.logger.info('testing');
    app.logger.warn('testing');
    app.logger.crit('testing');
    app.logger.fatal('testing');
    */

module.exports = logger;