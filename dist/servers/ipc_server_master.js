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
 * Created by Luky on 2017/8/17.
 */

var _ = require('lodash');
var IPC = require('../ipcs/base/ipc');
var Data = require('./data_server');
var EventEmitter = require('events').EventEmitter;
var config = global.server_config || require('../config/config');
var store = _.get(config, 'runMode.store');
var listenState = false; //_.get(config,'ipc.listen',false);
var http = require('http');
var numCPUs = require('os').cpus().length;
var numCP = Math.round(numCPUs * 5 / 8);
var cp = require('child_process');
var url = require('url');
var path = require('path');
var childjs = global.server_config ? path.resolve(config.root, 'live.js') : path.resolve(config.root, 'servers/ipc_server_child.js');

var _require = require('../log/log'),
    Parser = _require.Parser;

var httpProxy = require('http-proxy');
var proxy = httpProxy.createProxyServer();

var IPCServer = function (_EventEmitter) {
    _inherits(IPCServer, _EventEmitter);

    function IPCServer(options) {
        _classCallCheck(this, IPCServer);

        var _this = _possibleConstructorReturn(this, (IPCServer.__proto__ || Object.getPrototypeOf(IPCServer)).call(this));

        _this._workers = [];
        _this._hServer = null;
        _this._ipcs = {};
        _this.options = options || {};
        _this.options.port = _this.options.port || _.get(config, 'ipc_server.port', 3000);
        Parser(_this, 'ipc_server_master.js', { port: _this.options.port });
        return _this;
    }

    _createClass(IPCServer, [{
        key: '_removeIpcListener',
        value: function _removeIpcListener(ipc, id) {
            if (!this._ipc_online) return;
            ipc.removeListener('online', this._ipc_online);
            ipc.removeListener('offline', this._ipc_offline);
        }
    }, {
        key: '_addIpcListener',
        value: function _addIpcListener(ipc, id) {
            this._ipc_online = this._ipc_online || this.emit.bind(this, IPC.Events.Online);
            this._ipc_offline = this._ipc_offline || this.emit.bind(this, IPC.Events.Offline);
            ipc.on('online', this._ipc_online);
            ipc.on('offline', this._ipc_offline);
        }
    }, {
        key: '_onProcessMessage',
        value: function _onProcessMessage(worker, event) {
            if (event.type === 'listening') {
                worker.port = event.port;
            } else if (event.type === 'countChanged') {
                var ct = worker.payload = event.count;
                this._ipcs[event.id] = this._ipcs[event.id] || {};
                if (0 === ct) this._ipcs[event.id].worker = null;else this._ipcs[event.id].worker = worker;
                this._workers = _.orderBy(this._workers, ['payload']);
            }
            this.log('收到子进程消息', { innerEvent: event, port: worker.port });
        }
    }, {
        key: 'findWorker',
        value: function findWorker(id) {
            return _.get(this._ipcs, id + '.worker', null);
        }
    }, {
        key: 'start',
        value: function () {
            var _ref = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
                var _this2 = this;

                var _startWorker;

                return _regenerator2.default.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                this.stop();

                                _startWorker = function _startWorker() {
                                    proxy.on('error', function (err) {
                                        _this2.error('http代理返回错误', { innerError: err });
                                    });
                                    listenState && _.forEach(ipcs, function (id) {
                                        _this2._addIpcListener(id);
                                    });
                                    for (var i = 0; i < numCP; i++) {
                                        var args = [];
                                        var worker = null;
                                        if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
                                            worker = cp.fork(childjs, args.concat([store]), { execArgv: ['--inspect=' + (process.debugPort + i + 1)] });
                                        } else {
                                            cp.fork(childjs, args);
                                        }
                                        var wobj = { worker: worker, payload: 0, start: new Date() };

                                        wobj.lsn = worker.on('message', _this2._onProcessMessage.bind(_this2, wobj));
                                        _this2._workers.push(wobj);
                                    }
                                };

                                return _context.abrupt('return', new Promise(function (resolve, reject) {
                                    var httpServer = http.createServer(function (req, res) {
                                        var uri = url.parse(req.url);
                                        if (uri.pathname.indexOf('/ipc/') !== 0) {
                                            _this2.warn('收到未知请求', { uri: uri });
                                            res.setHeader('Content-Type', 'application/json; charset=utf-8');
                                            res.writeHead(404, { 'Content-Type': 'text/plain' });
                                            res.write("服务未找到!");
                                            return res.end();
                                        }
                                        var id = parseInt(uri.pathname.slice(5));
                                        var worker = _this2.findWorker(id);
                                        if (!worker) {
                                            _this2._workers.push(worker = _this2._workers.shift());
                                        }
                                        _this2.log('请求转发', { 'Location': 'http://localhost:' + worker.port + req.url });
                                        //res.writeHead(302, {'Location': `http://localhost:${worker.port}`});
                                        //res.end();
                                        var target = { target: 'http://127.0.0.1:' + worker.port };
                                        proxy.web(req, res, target, function (e) {
                                            _this2.error('转发出错', { innerError: e, target: target });
                                        });
                                    }).listen(_this2.options.port);
                                    var errorBind = function errorBind(err) {
                                        httpServer.removeListener('error', errorBind);
                                        if (err.code === 'EACCES' || err.code === 'EADDRINUSE') {
                                            _this2.error('端口被占用,状态服务启动失败', { innerError: err });
                                        } else {
                                            _this2.error('其他未知错误,状态服务启动失败', { innerError: err });
                                        }
                                        reject(err);
                                    };
                                    var onListen = function onListen() {
                                        httpServer.removeListener('listening', onListen);
                                        _startWorker();
                                        _this2._hServer = httpServer;
                                        _this2.log('摄像头分发服务启动');
                                        var x = setInterval(function () {
                                            if (!_.some(_this2._workers, function (worker) {
                                                return !('port' in worker);
                                            })) {
                                                clearInterval(x);
                                                resolve();
                                            }
                                        }, 500);
                                    };
                                    httpServer.on('error', errorBind);
                                    httpServer.on('listening', onListen);
                                }));

                            case 3:
                            case 'end':
                                return _context.stop();
                        }
                    }
                }, _callee, this);
            }));

            function start() {
                return _ref.apply(this, arguments);
            }

            return start;
        }()
    }, {
        key: 'stop',
        value: function stop() {
            var _this3 = this;

            if (!this._hServer) return;
            proxy.removeAllListeners();
            listenState && _.forEach(this._ipcs, function (ipc) {
                _this3._removeIpcListener(ipc.id);
            });
            this._ipcs = {};
            this._workers.length && _.forEach(this._workers, function (worker) {
                worker.worker.kill();
            });
            this._workers = [];
            this._hServer && this._hServer.close(function (e) {
                return e;
            });
            this._hServer = null;
            this.log('摄像头分发服务停止');
        }
    }]);

    return IPCServer;
}(EventEmitter);

exports = module.exports = IPCServer;
//# sourceMappingURL=ipc_server_master.js.map