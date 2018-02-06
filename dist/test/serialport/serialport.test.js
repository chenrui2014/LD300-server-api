'use strict';

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var expect = require('chai').expect;
var Com = require('../../serialport/serialport');
var SerialPort = Com;
var _ = require('lodash');
console.log('\r测试前通过虚拟串口工具打开端口1和2，并保证无端口13\r');

function error(done) {
    expect(1).equal(0);
    done();
}

function ok(done) {
    done();
}

function toPort(id) {
    return '\\\\.\\COM' + id;
}

var options = {
    baudRate: 115200,
    stopBits: 2,
    dataBits: 8,
    parity: "none",
    byteLength: 16,
    tryTimes: 0
};

describe('串口测试', function () {
    describe('com错误测试', function () {
        it('无法找到端口', function (done) {
            //File not found
            var com = new Com(13, options);
            com.on('error', function (msg) {
                expect(msg.innerError.indexOf('File not found') > -1).equal(true);
                expect(msg.errorType).equal(SerialPort.Errors.openError);
            });
            com.connect().then(error.bind(null, done)).catch(ok.bind(null, done));
        });

        it('重复绑定端口', function (done) {
            //Error: Opening \\\\.\\COM2: Access denied
            var com1 = new Com(1, options);
            com1.connect().then(function () {
                var com = new Com(1, options);
                com.on('error', function (msg) {
                    expect(msg.innerError.indexOf('Access denied') > -1).equal(true);
                    expect(msg.errorType).equal(SerialPort.Errors.openError);
                });
                com.connect().catch(function (err) {
                    expect(JSON.stringify(err).indexOf('端口以被其他应用占用，请确认') > -1).equal(true);
                    com1.disConnect().then(done).catch(error.bind(null, done));
                });
            }).catch(error.bind(null, done));
        });

        it('一直重连', function (done) {
            var com = new Com(13, _.extend({}, options, { tryTimes: -1 }));
            com.connect().then().catch(function (e) {
                expect(e.times).equal(2);
                ok(done);
            });

            var err = 0;
            com.on(Com.Events.Offline, function (e) {
                expect('duration' in e).equal(true);
                err++;
                if (err !== 2) return;
                expect(e.times).equal(2);
                com.stopReConnect();
            });
        });
    });

    describe('静态功能块测试', function () {
        it('', _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
            var ports;
            return _regenerator2.default.wrap(function _callee$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            _context.next = 2;
                            return SerialPort.GetPortsArrived();

                        case 2:
                            ports = _context.sent;

                            expect(ports.length > 0).equal(true);
                            expect(ports[0]).equal('COM1');

                        case 5:
                        case 'end':
                            return _context.stop();
                    }
                }
            }, _callee, undefined);
        })));
    });

    describe('正常测试', function () {
        var com = null,
            com2 = null;
        beforeEach(function (done) {
            com = new Com(1, options);
            com.on('error', console.error);
            com.connect().then(function () {
                com2 = new Com(2, options);
                com2.on('error', console.error);
                com2.connect().then(done).catch(error.bind(null, done));
            }).catch(error.bind(null, done));
        });
        it('端口正确关闭', function (done) {
            com.disConnect().then(function () {
                com = new Com(1, options);
                com.connect().then(function () {
                    com.disConnect().then(ok.bind(null, done)).catch(error.bind(null, done));
                }).catch(error.bind(null, done));
            }).catch(error.bind(null, done));
        });

        it('发送获取数据', function (done) {
            //00000000000000003333551500000000
            com.on('data', function (data) {
                //const {id,data}=unpackageData(data1);
                expect(data.toString('hex')).equal('00000000000000003333551500000000');
                done();
            });
            com2.write(Buffer.from('00000000000000003333551500000000', 'hex'));
            setTimeout(function () {
                done;
            }, 5000);
        });

        afterEach(function (done) {
            com.disConnect().then(function () {
                com2.disConnect().then(ok.bind(null, done)).catch(error.bind(null, done));
            }).catch(error.bind(null, done));
        });
    });

    describe('事件测试', function () {

        function eventDataExpect(data, port, type) {
            expect(data.port).equal(toPort(port));
            expect(data.type).equal(type);
        }

        it('open', function (done) {
            var com = new Com(1, options);
            com.on(Com.Events.Open, function (data) {
                eventDataExpect(data, 1, Com.Events.Open);
                com.disConnect().then(ok.bind(null, done)).catch(error.bind(null, done));
            });
        });

        it('close', function (done) {
            var com = new Com(1, options);
            com.on(Com.Events.Close, function (data) {
                eventDataExpect(data, 1, Com.Events.Close);
                done();
            });
            com.disConnect().catch();
        });
    });

    describe('正常测试-去重', function () {
        var com = null,
            com2 = null;
        beforeEach(function (done) {
            var opt = _.extend({}, options, { deDuplication: true });
            com = new Com(1, opt);
            com.on('error', console.error);
            com.connect().then(function () {
                com2 = new Com(2, opt);
                com2.on('error', console.error);
                com2.connect().then(done).catch(error.bind(null, done));
            }).catch(error.bind(null, done));
        });

        it('1', function (done) {
            //00000000000000003333551500000000
            var ct = 0;
            com.on('data', function (data) {
                //const {id,data}=unpackageData(data1);
                expect(data.toString('hex')).equal('00000000000000003333551500000000');
                //expect(id).equal(1);
                ct++;
            });
            for (var i = 0; i < 3; i++) {
                com2.write(Buffer.from('00000000000000003333551500000000', 'hex'));
            }
            setTimeout(function () {
                expect(ct === 1).equal(true);
                com.disConnect().then(done).catch(error.bind(null, done));
            }, 10000);
        });
        afterEach(function (done) {
            com.disConnect().then(function () {
                com2.disConnect().then(ok.bind(null, done)).catch(error.bind(null, done));
            }).catch(error.bind(null, done));
        });
    });
});
//# sourceMappingURL=serialport.test.js.map