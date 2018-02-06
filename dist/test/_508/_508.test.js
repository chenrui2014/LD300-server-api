'use strict';

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

/**
 * Created by Luky on 2017/7/11.
 */

var _508PTZ = require('../../ipcs/_508/_508_ptz');
var _V508 = require('./v_508');
var expect = require('chai').expect;

describe('基础代码测试', function () {
    var _508 = void 0,
        _v508 = void 0;
    before(function (done) {
        _508 = new _508PTZ({ port: '\\\\.\\COM1', auto_close: 0 });
        _v508 = new _V508('\\\\.\\COM2');
        _v508.run(function (err) {
            expect(!err).equal(true);
            done();
            //_v508.stop(done);
        });
    });

    describe('链接测试', function () {
        it('连接关闭设备', _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
            return _regenerator2.default.wrap(function _callee$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            _context.next = 2;
                            return _508.connect();

                        case 2:
                            expect(_508.isConnected).equal(true);
                            _context.next = 5;
                            return _508.disConnect();

                        case 5:
                            expect(_508.isConnected).equal(false);

                        case 6:
                        case 'end':
                            return _context.stop();
                    }
                }
            }, _callee, undefined);
        })));
    });

    describe('镜头功能性测试', function () {
        it('变焦测试+', _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee2() {
            var cmd;
            return _regenerator2.default.wrap(function _callee2$(_context2) {
                while (1) {
                    switch (_context2.prev = _context2.next) {
                        case 0:
                            console.log('测试命令zoomAdd');
                            _context2.next = 3;
                            return _508.zoomAdd();

                        case 3:
                            cmd = _context2.sent;

                            expect(cmd.equals(Buffer.from([0xa2, 0x00, 0x09, 0x56, 0x41, 0x00, 0x00, 0xBC, 0xAF]))).equal(true);
                            //a20009564100bcaf

                        case 5:
                        case 'end':
                            return _context2.stop();
                    }
                }
            }, _callee2, undefined);
        })));
        it('变焦测试-', _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee3() {
            var cmd;
            return _regenerator2.default.wrap(function _callee3$(_context3) {
                while (1) {
                    switch (_context3.prev = _context3.next) {
                        case 0:
                            console.log('测试命令zoomDec');
                            _context3.next = 3;
                            return _508.zoomDec();

                        case 3:
                            cmd = _context3.sent;

                            expect(cmd.equals(Buffer.from([0xa2, 0x00, 0x09, 0x56, 0x4d, 0x00, 0x00, 0xB0, 0xAF]))).equal(true);

                        case 5:
                        case 'end':
                            return _context3.stop();
                    }
                }
            }, _callee3, undefined);
        })));
        it('变焦测试-=', _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee4() {
            var cmd;
            return _regenerator2.default.wrap(function _callee4$(_context4) {
                while (1) {
                    switch (_context4.prev = _context4.next) {
                        case 0:
                            console.log('测试命令zoomDec-ptzStop');
                            _context4.next = 3;
                            return _508.zoomDec(true);

                        case 3:
                            cmd = _context4.sent;

                            expect(cmd.equals(Buffer.from([0xa2, 0x00, 0x09, 0x56, 0x4d, 0x00, 0x00, 0xB0, 0xAF]))).equal(true);

                        case 5:
                        case 'end':
                            return _context4.stop();
                    }
                }
            }, _callee4, undefined);
        })));
        it('变焦测试=，返回z值', _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee5() {
            var cmd;
            return _regenerator2.default.wrap(function _callee5$(_context5) {
                while (1) {
                    switch (_context5.prev = _context5.next) {
                        case 0:
                            console.log('测试命令_zoomStop');
                            _context5.next = 3;
                            return _508._zoomStop();

                        case 3:
                            cmd = _context5.sent;

                            expect(cmd.equals(Buffer.from([0xa2, 0x00, 0x09, 0x56, 0x53, 0x00, 0x00, 0xAE, 0xAF]))).equal(true);

                        case 5:
                        case 'end':
                            return _context5.stop();
                    }
                }
            }, _callee5, undefined);
        })));
        it('聚焦测试+', _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee6() {
            var cmd;
            return _regenerator2.default.wrap(function _callee6$(_context6) {
                while (1) {
                    switch (_context6.prev = _context6.next) {
                        case 0:
                            console.log('测试命令focusAdd');
                            _context6.next = 3;
                            return _508.focusAdd();

                        case 3:
                            cmd = _context6.sent;

                            expect(cmd.slice(0, 5).equals(Buffer.from([0xa2, 0x00, 0x09, 0x46, 0x41]))).equal(true);

                        case 5:
                        case 'end':
                            return _context6.stop();
                    }
                }
            }, _callee6, undefined);
        })));
        it('聚焦测试-', _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee7() {
            var cmd;
            return _regenerator2.default.wrap(function _callee7$(_context7) {
                while (1) {
                    switch (_context7.prev = _context7.next) {
                        case 0:
                            console.log('测试命令focusDec');
                            _context7.next = 3;
                            return _508.focusDec();

                        case 3:
                            cmd = _context7.sent;

                            expect(cmd.slice(0, 5).equals(Buffer.from([0xa2, 0x00, 0x09, 0x46, 0x4D]))).equal(true);

                        case 5:
                        case 'end':
                            return _context7.stop();
                    }
                }
            }, _callee7, undefined);
        })));
        it('聚焦测试-=', _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee8() {
            var cmd;
            return _regenerator2.default.wrap(function _callee8$(_context8) {
                while (1) {
                    switch (_context8.prev = _context8.next) {
                        case 0:
                            console.log('测试命令focusDec-ptzStop');
                            _context8.next = 3;
                            return _508.focusDec(true);

                        case 3:
                            cmd = _context8.sent;

                            expect(cmd.slice(0, 5).equals(Buffer.from([0xa2, 0x00, 0x09, 0x46, 0x4D]))).equal(true);

                        case 5:
                        case 'end':
                            return _context8.stop();
                    }
                }
            }, _callee8, undefined);
        })));
        it('聚焦测试=', _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee9() {
            var cmd;
            return _regenerator2.default.wrap(function _callee9$(_context9) {
                while (1) {
                    switch (_context9.prev = _context9.next) {
                        case 0:
                            console.log('测试命令focusStop');
                            _context9.next = 3;
                            return _508._focusStop(true);

                        case 3:
                            cmd = _context9.sent;

                            expect(cmd.equals(Buffer.from([0xa2, 0x00, 0x09, 0x46, 0x53, 0x00, 0x00, 0xBE, 0xAF]))).equal(true);

                        case 5:
                        case 'end':
                            return _context9.stop();
                    }
                }
            }, _callee9, undefined);
        })));
        it('光圈+', _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee10() {
            var cmd;
            return _regenerator2.default.wrap(function _callee10$(_context10) {
                while (1) {
                    switch (_context10.prev = _context10.next) {
                        case 0:
                            console.log('测试命令apertureAdd');
                            _context10.next = 3;
                            return _508.apertureAdd();

                        case 3:
                            cmd = _context10.sent;

                            expect(cmd.equals(Buffer.from([0xa2, 0x00, 0x09, 0x49, 0x41, 0x00, 0x00, 0xA3, 0xAF]))).equal(true);

                        case 5:
                        case 'end':
                            return _context10.stop();
                    }
                }
            }, _callee10, undefined);
        })));
        it('光圈-', _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee11() {
            var cmd;
            return _regenerator2.default.wrap(function _callee11$(_context11) {
                while (1) {
                    switch (_context11.prev = _context11.next) {
                        case 0:
                            console.log('测试命令apertureDec');
                            _context11.next = 3;
                            return _508.apertureDec();

                        case 3:
                            cmd = _context11.sent;

                            expect(cmd.equals(Buffer.from([0xa2, 0x00, 0x09, 0x49, 0x4d, 0x00, 0x00, 0xAF, 0xAF]))).equal(true);

                        case 5:
                        case 'end':
                            return _context11.stop();
                    }
                }
            }, _callee11, undefined);
        })));
        it('光圈-=', _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee12() {
            var cmd;
            return _regenerator2.default.wrap(function _callee12$(_context12) {
                while (1) {
                    switch (_context12.prev = _context12.next) {
                        case 0:
                            console.log('测试命令apertureDec-ptzStop');
                            _context12.next = 3;
                            return _508.apertureDec(true);

                        case 3:
                            cmd = _context12.sent;

                            expect(cmd.equals(Buffer.from([0xa2, 0x00, 0x09, 0x49, 0x4d, 0x00, 0x00, 0xAF, 0xAF]))).equal(true);

                        case 5:
                        case 'end':
                            return _context12.stop();
                    }
                }
            }, _callee12, undefined);
        })));
        it('光圈=', _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee13() {
            var cmd;
            return _regenerator2.default.wrap(function _callee13$(_context13) {
                while (1) {
                    switch (_context13.prev = _context13.next) {
                        case 0:
                            console.log('测试命令apertureStop');
                            _context13.next = 3;
                            return _508._apertureStop(true);

                        case 3:
                            cmd = _context13.sent;

                            expect(cmd.equals(Buffer.from([0xa2, 0x00, 0x09, 0x49, 0x53, 0x00, 0x00, 0xB1, 0xAF]))).equal(true);

                        case 5:
                        case 'end':
                            return _context13.stop();
                    }
                }
            }, _callee13, undefined);
        })));
        it('自动聚焦测试+', _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee14() {
            return _regenerator2.default.wrap(function _callee14$(_context14) {
                while (1) {
                    switch (_context14.prev = _context14.next) {
                        case 0:
                            console.log('测试命令_focusAuto');
                            _context14.next = 3;
                            return _508._focusAuto();

                        case 3:
                        case 'end':
                            return _context14.stop();
                    }
                }
            }, _callee14, undefined);
        })));
    });

    describe('转台功能', function () {

        it('查询位置', _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee15() {
            var xyz;
            return _regenerator2.default.wrap(function _callee15$(_context15) {
                while (1) {
                    switch (_context15.prev = _context15.next) {
                        case 0:
                            console.log('测试命令getPoint');
                            _context15.next = 3;
                            return _508.getPoint();

                        case 3:
                            xyz = _context15.sent;

                            console.log('x:' + xyz.x + ',y:' + xyz.y + ',z:' + xyz.z);

                        case 5:
                        case 'end':
                            return _context15.stop();
                    }
                }
            }, _callee15, undefined);
        })));
        //'top':1,'down':2,'left':4,'right':8,
        it('转台移动-左', _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee16() {
            return _regenerator2.default.wrap(function _callee16$(_context16) {
                while (1) {
                    switch (_context16.prev = _context16.next) {
                        case 0:
                            console.log('测试命令move');
                            _context16.next = 3;
                            return _508.move(4);

                        case 3:
                        case 'end':
                            return _context16.stop();
                    }
                }
            }, _callee16, undefined);
        })));
        it('转台移动-右', _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee17() {
            return _regenerator2.default.wrap(function _callee17$(_context17) {
                while (1) {
                    switch (_context17.prev = _context17.next) {
                        case 0:
                            console.log('测试命令move');
                            _context17.next = 3;
                            return _508.move(8);

                        case 3:
                        case 'end':
                            return _context17.stop();
                    }
                }
            }, _callee17, undefined);
        })));
        it('转台移动-上', _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee18() {
            return _regenerator2.default.wrap(function _callee18$(_context18) {
                while (1) {
                    switch (_context18.prev = _context18.next) {
                        case 0:
                            console.log('测试命令move');
                            _context18.next = 3;
                            return _508.move(1);

                        case 3:
                        case 'end':
                            return _context18.stop();
                    }
                }
            }, _callee18, undefined);
        })));
        it('转台移动-下', _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee19() {
            return _regenerator2.default.wrap(function _callee19$(_context19) {
                while (1) {
                    switch (_context19.prev = _context19.next) {
                        case 0:
                            console.log('测试命令move');
                            _context19.next = 3;
                            return _508.move(2);

                        case 3:
                        case 'end':
                            return _context19.stop();
                    }
                }
            }, _callee19, undefined);
        })));
        it('转台移动-右-停止移动', _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee20() {
            return _regenerator2.default.wrap(function _callee20$(_context20) {
                while (1) {
                    switch (_context20.prev = _context20.next) {
                        case 0:
                            console.log('测试命令move-ptzStop');
                            _context20.next = 3;
                            return _508.move(4, true);

                        case 3:
                        case 'end':
                            return _context20.stop();
                    }
                }
            }, _callee20, undefined);
        })));
        it('变焦到指定尺寸测试', _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee21() {
            return _regenerator2.default.wrap(function _callee21$(_context21) {
                while (1) {
                    switch (_context21.prev = _context21.next) {
                        case 0:
                            console.log('测试命令_zoomTo');
                            _context21.next = 3;
                            return _508._zoomTo(100);

                        case 3:
                        case 'end':
                            return _context21.stop();
                    }
                }
            }, _callee21, undefined);
        })));
        it('转台转动到指定位置', _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee22() {
            return _regenerator2.default.wrap(function _callee22$(_context22) {
                while (1) {
                    switch (_context22.prev = _context22.next) {
                        case 0:
                            console.log('测试命令moveToPoint');
                            _context22.next = 3;
                            return _508.moveToPoint(1, 1, 1);

                        case 3:
                        case 'end':
                            return _context22.stop();
                    }
                }
            }, _callee22, undefined);
        })));
    });

    after(function (done) {
        _v508.stop(done);
    });
});
//# sourceMappingURL=_508.test.js.map