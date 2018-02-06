'use strict';

/**
 * Created by chen on 17-8-17.
 */
//import path from 'path';
//import _ from 'lodash';
var path = require('path');
var _ = require('lodash');
var config = global.server_config || require('./config');

var env = process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var base = {
    env: env,

    // root path of server
    root: path.normalize('${__dirname}/../'),

    // server port
    port: process.env.PORT || _.get(config, 'web.port', 9000),

    // server ip
    ip: process.env.IP || '127.0.0.1',

    keys: ['LD300-api'],

    jwt: {
        secret: 'LD300-api-secret',
        expiresInSeconds: 60 * 60 * 10
    },

    seedDB: false,

    cors: true,

    mongo: {
        uri: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/LD300',
        options: {
            db: {
                safe: true
            },
            useMongoClient: true
        }
    }

};

/* eslint-disable global-require */
var envConfig = require('./' + process.env.NODE_ENV).default;
/* eslint-enable global-require */

//export default config;
exports = module.exports = _.merge(base, envConfig);
//# sourceMappingURL=index.js.map