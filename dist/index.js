'use strict';

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

require('./init');
var _ = require('lodash');
var config = server_config || require('./config/config');
var store = _.get(config, "runMode.store", "db");
var type = _.get(config, "runMode.type", "BS");
var connect = require('./db');

var _require = require('./log/log'),
    Parser = _require.Parser;

var process = require('process');
var startUp = require('./servers/startup');
var app = require('./app');
var logger = {};
Parser(logger, 'index.js', { store: store, type: type });
_asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
    var connection;
    return _regenerator2.default.wrap(function _callee$(_context) {
        while (1) {
            switch (_context.prev = _context.next) {
                case 0:
                    _context.prev = 0;

                    if (!(store === 'db')) {
                        _context.next = 6;
                        break;
                    }

                    _context.next = 4;
                    return connect();

                case 4:
                    connection = _context.sent;

                    logger.log('MongoDB已连接', { host: connection.host, port: connection.port, name: connection.name });

                case 6:
                    _context.next = 8;
                    return new startUp().start();

                case 8:
                    if (!(type === 'BS')) {
                        _context.next = 11;
                        break;
                    }

                    _context.next = 11;
                    return app();

                case 11:
                    _context.next = 17;
                    break;

                case 13:
                    _context.prev = 13;
                    _context.t0 = _context['catch'](0);

                    logger.error('启动失败', { innerError: _context.t0.toString() });
                    process.exit(-1);

                case 17:
                case 'end':
                    return _context.stop();
            }
        }
    }, _callee, undefined, [[0, 13]]);
}))();
//# sourceMappingURL=index.js.map