'use strict';

var _ = require('lodash');
var path = require('path');
var config = global.server_config || require('../config/config');
var log4js = require('log4js');
var mkdirp = require('mkdirp');
var logs_dirs = config.getLogDir();
var logDir = path.resolve(logs_dirs, 'log');
var errorDir = path.resolve(logs_dirs, 'error');
var warnDir = path.resolve(logs_dirs, 'error');
var process = require('process');
var productionsEnv = (process.env.NODE_ENV || 'production') === 'production';
mkdirp.sync(logDir);
mkdirp.sync(errorDir);
mkdirp.sync(warnDir);

log4js.configure({
    appenders: [{
        type: "console",
        category: "console",
        level: 'info'
    }, {
        category: 'info',
        type: 'dateFile',
        absolute: true,
        filename: path.resolve(config.getLogDir(), 'log/log'),
        maxLogSize: 102400, //单位字节,现在配置100KB
        encoding: 'utf-8',
        alwaysIncludePattern: true,
        pattern: "-yyyy-MM-dd-hh.log",
        level: 'info'
    }, {
        category: 'error',
        type: 'dateFile',
        absolute: true,
        filename: path.resolve(config.getLogDir(), 'error/error'),
        maxLogSize: 102400, //单位字节,现在配置100KB
        encoding: 'utf-8',
        alwaysIncludePattern: true,
        pattern: "-yyyy-MM-dd-hh.log",
        level: 'info'
    }]
});

var consoleLogger = log4js.getLogger('console');
var logger = log4js.getLogger('info');
var errorLogger = log4js.getLogger('error');

function log(fileLogger, source, _params, desc, params) {
    var log = _.extend({
        desc: desc,
        time: new Date().toLocaleString()
    }, _params, params, { source: source });
    var logStr = JSON.stringify(log);
    logger.info(logStr);
    !productionsEnv && consoleLogger.info(logStr);
    fileLogger.info(logStr);
    return log;
}

function error(fileLogger, source, _params, desc, params) {
    var log = _.extend({
        desc: desc
    }, _params, params, { source: source });
    var logStr = JSON.stringify(log);
    logger.error(logStr);
    errorLogger.error(logStr);
    !productionsEnv && consoleLogger.error(logStr);
    fileLogger.error(logStr);
    return log;
}

function warn(fileLogger, source, _params, desc, params) {
    var log = _.extend({
        desc: desc
    }, _params, params, { source: source });
    var logStr = JSON.stringify(log);
    logger.warn(logStr);
    errorLogger.warn(logStr);
    !productionsEnv && consoleLogger.warn(logStr);
    fileLogger.warn(logStr);
    return log;
}

function Parser(classOrObject, source, params) {
    var name = source.split('.')[0];
    var p = path.resolve(config.getLogDir(), 'log/' + name);
    mkdirp.sync(p);
    log4js.addAppender(log4js.appenderMakers['dateFile']({
        category: name,
        type: 'dateFile',
        absolute: true,
        filename: p + '/' + name,
        maxLogSize: 102400, //单位字节,现在配置100KB
        encoding: 'utf-8',
        alwaysIncludePattern: true,
        pattern: "-yyyy-MM-dd-hh.log",
        level: 'info'
    }), name);
    var fileLogger = log4js.getLogger(name);
    classOrObject.info = classOrObject.log = log.bind(null, fileLogger, source, params);
    classOrObject.error = error.bind(null, fileLogger, source, params);
    classOrObject.warn = warn.bind(null, fileLogger, source, params);
}

exports = module.exports = {
    Parser: Parser
};
//# sourceMappingURL=log.js.map