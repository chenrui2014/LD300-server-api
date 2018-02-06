'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * Created by Luky on 2017/10/19
 */
var io = require('socket.io');
var config = global.server_config || require('../config/config');
var _ = require('lodash');
var Server = require('./messenger_server');

var _require = require('../log/log'),
    Parser = _require.Parser;

var HttpSocketServer = function (_Server) {
    _inherits(HttpSocketServer, _Server);

    function HttpSocketServer(hostServer, port, path) {
        _classCallCheck(this, HttpSocketServer);

        var _this = _possibleConstructorReturn(this, (HttpSocketServer.__proto__ || Object.getPrototypeOf(HttpSocketServer)).call(this, hostServer));

        _this._port = port || _.get(config, 'state_server.port', 3001);
        _this._path = path || _.get(config, 'state_server.path', '/stateServer');
        Parser(_this, 'server_http_socket.js', { port: _this._port, path: _this._path });
        return _this;
    }

    _createClass(HttpSocketServer, [{
        key: 'start',
        value: function start() {
            var _this2 = this;

            this.stop();
            return new Promise(function (resolve, reject) {
                var server = io({
                    path: _this2._path,
                    serveClient: false
                });
                var httpServer = require('http').createServer();
                var errorBind = function errorBind(err) {
                    httpServer.removeListener('error', errorBind);
                    if (err.code === 'EACCES' || err.code === 'EADDRINUSE') {
                        _this2.error('端口被占用,服务启动失败', { innerError: err });
                    } else {
                        _this2.error('其他未知错误,服务启动失败', { innerError: err });
                    }
                    reject(err);
                };
                var onListen = function onListen() {
                    httpServer.removeListener('listening', onListen);
                    _this2._server = server;
                    _this2._httpServer = httpServer;
                    var ct = 0;
                    server.on('connection', function (client) {
                        ct++;
                        var ip = _.get(client, 'conn.remoteAddress');
                        _this2.log('新客户端登陆', { ip: ip, count: ct });
                        _this2.emit(Server.Events.newClient, client);
                        client.on('disconnection', function () {
                            client.removeAllListeners();
                            ct--;
                            _this2.log('客户端退出', { ip: ip, count: _this2.clients.size });
                        });
                        client.on('clear', function (cmd) {
                            _this2._onReceiveMsgIntrusionAlert(cmd.hid);
                        });
                        client.on('error', function (err) {
                            _this2.error('客户端异常', { innerError: err.toString() });
                        });
                    });

                    _this2.log('服务器启动');
                    resolve();
                };
                httpServer.on('error', errorBind);
                httpServer.on('listening', onListen);

                server.attach(httpServer, {
                    pingInterval: 10000,
                    pingTimeout: 5000,
                    cookie: false
                });
                httpServer.listen(_this2._port);
            });
        }
    }, {
        key: 'stop',
        value: function stop() {
            if (this._server) {
                this._server.removeAllListeners();
                this._server.close();
                this._server = null;
                this._httpServer.close(function (e) {
                    return e;
                });
                this._httpServer = null;
                this.log('服务器已关闭，端口释放');
            }
        }
    }, {
        key: 'notifyHostStateChanged',
        value: function notifyHostStateChanged(msg) {
            this._server && this._server.emit('update', msg, { for: 'everyone' });
        }
    }, {
        key: 'notifyHostsState',
        value: function notifyHostsState(client, msg) {
            client.emit('init', msg);
        }
    }]);

    return HttpSocketServer;
}(Server);

exports = module.exports = HttpSocketServer;
//# sourceMappingURL=messenger_server_http_socket.js.map