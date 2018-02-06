'use strict';

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var getUrl = function () {
    var _ref = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
        var a;
        return _regenerator2.default.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        if (!port) {
                            _context.next = 2;
                            break;
                        }

                        return _context.abrupt('return', port);

                    case 2:
                        a = server.address();

                        if (!(a && 'port' in a)) {
                            _context.next = 5;
                            break;
                        }

                        return _context.abrupt('return', port = a.port);

                    case 5:
                        server.on('listening', function () {
                            return port = server.address().port;
                        });

                    case 6:
                    case 'end':
                        return _context.stop();
                }
            }
        }, _callee, this);
    }));

    return function getUrl() {
        return _ref.apply(this, arguments);
    };
}();

var send = function () {
    var _ref2 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee2(path) {
        var port, options;
        return _regenerator2.default.wrap(function _callee2$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        _context2.next = 2;
                        return getUrl();

                    case 2:
                        port = _context2.sent;
                        options = {
                            hostname: 'localhost',
                            port: port,
                            path: path,
                            method: 'GET',
                            headers: {
                                'Content-Type': 'application/x-www-form-urlencoded'
                            }
                        };
                        return _context2.abrupt('return', new Promise(function (resolve) {
                            var req = http.request(options, function (res) {
                                res.setEncoding('utf8');
                                res.on('data', function (data) {
                                    resolve(JSON.parse(data));
                                });
                            });
                            req.end();
                        }));

                    case 5:
                    case 'end':
                        return _context2.stop();
                }
            }
        }, _callee2, this);
    }));

    return function send(_x) {
        return _ref2.apply(this, arguments);
    };
}();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

//require('../modify_config');
var _require = require('../init'),
    db = _require.db,
    file = _require.file;

var http = require('http');

var _require2 = require('../../servers/ipc_server_child'),
    server = _require2.server;

var expect = require('chai').expect;
var port = 0;


describe('直播子进程http服务测试', function () {

    var dbInstance = null;
    before(_asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee3() {
        return _regenerator2.default.wrap(function _callee3$(_context3) {
            while (1) {
                switch (_context3.prev = _context3.next) {
                    case 0:
                        _context3.next = 2;
                        return file();

                    case 2:
                        dbInstance = _context3.sent;

                    case 3:
                    case 'end':
                        return _context3.stop();
                }
            }
        }, _callee3, undefined);
    })));

    after(_asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee4() {
        return _regenerator2.default.wrap(function _callee4$(_context4) {
            while (1) {
                switch (_context4.prev = _context4.next) {
                    case 0:
                        if (!dbInstance) {
                            _context4.next = 3;
                            break;
                        }

                        _context4.next = 3;
                        return dbInstance.close();

                    case 3:
                    case 'end':
                        return _context4.stop();
                }
            }
        }, _callee4, undefined);
    })));

    it('直播及获取地址', function (done) {
        send('/ipc/5/live').then(function (data) {
            expect(data.id - 0).equal(5);
            expect(data.type).equal('succeed');
            expect(data.fn).equal('live');
            expect(data.path.indexOf('/live/1') > -1).equal(true);
            expect(data.port).equal(port);
            done();
        });
    });

    it('获取不存在的摄像头播放地址', function (done) {
        send('/ipc/188/live').then(function (data) {
            expect(data.id).equal(188);
            expect(data.type).equal('fault');
            expect(data.fn).equal('live');
            done();
        });
    });

    it('启用文件流', function (done) {
        send('/ipc/5/arrchive/1').then(function (data) {
            expect(data.id - 0).equal(1);
            expect(data.hid - 0).equal(1);
            expect(data.type).equal('succeed');
            expect(data.fn).equal('arrchive');
            done();
        });
    });

    it('关闭文件流', function (done) {
        var stop = function stop() {
            send('/ipc/5/stoparrchive/1').then(function (data) {
                expect(data.id).equal(1);
                expect(data.fn).equal('stopArrchive');
                done();
            });
        };
        send('/ipc/5/arrchive/1').then(function (data) {
            expect(data.type).equal('succeed');
            setTimeout(stop, 2000);
        });
    });

    it('获取球机xyz', function (done) {
        send('/ipc/5/getpoint').then(function (data) {
            done();
        });
    });

    it('拉响警报', function (done) {
        send('/ipc/5/alarm/1').then(function (data) {
            expect(data.type).equal('succeed');
            done();
        });
    });

    it('关闭警报', function (done) {
        send('/ipc/5/stopAlarm/1').then(function (data) {
            expect(data.type).equal('succeed');
            done();
        });
    });

    it('移动到point', function (done) {
        var x = encodeURI(JSON.stringify({ x: 1, y: 1, z: 1, preset: null }));
        send('/ipc/5/moveToPoint/1?point=' + x).then(function (data) {
            expect(data.type).equal('succeed');
            done();
        });
    });

    describe('ptz测试', function () {
        it('无人占用时申请', function (done) {
            send('/ipc/5/ptz/zoomAdd').then(function (data) {
                expect(data.type).equal('succeed');
                expect(data.handle.length > 0).equal(true);
                expect(data.limit > 0).equal(true);
                done();
            });
        });
        describe('标记占有', function () {
            var handle = '',
                timeout = 0;
            before(function (done) {
                send('/ipc/5/ptz/zoomAdd').then(function (data) {
                    expect(data.type).equal('succeed');
                    timeout = data.limit;
                    handle = data.handle;
                    done();
                });
            });

            it('二次使用', function (done) {
                send('/ipc/5/ptz/zoomAdd?handle=' + handle).then(function (data) {
                    expect(data.type).equal('succeed');
                    expect(data.handle).equal(handle);
                    done();
                });
            });

            it('释放所有权', function (done) {
                send('/ipc/5/freeptz?handle=' + handle).then(function (data) {
                    expect(data.type).equal('succeed');
                    done();
                });
            });

            it('他人申请', function (done) {
                send('/ipc/5/ptz/zoomAdd').then(function (data) {
                    expect(data.type).equal('fault');
                    done();
                });
            });

            it('释放后再申请', function (done) {
                setTimeout(function () {
                    send('/ipc/5/ptz/zoomAdd').then(function (data) {
                        expect(data.type).equal('succeed');
                        done();
                    });
                }, timeout + 1);
            });
        });
    });
});
//# sourceMappingURL=ipc_server_child.test.js.map