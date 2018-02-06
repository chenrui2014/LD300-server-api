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
 * Created by Wxf on 2017/9/8.
 */

var _ = require('lodash');
var config = global.server_config || require('../config/config');
var SerialPort = require('serialport');
var EventEmitter = require('events').EventEmitter;
var ByteLength = SerialPort.parsers.ByteLength;

var _require = require('../log/log'),
    Parser = _require.Parser;

var _Events = {
    Open: 'open',
    Close: 'close',
    Error: 'error',
    Data: 'data',
    //offline之后再连接为online
    Online: 'online',
    Offline: 'offline'
};

var _Errors = {
    openError: 'openError',
    writeError: 'writeError',
    closeError: 'closeError',
    Other: 'other'
};

var Com = function (_EventEmitter) {
    _inherits(Com, _EventEmitter);

    function Com(port, options) {
        _classCallCheck(this, Com);

        var _this = _possibleConstructorReturn(this, (Com.__proto__ || Object.getPrototypeOf(Com)).call(this));

        if (_.isNumber(port)) {
            port = '\\\\.\\COM' + port;
        }
        _this.port = port;
        _this._timeHandle = 0;
        _this._stopReConnect = false;
        _this._lastData = Buffer.alloc(0);
        _this.options = {
            timeOut: 3000,
            tryTimes: -1,
            trySpan: 5000,
            deDuplication: false
        };
        _.extend(_this.options, _.get(config, 'serialPort'), options, { autoOpen: false });
        _this._received = 0;
        _this._received_bak = 0;
        _this._start = 0;
        Parser(_this, 'serialport.js', { port: port });
        return _this;
    }

    _createClass(Com, [{
        key: 'isDuplication',
        value: function isDuplication(data) {
            if (!this.options.deDuplication) return false;
            if (this._lastData.equals(data)) {
                return true;
            }
            this._lastData = data;
            return false;
        }
    }, {
        key: 'stopReConnect',
        value: function stopReConnect() {
            this._stopReConnect = true;
            clearTimeout(this._timeHandle);
            this._timeHandle = 0;
        }
    }, {
        key: '_reConnect',
        value: function _reConnect() {
            var _this2 = this;

            if (this.options.tryTimes === 0) return Promise.resolve();
            var tryTimes = this.options.tryTimes;
            var span = this.options.trySpan;
            return this.disConnect().then(function () {
                return new Promise(function (resolve, reject) {
                    var time = 0,
                        start = new Date().getTime();
                    var restart = function restart() {
                        _this2._connect().then(function () {
                            _this2.emit(_Events.Online, _this2.log('\u7AEF\u53E3\u6210\u529F\u6253\u5F00,\u7B2C' + time + '\u6B21\u5C1D\u8BD5'));
                            time = 0;
                            resolve({ times: time });
                        }).catch(function () {
                            time++;
                            _this2.emit(_Events.Offline, _this2.warn('\u91CD\u8FDE\u5931\u8D25,\u7B2C' + time + '\u6B21\u5C1D\u8BD5', { times: time, duration: new Date().getTime() - start }));
                            if (_this2._stopReConnect) {
                                _this2._stopReConnect = false;
                                return reject({ times: time });
                            }
                            if (tryTimes === -1) {
                                _this2._timeHandle = setTimeout(restart, span);
                                return;
                            }
                            if (tryTimes === 0) return reject({ times: time });
                            tryTimes--;
                        });
                    };
                    restart();
                });
            });
        }
    }, {
        key: 'write',
        value: function write(data) {
            var _this3 = this;

            if (!this.serialPort) return Promise.reject('端口未连接，无法发送信号');
            return new Promise(function (resolve, reject) {
                _this3.serialPort.write(data, 'binary', function (err) {
                    if (err) {
                        var log = _this3._error(_Errors.writeError, '指令发送失败', { innerError: err.toString() });
                        return reject(log);
                    }
                    _this3.serialPort.drain(function (err) {
                        if (err) {
                            var _log = _this3._error(_Errors.writeError, '指令发送失败,未送出', { innerError: err.toString() });
                            return reject(_log);
                        }
                        resolve();
                    });
                });
            });
        }
    }, {
        key: '_connect',
        value: function _connect() {
            var _this4 = this;

            return this.disConnect().then(function () {
                return new Promise(function (resolve, reject) {
                    var port = new SerialPort(_this4.port, _this4.options);
                    var receive = function receive(data) {
                        _this4._received += data.length;
                        //1024B *100
                        if (_this4._received - _this4._received_bak > 102400) {
                            _this4._received_bak = _this4._received;
                            _this4.log('\u63A5\u53D7\u5230\u6570\u636E' + _this4._received_bak + 'KB,\u8FD0\u884C\u65F6\u957F' + (new Date().getTime() - _this4._start) / 1000 + '\u5206');
                        }
                        if (_this4.isDuplication(data)) return;
                        _this4.emit('data', data, _this4.port);
                    };

                    port.on('close', function (e) {
                        //file.close();
                        //网线拔掉以后会有关闭事件
                        port.removeAllListeners();
                        if (_this4.serialPort) delete _this4.serialPort;
                        port = null;
                        _this4.emit(_Events.Close, _this4.log('端口关闭', { type: _Events.Close }));
                        if (e && e.disconnected) {
                            _this4._reConnect().catch();
                        }
                    });

                    //Callback is called with an error object whenever there is an error.
                    port.on('error', function (err) {
                        _this4.emit(_Events.Error, _this4._error(_Errors.Other, '端口异常', { innerError: err.toString() }));
                        _this4.disConnect();
                    });

                    port.open(function (e) {
                        if (e) {
                            port.removeAllListeners();
                            return reject(e);
                        }
                        _this4._received = 0;
                        _this4._received_bak = 0;
                        _this4._start = new Date().getTime();
                        _this4.serialPort = port;
                        var parser = _this4.parser = port.pipe(new ByteLength({ length: _this4.options.byteLength }));
                        parser.on('data', receive);
                        resolve();
                    });
                });
            });
        }
    }, {
        key: 'connect',
        value: function connect() {
            var _this5 = this;

            return new Promise(function (resolve, reject) {
                _this5._connect().then(function () {
                    _this5.emit(_Events.Open, _this5.log('端口打开成功', { type: _Events.Open }));
                    resolve();
                }).catch(function (e) {
                    if (_this5.options.tryTimes !== 0) {
                        return _this5._reConnect().then(function (data) {
                            return resolve(data);
                        }).catch(function (e) {
                            return reject(e);
                        });
                    }
                    var desc = '端口打开出错';
                    if (e.message) {
                        if (e.message.indexOf('File not found') > -1) {
                            desc = '端口未找到';
                        } else if (e.message.indexOf('Access denied') > -1) {
                            desc = '端口以被其他应用占用，请确认';
                        }
                    }
                    var log = _this5._error(_Errors.openError, desc, { innerError: e.toString() });
                    _this5.emit(_Events.Error, log);
                    reject(log);
                });
            });
        }
    }, {
        key: 'disConnect',
        value: function disConnect() {
            var _this6 = this;

            this._lastData = Buffer.alloc(0);
            if (!this.serialPort) return Promise.resolve();
            this.parser.unpipe(this.serialPort);
            this.parser = null;
            return new Promise(function (resolve, reject) {
                _this6.serialPort.close(function (err) {
                    if (err) {
                        var data = _this6._error(_Errors.closeError, '端口关闭异常', { innerError: err.toString() });
                        _this6.emit(_Events.error, data);
                        return reject(data);
                    }
                    _this6.log('端口应要关闭');
                    return resolve();
                });
            });
        }
    }, {
        key: '_error',
        value: function _error(type, desc, params) {
            return this.error(desc, _.extend({
                type: _Events.Error,
                errorType: type
            }, params));
        }
    }, {
        key: 'isConnected',
        get: function get() {
            if (!this.serialPort) return false;
            return this.serialPort.isOpen;
        }
    }], [{
        key: 'GetPortsArrived',
        value: function () {
            var _ref = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
                var ports;
                return _regenerator2.default.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                _context.next = 2;
                                return SerialPort.list().catch(function () {
                                    return Promise.resolve([]);
                                });

                            case 2:
                                ports = _context.sent;
                                return _context.abrupt('return', _.map(ports, 'comName'));

                            case 4:
                            case 'end':
                                return _context.stop();
                        }
                    }
                }, _callee, this);
            }));

            function GetPortsArrived() {
                return _ref.apply(this, arguments);
            }

            return GetPortsArrived;
        }()
    }, {
        key: 'Events',
        get: function get() {
            return _Events;
        }
    }, {
        key: 'Errors',
        get: function get() {
            return _Errors;
        }
    }]);

    return Com;
}(EventEmitter);

exports = module.exports = Com;
//# sourceMappingURL=serialport.js.map