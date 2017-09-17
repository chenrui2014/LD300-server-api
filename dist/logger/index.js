'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _winston = require('winston');

var _winston2 = _interopRequireDefault(_winston);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var env = process.env.NODE_ENV || 'development'; /**
                                                  * Created by chen on 17-8-21.
                                                  */

var loggerTransports = [];

if (env === 'development') {
    loggerTransports.push(new _winston2.default.transports.Console({
        level: 'debug',
        colorize: true,
        json: false,
        timestamp: true,
        prettyPrint: true
    }));
} else {
    loggerTransports.push(new _winston2.default.transports.File({
        name: 'info-file',
        filename: 'logger-info.log',
        level: 'info'
    }));

    loggerTransports.push(new _winston2.default.transports.File({
        name: 'error-file',
        filename: 'logger-error.log',
        level: 'error'
    }));
}

var logger = new _winston2.default.Logger({
    transports: loggerTransports,
    exitOnError: false
});

exports.default = logger;
//# sourceMappingURL=index.js.map