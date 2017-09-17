'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = connect;

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

var _logger = require('../logger');

var _logger2 = _interopRequireDefault(_logger);

var _config = require('../config');

var _config2 = _interopRequireDefault(_config);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function connect() {

    return new Promise(function (resolve, reject) {
        _mongoose2.default.Promise = global.Promise;
        _mongoose2.default.connection.on('error', function (error) {
            return reject(error);
        }).on('close', function () {
            return _logger2.default.info('Database connection closed.');
        }).on('open', function () {
            return resolve(_mongoose2.default.connections[0]);
        });

        _mongoose2.default.connect(_config2.default.mongo.uri, _config2.default.mongo.options);
    });
} /**
   * Created by chen on 17-8-21.
   */
//# sourceMappingURL=index.js.map