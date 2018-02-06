"use strict";

var _regenerator = require("babel-runtime/regenerator");

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

function allocIPC(IPC, optionsIPC, ptz, optionsPTZ /*,audio,optionsAudio*/) {
    var IPCIntegration = function (_IPC) {
        _inherits(IPCIntegration, _IPC);

        function IPCIntegration() {
            _classCallCheck(this, IPCIntegration);

            var _this = _possibleConstructorReturn(this, (IPCIntegration.__proto__ || Object.getPrototypeOf(IPCIntegration)).call(this, optionsIPC));

            if (ptz) {
                _this._ptzHandle = new ptz(optionsPTZ);
            }
            /*          if(audio){
                                this._audioHandle=new audio(optionsAudio);
                        }*/
            _this._connected = false;
            return _this;
        }

        _createClass(IPCIntegration, [{
            key: "zoomAdd",
            value: function () {
                var _ref = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee(stop) {
                    return _regenerator2.default.wrap(function _callee$(_context) {
                        while (1) {
                            switch (_context.prev = _context.next) {
                                case 0:
                                    if (this.supportPTZ) {
                                        _context.next = 2;
                                        break;
                                    }

                                    return _context.abrupt("return");

                                case 2:
                                    _context.next = 4;
                                    return this._ptzHandle.zoomAdd(stop);

                                case 4:
                                    return _context.abrupt("return", _context.sent);

                                case 5:
                                case "end":
                                    return _context.stop();
                            }
                        }
                    }, _callee, this);
                }));

                function zoomAdd(_x) {
                    return _ref.apply(this, arguments);
                }

                return zoomAdd;
            }()
        }, {
            key: "zoomDec",
            value: function () {
                var _ref2 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee2(stop) {
                    return _regenerator2.default.wrap(function _callee2$(_context2) {
                        while (1) {
                            switch (_context2.prev = _context2.next) {
                                case 0:
                                    if (this.supportPTZ) {
                                        _context2.next = 2;
                                        break;
                                    }

                                    return _context2.abrupt("return");

                                case 2:
                                    _context2.next = 4;
                                    return this._ptzHandle.zoomDec();

                                case 4:
                                    return _context2.abrupt("return", _context2.sent);

                                case 5:
                                case "end":
                                    return _context2.stop();
                            }
                        }
                    }, _callee2, this);
                }));

                function zoomDec(_x2) {
                    return _ref2.apply(this, arguments);
                }

                return zoomDec;
            }()
        }, {
            key: "focusAdd",
            value: function () {
                var _ref3 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee3(stop) {
                    return _regenerator2.default.wrap(function _callee3$(_context3) {
                        while (1) {
                            switch (_context3.prev = _context3.next) {
                                case 0:
                                    if (this.supportPTZ) {
                                        _context3.next = 2;
                                        break;
                                    }

                                    return _context3.abrupt("return");

                                case 2:
                                    _context3.next = 4;
                                    return this._ptzHandle.focusAdd(stop);

                                case 4:
                                    return _context3.abrupt("return", _context3.sent);

                                case 5:
                                case "end":
                                    return _context3.stop();
                            }
                        }
                    }, _callee3, this);
                }));

                function focusAdd(_x3) {
                    return _ref3.apply(this, arguments);
                }

                return focusAdd;
            }()
        }, {
            key: "focusDec",
            value: function () {
                var _ref4 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee4(stop) {
                    return _regenerator2.default.wrap(function _callee4$(_context4) {
                        while (1) {
                            switch (_context4.prev = _context4.next) {
                                case 0:
                                    if (this.supportPTZ) {
                                        _context4.next = 2;
                                        break;
                                    }

                                    return _context4.abrupt("return");

                                case 2:
                                    return _context4.abrupt("return", this._ptzHandle.focusDec(stop));

                                case 3:
                                case "end":
                                    return _context4.stop();
                            }
                        }
                    }, _callee4, this);
                }));

                function focusDec(_x4) {
                    return _ref4.apply(this, arguments);
                }

                return focusDec;
            }()
        }, {
            key: "apertureAdd",
            value: function () {
                var _ref5 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee5(stop) {
                    return _regenerator2.default.wrap(function _callee5$(_context5) {
                        while (1) {
                            switch (_context5.prev = _context5.next) {
                                case 0:
                                    if (this.supportPTZ) {
                                        _context5.next = 2;
                                        break;
                                    }

                                    return _context5.abrupt("return");

                                case 2:
                                    _context5.next = 4;
                                    return this._ptzHandle.apertureAdd(stop);

                                case 4:
                                    return _context5.abrupt("return", _context5.sent);

                                case 5:
                                case "end":
                                    return _context5.stop();
                            }
                        }
                    }, _callee5, this);
                }));

                function apertureAdd(_x5) {
                    return _ref5.apply(this, arguments);
                }

                return apertureAdd;
            }()
        }, {
            key: "apertureDec",
            value: function () {
                var _ref6 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee6() {
                    return _regenerator2.default.wrap(function _callee6$(_context6) {
                        while (1) {
                            switch (_context6.prev = _context6.next) {
                                case 0:
                                    if (this.supportPTZ) {
                                        _context6.next = 2;
                                        break;
                                    }

                                    return _context6.abrupt("return");

                                case 2:
                                    _context6.next = 4;
                                    return this._ptzHandle.apertureDec(stop);

                                case 4:
                                    return _context6.abrupt("return", _context6.sent);

                                case 5:
                                case "end":
                                    return _context6.stop();
                            }
                        }
                    }, _callee6, this);
                }));

                function apertureDec() {
                    return _ref6.apply(this, arguments);
                }

                return apertureDec;
            }()
        }, {
            key: "move",
            value: function () {
                var _ref7 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee7(direction, stop) {
                    return _regenerator2.default.wrap(function _callee7$(_context7) {
                        while (1) {
                            switch (_context7.prev = _context7.next) {
                                case 0:
                                    if (this.supportPTZ) {
                                        _context7.next = 2;
                                        break;
                                    }

                                    return _context7.abrupt("return");

                                case 2:
                                    _context7.next = 4;
                                    return this._ptzHandle.move(direction, stop);

                                case 4:
                                    return _context7.abrupt("return", _context7.sent);

                                case 5:
                                case "end":
                                    return _context7.stop();
                            }
                        }
                    }, _callee7, this);
                }));

                function move(_x6, _x7) {
                    return _ref7.apply(this, arguments);
                }

                return move;
            }()
        }, {
            key: "ptzStop",
            value: function () {
                var _ref8 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee8() {
                    return _regenerator2.default.wrap(function _callee8$(_context8) {
                        while (1) {
                            switch (_context8.prev = _context8.next) {
                                case 0:
                                    if (this.supportPTZ) {
                                        _context8.next = 2;
                                        break;
                                    }

                                    return _context8.abrupt("return");

                                case 2:
                                    _context8.next = 4;
                                    return this._ptzHandle.ptzStop();

                                case 4:
                                    return _context8.abrupt("return", _context8.sent);

                                case 5:
                                case "end":
                                    return _context8.stop();
                            }
                        }
                    }, _callee8, this);
                }));

                function ptzStop() {
                    return _ref8.apply(this, arguments);
                }

                return ptzStop;
            }()
        }, {
            key: "moveToPoint",
            value: function () {
                var _ref9 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee9(pt) {
                    return _regenerator2.default.wrap(function _callee9$(_context9) {
                        while (1) {
                            switch (_context9.prev = _context9.next) {
                                case 0:
                                    if (this.supportPTZ) {
                                        _context9.next = 2;
                                        break;
                                    }

                                    return _context9.abrupt("return");

                                case 2:
                                    _context9.next = 4;
                                    return this._ptzHandle.moveToPoint(pt);

                                case 4:
                                    return _context9.abrupt("return", _context9.sent);

                                case 5:
                                case "end":
                                    return _context9.stop();
                            }
                        }
                    }, _callee9, this);
                }));

                function moveToPoint(_x8) {
                    return _ref9.apply(this, arguments);
                }

                return moveToPoint;
            }()
        }, {
            key: "getPoint",
            value: function () {
                var _ref10 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee10() {
                    return _regenerator2.default.wrap(function _callee10$(_context10) {
                        while (1) {
                            switch (_context10.prev = _context10.next) {
                                case 0:
                                    if (this.supportPTZ) {
                                        _context10.next = 2;
                                        break;
                                    }

                                    return _context10.abrupt("return", null);

                                case 2:
                                    _context10.next = 4;
                                    return this._ptzHandle.getPoint();

                                case 4:
                                    return _context10.abrupt("return", _context10.sent);

                                case 5:
                                case "end":
                                    return _context10.stop();
                            }
                        }
                    }, _callee10, this);
                }));

                function getPoint() {
                    return _ref10.apply(this, arguments);
                }

                return getPoint;
            }()
            /*
                    setTalkData(data,size){
                        if(!this.supportAudio)return Promise.resolve();
                        return this._audioHandle.setTalkData(data,size);
                    }
            
                    setVolume(pt){
                        if(!this.supportAudio)return Promise.resolve();
                        return this._audioHandle.setVolume(pt);
                    }
                    */

        }, {
            key: "supportPTZ",
            get: function get() {
                return null !== this._ptzHandle && this._ptzHandle.supportPTZ;
            }
        }, {
            key: "supportAudio",
            get: function get() {
                return false;
                //return null!==this._audioHandle&&this._audioHandle.supportAudio;
            }
        }]);

        return IPCIntegration;
    }(IPC);

    return new IPCIntegration();
}

exports = module.exports = allocIPC;
//# sourceMappingURL=ipc_Integration.js.map