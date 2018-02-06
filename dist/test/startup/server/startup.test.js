'use strict';

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var _require = require('../../init'),
    db = _require.db,
    file = _require.file;

var StartUp = require('../../../servers/startup');
var vHost = require('../../../host/virtual_host');
var _ = require('lodash');
process.debugPort = 9600;

var s = null,
    vh = null;
var dbInstance = null;

var before = function () {
    var _ref = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
        return _regenerator2.default.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        //打开注释启动数据库取数据
                        //dbInstance=await db();
                        s = new StartUp();
                        vh = new vHost(1);
                        _context.next = 4;
                        return Promise.all([vh.start(), s.start()]);

                    case 4:
                    case 'end':
                        return _context.stop();
                }
            }
        }, _callee, undefined);
    }));

    return function before() {
        return _ref.apply(this, arguments);
    };
}();

var after = function () {
    var _ref2 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee2() {
        return _regenerator2.default.wrap(function _callee2$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        if (!dbInstance) {
                            _context2.next = 3;
                            break;
                        }

                        _context2.next = 3;
                        return dbInstance.close();

                    case 3:
                        s.stop();
                        console.log('结束了');
                        process.exit();

                    case 6:
                    case 'end':
                        return _context2.stop();
                }
            }
        }, _callee2, undefined);
    }));

    return function after() {
        return _ref2.apply(this, arguments);
    };
}();

var run = function run() {
    setInterval(function () {
        var r = _.random(0, 1, false);
        r === 0 ? vh.send(vHost.CMD.normal) : vh.send(vHost.CMD.alarm, 100);
    }, 40000);
};

before().then(run);
//setTimeout(after,15000);
//# sourceMappingURL=startup.test.js.map