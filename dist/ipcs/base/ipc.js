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

var PTZ = require('./ptz');
var _ = require('lodash');
var config = global.server_config || require('../../config/config');
var ptzLock = _.get(config, 'ipc.ptzLock', 15000);
var url = require('url');
var assert = require('assert');
var Counter = require('./counter');

var _q = {
    'smooth': 0,
    'clear': 1,
    'hd': 2
};

/*const _s={
    'idel':0,
    'call':1
};*/
/*
const _runWay={
    'pull':0,
    'push':1,
    'cache':2
};*/

var _events = {
    'Connected': 'connected',
    'DisConnected': 'disConnected',
    'RealPlay': 'realPlay',
    'StopRealPlay': 'stopRealPlay',
    'AudioPlay': 'audioPlay',
    'AudioStopPlay': 'audioStopPlay',
    'Alarm': 'alarm',
    'AlarmStop': 'alarmStop',
    'Online': 'online',
    'Offline': 'offline',
    'Error': 'error'
};

var IPC = function (_PTZ) {
    _inherits(IPC, _PTZ);

    function IPC(options) {
        _classCallCheck(this, IPC);

        var _this = _possibleConstructorReturn(this, (IPC.__proto__ || Object.getPrototypeOf(IPC)).call(this, /*{ objectMode: true }*/options));

        _.each({ 'id': 0, 'brand': '' }, function (val, key) {
            _this.options[key] = key in options ? options[key] : val;
        });
        _.each({
            'quality': _q.smooth
        }, function (val, key) {
            _this[key] = key in options ? options[key] : val;
        });
        /*        this._state=_s.idel;*/
        _this.on('newListener', _this._newListener.bind(_this));
        _this.on('removeListener', _this._removeListener.bind(_this));
        /*this._runWay=config.runWay;
         if(config.runWay!==_runWay.pull){
         }*/
        _this._realpaly_counter = new Counter();
        _this._talk_counter = new Counter();
        return _this;
    }

    _createClass(IPC, [{
        key: '_newListener',
        value: function _newListener(event) {
            if (this.listenerCount(event) !== 0) return;
            if (event === _events.Alive) {
                this._listen();
            }
        }
    }, {
        key: '_removeListener',
        value: function _removeListener(event) {
            if (this.listenerCount(event) !== 0) return;
            if (event === _events.Offline) {
                this._stopListen();
            }
        }
    }, {
        key: 'setPlaying',
        value: function setPlaying() {
            assert.ok(!this._realpaly_counter.inReference);
            this._realpaly_counter.addReference();
            this.log('更新视频播放请求数', { count: this._realpaly_counter.count });
        }
    }, {
        key: 'realPlay',
        value: function () {
            var _ref = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
                return _regenerator2.default.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                if (!this.isPlaying) {
                                    _context.next = 4;
                                    break;
                                }

                                this._realpaly_counter.addReference();
                                this.log('更新视频播放请求数', { count: this._realpaly_counter.count });
                                return _context.abrupt('return');

                            case 4:
                                _context.next = 6;
                                return this._realPlay();

                            case 6:
                            case 'end':
                                return _context.stop();
                        }
                    }
                }, _callee, this);
            }));

            function realPlay() {
                return _ref.apply(this, arguments);
            }

            return realPlay;
        }()
    }, {
        key: 'stopRealPlay',
        value: function () {
            var _ref2 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee2() {
                return _regenerator2.default.wrap(function _callee2$(_context2) {
                    while (1) {
                        switch (_context2.prev = _context2.next) {
                            case 0:
                                if (!this._realpaly_counter.release()) {
                                    _context2.next = 3;
                                    break;
                                }

                                _context2.next = 3;
                                return this._stopRealPlay();

                            case 3:
                                this.log('更新视频播放请求数', { count: this._realpaly_counter.count });

                            case 4:
                            case 'end':
                                return _context2.stop();
                        }
                    }
                }, _callee2, this);
            }));

            function stopRealPlay() {
                return _ref2.apply(this, arguments);
            }

            return stopRealPlay;
        }()
        //全部从辅码1流中获取，如果需要高精度请对应设置设备参数

    }, {
        key: '_realPlay',
        value: function () {
            var _ref3 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee3() {
                return _regenerator2.default.wrap(function _callee3$(_context3) {
                    while (1) {
                        switch (_context3.prev = _context3.next) {
                            case 0:
                                throw new Error('未实现函数_realPlay');

                            case 1:
                            case 'end':
                                return _context3.stop();
                        }
                    }
                }, _callee3, this);
            }));

            function _realPlay() {
                return _ref3.apply(this, arguments);
            }

            return _realPlay;
        }()
    }, {
        key: '_stopRealPlay',
        value: function () {
            var _ref4 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee4() {
                return _regenerator2.default.wrap(function _callee4$(_context4) {
                    while (1) {
                        switch (_context4.prev = _context4.next) {
                            case 0:
                                throw new Error('未实现函数_stopRealPlay');

                            case 1:
                            case 'end':
                                return _context4.stop();
                        }
                    }
                }, _callee4, this);
            }));

            function _stopRealPlay() {
                return _ref4.apply(this, arguments);
            }

            return _stopRealPlay;
        }()
        //要求promise自己catch掉，视频可用的情况下要启用视频
        //这两个端口暂时不使用,用于打开独立的音频输入输出

    }, {
        key: 'setTalking',
        value: function setTalking() {
            assert.ok(!this._talk_counter.inReference);
            this._talk_counter.addReference();
        }
    }, {
        key: 'startTalk',
        value: function () {
            var _ref5 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee5() {
                return _regenerator2.default.wrap(function _callee5$(_context5) {
                    while (1) {
                        switch (_context5.prev = _context5.next) {
                            case 0:
                                if (!this.inTalking) {
                                    _context5.next = 3;
                                    break;
                                }

                                this._talk_counter.addReference();
                                return _context5.abrupt('return');

                            case 3:
                                _context5.next = 5;
                                return this._startTalk();

                            case 5:
                            case 'end':
                                return _context5.stop();
                        }
                    }
                }, _callee5, this);
            }));

            function startTalk() {
                return _ref5.apply(this, arguments);
            }

            return startTalk;
        }()
    }, {
        key: 'stopTalk',
        value: function () {
            var _ref6 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee6() {
                return _regenerator2.default.wrap(function _callee6$(_context6) {
                    while (1) {
                        switch (_context6.prev = _context6.next) {
                            case 0:
                                if (!this._talk_counter.release()) {
                                    _context6.next = 3;
                                    break;
                                }

                                _context6.next = 3;
                                return this._stopTalk();

                            case 3:
                            case 'end':
                                return _context6.stop();
                        }
                    }
                }, _callee6, this);
            }));

            function stopTalk() {
                return _ref6.apply(this, arguments);
            }

            return stopTalk;
        }()
    }, {
        key: '_startTalk',
        value: function () {
            var _ref7 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee7() {
                return _regenerator2.default.wrap(function _callee7$(_context7) {
                    while (1) {
                        switch (_context7.prev = _context7.next) {
                            case 0:
                                throw new Error('未实现函数_startTalk');

                            case 1:
                            case 'end':
                                return _context7.stop();
                        }
                    }
                }, _callee7, this);
            }));

            function _startTalk() {
                return _ref7.apply(this, arguments);
            }

            return _startTalk;
        }()
    }, {
        key: '_stopTalk',
        value: function () {
            var _ref8 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee8() {
                return _regenerator2.default.wrap(function _callee8$(_context8) {
                    while (1) {
                        switch (_context8.prev = _context8.next) {
                            case 0:
                                throw new Error('未实现函数_stopTalk');

                            case 1:
                            case 'end':
                                return _context8.stop();
                        }
                    }
                }, _callee8, this);
            }));

            function _stopTalk() {
                return _ref8.apply(this, arguments);
            }

            return _stopTalk;
        }()
    }, {
        key: 'setTalkData',
        value: function () {
            var _ref9 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee9(data, size) {
                return _regenerator2.default.wrap(function _callee9$(_context9) {
                    while (1) {
                        switch (_context9.prev = _context9.next) {
                            case 0:
                                throw new Error('未实现函数setTalkData');

                            case 1:
                            case 'end':
                                return _context9.stop();
                        }
                    }
                }, _callee9, this);
            }));

            function setTalkData(_x, _x2) {
                return _ref9.apply(this, arguments);
            }

            return setTalkData;
        }()
    }, {
        key: 'setVolume',
        value: function () {
            var _ref10 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee10(pt) {
                return _regenerator2.default.wrap(function _callee10$(_context10) {
                    while (1) {
                        switch (_context10.prev = _context10.next) {
                            case 0:
                                throw new Error('未实现函数setVolume');

                            case 1:
                            case 'end':
                                return _context10.stop();
                        }
                    }
                }, _callee10, this);
            }));

            function setVolume(_x3) {
                return _ref10.apply(this, arguments);
            }

            return setVolume;
        }()
    }, {
        key: '_listen',
        value: function _listen() {
            throw new Error('未实现函数listen');
        }
    }, {
        key: '_stopListen',
        value: function _stopListen() {
            throw new Error('未实现函数stopListen');
        }
    }, {
        key: 'alarm',
        value: function () {
            var _ref11 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee11() {
                return _regenerator2.default.wrap(function _callee11$(_context11) {
                    while (1) {
                        switch (_context11.prev = _context11.next) {
                            case 0:
                                throw new Error('未实现函数alarm');

                            case 1:
                            case 'end':
                                return _context11.stop();
                        }
                    }
                }, _callee11, this);
            }));

            function alarm() {
                return _ref11.apply(this, arguments);
            }

            return alarm;
        }()
    }, {
        key: 'stopAlarm',
        value: function () {
            var _ref12 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee12() {
                return _regenerator2.default.wrap(function _callee12$(_context12) {
                    while (1) {
                        switch (_context12.prev = _context12.next) {
                            case 0:
                                throw new Error('未实现函数stopAlarm');

                            case 1:
                            case 'end':
                                return _context12.stop();
                        }
                    }
                }, _callee12, this);
            }));

            function stopAlarm() {
                return _ref12.apply(this, arguments);
            }

            return stopAlarm;
        }()
    }, {
        key: 'id',
        get: function get() {
            return this.options.id;
        }
    }, {
        key: 'supportPTZ',
        get: function get() {
            return false;
        }
    }, {
        key: 'supportAudio',
        get: function get() {
            return false;
        }
    }, {
        key: 'supportAlarm',
        get: function get() {
            return false;
        }
    }, {
        key: 'isPlaying',
        get: function get() {
            return this._realpaly_counter.inReference;
        }
    }, {
        key: 'inTalking',
        get: function get() {
            return this._talk_counter.inReference;
        }
    }], [{
        key: 'Events',
        get: function get() {
            return _events;
        }
    }, {
        key: 'Directions',
        get: function get() {
            return PTZ.Directions;
        }
    }, {
        key: 'quality',
        get: function get() {
            return _q;
        }
    }]);

    return IPC;
}(PTZ);

exports = module.exports = IPC;
//# sourceMappingURL=ipc.js.map