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
 * Created by Luky on 2017/6/29.
 */

var EventEmitter = require('events').EventEmitter;
var WebSocket = require('ws');
var config = global.server_config || require('../config/config');
var _ = require('lodash');
//const factory=require('./ipc_factory');
var url = require('url');
var assert = require('assert');
//const timeSpan=require('../TimeSpan');
var Cache = require('./cache/to_flv_cache');
var FLVEncoder = require('../flv/flv_encoder');
var Persistence = require('./ipc_video_persistence');
var fs = require('fs');

var _require = require('../log/log'),
    Parser = _require.Parser;

var Live = function (_EventEmitter) {
    _inherits(Live, _EventEmitter);

    function Live(server, ipc, options) {
        _classCallCheck(this, Live);

        var _this = _possibleConstructorReturn(this, (Live.__proto__ || Object.getPrototypeOf(Live)).call(this));

        _this._server = server;
        _this._wss = null;
        _this._ipc = ipc;
        _this._cache = null;
        _this._persistence = new Persistence(_.get(options, 'persistence', null));
        _this.options = {
            autoClose: _.get(options, 'autoClose', true)
        };
        var path = _.get(options, 'server.path', '/live');
        _this._path = path + '/' + ipc.id;
        Parser(_this, 'ipc_live_server.js', { id: ipc.id, path: _this._path });
        return _this;
    }

    _createClass(Live, [{
        key: 'stopArrchive',
        value: function stopArrchive() {
            if (!this._file) return;
            var path = this._file.path;
            if (this._cache) {
                this._cache.removeClient(this._fileSend);
            }
            this._file.close();
            this._file = null;
            this._fileSend = null;
            this.emit('fileClosed', this.log('直播流与文件写入通道关闭', { path: path }));
            this.tryAutoClose();
        }
    }, {
        key: 'arrchive',
        value: function () {
            var _ref = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee(prefix) {
                var ok, path, file, startTime, send;
                return _regenerator2.default.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                if (!this._file) {
                                    _context.next = 2;
                                    break;
                                }

                                return _context.abrupt('return', this._file.path);

                            case 2:
                                _context.next = 4;
                                return this._play().catch(function () {
                                    return false;
                                });

                            case 4:
                                ok = _context.sent;

                                if (ok) {
                                    _context.next = 7;
                                    break;
                                }

                                return _context.abrupt('return', '');

                            case 7:
                                path = this._persistence.videoPath(prefix, 'flv');
                                file = this._file = fs.createWriteStream(path);
                                startTime = 0;

                                send = this._fileSend = function (data, options) {
                                    var timestamp = 0;
                                    if (options.type === 'tag' && options.tagType === 'video' && options.dataType === 'data') {
                                        if (startTime === 0) startTime = options.time;
                                        timestamp = options.time - startTime;
                                        FLVEncoder.setTimestamp(data, timestamp);
                                    }
                                    file.write(data);
                                };

                                this._cache.addClient(send);
                                this.emit('file', this.log('建立直播流与文件的写入通道', { path: path }));
                                return _context.abrupt('return', path);

                            case 14:
                            case 'end':
                                return _context.stop();
                        }
                    }
                }, _callee, this);
            }));

            function arrchive(_x) {
                return _ref.apply(this, arguments);
            }

            return arrchive;
        }()
    }, {
        key: '_play',
        value: function () {
            var _ref2 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee2() {
                var _this2 = this;

                var ipc, cache, videoToCache;
                return _regenerator2.default.wrap(function _callee2$(_context2) {
                    while (1) {
                        switch (_context2.prev = _context2.next) {
                            case 0:
                                if (!this._cache) {
                                    _context2.next = 2;
                                    break;
                                }

                                return _context2.abrupt('return', true);

                            case 2:
                                ipc = this._ipc;
                                //await ipc.connect().catch(e=>{
                                //    throw new Error(this.error('摄像头连接出错',{innerError:e}));
                                //});

                                cache = new Cache(true, ipc.supportAudio);

                                videoToCache = function videoToCache(data) {
                                    cache.write(data);
                                };

                                ipc.on('video', videoToCache);
                                _context2.next = 8;
                                return ipc.realPlay().catch(function (e) {
                                    cache.clear();
                                    cache = null;
                                    ipc.removeListener('video', videoToCache);
                                    return Promise.reject(_this2.error('无法获取直播流', { innerError: e }));
                                });

                            case 8:
                                this.log('获取直播流');
                                this._cache = cache;
                                this._videoToCache = videoToCache;
                                return _context2.abrupt('return', true);

                            case 12:
                            case 'end':
                                return _context2.stop();
                        }
                    }
                }, _callee2, this);
            }));

            function _play() {
                return _ref2.apply(this, arguments);
            }

            return _play;
        }()
    }, {
        key: '_stopPlay',
        value: function _stopPlay() {
            if (!this._cache) return;
            this._ipc.removeListener('video', this._videoToCache);
            this._videoToCache = null;
            this._ipc.stopRealPlay().catch();
            if (this._cache) {
                this._cache.clear();
                this._cache = null;
            }
            this.log('关闭直播流');
        }
    }, {
        key: '_closeWSS',
        value: function _closeWSS() {
            if (!this._wss) return;
            clearInterval(this._clientAliveTest);
            this._clientAliveTest = 0;
            if (this._wss) {
                this._wss.close(function () {});
                this._wss = null;
            }
            this.log('直播流关闭');
            this.tryAutoClose();
        }
    }, {
        key: 'tryAutoClose',
        value: function tryAutoClose() {
            if (!this.options.autoClose) return;
            if (this._file || this._wss) return;
            this.close();
        }
    }, {
        key: 'openWSS',
        value: function () {
            var _ref3 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee3() {
                var _this3 = this;

                var wss;
                return _regenerator2.default.wrap(function _callee3$(_context3) {
                    while (1) {
                        switch (_context3.prev = _context3.next) {
                            case 0:
                                if (!this._wss) {
                                    _context3.next = 2;
                                    break;
                                }

                                return _context3.abrupt('return', true);

                            case 2:
                                _context3.next = 4;
                                return this._play().catch(function () {
                                    return null;
                                });

                            case 4:
                                if (_context3.sent) {
                                    _context3.next = 6;
                                    break;
                                }

                                return _context3.abrupt('return', false);

                            case 6:
                                wss = this._wss = new WebSocket.Server({
                                    server: this._server,
                                    path: this._path,
                                    verifyClient: function verifyClient() /*info*/{
                                        return true;
                                    }
                                });


                                this._clientAliveTest = setInterval(function () {
                                    if (!wss.clients.size) {
                                        return _this3._closeWSS();
                                    }
                                    wss.clients.forEach(function (ws) {
                                        if (ws.isAlive === false) return ws.terminate();
                                        ws.isAlive = false;
                                        ws.ping('', false, true);
                                    });
                                }, 10000);

                                wss.on('error', function (err) {
                                    _this3.error('摄像头推流服务异常', { innerError: err });
                                });

                                wss.on('connection', function (ws /*, req*/) {
                                    //const uri = url.parse(req.url, true);
                                    ws.on('pong', function () {
                                        ws.isAlive = true;
                                    });
                                    var send = function send(data) /*options*/{
                                        if (ws.readyState === WebSocket.OPEN) {
                                            //console.log(`输出时长${(options.time-send.time0)/1000}`);
                                            ws.send(data);
                                        }
                                    };
                                    ws.on('close', function (code, reason) {
                                        _this3._cache.removeClient(send);
                                        _this3.log('客户端连接关闭', { code: code, reason: reason });
                                    });
                                    _this3._cache.addClient(send);
                                });
                                this.emit('open', this.log('摄像头直播服务已启动,摄像头编号'));
                                return _context3.abrupt('return', true);

                            case 12:
                            case 'end':
                                return _context3.stop();
                        }
                    }
                }, _callee3, this);
            }));

            function openWSS() {
                return _ref3.apply(this, arguments);
            }

            return openWSS;
        }()
    }, {
        key: 'close',
        value: function close() {
            this.stopArrchive();
            this._closeWSS();
            this._stopPlay();
            this.emit('close', this.log('\u6444\u50CF\u5934\u76F4\u64AD\u670D\u52A1\u5173\u95ED'));
        }
    }, {
        key: 'path',
        get: function get() {
            return this._path;
        }
    }, {
        key: 'running',
        get: function get() {
            return !!this._wss;
        }
    }]);

    return Live;
}(EventEmitter);

exports = module.exports = Live;
//# sourceMappingURL=ipc_live_server.js.map