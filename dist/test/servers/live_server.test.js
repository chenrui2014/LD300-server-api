'use strict';

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var Live = require('../../app/servers/ipc_live_server');
var http = require('http');
var _ = require('lodash');
var DHIPC = require('../../app/ipcs/dahua/dh_ipc');
var ipcOptions = require('../data/dhipc.json');
var expect = require('chai').expect;
var fs = require('fs');
var WebSocket = require('ws');
var port = 3001;

describe('摄像头直播流服务测试,请先打开摄像头98', function () {

    var server = null,
        ipc = null,
        live = null;
    before(function () {
        server = http.createServer();
        server.listen(port);
        ipc = new DHIPC(ipcOptions);
        live = new Live(server, ipc, '', { autoClose: true });
    });

    after(function () {
        server.close();
    });

    it('启动摄像头视频输出', function (done) {
        live._play().then(function (data) {
            expect(!data).equal(false);
            expect(!live._cache).equal(false);
            expect(live.path).equal('/live/' + ipc.id);
            live._stopPlay();
            expect(!live._cache).equal(true);
            done();
        }).catch(done);
    });

    it('流保存成文件,并自动关闭流', function (done) {
        var x = 0;
        live.on('file', function (data) {
            x++;
            expect(data.path.length > 0).equal(true);
            fs.exists(data.path, function (exists) {
                expect(exists).equal(true);
            });
        });
        live.on('fileClosed', function (data) {
            x++;
            expect(data.path.length > 0).equal(true);
            fs.exists(data.path, function (exists) {
                expect(exists).equal(true);
            });
        });
        live.on('close', function (data) {
            x++;
            expect(data.id).equal(ipc.id);
            expect(data.path).equal('/live/' + ipc.id);
        });
        live.arrchive(1).then(function (path) {
            expect(!live._file).equal(false);
            expect(path.length > 0).to.equal(true);
            fs.exists(path, function (exists) {
                expect(exists).equal(true);
            });
            setTimeout(function () {
                live.stopArrchive();
                expect(!live._file).equal(true);
                var state = fs.statSync(path);
                expect(state.size > 0).equal(true);
                expect(x).equal(3);
                done();
            }, 2000);
        }).catch(done);
    });

    it('启动websocket', function () {
        var _ref = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee(done) {
            var url, x, ws, Ping, FLVVerify;
            return _regenerator2.default.wrap(function _callee$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            url = 'ws://localhost:' + port + live.path;
                            x = 0;

                            live.on('open', function () {
                                expect(x++).equal(0);
                            });
                            _context.next = 5;
                            return live.openWSS().catch(done);

                        case 5:
                            ws = new WebSocket(url);

                            Ping = function Ping(data) {
                                expect(!data).equal(false);
                                ws.pong('', false, true);
                                expect(x++).equal(1);
                                ws.close();
                            };

                            ws.on('ping', Ping);
                            ws.on('close', function () {
                                ws.removeAllListeners();
                            });
                            live.on('close', function () {
                                done();
                            });

                            FLVVerify = function FLVVerify(data) {
                                ws.removeListener('message', FLVVerify);
                                expect(data.indexOf(Buffer.from("FLV"))).equal(0);
                            };

                            ws.on('message', FLVVerify);

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
//# sourceMappingURL=live_server.test.js.map