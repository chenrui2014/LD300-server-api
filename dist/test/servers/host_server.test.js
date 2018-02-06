'use strict';

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

/*let port=0;
async function getUrl(){
    if(port) return port;
    let a=IPCServer.address();
    if(a&&'port' in a) return port=a.port;
    IPCServer.on('listening',()=>{
        return port=IPCServer.address().port;
    });
}*/

var getUrl = function () {
    var _ref = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
        return _regenerator2.default.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        return _context.abrupt('return', port);

                    case 1:
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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var _require = require('../init'),
    db = _require.db,
    file = _require.file;

var _require2 = require('../modify_config'),
    setHostData = _require2.setHostData,
    setMData = _require2.setMData,
    setIpcData = _require2.setIpcData;

var _ = require('lodash');
var config = require('../../config/config');
var port = _.get(config, 'ipc_server.port');
var Server = require('../../servers/host_server');
var expect = require('chai').expect;
var vHost = require('../../host/virtual_host');
var Host = require('../../host/host');
var SerialPort = require('../../serialport/serialport');
//const IPCServer=require('../../servers/ipc_server_child').server;
//const M=require('../../servers/ipc_mointors');
var master = require('../../servers/ipc_server_master');
var IPCServer = new master();
var Factory = require('../../servers/ipc_factory');

describe('主机服务测试用例', function () {
    var dbInstance = null;
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
                        return IPCServer.start();

                    case 5:
                    case 'end':
                        return _context2.stop();
                }
            }
        }, _callee2, undefined);
    })));

    it('启动关闭', function (done) {
        var server = new Server();
        setHostData([{ id: 1, port: '\\\\.\\COM2' }, { id: 1, port: '\\\\.\\COM4' }]);
        server.start().then(function () {
            var testHostStart = function testHostStart() {
                _.forEach(server.hosts, function (host) {
                    expect(host.instance.isConnected).equal(true);
                });
                server.stop();
                done();
            };
            setTimeout(testHostStart, 200);
        }).catch(done);
    });

    it('报警，启动并停止视频录像', function (done) {
        getUrl().then(function (port) {
            var server = new Server({ ipc_server: {
                    port: port
                } });
            server._arrchive(6, 1).then(function () {
                setTimeout(function () {
                    server._stopArrchive(6, 1).then(done).catch(done);
                }, 1800);
            }).catch(done);
        });
    });

    it('拉起警报再关闭', function (done) {
        getUrl().then(function (port) {
            var server = new Server({ ipc_server: {
                    port: port
                } });
            server._alarm(1, 1).then(function () {
                setTimeout(function () {
                    server._stopAlarm(1, 1).then(done).catch(done);
                }, 1800);
            }).catch(done);
        });
    });

    it('移动ptz到xyz', function (done) {
        getUrl().then(function (port) {
            var server = new Server({ ipc_server: {
                    port: port
                } });
            server._moveToPoint(1, { x: 1, y: 1, z: 1, preset: null }, 1).then(done).catch(done);
        });
    });

    describe('服务状态事件测试', function () {
        var port = void 0;
        var loopID = 0;
        before(function (done) {
            port = new SerialPort(1, vHost.portOptions);
            port.connect().then(done).catch(done);
        });
        after(function (done) {
            port.disConnect().then(done).catch(done);
        });
        it('状态改变测试unknown->normal', function (done) {
            var server = new Server();
            var state = Host.States.Unknown;
            server.on(Host.Events.StateChanged, function (data) {
                expect(data.type).equal(Host.Events.StateChanged);
                expect('id' in data).equal(true);
                expect('hid' in data).equal(true);
                expect(data.stateOld === state).equal(true);
                expect(data.stateNew === Host.States.Normal).equal(true);
                server.stop();
                clearInterval(loopID);
                setTimeout(done, 200);
            });
            setHostData([{ id: 1, port: '\\\\.\\COM2' }]);
            server.start().then(function () {
                loopID = setInterval(function () {
                    port.write(vHost.nomalCmd);
                }, 200);
            }).catch(done);
        });

        it('报警,调摄像头', function (done) {
            getUrl().then(function (httpport) {
                var server = new Server({
                    ipc_server: {
                        port: httpport
                    }
                });
                server.on(Host.Events.StateChanged, function (evt) {
                    expect(evt.type).equal(Host.Events.StateChanged);
                    expect(evt.stateNew).equal(Host.States.Alarm);
                    expect(evt.monintors.length).equal(1);
                    server.stop();
                    clearInterval(loopID);
                    done();
                });
                setHostData([{ id: 1, port: '\\\\.\\COM2' }]);
                server.start().then(function () {
                    //server.hosts[0].m=mt;
                    loopID = setInterval(function () {
                        //position 82 有摄像头，2000没有
                        port.write(vHost.AlarmCmd(82));
                    }, 200);
                }).catch(done);
            });
        });

        it('报警,找不到调摄像头', function (done) {
            getUrl().then(function (httpport) {
                var server = new Server({
                    ipc_server: {
                        port: httpport
                    }
                });
                server.on(Host.Events.StateChanged, function (evt) {
                    expect(evt.type).equal(Host.Events.StateChanged);
                    expect(evt.stateNew).equal(Host.States.Alarm);
                    expect(evt.monintors.length).equal(0);
                    server.stop();
                    clearInterval(loopID);
                    done();
                });
                setHostData([{ id: 1, port: '\\\\.\\COM2' }]);
                server.start().then(function () {
                    //server.hosts[0].m=mt;
                    loopID = setInterval(function () {
                        port.write(vHost.AlarmCmd(2000));
                    }, 200);
                }).catch(done);
            });
        });

        it('调用摄像头机-枪机', function (done) {
            getUrl().then(function () {
                var _ref3 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee3(httpport) {
                    var server, ipc, onVideo;
                    return _regenerator2.default.wrap(function _callee3$(_context3) {
                        while (1) {
                            switch (_context3.prev = _context3.next) {
                                case 0:
                                    server = new Server({
                                        ipc_server: {
                                            port: httpport
                                        }
                                    });
                                    _context3.next = 3;
                                    return Factory.getIPC(1);

                                case 3:
                                    ipc = _context3.sent;

                                    onVideo = function onVideo() {
                                        ipc.removeListener('video', onVideo);
                                        clearInterval(loopID);
                                        setTimeout(function () {
                                            port.write(vHost.nomalCmd);
                                        }, 1800);
                                    };

                                    ipc.on('video', onVideo);
                                    setHostData([{ id: 1, port: '\\\\.\\COM2' }]);
                                    server.start().then(function () {
                                        server.hosts[0].instance.on(Host.Events.StateChanged, function (data) {
                                            if (data.stateNew === Host.States.Normal) {
                                                server.stop();
                                                done();
                                            }
                                        });
                                        loopID = setInterval(function () {
                                            port.write(vHost.AlarmCmd(84));
                                        }, 200);
                                    });

                                case 8:
                                case 'end':
                                    return _context3.stop();
                            }
                        }
                    }, _callee3, undefined);
                }));

                return function (_x) {
                    return _ref3.apply(this, arguments);
                };
            }());
        });

        it('调用离线摄像头', function (done) {
            getUrl().then(function (httpport) {
                var server = new Server({
                    ipc_server: {
                        port: httpport
                    }
                });
                setHostData([{ id: 1, port: '\\\\.\\COM2' }]);
                server.start().then(function () {
                    server.on('error', function (err) {
                        clearInterval(loopID);
                        expect(err.type).equal(Server.Events.Error);
                        expect(err.errorType).equal(Server.Errors.IPCConnectError);
                        server.stop();
                        done();
                    });
                    loopID = setInterval(function () {
                        port.write(vHost.AlarmCmd(784));
                    }, 200);
                }).catch(done);
            });
        });
    });

    describe('消除警报', function () {
        var vh = null;
        before(function (done) {
            vh = new vHost(1);
            vh.start().then(done).catch(done);
        });
        it('启动一台主机', function (done) {
            var server = new Server();
            setHostData([{ id: 1, port: '\\\\.\\COM2' }]);
            server.start().then(function () {
                server.clearAlarm(1).catch(done);
            }).catch(done);
            vh.on('reset', function (data) {
                expect(data.port).equal(1);
                server.stop();
                done();
            });
        });
        after(function (done) {
            vh.stop().then(done).catch(done);
        });
    });
});
//# sourceMappingURL=host_server.test.js.map