'use strict';

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

/**
 * Created by Luky on 2017/7/28.
 */
require('../../modify_config');
var live = require('../../../app/servers/ipc_live_server');
var fs = require('fs');
var IPCFactory = require('../../../app/servers/ipc_factory');

var http = require('http');
var wOption = {
    flags: 'w',
    encoding: null,
    fd: null,
    mode: 438,
    autoClose: true
};

var server = http.createServer();
server.listen(3000);

describe('集成测试', function () {
    var dolive = function () {
        var _ref = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee(id, done) {
            var ipc, l;
            return _regenerator2.default.wrap(function _callee$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            _context.next = 2;
                            return IPCFactory.getIPC(id);

                        case 2:
                            ipc = _context.sent;
                            l = new live(server, ipc);

                            l.openWSS();
                            l.on('close', function () {
                                done();
                            });

                        case 6:
                        case 'end':
                            return _context.stop();
                    }
                }
            }, _callee, this);
        }));

        return function dolive(_x, _x2) {
            return _ref.apply(this, arguments);
        };
    }();

    it('大华枪机视频sdk测试', function (done) {
        dolive(1, done);
    });

    it('大华枪机视频onvif测试', function (done) {
        dolive(2, done);
    });

    xit('hopewell枪机视频onvif测试', function (done) {
        dolive(3, done);
    });

    it('大华球机视频sdk测试', function (done) {
        dolive(4, done);
    });

    it('大华球机视频onvif测试', function (done) {
        dolive(5, done);
    });
});
//# sourceMappingURL=live_server.js.map