'use strict';

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var _require = require('../init'),
    db = _require.db,
    file = _require.file,
    dbNoConnect = _require.dbNoConnect;

var expect = require('chai').expect;
var Data = require('../../servers/data_server');

describe('无数据监控测试', function () {
    before(_asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
        return _regenerator2.default.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        _context.next = 2;
                        return dbNoConnect();

                    case 2:
                    case 'end':
                        return _context.stop();
                }
            }
        }, _callee, undefined);
    })));
    it('存放日志接口,不等待返回', function (done) {
        Data.recordAlert({ id: 1, hid: 1, position: 1 });
        setTimeout(done, 1000);
    });
});
describe('监控测试', function () {
    var dbInstance = null;
    var hostID = 1;
    before(_asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee2() {
        return _regenerator2.default.wrap(function _callee2$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        _context2.next = 2;
                        return db();

                    case 2:
                        dbInstance = _context2.sent;

                    case 3:
                    case 'end':
                        return _context2.stop();
                }
            }
        }, _callee2, undefined);
    })));

    it('获取监控位置的摄像头', _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee3() {
        var ipcs;
        return _regenerator2.default.wrap(function _callee3$(_context3) {
            while (1) {
                switch (_context3.prev = _context3.next) {
                    case 0:
                        _context3.next = 2;
                        return Data.getMointors(hostID, 300);

                    case 2:
                        ipcs = _context3.sent;

                        expect(!ipcs).equal(false);

                    case 4:
                    case 'end':
                        return _context3.stop();
                }
            }
        }, _callee3, undefined);
    })));
});
//# sourceMappingURL=data_server.test.js.map