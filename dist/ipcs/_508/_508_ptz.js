'use strict';

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * Created by Luky on 2017/7/5.
 */

var PTZ = require('../base/ptz');
var _ = require('lodash');
var globalConfig = global.server_config || require('../../config/config');
var config = globalConfig.getConfig('_508_config.json');
var SerialPort = require('serialport');
//const ByteLength = SerialPort.parsers.ByteLength;
//const Delimiter = SerialPort.parsers.Delimiter;
//const Delimiter = require('./Delimiter');
var assert = require('assert');

var _require = require('../../log/log'),
    Parser = _require.Parser;

var isLittleEndian = require('utils-is-little-endian');

/*
const workType={
    'chaxun':1,
    'dangan':2,//单杆，用于移动
    'yindao':3,//引导，定点移动
    'shaomiao':4
};*/

//不用要及时关闭

var _508 = function (_PTZ) {
    _inherits(_508, _PTZ);

    function _508(options) {
        _classCallCheck(this, _508);

        var _this = _possibleConstructorReturn(this, (_508.__proto__ || Object.getPrototypeOf(_508)).call(this));

        _.each({ 'port': '' }, function (val, key) {
            _this[key] = options[key] || val;
        });
        _.each({
            'focus_speed': config['focusSpeed'],
            'h_speed': config['hSpeed'],
            'v_speed': config['vSpeed'],
            'stopCmdDelay': config['stopCmdDelay'],
            'auto_close': config['autoClose'] || 60000
        }, function (val, key) {
            _this[key] = key in options ? options[key] : val;
        });
        _this.options = _.defaults(_this.options.serialPort || {}, config.options, {
            'baudRate': 9600,
            'stopBits': 1,
            'dataBits': 8,
            'parity': 'none',
            'cmdDelay': 6000,
            'autoOpen': false
        });
        _this.focus_speed = _.clamp(_this.focus_speed, 0x32, 0xFA);
        _this.h_speed = _.clamp(_this.h_speed, 1, 6000);
        _this.v_speed = _.clamp(_this.v_speed, 1, 6000);
        _this._connected = false;
        _this._resp = Buffer.alloc(0);
        _this._respExpect = [];
        _this._x = -1;_this._y = -1;_this._z = 0;
        _this._cmdStop = null;
        _this._cmdStopResp = null;
        //this._servo_worktype=0;
        Parser(_this, '_508_ptz.js', { port: _this.port });
        return _this;
    }

    //由于是公用的串口，使用完需要立刻关闭，所以外部调用测试通过后需要立即关闭


    _createClass(_508, [{
        key: '_connect',
        value: function () {
            var _ref = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
                var _this2 = this;

                return _regenerator2.default.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                return _context.abrupt('return', new Promise(function (resolve, reject) {
                                    var port = new SerialPort(_this2.port, _this2.options);
                                    var receive = function receive(buffer) {
                                        var resp = _this2._resp = Buffer.concat([_this2._resp, buffer]);
                                        while (true) {
                                            var i = 0;
                                            while (i < resp.length && resp[i] !== 0xA1 && resp[i] !== 0xA2) {
                                                i++;
                                            }
                                            if (i > 0) resp = _this2._resp = resp.slice(i);
                                            if (resp.length < 9) return;

                                            if (resp[0] === 0xA1 && resp.length >= 11) {
                                                //伺服命令
                                                assert.equal(resp[10], 0xAF);
                                                if (resp[3] === 0x30 && resp[4] === 0x58) {
                                                    //查询位置x返回
                                                    //低位在前
                                                    _this2._x = resp.readInt32LE(5) * 0.0001;
                                                }
                                                if (resp[3] === 0x30 && resp[4] === 0x59) {
                                                    //查询位置y返回
                                                    _this2._y = resp.readInt32LE(5) * 0.0001;
                                                }
                                                if (resp[3] === 0x45 && resp[4] === 0x60) {}
                                                //伺服停止命令

                                                /*               if(resp[3]===0x45&&resp[4]===0x50){
                                                 //扫描模式下，到达扫描点以后会停下来，这个时候需要将焦距移动到预设位置
                                                 }*/
                                                if (_this2._respExpect.length) {
                                                    var expect = _this2._respExpect[0];
                                                    if (expect.cmd[0] === resp[3] && expect.cmd[1] === resp[4]) {
                                                        _this2._respExpect.shift();
                                                        expect.resolve();
                                                    }
                                                }
                                                resp = _this2._resp = resp.slice(11);
                                            }

                                            if (resp[0] === 0xA2 && resp.length >= 9) {
                                                //白光命令
                                                assert.equal(resp[8], 0xAF);
                                                if (resp[3] === 0x56 && resp[4] === 0x53) {
                                                    //zoom stop response
                                                    _this2._z = isLittleEndian ? resp.readInt16LE(5) : resp.readInt16BE(5);
                                                }
                                                if (resp[3] === 0x50 && resp[4] === 0x41) {
                                                    //正比例镜头预置点
                                                    _this2._z = isLittleEndian ? resp.readInt16LE(5) : resp.readInt16BE(5);
                                                    _this2._focusAuto();
                                                }
                                                if (_this2._respExpect.length) {
                                                    var _expect = _this2._respExpect.shift();
                                                    if (_expect.cmd[0] === resp[3] && _expect.cmd[1] === resp[4]) {
                                                        _this2._respExpect.shift();
                                                        _expect.resolve();
                                                    }
                                                }
                                                resp = _this2._resp = resp.slice(9);
                                            }
                                        }
                                    };

                                    port.on('close', function (e) {
                                        //file.close();
                                        //网线拔掉以后会有关闭事件
                                        port.removeAllListeners();
                                        if (_this2.serialPort) delete _this2.serialPort;
                                        port = null;
                                        e ? _this2.emit('error', _this2.error("508转台端口关闭", { innerError: e || e.toString() })) : _this2.log("508转台端口关闭");
                                    });

                                    port.on('error', function (err) {
                                        _this2.emit('error', _this2.error("508转台端口未知异常", { innerError: err.toString() }));
                                        _this2.disConnect();
                                    });

                                    port.open(function (e) {
                                        if (e) {
                                            port.removeAllListeners();
                                            return reject(e);
                                        }
                                        _this2.setConnected();
                                        _this2.log("508转台端口已连接");
                                        _this2.serialPort = port;
                                        //const parser = port.pipe(new ByteLength({length: 9}));
                                        //const parser = port.pipe(new Delimiter());
                                        port.on('data', receive);
                                        resolve();
                                    });
                                }));

                            case 1:
                            case 'end':
                                return _context.stop();
                        }
                    }
                }, _callee, this);
            }));

            function _connect() {
                return _ref.apply(this, arguments);
            }

            return _connect;
        }()
    }, {
        key: '_disConnect',
        value: function () {
            var _ref2 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee2() {
                var _this3 = this;

                return _regenerator2.default.wrap(function _callee2$(_context2) {
                    while (1) {
                        switch (_context2.prev = _context2.next) {
                            case 0:
                                return _context2.abrupt('return', new Promise(function (resolve, reject) {
                                    if (_this3.serialPort) {
                                        var port = _this3.serialPort;_this3.serialPort = null;
                                        port.close(function (err) {
                                            if (err) {
                                                reject(err);return;
                                            }
                                            resolve();
                                        });
                                        return;
                                    }
                                    resolve();
                                }));

                            case 1:
                            case 'end':
                                return _context2.stop();
                        }
                    }
                }, _callee2, this);
            }));

            function _disConnect() {
                return _ref2.apply(this, arguments);
            }

            return _disConnect;
        }()
    }, {
        key: '_setStopCmd',
        value: function _setStopCmd(cmd, resp) {
            this._cmdStop = cmd;
            this._cmdStopResp = resp;
        }
    }, {
        key: '_setRespCmd',
        value: function _setRespCmd(cmd, resolve, reject) {
            this._respExpect.push({ cmd: cmd, resolve: resolve, reject: reject });
        }
    }, {
        key: '_sendCmd',
        value: function () {
            var _ref3 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee3(name, req) {
                var _this4 = this;

                var resp = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
                return _regenerator2.default.wrap(function _callee3$(_context3) {
                    while (1) {
                        switch (_context3.prev = _context3.next) {
                            case 0:
                                return _context3.abrupt('return', new Promise(function (resolve, reject) {
                                    _this4.log('\u5411\u8F6C\u53F0\u53D1\u9001\u547D\u4EE4' + name, { cmd: req.toString('hex') });
                                    _this4.serialPort.write(req, 'binary', function (err) {
                                        if (err) return reject(err);
                                        if (resp) _this4._setRespCmd(resp, resolve, reject);else resolve();
                                    });
                                }));

                            case 1:
                            case 'end':
                                return _context3.stop();
                        }
                    }
                }, _callee3, this);
            }));

            function _sendCmd(_x2, _x3) {
                return _ref3.apply(this, arguments);
            }

            return _sendCmd;
        }()

        //镜头

    }, {
        key: '_lens',
        value: function () {
            var _ref4 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee4(name, req) {
                var cmdStop = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
                var stop = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
                return _regenerator2.default.wrap(function _callee4$(_context4) {
                    while (1) {
                        switch (_context4.prev = _context4.next) {
                            case 0:
                                _context4.next = 2;
                                return this.connect();

                            case 2:
                                _context4.next = 4;
                                return this._sendCmd(name, req, req.slice(3, 5));

                            case 4:
                                if (!cmdStop) {
                                    _context4.next = 11;
                                    break;
                                }

                                if (stop) {
                                    _context4.next = 9;
                                    break;
                                }

                                this._setStopCmd(cmdStop, cmdStop.slice(3, 5));
                                _context4.next = 11;
                                break;

                            case 9:
                                _context4.next = 11;
                                return this._ptzStop(cmdStop, cmdStop.slice(3, 5));

                            case 11:
                                this.disConnectDelay();

                            case 12:
                            case 'end':
                                return _context4.stop();
                        }
                    }
                }, _callee4, this);
            }));

            function _lens(_x6, _x7) {
                return _ref4.apply(this, arguments);
            }

            return _lens;
        }()
    }, {
        key: 'disConnectDelay',
        value: function disConnectDelay() {
            var _this5 = this;

            setTimeout(function () {
                _this5.disConnect();
            }, this.auto_close);
        }
    }, {
        key: '_ptzStop',
        value: function () {
            var _ref5 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee5(cmd, resp) {
                return _regenerator2.default.wrap(function _callee5$(_context5) {
                    while (1) {
                        switch (_context5.prev = _context5.next) {
                            case 0:
                                _context5.next = 2;
                                return this.connect();

                            case 2:
                                _context5.next = 4;
                                return this._sendCmd('ptzStop', cmd, resp);

                            case 4:
                                _context5.next = 6;
                                return this.disConnectDelay();

                            case 6:
                            case 'end':
                                return _context5.stop();
                        }
                    }
                }, _callee5, this);
            }));

            function _ptzStop(_x8, _x9) {
                return _ref5.apply(this, arguments);
            }

            return _ptzStop;
        }()
    }, {
        key: 'ptzStop',
        value: function () {
            var _ref6 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee6() {
                var stop, respCmdStop;
                return _regenerator2.default.wrap(function _callee6$(_context6) {
                    while (1) {
                        switch (_context6.prev = _context6.next) {
                            case 0:
                                if (!this._cmdStop) {
                                    _context6.next = 5;
                                    break;
                                }

                                stop = this._cmdStop, respCmdStop = this._cmdStopResp;

                                this._cmdStopResp = this._cmdStop = null;
                                _context6.next = 5;
                                return this.ptzStop(stop, respCmdStop);

                            case 5:
                            case 'end':
                                return _context6.stop();
                        }
                    }
                }, _callee6, this);
            }));

            function ptzStop() {
                return _ref6.apply(this, arguments);
            }

            return ptzStop;
        }()
    }, {
        key: 'zoomAdd',
        value: function () {
            var _ref7 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee7(stop) {
                var cmd;
                return _regenerator2.default.wrap(function _callee7$(_context7) {
                    while (1) {
                        switch (_context7.prev = _context7.next) {
                            case 0:
                                cmd = A20009(0x56, 0x41);
                                _context7.next = 3;
                                return this._lens('zoomAdd', cmd, A20009(0x56, 0x53), !!stop);

                            case 3:
                                return _context7.abrupt('return', cmd);

                            case 4:
                            case 'end':
                                return _context7.stop();
                        }
                    }
                }, _callee7, this);
            }));

            function zoomAdd(_x10) {
                return _ref7.apply(this, arguments);
            }

            return zoomAdd;
        }()
    }, {
        key: 'zoomDec',
        value: function () {
            var _ref8 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee8(stop) {
                var cmd;
                return _regenerator2.default.wrap(function _callee8$(_context8) {
                    while (1) {
                        switch (_context8.prev = _context8.next) {
                            case 0:
                                cmd = A20009(0x56, 0x4D);
                                _context8.next = 3;
                                return this._lens('zoomDec', cmd, A20009(0x56, 0x53), !!stop);

                            case 3:
                                return _context8.abrupt('return', cmd);

                            case 4:
                            case 'end':
                                return _context8.stop();
                        }
                    }
                }, _callee8, this);
            }));

            function zoomDec(_x11) {
                return _ref8.apply(this, arguments);
            }

            return zoomDec;
        }()
    }, {
        key: '_zoomStop',
        value: function () {
            var _ref9 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee9() {
                var cmd;
                return _regenerator2.default.wrap(function _callee9$(_context9) {
                    while (1) {
                        switch (_context9.prev = _context9.next) {
                            case 0:
                                cmd = A20009(0x56, 0x53);
                                _context9.next = 3;
                                return this._lens('zoomStop', cmd);

                            case 3:
                                return _context9.abrupt('return', cmd);

                            case 4:
                            case 'end':
                                return _context9.stop();
                        }
                    }
                }, _callee9, this);
            }));

            function _zoomStop() {
                return _ref9.apply(this, arguments);
            }

            return _zoomStop;
        }()
    }, {
        key: '_zoomTo',
        value: function () {
            var _ref10 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee10(z) {
                var cmd;
                return _regenerator2.default.wrap(function _callee10$(_context10) {
                    while (1) {
                        switch (_context10.prev = _context10.next) {
                            case 0:
                                //停止命令不确定有
                                cmd = A20009(0x50, 0x41, z & 0xFF, z >> 8 & 0xFF);
                                _context10.next = 3;
                                return this._lens('zoomTo', cmd);

                            case 3:
                                return _context10.abrupt('return', cmd);

                            case 4:
                            case 'end':
                                return _context10.stop();
                        }
                    }
                }, _callee10, this);
            }));

            function _zoomTo(_x12) {
                return _ref10.apply(this, arguments);
            }

            return _zoomTo;
        }()
    }, {
        key: 'focusAdd',
        value: function () {
            var _ref11 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee11(stop) {
                var cmd;
                return _regenerator2.default.wrap(function _callee11$(_context11) {
                    while (1) {
                        switch (_context11.prev = _context11.next) {
                            case 0:
                                cmd = A20009(0x46, 0x41, this.focus_speed);
                                _context11.next = 3;
                                return this._lens('focusAdd', cmd, A20009(0x46, 0x53), !!stop);

                            case 3:
                                return _context11.abrupt('return', cmd);

                            case 4:
                            case 'end':
                                return _context11.stop();
                        }
                    }
                }, _callee11, this);
            }));

            function focusAdd(_x13) {
                return _ref11.apply(this, arguments);
            }

            return focusAdd;
        }()
    }, {
        key: 'focusDec',
        value: function () {
            var _ref12 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee12(stop) {
                var cmd;
                return _regenerator2.default.wrap(function _callee12$(_context12) {
                    while (1) {
                        switch (_context12.prev = _context12.next) {
                            case 0:
                                cmd = A20009(0x46, 0x4D);
                                _context12.next = 3;
                                return this._lens('focusDec', cmd, A20009(0x46, 0x53), !!stop);

                            case 3:
                                return _context12.abrupt('return', cmd);

                            case 4:
                            case 'end':
                                return _context12.stop();
                        }
                    }
                }, _callee12, this);
            }));

            function focusDec(_x14) {
                return _ref12.apply(this, arguments);
            }

            return focusDec;
        }()
    }, {
        key: '_focusStop',
        value: function () {
            var _ref13 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee13() {
                var cmd;
                return _regenerator2.default.wrap(function _callee13$(_context13) {
                    while (1) {
                        switch (_context13.prev = _context13.next) {
                            case 0:
                                cmd = A20009(0x46, 0x53);
                                _context13.next = 3;
                                return this._lens('focusStop', cmd);

                            case 3:
                                return _context13.abrupt('return', cmd);

                            case 4:
                            case 'end':
                                return _context13.stop();
                        }
                    }
                }, _callee13, this);
            }));

            function _focusStop() {
                return _ref13.apply(this, arguments);
            }

            return _focusStop;
        }()
    }, {
        key: '_focusAuto',
        value: function () {
            var _ref14 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee14() {
                var cmd;
                return _regenerator2.default.wrap(function _callee14$(_context14) {
                    while (1) {
                        switch (_context14.prev = _context14.next) {
                            case 0:
                                //FF开头的是Pelco-D协议 富士能白光自动聚焦
                                cmd = new Buffer([0xFF, 0x01, 0x00, 0x09, 0x00, 0x02, 0 /*,0xAF*/]);

                                xor(cmd, 6);cmd[6] = cmd[6] % 100;
                                _context14.next = 5;
                                return this.connect();

                            case 5:
                                _context14.next = 7;
                                return this._sendCmd('focusAuto', cmd).then(function () {}).catch(function () {});

                            case 7:
                                this.disConnectDelay();

                            case 8:
                            case 'end':
                                return _context14.stop();
                        }
                    }
                }, _callee14, this);
            }));

            function _focusAuto() {
                return _ref14.apply(this, arguments);
            }

            return _focusAuto;
        }()
    }, {
        key: 'apertureAdd',
        value: function () {
            var _ref15 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee15(stop) {
                var cmd;
                return _regenerator2.default.wrap(function _callee15$(_context15) {
                    while (1) {
                        switch (_context15.prev = _context15.next) {
                            case 0:
                                cmd = A20009(0x49, 0x41);
                                _context15.next = 3;
                                return this._lens('apertureAdd', cmd, A20009(0x49, 0x53), !!stop);

                            case 3:
                                return _context15.abrupt('return', cmd);

                            case 4:
                            case 'end':
                                return _context15.stop();
                        }
                    }
                }, _callee15, this);
            }));

            function apertureAdd(_x15) {
                return _ref15.apply(this, arguments);
            }

            return apertureAdd;
        }()
    }, {
        key: 'apertureDec',
        value: function () {
            var _ref16 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee16(stop) {
                var cmd;
                return _regenerator2.default.wrap(function _callee16$(_context16) {
                    while (1) {
                        switch (_context16.prev = _context16.next) {
                            case 0:
                                cmd = A20009(0x49, 0x4D);
                                _context16.next = 3;
                                return this._lens('apertureDec', cmd, A20009(0x49, 0x53), !!stop);

                            case 3:
                                return _context16.abrupt('return', cmd);

                            case 4:
                            case 'end':
                                return _context16.stop();
                        }
                    }
                }, _callee16, this);
            }));

            function apertureDec(_x16) {
                return _ref16.apply(this, arguments);
            }

            return apertureDec;
        }()
    }, {
        key: '_apertureStop',
        value: function () {
            var _ref17 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee17() {
                var cmd;
                return _regenerator2.default.wrap(function _callee17$(_context17) {
                    while (1) {
                        switch (_context17.prev = _context17.next) {
                            case 0:
                                cmd = A20009(0x49, 0x53);
                                _context17.next = 3;
                                return this._lens('apertureStop', cmd);

                            case 3:
                                return _context17.abrupt('return', cmd);

                            case 4:
                            case 'end':
                                return _context17.stop();
                        }
                    }
                }, _callee17, this);
            }));

            function _apertureStop() {
                return _ref17.apply(this, arguments);
            }

            return _apertureStop;
        }()
    }, {
        key: 'move',
        value: function () {
            var _ref18 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee18(direction, stop) {
                var x, y, req, cmdStop;
                return _regenerator2.default.wrap(function _callee18$(_context18) {
                    while (1) {
                        switch (_context18.prev = _context18.next) {
                            case 0:
                                x = 0, y = 0;

                                if ((direction & PTZ.Directions.left) > 0) {
                                    x = -this.h_speed;
                                } else if ((direction & PTZ.Directions.right) > 0) {
                                    x = this.h_speed;
                                }
                                if ((direction & PTZ.Directions.top) > 0) {
                                    y = this.v_speed;
                                } else if ((direction & PTZ.Directions.down) > 0) {
                                    y = -this.v_speed;
                                }

                                //11
                                req = new Buffer([0xA1, 0x00, 0x0B, 0x4D, 0x58, x >> 8 & 0xFF, x & 0xFF, y >> 8 & 0xFF, y & 0xFF, 0, 0xAF]);

                                xor(req, 9);
                                cmdStop = this._cmdStop = new Buffer([0xA1, 0x00, 0x0B, 0x4D, 0x58, 0, 0, 0, 0, 0, 0xAF]);

                                xor(cmdStop, 9);
                                _context18.next = 9;
                                return this.connect();

                            case 9:
                                _context18.next = 11;
                                return this._sendCmd('move', req, null);

                            case 11:
                                if (stop) {
                                    _context18.next = 15;
                                    break;
                                }

                                this._setStopCmd(cmdStop);
                                _context18.next = 17;
                                break;

                            case 15:
                                _context18.next = 17;
                                return this._ptzStop(cmdStop);

                            case 17:
                                this.disConnectDelay();
                                return _context18.abrupt('return', req);

                            case 19:
                            case 'end':
                                return _context18.stop();
                        }
                    }
                }, _callee18, this);
            }));

            function move(_x17, _x18) {
                return _ref18.apply(this, arguments);
            }

            return move;
        }()
    }, {
        key: 'getPoint',
        value: function () {
            var _ref19 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee19() {
                var _this6 = this;

                var promiseX, promiseY, promiseZ;
                return _regenerator2.default.wrap(function _callee19$(_context19) {
                    while (1) {
                        switch (_context19.prev = _context19.next) {
                            case 0:
                                _context19.next = 2;
                                return this.connect();

                            case 2:
                                _context19.next = 4;
                                return this._zoomStop();

                            case 4:
                                _context19.next = 6;
                                return this._sendCmd('getPoint-startup', A1000B(0x51, 0x52, 0x00));

                            case 6:
                                promiseX = new Promise(function (resolve, reject) {
                                    _this6._setRespCmd([0x30, 0x58], resolve, reject);
                                });
                                promiseY = new Promise(function (resolve, reject) {
                                    _this6._setRespCmd([0x30, 0x59], resolve, reject);
                                });
                                promiseZ = new Promise(function (resolve, reject) {
                                    _this6._setRespCmd([0x56, 0x53], resolve, reject);
                                });
                                //查询

                                _context19.next = 11;
                                return Promise.all([this._sendCmd('getPoint-xy', A1000B(0x51, 0x50, 0x00)), this._sendCmd('getPoint-z-zoomStop', A20009(0x56, 0x53))]);

                            case 11:
                                _context19.next = 13;
                                return Promise.all([promiseX, promiseY, promiseZ]);

                            case 13:
                                this.disConnectDelay();
                                return _context19.abrupt('return', { x: this._x, y: this._y, z: this._z });

                            case 15:
                            case 'end':
                                return _context19.stop();
                        }
                    }
                }, _callee19, this);
            }));

            function getPoint() {
                return _ref19.apply(this, arguments);
            }

            return getPoint;
        }()
    }, {
        key: 'moveToPoint',
        value: function () {
            var _ref20 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee20(x, y, z) {
                var _this7 = this;

                var req, req2, p1, p2, p3;
                return _regenerator2.default.wrap(function _callee20$(_context20) {
                    while (1) {
                        switch (_context20.prev = _context20.next) {
                            case 0:
                                x *= 100;y *= 100;z = _.toInteger(z);
                                req = A1000F(0x50, 0x32, x, y);
                                req2 = A1000B(0x50, 0x30, 0x00); //预置位导航命令信息同步

                                _context20.next = 7;
                                return this.connect();

                            case 7:
                                p1 = this._sendCmd('moveToPoint-1', req, [0x45, 0x60]);
                                p2 = new Promise(function (resolve, reject) {
                                    setTimeout(function () {
                                        _this7._sendCmd('moveToPoint-2', req2).then(resolve).catch(reject);
                                    }, 200);
                                });
                                p3 = new Promise(function (resolve, reject) {
                                    setTimeout(function () {
                                        _this7._zoomTo(z).then(resolve).catch(reject);
                                    }, 450);
                                });
                                _context20.next = 12;
                                return Promise.all([p1, p2, p3]);

                            case 12:
                                this._focusAuto();
                                this.disConnectDelay();

                            case 14:
                            case 'end':
                                return _context20.stop();
                        }
                    }
                }, _callee20, this);
            }));

            function moveToPoint(_x19, _x20, _x21) {
                return _ref20.apply(this, arguments);
            }

            return moveToPoint;
        }()

        /*async moveToPreset(preset){
            return await this.moveToPoint(preset.x,preset.y,preset.z);
        }
        setPreset(name){throw new Error('未实现函数setPreset');}
        getPresets(){throw new Error('未实现函数getPresets');}
        removePoint(name){throw new Error('未实现函数removePoint');}
        */

    }]);

    return _508;
}(PTZ);

function xor(buffer, pos) {
    var result = buffer[0];
    for (var x = 1; x < pos; x++) {
        result = result ^ buffer[x];
    }
    buffer[pos] = result;
    return buffer;
}

function A20009(ctrl1, ctrl2) {
    var data1 = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
    var data2 = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;

    var req = Buffer.from([0xA2, 0x00, 0x09, ctrl1, ctrl2, data1, data2, 0, 0xAF]);
    return xor(req, 7);
}

function A1000F(ctrl1, ctrl2, data1, data2) {
    var req = new Buffer([0xA1, 0x00, 0x0F, ctrl1, ctrl2, data1 >> 24 & 0xFF, data1 >> 16 & 0xFF, data1 >> 8 & 0xFF, data1 & 0xFF, data2 >> 24 & 0xFF, data2 >> 16 & 0xFF, data2 >> 8 & 0xFF, data2 & 0xFF, 0, 0xAF]);
    return xor(req, 13);
}

function A1000B(ctrl1, ctrl2, data) {
    var req = new Buffer([0xA1, 0x00, 0x0B, ctrl1, ctrl2, data >> 24 & 0xFF, data >> 16 & 0xFF, data >> 8 & 0xFF, data & 0xFF, 0, 0xAF]);
    return xor(req, 9);
}

exports = module.exports = _508;
//# sourceMappingURL=_508_ptz.js.map