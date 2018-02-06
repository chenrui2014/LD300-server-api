'use strict';

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var Server = require('../../../servers/ipc_server_child');

var _require = require('../../init'),
    db = _require.db,
    file = _require.file;

describe('ipc_server_child服务测试', function () {
    it('启动', _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
        var connection;
        return _regenerator2.default.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        _context.next = 2;
                        return db();

                    case 2:
                        connection = _context.sent;
                        _context.next = 5;
                        return new Promise(function (resolve) {
                            setTimeout(resolve, 100000000);
                        });

                    case 5:
                        _context.next = 7;
                        return connection.close();

                    case 7:
                        return _context.abrupt('return', _context.sent);

                    case 8:
                    case 'end':
                        return _context.stop();
                }
            }
        }, _callee, undefined);
    })));
});
//# sourceMappingURL=ipc_server_child.test.js.map