import winston from 'winston';
import dotenv from 'dotenv';
dotenv.config();

console.log('setting log level to: ', process.env.BFD_LOG_LEVEL);
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
