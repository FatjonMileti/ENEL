const winston = require('winston');
const fs = require('fs');
const path = require('path');
const logDir = 'log'; // directory path you want to set

if (!fs.existsSync(logDir)) {
    // Create the directory if it does not exist
    fs.mkdirSync(logDir);
}

const port = process.env.PORT || 3030;

//add custom logging levels
let logger = new winston.Logger({
    level: process.env.LOG_LEVEL || 'debug',
    transports: [
        new(winston.transports.Console)({
            name: 'justConsole',
            level: process.env.LOG_LEVEL || 'debug',
            // timestamp: true,
            colorize: true,
            stderrLevels: []
        }),
        new winston.transports.File({
            name: 'warningsAndErrors',
            jason: false,
            filename: path.join(logDir, `/${port}-custom_error.log`),
            level: 'warn',
        }),
        new winston.transports.File({
            name: 'all',
            filename: path.join(logDir, `/${port}-all.log`),
            level: process.env.LOG_LEVEL || 'debug',
            json: false,
            maxsize: 10000000,
            maxFiles: 4,
            tailable: true
        })
    ],
    exitOnError: false
});

module.exports = logger;