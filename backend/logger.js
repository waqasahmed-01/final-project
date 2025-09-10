// logger.js
const { createLogger, transports, format } = require('winston');

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.errors({ stack: true }),
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.printf(({ timestamp, level, message, stack }) => {
      if (stack) {
        return `[${timestamp}] ${level.toUpperCase()}: ${stack}`;
      }
      return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
    })
  ),
  transports: [
    new transports.Console({
      format: format.combine(
        format.colorize({ all: true }),
        format.printf(({ timestamp, level, message, stack }) => {
          if (stack) {
            return `[${timestamp}] ${level}: ${stack}`;
          }
          return `[${timestamp}] ${level}: ${message}`;
        })
      ),
    }),
    new transports.File({ filename: 'logs/app.log' }), // If logs errors on file than:  level: 'error'
  ],
  exceptionHandlers: [new transports.File({ filename: 'logs/exceptions.log' })],
  rejectionHandlers: [new transports.File({ filename: 'logs/rejections.log' })],
});

module.exports = logger;
