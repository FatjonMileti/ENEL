const winston = require('winston');

//add custom logging levels
let logger = new winston.Logger({
  level: process.env.LOG_LEVEL || 'debug',
  transports: [
    new (winston.transports.Console)({
      level: process.env.LOG_LEVEL || 'debug',
      timestamp: true,
      colorize: true,
      stderrLevels: []
    })
  ],
  exitOnError: false
});

module.exports = logger;