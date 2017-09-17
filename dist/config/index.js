'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Created by chen on 17-8-17.
 */
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var base = {
    env: process.env.NODE_ENV,

    // root path of server
    root: _path2.default.normalize('${__dirname}/../'),

    // server port
    port: process.env.PORT || 9000,

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

var config = _lodash2.default.merge(base, envConfig);

exports.default = config;
//# sourceMappingURL=index.js.map