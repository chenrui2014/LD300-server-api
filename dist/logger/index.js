'use strict';

/**
 * Created by chen on 17-8-21.
 */
var winston = require('winston');
//import winston from 'winston';

var env = process.env.NODE_ENV || 'development';
var loggerTransports = [];

if (env === 'development') {
    loggerTransports.push(new winston.transports.Console({
        level: 'debug',
        colorize: true,
        json: false,
        timestamp: true,
        prettyPrint: true
    }));
} else {
    loggerTransports.push(new winston.transports.File({
        name: 'info-file',
        filename: 'logger-info.log',
        level: 'info'
    }));

    loggerTransports.push(new winston.transports.File({
        name: 'error-file',
        filename: 'logger-error.log',
        level: 'error'
    }));
}

var logger = new winston.Logger({
    transports: loggerTransports,
    exitOnError: false
});

exports = module.exports = logger;
//export default logger;
//# sourceMappingURL=index.js.map