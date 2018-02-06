'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _ = require('lodash');
var net = require('net');
var EventEmitter = require('events').EventEmitter;

var _require = require('../../../app/log/log'),
    Parser = _require.Parser;

var Client = function (_EventEmitter) {
    _inherits(Client, _EventEmitter);

    function Client(host, port) {
        _classCallCheck(this, Client);

        var _this = _possibleConstructorReturn(this, (Client.__proto__ || Object.getPrototypeOf(Client)).call(this));

        _this.host = host || null;
        _this.port = port;
        _this.client = null;
        Parser(_this, 'client_socket.js', { port: _this.port, host: _this.host || 'localhost' });
        return _this;
    }

    _createClass(Client, [{
        key: 'reconnect',
        value: function reconnect() {
            var _this2 = this;

            var time = 0;
            var restart = function restart() {
                _this2.start().then(function () {
                    time = 0;
                    _this2.log('服务自动重连成功');
                }).catch(function () {
                    _this2.warn('\u670D\u52A1\u91CD\u8FDE\u5931\u8D25', { times: time++ });
                    setTimeout(restart, 5000);
                });
            };
            restart();
        }
    }, {
        key: 'start',
        value: function start() /*com*/{
            var _this3 = this;

            this.stop();
            return new Promise(function (resolve, reject) {
                var client = net.Socket({
                    readable: true,
                    writable: true
                });
                client.connect({ port: _this3.port, host: _this3.host }, function () {
                    _this3.log('已连接服务器');
                    _this3.client = client;
                    return resolve();
                });
                client.on('error', function (err) {
                    if (err.code === 'ENOENT') {
                        return reject(_this3.error('服务器未找到'));
                    }
                    _this3.error('\u5185\u90E8\u9519\u8BEF,' + err.toString());
                });
                client.on('data', function (data) {
                    /*const {id,data}=unpackageData(data1);
                    com.write(data,id);*/
                    _this3.log('收到数据', { data: data.toString('hex') });
                    _this3.emit('data', data);
                });
                client.on('close', function (had_error) {
                    client.removeAllListeners();
                    if (had_error) {
                        _this3.error('服务器关闭或连接错误');
                        _this3.reconnect();
                        //尝试重连服务器
                    } else _this3.log('连接正常关闭');
                });
            });
        }
    }, {
        key: 'write',
        value: function write(data) {
            if (this.client) {
                this.client.write(data);
            }
        }
    }, {
        key: 'stop',
        value: function stop() {
            if (this.client) {
                this.client.destroy();
                this.client = null;
            }
        }
    }]);

    return Client;
}(EventEmitter);

exports = module.exports = Client;
//# sourceMappingURL=client_socket.js.map