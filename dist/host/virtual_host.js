'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _ = require('lodash');
var SerialPort = require('../serialport/serialport');
var EventEmitter = require('events').EventEmitter;

var _options = {
    baudRate: 115200,
    stopBits: 2,
    dataBits: 8,
    parity: 'none',
    byteLength: 1
};

var cmds = [
//正常指令
new Buffer([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x33, 0x33, 0x55, 0x15, 0x00, 0x00, 0x00, 0x00]),
//771米异常
new Buffer([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x33, 0x33, 0x01, 0xC1, 0x00, 0x00, 0x00, 0x00]),
//初始化异常
new Buffer([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x33, 0x33, 0x00, 0x40, 0x00, 0x00, 0x00, 0x00]),
//错误指令
new Buffer([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x33, 0x30, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00])];

var _cmd = {
    normal: 'normal', alarm: 'alarm'
};

var _normalCmd = cmds[0];
var _alarmCmd = Buffer.from([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x33, 0x33, 0x00, 0xC0, 0x00, 0x00, 0x00, 0x00]);

var VirtualHost = function (_EventEmitter) {
    _inherits(VirtualHost, _EventEmitter);

    function VirtualHost(port) {
        _classCallCheck(this, VirtualHost);

        var _this = _possibleConstructorReturn(this, (VirtualHost.__proto__ || Object.getPrototypeOf(VirtualHost)).call(this));

        _this._port = port;
        _this._serialPort = new SerialPort(port, _options);
        _this._serialPort.on('data', _this._onData.bind(_this));
        _this._timeHandle = 0;
        _this._state = 'ready';
        console.log('|||||||||||||||||||||||||||||||||||||host ' + _this._port + ' state normal');
        return _this;
    }

    _createClass(VirtualHost, [{
        key: '_onData',
        value: function _onData(data) {
            if (data[0] === 0xAA) {
                this.emit('reset', { port: this._port });
                console.log('|||||||||||||||||||||||||||||||||||||host ' + this._port + '  state reseted');
                this._state = 'reset';
                clearTimeout(this._timeHandle);
                this.send(_cmd.normal);
                return;
            }
            if (data[0] === 0) {
                this.emit('ready', { port: this._port });
                this._state = 'ready';
                console.log('|||||||||||||||||||||||||||||||||||||host ' + this._port + ' state sys rdy');
            }
        }
    }, {
        key: 'start',
        value: function start() {
            return this._serialPort.connect();
        }
    }, {
        key: 'send',
        value: function send(cmdname, postion) {
            var _this2 = this;

            var logout = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;

            clearTimeout(this._timeHandle);
            if (cmdname === _cmd.normal) {
                this._serialPort.write(_normalCmd);
                this._timeHandle = setTimeout(this.send.bind(this, cmdname, postion), 250);
                return;
            }
            if (cmdname === _cmd.alarm) {
                var cmdnew = Buffer.from(_alarmCmd);
                var p = Math.floor(postion / 3);
                cmdnew[10] = p & 0xFF;
                cmdnew[11] += p >> 8 & 0xF;
                this._serialPort.write(cmdnew).then(function () {
                    if (logout) {
                        _this2._state = 'alarm';
                        console.log('|||||||||||||||||||||||||||||||||||||host ' + _this2._port + ' state alarm,cmd ' + cmdnew.toString('hex'));
                    }
                });
                this._timeHandle = setTimeout(this.send.bind(this, cmdname, postion, false), 250);
                return;
            }
            throw new Error('unknow cmd ' + cmdname);
        }
    }, {
        key: 'stop',
        value: function stop() {
            return this._serialPort.disConnect();
        }
    }], [{
        key: 'AlarmCmd',
        value: function AlarmCmd(postion) {
            var cmdnew = Buffer.from(_alarmCmd);
            var p = Math.floor(postion / 3);
            cmdnew[10] = p & 0xFF;
            cmdnew[11] += p >> 8 & 0xF;
            return cmdnew;
        }
    }, {
        key: 'portOptions',
        get: function get() {
            return _options;
        }
    }, {
        key: 'cmds',
        get: function get() {
            return cmds;
        }
    }, {
        key: 'nomalCmd',
        get: function get() {
            return cmds[0];
        }
    }, {
        key: 'CMD',
        get: function get() {
            return _cmd;
        }
    }]);

    return VirtualHost;
}(EventEmitter);

exports = module.exports = VirtualHost;
//# sourceMappingURL=virtual_host.js.map