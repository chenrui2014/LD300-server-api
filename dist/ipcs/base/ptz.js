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
 * Created by Luky on 2017/7/5.
 */
var _ = require('lodash');
var EventEmitter = require('events').EventEmitter;
var assert = require('assert');
var Counter = require('./counter');

var _require = require('../../log/log'),
    Parser = _require.Parser;

var _d = {
    'top': 1, 'down': 2, 'left': 4, 'right': 8,
    'lefttop': 5, 'righttop': 9, 'leftdown': 6, 'rightdown': 10
};

var PTZ = function (_EventEmitter) {
    _inherits(PTZ, _EventEmitter);

    function PTZ() {
        _classCallCheck(this, PTZ);

        var _this = _possibleConstructorReturn(this, (PTZ.__proto__ || Object.getPrototypeOf(PTZ)).call(this));

        _this.options = {};
        _this._conn_counter = new Counter();
        Parser(_this, 'ptz.js', {});
        return _this;
    }

    _createClass(PTZ, [{
        key: 'emit',
        value: function emit(event) {
            var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

            return EventEmitter.prototype.emit.call(event, _.extend({
                type: event
            }, params));
        }
    }, {
        key: 'setConnected',
        value: function setConnected() {
            assert.ok(!this._conn_counter.inReference);
            this._conn_counter.addReference();
            this.log('更新设备连接数', { count: this._conn_counter.count });
        }
    }, {
        key: 'connect',
        value: function () {
            var _ref = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
                return _regenerator2.default.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                if (!this.isConnected) {
                                    _context.next = 4;
                                    break;
                                }

                                this._conn_counter.addReference();
                                this.log('更新设备连接数', { count: this._conn_counter.count });
                                return _context.abrupt('return');

                            case 4:
                                _context.next = 6;
                                return this._connect();

                            case 6:
                            case 'end':
                                return _context.stop();
                        }
                    }
                }, _callee, this);
            }));

            function connect() {
                return _ref.apply(this, arguments);
            }

            return connect;
        }()
    }, {
        key: 'disConnect',
        value: function () {
            var _ref2 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee2() {
                return _regenerator2.default.wrap(function _callee2$(_context2) {
                    while (1) {
                        switch (_context2.prev = _context2.next) {
                            case 0:
                                if (!this._conn_counter.release()) {
                                    _context2.next = 3;
                                    break;
                                }

                                _context2.next = 3;
                                return this._disConnect();

                            case 3:
                                this.log('更新设备连接数', { count: this._conn_counter.count });

                            case 4:
                            case 'end':
                                return _context2.stop();
                        }
                    }
                }, _callee2, this);
            }));

            function disConnect() {
                return _ref2.apply(this, arguments);
            }

            return disConnect;
        }()
    }, {
        key: '_connect',
        value: function () {
            var _ref3 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee3() {
                return _regenerator2.default.wrap(function _callee3$(_context3) {
                    while (1) {
                        switch (_context3.prev = _context3.next) {
                            case 0:
                                throw new Error('未实现函数_connect');

                            case 1:
                            case 'end':
                                return _context3.stop();
                        }
                    }
                }, _callee3, this);
            }));

            function _connect() {
                return _ref3.apply(this, arguments);
            }

            return _connect;
        }()
    }, {
        key: '_disConnect',
        value: function () {
            var _ref4 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee4() {
                return _regenerator2.default.wrap(function _callee4$(_context4) {
                    while (1) {
                        switch (_context4.prev = _context4.next) {
                            case 0:
                                throw new Error('未实现函数_disConnect');

                            case 1:
                            case 'end':
                                return _context4.stop();
                        }
                    }
                }, _callee4, this);
            }));

            function _disConnect() {
                return _ref4.apply(this, arguments);
            }

            return _disConnect;
        }()
    }, {
        key: 'zoomAdd',
        value: function () {
            var _ref5 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee5(stop) {
                return _regenerator2.default.wrap(function _callee5$(_context5) {
                    while (1) {
                        switch (_context5.prev = _context5.next) {
                            case 0:
                                throw new Error('未实现函数zoomAdd');

                            case 1:
                            case 'end':
                                return _context5.stop();
                        }
                    }
                }, _callee5, this);
            }));

            function zoomAdd(_x2) {
                return _ref5.apply(this, arguments);
            }

            return zoomAdd;
        }()
    }, {
        key: 'zoomDec',
        value: function () {
            var _ref6 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee6(stop) {
                return _regenerator2.default.wrap(function _callee6$(_context6) {
                    while (1) {
                        switch (_context6.prev = _context6.next) {
                            case 0:
                                throw new Error('未实现函数zoomDec');

                            case 1:
                            case 'end':
                                return _context6.stop();
                        }
                    }
                }, _callee6, this);
            }));

            function zoomDec(_x3) {
                return _ref6.apply(this, arguments);
            }

            return zoomDec;
        }()
        //focusAuto() {throw new Error('未实现函数focusAuto');}

    }, {
        key: 'focusAdd',
        value: function () {
            var _ref7 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee7(stop) {
                return _regenerator2.default.wrap(function _callee7$(_context7) {
                    while (1) {
                        switch (_context7.prev = _context7.next) {
                            case 0:
                                throw new Error('未实现函数focusAdd');

                            case 1:
                            case 'end':
                                return _context7.stop();
                        }
                    }
                }, _callee7, this);
            }));

            function focusAdd(_x4) {
                return _ref7.apply(this, arguments);
            }

            return focusAdd;
        }()
    }, {
        key: 'focusDec',
        value: function () {
            var _ref8 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee8(stop) {
                return _regenerator2.default.wrap(function _callee8$(_context8) {
                    while (1) {
                        switch (_context8.prev = _context8.next) {
                            case 0:
                                throw new Error('未实现函数focusDec');

                            case 1:
                            case 'end':
                                return _context8.stop();
                        }
                    }
                }, _callee8, this);
            }));

            function focusDec(_x5) {
                return _ref8.apply(this, arguments);
            }

            return focusDec;
        }()
        //focusAuto() {throw new Error('未实现函数focusAuto');}

    }, {
        key: 'apertureAdd',
        value: function () {
            var _ref9 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee9(stop) {
                return _regenerator2.default.wrap(function _callee9$(_context9) {
                    while (1) {
                        switch (_context9.prev = _context9.next) {
                            case 0:
                                throw new Error('未实现函数apertureAdd');

                            case 1:
                            case 'end':
                                return _context9.stop();
                        }
                    }
                }, _callee9, this);
            }));

            function apertureAdd(_x6) {
                return _ref9.apply(this, arguments);
            }

            return apertureAdd;
        }()
    }, {
        key: 'apertureDec',
        value: function () {
            var _ref10 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee10(stop) {
                return _regenerator2.default.wrap(function _callee10$(_context10) {
                    while (1) {
                        switch (_context10.prev = _context10.next) {
                            case 0:
                                throw new Error('未实现函数apertureDec');

                            case 1:
                            case 'end':
                                return _context10.stop();
                        }
                    }
                }, _callee10, this);
            }));

            function apertureDec(_x7) {
                return _ref10.apply(this, arguments);
            }

            return apertureDec;
        }()
    }, {
        key: 'move',
        value: function () {
            var _ref11 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee11(direction, stop) {
                return _regenerator2.default.wrap(function _callee11$(_context11) {
                    while (1) {
                        switch (_context11.prev = _context11.next) {
                            case 0:
                                throw new Error('未实现函数move');

                            case 1:
                            case 'end':
                                return _context11.stop();
                        }
                    }
                }, _callee11, this);
            }));

            function move(_x8, _x9) {
                return _ref11.apply(this, arguments);
            }

            return move;
        }()
    }, {
        key: 'moveToPoint',
        value: function () {
            var _ref12 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee12(x, y, z) {
                return _regenerator2.default.wrap(function _callee12$(_context12) {
                    while (1) {
                        switch (_context12.prev = _context12.next) {
                            case 0:
                                throw new Error('未实现函数moveToPoint');

                            case 1:
                            case 'end':
                                return _context12.stop();
                        }
                    }
                }, _callee12, this);
            }));

            function moveToPoint(_x10, _x11, _x12) {
                return _ref12.apply(this, arguments);
            }

            return moveToPoint;
        }()
    }, {
        key: 'ptzStop',
        value: function () {
            var _ref13 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee13() {
                return _regenerator2.default.wrap(function _callee13$(_context13) {
                    while (1) {
                        switch (_context13.prev = _context13.next) {
                            case 0:
                                throw new Error('未实现函数ptzStop');

                            case 1:
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
        //暂时不用预置点
        //async setPreset(caption){throw new Error('未实现函数setPreset');}
        //async removePreset(preset){throw new Error('未实现函数removePreset');}
        //移动到对应名称的预置点
        //async moveToPreset(name){throw new Error('未实现函数moveToPreset');}
        //移除对应名称的预置点
        //以下两个方法用于自动分配预置点和获取当前云台位置，各函数执行实现即可
        //getPresets(){throw new Error('未实现函数getPresets');}

    }, {
        key: 'getPoint',
        value: function () {
            var _ref14 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee14() {
                return _regenerator2.default.wrap(function _callee14$(_context14) {
                    while (1) {
                        switch (_context14.prev = _context14.next) {
                            case 0:
                                throw new Error('未实现函数getPoint');

                            case 1:
                            case 'end':
                                return _context14.stop();
                        }
                    }
                }, _callee14, this);
            }));

            function getPoint() {
                return _ref14.apply(this, arguments);
            }

            return getPoint;
        }()
    }, {
        key: 'supportPTZ',
        get: function get() {
            return true;
        }
    }, {
        key: 'config',
        get: function get() {
            return this.options;
        }
    }, {
        key: 'isConnected',
        get: function get() {
            return this._conn_counter.inReference;
        }
    }], [{
        key: 'Directions',
        get: function get() {
            return _d;
        }
    }]);

    return PTZ;
}(EventEmitter);

exports = module.exports = PTZ;
//# sourceMappingURL=ptz.js.map