import winston from 'winston';

const logger = winston.createLogger({
  transports: [
    new winston.transports.Console({
      timestamp: true,
      level: process.env.BFD_LOG_LEVEL || 'info',
      handleExceptions: true,
      json: false,
      colorize: true
    })
  ],
  exitOnError: false
});

export default logger;
