'use strict';

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

require('../modify_config');
var IPCFactory = require('../../app/servers/ipc_factory');
var H264_2Flv = require('../../app/servers/cache/to_flv_cache');
var H254_2Flv_Ffmpeg = require('../../app/_ffmpeg/stream_ffmpeg_pipe');
var fs = require('fs');
var wOption = {
    flags: 'w',
    encoding: null,
    fd: null,
    mode: 438,
    autoClose: true
};

describe('ffmpeg及h264打包格式对比', function () {
    it('', function () {
        var _ref = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee(done) {
            var ipc, convert, f1, f2, f3, convert2;
            return _regenerator2.default.wrap(function _callee$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            _context.next = 2;
                            return IPCFactory.getIPC(1);

                        case 2:
                            ipc = _context.sent;
                            convert = new H264_2Flv(true, false);
                            f1 = fs.createWriteStream('d:/ipc_h264.flv', wOption);
                            f2 = fs.createWriteStream('d:/ipc_h264_ffmpeg.flv', wOption);
                            f3 = fs.createWriteStream('d:/ipc_h264_hex.txt', wOption);

                            convert.addClient(function (data) {
                                f1.write(data);
                            });
                            convert2 = new H254_2Flv_Ffmpeg({ 'audio': false, 'codec': 'copy' });

                            convert2.on('data', function (data) {
                                f2.write(data);
                            });
                            ipc.on('video', function (data) {
                                f3.write(data.toString('hex') + '\r');
                                convert.write(data);
                                convert2.writeVedio(data);
                            });

                            ipc.realPlay().then(function () {
                                console.log('已启动');
                                setTimeout(function () {
                                    ipc.stopRealPlay().then(done).catch(done);
                                    f1.close();
                                    f2.close();
                                    f3.close();
                                }, 10000);
                            }).catch(done);

                        case 12:
                        case 'end':
                            return _context.stop();
                    }
                }
            }, _callee, undefined);
        }));

        return function (_x) {
            return _ref.apply(this, arguments);
        };
    }());
});
//# sourceMappingURL=h264_2flv.format.test.js.map