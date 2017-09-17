'use strict';

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _koa = require('koa');

var _koa2 = _interopRequireDefault(_koa);

var _koaBodyparser = require('koa-bodyparser');

var _koaBodyparser2 = _interopRequireDefault(_koaBodyparser);

var _koaBody = require('koa-body');

var _koaBody2 = _interopRequireDefault(_koaBody);

var _logger = require('./logger');

var _logger2 = _interopRequireDefault(_logger);

var _db = require('./db');

var _db2 = _interopRequireDefault(_db);

var _babelPolyfill = require('babel-polyfill');

var _babelPolyfill2 = _interopRequireDefault(_babelPolyfill);

var _config = require('./config');

var _config2 = _interopRequireDefault(_config);

var _router = require('./router');

var _router2 = _interopRequireDefault(_router);

var _koa2Cors = require('koa2-cors');

var _koa2Cors2 = _interopRequireDefault(_koa2Cors);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * Created by chen on 17-8-21.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            */


var app = new _koa2.default();

// app.use(cors())

app.use(function (ctx, next) {
    // if (ctx.request.header.host.split(':')[0] === 'localhost' || ctx.request.header.host.split(':')[0] === '127.0.0.1') {
    //     ctx.set('Access-Control-Allow-Origin', '*')
    // } else {
    //     ctx.set('Access-Control-Allow-Origin', config.ip)
    // }

    ctx.set('Access-Control-Allow-Origin', '*');
    ctx.set('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    ctx.set('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
    ctx.set('Access-Control-Allow-Credentials', true); // 允许带上 cookie
    return next();
}).use((0, _koaBody2.default)({
    multipart: true,
    strict: false,
    formidable: {
        uploadDir: _path2.default.join(__dirname, '../assets/uploads/tmp')
    },
    jsonLimit: '10mb',
    formLimit: '10mb',
    textLimit: '10mb'
}));

app.use(_router2.default.routes()).use(_router2.default.allowedMethods());

// app.use((ctx) => {
//
//     logger.info("server");
//     ctx.body = "hello,world";
// });

_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
    var connection;
    return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
            switch (_context.prev = _context.next) {
                case 0:
                    _context.prev = 0;
                    _context.next = 3;
                    return (0, _db2.default)();

                case 3:
                    connection = _context.sent;

                    _logger2.default.info('connected to MongoDB %s:%s/%s', connection.host, connection.port, connection.name);
                    _context.next = 11;
                    break;

                case 7:
                    _context.prev = 7;
                    _context.t0 = _context['catch'](0);

                    _logger2.default.error(_context.t0);
                    process.exit(-1);

                case 11:
                    _context.next = 13;
                    return app.listen(_config2.default.port, _config2.default.ip);

                case 13:
                    _logger2.default.info('Server start at %s:%s', _config2.default.ip, _config2.default.port);

                case 14:
                case 'end':
                    return _context.stop();
            }
        }
    }, _callee, undefined, [[0, 7]]);
}))();

// app.listen(3000);
//# sourceMappingURL=app.js.map