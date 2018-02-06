'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Created by Luky on 2017/10/19
 */

var config = global.server_config || require('../config/config');
var _ = require('lodash');
var Server = require('./messenger_server');

var _require = require('../log/log'),
    Parser = _require.Parser;

var net = require('net');
var CmdFormatter = require('./interfaces/cmd_formatter');
var assert = require('assert');

var CmdSplitter = function () {
    function CmdSplitter(cb) {
        _classCallCheck(this, CmdSplitter);

        this._cb = cb;
        this._cache = null;
        this._expected = 0;
    }

    _createClass(CmdSplitter, [{
        key: 'append',
        value: function append(data) {
            do {
                if (!data.length) return;
                if (this._expected === 0) {
                    this._expected = data.readUInt8(0);
                }
                if (this._expected > data.length) {
                    if (null === this._cache) this._cache = data;else this._cache = Buffer.concat([this._cache, data]);
                    this._expected -= data.length;
                    return;
                }
                if (this._cache === null) {
                    this._cb(data.slice(0, this._expected));
                    data = data.slice(this._expected);
                    this._expected = 0;
                } else {
                    this._cb(Buffer.concat(this._cache, data.slice(0, this._expected)));
                    this._cache = null;
                    data = data.slice(this._expected);
                    this._expected = 0;
                }
            } while (true);
        }
    }]);

    return CmdSplitter;
}();

var SocketServer = function (_Server) {
    _inherits(SocketServer, _Server);

    function SocketServer(hostServer, port, cmdFormatter) {
        _classCallCheck(this, SocketServer);

        var _this = _possibleConstructorReturn(this, (SocketServer.__proto__ || Object.getPrototypeOf(SocketServer)).call(this, hostServer));

        _this._port = port || _.get(config, 'state_server.port', 3001);
        _this._server = null;
        _this._clients = new Set();
        _this._index = 0;
        _this._cmdFormater = cmdFormatter;
        if (!(cmdFormatter instanceof CmdFormatter)) throw new Error('未找到集成接口,服务无法正常运行');
        Parser(_this, 'server_socket.js', { port: _this._port });
        return _this;
    }

    _createClass(SocketServer, [{
        key: '_onReceiveCmd',
        value: function _onReceiveCmd(client, cmd) {
            var rec = this._cmdFormater.formatReceived(cmd);
            switch (rec.type) {
                case CmdFormatter.CmdReceived.clear:
                    this._onReceiveMsgIntrusionAlert(rec.hid);
                    this.log('收到复位命令', { cmd: cmd.toString('hex'), translation: rec, client: client.address() });
                    break;
                default:
                    //CmdFormatter.CmdReceived.unKnown:
                    this.warn('收到未知命令', { cmd: cmd.toString('hex'), client: client.address() });
                    break;
            }
        }
    }, {
        key: 'notifyHostStateChanged',
        value: function notifyHostStateChanged(evt) {
            var _this2 = this;

            var cmd = this._cmdFormater.formatHostStateChanged(this._nextIndex, evt);
            this._clients.forEach(function (client) {
                if (cmd) client.write(cmd, function () {
                    _this2.log('命令已发出', { cmd: cmd.toString('hex'), original: evt, client: client.address() });
                });
            });
        }
    }, {
        key: 'notifyHostsState',
        value: function notifyHostsState(client, data) {
            var _this3 = this;

            //hid,type,stateNew,position
            _.each(data, function (state) {
                var cmd = _this3._cmdFormater.formatHostStateChanged(_this3._nextIndex, state);
                if (cmd) client.write(cmd, function () {
                    _this3.log('命令已发出', { cmd: cmd.toString('hex'), original: state, client: client.address() });
                });
            });
        }
    }, {
        key: 'start',
        value: function start() {
            var _this4 = this;

            this.stop();
            return new Promise(function (resolve, reject) {

                var server = net.createServer(function (socket) {
                    //'connection' listener
                    socket.setKeepAlive(true, 300000);
                    socket.setNoDelay(true);
                    socket._cmdSplitter = new CmdSplitter(_this4._onReceiveCmd.bind(_this4, socket));
                    _this4._clients.add(socket);
                    var ip = socket.address();
                    _this4.log('新客户端登陆', { ip: ip, count: _this4._clients.size });
                    _this4.emit(Server.Events.newClient, socket);
                    socket.on('close', function (had_error) {
                        delete socket._cmdSplitter;
                        _this4._clients.delete(socket);
                        socket.removeAllListeners();
                        if (had_error) _this4.warn('客户端socket错误关闭');
                        _this4.log('客户端退出', { ip: ip, count: _this4._clients.size });
                    });
                    //之后所有命令保证第一个8bit为数据的长度，socket会保证一次输出为8bit指定的命令长度
                    socket.on('data', function (data) {
                        socket._cmdSplitter.append(data);
                    });
                    socket.on('error', function (err) {
                        _this4.error('客户端异常', { innerError: err.toString() });
                    });
                });

                server.on('error', function (err) {
                    if (err.code === 'EACCES') {
                        return reject(_this4.error('端口被占用,服务启动失败'));
                    }
                    reject(_this4.error('内部错误,服务启动失败', { innerError: err.toString() }));
                });

                server.on('close', function () {
                    _this4.log('服务器已关闭，端口释放');
                    server.removeAllListeners();
                    server = null;
                });

                server.listen(_this4._port, function () {
                    //'listening' listener
                    _this4._server = server;
                    _this4.log('服务器启动');
                    return resolve();
                });
            });
        }
    }, {
        key: 'stop',
        value: function stop() {
            if (this._server) {
                this._server.close();
                this._server = null;
            }
        }
    }, {
        key: '_nextIndex',
        get: function get() {
            return this._index = ++this._index & 0xfff;
        }
    }]);

    return SocketServer;
}(Server);

exports = module.exports = SocketServer;
//# sourceMappingURL=messenger_server_socket.js.map