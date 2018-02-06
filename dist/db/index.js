'use strict';

/**
 * Created by chen on 17-8-21.
 */
var mongoose = require('mongoose');
var logger = require('../logger');
var config = require('../config/index');
//import mongoose from 'mongoose';
//import logger from '../logger';
//import config from '../config';
// import bluebird from 'bluebird';

//export default
exports = module.exports = function connect() {

    return new Promise(function (resolve, reject) {
        mongoose.Promise = global.Promise;
        //mongoose.Promise = bluebird;
        mongoose.connection.on('error', function (error) {
            return reject(error);
        }).on('close', function () {
            return logger.info('Database connection closed.');
        }).on('open', function () {
            return resolve(mongoose.connections[0]);
        });

        mongoose.connect(config.mongo.uri, config.mongo.options);
    });
};
//# sourceMappingURL=index.js.map