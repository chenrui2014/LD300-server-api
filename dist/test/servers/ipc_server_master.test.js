'use strict';

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var send = function () {
    var _ref = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee(path) {
        var options;
        return _regenerator2.default.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        options = {
                            hostname: 'localhost',
                            port: port,
                            path: path,
                            method: 'GET',
                            headers: {
                                'Content-Type': 'application/x-www-form-urlencoded'
                            }
                        };
                        return _context.abrupt('return', new Promise(function (resolve) {
                            var req = http.request(options, function (res) {
                                res.setEncoding('utf8');
                                res.on('data', function (data) {
                                    resolve(JSON.parse(data));
                                });
                            });
                            req.end();
                        }));

                    case 2:
                    case 'end':
                        return _context.stop();
                }
            }
        }, _callee, this);
    }));

    return function send(_x) {
        return _ref.apply(this, arguments);
    };
}();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var _require = require('../init'),
    db = _require.db,
    file = _require.file;

var http = require('http');
var IPCDispatch = require('../../servers/ipc_server_master');
var expect = require('chai').expect;

var port = 3000;

describe('ipc分发服务测试', function () {
    var dbInstance = null;
    var server = new IPCDispatch();
    before(_asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee2() {
        return _regenerator2.default.wrap(function _callee2$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        _context2.next = 2;
                        return file();

                    case 2:
                        dbInstance = _context2.sent;
                        _context2.next = 5;
                        return server.start({ port: port });

                    case 5:
                    case 'end':
                        return _context2.stop();
                }
            }
        }, _callee2, undefined);
    })));
    it('测试同一个ipc的分发', _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee3() {
        return _regenerator2.default.wrap(function _callee3$(_context3) {
            while (1) {
                switch (_context3.prev = _context3.next) {
                    case 0:
                        _context3.next = 2;
                        return send('/ipc/6/live');

                    case 2:
                        _context3.next = 4;
                        return send('/ipc/6/live');

                    case 4:
                        _context3.next = 6;
                        return send('/ipc/6/live');

                    case 6:
                    case 'end':
                        return _context3.stop();
                }
            }
        }, _callee3, undefined);
    })));
    it('测试不同ipc的分发', _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee4() {
        return _regenerator2.default.wrap(function _callee4$(_context4) {
            while (1) {
                switch (_context4.prev = _context4.next) {
                    case 0:
                        _context4.next = 2;
                        return send('/ipc/6/live');

                    case 2:
                        _context4.next = 4;
                        return send('/ipc/6/live');

                    case 4:
                        _context4.next = 6;
                        return send('/ipc/1/live');

                    case 6:
                    case 'end':
                        return _context4.stop();
                }
            }
        }, _callee4, undefined);
    })));
});
//# sourceMappingURL=ipc_server_master.test.js.map