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
 * Created by Luky on 2017/7/1.
 */
var IPC = require('../base/ipc');
var Onvif = require('../onvif/onvif_ipc');
var _ = require('lodash');
var dhok = require('./dh_init');
var dhlib = require('./dhnetsdk');
var globalConfig = global.server_config || require('../../config/config');
var config = globalConfig.getConfig('dh_config.json');
var ref = require('ref');
//const isLinux=process.platform.indexOf('win')===-1;
var assert = require('assert');
var ArrayType = require('ref-array');
//const Mix=require('../stream/stream_ffmpeg_pipe');
//const timeSpan=require('../../TimeSpan');
//const DHH264UnPack=require('./_dh_h264_unpack');
//const wchar_t = require('ref-wchar');
var fs = require('fs');
var acc = require('../../acc/acc_adts_parser');
var DHAV = Buffer.from([0x44, 0x48, 0x41, 0x56]);
var dhav = Buffer.from([0x64, 0x68, 0x61, 0x76]);
var h264Prefix = Buffer.from([0, 0, 0, 1]);
var aacPrefix = Buffer.from([0xff]);

var _require = require('../../log/log'),
    Parser = _require.Parser;

var EventEmitter = require('events').EventEmitter;

var DHIPC = function (_IPC) {
    _inherits(DHIPC, _IPC);

    function DHIPC(options) {
        _classCallCheck(this, DHIPC);

        var _this = _possibleConstructorReturn(this, (DHIPC.__proto__ || Object.getPrototypeOf(DHIPC)).call(this, options));

        _.each({
            "zoom_speed": config['zoomSpeed'], "focus_speed": config['focusSpeed'],
            "aperture_speed": config['apertureSpeed'], "h_speed": config['hSpeed'],
            "v_speed": config['vSpeed']
        }, function (val, key) {
            _this[key] = key in options ? options[key] : val;
        });
        _.each({ "ptz": false, "audio": false, "alarm": false }, function (val, key) {
            _this.options[key] = !!_.get(options, 'functions.' + key, val);
        });
        _.each({ 'ip': '', 'port': 0, 'user': '', 'pwd': '',
            'b3g_protocol': false
        }, function (val, key) {
            _this.options[key] = key in options ? options[key] : val;
        });
        _this._loginID = 0;
        _this._playID = 0;
        _this._talkID = 0;
        _this._channel = 0;
        _this._stopCmd = null;
        _this.onvif = null;
        if (options.onvif) _this.onvif = new Onvif(_.extend({}, options, options.onvif));
        _this._disConnectFn = _this._onDisConnected.bind(_this);
        _this._reConnectFn = _this._onReConnected.bind(_this);
        _this._vedioBuffer = null;
        Parser(_this, 'dh_ipc.js', { id: _this.options.id, ip: _this.options.ip, port: _this.options.port });
        //this._keepAlive=0;
        return _this;
    }

    _createClass(DHIPC, [{
        key: 'getRtspUriWithAuth',
        value: function getRtspUriWithAuth() {
            if (this.onvif) return this.onvif.getRtspUriWithAuth();
            return Promise.reject();
        }
    }, {
        key: '_error',
        value: function _error(desc) {
            var code = desc ? DHIPC.lastError : 0;
            var err = { code: code };
            return this.error(desc || '具体错误请参照DhNetSdk.Client_GetLastError', err);
        }
    }, {
        key: '_getAbility',
        value: function () {
            var _ref = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
                var st, DH_DEV_ENABLE_INFO, nLenRet, ok, ab;
                return _regenerator2.default.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                assert.ok(this._loginID);
                                st = dhlib.structs.DH_DEV_ENABLE_INFO;
                                DH_DEV_ENABLE_INFO = new st();
                                nLenRet = ref.alloc('int');
                                _context.next = 6;
                                return dhlib.asyncFunctions.CLIENT_QuerySystemInfo(this._loginID, dhlib.enums.DH_SYS_ABILITY.DEVALL_INFO, DH_DEV_ENABLE_INFO.ref(), st.size, nLenRet, 1000);

                            case 6:
                                ok = _context.sent;

                                if (ok) {
                                    _context.next = 9;
                                    break;
                                }

                                return _context.abrupt('return', null);

                            case 9:
                                ab = DH_DEV_ENABLE_INFO.toObject();
                                return _context.abrupt('return', {
                                    fn_ptz: ab.IsFucEnable[dhlib.enums.DH_DEV_ENABLE.HIDE_FUNCTION] === 0,
                                    json: ab.IsFucEnable[dhlib.enums.DH_DEV_ENABLE.JSON_CONFIG] !== 0
                                });

                            case 11:
                            case 'end':
                                return _context.stop();
                        }
                    }
                }, _callee, this);
            }));

            function _getAbility() {
                return _ref.apply(this, arguments);
            }

            return _getAbility;
        }()
    }, {
        key: '_connect',
        value: function () {
            var _ref2 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee2() {
                var error, loginType, NET_DEVICEINFO_Ex, err, _error2, ab;

                return _regenerator2.default.wrap(function _callee2$(_context2) {
                    while (1) {
                        switch (_context2.prev = _context2.next) {
                            case 0:
                                if (dhok) {
                                    _context2.next = 5;
                                    break;
                                }

                                error = this.error('大华SDK初始化异常');
                                //this.emit(IPC.Events.Error,error);

                                _context2.next = 4;
                                return Promise.reject(error);

                            case 4:
                                return _context2.abrupt('return', _context2.sent);

                            case 5:
                                //let x=timeSpan.start('打开连接');
                                loginType = dhlib.enums.loginType.TCP;
                                NET_DEVICEINFO_Ex = new dhlib.structs.NET_DEVICEINFO_Ex();
                                err = ref.alloc('int');
                                _context2.next = 10;
                                return dhlib.asyncFunctions.CLIENT_LoginEx2(this.options.ip, this.options.port, this.options.user, this.options.pwd, loginType, ref.NULL, NET_DEVICEINFO_Ex.ref(), err);

                            case 10:
                                this._loginID = _context2.sent;

                                if (this._loginID) {
                                    _context2.next = 16;
                                    break;
                                }

                                _error2 = this._error('设备登入错误');
                                //this.emit(IPC.Events.Error,error);

                                _context2.next = 15;
                                return Promise.reject(_error2);

                            case 15:
                                return _context2.abrupt('return', _context2.sent);

                            case 16:
                                if (!false) {
                                    _context2.next = 22;
                                    break;
                                }

                                _context2.next = 19;
                                return this._getAbility();

                            case 19:
                                ab = _context2.sent;

                                this.options.fn_ptz = ab.fn_ptz || false;
                                this.options.b3g_protocol = ab.json || NET_DEVICEINFO_Ex.toObject().nChanNum > 32 || false;

                            case 22:
                                this.setConnected();
                                this.emit(IPC.Events.Connected, this.log('设备已连接'));

                            case 24:
                            case 'end':
                                return _context2.stop();
                        }
                    }
                }, _callee2, this);
            }));

            function _connect() {
                return _ref2.apply(this, arguments);
            }

            return _connect;
        }()
    }, {
        key: '_disConnect',
        value: function () {
            var _ref3 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee3() {
                var logID;
                return _regenerator2.default.wrap(function _callee3$(_context3) {
                    while (1) {
                        switch (_context3.prev = _context3.next) {
                            case 0:
                                if (this._loginID) {
                                    _context3.next = 4;
                                    break;
                                }

                                _context3.next = 3;
                                return Promise.resolve();

                            case 3:
                                return _context3.abrupt('return', _context3.sent);

                            case 4:
                                _context3.next = 6;
                                return Promise.all([this.stopRealPlay(), this.stopTalk()]).catch(function (e) {
                                    return e;
                                });

                            case 6:
                                logID = this._loginID;
                                this._loginID = 0;
                                _context3.next = 10;
                                return dhlib.asyncFunctions.CLIENT_Logout(logID);

                            case 10:
                                if (!_context3.sent) {
                                    _context3.next = 13;
                                    break;
                                }

                                this.emit(IPC.Events.DisConnected, this.log('设备已断开连接'));
                                return _context3.abrupt('return');

                            case 13:
                                return _context3.abrupt('return', Promise.reject(this._error('大华设备登出错误')));

                            case 14:
                            case 'end':
                                return _context3.stop();
                        }
                    }
                }, _callee3, this);
            }));

            function _disConnect() {
                return _ref3.apply(this, arguments);
            }

            return _disConnect;
        }()

        /*    _transform(buf,enc,next){
                next(null,buf);
            }*/

    }, {
        key: '_pushData',
        value: function _pushData(buf, cb) {
            //console.log(buf.toString('hex'));

            if (this._vedioBuffer) {
                buf = Buffer.concat([this._vedioBuffer, buf]);
            }

            var startWithDHAV = buf.slice(0, 4).indexOf(DHAV) === 0,
                endWithdhav = buf.slice(-8).indexOf(dhav) === 0;

            var slice = function slice(buf) {
                if (buf.slice(0, 4).indexOf(h264Prefix) === 0) {
                    var index = void 0,
                        indexPre = 0;
                    while ((index = buf.indexOf(h264Prefix, indexPre + 4)) !== -1) {
                        cb(buf.slice(indexPre, index));
                        buf = buf.slice(index);
                    }
                    cb(buf);
                } else if (buf[0] === aacPrefix[0] && (buf[1] & 0xf0) === 0xf0) {
                    cb(buf);
                }
            };
            if (startWithDHAV && endWithdhav) {
                if (buf[5] === 0xf1) {
                    return;
                }
                buf = buf.slice(40, -8);
                slice(buf);
                if (this._vedioBuffer) {
                    this._vedioBuffer = null;
                }
            } else {
                this._vedioBuffer = Buffer.from(buf);
            }
        }

        //有音频设置时同样会返回音频数据

    }, {
        key: '_realPlay',
        value: function () {
            var _ref4 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee4() {
                var _this2 = this;

                var error, cb, _error3;

                return _regenerator2.default.wrap(function _callee4$(_context4) {
                    while (1) {
                        switch (_context4.prev = _context4.next) {
                            case 0:
                                _context4.next = 2;
                                return this.connect();

                            case 2:
                                _context4.next = 4;
                                return dhlib.asyncFunctions.CLIENT_RealPlayEx(this._loginID, this._channel, ref.NULL, dhlib.enums.playType.Realplay_1);

                            case 4:
                                this._playID = _context4.sent;

                                if (this._playID) {
                                    _context4.next = 11;
                                    break;
                                }

                                error = this._error('获取设备的播放句柄错误');

                                this.emit(IPC.Events.Error, error);
                                _context4.next = 10;
                                return Promise.reject(error);

                            case 10:
                                return _context4.abrupt('return', _context4.sent);

                            case 11:
                                //let id=this.options.id;
                                cb = this._playcb = dhlib.callbacks.fRealDataCallBackEx(function (rid, dataType, data, size /*,param,dwuser*/) {
                                    var buf = dhlib.utils.readBuffer(data, size);
                                    //console.log(buf.slice(4,5).toString('hex')+'\r');
                                    //if(buf[4]===0xfd) console.log(buf.toString('utf8')+'\r');
                                    _this2._pushData(buf, function (data) {
                                        EventEmitter.prototype.emit.call(_this2, 'video', data);
                                    });
                                });
                                _context4.next = 14;
                                return dhlib.asyncFunctions.CLIENT_SetRealDataCallBackEx(this._playID, cb, 0, 1);

                            case 14:
                                if (_context4.sent) {
                                    _context4.next = 20;
                                    break;
                                }

                                delete this._playcb;
                                _error3 = this._error('直播数据回调函数绑定异常');
                                //this.emit(IPC.Events.Error,error);

                                _context4.next = 19;
                                return Promise.reject(_error3);

                            case 19:
                                return _context4.abrupt('return', _context4.sent);

                            case 20:
                                this.setPlaying();
                                this.emit(IPC.Events.RealPlay, this.log('直播端口已打开'));

                            case 22:
                            case 'end':
                                return _context4.stop();
                        }
                    }
                }, _callee4, this);
            }));

            function _realPlay() {
                return _ref4.apply(this, arguments);
            }

            return _realPlay;
        }()
    }, {
        key: '_stopRealPlay',
        value: function () {
            var _ref5 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee5() {
                var playID;
                return _regenerator2.default.wrap(function _callee5$(_context5) {
                    while (1) {
                        switch (_context5.prev = _context5.next) {
                            case 0:
                                if (this._playID) {
                                    _context5.next = 2;
                                    break;
                                }

                                return _context5.abrupt('return');

                            case 2:
                                playID = this._playID;
                                this._playID = 0;
                                _context5.next = 6;
                                return dhlib.asyncFunctions.CLIENT_StopRealPlayEx(playID);

                            case 6:
                                if (!_context5.sent) {
                                    _context5.next = 10;
                                    break;
                                }

                                this.emit(IPC.Events.StopRealPlay, this.log('直播端口关闭'));
                                _context5.next = 11;
                                break;

                            case 10:
                                this._error('直播端口关闭异常');
                                //this.emit(IPC.Events.Error,this._error('直播端口关闭异常'));

                            case 11:
                                delete this._playcb;
                                _context5.next = 14;
                                return this.disConnect();

                            case 14:
                            case 'end':
                                return _context5.stop();
                        }
                    }
                }, _callee5, this);
            }));

            function _stopRealPlay() {
                return _ref5.apply(this, arguments);
            }

            return _stopRealPlay;
        }()
    }, {
        key: '_startTalk',
        value: function () {
            var _ref6 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee6() {
                var _this3 = this;

                var cb;
                return _regenerator2.default.wrap(function _callee6$(_context6) {
                    while (1) {
                        switch (_context6.prev = _context6.next) {
                            case 0:
                                _context6.next = 2;
                                return this.connect();

                            case 2:
                                _context6.next = 4;
                                return this._talkInit();

                            case 4:
                                //如果在播放中就不通过talk拉取音频了，视频中已经取回了音频，这里再取会出问题
                                cb = this._talkcb = dhlib.callbacks.pfAudioDataCallBack(this.isPlaying ? function () {} : function (tid, data, size /*,remotedwuser*/) {
                                    var buf = dhlib.utils.readBuffer(data, size);
                                    _this3._pushData(buf, function (data) {
                                        EventEmitter.prototype.emit.call(_this3, 'audio', data);
                                    });
                                });
                                _context6.next = 7;
                                return dhlib.asyncFunctions.CLIENT_StartTalkEx(this._loginID, cb, 0);

                            case 7:
                                this._talkID = _context6.sent;

                                if (this._talkID) {
                                    _context6.next = 13;
                                    break;
                                }

                                delete this._talkcb;
                                //_this.options.fn_audio=false;
                                _context6.next = 12;
                                return Promise.reject(this._error('startTalk'));

                            case 12:
                                return _context6.abrupt('return', _context6.sent);

                            case 13:
                                /*      if(!isLinux){
                                            if(!dhlib.functions.CLIENT_RecordStartEx(_this._talkID)){
                                                return reject(this._error('recordStartEx'));
                                
                                            }
                                        }*/
                                this.emit(IPC.Events.AudioPlay, this.log('音频对讲端口打开'));
                                this.setTalking();

                            case 15:
                            case 'end':
                                return _context6.stop();
                        }
                    }
                }, _callee6, this);
            }));

            function _startTalk() {
                return _ref6.apply(this, arguments);
            }

            return _startTalk;
        }()
    }, {
        key: '_getAudioEncodeType',
        value: function () {
            var _ref7 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee7() {
                var lst, nLenRet, ok, _error4, i, lsti, error;

                return _regenerator2.default.wrap(function _callee7$(_context7) {
                    while (1) {
                        switch (_context7.prev = _context7.next) {
                            case 0:
                                if (!this._audio_config) {
                                    _context7.next = 2;
                                    break;
                                }

                                return _context7.abrupt('return', this._audio_config);

                            case 2:
                                if (this._loginID) {
                                    _context7.next = 6;
                                    break;
                                }

                                _context7.next = 5;
                                return Promise.reject('请先连接设备');

                            case 5:
                                return _context7.abrupt('return', _context7.sent);

                            case 6:
                                lst = new dhlib.structs.TALKFORMAT_LIST();
                                nLenRet = ref.alloc('int');
                                _context7.next = 10;
                                return dhlib.asyncFunctions.CLIENT_QueryDevState(this._loginID, dhlib.consts.DEVSTATE_TALK_ECTYPE, lst.ref(), dhlib.structs.TALKFORMAT_LIST.size, nLenRet, 1000);

                            case 10:
                                ok = _context7.sent;

                                if (ok) {
                                    _context7.next = 17;
                                    break;
                                }

                                _error4 = this._error('无法查找到设备支持的音频编码格式');

                                this.emit(IPC.Events.Error, _error4);
                                _context7.next = 16;
                                return Promise.reject(_error4);

                            case 16:
                                return _context7.abrupt('return', _context7.sent);

                            case 17:
                                i = 0;

                            case 18:
                                if (!(i < lst.nSupportNum)) {
                                    _context7.next = 25;
                                    break;
                                }

                                lsti = lst.type[i];

                                if (!(lsti.encodeType === dhlib.enums.TALK_CODING_TYPE.AAC.value /*||lsti.encodeType===dhlib.enums.TALK_CODING_TYPE.mp3*/)) {
                                    _context7.next = 22;
                                    break;
                                }

                                return _context7.abrupt('return', this._audio_config = {
                                    dwSampleRate: lsti.dwSampleRate,
                                    encodeType: lsti.encodeType,
                                    nAudioBit: lsti.nAudioBit
                                });

                            case 22:
                                i++;
                                _context7.next = 18;
                                break;

                            case 25:
                                error = this._error('设备不支持AAC音频编码');
                                //this.emit(IPC.Events.Error,error);

                                _context7.next = 28;
                                return Promise.reject(error);

                            case 28:
                                return _context7.abrupt('return', _context7.sent);

                            case 29:
                            case 'end':
                                return _context7.stop();
                        }
                    }
                }, _callee7, this);
            }));

            function _getAudioEncodeType() {
                return _ref7.apply(this, arguments);
            }

            return _getAudioEncodeType;
        }()
    }, {
        key: '_talkInit',
        value: function () {
            var _ref8 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee8() {
                var type, ok, error, en, _error5, sp, _error6, ttp, _error7;

                return _regenerator2.default.wrap(function _callee8$(_context8) {
                    while (1) {
                        switch (_context8.prev = _context8.next) {
                            case 0:
                                _context8.next = 2;
                                return this._getAudioEncodeType();

                            case 2:
                                type = _context8.sent;
                                _context8.next = 5;
                                return dhlib.asyncFunctions.CLIENT_SetDeviceMode(this._loginID, dhlib.enums.EM_USEDEV_MODE.TALK_SERVER_MODE, ref.NULL);

                            case 5:
                                ok = _context8.sent;

                                if (ok) {
                                    _context8.next = 11;
                                    break;
                                }

                                error = this._error('设置音频为服务端模式错误');
                                //this.emit(IPC.Events.Error,error);

                                _context8.next = 10;
                                return Promise.reject(error);

                            case 10:
                                return _context8.abrupt('return', _context8.sent);

                            case 11:
                                en = dhlib.structs.TALKDECODE_INFO({
                                    encodeType: type.encodeType,
                                    nAudioBit: type.nAudioBit,
                                    dwSampleRate: type.dwSampleRate,
                                    nPacketPeriod: 25
                                });
                                _context8.next = 14;
                                return dhlib.asyncFunctions.CLIENT_SetDeviceMode(this._loginID, dhlib.enums.EM_USEDEV_MODE.TALK_ENCODE_TYPE, en.ref());

                            case 14:
                                ok = _context8.sent;

                                if (ok) {
                                    _context8.next = 20;
                                    break;
                                }

                                _error5 = this._error('设置音频格式错误');
                                //this.emit(IPC.Events.Error,error);

                                _context8.next = 19;
                                return Promise.reject(_error5);

                            case 19:
                                return _context8.abrupt('return', _context8.sent);

                            case 20:
                                sp = new dhlib.structs.NET_SPEAK_PARAM({
                                    dwSize: dhlib.structs.NET_SPEAK_PARAM.size,
                                    nMode: 0,
                                    nSpeakerChannel: 0,
                                    bEnableWait: 0
                                });
                                _context8.next = 23;
                                return dhlib.asyncFunctions.CLIENT_SetDeviceMode(this._loginID, dhlib.enums.EM_USEDEV_MODE.TALK_SPEAK_PARAM, sp.ref());

                            case 23:
                                ok = _context8.sent;

                                if (ok) {
                                    _context8.next = 29;
                                    break;
                                }

                                _error6 = this._error('设置音频模式错误');
                                //this.emit(IPC.Events.Error,error);

                                _context8.next = 28;
                                return Promise.reject(_error6);

                            case 28:
                                return _context8.abrupt('return', _context8.sent);

                            case 29:
                                ttp = new dhlib.structs.NET_TALK_TRANSFER_PARAM({
                                    dwSize: dhlib.structs.NET_TALK_TRANSFER_PARAM.size,
                                    bTransfer: 0
                                });
                                _context8.next = 32;
                                return dhlib.asyncFunctions.CLIENT_SetDeviceMode(this._loginID, dhlib.enums.EM_USEDEV_MODE.TALK_TRANSFER_MODE, ttp.ref());

                            case 32:
                                ok = _context8.sent;

                                if (ok) {
                                    _context8.next = 38;
                                    break;
                                }

                                _error7 = this._error('设置音频传输方式错误');
                                //this.emit(IPC.Events.Error,error);

                                _context8.next = 37;
                                return Promise.reject(_error7);

                            case 37:
                                return _context8.abrupt('return', _context8.sent);

                            case 38:
                                return _context8.abrupt('return', type);

                            case 39:
                            case 'end':
                                return _context8.stop();
                        }
                    }
                }, _callee8, this);
            }));

            function _talkInit() {
                return _ref8.apply(this, arguments);
            }

            return _talkInit;
        }()
    }, {
        key: '_stopTalk',
        value: function () {
            var _ref9 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee9() {
                return _regenerator2.default.wrap(function _callee9$(_context9) {
                    while (1) {
                        switch (_context9.prev = _context9.next) {
                            case 0:
                                if (this._talkcb) delete this._talkcb;

                                if (this._talkID) {
                                    _context9.next = 3;
                                    break;
                                }

                                return _context9.abrupt('return');

                            case 3:
                                _context9.next = 5;
                                return dhlib.asyncFunctions.CLIENT_StopTalkEx(this._talkID);

                            case 5:
                                _context9.t0 = _context9.sent;

                                if (!(1 === _context9.t0)) {
                                    _context9.next = 10;
                                    break;
                                }

                                this.emit(IPC.Events.AudioStopPlay, this.log('音频对讲端口关闭'));
                                _context9.next = 11;
                                break;

                            case 10:
                                /*let error=*/this._error('停止对讲发生错误');
                                //this.emit(IPC.Events.Error,error);

                            case 11:
                                _context9.next = 13;
                                return this.disConnect();

                            case 13:
                            case 'end':
                                return _context9.stop();
                        }
                    }
                }, _callee9, this);
            }));

            function _stopTalk() {
                return _ref9.apply(this, arguments);
            }

            return _stopTalk;
        }()
    }, {
        key: 'setTalkData',
        value: function () {
            var _ref10 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee10(data, size) {
                var error;
                return _regenerator2.default.wrap(function _callee10$(_context10) {
                    while (1) {
                        switch (_context10.prev = _context10.next) {
                            case 0:
                                if (this._talkID) {
                                    _context10.next = 4;
                                    break;
                                }

                                _context10.next = 3;
                                return Promise.reject(this._error('需要先打开通道', false));

                            case 3:
                                return _context10.abrupt('return', _context10.sent);

                            case 4:
                                _context10.t0 = size;
                                _context10.next = 7;
                                return dhlib.asyncFunctions.CLIENT_TalkSendData(this._talkID, data, size);

                            case 7:
                                _context10.t1 = _context10.sent;

                                if (!(_context10.t0 === _context10.t1)) {
                                    _context10.next = 10;
                                    break;
                                }

                                return _context10.abrupt('return');

                            case 10:
                                error = this._error('向音频数据发送异常');
                                //this.emit(IPC.Events.Error,error);

                                _context10.next = 13;
                                return Promise.reject(error);

                            case 13:
                                return _context10.abrupt('return', _context10.sent);

                            case 14:
                            case 'end':
                                return _context10.stop();
                        }
                    }
                }, _callee10, this);
            }));

            function setTalkData(_x, _x2) {
                return _ref10.apply(this, arguments);
            }

            return setTalkData;
        }()
    }, {
        key: '_onDisConnected',
        value: function _onDisConnected(loginID /*,string,port,dwuser*/) {
            var _this4 = this;

            if (this._loginID !== loginID) {
                return;
            }
            clearInterval(this._onlineInterval || 0);
            this._offileInterval = setInterval(function () {
                _this4.emit(IPC.Events.Offline, _this4.warn('连接被动断开超过6秒，请查看设备或网络情况'));
            }, 6000);
        }
    }, {
        key: '_onReConnected',
        value: function _onReConnected(loginid /*,string,port,dwuser*/) {
            if (this._loginID !== loginid) {
                return;
            }
            clearInterval(this._offileInterval || 0);
            this._offileInterval = 0;
            this.emit(IPC.Events.Online);
        }
    }, {
        key: '_listen',
        value: function _listen() {
            var _this5 = this;

            this.connect().then(function () {
                dhlib.on('disconnect', _this5._disConnectFn);
                dhlib.on('reconnected', _this5._reConnectFn);
                _this5.emit(IPC.Events.Online);
            }).catch(function (e) {
                _this5.emit(IPC.Events.Offline, { innerError: e });
            });
        }
    }, {
        key: '_stopListen',
        value: function _stopListen() {
            //this._keepAlive&=0xd;
            dhlib.removeListener('disconnect', this._disConnectFn);
            dhlib.removeListener('reconnected', this._reConnectFn);
        }
    }, {
        key: '_PTZ',
        value: function () {
            var _ref11 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee11(cmdCode, p1, p2) {
                var p3 = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;

                var _this6 = this;

                var param4 = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : null;
                var stop = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : false;
                var cmd;
                return _regenerator2.default.wrap(function _callee11$(_context11) {
                    while (1) {
                        switch (_context11.prev = _context11.next) {
                            case 0:
                                if (this.supportPTZ) {
                                    _context11.next = 4;
                                    break;
                                }

                                _context11.next = 3;
                                return Promise.reject(this._error('_PTZ', '设备不支持PTZ操作'));

                            case 3:
                                return _context11.abrupt('return', _context11.sent);

                            case 4:
                                _context11.next = 6;
                                return this.connect();

                            case 6:
                                cmd = _.bind(dhlib.asyncFunctions.CLIENT_DHPTZControlEx2, null, _, _, cmdCode.valueOf(), p1, p2, p3, _, param4 ? param4.ref() : ref.NULL);
                                _context11.next = 9;
                                return cmd(this._loginID, this._channel, false);

                            case 9:
                                if (!_context11.sent) {
                                    _context11.next = 19;
                                    break;
                                }

                                this.log('\u6210\u529F\u6267\u884CPTZ\u64CD\u4F5C,\u64CD\u4F5C\uFF1A' + cmdCode.toString());

                                if (stop) {
                                    _context11.next = 15;
                                    break;
                                }

                                this._stopCmd = cmd;
                                _context11.next = 17;
                                break;

                            case 15:
                                this._stopCmd = null;
                                return _context11.abrupt('return', new Promise(function (resolve, reject) {
                                    setTimeout(function () {
                                        cmd(_this6._loginID, _this6._channel, true);
                                        _this6.disConnect().then(resolve).catch(reject);
                                    }, 10);
                                }));

                            case 17:
                                _context11.next = 20;
                                break;

                            case 19:
                                /*let error=*/this._error('ptz操作错误');
                                //this.emit(IPC.Events.Error,error);
                                //return await Promise.reject(error);

                            case 20:
                                _context11.next = 22;
                                return this.disConnect();

                            case 22:
                            case 'end':
                                return _context11.stop();
                        }
                    }
                }, _callee11, this);
            }));

            function _PTZ(_x6, _x7, _x8) {
                return _ref11.apply(this, arguments);
            }

            return _PTZ;
        }()
    }, {
        key: 'ptzStop',
        value: function () {
            var _ref12 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee12() {
                var cmd, ok, error;
                return _regenerator2.default.wrap(function _callee12$(_context12) {
                    while (1) {
                        switch (_context12.prev = _context12.next) {
                            case 0:
                                if (!(this._stopCmd === null)) {
                                    _context12.next = 2;
                                    break;
                                }

                                return _context12.abrupt('return');

                            case 2:
                                cmd = this._stopCmd;

                                this._stopCmd = null;
                                _context12.next = 6;
                                return this.connect();

                            case 6:
                                ok = cmd(this._loginID, this._channel, false) && cmd(this._loginID, this._channel, true);
                                _context12.next = 9;
                                return this.disConnect();

                            case 9:
                                if (!ok) {
                                    _context12.next = 11;
                                    break;
                                }

                                return _context12.abrupt('return', this.log('成功执行PTZ停止操作'));

                            case 11:
                                error = this._error('停止ptz操作错误');
                                //this.emit(IPC.Events.Error,error);

                                _context12.next = 14;
                                return Promise.reject(error);

                            case 14:
                                return _context12.abrupt('return', _context12.sent);

                            case 15:
                            case 'end':
                                return _context12.stop();
                        }
                    }
                }, _callee12, this);
            }));

            function ptzStop() {
                return _ref12.apply(this, arguments);
            }

            return ptzStop;
        }()
    }, {
        key: 'zoomAdd',
        value: function () {
            var _ref13 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee13(stop) {
                return _regenerator2.default.wrap(function _callee13$(_context13) {
                    while (1) {
                        switch (_context13.prev = _context13.next) {
                            case 0:
                                _context13.next = 2;
                                return this._PTZ(dhlib.enums.PTZ.PTZ_ZOOM_ADD, 0, this.zoom_speed, 0, null, stop);

                            case 2:
                                return _context13.abrupt('return', _context13.sent);

                            case 3:
                            case 'end':
                                return _context13.stop();
                        }
                    }
                }, _callee13, this);
            }));

            function zoomAdd(_x9) {
                return _ref13.apply(this, arguments);
            }

            return zoomAdd;
        }()
    }, {
        key: 'zoomDec',
        value: function () {
            var _ref14 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee14(stop) {
                return _regenerator2.default.wrap(function _callee14$(_context14) {
                    while (1) {
                        switch (_context14.prev = _context14.next) {
                            case 0:
                                _context14.next = 2;
                                return this._PTZ(dhlib.enums.PTZ.PTZ_ZOOM_DEC, 0, this.zoom_speed, 0, null, stop);

                            case 2:
                                return _context14.abrupt('return', _context14.sent);

                            case 3:
                            case 'end':
                                return _context14.stop();
                        }
                    }
                }, _callee14, this);
            }));

            function zoomDec(_x10) {
                return _ref14.apply(this, arguments);
            }

            return zoomDec;
        }()
    }, {
        key: 'focusAdd',
        value: function () {
            var _ref15 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee15(stop) {
                return _regenerator2.default.wrap(function _callee15$(_context15) {
                    while (1) {
                        switch (_context15.prev = _context15.next) {
                            case 0:
                                _context15.next = 2;
                                return this._PTZ(dhlib.enums.PTZ.PTZ_FOCUS_ADD, 0, this.focus_speed, 0, null, stop);

                            case 2:
                                return _context15.abrupt('return', _context15.sent);

                            case 3:
                            case 'end':
                                return _context15.stop();
                        }
                    }
                }, _callee15, this);
            }));

            function focusAdd(_x11) {
                return _ref15.apply(this, arguments);
            }

            return focusAdd;
        }()
    }, {
        key: 'focusDec',
        value: function () {
            var _ref16 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee16(stop) {
                return _regenerator2.default.wrap(function _callee16$(_context16) {
                    while (1) {
                        switch (_context16.prev = _context16.next) {
                            case 0:
                                _context16.next = 2;
                                return this._PTZ(dhlib.enums.PTZ.PTZ_FOCUS_DEC, 0, this.focus_speed, 0, null, stop);

                            case 2:
                                return _context16.abrupt('return', _context16.sent);

                            case 3:
                            case 'end':
                                return _context16.stop();
                        }
                    }
                }, _callee16, this);
            }));

            function focusDec(_x12) {
                return _ref16.apply(this, arguments);
            }

            return focusDec;
        }()
    }, {
        key: 'apertureAdd',
        value: function () {
            var _ref17 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee17(stop) {
                return _regenerator2.default.wrap(function _callee17$(_context17) {
                    while (1) {
                        switch (_context17.prev = _context17.next) {
                            case 0:
                                _context17.next = 2;
                                return this._PTZ(dhlib.enums.PTZ.PTZ_APERTURE_ADD, 0, this.aperture_speed, 0, null, stop);

                            case 2:
                                return _context17.abrupt('return', _context17.sent);

                            case 3:
                            case 'end':
                                return _context17.stop();
                        }
                    }
                }, _callee17, this);
            }));

            function apertureAdd(_x13) {
                return _ref17.apply(this, arguments);
            }

            return apertureAdd;
        }()
    }, {
        key: 'apertureDec',
        value: function () {
            var _ref18 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee18(stop) {
                return _regenerator2.default.wrap(function _callee18$(_context18) {
                    while (1) {
                        switch (_context18.prev = _context18.next) {
                            case 0:
                                _context18.next = 2;
                                return this._PTZ(dhlib.enums.PTZ.PTZ_APERTURE_DEC, 0, this.aperture_speed, 0, null, stop);

                            case 2:
                                return _context18.abrupt('return', _context18.sent);

                            case 3:
                            case 'end':
                                return _context18.stop();
                        }
                    }
                }, _callee18, this);
            }));

            function apertureDec(_x14) {
                return _ref18.apply(this, arguments);
            }

            return apertureDec;
        }()
    }, {
        key: 'move',
        value: function () {
            var _ref19 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee19(direction, stop) {
                var error, _d;

                return _regenerator2.default.wrap(function _callee19$(_context19) {
                    while (1) {
                        switch (_context19.prev = _context19.next) {
                            case 0:
                                if (this.supportPTZ) {
                                    _context19.next = 5;
                                    break;
                                }

                                error = this._error('设备不支持PTZ操作');
                                //this.emit(IPC.Events.Error,error);

                                _context19.next = 4;
                                return Promise.reject(error);

                            case 4:
                                return _context19.abrupt('return', _context19.sent);

                            case 5:
                                _d = IPC.Directions;
                                _context19.t0 = direction;
                                _context19.next = _context19.t0 === _d.top ? 9 : _context19.t0 === _d.left ? 11 : _context19.t0 === _d.right ? 13 : _context19.t0 === _d.down ? 15 : _context19.t0 === _d.lefttop ? 17 : _context19.t0 === _d.leftdown ? 19 : _context19.t0 === _d.righttop ? 21 : _context19.t0 === _d.rightdown ? 23 : 25;
                                break;

                            case 9:
                                direction = dhlib.enums.PTZ.PTZ_UP;return _context19.abrupt('break', 28);

                            case 11:
                                direction = dhlib.enums.PTZ.PTZ_LEFT;return _context19.abrupt('break', 28);

                            case 13:
                                direction = dhlib.enums.PTZ.PTZ_RIGHT;return _context19.abrupt('break', 28);

                            case 15:
                                direction = dhlib.enums.PTZ.PTZ_DOWN;return _context19.abrupt('break', 28);

                            case 17:
                                direction = dhlib.enums.PTZ.EXTPTZ_LEFTTOP;return _context19.abrupt('break', 28);

                            case 19:
                                direction = dhlib.enums.PTZ.EXTPTZ_RIGHTDOWN;return _context19.abrupt('break', 28);

                            case 21:
                                direction = dhlib.enums.PTZ.EXTPTZ_RIGHTTOP;return _context19.abrupt('break', 28);

                            case 23:
                                direction = dhlib.enums.PTZ.EXTPTZ_RIGHTDOWN;return _context19.abrupt('break', 28);

                            case 25:
                                assert.ok(false);
                                direction = -1;return _context19.abrupt('break', 28);

                            case 28:
                                _context19.next = 30;
                                return this._PTZ(direction, this.v_speed, this.h_speed, 0, null, stop);

                            case 30:
                                return _context19.abrupt('return', _context19.sent);

                            case 31:
                            case 'end':
                                return _context19.stop();
                        }
                    }
                }, _callee19, this);
            }));

            function move(_x15, _x16) {
                return _ref19.apply(this, arguments);
            }

            return move;
        }()
    }, {
        key: 'moveToPoint',
        value: function () {
            var _ref20 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee20(x, y, z) {
                var pos;
                return _regenerator2.default.wrap(function _callee20$(_context20) {
                    while (1) {
                        switch (_context20.prev = _context20.next) {
                            case 0:
                                pos = new dhlib.structs.PTZ_CONTROL_ABSOLUTELY({
                                    stuPosition: new dhlib.structs.PTZ_SPACE_UNIT({ nPositionX: x, nPositionY: y, nZoom: z }),
                                    stuSpeed: new dhlib.structs.PTZ_SPEED_UNIT({ fPositionX: 1.0, fPositionY: 1.0, fZoom: 1.0 })
                                });
                                _context20.next = 3;
                                return this._PTZ(dhlib.enums.PTZ.EXTPTZ_MOVE_ABSOLUTELY, 0, 0, 0, pos);

                            case 3:
                                return _context20.abrupt('return', _context20.sent);

                            case 4:
                            case 'end':
                                return _context20.stop();
                        }
                    }
                }, _callee20, this);
            }));

            function moveToPoint(_x17, _x18, _x19) {
                return _ref20.apply(this, arguments);
            }

            return moveToPoint;
        }()
    }, {
        key: 'moveToPreset',
        value: function () {
            var _ref21 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee21(pt) {
                var error;
                return _regenerator2.default.wrap(function _callee21$(_context21) {
                    while (1) {
                        switch (_context21.prev = _context21.next) {
                            case 0:
                                if (this.supportPTZ) {
                                    _context21.next = 5;
                                    break;
                                }

                                error = this._error('设备不支持PTZ操作');
                                //this.emit(IPC.Events.Error,error);

                                _context21.next = 4;
                                return Promise.reject(error);

                            case 4:
                                return _context21.abrupt('return', _context21.sent);

                            case 5:
                                if (!pt.preset) {
                                    _context21.next = 11;
                                    break;
                                }

                                _context21.next = 8;
                                return this._PTZ(dhlib.enums.PTZ.PTZ_POINT_MOVE, 0, pt.preset, 0);

                            case 8:
                                return _context21.abrupt('return', _context21.sent);

                            case 11:
                                _context21.next = 13;
                                return this.moveToPoint(pt.x, pt.y, pt.z);

                            case 13:
                                return _context21.abrupt('return', _context21.sent);

                            case 14:
                            case 'end':
                                return _context21.stop();
                        }
                    }
                }, _callee21, this);
            }));

            function moveToPreset(_x20) {
                return _ref21.apply(this, arguments);
            }

            return moveToPreset;
        }()
        /*暂时不启用
            //标记当前位置未新的预置点，标题如示，删除预置点通过返回的参数对象进行操作
            async setPreset(caption){
                throw new Error('未实现函数setPreset');
                if(!this.supportPTZ) {
                    let error =this._error('设备不支持PTZ操作');
                    //this.emit(IPC.Events.Error,error);
                    return await Promise.reject(error);
                }
                //判断名字是否已经存在，则加入对应的点,同一个位置不同的名称可以重复加入
                assert.ok(!this.existsPreset(caption));
                //let nameBuffer=dhlib.utils.utf82Mbcs(name);
                return Promise.all([this.getPoint(),this._getNextPresets()]).then((values)=>{
                   return this._PTZ(dhlib.enums.PTZ.PTZ_POINT_SET,0,values[1]).then(()=>{
                            //{x,y,z,preset,name}
                        let ret=_.extend(values[0],{preset:values[1]});
                        //IPC.prototype.setPreset.call(this,name,ret);
                        super.setPreset(caption,ret);
                        return Promise.resolve(ret);
                   });
                });
            }
        
            async removePreset(preset){
                throw new Error('未实现函数removePreset');
            }
        
            //获取下一个预置点的编号，大华通过编号移动预置点，标题在移动时在画面上显示
            async _getNextPresets(){
                let lst=await this._getPresets();
                let ret=lst.length+1;
                for(let i=0;i<lst.length;i++){
                    if(lst[i].nIndex!==i+1){
                        ret=i+1;
                    }
                }
                return ret;
            }
        
            //获取所有的预置点信息
            async _getPresets(){
                //BYTE 个预置点最多
                await this.connect();
                let PresetType=ArrayType(dhlib.structs.NET_PTZ_PRESET);
                let plst=new PresetType(255);
                let lst=new dhlib.structs.NET_PTZ_PRESET_LIST({
                    'dwSize':dhlib.structs.NET_PTZ_PRESET_LIST.size,
                    'dwMaxPresetNum':255,//1~255
                    'dwRetPresetNum':255,
                    'pstuPtzPorsetList':plst.buffer
                });
                let nLenRet=ref.alloc('int');
                let bok=dhlib.functions.CLIENT_QueryDevState(
                    this._loginID,
                    dhlib.consts.DH_DEVSTATE_PTZ_PRESET_LIST,
                    lst.ref(),
                    dhlib.structs.NET_PTZ_PRESET_LIST.size,
                    nLenRet,
                    1000
                );
                await this.disConnect();
                if(!bok){
                    let error =this._error('获取预置点列表发生错误');
                    //this.emit(IPC.Events.Error,error);
        
                    return await Promise.reject(error);
                }
                let presets=[];
                for(let i=0;i<lst.dwRetPresetNum;i++){
                    presets.push({
                        'nIndex':plst[i].nIndex,
                        'szName':dhlib.utils.mbcs2Utf8(plst[i].szName.buffer)
                    });
                }
                return _.sortBy(presets,['nIndex']);
            }
        */
        //获得当前球机坐标xyz

    }, {
        key: 'getPoint',
        value: function () {
            var _ref22 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee22() {
                var error, nLenRet, location, bok, _error8;

                return _regenerator2.default.wrap(function _callee22$(_context22) {
                    while (1) {
                        switch (_context22.prev = _context22.next) {
                            case 0:
                                if (this.supportPTZ) {
                                    _context22.next = 5;
                                    break;
                                }

                                error = this._error('设备不支持PTZ操作');
                                //this.emit(IPC.Events.Error,error);

                                _context22.next = 4;
                                return Promise.reject(error);

                            case 4:
                                return _context22.abrupt('return', _context22.sent);

                            case 5:
                                _context22.next = 7;
                                return this.connect();

                            case 7:
                                nLenRet = ref.alloc('int');
                                location = dhlib.structs.DH_PTZ_LOCATION_INFO();
                                _context22.next = 11;
                                return dhlib.asyncFunctions.CLIENT_QueryDevState(this._loginID, dhlib.consts.DH_DEVSTATE_PTZ_LOCATION, location.ref(), dhlib.structs.DH_PTZ_LOCATION_INFO.size, nLenRet, 1000);

                            case 11:
                                bok = _context22.sent;
                                _context22.next = 14;
                                return this.disConnect();

                            case 14:
                                if (bok) {
                                    _context22.next = 19;
                                    break;
                                }

                                _error8 = this._error('获取球机为止发生错误');
                                //this.emit(IPC.Events.Error,error);

                                _context22.next = 18;
                                return Promise.reject(_error8);

                            case 18:
                                return _context22.abrupt('return', _context22.sent);

                            case 19:
                                assert.ok(nLenRet.deref() === dhlib.structs.DH_PTZ_LOCATION_INFO.size);
                                return _context22.abrupt('return', {
                                    x: location.nPTZPan,
                                    y: location.nPTZTilt,
                                    z: location.nPTZZoom
                                });

                            case 21:
                            case 'end':
                                return _context22.stop();
                        }
                    }
                }, _callee22, this);
            }));

            function getPoint() {
                return _ref22.apply(this, arguments);
            }

            return getPoint;
        }()
    }, {
        key: '_alarm',
        value: function () {
            var _ref23 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee23(open) {
                var _error9, ALARMCTRL_PARAM, ap, ok, error;

                return _regenerator2.default.wrap(function _callee23$(_context23) {
                    while (1) {
                        switch (_context23.prev = _context23.next) {
                            case 0:
                                if (this.supportAlarm) {
                                    _context23.next = 5;
                                    break;
                                }

                                _error9 = this._error('设备不支持报警输出');
                                //this.emit(IPC.Events.Error,error);

                                _context23.next = 4;
                                return Promise.reject(_error9);

                            case 4:
                                return _context23.abrupt('return', _context23.sent);

                            case 5:
                                _context23.next = 7;
                                return this.connect();

                            case 7:
                                ALARMCTRL_PARAM = dhlib.structs.ALARMCTRL_PARAM;
                                ap = new ALARMCTRL_PARAM({
                                    dwSize: ALARMCTRL_PARAM.size,
                                    nAlarmNo: 0,
                                    nAction: open ? 1 : 0
                                });
                                //dhlib.enums.CTRL_TYPE.TRIGGER_ALARM_OUT

                                _context23.next = 11;
                                return dhlib.asyncFunctions.CLIENT_ControlDevice(this._loginID, 101, ap.ref(), 1000);

                            case 11:
                                ok = _context23.sent;
                                _context23.next = 14;
                                return this.disConnect();

                            case 14:
                                if (!(ok !== 0)) {
                                    _context23.next = 17;
                                    break;
                                }

                                this.emit(open ? IPC.Events.Alarm : IPC.Events.AlarmStop, this.log('\u62A5\u8B66\u8F93\u51FA\u5DF2' + (open ? '打开' : '关闭')));
                                return _context23.abrupt('return');

                            case 17:
                                this.options.fn_alarm = false;
                                error = this._error('报警指令未发出');
                                //this.emit(IPC.Events.Error,error);

                                _context23.next = 21;
                                return Promise.reject(error);

                            case 21:
                                return _context23.abrupt('return', _context23.sent);

                            case 22:
                            case 'end':
                                return _context23.stop();
                        }
                    }
                }, _callee23, this);
            }));

            function _alarm(_x21) {
                return _ref23.apply(this, arguments);
            }

            return _alarm;
        }()
    }, {
        key: 'alarm',
        value: function () {
            var _ref24 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee24() {
                return _regenerator2.default.wrap(function _callee24$(_context24) {
                    while (1) {
                        switch (_context24.prev = _context24.next) {
                            case 0:
                                _context24.next = 2;
                                return this._alarm(true);

                            case 2:
                                return _context24.abrupt('return', _context24.sent);

                            case 3:
                            case 'end':
                                return _context24.stop();
                        }
                    }
                }, _callee24, this);
            }));

            function alarm() {
                return _ref24.apply(this, arguments);
            }

            return alarm;
        }()
    }, {
        key: 'stopAlarm',
        value: function () {
            var _ref25 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee25() {
                return _regenerator2.default.wrap(function _callee25$(_context25) {
                    while (1) {
                        switch (_context25.prev = _context25.next) {
                            case 0:
                                _context25.next = 2;
                                return this._alarm(false);

                            case 2:
                                return _context25.abrupt('return', _context25.sent);

                            case 3:
                            case 'end':
                                return _context25.stop();
                        }
                    }
                }, _callee25, this);
            }));

            function stopAlarm() {
                return _ref25.apply(this, arguments);
            }

            return stopAlarm;
        }()
    }, {
        key: 'setVolume',
        value: function () {
            var _ref26 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee26(pt) {
                var _error10, error;

                return _regenerator2.default.wrap(function _callee26$(_context26) {
                    while (1) {
                        switch (_context26.prev = _context26.next) {
                            case 0:
                                if (this._playID) {
                                    _context26.next = 5;
                                    break;
                                }

                                _error10 = this._error('打开视频端口后使用');
                                //this.emit(IPC.Events.Error,error);

                                _context26.next = 4;
                                return Promise.reject(_error10);

                            case 4:
                                return _context26.abrupt('return', _context26.sent);

                            case 5:
                                _context26.next = 7;
                                return dhlib.asyncFunctions.CLIENT_SetVolume(this._playID, pt);

                            case 7:
                                if (!_context26.sent) {
                                    _context26.next = 9;
                                    break;
                                }

                                return _context26.abrupt('return');

                            case 9:
                                error = this._error('设置音量异常');
                                //this.emit(IPC.Events.Error,error);

                                _context26.next = 12;
                                return Promise.reject(error);

                            case 12:
                                return _context26.abrupt('return', _context26.sent);

                            case 13:
                            case 'end':
                                return _context26.stop();
                        }
                    }
                }, _callee26, this);
            }));

            function setVolume(_x22) {
                return _ref26.apply(this, arguments);
            }

            return setVolume;
        }()
    }, {
        key: 'supportPTZ',
        get: function get() {
            return this.options.ptz;
        }
    }, {
        key: 'supportAudio',
        get: function get() {
            return this.options.audio;
        }
    }, {
        key: 'supportAlarm',
        get: function get() {
            return this.options.alarm;
        }
    }, {
        key: 'inPlay',
        get: function get() {
            return !!this._playID;
        }
    }], [{
        key: 'discovery',
        value: function () {
            var _ref27 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee27(cb) {
                var timeout = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 10000;
                var callback, handle;
                return _regenerator2.default.wrap(function _callee27$(_context27) {
                    while (1) {
                        switch (_context27.prev = _context27.next) {
                            case 0:
                                callback = dhlib.callbacks.fSearchDevicesCB(function (data /*,userData*/) {
                                    var buf = dhlib.utils.readBuffer(data, dhlib.structs.DEVICE_NET_INFO_EX.size);
                                    var dataClone = Buffer.from(buf);
                                    var ipcData = new dhlib.structs.DEVICE_NET_INFO_EX(dataClone);
                                    var ipcInfo = dhlib.utils.structParser(dhlib.structs.DEVICE_NET_INFO_EX, ipcData);
                                    if (ipcInfo.szDetailType.indexOf("IPC") !== 0) return;
                                    if (ipcInfo.iIPVersion - 0 !== 4) return;
                                    cb({ ip: ipcInfo.szIP, port: ipcInfo.nPort });
                                });
                                _context27.next = 3;
                                return dhlib.asyncFunctions.CLIENT_StartSearchDevices(callback, ref.NULL, ref.NULL);

                            case 3:
                                handle = _context27.sent;
                                return _context27.abrupt('return', new Promise(function (resolve, reject) {
                                    if (0 === handle) return reject('\u542F\u7528\u641C\u7D22\u5F02\u5E38\uFF0C\u5185\u90E8\u9519\u8BEF\u7801\uFF1A' + DHIPC.lastError);
                                    setTimeout(function () {
                                        dhlib.asyncFunctions.CLIENT_StopSearchDevices(handle);
                                        cb(null);
                                        resolve();
                                    }, timeout || 10000);
                                }));

                            case 5:
                            case 'end':
                                return _context27.stop();
                        }
                    }
                }, _callee27, this);
            }));

            function discovery(_x24) {
                return _ref27.apply(this, arguments);
            }

            return discovery;
        }()
    }, {
        key: 'lastError',
        get: function get() {
            return dhlib.functions.CLIENT_GetLastError() & 0x7fffffff;
        }
    }]);

    return DHIPC;
}(IPC);

exports = module.exports = DHIPC;

/*
iIPVersion:4
szIP:192.168.1.92
nPort:37777
szSubmask:255.255.255.0
szGateway:192.168.1.1
szMac:4c:11:bf:a9:41:a9
szDeviceType:IPC-HDW4125C
byManuFactory:0
byDefinition:0
bDhcpEn:false
byReserved1:0
verifyData:
szSerialNo:1E00400PAX01524
szDevSoftVersion:
szDetailType:IPC-HDW4125C
szVendor:
szDevName:
szUserName:
szPassWord:
nHttpPort:80
wVideoInputCh:0
wRemoteVideoInputCh:0
wVideoOutputCh:0
wAlarmInputCh:0
wAlarmOutputCh:0
cReserved:

iIPVersion:4
szIP:192.168.1.100
nPort:37777
szSubmask:255.255.255.0
szGateway:192.168.1.1
szMac:4c:11:bf:01:cf:dc
szDeviceType:NVR
byManuFactory:0
byDefinition:0
bDhcpEn:false
byReserved1:0
verifyData:2302
szSerialNo:PZA4MM155WCEO4N
szDevSoftVersion:
szDetailType:NVR
szVendor:
szDevName:
szUserName:
szPassWord:
nHttpPort:80
wVideoInputCh:0
wRemoteVideoInputCh:0
wVideoOutputCh:0
wAlarmInputCh:0
wAlarmOutputCh:0
cReserved:
 */
//# sourceMappingURL=dh_ipc.js.map