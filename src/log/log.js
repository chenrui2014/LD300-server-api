const _=require('lodash');
const path=require('path');
const config=global.server_config||require('../config/config');
const log4js = require('log4js');
const mkdirp=require('mkdirp');
const logs_dirs=config.getLogDir();
const logDir=path.resolve(logs_dirs,'log');
const errorDir=path.resolve(logs_dirs,'error');
const warnDir=path.resolve(logs_dirs,'error');
mkdirp.sync(logDir);
mkdirp.sync(errorDir);
mkdirp.sync(warnDir);

log4js.configure({
    appenders: [
        {
            type:"console",
            category:"console",
            level:'info'
        },{
            category:'info',
            type: 'dateFile',
            absolute:true,
            filename: path.resolve(config.getLogDir(),'log/log'),
            maxLogSize : 102400,//单位字节,现在配置100KB
            encoding : 'utf-8',
            alwaysIncludePattern: true,
            pattern: "-yyyy-MM-dd-hh.log",
            level:'info'
        }, {
            category:'error',
            type: 'dateFile',
            absolute:true,
            filename: path.resolve(config.getLogDir(),'error/error'),
            maxLogSize : 102400,//单位字节,现在配置100KB
            encoding : 'utf-8',
            alwaysIncludePattern: true,
            pattern: "-yyyy-MM-dd-hh.log",
            level:'info'
        }]
});

const consoleLogger=log4js.getLogger('console');
const logger = log4js.getLogger('info');
const errorLogger = log4js.getLogger('error');

function log(fileLogger,source,_params,desc,params){
    let log=_.extend({
        desc:desc,
        time:new Date().toLocaleString()
    },_params,params,{source:source});
    let logStr=JSON.stringify(log);
    logger.info(logStr);
    consoleLogger.info(logStr);
    fileLogger.info(logStr);
    return log;
}

function error(fileLogger,source,_params,desc,params){
    let log=_.extend({
        desc:desc
    },_params,params,{source:source});
    let logStr=JSON.stringify(log);
    logger.error(logStr);
    errorLogger.error(logStr);
    consoleLogger.error(logStr);
    fileLogger.error(logStr);
    return log;
}

function warn(fileLogger,source,_params,desc,params){
    let log=_.extend({
        desc:desc
    },_params,params,{source:source});
    let logStr=JSON.stringify(log);
    logger.warn(logStr);
    errorLogger.warn(logStr);
    consoleLogger.warn(logStr);
    fileLogger.warn(logStr);
    return log;
}

function Parser(classOrObject,source,params){
    let name=source.split('.')[0];
    let p=path.resolve(config.getLogDir(),`log/${name}`);
    mkdirp.sync(p);
    log4js.addAppender(log4js.appenderMakers['dateFile']({
        category:name,
        type: 'dateFile',
        absolute:true,
        filename: `${p}/${name}`,
        maxLogSize : 102400,//单位字节,现在配置100KB
        encoding : 'utf-8',
        alwaysIncludePattern: true,
        pattern: "-yyyy-MM-dd-hh.log",
        level:'info'
    }),name);
    const fileLogger=log4js.getLogger(name);
    classOrObject.info=classOrObject.log=log.bind(null,fileLogger,source,params);
    classOrObject.error=error.bind(null,fileLogger,source,params);
    classOrObject.warn=warn.bind(null,fileLogger,source,params);
}

exports=module.exports={
    Parser:Parser
};