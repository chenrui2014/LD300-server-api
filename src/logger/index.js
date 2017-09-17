/**
 * Created by chen on 17-8-21.
 */
import winston from 'winston';

const env = process.env.NODE_ENV || 'development';
const loggerTransports = [];

if (env === 'development') {
    loggerTransports.push(new (winston.transports.Console)({
        level: 'debug',
        colorize: true,
        json: false,
        timestamp: true,
        prettyPrint: true,
    }));
}else{
    loggerTransports.push(new (winston.transports.File)({
        name : 'info-file',
        filename:'logger-info.log',
        level:'info'
    }));

    loggerTransports.push(
        new (winston.transports.File)({
            name:'error-file',
            filename:'logger-error.log',
            level:'error'
        })
    );

}

const logger = new (winston.Logger)({
    transports: loggerTransports,
    exitOnError: false,
});

export default logger;