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
 * Created by Luky on 2017/7/3.
 */

var PTZ = require('../base/ptz');
var IPC = require('../base/ipc');
var onvif = require('onvif');
var globalConfig = global.server_config || require('../../config/config');
var config = globalConfig.getConfig('onvif_config.json');
var Cam = onvif.Cam;
var _ = require('lodash');
var assert = require('assert');
var yellowstone = require('yellowstone');
if (!('H264Transport' in yellowstone)) {
    yellowstone = require('../../../_3part/yellowstone');
}
var _yellowstone = yellowstone,
    RtspClient = _yellowstone.RtspClient,
    H264Transport = _yellowstone.H264Transport;

var header = new Buffer.from([0x00, 0x00, 0x00, 0x01]);

var _require = require('../../log/log'),
    Parser = _require.Parser;

var Writable = require('stream').Writable;
var EventEmitter = require('events').EventEmitter;
var url = require('url');

var ONVIF_IPC = function (_IPC) {
    _inherits(ONVIF_IPC, _IPC);

    function ONVIF_IPC(options) {
        _classCallCheck(this, ONVIF_IPC);

        var _this2 = _possibleConstructorReturn(this, (ONVIF_IPC.__proto__ || Object.getPrototypeOf(ONVIF_IPC)).call(this, options));

        _.each({ "zoom_speed": config['zoomSpeed'], "focus_speed": config['focusSpeed'],
            "aperture_speed": config['apertureSpeed'], "h_speed": config['hSpeed'],
            "v_speed": config['vSpeed'] }, function (val, key) {
            _this2[key] = options[key] || val;
        });
        _.each({ 'ip': '', 'port': 0, 'user': '', 'pwd': '',
            'b3g_protocol': false
        }, function (val, key) {
            _this2.options[key] = key in options ? options[key] : val;
        });
        _.each({ 'ip': '', 'port': 0, 'user': '', 'pwd': '', 'path': '' }, function (val, key) {
            _this2.options[key] = key in options ? options[key] : val;
        });
        _this2._camera_handle = null;
        _this2.__profiles = [];
        _this2.__profile = null;
        Parser(_this2, 'onvif.js', { id: _this2.options.id });
        return _this2;
    }

    _createClass(ONVIF_IPC, [{
        key: '_connect',
        value: function () {
            var _ref = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee2() {
                var _this3 = this;

                var opts;
                return _regenerator2.default.wrap(function _callee2$(_context2) {
                    while (1) {
                        switch (_context2.prev = _context2.next) {
                            case 0:
                                opts = {
                                    hostname: this.options.ip,
                                    username: this.options.user,
                                    password: this.options.pwd,
                                    port: this.options.port
                                };

                                if (this.options.path) opts.path = this.options.path;
                                return _context2.abrupt('return', new Promise(function (resolve, reject) {
                                    var cameraHandle = new Cam(opts, function () {
                                        var _ref2 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee(err) {
                                            var error;
                                            return _regenerator2.default.wrap(function _callee$(_context) {
                                                while (1) {
                                                    switch (_context.prev = _context.next) {
                                                        case 0:
                                                            if (!err) {
                                                                _context.next = 3;
                                                                break;
                                                            }

                                                            error = _this3.error('ONVIF协议接入错误', { innerError: err });
                                                            //this.emit(IPC.Events.Error, error);

                                                            return _context.abrupt('return', reject(error));

                                                        case 3:
                                                            _this3._camera_handle = cameraHandle;
                                                            _this3.setConnected();
                                                            _this3.emit(IPC.Events.Connected, _this3.log('ONVIF协议连接成功'));
                                                            _this3.options.fn_ptz = 'PTZ' in _this3._camera_handle.capabilities;
                                                            resolve();

                                                        case 8:
                                                        case 'end':
                                                            return _context.stop();
                                                    }
                                                }
                                            }, _callee, _this3);
                                        }));

                                        return function (_x) {
                                            return _ref2.apply(this, arguments);
                                        };
                                    }());
                                }));

                            case 3:
                            case 'end':
                                return _context2.stop();
                        }
                    }
                }, _callee2, this);
            }));

            function _connect() {
                return _ref.apply(this, arguments);
            }

            return _connect;
        }()
    }, {
        key: '_disConnect',
        value: function () {
            var _ref3 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee4() {
                var _this4 = this;

                var dis;
                return _regenerator2.default.wrap(function _callee4$(_context4) {
                    while (1) {
                        switch (_context4.prev = _context4.next) {
                            case 0:
                                if (this._camera_handle) {
                                    _context4.next = 2;
                                    break;
                                }

                                return _context4.abrupt('return');

                            case 2:
                                dis = function () {
                                    var _ref4 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee3() {
                                        return _regenerator2.default.wrap(function _callee3$(_context3) {
                                            while (1) {
                                                switch (_context3.prev = _context3.next) {
                                                    case 0:
                                                        delete _this4._camera_handle;
                                                        _this4.emit(IPC.Events.DisConnected, _this4.log('ONVIF协议断开连接'));

                                                    case 2:
                                                    case 'end':
                                                        return _context3.stop();
                                                }
                                            }
                                        }, _callee3, _this4);
                                    }));

                                    return function dis() {
                                        return _ref4.apply(this, arguments);
                                    };
                                }();

                                _context4.next = 5;
                                return Promise.all([this.stopRealPlay(), this.stopTalk()]).then(dis).catch(dis);

                            case 5:
                            case 'end':
                                return _context4.stop();
                        }
                    }
                }, _callee4, this);
            }));

            function _disConnect() {
                return _ref3.apply(this, arguments);
            }

            return _disConnect;
        }()
    }, {
        key: 'getRtspUriWithAuth',
        value: function () {
            var _ref5 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee5() {
                var uri;
                return _regenerator2.default.wrap(function _callee5$(_context5) {
                    while (1) {
                        switch (_context5.prev = _context5.next) {
                            case 0:
                                _context5.next = 2;
                                return this._getRtspUri();

                            case 2:
                                uri = _context5.sent;
                                return _context5.abrupt('return', respURI(uri, this.options.user, this.options.pwd));

                            case 4:
                            case 'end':
                                return _context5.stop();
                        }
                    }
                }, _callee5, this);
            }));

            function getRtspUriWithAuth() {
                return _ref5.apply(this, arguments);
            }

            return getRtspUriWithAuth;
        }()
    }, {
        key: '_getRtspUri',
        value: function () {
            var _ref6 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee6() {
                var _this5 = this;

                var pf, error;
                return _regenerator2.default.wrap(function _callee6$(_context6) {
                    while (1) {
                        switch (_context6.prev = _context6.next) {
                            case 0:
                                if (!this._rtsp_uri) {
                                    _context6.next = 2;
                                    break;
                                }

                                return _context6.abrupt('return', this._rtsp_uri);

                            case 2:
                                _context6.next = 4;
                                return this.connect();

                            case 4:
                                pf = this._profile;

                                if (!(null === pf)) {
                                    _context6.next = 12;
                                    break;
                                }

                                error = this.error('未获取H264协议相关的配置文件');
                                //this.emit(IPC.Events.Error,error);

                                _context6.next = 9;
                                return this.disConnect().catch();

                            case 9:
                                _context6.next = 11;
                                return Promise.reject(error);

                            case 11:
                                return _context6.abrupt('return', _context6.sent);

                            case 12:
                                return _context6.abrupt('return', new Promise(function (resolve, reject) {
                                    _this5._camera_handle.getStreamUri({ protocol: 'RTSP', profileToken: pf.token }, function (err, uri) {
                                        _this5.disConnect().catch();
                                        if (err) {
                                            var _error = _this5.error('getRtspUri', '获取H264协议RTSP地址错误', { innerError: err });
                                            //this.emit(IPC.Events.Error,error,error);
                                            return reject(_error);
                                        }
                                        _this5.log('获取H264到播放地址，协议类型RTSP', { uri: uri.uri });
                                        return resolve(_this5._rtsp_uri = uri.uri);
                                    });
                                }));

                            case 13:
                            case 'end':
                                return _context6.stop();
                        }
                    }
                }, _callee6, this);
            }));

            function _getRtspUri() {
                return _ref6.apply(this, arguments);
            }

            return _getRtspUri;
        }()
    }, {
        key: '_connectRtsp',
        value: function () {
            var _ref7 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee7(url) {
                var _this6 = this;

                var client, details;
                return _regenerator2.default.wrap(function _callee7$(_context7) {
                    while (1) {
                        switch (_context7.prev = _context7.next) {
                            case 0:
                                if (!this._RtspClientDetail) {
                                    _context7.next = 2;
                                    break;
                                }

                                return _context7.abrupt('return', this._RtspClientDetail);

                            case 2:
                                client = new RtspClient(this.options.user, this.options.pwd);
                                _context7.next = 5;
                                return client.connect(url, { keepAlive: false }).catch(function (err) {
                                    var error = _this6.error('_connectRtsp', 'RTSP协议直播接入异常', { innerError: err });
                                    //this.emit(IPC.Events.Error,error,error);
                                    return Promise.reject(error);
                                });

                            case 5:
                                details = _context7.sent;

                                this._RtspClient = client;
                                //console.log('Connected. Video format is', details.format);
                                // Open the output file
                                //assert.ok(details.isH264);
                                return _context7.abrupt('return', this._RtspClientDetail = details);

                            case 8:
                            case 'end':
                                return _context7.stop();
                        }
                    }
                }, _callee7, this);
            }));

            function _connectRtsp(_x2) {
                return _ref7.apply(this, arguments);
            }

            return _connectRtsp;
        }()
    }, {
        key: '_realPlay',
        value: function () {
            var _ref8 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee8() {
                var _this7 = this;

                var uri, details, h264Stream, h264Transport;
                return _regenerator2.default.wrap(function _callee8$(_context8) {
                    while (1) {
                        switch (_context8.prev = _context8.next) {
                            case 0:
                                _context8.next = 2;
                                return this._getRtspUri();

                            case 2:
                                uri = _context8.sent;
                                _context8.next = 5;
                                return this._connectRtsp(uri);

                            case 5:
                                details = _context8.sent;
                                h264Stream = new Writable();

                                h264Stream._write = function (buffer, enc, next) {
                                    _this7._pushData(buffer);
                                    next();
                                };
                                h264Transport = new H264Transport(this._RtspClient, h264Stream, details);
                                _context8.next = 11;
                                return this._RtspClient.play().catch(function () {
                                    var error = _this7.error('RTSP协议连接发生错误', err);
                                    h264Stream.removeAllListeners();
                                    return Promise.reject(error);
                                });

                            case 11:
                                this.__h264Stream = h264Stream;
                                this.__h264Stream = h264Transport;
                                /*        this._RtspClient.on('error',(err)=>{
                                            this.stopRealPlay();
                                            let error=this.error('RTSP协议连接发生错误',err);
                                            //this.emit(IPC.Events.Error,error);
                                        });*/
                                this.emit(IPC.Events.RealPlay, this.log('RTSP协议直播接入'));

                            case 14:
                            case 'end':
                                return _context8.stop();
                        }
                    }
                }, _callee8, this);
            }));

            function _realPlay() {
                return _ref8.apply(this, arguments);
            }

            return _realPlay;
        }()
    }, {
        key: '_pushData',
        value: function _pushData(data) {
            //_transform(data,enc,next){
            if (data.equals(header)) return;
            var buf = Buffer.allocUnsafe(data.length + 4);
            buf[0] = 0;buf[1] = 0;buf[2] = 0;buf[3] = 1;
            data.copy(buf, 4);
            //next(null,buf);
            EventEmitter.prototype.emit.call(this, 'video', buf);
        }
    }, {
        key: '_stopRealPlay',
        value: function () {
            var _ref9 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee9() {
                return _regenerator2.default.wrap(function _callee9$(_context9) {
                    while (1) {
                        switch (_context9.prev = _context9.next) {
                            case 0:
                                if (this._RtspClient) {
                                    _context9.next = 2;
                                    break;
                                }

                                return _context9.abrupt('return');

                            case 2:
                                if (this._h264Transport) {
                                    this._h264Transport = null;
                                    this.__h264Stream.removeAllListeners();
                                    this.__h264Stream = null;
                                }
                                this._RtspClient.close().catch(function (e) {
                                    return e;
                                });
                                this._RtspClient = null;
                                this.emit(IPC.Events.StopRealPlay, this.log('RTSP协议直播关闭'));

                            case 6:
                            case 'end':
                                return _context9.stop();
                        }
                    }
                }, _callee9, this);
            }));

            function _stopRealPlay() {
                return _ref9.apply(this, arguments);
            }

            return _stopRealPlay;
        }()
    }, {
        key: '_startTalk',
        value: function () {
            var _ref10 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee10(stream) {
                return _regenerator2.default.wrap(function _callee10$(_context10) {
                    while (1) {
                        switch (_context10.prev = _context10.next) {
                            case 0:
                            case 'end':
                                return _context10.stop();
                        }
                    }
                }, _callee10, this);
            }));

            function _startTalk(_x3) {
                return _ref10.apply(this, arguments);
            }

            return _startTalk;
        }()
    }, {
        key: '_stopTalk',
        value: function () {
            var _ref11 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee11() {
                return _regenerator2.default.wrap(function _callee11$(_context11) {
                    while (1) {
                        switch (_context11.prev = _context11.next) {
                            case 0:
                            case 'end':
                                return _context11.stop();
                        }
                    }
                }, _callee11, this);
            }));

            function _stopTalk() {
                return _ref11.apply(this, arguments);
            }

            return _stopTalk;
        }()
    }, {
        key: '_listen',
        value: function _listen() /*offlinecb*/{
            var _this8 = this;

            var _this = this;
            var aliveState = 0; //0 unknown 1 alive 2 offline
            var test = function test() {
                _this8._RtspClient.request("OPTIONS");
                _.throttle(emitOffline, 6000);
            };

            var emitOffline = function emitOffline() {
                aliveState = 2;
                _this.emit(IPC.Events.Offline);
            };

            this._heart = function (data, prefix) {
                if (prefix === 'S->C' && data.indexOf('OPTIONS') > -1) {
                    if (1 !== aliveState) _this.emit(IPC.Events.Online);
                    aliveState = 1;
                    setTimeout(test, 2000);
                }
            };

            this._rtspError = function () {
                emitOffline();
            };

            return this._getRtspUri().then(function (uri) {
                return _this8._connectRtsp(uri).then(function () {
                    setTimeout(test, 2000);
                    _this8._RtspClient.on('log', _this8._heart);
                    _this8._RtspClient.on('error', _this8._rtspError);
                });
            });

            /*return this._getRtspUri().then((uri)=>{
                _this._listenHandle=new HeartBeat(uri,_this.options.user,_this.options.pwd);
                _this._listenHandle.listen();
                _this._listenHandle.on(IPC.Events.Offline,(e)=>{
                    _this._listenHandle=null;
                    _this.emitEvent(IPC.Events.Offline,e.toString());
                });
                _this._listenHandle.on(IPC.Events.Alive,()=>{
                  });
            });*/
        }
    }, {
        key: '_stopListen',
        value: function _stopListen() {
            if (this._RtspClient) {
                this._RtspClient.removeListener('log', this._heart);
                this._RtspClient.removeListener('error', this._rtspError);
            }
        }
    }, {
        key: '_PTZ',
        value: function () {
            var _ref12 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee12(options) {
                var _this9 = this;

                return _regenerator2.default.wrap(function _callee12$(_context12) {
                    while (1) {
                        switch (_context12.prev = _context12.next) {
                            case 0:
                                if (this.supportPTZ) {
                                    _context12.next = 4;
                                    break;
                                }

                                _context12.next = 3;
                                return Promise.reject(this._error('_PTZ', '此设备不支持PTZ操作'));

                            case 3:
                                return _context12.abrupt('return', _context12.sent);

                            case 4:
                                _context12.next = 6;
                                return this.connect();

                            case 6:
                                options = _.defaults(options, { profileToken: this._profileToken });
                                return _context12.abrupt('return', new Promise(function (resolve, reject) {
                                    _this9._camera_handle.relativeMove(options, function (err) {
                                        _this9.disConnect().catch();
                                        if (err) {
                                            var error = _this9.error('PTZ操作异常', { innerError: err });
                                            //this.emit(IPC.Events.Error,error);
                                            return reject(error);
                                        }
                                        _this9.log('成功执行PTZ操作');
                                        resolve();
                                    });
                                }));

                            case 8:
                            case 'end':
                                return _context12.stop();
                        }
                    }
                }, _callee12, this);
            }));

            function _PTZ(_x4) {
                return _ref12.apply(this, arguments);
            }

            return _PTZ;
        }()

        //getNodes

    }, {
        key: 'ptzStop',
        value: function () {
            var _ref13 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee13() {
                var _this10 = this;

                var options;
                return _regenerator2.default.wrap(function _callee13$(_context13) {
                    while (1) {
                        switch (_context13.prev = _context13.next) {
                            case 0:
                                _context13.next = 2;
                                return this.connect();

                            case 2:
                                options = { panTilt: false, zoom: true, profileToken: this._profileToken };
                                return _context13.abrupt('return', new Promise(function (resolve, reject) {
                                    _this10._camera_handle.stop(options, function (err) {
                                        _this10.disConnect().catch();
                                        if (err) {
                                            var error = _this10.error('ptz停止异常', { innerError: error });
                                            //this.emit(IPC.Events.Error,error);
                                            return reject(error);
                                        }
                                        _this10.log('成功执行PTZ操作');
                                        resolve();
                                    });
                                }));

                            case 4:
                            case 'end':
                                return _context13.stop();
                        }
                    }
                }, _callee13, this);
            }));

            function ptzStop() {
                return _ref13.apply(this, arguments);
            }

            return ptzStop;
        }()
    }, {
        key: 'zoomAdd',
        value: function () {
            var _ref14 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee14() {
                return _regenerator2.default.wrap(function _callee14$(_context14) {
                    while (1) {
                        switch (_context14.prev = _context14.next) {
                            case 0:
                                _context14.next = 2;
                                return this._PTZ({ zoom: 1, speed: { zoom: config.zoomSpeed } });

                            case 2:
                                return _context14.abrupt('return', _context14.sent);

                            case 3:
                            case 'end':
                                return _context14.stop();
                        }
                    }
                }, _callee14, this);
            }));

            function zoomAdd() {
                return _ref14.apply(this, arguments);
            }

            return zoomAdd;
        }()
    }, {
        key: 'zoomDec',
        value: function () {
            var _ref15 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee15() {
                return _regenerator2.default.wrap(function _callee15$(_context15) {
                    while (1) {
                        switch (_context15.prev = _context15.next) {
                            case 0:
                                _context15.next = 2;
                                return this._PTZ({ zoom: -1, speed: { zoom: config.zoomSpeed } });

                            case 2:
                                return _context15.abrupt('return', _context15.sent);

                            case 3:
                            case 'end':
                                return _context15.stop();
                        }
                    }
                }, _callee15, this);
            }));

            function zoomDec() {
                return _ref15.apply(this, arguments);
            }

            return zoomDec;
        }()
    }, {
        key: 'focusAdd',
        value: function focusAdd() {}
    }, {
        key: 'focusDec',
        value: function focusDec() {}
    }, {
        key: 'apertureAdd',
        value: function apertureAdd() {}
    }, {
        key: 'apertureDec',
        value: function apertureDec() {}
    }, {
        key: 'move',
        value: function () {
            var _ref16 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee16(direction) {
                var x, y;
                return _regenerator2.default.wrap(function _callee16$(_context16) {
                    while (1) {
                        switch (_context16.prev = _context16.next) {
                            case 0:
                                x = 0, y = 0;

                                if ((direction & PTZ.Directions.top) > 0) {
                                    y = 1;
                                }
                                if ((direction & PTZ.Directions.bottom) > 0) {
                                    y = -1;
                                }
                                if ((direction & PTZ.Directions.left) > 0) {
                                    x = -1;
                                }
                                if ((direction & PTZ.Directions.right) > 0) {
                                    x = 1;
                                }

                                _context16.next = 7;
                                return this._PTZ({ zoom: 0, x: x, y: y, speed: { x: this.h_speed, y: this.v_speed } });

                            case 7:
                                return _context16.abrupt('return', _context16.sent);

                            case 8:
                            case 'end':
                                return _context16.stop();
                        }
                    }
                }, _callee16, this);
            }));

            function move(_x5) {
                return _ref16.apply(this, arguments);
            }

            return move;
        }()
    }, {
        key: 'getPoint',
        value: function () {
            var _ref17 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee17() {
                return _regenerator2.default.wrap(function _callee17$(_context17) {
                    while (1) {
                        switch (_context17.prev = _context17.next) {
                            case 0:
                                throw new Error('未实现函数getPoint');

                            case 1:
                            case 'end':
                                return _context17.stop();
                        }
                    }
                }, _callee17, this);
            }));

            function getPoint() {
                return _ref17.apply(this, arguments);
            }

            return getPoint;
        }()
    }, {
        key: 'moveToPoint',
        value: function () {
            var _ref18 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee18(x, y, z) {
                return _regenerator2.default.wrap(function _callee18$(_context18) {
                    while (1) {
                        switch (_context18.prev = _context18.next) {
                            case 0:
                                throw new Error('未实现函数moveToPoint');

                            case 1:
                            case 'end':
                                return _context18.stop();
                        }
                    }
                }, _callee18, this);
            }));

            function moveToPoint(_x6, _x7, _x8) {
                return _ref18.apply(this, arguments);
            }

            return moveToPoint;
        }()
        /*
            async moveToPreset(pt)
            {
                throw new Error('未实现函数moveToPreset');
        /*        await this.connect();
                return new Promise((resolve,reject)=>{
                    this._camera_handle.gotoPreset({profileToken:this._profileToken,preset:''+pt},(err)=>{
                        this.disConnect().catch();
                        if(err){
                            let error=this.error('moveToPreset','移动到预置位异常',{innerError:err});
                            //this.emit(IPC.Events.Error,error);
                            return reject(error);
                        }
                        this.log('成功执行PTZ操作');
                        resolve();
                    });
                });
            }
        
            async setPreset(caption)
            {
                throw new Error('未实现函数setPreset');
            }
            async removePreset(preset){
                throw new Error('未实现函数removePreset');
            }
        
            async getPresets(){
                throw new Error('未实现函数getPresets');
            }
        */

    }, {
        key: '_profiles',
        get: function get() {
            if (this.__profiles.length) return this.__profiles;
            assert.ok(this._camera_handle, 'connect first');
            var ps = [];
            _.each(this._camera_handle.profiles, function (prof) {
                if (_.toUpper(prof.videoEncoderConfiguration.encoding) !== 'H264') {
                    return;
                }
                var o = {
                    token: prof.$.token,
                    fixed: prof.$.fixed,
                    encodingtype: { 'JPEG': 3, 'MPEG4': 1, 'H264': 2 }[prof.videoEncoderConfiguration.encoding],
                    encoding: prof.videoEncoderConfiguration.encoding, //enum { 'JPEG', 'MPEG4', 'H264' }
                    quality: prof.videoEncoderConfiguration.quality,
                    width: prof.videoEncoderConfiguration.resolution.width,
                    height: prof.videoEncoderConfiguration.resolution.height,
                    fps: prof.videoEncoderConfiguration.rateControl.frameRateLimit,
                    bitrate: prof.videoEncoderConfiguration.rateControl.bitrateLimit
                };
                ps.push(o);
            });
            ps = _.sortBy(ps, ['bitrate', 'encodingtype']);
            return this.__profiles = ps;
        }
    }, {
        key: '_profile',
        get: function get() {
            assert.ok(this._camera_handle, 'connect first');
            if (this.__profile) return this.__profile;
            var profs = this._profiles;
            if (profs.length === 0) {
                return null;
            }
            var prof = void 0;
            if (this.quality > profs.length) {
                prof = _.last(profs);
            } else {
                prof = profs[this.quality];
            }
            return this.__profile = prof;
        }
    }, {
        key: 'bitrate',
        get: function get() {
            //最大码率,打个9折
            //console.log(JSON.stringify(this._profile));
            //还需要加上音频的数据
            return Math.floor(this._profile.bitrate * 8 / 10 * 1024 / 9);
        }
    }], [{
        key: 'discovery',
        value: function () {
            var _ref19 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee19(cb) {
                var timeout = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 10000;
                return _regenerator2.default.wrap(function _callee19$(_context19) {
                    while (1) {
                        switch (_context19.prev = _context19.next) {
                            case 0:
                                onvif.Discovery.removeAllListeners();
                                onvif.Discovery.on('device', function (data /*, rinfo, xml*/) {
                                    var uri = data.probeMatches.probeMatch.XAddrs;
                                    //海康威视给两个地址，需要用空格截取下
                                    //http://192.168.1.64/onvif/device_service%20http://[fe80::1a68:cbff:febc:6c54]/onvif/device_service
                                    uri = decodeURI(uri).split(' ')[0];
                                    var camUri = url.parse(uri);
                                    cb({ ip: camUri.hostname, port: camUri.port || 80, path: camUri.path });
                                });
                                return _context19.abrupt('return', new Promise(function (resolve, reject) {
                                    onvif.Discovery.on('error', function (err) {
                                        onvif.Discovery.removeAllListeners();
                                        reject(err);
                                    });
                                    onvif.Discovery.probe({ timeout: timeout || 10000, resolve: false }, function () {
                                        cb(null);
                                        resolve();
                                    });
                                }));

                            case 3:
                            case 'end':
                                return _context19.stop();
                        }
                    }
                }, _callee19, this);
            }));

            function discovery(_x10) {
                return _ref19.apply(this, arguments);
            }

            return discovery;
        }()
    }]);

    return ONVIF_IPC;
}(IPC);

function respURI(uri, user, pwd) {
    return uri.replace('rtsp://', 'rtsp://' + user + ':' + pwd + '@');
}

exports = module.exports = ONVIF_IPC;
//# sourceMappingURL=onvif_ipc.js.map