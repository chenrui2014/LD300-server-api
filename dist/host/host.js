'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * Created by Luky on 2017/6/27.
 */

var _ = require('lodash');
var SerialPort = require('../serialport/serialport');
var EventEmitter = require('events').EventEmitter;
var config = global.server_config || require('../config/config');

var _require = require('../log/log'),
    Parser = _require.Parser;

var portOptions = _.extend({
    baudRate: 115200,
    stopBits: 2,
    dataBits: 8,
    parity: 'none',
    byteLength: 16
}, _.get(config, 'host.port'));

var _Events = {
    Open: 'open',
    Close: 'close',
    Error: 'error',
    Online: 'online',
    Offline: 'offline',
    StateChanged: 'stateChanged'
};

var _HostErrors = {
    InitError: 'initError',
    ConnectError: 'connectError',
    PortError: 'portError',
    RdySignalsSendError: 'rdySignalsSendError'
};

var _hostState = {
    Normal: 'normal',
    SysReady: 'sysRdy',
    Alarm: 'alarm',
    Error: 'error',
    Unknown: 'unknown' //代表主机离线等无信号状态
};

var _Errors = _.extend({}, SerialPort.Errors, _HostErrors);

var reset = new Buffer([0xAA]);
var systemReady = new Buffer([0x00]);

var SysRdySender = function (_EventEmitter) {
    _inherits(SysRdySender, _EventEmitter);

    function SysRdySender(spans, cb) {
        _classCallCheck(this, SysRdySender);

        var _this = _possibleConstructorReturn(this, (SysRdySender.__proto__ || Object.getPrototypeOf(SysRdySender)).call(this));

        _this._span = spans || [];
        _this._callback = cb || function () {};
        _this._index = -1;
        _this._handle = 0;
        return _this;
    }

    _createClass(SysRdySender, [{
        key: 'send',
        value: function send() {
            var _this2 = this;

            this._index++;
            if (this._index >= this._span.length) {
                this.emit('finish');
                this._index = -1;
                return;
            }
            this._handle = setTimeout(function () {
                _this2._callback();
                _this2.send();
            }, this._span[this._index]);
        }
    }, {
        key: 'interrupt',
        value: function interrupt() {
            clearTimeout(this._handle);
            this._index = -1;
            this.emit('interrupted');
        }
    }]);

    return SysRdySender;
}(EventEmitter);

var Host = function (_EventEmitter2) {
    _inherits(Host, _EventEmitter2);

    function Host(id, port, options) {
        var autoConnect = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

        _classCallCheck(this, Host);

        var _this3 = _possibleConstructorReturn(this, (Host.__proto__ || Object.getPrototypeOf(Host)).call(this));

        _this3._id = id;
        _this3._port = port;
        _this3.__state = _hostState.Unknown;
        _this3._SysRdySender = new SysRdySender(_.get(config, 'host.systemReadySignalSendSpan', [5000]), _this3.sendSysRdy.bind(_this3));
        _this3._SysRdySender.on('finish', function () {
            _this3.setState(_hostState.SysReady, _this3.log('主机已工作在sysrdy状态'));
        });
        _this3.initOptions(options);
        _this3._serialport = new SerialPort(port, _this3._options);
        _this3._serialport.on(SerialPort.Events.Open, _this3._onPortOpen.bind(_this3));
        _this3._serialport.on(SerialPort.Events.Close, _this3._onPortClose.bind(_this3));
        _this3._serialport.on(SerialPort.Events.Error, _this3._onPortError.bind(_this3));
        _this3._serialport.on(SerialPort.Events.Data, _this3._onData.bind(_this3));
        _this3._serialport.on(SerialPort.Events.Online, _this3._onPortOnline.bind(_this3));
        _this3._serialport.on(SerialPort.Events.Offline, _this3._onPortOffline.bind(_this3));
        Parser(_this3, 'host.js', { hid: id, port: port });
        if (autoConnect) _this3.connect();
        return _this3;
    }

    _createClass(Host, [{
        key: 'initOptions',
        value: function initOptions(options) {
            this._options = {
                timeOut: 3000,
                tryRecover: -1,
                recoverSpan: 5000
            };
            _.extend(this._options, portOptions, options, { deDuplication: true, port: this._port });
        }
    }, {
        key: '_onData',
        value: function _onData(data) {
            var cmd = decode(data, this._id);
            switch (cmd.type) {
                case _hostState.Error:
                    this.setState(_hostState.Error, cmd);
                    this._SysRdySender.interrupt();
                    break;
                case _hostState.Normal:
                    //第一次不用发送(unknown),其他两个状态来需要 补rdy状态
                    if (this.state === _hostState.Alarm || this.state === _hostState.Error) {
                        this._SysRdySender.send();
                        this.setState(_hostState.Normal, cmd);
                        return;
                    }
                    this.setState(this.state === _hostState.SysReady ? _hostState.SysReady : _hostState.Normal, cmd);
                    break;
                case _hostState.Alarm:
                    this.setState(_hostState.Alarm, cmd);
                    this._SysRdySender.interrupt();
                    break;
            }
        }
    }, {
        key: 'setState',
        value: function setState(state, params) {
            if (state === this.__state) return;
            var stateOld = this.__state;
            this.__state = state;
            this.emit(_Events.StateChanged, this._log('主机状态改变', _.extend(params, { stateNew: state, stateOld: stateOld, type: _Events.StateChanged })));
        }
    }, {
        key: 'sendSysRdy',
        value: function sendSysRdy() {
            var _this4 = this;

            if (!this.isConnected) return false;
            this._serialport.write(systemReady).then(function () {
                _this4._log('向主机发送sysrdy信息成功');
            }).catch(function (e) {
                var error = _this4._error(_Errors.RdySignalsSendError, 'sysrdy信号发送失败', e);
                _this4.emit(_Events.Error, error);
            });
            return true;
        }
    }, {
        key: 'clearAlarm',
        value: function clearAlarm() {
            var _this5 = this;

            return new Promise(function (resolve, reject) {
                if (_this5.state !== _hostState.Alarm) return resolve(_this5.warn('客户端发来无效清除指令，已忽略'));
                _this5._serialport.write(reset).then(function () {
                    //this._bSendSysRdy=true;
                    resolve(_this5._log('清除指令已发出'));
                }).catch(function (err) {
                    reject(_this5._error(_Errors.writeError, '清除报警指令发送失败', { innerError: err }));
                });
            });
        }
    }, {
        key: 'connect',
        value: function connect() {
            var _this6 = this;

            return this.disConnect().then(function () {
                _this6._serialport.connect().catch(function (e) {
                    return e;
                });
                return Promise.resolve();
            });
        }
    }, {
        key: '_onPortError',
        value: function _onPortError(data) {
            this.emit(_Events.Error, this._error(_HostErrors.PortError, '端口异常', data));
        }
    }, {
        key: '_onPortOpen',
        value: function _onPortOpen(data) {
            this.sendSysRdy();
            this.emit(_Events.Open, this._log('主机已连接', { innerEvent: data }));
        }
    }, {
        key: '_onPortClose',
        value: function _onPortClose(data) {
            var log = this._log('主机连接关闭', { innerEvent: data });
            this.setState(_hostState.Unknown, log);
            this.emit(_Events.Close, log);
        }
    }, {
        key: '_onPortOnline',
        value: function _onPortOnline(data) {
            var log = this._log('主机重新连接上线', { innerEvent: data });
            this.emit(_Events.Online, log);
        }
    }, {
        key: '_onPortOffline',
        value: function _onPortOffline(data) {
            var log = this._log('主机断开，即将再次尝试重连', { innerEvent: data });
            this.setState(_hostState.Unknown, log);
            this.emit(_Events.Offline, log);
        }
    }, {
        key: '_log',
        value: function _log(desc, params) {
            var id = params && 'id' in params ? params['id'] : sid(this._id);
            return this.log(desc, _.extend(params, {
                id: id
            }));
        }
    }, {
        key: 'emit',
        value: function emit(event, params) {
            _.extend(params, { type: event });
            return EventEmitter.prototype.emit.call(this, event, params);
        }
    }, {
        key: '_error',
        value: function _error(type, desc, innerError, params) {
            return this.error(desc, _.extend({
                type: _Events.Error,
                errorType: type,
                innerError: innerError,
                id: sid(this._id)
            }, params));
        }
    }, {
        key: 'disConnect',
        value: function disConnect() {
            return this._serialport.disConnect();
        }
    }, {
        key: 'state',
        get: function get() {
            return this.__state;
        }
    }, {
        key: 'id',
        get: function get() {
            return this._id;
        }
    }, {
        key: 'isConnected',
        get: function get() {
            return this._serialport.isConnected;
        }
    }], [{
        key: 'Events',
        get: function get() {
            return _Events;
        }
    }, {
        key: 'Errors',
        get: function get() {
            return _Errors;
        }
    }, {
        key: 'States',
        get: function get() {
            return _hostState;
        }
    }]);

    return Host;
}(EventEmitter);

function decode(buf) {
    // important:
    // assume data length is 16
    // double  hex: 33 (dec: 51)  (16bit--hex: 33 33) is sync information from Security Terminal
    // After this sync information, the next 16 bit is the status information from Security Terminal
    // Program below is : detect sycn bit (Double hex 33) then read & record the status information from serial port of security terminal
    // because the data format in the serial port can be 33 33 ** ** or 33 33 33 ** or 33 * 33 33 33 *,
    // We need to detect 2 consecutive 33, not only one 33, and then record the real status information from security terminal
    var flag = 0,
        c1 = 0,
        c2 = 0;
    for (var i = 0; i < 15; i++) {
        if (flag === 0 && buf[i] !== 0x33) {
            flag = 1;
            continue;
        }
        if (flag === 1 && buf[i] === 0x33) {
            flag = 2;
            continue;
        }
        if (flag === 2 && buf[i] === 0x33) {
            flag = 3;
            continue;
        }
        if (flag === 3) {
            c1 = buf[i];
            c2 = buf[i + 1];
            break;
        }
    }

    if (c1 === 0 && c2 === 0) {
        // fib optic connection error -> fatal error
        return {
            type: _hostState.Error,
            errorType: _Errors.ConnectError,
            desc: '收到主机无效指令'
        };
    }
    //0x33 0x33 0x55 0x15 0x00 0x00 0x00 0x00
    if (c1 === 0x55 && c2 === 0x15) {
        // system ready
        return {
            type: _hostState.Normal
        };
    }
    //0x33 0x33 0x01 0xC1 0x00 0x00 0x00 0x00
    //771米
    if ((c2 & 0xC0) === 0xC0) {
        var dis = ((c2 & 0xF) << 8) + c1;
        dis *= 3;
        return {
            type: _hostState.Alarm,
            position: dis
        };
    }
    //0x33 0x33 0x00 0x40 0x00 0x00 0x00 0x00
    //01000000
    if ((c2 & 0xC0) === 0x40) {
        // let dis=((c2 & 0xF) << 8) + c1;
        // dis = dis * 3 - 25; // meter
        // if (dis <= 50) dis = 50;
        return {
            type: _hostState.Error,
            errorType: _Errors.InitError,
            desc: '收到主机初始化异常指令'
        };
    }
}

var inc = 0;
function sid(index) {
    var date = new Date();
    if (inc === 10000) inc = 0;
    return ('' + date.getFullYear()).slice(2) + _.padStart('' + (date.getMonth() + 1), 2, '0') + _.padStart('' + date.getDate(), 2, '0') + _.padStart('' + date.getHours(), 2, '0') + _.padStart('' + date.getMinutes(), 2, '0') + _.padStart('' + date.getSeconds(), 2, '0') + _.padStart('' + index, 2, '0') + _.padStart('' + inc++, 4, 0);
}

exports = module.exports = Host;
//# sourceMappingURL=host.js.map