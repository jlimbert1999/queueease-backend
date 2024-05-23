import { createLogger, format, transports } from 'winston';


const options = {
  file: {
    filename: 'error.log',
    level: 'error',
  },
  console: {
    level: 'silly',
  },
};

// for production environment
const prodLogger = {
  format: format.combine(format.timestamp(), format.errors({ stack: true }), format.json()),
  transports: [
    new transports.File(options.file),
   
  ],
};

const instanceLogger = prodLogger;

export const instance = createLogger(instanceLogger);
